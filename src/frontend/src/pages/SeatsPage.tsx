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
import { Armchair, ArrowLeft, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import {
  useBlockSeat,
  useSeatStates,
  useUnblockSeat,
} from "../hooks/useQueries";

interface SeatsPageProps {
  navigate: (page: AppPage) => void;
  isAdmin: boolean;
}

interface SeatCardProps {
  seatNumber: number;
  isBlocked: boolean;
  onClick: () => void;
  isAdmin: boolean;
  index: number;
}

function SeatCard({
  seatNumber,
  isBlocked,
  onClick,
  isAdmin,
  index,
}: SeatCardProps) {
  return (
    <motion.button
      data-ocid={`seats.item.${index}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.008 }}
      whileHover={isAdmin ? { scale: 1.05 } : {}}
      whileTap={isAdmin ? { scale: 0.93 } : {}}
      onClick={isAdmin ? onClick : undefined}
      className={`rounded-xl p-2 flex flex-col items-center gap-1 transition-all ${
        isAdmin ? "cursor-pointer" : "cursor-default"
      } ${isBlocked ? "seat-blocked" : "seat-available"}`}
    >
      <Armchair className="w-5 h-5 flex-shrink-0" />
      <span className="text-xs font-display font-bold leading-none">
        S-{seatNumber}
      </span>
      <span
        className={`text-[9px] font-body leading-none ${isBlocked ? "text-red-600" : "text-green-700"}`}
      >
        {isBlocked ? "Blocked" : "Free"}
      </span>
    </motion.button>
  );
}

export default function SeatsPage({ navigate, isAdmin }: SeatsPageProps) {
  const { data: seats = [], isLoading } = useSeatStates();
  const blockSeat = useBlockSeat();
  const unblockSeat = useUnblockSeat();

  const [pendingSeat, setPendingSeat] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "block" | "unblock" | null
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Build seat map (seats from backend may not include all 100)
  const seatMap = new Map<number, boolean>();
  for (const s of seats) {
    seatMap.set(Number(s.seatNumber), s.isBlocked);
  }
  // Fill all 100 seats
  const allSeats = Array.from({ length: 100 }, (_, i) => ({
    seatNumber: i + 1,
    isBlocked: seatMap.get(i + 1) ?? false,
  }));

  const blockedCount = allSeats.filter((s) => s.isBlocked).length;
  const availableCount = 100 - blockedCount;

  const handleSeatClick = (seatNum: number, isBlocked: boolean) => {
    if (!isAdmin) return;
    setPendingSeat(seatNum);
    setPendingAction(isBlocked ? "unblock" : "block");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingSeat === null || !pendingAction) return;
    setConfirmOpen(false);

    try {
      if (pendingAction === "block") {
        await blockSeat.mutateAsync(BigInt(pendingSeat));
        toast.success(`Seat S-${pendingSeat} blocked`);
      } else {
        await unblockSeat.mutateAsync(BigInt(pendingSeat));
        toast.success(`Seat S-${pendingSeat} unblocked`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    }
  };

  const isUpdating = blockSeat.isPending || unblockSeat.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-brand-gradient px-4 pt-10 pb-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3">
          <Button
            data-ocid="seats.back.button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("home")}
            className="text-white hover:bg-white/20 rounded-xl -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold">Seat Management</h1>
            <p className="font-body text-xs text-white/70">
              {isAdmin
                ? "Tap a seat to block/unblock"
                : "View seat availability"}
            </p>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="px-4 py-3 bg-white border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "oklch(0.6 0.18 250)" }}
              />
              <span className="font-body text-xs text-muted-foreground">
                All:{" "}
              </span>
              <span className="font-display font-bold text-sm">100</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "oklch(0.57 0.21 36)" }}
              />
              <span className="font-body text-xs text-muted-foreground">
                Blocked:{" "}
              </span>
              <span className="font-display font-bold text-sm text-destructive">
                {blockedCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "oklch(0.56 0.17 145)" }}
              />
              <span className="font-body text-xs text-muted-foreground">
                Free:{" "}
              </span>
              <span
                className="font-display font-bold text-sm"
                style={{ color: "oklch(0.42 0.14 145)" }}
              >
                {availableCount}
              </span>
            </div>
          </div>
          {isUpdating && (
            <Loader2 className="w-4 h-4 animate-spin text-brand" />
          )}
        </div>
      </div>

      {/* Seat grid */}
      <main className="flex-1 px-4 pt-4 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
              <Skeleton key={n} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {allSeats.map((seat, idx) => (
              <SeatCard
                key={seat.seatNumber}
                seatNumber={seat.seatNumber}
                isBlocked={seat.isBlocked}
                onClick={() => handleSeatClick(seat.seatNumber, seat.isBlocked)}
                isAdmin={isAdmin}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </main>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-ocid="seats.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {pendingAction === "block" ? "Block Seat?" : "Unblock Seat?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              {pendingAction === "block"
                ? `Mark seat S-${pendingSeat} as blocked (not available for students)?`
                : `Mark seat S-${pendingSeat} as available again?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="seats.cancel_button"
              className="font-body"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="seats.confirm_button"
              onClick={handleConfirm}
              className={`font-body ${pendingAction === "block" ? "bg-destructive text-white hover:bg-destructive/90" : "btn-brand border-0"}`}
            >
              {pendingAction === "block" ? "Block Seat" : "Unblock Seat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
