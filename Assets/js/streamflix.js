// TMDB API Configuration
const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63'; // Free public key for demo
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Application State
const state = {
    activeTab: 'movies',
    selectedContent: null,
    searchQuery: '',
    season: 1,
    episode: 1,
    searchResults: [],
    isSearching: false
};

// Data - Default Popular Content
const popularMovies = [
    { id: 1078605, title: 'Sonic the Hedgehog 3', year: 2024, rating: 8.2, poster: 'https://image.tmdb.org/t/p/w500/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg' },
    { id: 912649, title: 'Venom: The Last Dance', year: 2024, rating: 7.5, poster: 'https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg' },
    { id: 558449, title: 'Gladiator II', year: 2024, rating: 7.8, poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg' },
    { id: 823464, title: 'Godzilla x Kong: The New Empire', year: 2024, rating: 7.2, poster: 'https://image.tmdb.org/t/p/w500/gmIJHvmXRQavbKRZQx3TwQH4Ije.jpg' },
    { id: 519182, title: 'Despicable Me 4', year: 2024, rating: 7.3, poster: 'https://image.tmdb.org/t/p/w500/wWba3TaojhK7NdycRhoQpsG0FaH.jpg' },
    { id: 762441, title: 'A Quiet Place: Day One', year: 2024, rating: 7.1, poster: 'https://image.tmdb.org/t/p/w500/yrpPYKijwdMHyTGIOd1iK1h0Xno.jpg' }
];

const popularTVShows = [
    { id: 119051, title: 'Wednesday', year: 2022, rating: 8.7, poster: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', seasons: 2 },
    { id: 94605, title: 'Arcane', year: 2021, rating: 9.0, poster: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', seasons: 2 },
    { id: 95557, title: 'Invincible', year: 2021, rating: 8.7, poster: 'https://image.tmdb.org/t/p/w500/dMOpdkrDC5dQxqNydgKxXjBKyAc.jpg', seasons: 2 },
    { id: 76479, title: 'The Boys', year: 2019, rating: 8.7, poster: 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg', seasons: 4 },
    { id: 82856, title: 'The Mandalorian', year: 2019, rating: 8.7, poster: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg', seasons: 3 },
    { id: 1396, title: 'Breaking Bad', year: 2008, rating: 9.5, poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', seasons: 5 }
];

// DOM Elements
const elements = {
    contentGrid: document.getElementById('contentGrid'),
    sectionTitle: document.getElementById('sectionTitle'),
    searchInput: document.getElementById('searchInput'),
    playerModal: document.getElementById('playerModal'),
    modalTitle: document.getElementById('modalTitle'),
    episodeControls: document.getElementById('episodeControls'),
    seasonSelect: document.getElementById('seasonSelect'),
    episodeInput: document.getElementById('episodeInput'),
    closeBtn: document.getElementById('closeBtn'),
    playerIframe: document.getElementById('playerIframe'),
    tabButtons: document.querySelectorAll('.tab-btn')
};

// API Functions
async function searchTMDB(query, type = 'movie') {
    try {
        const endpoint = type === 'movie' ? 'search/movie' : 'search/tv';
        const response = await fetch(
            `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('TMDB Search Error:', error);
        return [];
    }
}

async function getTVShowDetails(tvId) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('TV Show Details Error:', error);
        return null;
    }
}

function formatTMDBResults(results, type) {
    return results.map(item => ({
        id: item.id,
        title: type === 'movie' ? item.title : item.name,
        year: type === 'movie' 
            ? (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A')
            : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'),
        rating: item.vote_average ? item.vote_average.toFixed(1) : 'N/A',
        poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster',
        seasons: item.number_of_seasons || 1
    }));
}

// Helper Functions
function getContent() {
    if (state.searchQuery.trim() && state.searchResults.length > 0) {
        return state.searchResults;
    }
    return state.activeTab === 'movies' ? popularMovies : popularTVShows;
}

function getEmbedUrl() {
    if (!state.selectedContent) return '';
    
    if (state.activeTab === 'movies') {
        return `https://www.vidking.net/embed/movie/${state.selectedContent.id}?color=e50914&autoPlay=true`;
    } else {
        return `https://www.vidking.net/embed/tv/${state.selectedContent.id}/${state.season}/${state.episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;
    }
}

// Render Functions
function renderContentGrid() {
    const content = getContent();
    elements.contentGrid.innerHTML = '';
    
    if (state.isSearching) {
        elements.contentGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #9ca3af;">Searching...</div>';
        return;
    }
    
    if (content.length === 0) {
        elements.contentGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #9ca3af;">No results found. Try another search!</div>';
        return;
    }
    
    content.forEach(item => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.onclick = () => handlePlay(item);
        
        card.innerHTML = `
            <div class="poster-container">
                <img src="${item.poster}" alt="${item.title}" class="poster-image" loading="lazy">
                <div class="poster-overlay">
                    <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                </div>
                <div class="rating-badge">
                    <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span class="rating-text">${item.rating}</span>
                </div>
            </div>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-year">${item.year}</p>
        `;
        
        elements.contentGrid.appendChild(card);
    });
}

function updateSectionTitle() {
    if (state.searchQuery.trim()) {
        elements.sectionTitle.textContent = `Search Results for "${state.searchQuery}"`;
    } else {
        elements.sectionTitle.textContent = state.activeTab === 'movies' 
            ? 'Popular Movies' 
            : 'Popular TV Shows';
    }
}

function populateSeasonSelector() {
    if (!state.selectedContent || !state.selectedContent.seasons) return;
    
    elements.seasonSelect.innerHTML = '';
    for (let i = 1; i <= state.selectedContent.seasons; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        elements.seasonSelect.appendChild(option);
    }
    elements.seasonSelect.value = state.season;
}

function updatePlayerIframe() {
    elements.playerIframe.src = getEmbedUrl();
}

// Event Handlers
async function handlePlay(item) {
    state.selectedContent = item;
    state.season = 1;
    state.episode = 1;
    
    elements.modalTitle.textContent = item.title;
    
    if (state.activeTab === 'tv') {
        // Fetch TV show details to get accurate season count
        const details = await getTVShowDetails(item.id);
        if (details && details.number_of_seasons) {
            state.selectedContent.seasons = details.number_of_seasons;
        }
        
        elements.episodeControls.style.display = 'flex';
        populateSeasonSelector();
        elements.episodeInput.value = 1;
    } else {
        elements.episodeControls.style.display = 'none';
    }
    
    updatePlayerIframe();
    elements.playerModal.classList.add('active');
}

function handleClosePlayer() {
    state.selectedContent = null;
    elements.playerModal.classList.remove('active');
    elements.playerIframe.src = '';
}

function handleTabChange(tab) {
    state.activeTab = tab;
    state.searchQuery = '';
    state.searchResults = [];
    elements.searchInput.value = '';
    
    // Update active tab button
    elements.tabButtons.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    updateSectionTitle();
    renderContentGrid();
}

// Debounce function for search
let searchTimeout;
async function handleSearch(query) {
    clearTimeout(searchTimeout);
    
    state.searchQuery = query.trim();
    
    if (!state.searchQuery) {
        state.searchResults = [];
        updateSectionTitle();
        renderContentGrid();
        return;
    }
    
    // Show searching state
    state.isSearching = true;
    updateSectionTitle();
    renderContentGrid();
    
    // Debounce API call
    searchTimeout = setTimeout(async () => {
        const results = await searchTMDB(state.searchQuery, state.activeTab);
        const formattedResults = formatTMDBResults(results, state.activeTab);
        
        state.searchResults = formattedResults;
        state.isSearching = false;
        
        console.log(`Found ${formattedResults.length} results for "${state.searchQuery}"`);
        
        updateSectionTitle();
        renderContentGrid();
    }, 500); // Wait 500ms after user stops typing
}

function handleSeasonChange(season) {
    state.season = parseInt(season);
    updatePlayerIframe();
}

function handleEpisodeChange(episode) {
    state.episode = parseInt(episode);
    updatePlayerIframe();
}

// Event Listeners
elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => handleTabChange(btn.dataset.tab));
});

elements.searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
});

elements.closeBtn.addEventListener('click', handleClosePlayer);

elements.seasonSelect.addEventListener('change', (e) => handleSeasonChange(e.target.value));

elements.episodeInput.addEventListener('change', (e) => handleEpisodeChange(e.target.value));

// Close modal when clicking outside
elements.playerModal.addEventListener('click', (e) => {
    if (e.target === elements.playerModal) {
        handleClosePlayer();
    }
});

// Listen for player events
window.addEventListener('message', (event) => {
    if (typeof event.data === 'string') {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'PLAYER_EVENT') {
                console.log('Player Event:', data.data);
                // You can save progress here
            }
        } catch (e) {
            // Not JSON, ignore
        }
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderContentGrid();
    updateSectionTitle();
});