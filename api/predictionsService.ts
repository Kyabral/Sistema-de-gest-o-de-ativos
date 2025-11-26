import { FailurePrediction, Asset } from '../types';
import { generateFailurePredictions } from './geminiService';

export const getFailurePredictions = async (tenantId: string, assets: Asset[]): Promise<FailurePrediction[]> => {
  // In a real app, you would pass the tenantId to the API endpoint for logging or tenant-specific models.
  console.log(`Fetching failure predictions for tenant: ${tenantId}`);

  if (assets.length === 0) {
      return [];
  }
  
  try {
    // Replace mock data with a live call to the Gemini service
    const predictions = await generateFailurePredictions(assets);
    return predictions;
  } catch (error) {
    console.error("Failed to get failure predictions:", error);
    return [];
  }
};
