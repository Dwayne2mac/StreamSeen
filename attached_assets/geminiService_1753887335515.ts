

import { GoogleGenAI, Type, GenerateContentResponse, GroundingChunk } from "@google/genai";
import { MovieRecommendation, SearchResult, GroundingSource, FriendGeneratedLists } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The title of the movie or TV show.' },
        year: { type: Type.INTEGER, description: 'The year the movie or TV show was released.' },
        summary: { type: Type.STRING, description: 'A concise plot summary.' },
        genre: { type: Type.STRING, description: 'The primary genre of the movie or TV show.' },
        streamingService: { type: Type.STRING, description: 'The streaming service where this content is available.' },
        reason: { type: Type.STRING, description: "A brief, compelling reason why this is a great watch based on the user's criteria." },
        contentType: { type: Type.STRING, description: "The type of content, either 'Movie' or 'TV Show', corresponding to the user's request." },
        franchiseMovies: {
            type: Type.ARRAY,
            description: "A list of other essential movies in the same franchise, if the recommendation is a movie and part of a series.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the franchise movie." },
                    year: { type: Type.INTEGER, description: "The release year of the franchise movie." },
                },
                required: ["title", "year"]
            }
        },
    },
    required: ["title", "year", "summary", "genre", "streamingService", "reason", "contentType"]
};

const friendGeneratedListsSchema = {
    type: Type.OBJECT,
    properties: {
        watchlist: {
            type: Type.ARRAY,
            description: "A list of movies and TV shows the friend wants to watch.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the movie or TV show." },
                    year: { type: Type.INTEGER, description: "The release year." },
                    contentType: { type: Type.STRING, enum: ['Movie', 'TV Show'], description: "The content type." },
                    genre: { type: Type.STRING, description: 'The primary genre of the item.' },
                    summary: { type: Type.STRING, description: "A concise plot summary." },
                    reason: { type: Type.STRING, description: "A short, fun, one-sentence reason why the friend has this on their list." },
                },
                required: ["title", "year", "contentType", "genre", "summary", "reason"]
            }
        },
        watchedList: {
            type: Type.ARRAY,
            description: "A list of movies and TV shows the friend has already watched.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the movie or TV show." },
                    year: { type: Type.INTEGER, description: "The release year." },
                    contentType: { type: Type.STRING, enum: ['Movie', 'TV Show'], description: "The content type." },
                    genre: { type: Type.STRING, description: 'The primary genre of the item.' },
                    summary: { type: Type.STRING, description: "A concise plot summary." },
                    reason: { type: Type.STRING, description: "A short, fun, one-sentence reason why the friend might have watched this." },
                    rating: { type: Type.INTEGER, description: "A plausible star rating from 1 to 5 that the friend might have given." }
                },
                required: ["title", "year", "contentType", "genre", "summary", "reason", "rating"]
            }
        },
    },
    required: ["watchlist", "watchedList"]
};

const structuredInfoSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The official title of the movie or TV show.' },
        year: { type: Type.INTEGER, description: 'The year the movie or TV show was released.' },
        summary: { type: Type.STRING, description: 'A concise plot summary.' },
        genre: { type: Type.STRING, description: 'The primary genre of the movie or TV show.' },
        contentType: { type: Type.STRING, description: "The type of content, either 'Movie' or 'TV Show'." },
        franchiseMovies: {
            type: Type.ARRAY,
            description: "A list of other essential movies in the same franchise, if the title is a movie and part of a series.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the franchise movie." },
                    year: { type: Type.INTEGER, description: "The release year of the franchise movie." },
                },
                required: ["title", "year"]
            }
        },
    },
    required: ["title", "year", "summary", "genre", "contentType"]
};

export const getStructuredInfoForTitle = async (title: string): Promise<Omit<MovieRecommendation, 'streamingService' | 'reason'>> => {
    const prompt = `Provide structured information for the following movie or TV show title: "${title}". Ensure the title, year, and genre are accurate. If it's a TV show, provide the start year. If the title is a movie and part of a larger film franchise, also populate the 'franchiseMovies' field with a list of other key movies in the series. If it's a standalone film or a TV show, this field can be omitted.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: structuredInfoSchema,
                systemInstruction: "You are a media information service. Your goal is to return accurate, structured data for a given movie or TV show title in JSON format according to the provided schema.",
            }
        });

        const text = response.text;
        return JSON.parse(text) as Omit<MovieRecommendation, 'streamingService' | 'reason'>;
    } catch (error) {
        console.error(`Error getting structured info for "${title}":`, error);
        throw new Error(`Failed to get details for "${title}". The title might be ambiguous or not found.`);
    }
}


export const getMovieRecommendation = async (
    genre: string,
    mood: string,
    platforms: string[],
    excludedTitles: string[] = [],
    contentType: 'Movie' | 'TV Show',
    seriesStatus: 'Any' | 'Completed'
): Promise<MovieRecommendation> => {
    let prompt = `Based on the following criteria, recommend exactly ONE ${contentType === 'Movie' ? 'movie' : 'TV show'}. The user is in the UK, so recommendations must be available on streaming services in the United Kingdom.`;
    
    if (platforms.length > 0) {
        prompt += ` Available on one of the following streaming services: ${platforms.join(', ')}.`;
    }

    if (genre !== 'Any') {
        prompt += ` Genre: ${genre}.`;
    }
    if (mood !== 'Any') {
        prompt += ` Mood: ${mood}.`;
    }

    if (contentType === 'TV Show' && seriesStatus === 'Completed') {
        prompt += ` The TV show must be fully completed with a conclusive ending. Do not recommend shows that were cancelled prematurely or left on a cliffhanger. It should be a bingeable, finished story.`;
    }

    if (excludedTitles.length > 0) {
        const uniqueTitles = [...new Set(excludedTitles)];
        prompt += ` Do not recommend any of the following titles as I have already watched them or they are on my watchlist: ${uniqueTitles.join(', ')}.`;
    }
    
    prompt += ` Ensure the 'contentType' field in the JSON response is correctly set to '${contentType}'. Provide the most accurate primary genre for the content in the 'genre' field.`;

    if (contentType === 'Movie') {
        prompt += ` If the recommended movie is part of a larger film franchise, also populate the 'franchiseMovies' field in your JSON response with a list of other key movies in the series (e.g., sequels, prequels). Each item in the list should have a 'title' and 'year'. If it's a standalone film, this field can be omitted.`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
                systemInstruction: "You are a movie and TV show recommendation expert for the UK market. Your goal is to help users overcome choice paralysis by providing a single, excellent recommendation based on their criteria. You must return your response in JSON format matching the provided schema, correctly setting the 'contentType' and 'genre' fields. If recommending a movie that's part of a franchise, also provide a list of other key movies in that franchise.",
            }
        });

        const text = response.text;
        const result = JSON.parse(text);
        // Fallback in case the model misses it, though the prompt and schema should handle it.
        if (!result.contentType) {
            result.contentType = contentType;
        }
        return result as MovieRecommendation;
    } catch (error) {
        console.error("Error getting movie recommendation:", error);
        throw new Error("Failed to get recommendation. The model may be unable to find a match for your specific criteria.");
    }
};

export const findStreamingServices = async (query: string): Promise<SearchResult> => {
    const prompt = `Where can I stream the movie or TV show "${query}" in the UK? List the primary streaming services in the United Kingdom where it's available for subscription. If not on a subscription service, mention where it can be rented or purchased. Be concise and clear.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text;
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources: GroundingSource[] = groundingMetadata?.groundingChunks?.map((chunk: GroundingChunk) => ({
            uri: chunk.web?.uri || '#',
            title: chunk.web?.title || 'Unknown Source'
        })).filter(source => source.uri !== '#') || [];

        return { text, sources };
    } catch (error) {
        console.error("Error finding streaming services:", error);
        throw new Error("Failed to find streaming information. Please try again.");
    }
};

export const generateFriendWatchlist = async (friendName: string): Promise<FriendGeneratedLists> => {
    const prompt = `Generate a plausible but fake watchlist and a fake watched list for a person named ${friendName}. They enjoy a mix of genres like action, comedy, and sci-fi.
    
    Provide two lists in the JSON response:
    1.  'watchlist': 4 popular movies or TV shows they want to watch.
    2.  'watchedList': 4 popular movies or TV shows they have already seen.

    For EVERY item in BOTH lists, provide: title, release year, contentType ('Movie' or 'TV Show'), the item's primary genre, a concise plot summary, and a short, fun, one-sentence 'reason' why ${friendName} would have it on their list.
    
    For items in the 'watchedList' ONLY, also include a 'rating' from 1 to 5.
    
    Return the result as a single JSON object with 'watchlist' and 'watchedList' keys.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: friendGeneratedListsSchema,
                systemInstruction: "You are a creative assistant that generates fictional movie and TV show lists for users' friends. The lists should feel authentic and personalized. Output must be valid JSON matching the provided schema, including the genre for every item.",
            }
        });

        const text = response.text;
        const parsed = JSON.parse(text) as FriendGeneratedLists;
        if (!parsed.watchlist) parsed.watchlist = [];
        if (!parsed.watchedList) parsed.watchedList = [];
        return parsed;

    } catch (error) {
        console.error(`Error generating watchlist for "${friendName}":`, error);
        throw new Error(`Failed to generate a watchlist for ${friendName}. The model might be temporarily unavailable.`);
    }
}