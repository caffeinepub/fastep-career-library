import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudentRegistration {
    id: bigint;
    name: string;
    photoKey: string;
    email: string;
    address: string;
    mobile: string;
    aadhaarNumber: string;
    registrationDate: bigint;
}
export interface Seat {
    isBlocked: boolean;
    seatNumber: bigint;
}
export interface Profile {
    name: string;
    email: string;
    mobile: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockSeat(seatNumber: bigint): Promise<void>;
    createRegistration(name: string, mobile: string, aadhaarNumber: string, address: string, email: string, photoKey: string): Promise<bigint>;
    deleteRegistration(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOwnRegistrations(): Promise<Array<StudentRegistration>>;
    getRegistrations(): Promise<Array<StudentRegistration>>;
    getSeatStates(): Promise<Array<Seat>>;
    getTodaysRegistrations(): Promise<Array<StudentRegistration>>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    unblockSeat(seatNumber: bigint): Promise<void>;
}
