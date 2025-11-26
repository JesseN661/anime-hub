/**
 * Configuration file for Anime Hub
 * 
 * This file contains all configuration settings for the application.
 * API keys should be stored securely and never committed to version control.
 * 
 * Author: Jesse Nkubito
 * Email: j.nkubito@alustudent.com
 * Repository: https://github.com/JesseN661/anime-hub.git
 */

export const CONFIG = {
    // API Configuration
    API_BASE_URL: 'https://anime-db.p.rapidapi.com',
    API_HOST: 'anime-db.p.rapidapi.com',
    
    // Default API key (for development only - users should add their own)
    
    // Application Settings
    PAGE_SIZE: 12,
    CACHE_DURATION: 300000, // 5 minutes in milliseconds
    
    // API Endpoints
    ENDPOINTS: {
        ANIME: '/anime',
        GENRES: '/genre',
        BY_RANKING: '/anime/by-ranking',
        BY_ID: '/anime'
    },
    
    // Application Metadata
    APP_NAME: 'Anime Hub',
    APP_VERSION: '1.0.0',
    AUTHOR: 'Jesse Nkubito',
    DOMAIN: 'jessenk.tech'
};
