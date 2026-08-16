import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Briefcase, 
  Sparkles, 
  Check, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  MapPin,
  Trees
} from "lucide-react";
import { UserProfile, UserPreferences } from "@/types/dashboard";
import { saveUserProfileToDB } from "@/lib/simulationEngine";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (profile: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signup");
  
  // Form states
  const [fullName, setFullName] = useState<string>("Dr. Saatvik Raghuvanshi");
  const [email, setEmail] = useState<string>("saatvik@climate.ecocity.gov");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [organization, setOrganization] = useState<string>("Department of Environment & Resilient Cities");
  const [role, setRole] = useState<string>("Lead Climate Scientist & Urban Modeler");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const updatedProfile: UserProfile = {
        ...currentUser,
        id: `usr-${Date.now()}`,
        name: fullName || "EcoCity Modeler",
        email: email || "specialist@ecocity.gov",
        avatar: selectedAvatar,
        role: role || "Urban Heat Mitigation Specialist",
        organization: organization || "Municipal Climate Office",
        joinedAt: new Date().toISOString().split("T")[0],
      };

      saveUserProfileToDB(updatedProfile);
      onLoginSuccess(updatedProfile);
      setSuccessMessage(authMode === "signup" ? "Account created successfully!" : "Signed in successfully!");
      
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    }, 600);
  };

  const handleDemoSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoProfile: UserProfile = {
        ...currentUser,
        name: "Dr. Saatvik Raghuvanshi",
        email: "saatvik@climate.ecocity.gov",
        role: "Lead Climate Scientist & Urban Modeler",
        organization: "Department of Environment & Resilient Cities",
        avatar: AVATAR_OPTIONS[0],
      };
      saveUserProfileToDB(demoProfile);
      onLoginSuccess(demoProfile);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#070e16] border border-[#182c40] rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#142332] flex items-center justify-between bg-[#091420]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Trees className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {authMode === "signup" ? "Create EcoCity Account" : authMode === "signin" ? "Sign In to EcoCity" : "Reset Password"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Geospatial Climate Planning & Thermodynamic UHI Simulator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#12202e] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#142332] bg-[#050b10] px-6">
          <button
            onClick={() => setAuthMode("signup")}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-all mr-6 cursor-pointer ${
              authMode === "signup"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAuthMode("signin")}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-all mr-6 cursor-pointer ${
              authMode === "signin"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3 rounded-lg bg-[#0c261e] border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {authMode === "signup" && (
            <>
              {/* Avatar Selector */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1.5">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_OPTIONS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Avatar option"
                      onClick={() => setSelectedAvatar(url)}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        selectedAvatar === url
                          ? "border-emerald-400 scale-110 shadow-lg shadow-emerald-500/30"
                          : "border-[#192b3c] opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Full Name & Title
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Saatvik Raghuvanshi"
                    className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>

              {/* Role / Title */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Specialization / Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium cursor-pointer"
                  >
                    <option value="Lead Climate Scientist & Urban Modeler">Lead Climate Scientist & Urban Modeler</option>
                    <option value="Urban Heat Mitigation Specialist">Urban Heat Mitigation Specialist</option>
                    <option value="Municipal City Planning Director">Municipal City Planning Director</option>
                    <option value="Geospatial GIS Analyst">Geospatial GIS Analyst</option>
                    <option value="Environmental Policy Advisor">Environmental Policy Advisor</option>
                  </select>
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Organization / Municipal Agency
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Dept of Climate & Resilient Cities"
                    className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="specialist@agency.gov"
                className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                Password
              </label>
              {authMode === "signin" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#05080c] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40 mt-2"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#05080c] border-t-transparent animate-spin" />
            ) : (
              <>
                <span>{authMode === "signup" ? "Create Account" : "Sign In"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="text-[11px] text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
            >
              Sign In with Specialist Demo Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
