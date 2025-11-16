import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, StopIcon, PlusIcon, XCircleIcon } from './icons/Icons';
import type { TrackedApp } from '../types';

interface TimerProps {
    onSessionComplete: (taskName: string, startTime: number, endTime: number, tags: string[], appId?: string, notes?: string) => void;
    allTags: string[];
    onAddNewTag: (tag: string) => void;
    trackedApps: TrackedApp[];
}

const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export const Timer: React.FC<TimerProps> = ({ onSessionComplete, allTags, onAddNewTag, trackedApps }) => {
    const [taskName, setTaskName] = useState('');
    const [notes, setNotes] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentTags, setCurrentTags] = useState<string[]>([]);
    const [selectedAppId, setSelectedAppId] = useState<string>('');
    const [newTagInput, setNewTagInput] = useState('');
    const startTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            startTimeRef.current = Date.now() - (elapsedTime * 1000);
            intervalRef.current = window.setInterval(() => {
                if(startTimeRef.current) {
                    setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, elapsedTime]);

    const handleToggleTimer = () => {
        if (isActive) {
            // Stopping timer
            setIsActive(false);
            if (startTimeRef.current) {
                onSessionComplete(taskName || 'Untitled Task', startTimeRef.current, Date.now(), currentTags, selectedAppId || undefined, notes.trim() || undefined);
            }
            setElapsedTime(0);
            setTaskName('');
            setNotes('');
            setCurrentTags([]);
            setSelectedAppId('');
        } else {
            // Starting timer
            setIsActive(true);
            setElapsedTime(0);
        }
    };
    
    const handleAddTag = (tag: string) => {
        if (tag && !currentTags.includes(tag)) {
            setCurrentTags([...currentTags, tag]);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
    };
    
    const handleCreateNewTag = () => {
        const trimmedTag = newTagInput.trim();
        if (trimmedTag) {
            onAddNewTag(trimmedTag);
            handleAddTag(trimmedTag);
            setNewTagInput('');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Start a New Session</h2>
            <div className="space-y-4">
                <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isActive}
                />

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this session... (optional)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    rows={2}
                    disabled={isActive}
                />

                {trackedApps.length > 0 && (
                     <select
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={isActive}
                     >
                        <option value="">No specific app</option>
                        {trackedApps.map(app => (
                            <option key={app.id} value={app.id}>{app.name}</option>
                        ))}
                    </select>
                )}
                
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                    <div className="flex flex-wrap gap-2 min-h-[34px]">
                        {currentTags.map(tag => (
                            <span key={tag} className="flex items-center bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 -mr-1 text-primary-500 hover:text-primary-700" aria-label={`Remove ${tag} tag`}>
                                    <XCircleIcon className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>

                     <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateNewTag()}
                            placeholder="Add new tag"
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                            disabled={isActive}
                        />
                        <button onClick={handleCreateNewTag} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50" disabled={isActive || !newTagInput.trim()}>
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {allTags.filter(t => !currentTags.includes(t)).map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => handleAddTag(tag)}
                                disabled={isActive}
                                className="px-2.5 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-full transition-colors disabled:opacity-50"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center bg-gray-100 dark:bg-gray-700 rounded-lg py-4">
                    <p className="text-5xl font-mono font-bold tracking-widest">{formatTime(elapsedTime)}</p>
                </div>
                <button
                    onClick={handleToggleTimer}
                    disabled={!taskName.trim() && !isActive}
                    className={`w-full flex items-center justify-center py-3 px-4 font-bold rounded-lg transition-colors duration-300 text-white ${
                        isActive 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-primary-600 hover:bg-primary-700'
                    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                    {isActive ? (
                        <>
                            <StopIcon className="h-6 w-6 mr-2" />
                            <span>Stop Session</span>
                        </>
                    ) : (
                        <>
                            <PlayIcon className="h-6 w-6 mr-2" />
                            <span>Start Session</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};