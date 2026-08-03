import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isValidUuid } from '@/shared/utils/uuid';
import { useAuthenticatedQueryEnabled } from '@/shared/hooks/useAuthenticatedQueryEnabled';
import {
  bookAppointment,
  cancelDoctorAppointment,
  cancelMyAppointment,
  confirmDoctorAppointment,
  createSchedule,
  getDoctorAppointment,
  getDoctorAvailability,
  getDoctorBookingLocations,
  getMyAppointment,
  listDoctorAppointments,
  listMyAppointments,
  listMySchedules,
  postponeDoctorAppointment,
  requestDoctorReschedule,
  rescheduleMyAppointment,
  resumeDoctorAppointment,
  blockScheduleSlots,
  unblockScheduleSlots,
  updateDoctorAppointmentStatus,
  updateSchedule,
  type AppointmentFilter,
  type BookAppointmentPayload,
  type CreateSchedulePayload,
} from '@/features/scheduling/api/schedulingApi';

export const schedulingKeys = {
  schedules: ['scheduling', 'schedules'] as const,
  locations: (doctorId: string) => ['scheduling', 'locations', doctorId] as const,
  availability: (doctorId: string, hospitalId: string, branchId: string) =>
    ['scheduling', 'availability', doctorId, hospitalId, branchId] as const,
  myAppointments: (filter: AppointmentFilter) => ['scheduling', 'appointments', 'me', filter] as const,
  myAppointment: (id: string) => ['scheduling', 'appointments', 'me', id] as const,
  doctorAppointments: (filter: AppointmentFilter) => ['scheduling', 'appointments', 'doctor', filter] as const,
  doctorAppointment: (id: string) => ['scheduling', 'appointments', 'doctor', id] as const,
};

export function useMySchedules() {
  return useQuery({ queryKey: schedulingKeys.schedules, queryFn: listMySchedules, staleTime: 60_000 });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchedulePayload) => createSchedule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules }),
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload: CreateSchedulePayload }) =>
      updateSchedule(scheduleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules }),
  });
}

export function useDoctorBookingLocations(doctorId: string, enabled = true) {
  const authEnabled = useAuthenticatedQueryEnabled(enabled);
  return useQuery({
    queryKey: schedulingKeys.locations(doctorId),
    queryFn: () => getDoctorBookingLocations(doctorId),
    enabled: authEnabled && isValidUuid(doctorId),
  });
}

export function useDoctorAvailability(doctorId: string, hospitalId: string, branchId: string, enabled = true) {
  const authEnabled = useAuthenticatedQueryEnabled(enabled);
  return useQuery({
    queryKey: schedulingKeys.availability(doctorId, hospitalId, branchId),
    queryFn: () => getDoctorAvailability(doctorId, { hospitalId, branchId }),
    enabled: authEnabled && isValidUuid(doctorId) && Boolean(hospitalId && branchId),
    staleTime: 30_000,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookAppointmentPayload) => bookAppointment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useMyAppointments(filter: AppointmentFilter = 'upcoming') {
  return useQuery({
    queryKey: schedulingKeys.myAppointments(filter),
    queryFn: () => listMyAppointments(filter),
    staleTime: 30_000,
  });
}

export function useMyAppointment(appointmentId: string, enabled = true) {
  return useQuery({
    queryKey: schedulingKeys.myAppointment(appointmentId),
    queryFn: () => getMyAppointment(appointmentId),
    enabled: enabled && Boolean(appointmentId),
  });
}

export function useCancelMyAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason?: string }) =>
      cancelMyAppointment(appointmentId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useRescheduleMyAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, newSlotId }: { appointmentId: string; newSlotId: string }) =>
      rescheduleMyAppointment(appointmentId, newSlotId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useDoctorAppointments(filter: AppointmentFilter = 'all') {
  return useQuery({
    queryKey: schedulingKeys.doctorAppointments(filter),
    queryFn: () => listDoctorAppointments(filter),
    staleTime: 30_000,
  });
}

export function useDoctorAppointment(appointmentId: string, enabled = true) {
  return useQuery({
    queryKey: schedulingKeys.doctorAppointment(appointmentId),
    queryFn: () => getDoctorAppointment(appointmentId),
    enabled: enabled && Boolean(appointmentId),
  });
}

export function useCancelDoctorAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason?: string }) =>
      cancelDoctorAppointment(appointmentId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useUpdateDoctorAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: 'COMPLETED' | 'NO_SHOW' }) =>
      updateDoctorAppointmentStatus(appointmentId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useConfirmDoctorAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => confirmDoctorAppointment(appointmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useRequestDoctorReschedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, message }: { appointmentId: string; message?: string }) =>
      requestDoctorReschedule(appointmentId, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function usePostponeDoctorAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, message }: { appointmentId: string; message?: string }) =>
      postponeDoctorAppointment(appointmentId, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useResumeDoctorAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => resumeDoctorAppointment(appointmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduling', 'appointments'] }),
  });
}

export function useBlockScheduleSlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, fromDate, toDate }: { scheduleId: string; fromDate: string; toDate: string }) =>
      blockScheduleSlots(scheduleId, { fromDate, toDate }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules }),
  });
}

export function useUnblockScheduleSlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, fromDate, toDate }: { scheduleId: string; fromDate: string; toDate: string }) =>
      unblockScheduleSlots(scheduleId, { fromDate, toDate }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: schedulingKeys.schedules }),
  });
}
