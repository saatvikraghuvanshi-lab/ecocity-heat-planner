import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  MapPin, 
  Key, 
  Sparkles, 
  X, 
  Check, 
  LogOut, 
  Save, 
  ShieldCheck, 
  Zap, 
  Trees, 
  Flame 
} from "lucide-react";
import { UserProfile, SimulationRunRecord } from "@/types/dashboard";
import { saveUserProfileToDB } from "@/lib/simulationEngine";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAuthModal: () => void;
  simulationHistory: SimulationRunRecord[];
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenAuthModal,
  simulationHistory,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "stats" | "apikeys">("profile");
  const [name, setName] = useState<string>(user.name);
  const [role, setRole] = useState<string>(user.role);
  const [organization, setOrganization] = useState<string>(user.organization);
  const [location, setLocation] = useState<string>(user.location || "San Francisco, CA");
  const [bio, setBio] = useState<string>(user.bio || "");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalCarbonOffset = simulationHistory.reduce((sum, r) => sum + r.metrics.carbonOffsetTonsYear, 0);
  const totalEnergySaved = simulationHistory.reduce((sum, r) => sum + r.metrics.annualEnergySavingsMwh, 0);
  const maxCoolingAchieved = simulationHistory.reduce((max, r) => Math.max(max, r.metrics.tempReductionC), 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      role,
      organization,
      location,
      bio,
    };
    saveUserProfileToDB(updated);
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#070e16] border border-[#182c40] rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Profile Cover */}
        <div className="relative bg-gradient-to-r from-[#0a2028] via-[#091520] to-[#0b1b24] p-6 border-b border-[#142332]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#12202e] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{user.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  Verified Specialist
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{user.role}</p>
              <p className="text-[11px] text-slate-400">{user.organization}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#142332] bg-[#050b10] px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 border-b-2 transition-all mr-6 cursor-pointer ${
              activeTab === "profile"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-3 border-b-2 transition-all mr-6 cursor-pointer ${
              activeTab === "stats"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Impact Activity Stats
          </button>
          <button
            onClick={() => setActiveTab("apikeys")}
            className={`py-3 border-b-2 transition-all mr-6 cursor-pointer ${
              activeTab === "apikeys"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            API & GIS Integration
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {savedSuccess && (
                <div className="p-2.5 rounded-lg bg-[#0c261e] border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Organization / Municipal Agency
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Professional Bio & Focus
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Switch Account / Sign Out</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#05080c] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "stats" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-[#050b10] border border-[#142332]">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Total Simulations Logged
                  </span>
                  <span className="text-xl font-bold text-slate-100">
                    {simulationHistory.length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#050b10] border border-[#142332]">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Max Cooling Generated
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    -{maxCoolingAchieved}°C
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#050b10] border border-[#142332]">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Cumulative Avoided Energy
                  </span>
                  <span className="text-xl font-bold text-cyan-300">
                    {totalEnergySaved.toLocaleString()} MWh
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#050b10] border border-[#142332]">
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Cumulative CO₂ Offset
                  </span>
                  <span className="text-xl font-bold text-emerald-300">
                    {totalCarbonOffset.toLocaleString()} tCO₂e
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#07131e] border border-[#142638] text-slate-300 text-xs flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0" />
                <p>
                  Active since {user.joinedAt}. Your simulations comply with NOAA & EPA Urban Heat mitigation modeling protocols.
                </p>
              </div>
            </div>
          )}

          {activeTab === "apikeys" && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                Municipal GIS tokens for syncing raster heat grids with ArcGIS Enterprise and OpenStreetMap Overpass API:
              </p>

              <div className="p-3 rounded-xl bg-[#050b10] border border-[#142332] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">OpenStreetMap CartoDB API Key</span>
                  <span className="text-[10px] font-mono text-emerald-400">Active</span>
                </div>
                <div className="font-mono text-slate-400 text-xs bg-[#03060a] p-2 rounded border border-[#101b27]">
                  pk.carto_live_89f3a9e201b74d9...
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#050b10] border border-[#142332] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Thermodynamic UHI Engine Webhook</span>
                  <span className="text-[10px] font-mono text-cyan-400">Connected</span>
                </div>
                <div className="font-mono text-slate-400 text-xs bg-[#03060a] p-2 rounded border border-[#101b27]">
                  https://api.ecocity.gov/v2/simulations/webhook
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
