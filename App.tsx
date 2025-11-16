
import React, { useState, useEffect, useCallback } from 'react';
import type { Session, GeminiInsightResult, TrackedApp } from './types';
import { Timer } from './components/Timer';
import { SessionList } from './components/SessionList';
import { ProductivityReport } from './components/ProductivityReport';
import { getProductivityInsights } from './services/geminiService';
import { DNA } from 'react-loader-spinner';
import { ManageAppsModal } from './components/ManageAppsModal';
import { AppWindowIcon } from './components/icons/Icons';

const App: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
    const [insights, setInsights] = useState<GeminiInsightResult | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
    const [isAppsModalOpen, setIsAppsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedSessions = localStorage.getItem('workSessions');
            if (storedSessions) setSessions(JSON.parse(storedSessions));
            
            const storedTags = localStorage.getItem('allTags');
            if (storedTags) setAllTags(JSON.parse(storedTags));

            const storedApps = localStorage.getItem('trackedApps');
            if (storedApps) setTrackedApps(JSON.parse(storedApps));

        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('workSessions', JSON.stringify(sessions));
        } catch (error) {
            console.error("Failed to save sessions to localStorage", error);
        }
    }, [sessions]);

    useEffect(() => {
        try {
            localStorage.setItem('allTags', JSON.stringify(allTags));
        } catch (error) {
            console.error("Failed to save tags to localStorage", error);
        }
    }, [allTags]);
    
    useEffect(() => {
        try {
            localStorage.setItem('trackedApps', JSON.stringify(trackedApps));
        } catch (error) {
            console.error("Failed to save tracked apps to localStorage", error);
        }
    }, [trackedApps]);

    const handleSessionComplete = (taskName: string, startTime: number, endTime: number, tags: string[], appId?: string, notes?: string) => {
        const newSession: Session = {
            id: `session-${Date.now()}`,
            taskName,
            startTime,
            endTime,
            tags,
            appId,
            notes,
        };
        setSessions(prevSessions => [...prevSessions, newSession]);
    };

    const handleAddNewTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !allTags.includes(trimmedTag)) {
            setAllTags(prevTags => [...prevTags, trimmedTag].sort());
        }
    };
    
    const handleSaveTrackedApps = (updatedApps: TrackedApp[]) => {
        setTrackedApps(updatedApps);
    };

    const handleDeleteSession = (sessionId: string) => {
        setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    };

    const handleClearSessions = () => {
        setSessions([]);
        setInsights(null);
    };

    const handleGetInsights = useCallback(async () => {
        if (sessions.length === 0) {
            setError("No sessions available to analyze. Please complete a work session first.");
            return;
        }
        setIsLoadingInsights(true);
        setError(null);
        setInsights(null);
        try {
            const result = await getProductivityInsights(sessions, trackedApps);
            setInsights(result);
        } catch (e) {
            console.error(e);
            setError("Failed to get productivity insights. Please try again.");
        } finally {
            setIsLoadingInsights(false);
        }
    }, [sessions, trackedApps]);

    const InsightsLoader: React.FC = () => (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
            <DNA
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
            />
            <p className="mt-4 text-lg font-semibold text-primary-500 animate-pulse">
                Analyzing your productivity...
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Our AI is crunching the numbers and searching the web to provide you with personalized insights.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <header className="bg-primary-600 shadow-md">
                <div className="container mx-auto px-4 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Productivity Time Tracker</h1>
                        <p className="text-primary-200 mt-1">Monitor, Analyze, and Boost Your Productivity.</p>
                    </div>
                    <button 
                        onClick={() => setIsAppsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-white/20 text-white font-semibold rounded-lg shadow-md hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-opacity-75 transition-colors duration-300"
                    >
                        <AppWindowIcon className="h-5 w-5 mr-2" />
                        Manage Apps
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <Timer 
                            onSessionComplete={handleSessionComplete} 
                            allTags={allTags}
                            onAddNewTag={handleAddNewTag}
                            trackedApps={trackedApps}
                        />
                        <SessionList 
                            sessions={sessions} 
                            onDeleteSession={handleDeleteSession} 
                            onClearSessions={handleClearSessions}
                            allTags={allTags}
                            trackedApps={trackedApps}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Productivity Report</h2>
                                <button
                                    onClick={handleGetInsights}
                                    disabled={isLoadingInsights || sessions.length === 0}
                                    className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                                >
                                    Get AI Insights
                                </button>
                            </div>
                            {error && <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded-lg">{error}</div>}
                            
                            {isLoadingInsights ? (
                                <InsightsLoader />
                            ) : (
                                <ProductivityReport sessions={sessions} insights={insights} trackedApps={trackedApps} />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {isAppsModalOpen && (
                <ManageAppsModal 
                    isOpen={isAppsModalOpen}
                    onClose={() => setIsAppsModalOpen(false)}
                    trackedApps={trackedApps}
                    onSave={handleSaveTrackedApps}
                />
            )}
        </div>
    );
};

export default App;