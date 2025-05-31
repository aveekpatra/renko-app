interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: "purple" | "blue" | "green";
  trend: string;
  isDarkMode: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  color,
  trend,
  isDarkMode,
}: StatCardProps) {
  const colorClasses = {
    purple:
      "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/40",
    blue: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40",
    green:
      "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/40",
  };

  return (
    <div
      className={`backdrop-blur-md rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        isDarkMode
          ? "bg-gray-800/80 border-gray-700/60 shadow-black/20 hover:shadow-black/30 hover:bg-gray-800/90"
          : "bg-white/80 border-white/60 shadow-gray-900/10 hover:shadow-gray-900/15 hover:bg-white/90"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4
            className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            {title}
          </h4>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              {value}
            </span>
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-full shadow-sm border ${
                isDarkMode
                  ? "text-green-400 bg-green-900/50 border-green-800/60"
                  : "text-green-700 bg-green-100/90 border-green-200/60"
              }`}
            >
              {trend}
            </span>
          </div>
          <p
            className={`text-sm font-medium mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {subtitle}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl ${colorClasses[color]} hover:scale-105 transition-transform duration-200`}
        >
          <div className="w-6 h-6"></div>
        </div>
      </div>
    </div>
  );
}
 