import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CalendarIcon,
  Camera,
  CameraOff,
  CheckCircle2,
  Hash,
  ImageOff,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import { useCamera } from "../camera/useCamera";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateRegistration } from "../hooks/useQueries";
import { uploadPhoto } from "../utils/photoStorage";

interface StudentRegistrationPageProps {
  navigate: (page: AppPage) => void;
}

export default function StudentRegistrationPage({
  navigate,
}: StudentRegistrationPageProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [regDate, setRegDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const { identity } = useInternetIdentity();
  const createRegistration = useCreateRegistration();

  const camera = useCamera({
    facingMode: "user",
    width: 640,
    height: 480,
    quality: 0.85,
    format: "image/jpeg",
  });

  const handleStartCamera = async () => {
    setShowCamera(true);
    const ok = await camera.startCamera();
    if (!ok) {
      toast.error(camera.error?.message || "Could not start camera");
      setShowCamera(false);
    }
  };

  const handleCapturePhoto = async () => {
    const file = await camera.capturePhoto();
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedPhoto(url);
      setCapturedFile(file);
      camera.stopCamera();
      setShowCamera(false);
    } else {
      toast.error("Failed to capture photo. Please try again.");
    }
  };

  const handleRetakePhoto = async () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
    }
    setCapturedPhoto(null);
    setCapturedFile(null);
    await handleStartCamera();
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.trim())) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (!aadhaar.trim() || !/^\d{12}$/.test(aadhaar.trim())) {
      toast.error("Enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    let photoKey = "";

    // Upload photo if captured
    if (capturedFile) {
      try {
        toast.loading("Uploading photo...", { id: "photo-upload" });
        photoKey = await uploadPhoto(capturedFile, identity);
        toast.dismiss("photo-upload");
      } catch (err) {
        toast.dismiss("photo-upload");
        console.warn("Photo upload failed:", err);
        // Continue without photo - use empty string
        photoKey = "";
      }
    }

    try {
      await createRegistration.mutateAsync({
        name: name.trim(),
        mobile: mobile.trim(),
        aadhaarNumber: aadhaar.trim(),
        address: address.trim(),
        email: email.trim(),
        photoKey,
      });
      toast.success("Registration successful!");
      navigate("home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    }
  };

  const isSubmitting = createRegistration.isPending;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-brand-gradient px-4 pt-10 pb-5 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-3">
          <Button
            data-ocid="registration.back.button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("home")}
            className="text-white hover:bg-white/20 rounded-xl -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-lg font-bold">
              Student Registration
            </h1>
            <p className="font-body text-xs text-white/70">
              Fill in all required details
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-8">
        {/* Photo section */}
        <div className="mb-5">
          <Label className="font-body text-sm font-medium block mb-2">
            Student Photo
          </Label>

          {showCamera ? (
            <div className="rounded-2xl overflow-hidden bg-black relative">
              <video
                ref={camera.videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-[4/3] object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <canvas ref={camera.canvasRef} className="hidden" />

              {camera.isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  data-ocid="registration.capture.button"
                  onClick={handleCapturePhoto}
                  disabled={!camera.isActive}
                  className="btn-brand rounded-full w-14 h-14 border-0 shadow-brand"
                >
                  <Camera className="w-6 h-6" />
                </Button>
                <Button
                  data-ocid="registration.stop-camera.button"
                  variant="outline"
                  onClick={() => {
                    camera.stopCamera();
                    setShowCamera(false);
                  }}
                  className="rounded-full w-14 h-14 bg-white/20 border-white/30 text-white"
                >
                  <CameraOff className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : capturedPhoto ? (
            <div className="relative">
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={capturedPhoto}
                  alt="Student capture"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  data-ocid="registration.retake.button"
                  size="sm"
                  onClick={handleRetakePhoto}
                  className="btn-brand rounded-xl h-8 px-3 border-0 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Retake
                </Button>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/40 rounded-lg px-2 py-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-white font-body">
                  Photo captured
                </span>
              </div>
            </div>
          ) : (
            <motion.button
              data-ocid="registration.camera.button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartCamera}
              className="w-full h-40 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground"
            >
              {camera.isSupported === false ? (
                <>
                  <ImageOff className="w-10 h-10 opacity-50" />
                  <span className="text-sm font-body">
                    Camera not available
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-brand-pale flex items-center justify-center">
                    <Camera className="w-6 h-6 text-brand" />
                  </div>
                  <span className="text-sm font-body font-medium">
                    Tap to take photo
                  </span>
                  <span className="text-xs font-body opacity-70">
                    Use front camera
                  </span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-name" className="font-body text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="registration.name.input"
                id="reg-name"
                placeholder="Enter student's full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 font-body input-brand rounded-xl"
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reg-mobile"
              className="font-body text-sm font-medium"
            >
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="registration.mobile.input"
                id="reg-mobile"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="pl-10 h-12 font-body input-brand rounded-xl"
              />
            </div>
          </div>

          {/* Aadhaar */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reg-aadhaar"
              className="font-body text-sm font-medium"
            >
              Aadhaar Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="registration.aadhaar.input"
                id="reg-aadhaar"
                type="text"
                placeholder="12-digit Aadhaar number"
                value={aadhaar}
                onChange={(e) =>
                  setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))
                }
                className="pl-10 h-12 font-body input-brand rounded-xl"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reg-address"
              className="font-body text-sm font-medium"
            >
              Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea
                data-ocid="registration.address.textarea"
                id="reg-address"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10 min-h-[80px] font-body input-brand rounded-xl resize-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="reg-email"
              className="font-body text-sm font-medium"
            >
              Email ID <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="registration.email.input"
                id="reg-email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 font-body input-brand rounded-xl"
              />
            </div>
          </div>

          {/* Registration Date */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-date" className="font-body text-sm font-medium">
              Registration Date
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="registration.date.input"
                id="reg-date"
                type="date"
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="pl-10 h-12 font-body input-brand rounded-xl"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            data-ocid="registration.submit_button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 btn-brand rounded-xl text-sm font-display font-semibold border-0 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Registration"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
