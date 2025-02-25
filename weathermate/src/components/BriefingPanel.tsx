import type { WeatherBriefing } from '../types/weather';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface BriefingPanelProps {
  briefing: WeatherBriefing;
}

export const BriefingPanel = ({ briefing }: BriefingPanelProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-[1.02]">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <LightBulbIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white ml-3">
            Weather Briefing
          </h3>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {briefing.text}
          </p>
        </div>

        {briefing.tips.length > 0 && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
              Tips for Today
            </h4>
            <ul className="space-y-3">
              {briefing.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-center text-blue-700 dark:text-blue-200"
                >
                  <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-3" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Last updated: {new Date(briefing.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}; 