const COST_BORDERS: Record<number, string> = {
  1: "ring-gray-500",
  2: "ring-green-500",
  3: "ring-blue-500",
  4: "ring-purple-500",
  5: "ring-yellow-400",
};

const COST_BG: Record<number, string> = {
  1: "bg-gray-700",
  2: "bg-green-900",
  3: "bg-blue-900",
  4: "bg-purple-900",
  5: "bg-yellow-900",
};

interface Champion {
  name: string;
  cost: number;
  imageUrl: string;
}

interface ChampionCircleProps {
  champion: Champion;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-7 w-7 text-[8px]",
  md: "h-9 w-9 text-[9px]",
  lg: "h-12 w-12 text-xs",
};

export default function ChampionCircle({ champion, size = "md" }: ChampionCircleProps) {
  return (
    <div
      title={champion.name}
      className={`${sizeMap[size]} relative flex items-center justify-center rounded-full ring-2 ${COST_BORDERS[champion.cost] || "ring-gray-500"} ${COST_BG[champion.cost] || "bg-gray-700"} overflow-hidden`}
    >
      {/* Champion initials as fallback */}
      <span className="font-bold text-white opacity-80">
        {champion.name.substring(0, 2).toUpperCase()}
      </span>
    </div>
  );
}
