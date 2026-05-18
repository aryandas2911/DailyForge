export default function AchievementBadge({ achievement }) {
    return (
      <div className="bg-white/80 rounded-xl shadow-md p-4 border border-soft hover-lift">
        <div className="flex items-center gap-4">
          <div className="text-3xl">
            {achievement.icon}
          </div>
          <div>
            <h3 className="font-semibold text-main">
              {achievement.title}
            </h3>
            <p className="text-sm text-muted">
              {achievement.description}
            </p>
          </div>
        </div>
      </div>
    );
  }