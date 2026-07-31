const workflowRepository = require('../repositories/workflowRepository');
const eventService = require('./eventService');

const ALL_WORKFLOW_STEPS = [
  'REQUEST_SUBMITTED',
  'PENDING_SETUP',
  'SEARCHING_DOMAIN',
  'DOMAIN_PURCHASED',
  'DNS_CONFIGURATION',
  'DNS_VERIFICATION',
  'SSL_GENERATION',
  'TENANT_MAPPING',
  'WEBSITE_LIVE'
];

class WorkflowService {
  async initWorkflow(tx, domainId, isFamilyOwned = true) {
    const stepsToInit = isFamilyOwned 
      ? ['REQUEST_SUBMITTED', 'PENDING_SETUP', 'DNS_CONFIGURATION', 'DNS_VERIFICATION', 'SSL_GENERATION', 'WEBSITE_LIVE']
      : ['REQUEST_SUBMITTED', 'PENDING_SETUP', 'SEARCHING_DOMAIN', 'DOMAIN_PURCHASED', 'DNS_CONFIGURATION', 'DNS_VERIFICATION', 'SSL_GENERATION', 'TENANT_MAPPING', 'WEBSITE_LIVE'];

    const stepConfigs = stepsToInit.map((step, index) => ({
      step,
      status: index === 0 ? 'COMPLETED' : (index === 1 ? 'IN_PROGRESS' : 'PENDING'),
      startedAt: index <= 1 ? new Date() : null,
      completedAt: index === 0 ? new Date() : null,
      completedBy: 'SYSTEM_WORKER',
      remarks: index === 0 ? 'Request submitted successfully' : null
    }));

    return workflowRepository.initializeWorkflow(tx, domainId, stepConfigs);
  }

  async advanceStep(tx, appSocketIo, { domainId, familyId, step, status = 'COMPLETED', remarks = null, triggeredBy = 'SYSTEM_WORKER' }) {
    const now = new Date();
    const updatedStep = await workflowRepository.updateStep(tx, domainId, step, {
      status,
      completedAt: status === 'COMPLETED' ? now : null,
      startedAt: now,
      completedBy: triggeredBy,
      remarks
    });

    await eventService.logEvent(tx, appSocketIo, {
      domainId,
      familyId,
      eventType: `WORKFLOW_STEP_${step}_${status}`,
      severity: status === 'FAILED' ? 'ERROR' : 'INFO',
      message: remarks || `Workflow step ${step} moved to ${status}`,
      triggeredBy
    });

    if (appSocketIo && familyId) {
      try {
        appSocketIo.to(`family_${familyId}`).emit('workflow.updated', {
          familyId,
          domainId,
          step: updatedStep
        });
      } catch (err) {
        console.error('WebSocket emit error:', err);
      }
    }

    return updatedStep;
  }

  async getWorkflow(domainId) {
    return workflowRepository.getWorkflowByDomainId(domainId);
  }
}

module.exports = new WorkflowService();
