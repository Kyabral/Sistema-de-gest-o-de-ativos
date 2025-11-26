import { Asset, DocumentType } from '../types';

export interface Notification {
  id: string;
  type: 'ativo' | 'garantia';
  message: string;
  daysRemaining: number;
  assetName: string;
}

/**
 * Checks for assets and warranties expiring within a given threshold.
 * @param assets The list of all assets.
 * @param daysThreshold The number of days to look ahead for expirations.
 * @returns An array of notification objects.
 */
export const getExpiringItems = (assets: Asset[], daysThreshold: number = 30): Notification[] => {
  const notifications: Notification[] = [];
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const parseDateAsUTC = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  for (const asset of assets) {
    // Check asset expiration
    if (asset.expirationDate) {
      const expiration = parseDateAsUTC(asset.expirationDate);
      const diffTime = expiration.getTime() - todayUTC.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= daysThreshold) {
        notifications.push({
          id: `asset-${asset.id}`,
          type: 'ativo',
          assetName: asset.name,
          message: `O ativo '${asset.name}' expira em ${diffDays} dia(s).`,
          daysRemaining: diffDays,
        });
      }
    }

    // Check warranty expiration
    if (asset.documents) {
      for (const doc of asset.documents) {
        if (doc.type === DocumentType.WARRANTY && doc.expiryDate) {
          const expiration = parseDateAsUTC(doc.expiryDate);
          const diffTime = expiration.getTime() - todayUTC.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= daysThreshold) {
            notifications.push({
              id: `warranty-${asset.id}-${doc.id}`,
              type: 'garantia',
              assetName: asset.name,
              message: `A garantia de '${asset.name}' expira em ${diffDays} dia(s).`,
              daysRemaining: diffDays,
            });
          }
        }
      }
    }
  }

  // Sort by days remaining, ascending
  return notifications.sort((a, b) => a.daysRemaining - b.daysRemaining);
};