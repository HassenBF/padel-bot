import { FilterRequest, FilteredAvailabilityResult, ClubConfig } from '@padel-bot/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ClubsResponse {
  clubs: (ClubConfig & { key: string })[];
  total: number;
}

export class ApiService {
  async checkFilteredAvailability(filterRequest: FilterRequest): Promise<FilteredAvailabilityResult> {
    const response = await fetch(`${API_BASE_URL}/padel/check-availability/filtered`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filterRequest)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getHealthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/padel/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getClubs(): Promise<ClubsResponse> {
    const response = await fetch(`${API_BASE_URL}/padel/clubs`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();