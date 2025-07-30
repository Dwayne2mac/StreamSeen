import { MovieRecommendation, SearchResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || process.env.API_KEY;

if (!API_KEY) {
    console.warn("Gemini API key not found in environment variables");
}

export const getMovieRecommendation = async (
    genre: string,
    mood: string,
    platforms: string[],
    excludedTitles: string[] = [],
    contentType: 'Movie' | 'TV Show',
    seriesStatus: 'Any' | 'Completed'
): Promise<MovieRecommendation> => {
    // This function is now handled by the backend API
    // We'll call the backend instead of directly calling Gemini
    throw new Error("This function should not be called directly. Use the backend API instead.");
};

export const findStreamingServices = async (query: string): Promise<SearchResult> => {
    // This function is now handled by the backend API
    // We'll call the backend instead of directly calling Gemini
    throw new Error("This function should not be called directly. Use the backend API instead.");
};

export const getStructuredInfoForTitle = async (title: string): Promise<Omit<MovieRecommendation, 'streamingService' | 'reason'>> => {
    // This function is now handled by the backend API
    // We'll call the backend instead of directly calling Gemini
    throw new Error("This function should not be called directly. Use the backend API instead.");
};
