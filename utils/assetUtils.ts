import { Asset, AssetStatus } from '../types';

/**
 * Calculates a health score for an asset based on its age, status, and maintenance history.
 * @param asset The asset to calculate the score for.
 * @returns A score from 0 to 100.
 */
export const calculateAssetHealth = (asset: Asset): number => {
    let score = 100;

    // 1. Depreciation based on age
    const purchaseDate = new Date(asset.purchaseDate);
    const expirationDate = new Date(asset.expirationDate);
    const totalLifespan = expirationDate.getTime() - purchaseDate.getTime();
    const currentAge = new Date().getTime() - purchaseDate.getTime();
    
    if (totalLifespan > 0 && currentAge > 0) {
        const agePercentage = (currentAge / totalLifespan);
        score -= agePercentage * 30; // Age accounts for up to 30 points
    }

    // 2. Status penalty
    switch (asset.status) {
        case AssetStatus.IN_REPAIR:
            score -= 40;
            break;
        case AssetStatus.IDLE:
            score -= 10;
            break;
        case AssetStatus.DECOMMISSIONED:
            return 0; // Decommissioned assets have 0 health
    }

    // 3. Maintenance penalty
    const maintenanceCostRatio = asset.maintenanceHistory.reduce((sum, m) => sum + m.cost, 0) / asset.purchaseValue;
    if (asset.purchaseValue > 0) {
        score -= Math.min(maintenanceCostRatio * 50, 30); // Maintenance cost accounts for up to 30 points
    }
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.round(score));
};
