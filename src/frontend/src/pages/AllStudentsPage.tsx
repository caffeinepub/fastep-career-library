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
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllRegistrations,
  useDeleteRegistration,
  useOwnRegistrations,
} from "../hooks/useQueries";
import { useIsAdmin } from "../hooks/useQueries";
import type { StudentRegistration } from "../hooks/useQueries";
import { getPhotoUrl } from "../utils/photoStorage";

interface AllStudentsPageProps {
  navigate: (page: AppPage) => void;
}

function formatDate(ns: bigint): string {
  try {
    const ms = Number(ns) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function maskAadhaar(aadhaar: string): string {
  if (aadhaar.length !== 12) return aadhaar;
  return `XXXX XXXX ${aadhaar.slice(8)}`;
}

interface StudentPhotoProps {
  photoKey: string;
  name: string;
  size?: "sm" | "lg";
}

function StudentPhoto({ photoKey, name, size = "sm" }: StudentPhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { identity } = useInternetIdentity();

  useEffect(() => {
    let cancelled = false;
    if (!photoKey) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const url = await getPhotoUrl(photoKey, identity);
        if (!cancelled) setPhotoUrl(url);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoKey, identity]);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass =
    size === "lg"
      ? "w-24 h-24 rounded-2xl text-2xl"
      : "w-14 h-14 rounded-xl text-lg";

  if (loading) {
    return <Skeleton className={`${sizeClass} flex-shrink-0`} />;
  }

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center flex-shrink-0 font-display font-bold text-white bg-brand-gradient`}
    >
      {initials || <User className="w-6 h-6" />}
    </div>
  );
}

interface StudentCardProps {
  student: StudentRegistration;
  onDelete: (id: bigint) => void;
  onView: (student: StudentRegistration) => void;
  isDeleting: boolean;
  index: number;
}

function StudentCard({
  student,
  onDelete,
  onView,
  isDeleting,
  index,
}: StudentCardProps) {
  return (
    <motion.div
      data-ocid={`students.item.${index}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl p-4 shadow-card flex gap-3 items-start cursor-pointer card-hover"
      onClick={() => onView(student)}
    >
      <StudentPhoto photoKey={student.photoKey} name={student.name} />
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-base text-foreground truncate">
          {student.name}
        </h3>
        <div className="flex flex-col gap-0.5 mt-1">
          <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0" />
            {student.mobile}
          </p>
          <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5 truncate">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{student.email}</span>
          </p>
          <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
            <Hash className="w-3 h-3 flex-shrink-0" />
            {maskAadhaar(student.aadhaarNumber)}
          </p>
        </div>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Registered: {formatDate(student.registrationDate)}
        </p>
      </div>
      <Button
        data-ocid={`students.delete_button.${index}`}
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(student.id);
        }}
        disabled={isDeleting}
        className="text-destructive hover:bg-destructive/10 rounded-xl w-9 h-9 flex-shrink-0"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </motion.div>
  );
}

interface ProfileModalProps {
  student: StudentRegistration | null;
  onClose: () => void;
}

function FullscreenPhoto({
  photoUrl,
  name,
  onClose,
}: {
  photoUrl: string;
  name: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        data-ocid="students.photo.modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
        onClick={onClose}
      >
        <Button
          data-ocid="students.photo.close_button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-xl z-10"
        >
          <X className="w-6 h-6" />
        </Button>
        <motion.img
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          src={photoUrl}
          alt={name}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function ProfileModal({ student, onClose }: ProfileModalProps) {
  const { identity } = useInternetIdentity();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!student?.photoKey) return;
    let cancelled = false;
    (async () => {
      try {
        const url = await getPhotoUrl(student.photoKey, identity);
        if (!cancelled) setPhotoUrl(url);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [student?.photoKey, identity]);

  // Reset fullscreen when student changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on student change
  useEffect(() => {
    setFullscreen(false);
  }, [student?.photoKey]);

  if (!student) return null;

  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <AnimatePresence>
        {student && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={onClose}
          >
            <motion.div
              data-ocid="students.modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-brand-gradient px-5 pt-6 pb-10 relative">
                <Button
                  data-ocid="students.close_button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
                <p className="font-body text-xs text-white/70 uppercase tracking-widest mb-4">
                  Student Profile
                </p>
              </div>

              {/* Photo + Name (overlapping) */}
              <div className="-mt-8 px-5 pb-5">
                <div className="flex items-end gap-4">
                  {photoUrl ? (
                    <button
                      data-ocid="students.photo.open_modal_button"
                      type="button"
                      onClick={() => setFullscreen(true)}
                      className="flex-shrink-0 focus:outline-none group"
                      title="Tap to view full photo"
                    >
                      <img
                        src={photoUrl}
                        alt={student.name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-brand border-4 border-white group-hover:opacity-90 transition-opacity"
                      />
                    </button>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand border-4 border-white flex-shrink-0">
                      <span className="font-display text-2xl font-bold text-white">
                        {initials}
                      </span>
                    </div>
                  )}
                  <div className="pb-1">
                    <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                      {student.name}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground mt-0.5">
                      {formatDate(student.registrationDate)}
                    </p>
                    {photoUrl && (
                      <p className="font-body text-xs text-brand mt-1">
                        Tap photo to view full
                      </p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-5 space-y-3">
                  <DetailRow
                    icon={<Phone className="w-4 h-4" />}
                    label="Mobile"
                    value={student.mobile}
                  />
                  <DetailRow
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={student.email}
                  />
                  <DetailRow
                    icon={<Hash className="w-4 h-4" />}
                    label="Aadhaar"
                    value={student.aadhaarNumber}
                  />
                  <DetailRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Address"
                    value={student.address}
                  />
                  <DetailRow
                    icon={<CalendarDays className="w-4 h-4" />}
                    label="Registration Date"
                    value={formatDate(student.registrationDate)}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen photo overlay */}
      {fullscreen && photoUrl && (
        <FullscreenPhoto
          photoUrl={photoUrl}
          name={student.name}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-3">
      <div className="w-8 h-8 rounded-lg bg-brand-pale flex items-center justify-center text-brand flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-body text-xs text-muted-foreground">{label}</p>
        <p className="font-body text-sm font-medium text-foreground break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AllStudentsPage({ navigate }: AllStudentsPageProps) {
  const { data: isAdmin } = useIsAdmin();
  const { data: allStudents = [], isLoading: loadingAll } =
    useAllRegistrations();
  const { data: ownStudents = [], isLoading: loadingOwn } =
    useOwnRegistrations();
  const deleteRegistration = useDeleteRegistration();

  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);
  const [viewingStudent, setViewingStudent] =
    useState<StudentRegistration | null>(null);

  const students = isAdmin ? allStudents : ownStudents;
  const isLoading = loadingAll || loadingOwn;

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      await deleteRegistration.mutateAsync(confirmDeleteId);
      toast.success("Registration deleted successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-brand-gradient px-4 pt-10 pb-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3">
          <Button
            data-ocid="students.back.button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("home")}
            className="text-white hover:bg-white/20 rounded-xl -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold">
              {isAdmin ? "All Students" : "My Registrations"}
            </h1>
            <p className="font-body text-xs text-white/70">
              {students.length} registered
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-8 flex flex-col gap-3">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </>
        ) : students.length === 0 ? (
          <motion.div
            data-ocid="students.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1 gap-4 py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
              <UserX className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-foreground">
                No students found
              </h3>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {isAdmin
                  ? "No registrations yet"
                  : "You haven't registered yet"}
              </p>
            </div>
            <Button
              data-ocid="students.register.button"
              onClick={() => navigate("register")}
              className="btn-brand rounded-xl border-0 h-11 px-6 font-display font-semibold text-sm"
            >
              Register Now
            </Button>
          </motion.div>
        ) : (
          students.map((student, idx) => (
            <StudentCard
              key={student.id.toString()}
              student={student}
              onDelete={(id) => setConfirmDeleteId(id)}
              onView={(s) => setViewingStudent(s)}
              isDeleting={deletingId === student.id}
              index={idx + 1}
            />
          ))
        )}
      </main>

      {/* Profile modal */}
      <ProfileModal
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent data-ocid="students.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Registration?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete the student's registration. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="students.cancel_button"
              className="font-body"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="students.confirm_button"
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
