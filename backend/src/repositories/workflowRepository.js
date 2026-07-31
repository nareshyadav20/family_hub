const prisma = require('../../prismaClient');

class WorkflowRepository {
  async getWorkflowByDomainId(domainId) {
    return prisma.domainWorkflow.findMany({
      where: { domainId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async initializeWorkflow(tx, domainId, steps) {
    const records = [];
    for (const stepConfig of steps) {
      const record = await tx.domainWorkflow.create({
        data: {
          domainId,
          step: stepConfig.step,
          status: stepConfig.status || 'PENDING',
          startedAt: stepConfig.startedAt || null,
          completedAt: stepConfig.completedAt || null,
          completedBy: stepConfig.completedBy || null,
          remarks: stepConfig.remarks || null
        }
      });
      records.push(record);
    }
    return records;
  }

  async updateStep(tx, domainId, step, updateData) {
    return tx.domainWorkflow.upsert({
      where: {
        domainId_step: {
          domainId,
          step
        }
      },
      update: {
        ...updateData,
        updatedAt: new Date()
      },
      create: {
        domainId,
        step,
        status: updateData.status || 'IN_PROGRESS',
        startedAt: updateData.startedAt || new Date(),
        completedAt: updateData.completedAt || null,
        completedBy: updateData.completedBy || 'SYSTEM_WORKER',
        remarks: updateData.remarks || null
      }
    });
  }
}

module.exports = new WorkflowRepository();
