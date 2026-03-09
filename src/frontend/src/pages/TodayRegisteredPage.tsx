import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CalendarDays,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  UserX,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteRegistration,
  useTodaysRegistrations,
} from "../hooks/useQueries";
import type { StudentRegistration } from "../hooks/useQueries";
import { useIsAdmin } from "../hooks/useQueries";
import { getPhotoUrl } from "../utils/photoStorage";

interface TodayRegisteredPageProps {
  navigate: (page: AppPage) => void;
}

function formatDate(ns: bigint): string {
  try {
    const ms = Number(ns) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

interface StudentDetailCardProps {
  student: StudentRegistration;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
  index: number;
  canDelete: boolean;
}

function StudentDetailCard({
  student,
  onDelete,
  isDeleting,
  index,
  canDelete,
}: StudentDetailCardProps) {
  const { identity } = useInternetIdentity();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(true);

  useEffect(() => {
    if (!student.photoKey) {
      setPhotoLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = await getPhotoUrl(student.photoKey, identity);
        if (!cancelled) setPhotoUrl(url);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setPhotoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [student.photoKey, identity]);

  return (
    <motion.div
      data-ocid={`today.item.${index}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="bg-white rounded-2xl overflow-hidden shadow-card"
    >
      {/* Photo banner */}
      <div className="relative bg-brand-gradient h-40">
        {photoLoading ? (
          <Skeleton className="absolute inset-0 rounded-none" />
        ) : photoUrl ? (
          <img
            src={photoUrl}
            alt={student.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <User className="w-20 h-20 text-white" />
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Photo overlay content */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white drop-shadow">
              {student.name}
            </h3>
          </div>
          {/* Delete button (admin only) */}
          {canDelete && (
            <Button
              data-ocid={`today.delete_button.${index}`}
              size="icon"
              variant="ghost"
              onClick={() => onDelete(student.id)}
              disabled={isDeleting}
              className="text-white hover:bg-white/20 rounded-xl w-8 h-8"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2.5">
        <DetailRow
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Mobile"
          value={student.mobile}
        />
        <DetailRow
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email"
          value={student.email}
        />
        <DetailRow
          icon={<Hash className="w-3.5 h-3.5" />}
          label="Aadhaar"
          value={student.aadhaarNumber}
        />
        <DetailRow
          icon={<MapPin className="w-3.5 h-3.5" />}
          label="Address"
          value={student.address}
        />
        <DetailRow
          icon={<CalendarDays className="w-3.5 h-3.5" />}
          label="Registration Date"
          value={formatDate(student.registrationDate)}
        />
      </div>
    </motion.div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-md bg-brand-pale flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <span className="font-body text-xs text-muted-foreground">
          {label}:{" "}
        </span>
        <span className="font-body text-sm font-medium text-foreground break-words">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function TodayRegisteredPage({
  navigate,
}: TodayRegisteredPageProps) {
  const { data: students = [], isLoading } = useTodaysRegistrations();
  const { data: isAdmin } = useIsAdmin();
  const deleteRegistration = useDeleteRegistration();

  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      await deleteRegistration.mutateAsync(confirmDeleteId);
      toast.success("Registration deleted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-brand-gradient px-4 pt-10 pb-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3">
          <Button
            data-ocid="today.back.button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("home")}
            className="text-white hover:bg-white/20 rounded-xl -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold">
              Today's Registrations
            </h1>
            <p className="font-body text-xs text-white/70">{today}</p>
          </div>
        </div>
      </header>

      {/* Count pill */}
      <div className="px-4 py-3 bg-white border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-display font-bold text-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.57 0.21 36) 0%, oklch(0.52 0.21 32) 100%)",
            }}
          >
            {students.length}
          </div>
          <span className="font-body text-sm text-muted-foreground">
            student{students.length !== 1 ? "s" : ""} registered today
          </span>
        </div>
      </div>

      <main className="flex-1 px-4 pt-4 pb-8 flex flex-col gap-4">
        {isLoading ? (
          <>
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </>
        ) : students.length === 0 ? (
          <motion.div
            data-ocid="today.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1 gap-4 py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
              <UserX className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-foreground">
                No registrations today
              </h3>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Be the first to register today!
              </p>
            </div>
            <Button
              data-ocid="today.register.button"
              onClick={() => navigate("register")}
              className="btn-brand rounded-xl border-0 h-11 px-6 font-display font-semibold text-sm"
            >
              Register Now
            </Button>
          </motion.div>
        ) : (
          students.map((student, idx) => (
            <StudentDetailCard
              key={student.id.toString()}
              student={student}
              onDelete={(id) => setConfirmDeleteId(id)}
              isDeleting={deletingId === student.id}
              index={idx + 1}
              canDelete={!!isAdmin}
            />
          ))
        )}
      </main>

      {/* Delete confirm */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent data-ocid="today.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Registration?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete this student's registration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="today.cancel_button"
              className="font-body"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="today.confirm_button"
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90 font-body"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
