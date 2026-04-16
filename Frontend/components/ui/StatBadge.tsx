interface StatBadgeProps {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}

export default function StatBadge({ label, value, suffix, highlight }: StatBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`text-sm font-semibold ${highlight ? "text-green-400" : "text-white"}`}
      >
        {value}
        {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
