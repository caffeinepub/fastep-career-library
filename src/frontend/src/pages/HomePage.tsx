import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Armchair,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Grid3x3,
  LogOut,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { AppPage } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  UserRole,
  useAllRegistrations,
  useOwnRegistrations,
  useSeatStates,
  useTodaysRegistrations,
} from "../hooks/useQueries";

interface HomePageProps {
  navigate: (page: AppPage) => void;
  isAdmin: boolean;
  role: UserRole;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgColor: string;
  textColor: string;
  onClick?: () => void;
  ocid: string;
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
  textColor,
  onClick,
  ocid,
}: StatCardProps) {
  return (
    <motion.div
      data-ocid={ocid}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-2xl p-4 bg-white shadow-card flex flex-col gap-2 cursor-pointer ${onClick ? "active:shadow-brand" : ""}`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {icon}
      </div>
      <div>
        <p className="font-display font-bold text-2xl text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs font-body text-muted-foreground mt-0.5">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export default function HomePage({ navigate, isAdmin, role }: HomePageProps) {
  const { clear, identity } = useInternetIdentity();

  // Admin sees all registrations; student sees own
  const { data: allRegistrations = [], isLoading: loadingAll } =
    useAllRegistrations();
  const { data: ownRegistrations = [], isLoading: loadingOwn } =
    useOwnRegistrations();
  const { data: seats = [], isLoading: loadingSeats } = useSeatStates();
  const { data: todayRegs = [], isLoading: loadingToday } =
    useTodaysRegistrations();

  const registrations = isAdmin ? allRegistrations : ownRegistrations;
  const totalMembers = isAdmin
    ? allRegistrations.length
    : ownRegistrations.length;
  const blockedSeats = seats.filter((s) => s.isBlocked).length;
  const availableSeats = 100 - blockedSeats;

  const principalStr =
    identity?.getPrincipal().toString().slice(0, 8) ?? "User";

  const isLoading = loadingAll || loadingOwn || loadingSeats || loadingToday;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-brand-gradient px-4 pt-10 pb-6 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-2 -left-4 w-20 h-20 rounded-full bg-white/05" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold leading-tight">
                Fastep Career Library
              </h1>
              <p className="font-body text-xs text-white/70">
                {isAdmin ? "Admin Dashboard" : `Hi, ${principalStr}...`}
              </p>
            </div>
          </div>
          <Button
            data-ocid="home.logout.button"
            variant="ghost"
            size="icon"
            onClick={clear}
            className="text-white hover:bg-white/20 rounded-xl w-10 h-10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Hero card */}
      <div className="px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-brand-gradient-hero p-5 text-white shadow-brand overflow-hidden relative"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <BookOpen className="w-20 h-20" />
          </div>
          <p className="font-body text-xs text-white/70 tracking-widest uppercase">
            Welcome to
          </p>
          <h2 className="font-display text-xl font-bold mt-1">
            Fastep Career Library
          </h2>
          <p className="font-body text-sm text-white/80 mt-1">
            Perfect Library Solution
          </p>
        </motion.div>
      </div>

      <main className="flex-1 px-4 pt-5 pb-8">
        {/* Stats section (admin only) */}
        {isAdmin && (
          <>
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Overview
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Skeleton key={n} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <StatCard
                  ocid="home.total-members.card"
                  icon={<Users className="w-5 h-5" />}
                  label="Total Members"
                  value={totalMembers}
                  bgColor="oklch(0.93 0.06 350)"
                  textColor="oklch(0.5 0.18 340)"
                  onClick={() => navigate("students")}
                />
                <StatCard
                  ocid="home.seats-blocked.card"
                  icon={<Armchair className="w-5 h-5" />}
                  label="Seats Blocked"
                  value={blockedSeats}
                  bgColor="oklch(0.93 0.06 36)"
                  textColor="oklch(0.48 0.18 28)"
                  onClick={() => navigate("seats")}
                />
                <StatCard
                  ocid="home.seats-available.card"
                  icon={<CheckCircle className="w-5 h-5" />}
                  label="Available"
                  value={availableSeats}
                  bgColor="oklch(0.93 0.06 145)"
                  textColor="oklch(0.42 0.14 145)"
                  onClick={() => navigate("available-seats")}
                />
                <StatCard
                  ocid="home.total-seats.card"
                  icon={<Grid3x3 className="w-5 h-5" />}
                  label="Total Seats"
                  value={100}
                  bgColor="oklch(0.92 0.06 250)"
                  textColor="oklch(0.45 0.14 250)"
                  onClick={() => navigate("seats")}
                />
                <StatCard
                  ocid="home.today-registered.card"
                  icon={<CalendarCheck className="w-5 h-5" />}
                  label="Today Reg."
                  value={todayRegs.length}
                  bgColor="oklch(0.93 0.06 75)"
                  textColor="oklch(0.48 0.14 65)"
                  onClick={() => navigate("today")}
                />
              </div>
            )}
          </>
        )}

        {/* Student view stats */}
        {!isAdmin && role !== UserRole.guest && (
          <>
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              My Account
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatCard
                ocid="home.my-registrations.card"
                icon={<UserPlus className="w-5 h-5" />}
                label="My Registrations"
                value={ownRegistrations.length}
                bgColor="oklch(0.93 0.06 36)"
                textColor="oklch(0.48 0.18 28)"
                onClick={() => navigate("students")}
              />
              <StatCard
                ocid="home.seats-available.card"
                icon={<CheckCircle className="w-5 h-5" />}
                label="Seats Available"
                value={availableSeats}
                bgColor="oklch(0.93 0.06 145)"
                textColor="oklch(0.42 0.14 145)"
                onClick={() => navigate("available-seats")}
              />
            </div>
          </>
        )}

        {/* Quick Actions */}
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Student Registration */}
          <motion.button
            data-ocid="home.register.button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("register")}
            className="rounded-2xl bg-white p-5 shadow-card flex flex-col items-center gap-3 text-center"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.57 0.21 36) 0%, oklch(0.52 0.21 32) 100%)",
              }}
            >
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-foreground">
                Student Registration
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {isAdmin ? "Register new student" : "Register yourself"}
              </p>
            </div>
          </motion.button>

          {/* Seat Management */}
          <motion.button
            data-ocid="home.seats.button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(isAdmin ? "seats" : "available-seats")}
            className="rounded-2xl bg-white p-5 shadow-card flex flex-col items-center gap-3 text-center"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.56 0.17 145) 0%, oklch(0.50 0.16 145) 100%)",
              }}
            >
              <Armchair className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-foreground">
                {isAdmin ? "Seat Management" : "Available Seats"}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {isAdmin
                  ? "Block/unblock seats"
                  : `${availableSeats} seats free`}
              </p>
            </div>
          </motion.button>

          {/* Total Students - admin only */}
          {isAdmin && (
            <motion.button
              data-ocid="home.total-students.button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("students")}
              className="rounded-2xl bg-white p-5 shadow-card flex flex-col items-center gap-3 text-center"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.6 0.18 250) 0%, oklch(0.55 0.16 250) 100%)",
                }}
              >
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">
                  Total Students
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {registrations.length} registered
                </p>
              </div>
            </motion.button>
          )}

          {/* Today registered - admin only */}
          {isAdmin && (
            <motion.button
              data-ocid="home.today-registered.button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("today")}
              className="rounded-2xl bg-white p-5 shadow-card flex flex-col items-center gap-3 text-center"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.75 0.15 75) 0%, oklch(0.7 0.14 70) 100%)",
                }}
              >
                <CalendarCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">
                  Today Registered
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {todayRegs.length} today
                </p>
              </div>
            </motion.button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-6 px-4 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
