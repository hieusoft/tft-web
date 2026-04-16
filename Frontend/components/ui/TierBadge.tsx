import { TIER_TEXT } from "@/lib/constants";

interface TierBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export default function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-lg border border-white/10 bg-white/5 font-bold ${TIER_TEXT[tier] || "text-gray-400"}`}
    >
      {tier}
    </div>
  );
}

