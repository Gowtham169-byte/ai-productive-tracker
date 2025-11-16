import React from 'react';
import type { Session, TrackedApp } from '../types';
import { calculateAppUsage, AppUsageData } from '../services/productivityService';
import { AppWindowIcon } from './icons/Icons';

interface AppUsageReportProps {
    sessions: Session[];
    trackedApps: TrackedApp[];
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    const colorClass = progress >= 100 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-primary-500';

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
        </div>
    );
};

export const AppUsageReport: React.FC<AppUsageReportProps> = ({ sessions, trackedApps }) => {
    const appUsageData = calculateAppUsage(sessions, trackedApps);

    if (appUsageData.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center">
                <AppWindowIcon className="h-5 w-5 mr-2 text-primary-500" />
                App Time Allocation (Today)
            </h3>
            <div className="space-y-4">
                {appUsageData.map(({ app, totalMinutes, progress }) => (
                    <div key={app.id}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-semibold">{app.name}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                                {totalMinutes} / <span className="font-medium">{app.dailyGoalMinutes} min</span>
                            </span>
                        </div>
                        <ProgressBar progress={progress} />
                    </div>
                ))}
            </div>
        </div>
    );
};