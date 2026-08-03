import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface SubmitReviewPayload {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export interface SubmitReviewResult {
  reviewId: string;
  reviewType: string;
  rating: number;
  createdAt: string;
}

export async function submitDoctorReview(payload: SubmitReviewPayload): Promise<SubmitReviewResult> {
  const { data } = await apiClient.post<ApiEnvelope<SubmitReviewResult>>('/reviews/doctors', payload);
  return data.data!;
}

export async function submitHospitalReview(payload: SubmitReviewPayload): Promise<SubmitReviewResult> {
  const { data } = await apiClient.post<ApiEnvelope<SubmitReviewResult>>('/reviews/hospitals', payload);
  return data.data!;
}
