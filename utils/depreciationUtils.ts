import { Asset } from '../types';

/**
 * Calculates the linear depreciation of an asset for a given number of years.
 * @param asset The asset to calculate depreciation for.
 * @param lifespanYears The expected lifespan of the asset in years.
 * @returns An array of objects with year and remaining value.
 */
export const calculateLinearDepreciation = (asset: Asset, lifespanYears: number = 5): { year: number, value: number }[] => {
    if (!asset || asset.purchaseValue <= 0 || lifespanYears <= 0) {
        return [];
    }

    const data = [];
    const yearlyDepreciation = asset.purchaseValue / lifespanYears;
    const purchaseDate = new Date(asset.purchaseDate);
    // Use UTC year to avoid timezone issues
    const purchaseYear = purchaseDate.getUTCFullYear();

    for (let i = 0; i <= lifespanYears; i++) {
        const currentValue = asset.purchaseValue - (yearlyDepreciation * i);
        data.push({
            year: purchaseYear + i,
            value: Math.max(0, currentValue),
        });
    }
    return data;
};
