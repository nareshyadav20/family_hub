class HealthWorker {
  async processJob(job) {
    console.log(`[Health Worker] Checking health for ${job.data.domain}`);
    // Stub: HTTP GET, calculate latency, check SSL expiry
    return { success: true };
  }
}
module.exports = new HealthWorker();
