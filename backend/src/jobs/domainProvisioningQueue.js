const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const provisioningService = require('../services/provisioningService');
const prisma = require('../../prismaClient');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

const QUEUE_NAME = 'domain-provisioning-queue';

// Define the Queue
const domainQueue = new Queue(QUEUE_NAME, { connection });

// Helper to log in the database
async function dbLog(domainId, step, status, message) {
  try {
    await prisma.provisioningLog.create({
      data: { domainId, step, status, message: message || '' }
    });
  } catch (err) {
    console.error(`[BullMQ] Failed to write ProvisioningLog:`, err.message);
  }
}

// Define the Worker
const domainWorker = new Worker(QUEUE_NAME, async job => {
  const { domainId, domainName } = job.data;
  console.log(`[Worker] Started job ${job.id} for domain ${domainName}`);
  
  // 1. Lock the job to prevent duplicates picking the same
  const domainData = await prisma.familyDomain.findUnique({ where: { id: domainId } });
  if (!domainData) {
    throw new Error('Domain not found in database');
  }

  if (domainData.isLocked) {
    throw new Error('Job is already locked/provisioning');
  }

  await prisma.familyDomain.update({
    where: { id: domainId },
    data: { 
      isLocked: true, 
      provisioningStatus: 'PROVISIONING',
      provisionStartedAt: new Date(),
      errorCode: null,
      errorMessage: null
    }
  });

  try {
    // 2. Delegate to provisioningService
    await dbLog(domainId, 'WORKER_STARTED', 'SUCCESS', `Started processing job ${job.id}`);
    
    // Attempt provisioning
    await provisioningService.processDomain(domainData);
    
    // If we reach here, it either succeeded or hit a managed failure that threw an error
    return { success: true, domain: domainName };
    
  } catch (error) {
    // BullMQ catches this and handles retries
    console.error(`[Worker] Job ${job.id} failed:`, error.message);
    await dbLog(domainId, 'WORKER_ERROR', 'FAILED', error.message);
    throw error;
  } finally {
    // Always unlock the job when the attempt is done
    await prisma.familyDomain.update({
      where: { id: domainId },
      data: { isLocked: false }
    });
  }
}, { connection });

domainWorker.on('completed', async (job, returnvalue) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

domainWorker.on('failed', async (job, err) => {
  console.log(`[Worker] Job ${job.id} failed with error: ${err.message}`);
  const domainId = job.data.domainId;
  
  if (job.attemptsMade >= job.opts.attempts) {
    console.log(`[Worker] Job ${job.id} permanently failed after ${job.opts.attempts} attempts.`);
    // Permanently failed
    try {
      await prisma.familyDomain.update({
        where: { id: domainId },
        data: {
          provisioningStatus: 'FAILED',
          provisionCompletedAt: new Date(),
          errorCode: 'MAX_RETRIES_REACHED',
          errorMessage: err.message
        }
      });
      await dbLog(domainId, 'WORKER_EXHAUSTED', 'FAILED', 'Maximum retries reached');
    } catch (e) {
      console.error(`[Worker] Could not update permanent failure for ${domainId}`, e);
    }
  }
});

// Helper to enqueue jobs with exponential backoff
async function enqueueDomainProvisioning(domainId, domainName) {
  try {
    // Prevent duplicate provisioning jobs for the same domain
    const activeJobs = await domainQueue.getJobs(['waiting', 'active', 'delayed']);
    const existingJob = activeJobs.find(job => job.data.domainId === domainId);
    if (existingJob) {
      console.log(`[BullMQ] Job already queued or active for ${domainName}, skipping enqueue.`);
      return existingJob;
    }

    await prisma.familyDomain.update({
      where: { id: domainId },
      data: { provisioningStatus: 'QUEUED' }
    });
    
    const job = await domainQueue.add('provision', { domainId, domainName }, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5 * 60 * 1000, // 5 min, 10 min, 20 min, 40 min, 80 min
      },
      removeOnComplete: true,
      removeOnFail: false
    });
    
    await dbLog(domainId, 'ENQUEUED', 'SUCCESS', `Job ${job.id} added to BullMQ`);
    return job;
  } catch (err) {
    console.error('Failed to enqueue domain provisioning:', err);
    throw err;
  }
}

// Stale-lock recovery (unlock jobs locked for >30 minutes)
setInterval(async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const staleDomains = await prisma.familyDomain.findMany({
      where: {
        isLocked: true,
        provisionStartedAt: { lt: thirtyMinutesAgo }
      }
    });

    for (const domain of staleDomains) {
      console.log(`[Stale-Lock Recovery] Unlocking stalled domain ${domain.domainName}`);
      await prisma.familyDomain.update({
        where: { id: domain.id },
        data: { 
          isLocked: false,
          provisioningStatus: 'FAILED',
          errorCode: 'WORKER_CRASHED',
          errorMessage: 'Job was locked for >30 minutes and was forcibly unlocked.'
        }
      });
      await dbLog(domain.id, 'STALE_LOCK', 'FAILED', 'Forcibly unlocked due to >30m stall');
    }
  } catch (err) {
    console.error('[Stale-Lock Recovery] Error:', err.message);
  }
}, 10 * 60 * 1000); // Check every 10 minutes

module.exports = {
  domainQueue,
  domainWorker,
  enqueueDomainProvisioning
};
