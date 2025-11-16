
import type { Session, TrackedApp } from '../types';

export const calculateTotalWorkTime = (sessions: Session[]): { hours: number; minutes: number; seconds: number } => {
    const totalMs = sessions.reduce((acc, session) => acc + (session.endTime - session.startTime), 0);
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
};

export const calculateAverageSessionLength = (sessions: Session[]): string => {
    if (sessions.length === 0) return '0m 0s';
    const totalMs = sessions.reduce((acc, session) => acc + (session.endTime - session.startTime), 0);
    const avgMs = totalMs / sessions.length;
    const totalSeconds = Math.floor(avgMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

export const findPeakProductivityHours = (sessions: Session[]): string => {
    if (sessions.length === 0) return 'N/A';

    const hoursCount: { [hour: number]: number } = {};
    sessions.forEach(session => {
        const startHour = new Date(session.startTime).getHours();
        hoursCount[startHour] = (hoursCount[startHour] || 0) + 1;
    });

    if (Object.keys(hoursCount).length === 0) {
        return 'N/A';
    }

    const peakHour = Object.keys(hoursCount).reduce((a, b) => hoursCount[parseInt(a)] > hoursCount[parseInt(b)] ? a : b);
    
    const hour = parseInt(peakHour);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
};

export const getChartData = (sessions: Session[]): { name: string, duration: number }[] => {
    const taskDurations: { [taskName: string]: number } = {};

    sessions.forEach(session => {
        const durationMinutes = Math.round((session.endTime - session.startTime) / (1000 * 60));
        taskDurations[session.taskName] = (taskDurations[session.taskName] || 0) + durationMinutes;
    });

    return Object.entries(taskDurations)
        .map(([name, duration]) => ({ name, duration }))
        .sort((a,b) => b.duration - a.duration);
};

export const getChartDataByTag = (sessions: Session[]): { name: string, value: number }[] => {
    const tagDurations: { [tagName: string]: number } = {};

    sessions.forEach(session => {
        if (session.tags && session.tags.length > 0) {
            const durationMinutes = Math.round((session.endTime - session.startTime) / (1000 * 60));
            session.tags.forEach(tag => {
                tagDurations[tag] = (tagDurations[tag] || 0) + durationMinutes;
            });
        }
    });

    return Object.entries(tagDurations)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);
};

export interface AppUsageData {
    app: TrackedApp;
    totalMinutes: number;
    progress: number;
}

export const calculateAppUsage = (sessions: Session[], trackedApps: TrackedApp[]): AppUsageData[] => {
    const appUsage: { [appId: string]: number } = {};

    sessions.forEach(session => {
        if (session.appId) {
            const durationMinutes = (session.endTime - session.startTime) / (1000 * 60);
            appUsage[session.appId] = (appUsage[session.appId] || 0) + durationMinutes;
        }
    });

    return trackedApps.map(app => {
        const totalMinutes = Math.round(appUsage[app.id] || 0);
        const progress = app.dailyGoalMinutes > 0 ? Math.min((totalMinutes / app.dailyGoalMinutes) * 100, 100) : 0;
        return {
            app,
            totalMinutes,
            progress,
        };
    }).sort((a, b) => b.totalMinutes - a.totalMinutes);
};
