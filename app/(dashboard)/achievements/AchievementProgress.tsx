import Link from "next/link";
import { Award, BadgeCheck, Target } from "lucide-react";

type LevelProgress = { level: string; earned: number; total: number };
type ProgressData = {
  certificationsByLevel: LevelProgress[];
  badgeProgress: { earned: number; total: number };
  milestoneCount: number;
};

export default function AchievementProgress({ progress }: { progress: ProgressData }) {
  const { certificationsByLevel, badgeProgress, milestoneCount } = progress;

  return (
    <div className="card-bg p-5 rounded-xl mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">Progress by type</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Certifications by level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-amber-400" />
            <span className="font-medium text-slate-200">Certifications</span>
          </div>
          {certificationsByLevel.length > 0 ? (
            <ul className="space-y-2">
              {certificationsByLevel.map(({ level, earned, total }) => (
                <li key={level} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{level || "Other"}</span>
                  <span className="text-slate-200">
                    {earned}/{total}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No catalog certifications</p>
          )}
        </div>

        {/* Badges */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck size={18} className="text-blue-400" />
            <span className="font-medium text-slate-200">Badges</span>
          </div>
          <p className="text-sm text-slate-200">
            {badgeProgress.earned}/{badgeProgress.total} earned
          </p>
          {badgeProgress.total > 0 && (
            <div className="mt-2 h-2 rounded-full overflow-hidden bg-slate-700">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(100, (badgeProgress.earned / badgeProgress.total) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-emerald-400" />
            <span className="font-medium text-slate-200">Milestones</span>
          </div>
          <p className="text-sm text-slate-200">{milestoneCount} earned</p>
        </div>
      </div>
      <div className="mt-4 pt-4 flex gap-4 border-t" style={{ borderColor: "var(--border-dark)" }}>
        <Link href="/certifications" className="text-sm text-slate-400 hover:text-white transition-colors">
          Certifications →
        </Link>
        <Link href="/badges" className="text-sm text-slate-400 hover:text-white transition-colors">
          Badges →
        </Link>
      </div>
    </div>
  );
}
