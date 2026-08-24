import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env';
import { logger } from '../config/logger';

class AIService {
  private client: GoogleGenAI | null = null;

  constructor() {
    if (ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        this.client = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      } catch (e) {
        logger.warn('Failed to initialize Google GenAI client', 'AIService', e);
      }
    }
  }

  async generateCarDescription(carData: {
    brand: string;
    model: string;
    year?: number;
    category?: string;
    fuelType?: string;
    specs?: { engine?: string; acceleration?: string; topSpeed?: string };
  }): Promise<string> {
    const { brand, model, year = 2024, category = 'Sedan', fuelType = 'Gas', specs } = carData;

    if (this.client) {
      try {
        const prompt = `Write a compelling, professional, 2-3 sentence marketing description for a rental vehicle:
Brand: ${brand}
Model: ${model}
Year: ${year}
Category: ${category}
Fuel/Powertrain: ${fuelType}
Specs: ${specs ? JSON.stringify(specs) : 'Standard premium trim'}
Focus on luxury, driving comfort, performance, and key technology. Do not use markdown headers or bullet points.`;

        const response = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          return response.text.trim();
        }
      } catch (err) {
        logger.warn('Gemini API call failed, falling back to dynamic generator', 'AIService', err);
      }
    }

    // Dynamic high-quality domain fallback generator
    if (category === 'Sports' || category === 'Coupe') {
      return `Experience track-bred engineering with the ${year} ${brand} ${model}. Featuring responsive handling, dynamic powertrain delivery, and a cockpit tailored for enthusiastic drivers seeking unmatched road performance.`;
    }

    if (category === 'Electric') {
      return `Embrace sustainable luxury in the ${year} ${brand} ${model}. Delivering whisper-quiet instantaneous electric acceleration, state-of-the-art intelligent infotainment, and generous real-world range for effortless journeys.`;
    }

    if (category === 'Luxury' || category === 'SUV') {
      return `Command the road in supreme comfort with the ${year} ${brand} ${model}. Blending refined craftsmanship, spacious premium seating, advanced driver assistance, and an ultra-smooth adaptive ride.`;
    }

    return `The ${year} ${brand} ${model} offers a harmonious blend of modern style, dependable efficiency, and cutting-edge safety features, making it an ideal choice for business travel and weekend escapes.`;
  }
}

export const aiService = new AIService();
