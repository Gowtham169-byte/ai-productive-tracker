

import { GoogleGenAI } from '@google/genai';
import type { Session, GeminiInsight, TrackedApp, GeminiInsightResult, GroundingChunk } from '../types';

const formatSessionsForPrompt = (sessions: Session[], trackedApps: TrackedApp[]): string => {
    const appMap = new Map(trackedApps.map(app => [app.id, app.name]));

    return sessions
        .map(session => {
            const start = new Date(session.startTime).toISOString();
            const end = new Date(session.endTime).toISOString();
            const durationMinutes = Math.round((session.endTime - session.startTime) / 60000);
            const tags = session.tags && session.tags.length > 0 ? `Tags: [${session.tags.join(', ')}]` : 'Tags: None';
            const appName = session.appId ? `App: ${appMap.get(session.appId) || 'Unknown App'}` : 'App: None';
            const notes = session.notes ? `Notes: "${session.notes}"` : 'Notes: None';
            return `- Task: "${session.taskName}", Start: ${start}, End: ${end}, Duration: ${durationMinutes} minutes, ${tags}, ${appName}, ${notes}`;
        })
        .join('\n');
};

const formatAppGoalsForPrompt = (trackedApps: TrackedApp[]): string => {
    if (trackedApps.length === 0) {
        return "No specific app time goals have been set.";
    }
    return "Here are my daily time goals for specific apps:\n" + trackedApps
        .map(app => `- ${app.name}: ${app.dailyGoalMinutes} minutes per day`)
        .join('\n');
};

export const getProductivityInsights = async (sessions: Session[], trackedApps: TrackedApp[]): Promise<GeminiInsightResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const formattedSessions = formatSessionsForPrompt(sessions, trackedApps);
    const formattedAppGoals = formatAppGoalsForPrompt(trackedApps);

    const prompt = `
You are a friendly and encouraging productivity coach. I am providing you with a list of my recent work sessions (including my personal notes) and my daily time goals for specific applications. Please analyze them and provide a concise, actionable report.
Use your knowledge and search the web for the latest, most effective productivity strategies to inform your suggestions.

Here is my work session data:
${formattedSessions}

${formattedAppGoals}

Based on all this data (including my notes), provide a report as a JSON object inside a markdown code block. The JSON object should have the following properties:
- "summary": A brief, one-paragraph overview of my work habits, considering the distribution of time across tasks, tags, notes, AND my performance against app time goals.
- "peak_productivity": A single sentence identifying my most productive time of day or day of the week, based on when I start the most sessions.
- "suggestions": An array of 2-3 actionable, personalized tips to improve my productivity. These suggestions should be smart and consider my app usage and information from web search. For example, if I'm over my goal on "Social Media", suggest specific strategies to reduce it. If I'm under on "Learning", suggest ways to schedule that time.
- "motivation": A short, encouraging, and inspiring message.

Do not include any text outside of the JSON markdown block itself.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const responseText = response.text.trim();
    // Extract JSON from markdown block
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonRegex);
    
    if (!match || !match[1]) {
        console.error("Failed to find JSON in Gemini response:", responseText);
        throw new Error("The AI response was not in the expected format. Please try again.");
    }
    
    const jsonString = match[1];

    try {
        const parsedJson = JSON.parse(jsonString);
        // Basic validation
        if (parsedJson.summary && parsedJson.peak_productivity && Array.isArray(parsedJson.suggestions) && parsedJson.motivation) {
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
            return {
                insight: parsedJson as GeminiInsight,
                sources: sources.filter(s => s.web?.uri) // Filter out any empty chunks
            };
        } else {
             throw new Error('Parsed JSON does not match expected format.');
        }
    } catch (error) {
        console.error("Failed to parse Gemini response JSON:", jsonString, error);
        throw new Error("The AI response was not in the expected format. Please try again.");
    }
};