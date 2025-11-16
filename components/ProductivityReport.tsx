

import React from 'react';
import type { Session, GeminiInsightResult, TrackedApp } from '../types';
import { calculateTotalWorkTime, calculateAverageSessionLength, findPeakProductivityHours, getChartData, getChartDataByTag } from '../services/productivityService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppUsageReport } from './AppUsageReport';
import { LinkIcon } from './icons/Icons';

interface ProductivityReportProps {
    sessions: Session[];
    insights: GeminiInsightResult | null;
    trackedApps: TrackedApp[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

export const ProductivityReport: React.FC<ProductivityReportProps> = ({ sessions, insights, trackedApps }) => {
    if (sessions.length === 0 && !insights) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Your productivity report will be generated here.</p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Complete a work session to see your stats.</p>
            </div>
        );
    }
    
    const totalTime = calculateTotalWorkTime(sessions);
    const avgSession = calculateAverageSessionLength(sessions);
    const peakHours = findPeakProductivityHours(sessions);
    const taskChartData = getChartData(sessions);
    const tagChartData = getChartDataByTag(sessions);
    const totalSessions = sessions.length;
    
    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#64748b'];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
              <p className="label font-bold">{`${label}`}</p>
              <p className="intro text-primary-500">{`Total time: ${payload[0].value} mins`}</p>
            </div>
          );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {insights ? (
                <>
                    <div className="bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500 p-6 rounded-lg space-y-4">
                        <h3 className="text-xl font-bold text-primary-800 dark:text-primary-200">AI-Powered Insights</h3>
                        <div>
                            <h4 className="font-semibold">Summary</h4>
                            <p className="text-gray-600 dark:text-gray-300">{insights.insight.summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Peak Productivity</h4>
                            <p className="text-gray-600 dark:text-gray-300">{insights.insight.peak_productivity}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Suggestions</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                                {insights.insight.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                         <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
                            <p className="text-lg italic text-center text-primary-700 dark:text-primary-300">"{insights.insight.motivation}"</p>
                        </div>
                    </div>

                    {insights.sources && insights.sources.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                            <h4 className="font-semibold flex items-center text-gray-700 dark:text-gray-300 text-sm">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Sources for AI Suggestions
                            </h4>
                            <ul className="list-decimal list-inside mt-2 space-y-1 text-sm pl-2">
                                {insights.sources.map((source, index) => (
                                    <li key={index}>
                                        <a 
                                            href={source.web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary-600 dark:text-primary-400 hover:underline"
                                            title={source.web.uri}
                                        >
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Total Work Time" value={`${totalTime.hours}h ${totalTime.minutes}m ${totalTime.seconds}s`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title="Total Sessions" value={totalSessions.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
                    <StatCard title="Avg. Session" value={avgSession} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                    <StatCard title="Peak Hours" value={peakHours} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                </div>
            )}
            
            {trackedApps.length > 0 && sessions.some(s => s.appId) && (
                <div className="mt-8">
                     <AppUsageReport sessions={sessions} trackedApps={trackedApps} />
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                {taskChartData.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold mb-4">Work Distribution by Task</h3>
                        <div className="w-full h-72">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={taskChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)' }} />
                                    <YAxis unit=" min" tick={{ fill: 'rgb(107 114 128)' }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}/>
                                    <Legend />
                                    <Bar dataKey="duration" fill="#3b82f6" name="Total minutes" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {tagChartData.length > 0 && (
                     <div>
                        <h3 className="text-lg font-bold mb-4">Work Distribution by Tag</h3>
                        <div className="w-full h-72">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={tagChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                            return percent > 0.05 ? (
                                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                                    {`${(percent * 100).toFixed(0)}%`}
                                                </text>
                                            ) : null;
                                        }}
                                    >
                                        {tagChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [`${value} min`, name]}/>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};