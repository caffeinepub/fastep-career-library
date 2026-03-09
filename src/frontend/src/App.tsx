import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { UserRole, useCallerRole, useIsAdmin } from "./hooks/useQueries";
import AllStudentsPage from "./pages/AllStudentsPage";
import AuthPage from "./pages/AuthPage";
import AvailableSeatsPage from "./pages/AvailableSeatsPage";
import HomePage from "./pages/HomePage";
import SeatsPage from "./pages/SeatsPage";
import StudentRegistrationPage from "./pages/StudentRegistrationPage";
import TodayRegisteredPage from "./pages/TodayRegisteredPage";

export type AppPage =
  | "home"
  | "register"
  | "seats"
  | "students"
  | "today"
  | "available-seats";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<AppPage>("home");
  const { data: isAdmin } = useIsAdmin();
  const { data: role } = useCallerRole();

  const principalKey = identity?.getPrincipal().toString();
  // Reset to home when identity changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on identity change
  useEffect(() => {
    setCurrentPage("home");
  }, [principalKey]);

  if (isInitializing) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-gradient animate-pulse" />
          <p className="text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <AuthPage />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  const navigate = (page: AppPage) => setCurrentPage(page);

  return (
    <div className="app-shell">
      {currentPage === "home" && (
        <HomePage
          navigate={navigate}
          isAdmin={isAdmin ?? false}
          role={role ?? UserRole.guest}
        />
      )}
      {currentPage === "register" && (
        <StudentRegistrationPage navigate={navigate} />
      )}
      {currentPage === "seats" && (
        <SeatsPage navigate={navigate} isAdmin={isAdmin ?? false} />
      )}
      {currentPage === "students" && <AllStudentsPage navigate={navigate} />}
      {currentPage === "today" && <TodayRegisteredPage navigate={navigate} />}
      {currentPage === "available-seats" && (
        <AvailableSeatsPage navigate={navigate} />
      )}
      <Toaster richColors position="top-center" />
    </div>
  );
}
