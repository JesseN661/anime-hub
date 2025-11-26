import { CONFIG } from './config.js';

class AnimeHub {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 12;
        this.apiKey = this.getStoredApiKey() || CONFIG.DEFAULT_API_KEY;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadGenres();
        this.checkApiKey();
    }

    initializeElements() {
        this.elements = {
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            closeModal: document.getElementById('closeModal'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            saveApiKey: document.getElementById('saveApiKey'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            genreFilter: document.getElementById('genreFilter'),
            sortBy: document.getElementById('sortBy'),
            sortOrder: document.getElementById('sortOrder'),
            loading: document.getElementById('loading'),
            errorMessage: document.getElementById('errorMessage'),
            results: document.getElementById('results'),
            pagination: document.getElementById('pagination'),
            prevPage: document.getElementById('prevPage'),
            nextPage: document.getElementById('nextPage'),
            pageInfo: document.getElementById('pageInfo')
        };
    }

    attachEventListeners() {
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.closeModal.addEventListener('click', () => this.closeSettings());
        this.elements.saveApiKey.addEventListener('click', () => this.saveApiKey());
        this.elements.searchBtn.addEventListener('click', () => this.performSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        this.elements.genreFilter.addEventListener('change', () => this.performSearch());
        this.elements.sortBy.addEventListener('change', () => this.performSearch());
        this.elements.sortOrder.addEventListener('change', () => this.performSearch());
        this.elements.prevPage.addEventListener('click', () => this.changePage(-1));
        this.elements.nextPage.addEventListener('click', () => this.changePage(1));
        
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });
    }

    getStoredApiKey() {
        return localStorage.getItem('animeHubApiKey');
    }

    saveStoredApiKey(key) {
        localStorage.setItem('animeHubApiKey', key);
    }

    checkApiKey() {
        if (!this.apiKey) {
            this.showError('Please configure your API key in settings to use the application.');
            this.openSettings();
        } else {
            this.performSearch();
        }
    }

    openSettings() {
        this.elements.settingsModal.classList.add('active');
        this.elements.apiKeyInput.value = this.apiKey || '';
    }

    closeSettings() {
        this.elements.settingsModal.classList.remove('active');
    }

    saveApiKey() {
        const newKey = this.elements.apiKeyInput.value.trim();
        if (newKey) {
            this.apiKey = newKey;
            this.saveStoredApiKey(newKey);
            this.closeSettings();
            this.showSuccess('API key saved successfully!');
            this.cache.clear();
            this.performSearch();
        } else {
            this.showError('Please enter a valid API key.');
        }
    }

    getCacheKey(url) {
        return url;
    }

    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    async fetchWithCache(url, options) {
        const cacheKey = this.getCacheKey(url);
        const cached = this.getCachedData(cacheKey);
        
        if (cached) {
            return cached;
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        this.setCachedData(cacheKey, data);
        return data;
    }

    async makeApiRequest(endpoint, params = {}) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `${CONFIG.API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
        
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': CONFIG.API_HOST
            }
        };

        try {
            return await this.fetchWithCache(url, options);
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    async loadGenres() {
        try {
            const genres = await this.makeApiRequest('/genre');
            this.populateGenreFilter(genres);
        } catch (error) {
            console.error('Failed to load genres:', error);
        }
    }

    populateGenreFilter(genres) {
        if (!Array.isArray(genres)) return;
        
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            this.elements.genreFilter.appendChild(option);
        });
    }

    async performSearch() {
        const searchTerm = this.elements.searchInput.value.trim();
        const genre = this.elements.genreFilter.value;
        const sortBy = this.elements.sortBy.value;
        const sortOrder = this.elements.sortOrder.value;

        this.currentPage = 1;
        await this.fetchAnime(searchTerm, genre, sortBy, sortOrder);
    }

    async fetchAnime(search = '', genre = '', sortBy = 'ranking', sortOrder = 'asc') {
        this.showLoading();
        this.hideError();

        try {
            const params = {
                page: this.currentPage,
                size: this.pageSize,
                sortBy: sortBy,
                sortOrder: sortOrder
            };

            if (search) {
                params.search = search;
            }

            if (genre) {
                params.genres = genre;
            }

            const response = await this.makeApiRequest('/anime', params);
            this.displayResults(response.data || []);
            this.updatePagination(response);
        } catch (error) {
            this.showError('Failed to fetch anime data. Please check your API key and try again.');
            console.error('Fetch error:', error);
        } finally {
            this.hideLoading();
        }
    }

    displayResults(animeList) {
        this.elements.results.innerHTML = '';

        if (!animeList || animeList.length === 0) {
            this.elements.results.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem; color: var(--text-secondary);">No anime found. Try adjusting your search criteria.</p>';
            return;
        }

        animeList.forEach(anime => {
            const card = this.createAnimeCard(anime);
            this.elements.results.appendChild(card);
        });
    }

    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.className = 'anime-card';

        const imageUrl = anime.image || 'https://via.placeholder.com/300x400?text=No+Image';
        const title = anime.title || 'Unknown Title';
        const ranking = anime.ranking || 'N/A';
        const type = anime.type || 'Unknown';
        const genres = anime.genres || [];

        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}" class="anime-image" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="anime-info">
                <h3 class="anime-title">${title}</h3>
                <div class="anime-meta">
                    <span class="anime-ranking">#${ranking}</span>
                    <span class="anime-type">${type}</span>
                </div>
                <div class="anime-genres">
                    ${genres.slice(0, 3).map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                </div>
            </div>
        `;

        card.addEventListener('click', () => this.showAnimeDetails(anime));
        return card;
    }

    showAnimeDetails(anime) {
        const synopsis = anime.synopsis || 'No synopsis available.';
        const episodes = anime.episodes || 'Unknown';
        const status = anime.status || 'Unknown';
        
        alert(`${anime.title}\n\nRanking: #${anime.ranking}\nType: ${anime.type}\nEpisodes: ${episodes}\nStatus: ${status}\n\n${synopsis}`);
    }

    updatePagination(response) {
        const hasMore = response.data && response.data.length === this.pageSize;
        
        this.elements.pagination.classList.remove('hidden');
        this.elements.prevPage.disabled = this.currentPage === 1;
        this.elements.nextPage.disabled = !hasMore;
        this.elements.pageInfo.textContent = `Page ${this.currentPage}`;
    }

    async changePage(direction) {
        this.currentPage += direction;
        const searchTerm = this.elements.searchInput.value.trim();
        const genre = this.elements.genreFilter.value;
        const sortBy = this.elements.sortBy.value;
        const sortOrder = this.elements.sortOrder.value;
        
        await this.fetchAnime(searchTerm, genre, sortBy, sortOrder);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.results.innerHTML = '';
    }

    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.elements.errorMessage.classList.add('hidden');
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #16a34a; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 2000;';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AnimeHub();
});
