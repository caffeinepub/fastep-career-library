import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Armchair, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import type { AppPage } from "../App";
import { useSeatStates } from "../hooks/useQueries";

interface AvailableSeatsPageProps {
  navigate: (page: AppPage) => void;
}

interface AvailableSeatCardProps {
  seatNumber: number;
  index: number;
}

function AvailableSeatCard({ seatNumber, index }: AvailableSeatCardProps) {
  return (
    <motion.div
      data-ocid={`available-seats.item.${index}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.01 }}
      className="seat-available rounded-xl p-2.5 flex flex-col items-center gap-1"
    >
      <Armchair className="w-5 h-5" />
      <span className="text-xs font-display font-bold leading-none">
        S-{seatNumber}
      </span>
      <span className="text-[9px] font-body leading-none text-green-700">
        Free
      </span>
    </motion.div>
  );
}

export default function AvailableSeatsPage({
  navigate,
}: AvailableSeatsPageProps) {
  const { data: seats = [], isLoading } = useSeatStates();

  // Build seat map
  const seatMap = new Map<number, boolean>();
  for (const s of seats) {
    seatMap.set(Number(s.seatNumber), s.isBlocked);
  }

  // Get only available seats
  const availableSeats = Array.from({ length: 100 }, (_, i) => ({
    seatNumber: i + 1,
    isBlocked: seatMap.get(i + 1) ?? false,
  })).filter((s) => !s.isBlocked);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-brand-gradient px-4 pt-10 pb-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3">
          <Button
            data-ocid="available-seats.back.button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("home")}
            className="text-white hover:bg-white/20 rounded-xl -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold">Available Seats</h1>
            <p className="font-body text-xs text-white/70">
              Unblocked seats only
            </p>
          </div>
        </div>
      </header>

      {/* Count bar */}
      <div className="px-4 py-3 bg-white border-b border-border">
        <div className="flex items-center gap-2">
          <CheckCircle
            className="w-5 h-5"
            style={{ color: "oklch(0.42 0.14 145)" }}
          />
          <span
            className="font-display font-bold text-lg"
            style={{ color: "oklch(0.42 0.14 145)" }}
          >
            {availableSeats.length}
          </span>
          <span className="font-body text-sm text-muted-foreground">
            seat{availableSeats.length !== 1 ? "s" : ""} available out of 100
          </span>
        </div>
      </div>

      {/* Seat grid */}
      <main className="flex-1 px-4 pt-4 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <Skeleton key={n} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : availableSeats.length === 0 ? (
          <motion.div
            data-ocid="available-seats.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1 gap-4 py-16"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
              <Armchair className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-semibold text-foreground">
                No seats available
              </h3>
              <p className="font-body text-sm text-muted-foreground mt-1">
                All seats are currently blocked
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {availableSeats.map((seat, idx) => (
              <AvailableSeatCard
                key={seat.seatNumber}
                seatNumber={seat.seatNumber}
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
