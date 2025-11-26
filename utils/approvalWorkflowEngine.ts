// FIX: Corrected import path for types.
import { Asset, ApprovalStatus, MaintenanceRecord } from "../types";

const CRITICAL_ASSET_TYPES = ['Infraestrutura de Rede'];

/**
 * Determines the required approval workflow for a new maintenance record.
 * @param asset The asset associated with the maintenance.
 * @param maintenanceCost The cost of the maintenance.
 * @returns An object with the initial status, next approver, and initial history event.
 */
export const determineApprovalFlow = (
    asset: Asset, 
    maintenanceCost: number,
    requester: string = 'Técnico'
): Pick<MaintenanceRecord, 'status' | 'nextApprover' | 'approvalHistory'> => {
    
    const initialEvent = {
        actor: requester,
        status: ApprovalStatus.PENDING,
        comment: 'Solicitação de manutenção criada.',
        date: new Date().toISOString(),
    };

    const isCritical = CRITICAL_ASSET_TYPES.includes(asset.type);

    if (maintenanceCost <= 500 && !isCritical) {
        return {
            status: ApprovalStatus.AUTO_APPROVED,
            nextApprover: undefined,
            approvalHistory: [
                initialEvent,
                {
                    actor: 'Sistema',
                    status: ApprovalStatus.AUTO_APPROVED,
                    comment: 'Aprovado automaticamente com base na política de baixo valor.',
                    date: new Date().toISOString(),
                }
            ],
        };
    }

    if (maintenanceCost <= 5000 || isCritical) {
        return {
            status: ApprovalStatus.PENDING,
            nextApprover: 'Gerente',
            approvalHistory: [initialEvent],
        };
    }

    // Cost > 5000
    return {
        status: ApprovalStatus.PENDING,
        nextApprover: 'Gerente',
        approvalHistory: [initialEvent],
    };
};
