import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface ScheduleBlock {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  active: boolean;
}

export interface DoctorSchedule {
  id: string;
  hospitalId: string;
  branchId: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  horizonDays: number;
  active: boolean;
  scheduleBlocks: ScheduleBlock[];
}

export interface CreateSchedulePayload {
  hospitalId: string;
  branchId: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  horizonDays: number;
  scheduleBlocks: Omit<ScheduleBlock, 'id'>[];
}

export interface DoctorBookingLocation {
  hospitalId: string;
  hospitalName: string;
  branchId: string;
  branchName: string;
  city: string;
}

export interface SlotAvailability {
  id: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  status: string;
}

export interface DayAvailability {
  date: string;
  slots: SlotAvailability[];
}

export interface DoctorAvailability {
  doctorId: string;
  hospitalId: string;
  branchId: string;
  days: DayAvailability[];
}

export interface BookAppointmentPayload {
  doctorId: string;
  hospitalId: string;
  branchId: string;
  slotId: string;
  consultationType: string;
  reasonForVisit?: string;
}

export interface AppointmentBooking {
  appointmentId: string;
  status: string;
  doctor: { id: string; name: string; specialization?: string };
  hospital: { id: string; branchId: string; name: string; branchName: string };
  scheduledAt: string;
  consultationType: string;
  consultationFee: { amount: number; currency: string };
  reasonForVisit?: string;
}

export interface AppointmentSummary {
  appointmentId: string;
  status: string;
  scheduledAt: string;
  consultationType: string;
  consultationFee: number;
  currency: string;
  reasonForVisit?: string;
  doctor: { id: string; name: string; specialization?: string };
  patient: { id: string; name: string };
  hospital: { id: string; branchId: string; name: string; branchName: string };
  canCancel: boolean;
  canReschedule: boolean;
  canConfirm?: boolean;
  canRequestReschedule?: boolean;
  canPostpone?: boolean;
  canResume?: boolean;
}

export interface AppointmentDetail extends AppointmentSummary {
  cancelledAt?: string;
  cancellationReason?: string;
  completedAt?: string;
  rescheduledFromId?: string;
  rescheduledToId?: string;
  slotId: string;
  canMarkCompleted: boolean;
  canMarkNoShow: boolean;
  doctorNotes?: string;
  rescheduleRequestedAt?: string;
  postponedAt?: string;
  postponeReason?: string;
}

export type AppointmentFilter = 'all' | 'upcoming' | 'past' | 'cancelled';

export interface PagedAppointments {
  content: AppointmentSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export async function listMySchedules() {
  const { data } = await apiClient.get<ApiEnvelope<DoctorSchedule[]>>('/scheduling/doctors/me/schedules');
  return data.data ?? [];
}

export async function createSchedule(payload: CreateSchedulePayload) {
  const { data } = await apiClient.post<ApiEnvelope<DoctorSchedule>>('/scheduling/doctors/me/schedules', payload);
  return data.data;
}

export async function updateSchedule(scheduleId: string, payload: CreateSchedulePayload) {
  const { data } = await apiClient.put<ApiEnvelope<DoctorSchedule>>(
    `/scheduling/doctors/me/schedules/${scheduleId}`,
    payload,
  );
  return data.data;
}

export async function getDoctorBookingLocations(doctorId: string) {
  const { data } = await apiClient.get<ApiEnvelope<DoctorBookingLocation[]>>(
    `/scheduling/doctors/${doctorId}/locations`,
  );
  return data.data ?? [];
}

export async function getDoctorAvailability(
  doctorId: string,
  params: { hospitalId: string; branchId: string; fromDate?: string; toDate?: string },
) {
  const { data } = await apiClient.get<ApiEnvelope<DoctorAvailability>>(
    `/scheduling/doctors/${doctorId}/availability`,
    { params },
  );
  return data.data;
}

export async function bookAppointment(payload: BookAppointmentPayload) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentBooking>>('/scheduling/appointments', payload);
  return data.data;
}

export async function listMyAppointments(filter: AppointmentFilter = 'all', page = 0, size = 20) {
  const { data } = await apiClient.get<ApiEnvelope<PagedAppointments>>('/scheduling/appointments/me', {
    params: { filter, page, size },
  });
  return data.data?.content ?? [];
}

export async function getMyAppointment(appointmentId: string) {
  const { data } = await apiClient.get<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/appointments/${appointmentId}`,
  );
  return data.data;
}

export async function cancelMyAppointment(appointmentId: string, reason?: string) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/appointments/${appointmentId}/cancel`,
    reason ? { reason } : {},
  );
  return data.data;
}

export async function rescheduleMyAppointment(appointmentId: string, newSlotId: string) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/appointments/${appointmentId}/reschedule`,
    { newSlotId },
  );
  return data.data;
}

export async function listDoctorAppointments(filter: AppointmentFilter = 'all') {
  const { data } = await apiClient.get<ApiEnvelope<AppointmentSummary[]>>('/scheduling/doctors/me/appointments', {
    params: { filter },
  });
  return data.data ?? [];
}

export async function getDoctorAppointment(appointmentId: string) {
  const { data } = await apiClient.get<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/doctors/me/appointments/${appointmentId}`,
  );
  return data.data;
}

export async function cancelDoctorAppointment(appointmentId: string, reason?: string) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/doctors/me/appointments/${appointmentId}/cancel`,
    reason ? { reason } : {},
  );
  return data.data;
}

export async function updateDoctorAppointmentStatus(appointmentId: string, status: 'COMPLETED' | 'NO_SHOW') {
  const { data } = await apiClient.patch<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/doctors/me/appointments/${appointmentId}/status`,
    { status },
  );
  return data.data;
}

export async function confirmDoctorAppointment(appointmentId: string) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/doctors/me/appointments/${appointmentId}/confirm`,
  );
  return data.data;
}

export async function requestDoctorReschedule(appointmentId: string, message?: string) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/doctors/me/appointments/${appointmentId}/request-reschedule`,
    message ? { message } : {},
  );
  return data.data;
}

export async function postponeDoctorAppointment(appointmentId: string, message?: string) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/doctors/me/appointments/${appointmentId}/postpone`,
    message ? { message } : {},
  );
  return data.data;
}

export async function resumeDoctorAppointment(appointmentId: string) {
  const { data } = await apiClient.post<ApiEnvelope<AppointmentDetail>>(
    `/scheduling/doctors/me/appointments/${appointmentId}/resume`,
  );
  return data.data;
}

export interface BlockSchedulePayload {
  fromDate: string;
  toDate: string;
}

export interface SlotBlockResult {
  slotsBlocked: number;
  slotsUnblocked: number;
}

export async function blockScheduleSlots(scheduleId: string, payload: BlockSchedulePayload) {
  const { data } = await apiClient.post<ApiEnvelope<SlotBlockResult>>(
    `/scheduling/doctors/me/schedules/${scheduleId}/block`,
    payload,
  );
  return data.data;
}

export async function unblockScheduleSlots(scheduleId: string, payload: BlockSchedulePayload) {
  const { data } = await apiClient.post<ApiEnvelope<SlotBlockResult>>(
    `/scheduling/doctors/me/schedules/${scheduleId}/unblock`,
    payload,
  );
  return data.data;
}

export const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export const CONSULTATION_TYPES = ['IN_PERSON', 'TELECONSULTATION', 'FOLLOW_UP'] as const;
