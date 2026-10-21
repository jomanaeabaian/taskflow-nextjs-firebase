import { CircleCheck as CircleCheckIcon, CircleDot as CircleDotIcon, ListChecks as ListChecksIcon, TriangleAlert as TriangleAlertIcon } from "lucide-react";

const TONES = {
  slate: "bg-slate-100 text-slate-800",
  blue: "bg-blue-50 text-blue-900",
  emerald: "bg-emerald-50 text-emerald-900",
  red: "bg-red-50 text-red-900",
};

function StatCard({ icon: Icon, tone, label, value, loading }) {
  return (
    <li className="rounded-xl border border-[#dbdee5] bg-white p-4">
      <span className={`grid size-9 place-items-center rounded-lg ${TONES[tone]}`}>
        <Icon className="size-5" />
      </span>
      <p className="mt-3 flex h-8 items-center text-2xl font-bold leading-8 text-slate-900">
        {loading ? <span className="inline-block h-6 w-10 animate-pulse rounded bg-slate-200" aria-hidden="true" /> : value}
        {loading && <span className="sr-only">Loading</span>}
      </p>
      <p className="text-sm text-gray-600">{label}</p>
    </li>
  );
}

export function DashboardStats({ stats, loading }) {
  return (
    <ul aria-label="Task summary" className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard icon={ListChecksIcon} tone="slate" label="Open tasks" value={stats.open} loading={loading} />
      <StatCard icon={CircleDotIcon} tone="blue" label="In progress" value={stats.inProgress} loading={loading} />
      <StatCard icon={CircleCheckIcon} tone="emerald" label="Completed" value={stats.completed} loading={loading} />
      <StatCard icon={TriangleAlertIcon} tone="red" label="Overdue" value={stats.overdue} loading={loading} />
    </ul>
  );
}
