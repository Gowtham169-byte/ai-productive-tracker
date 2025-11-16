import React, { useState } from 'react';
import type { Session, TrackedApp } from '../types';
import { TrashIcon, ClockIcon, TagIcon, AppWindowIcon, DocumentTextIcon } from './icons/Icons';

interface SessionListProps {
    sessions: Session[];
    onDeleteSession: (sessionId: string) => void;
    onClearSessions: () => void;
    allTags: string[];
    trackedApps: TrackedApp[];
}

const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
};

const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
};

export const SessionList: React.FC<SessionListProps> = ({ sessions, onDeleteSession, onClearSessions, allTags, trackedApps }) => {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);

    const filteredSessions = selectedTag
        ? sortedSessions.filter(session => session.tags && session.tags.includes(selectedTag))
        : sortedSessions;
    
    const getAppName = (appId?: string): string | null => {
        if (!appId) return null;
        const app = trackedApps.find(app => app.id === appId);
        return app ? app.name : null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Session History</h2>
                {sessions.length > 0 && (
                    <button onClick={onClearSessions} className="text-sm text-red-500 hover:text-red-700 font-semibold">Clear All</button>
                )}
            </div>

            {allTags.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Filter by Tag:</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                selectedTag === null
                                    ? 'bg-primary-600 text-white font-semibold'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                    selectedTag === tag
                                        ? 'bg-primary-600 text-white font-semibold'
                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map(session => {
                        const appName = getAppName(session.appId);
                        return (
                            <div key={session.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-start justify-between">
                                <div className="flex-grow">
                                    <p className="font-semibold">{session.taskName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(session.startTime)}</p>
                                    
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 my-1.5">
                                        <p className="text-sm font-medium">
                                            <ClockIcon className="h-4 w-4 inline-block mr-1 align-text-bottom" />
                                            {formatDuration(session.endTime - session.startTime)}
                                        </p>
                                        {appName && (
                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-300">
                                                <AppWindowIcon className="h-4 w-4 inline-block mr-1 align-text-bottom" />
                                                {appName}
                                            </p>
                                        )}
                                    </div>

                                    {session.tags && session.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {session.tags.map(tag => (
                                                <span key={tag} className="flex items-center text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 font-medium px-2 py-0.5 rounded-md">
                                                    <TagIcon className="h-3 w-3 mr-1" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {session.notes && (
                                        <div className="mt-2 flex items-start text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                            <DocumentTextIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                                            <p className="whitespace-pre-wrap">{session.notes}</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => onDeleteSession(session.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors flex-shrink-0 ml-2"
                                    aria-label="Delete session"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">{selectedTag ? `No sessions found with the tag "${selectedTag}".` : 'Your completed sessions will appear here.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};