"use client";

// AddLocationModal — add a new physical location to an existing business.
//
// The user provides:
//   • A location name (label), e.g. "Downtown Route", "North County Markets"
//   • A location address (ZIP / "City, ST" / full address)
//
// The parent receives a BusinessLocation object ready to be appended to
// loadedBusiness.locations and persisted.

import { useState } from "react";
import { X, MapPin, Tag } from "lucide-react";
import type { BusinessLocation } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";

interface Props {
  businessName: string;
  onAdd: (location: BusinessLocation) => void;
  onClose: () => void;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Common location name suggestions
const NAME_SUGGESTIONS = [
  "Main Location",
  "Downtown",
  "North Location",
  "South Location",
  "East Side",
  "West Side",
  "Airport Route",
  "Farmers Market",
  "North County",
];

export default function AddLocationModal({ businessName, onAdd, onClose }: Props) {
  const [locationName, setLocationName] = useState("");
  const [address,      setAddress]      = useState("");
  const [error,        setError]        = useState<string | null>(null);
  const [submitted,    setSubmitted]    = useState(false);

  const handleSubmit = () => {
    const trimName    = locationName.trim();
    const trimAddress = address.trim();

    if (!trimName) {
      setError("Please enter a name for this location.");
      return;
    }
    if (!trimAddress) {
      setError("Please enter a ZIP code, city, or full address.");
      return;
    }

    setSubmitted(true);
    setError(null);

    const newLocation: BusinessLocation = {
      id:       makeId(),
      name:     trimName,
      location: trimAddress,
      checklist: [] as ChecklistItem[],
      completedForms:      undefined,
      chatHistory:         undefined,
      healthScore:         undefined,
      totalForms:          undefined,
      completedFormsCount: undefined,
      lastChecked:         new Date().toISOString(),
    };

    onAdd(newLocation);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit();
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Add Location</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">{businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4" onKeyDown={handleKeyDown}>

          {/* Location Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Location Name
              </span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={e => { setLocationName(e.target.value); setError(null); }}
              placeholder='e.g. "Downtown Route" or "North County Markets"'
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors placeholder:text-slate-400"
            />
            {/* Quick-fill suggestions */}
            <div className="flex flex-wrap gap-1 mt-2">
              {NAME_SUGGESTIONS.slice(0, 5).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setLocationName(s); setError(null); }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-500 border border-slate-200 hover:border-blue-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Address / Location
              </span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => { setAddress(e.target.value); setError(null); }}
              placeholder='ZIP code or "City, ST" (e.g. 33101 or Miami, FL)'
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors placeholder:text-slate-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Each location gets its own checklist, forms, and compliance health score.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Add Location
          </button>
        </div>
      </div>
    </div>
  );
}
