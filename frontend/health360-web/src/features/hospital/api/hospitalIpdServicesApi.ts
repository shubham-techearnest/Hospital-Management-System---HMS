import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface IpdServiceDefinition {
  key: string;
  label: string;
  enabled: boolean;
}

export interface IpdPresetDefinition {
  code: string;
  label: string;
}

export interface HospitalIpdServices {
  hospitalId: string;
  presetCode?: string | null;
  countryCode: string;
  enabledServices: Record<string, boolean>;
  countryConfig: Record<string, unknown>;
  catalog: IpdServiceDefinition[];
  presets: IpdPresetDefinition[];
  planFeatureIpdEnabled: boolean;
  planFeatureIcuEnabled: boolean;
}

export async function getHospitalIpdServices(): Promise<HospitalIpdServices> {
  const { data } = await apiClient.get<ApiEnvelope<HospitalIpdServices>>('/hospitals/me/ipd-services');
  return data.data;
}

export async function updateHospitalIpdServices(payload: {
  presetCode?: string | null;
  countryCode: string;
  enabledServices: Record<string, boolean>;
  countryConfig?: Record<string, unknown>;
}): Promise<HospitalIpdServices> {
  const { data } = await apiClient.put<ApiEnvelope<HospitalIpdServices>>('/hospitals/me/ipd-services', payload);
  return data.data;
}

export async function applyHospitalIpdServicePreset(presetCode: string): Promise<HospitalIpdServices> {
  const { data } = await apiClient.post<ApiEnvelope<HospitalIpdServices>>(
    '/hospitals/me/ipd-services/apply-preset',
    { presetCode },
  );
  return data.data;
}
