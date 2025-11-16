import React, { useState, useEffect } from 'react';
import type { TrackedApp } from '../types';
import { PlusIcon, TrashIcon, XIcon } from './icons/Icons';

interface ManageAppsModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackedApps: TrackedApp[];
    onSave: (apps: TrackedApp[]) => void;
}

export const ManageAppsModal: React.FC<ManageAppsModalProps> = ({ isOpen, onClose, trackedApps, onSave }) => {
    const [localApps, setLocalApps] = useState<TrackedApp[]>([]);
    const [newAppName, setNewAppName] = useState('');
    const [newAppGoal, setNewAppGoal] = useState<number>(60);

    useEffect(() => {
        if (isOpen) {
            setLocalApps(trackedApps);
        }
    }, [isOpen, trackedApps]);

    if (!isOpen) {
        return null;
    }

    const handleAddApp = () => {
        if (newAppName.trim()) {
            const newApp: TrackedApp = {
                id: `app-${Date.now()}`,
                name: newAppName.trim(),
                dailyGoalMinutes: newAppGoal,
            };
            setLocalApps([...localApps, newApp]);
            setNewAppName('');
            setNewAppGoal(60);
        }
    };
    
    const handleDeleteApp = (appId: string) => {
        setLocalApps(localApps.filter(app => app.id !== appId));
    };

    const handleSave = () => {
        onSave(localApps);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Manage Tracked Apps</h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="space-y-4 mb-6">
                        {localApps.map(app => (
                            <div key={app.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold">{app.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Goal: {app.dailyGoalMinutes} min/day</p>
                                </div>
                                <button onClick={() => handleDeleteApp(app.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                         <h3 className="text-lg font-semibold">Add New App</h3>
                         <input
                            type="text"
                            value={newAppName}
                            onChange={(e) => setNewAppName(e.target.value)}
                            placeholder="App or Website Name (e.g., Figma)"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex items-center gap-4">
                            <label htmlFor="goal" className="text-sm font-medium">Daily Goal:</label>
                            <input
                                id="goal"
                                type="number"
                                value={newAppGoal}
                                onChange={(e) => setNewAppGoal(parseInt(e.target.value, 10) || 0)}
                                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                min="0"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">minutes</span>
                        </div>
                        <button
                            onClick={handleAddApp}
                            disabled={!newAppName.trim()}
                            className="w-full flex items-center justify-center py-2 px-4 font-semibold rounded-lg transition-colors duration-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add App
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};