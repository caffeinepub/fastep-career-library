import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile, Seat, StudentRegistration } from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

export { UserRole };
export type { StudentRegistration, Seat, Profile };

// ─── Role & Profile ───────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

// ─── Registrations ────────────────────────────────────────────────────────────

export function useAllRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<StudentRegistration[]>({
    queryKey: ["allRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOwnRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<StudentRegistration[]>({
    queryKey: ["ownRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodaysRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<StudentRegistration[]>({
    queryKey: ["todaysRegistrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaysRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      mobile: string;
      aadhaarNumber: string;
      address: string;
      email: string;
      photoKey: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createRegistration(
        data.name,
        data.mobile,
        data.aadhaarNumber,
        data.address,
        data.email,
        data.photoKey,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["ownRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["todaysRegistrations"] });
    },
  });
}

export function useDeleteRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deleteRegistration(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["ownRegistrations"] });
      queryClient.invalidateQueries({ queryKey: ["todaysRegistrations"] });
    },
  });
}

// ─── Seats ────────────────────────────────────────────────────────────────────

export function useSeatStates() {
  const { actor, isFetching } = useActor();
  return useQuery<Seat[]>({
    queryKey: ["seatStates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSeatStates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBlockSeat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (seatNumber: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.blockSeat(seatNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatStates"] });
    },
  });
}

export function useUnblockSeat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (seatNumber: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.unblockSeat(seatNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatStates"] });
    },
  });
}
