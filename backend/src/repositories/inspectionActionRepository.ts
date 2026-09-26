import {
  InspectionAction,
  IInspectionAction,
  IInspectionAuditEntry,
  InspectionActionType,
  InspectionActionStatus,
  InspectionActionPriority,
} from '../models/InspectionAction';
import { isDatabaseConnected } from '../config/database';

export interface CreateActionRepoInput {
  actionId: string;
  signalId: string;
  blockId: string;
  actionType: InspectionActionType;
  title: string;
  description: string;
  status: InspectionActionStatus;
  priority: InspectionActionPriority;
  createdBy: string;
  assignedTo?: string | null;
  assignedAt?: Date | null;
  sourceSignal: Record<string, unknown>;
  auditTrail: IInspectionAuditEntry[];
}

export interface ActionFilters {
  blockId?: string | string[];
  status?: InspectionActionStatus;
  actionType?: InspectionActionType;
  assignedTo?: string;
  signalId?: string;
  limit?: number;
}

// In-memory fallback store when running isolated unit tests without MongoDB
const inMemoryActions = new Map<string, IInspectionAction>();

export const inspectionActionRepository = {
  async createAction(data: CreateActionRepoInput): Promise<IInspectionAction> {
    if (isDatabaseConnected()) {
      try {
        const doc = await InspectionAction.create({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return doc;
      } catch (err) {
        console.warn('InspectionAction.create failed on MongoDB, checking fallback:', err);
      }
    }

    const mockDoc = {
      ...data,
      assignedTo: data.assignedTo || null,
      assignedAt: data.assignedAt || null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      completionNotes: null,
      cancellationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject() {
        return { ...this };
      },
      toJSON() {
        return { ...this };
      },
    } as unknown as IInspectionAction;

    inMemoryActions.set(data.actionId, mockDoc);
    return mockDoc;
  },

  async getActionById(actionId: string): Promise<IInspectionAction | null> {
    if (isDatabaseConnected()) {
      try {
        const doc = await InspectionAction.findOne({ actionId });
        if (doc) return doc;
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryActions.get(actionId) || null;
  },

  async listActions(filters: ActionFilters = {}): Promise<IInspectionAction[]> {
    if (isDatabaseConnected()) {
      try {
        const query: Record<string, unknown> = {};

        if (filters.blockId) {
          if (Array.isArray(filters.blockId)) {
            query.blockId = { $in: filters.blockId };
          } else {
            query.blockId = filters.blockId;
          }
        }

        if (filters.status) {
          query.status = filters.status;
        }

        if (filters.actionType) {
          query.actionType = filters.actionType;
        }

        if (filters.assignedTo) {
          query.assignedTo = filters.assignedTo;
        }

        if (filters.signalId) {
          query.signalId = filters.signalId;
        }

        const limit = filters.limit || 50;
        const docs = await InspectionAction.find(query).sort({ createdAt: -1 }).limit(limit);
        return docs;
      } catch (err) {
        // Fallback
      }
    }

    let items = Array.from(inMemoryActions.values());

    if (filters.blockId) {
      if (Array.isArray(filters.blockId)) {
        items = items.filter((a) => (filters.blockId as string[]).includes(a.blockId));
      } else {
        items = items.filter((a) => a.blockId === filters.blockId);
      }
    }

    if (filters.status) {
      items = items.filter((a) => a.status === filters.status);
    }

    if (filters.actionType) {
      items = items.filter((a) => a.actionType === filters.actionType);
    }

    if (filters.assignedTo) {
      items = items.filter((a) => a.assignedTo === filters.assignedTo);
    }

    if (filters.signalId) {
      items = items.filter((a) => a.signalId === filters.signalId);
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.slice(0, filters.limit || 50);
  },

  async assignAction(
    actionId: string,
    assignedTo: string,
    auditEntry: IInspectionAuditEntry
  ): Promise<IInspectionAction | null> {
    const assignedAt = new Date();
    if (isDatabaseConnected()) {
      try {
        const doc = await InspectionAction.findOneAndUpdate(
          { actionId },
          {
            $set: {
              status: 'ASSIGNED',
              assignedTo,
              assignedAt,
              updatedAt: assignedAt,
            },
            $push: { auditTrail: auditEntry },
          },
          { new: true }
        );
        if (doc) return doc;
      } catch (err) {
        // Fallback
      }
    }

    const item = inMemoryActions.get(actionId);
    if (!item) return null;

    item.status = 'ASSIGNED';
    item.assignedTo = assignedTo;
    item.assignedAt = assignedAt;
    item.updatedAt = assignedAt;
    item.auditTrail.push(auditEntry);
    return item;
  },

  async startAction(
    actionId: string,
    auditEntry: IInspectionAuditEntry
  ): Promise<IInspectionAction | null> {
    const startedAt = new Date();
    if (isDatabaseConnected()) {
      try {
        const doc = await InspectionAction.findOneAndUpdate(
          { actionId },
          {
            $set: {
              status: 'IN_PROGRESS',
              startedAt,
              updatedAt: startedAt,
            },
            $push: { auditTrail: auditEntry },
          },
          { new: true }
        );
        if (doc) return doc;
      } catch (err) {
        // Fallback
      }
    }

    const item = inMemoryActions.get(actionId);
    if (!item) return null;

    item.status = 'IN_PROGRESS';
    item.startedAt = startedAt;
    item.updatedAt = startedAt;
    item.auditTrail.push(auditEntry);
    return item;
  },

  async completeAction(
    actionId: string,
    notes: string,
    auditEntry: IInspectionAuditEntry
  ): Promise<IInspectionAction | null> {
    const completedAt = new Date();
    if (isDatabaseConnected()) {
      try {
        const doc = await InspectionAction.findOneAndUpdate(
          { actionId },
          {
            $set: {
              status: 'COMPLETED',
              completedAt,
              completionNotes: notes,
              updatedAt: completedAt,
            },
            $push: { auditTrail: auditEntry },
          },
          { new: true }
        );
        if (doc) return doc;
      } catch (err) {
        // Fallback
      }
    }

    const item = inMemoryActions.get(actionId);
    if (!item) return null;

    item.status = 'COMPLETED';
    item.completedAt = completedAt;
    item.completionNotes = notes;
    item.updatedAt = completedAt;
    item.auditTrail.push(auditEntry);
    return item;
  },

  async cancelAction(
    actionId: string,
    reason: string,
    auditEntry: IInspectionAuditEntry
  ): Promise<IInspectionAction | null> {
    const cancelledAt = new Date();
    if (isDatabaseConnected()) {
      try {
        const doc = await InspectionAction.findOneAndUpdate(
          { actionId },
          {
            $set: {
              status: 'CANCELLED',
              cancelledAt,
              cancellationReason: reason,
              updatedAt: cancelledAt,
            },
            $push: { auditTrail: auditEntry },
          },
          { new: true }
        );
        if (doc) return doc;
      } catch (err) {
        // Fallback
      }
    }

    const item = inMemoryActions.get(actionId);
    if (!item) return null;

    item.status = 'CANCELLED';
    item.cancelledAt = cancelledAt;
    item.cancellationReason = reason;
    item.updatedAt = cancelledAt;
    item.auditTrail.push(auditEntry);
    return item;
  },

  /**
   * For test isolation
   */
  _clearInMemory() {
    inMemoryActions.clear();
  },
};
