import Link from "next/link";
import TierBadge from "./TierBadge";
import StatBadge from "./StatBadge";
import ChampionCircle from "./ChampionCircle";

interface Champion {
  name: string;
  cost: number;
  imageUrl: string;
}

interface CompCardProps {
  id: string;
  name: string;
  tier: string;
  avgPlacement: number;
  top4Rate: number;
  winRate: number;
  playRate: number;
  traits: string[];
  champions: Champion[];
}

export default function CompCard({
  id,
  name,
  tier,
  avgPlacement,
  top4Rate,
  winRate,
  playRate,
  traits,
  champions,
}: CompCardProps) {
  return (
    <Link
      href={`/comps/${id}`}
      className="group relative flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-blue-500/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-blue-500/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TierBadge tier={tier} size="md" />
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {traits.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-400"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <svg
          className="h-4 w-4 text-gray-600 transition-all duration-200 group-hover:text-blue-400 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Champions */}
      <div className="flex flex-wrap gap-1.5">
        {champions.map((champ) => (
          <ChampionCircle key={champ.name} champion={champ} />
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
        <StatBadge label="Avg Place" value={avgPlacement.toFixed(2)} />
        <div className="h-4 w-px bg-white/10" />
        <StatBadge label="Top 4" value={top4Rate.toFixed(1)} suffix="%" highlight />
        <div className="h-4 w-px bg-white/10" />
        <StatBadge label="Win Rate" value={winRate.toFixed(1)} suffix="%" />
        <div className="h-4 w-px bg-white/10" />
        <StatBadge label="Play Rate" value={playRate.toFixed(1)} suffix="%" />
      </div>
    </Link>
  );
}
