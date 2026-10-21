// Shared Tailwind class strings so every page uses the same buttons, fields and cards.

const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] focus-visible:ring-offset-2";
const btn =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-50 " + focusRing;

export const btnPrimary = `${btn} bg-[#2943ca] text-white hover:bg-[#2339b0]`;
export const btnSecondary = `${btn} border border-[#dbdee5] bg-white text-slate-900 hover:bg-slate-50`;
export const btnDanger = `${btn} border border-red-200 bg-white text-red-800 hover:bg-red-50`;
export const btnDangerSolid = `${btn} bg-red-700 text-white hover:bg-red-800`;

export const fieldLabel = "block text-sm font-medium text-slate-900";
export const fieldInput =
  "h-10 w-full rounded-lg border border-black/15 bg-white px-3 text-sm text-slate-900 placeholder:text-gray-500 " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca] disabled:cursor-not-allowed disabled:opacity-50";
export const fieldTextarea = fieldInput.replace("h-10", "min-h-24 py-2");
export const fieldInvalid = "border-red-500 ring-1 ring-red-500";
export const fieldErrorText = "text-xs font-medium text-red-600";

export const card = "rounded-xl border border-[#dbdee5] bg-white";
export const badge = "inline-flex items-center rounded-full border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700";
export const badgeDanger = "inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800";
