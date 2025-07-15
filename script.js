import episodeFetcher, { SHOWS, SOURCES, UNIVERSES } from './data-fetcher.js';

// Global state
let episodes = [];

// DOM Elements
const $episodeList = $('#episodeList');
const $loadingIndicator = $('#loadingIndicator');

const eventHandlers = {
    initializeUI() {
        // Color mode
        if (localStorage.getItem('colorMode') === 'true') {
            $('body').addClass('no-color');
        }

        // Dark mode
        if (localStorage.getItem('darkMode') === 'true') {
            $('body').addClass('dark-mode');
        }

        // Restore scroll position
        const scrollPos = localStorage.getItem('scrollPosition');
        if (scrollPos) {
            window.scrollTo(0, parseInt(scrollPos));
        }
    },
    setupEventListeners() {
        // Toggle handlers
        $('#toggleColor').on('click', () => {
            $('body').toggleClass('no-color');
            localStorage.setItem('colorMode', $('body').hasClass('no-color'));
        });
        $('#toggleDark').on('click', () => {
            $('body').toggleClass('dark-mode');
            localStorage.setItem('darkMode', $('body').hasClass('dark-mode'));
        });
        $('#toggleSort').on('click', () => {
            episodes.reverse();
            renderEpisodes();
        });
        // Save scroll position
        $(window).on('scroll', () => {
            localStorage.setItem('scrollPosition', window.scrollY);
        });
        // Accordion behavior
        $('.accordion-button').on('click', function() {
            $(this).toggleClass('collapsed');
            const target = $(this).data('bs-target');
            $(target).toggleClass('show');
        });
        // Details button handler
        $(document).off('click', '.details-btn').on('click', '.details-btn', function(e) {
            e.preventDefault();
            const episodeId = parseInt($(this).closest('tr').data('episode-id'));
            showEpisodeDetails(episodeId);
        });
        // Watch status handlers
        $(document).off('change', '.episode-checkbox').on('change', '.episode-checkbox', function() {
            const id = parseInt($(this).data('id'));
            const watched = $(this).prop('checked');
            saveWatchedStatus(id, watched);
        });
        $(document).off('change', '.mark-previous-checkbox').on('change', '.mark-previous-checkbox', function() {
            const id = parseInt($(this).data('id'));
            if (this.checked) {
                markAllPreviousWatched(id);
                // Always uncheck after action (one-time)
                setTimeout(() => { this.checked = false; }, 100);
            }
        });
    }
};

// UI Functions
function renderEpisodes(filteredEpisodes = episodes) {
    const watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes') || '[]');
    $episodeList.html(filteredEpisodes.map((ep, index) => {
        // Always get dashboard color overrides if present
        let rowColor = undefined;
        let textColor = undefined;
        try {
            const dashboardSeries = JSON.parse(localStorage.getItem('dashboard_series')) || [];
            const found = dashboardSeries.find(s => s.name === ep.series);
            if (found) {
                rowColor = found.rowColor;
                textColor = found.textColor;
            }
        } catch {}
        // Inline style for row color and text color (always apply if present)
        // Use !important to ensure background-color is not overridden by CSS classes
        const style = (rowColor || textColor)
            ? `style="${rowColor ? `background-color:${rowColor} !important;` : ''}${textColor ? `color:${textColor} !important;` : ''}"`
            : '';

        return `
        <tr class="${ep.className} ${watchedEpisodes.includes(ep.id) ? 'watched' : ''}${ep.crossoverInfo ? ' crossover-episode' : ''}" data-episode-id="${ep.id}" ${style}>
            <td>${index + 1}</td>
            <td>${ep.series}</td>
            <td>${ep.episode}</td>
            <td>${ep.name}</td>
            <td>${ep.airDate}</td>
            <td class="crossover-cell">
                ${ep.crossoverInfo ? `<span class="badge crossover-badge" style="background:${ep.crossoverInfo.color};color:#fff">${ep.crossoverInfo.title}</span>` : ''}
            </td>
            <td class="watch-status-cell">
                <div class="watch-controls">
                    <input type="checkbox" 
                        class="episode-checkbox" 
                        title="Mark as Watched"
                        ${watchedEpisodes.includes(ep.id) ? 'checked' : ''} 
                        data-id="${ep.id}"
                    />
                    <input type="checkbox" 
                        class="mark-previous-checkbox" 
                        title="Mark All Previous as Watched"
                        data-id="${ep.id}"
                    />
                </div>
            </td>
            <td class="details-cell">
                <button type="button" class="btn btn-sm btn-outline-secondary details-btn" 
                    data-episode-id="${ep.id}"
                    title="Show Episode Details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
        `;
    }).join(''));

    // Remove any existing event handlers and add new ones
    $(document).off('click', '.details-btn').on('click', '.details-btn', function(e) {
        e.preventDefault();
        const episodeId = parseInt($(this).data('episode-id'));
        showEpisodeDetails(episodeId);
    });
}

function initializeFilters() {
    const universeContainer = $('#universeCheckboxes');
    
    // Generate universe checkboxes
    Object.entries(UNIVERSES).forEach(([universe, shows]) => {
        universeContainer.append(`
            <div class="form-check">
                <input class="form-check-input universe-filter" type="checkbox" 
                    id="${universe}" value="${universe}" checked>
                <label class="form-check-label" for="${universe}">
                    ${universe.replace(/_/g, ' ')}
                </label>
                <div class="show-list ms-4">
                    ${shows.map(show => `
                        <div class="form-check">
                            <input class="form-check-input show-filter" type="checkbox" 
                                id="${show}" value="${show}" checked>
                            <label class="form-check-label" for="${show}">
                                ${SHOWS[show]}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
    });
}

function saveWatchedStatus(id, watched) {
    let watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes') || '[]');
    id = parseInt(id);
    if (watched && !watchedEpisodes.includes(id)) {
        watchedEpisodes.push(id);
    } else if (!watched && watchedEpisodes.includes(id)) {
        watchedEpisodes = watchedEpisodes.filter(epId => epId !== id);
    }
    localStorage.setItem('watchedEpisodes', JSON.stringify(watchedEpisodes));
    renderEpisodes();
}

function markAllPreviousWatched(currentEpisodeId) {
    let watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes') || '[]');
    let changed = false;
    episodes.forEach(ep => {
        if (ep.id <= currentEpisodeId && !watchedEpisodes.includes(ep.id)) {
            watchedEpisodes.push(ep.id);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('watchedEpisodes', JSON.stringify(watchedEpisodes));
        renderEpisodes();
    }
}

function showEpisodeDetails(episodeId) {
    const episode = episodes.find(ep => ep.id === episodeId);
    if (!episode) return;

    // Remove any existing details rows
    $('.episode-details-row').remove();
    $('.details-btn i').removeClass('fa-eye-slash').addClass('fa-eye');

    // Create wiki URL for episode
    const wikiUrl = `https://arrow.fandom.com/wiki/${episode.series.replace(/ /g, '_')}`;
    const episodeTitle = episode.name.replace(/ /g, '_');
    const imageUrl = `https://static.wikia.nocookie.net/arrow/images/episodes/${episode.series}/${episodeTitle}.jpg`;

    // Find the episode's row and add details row after it
    const episodeRow = $(`tr[data-episode-id="${episodeId}"]`);
    const detailsRow = $(`
        <tr class="episode-details-row" data-parent-id="${episodeId}">
            <td colspan="9">
                <div class="details-content p-3">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="images/episode-placeholder.jpg" 
                                class="img-fluid rounded episode-image"
                                onerror="this.onerror=null; this.src='https://via.placeholder.com/300x169?text=No+Image'"
                                alt="${episode.name}">
                        </div>
                        <div class="col-md-8">
                            <div class="description-loading">Loading episode details...</div>
                            <div class="mt-3">
                                <button class="btn btn-sm btn-outline-danger close-details">Close Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `);

    // Insert the details row and animate it
    episodeRow.after(detailsRow);
    detailsRow.hide().slideDown();
    episodeRow.find('.details-btn i').removeClass('fa-eye').addClass('fa-eye-slash');

    // Add close button handler
    detailsRow.find('.close-details').on('click', function() {
        detailsRow.slideUp(function() {
            detailsRow.remove();
            episodeRow.find('.details-btn i').removeClass('fa-eye-slash').addClass('fa-eye');
        });
    });

    // Fetch episode description from wiki
    fetch(`https://arrow.fandom.com/api.php?action=parse&page=${episode.series}/${episode.name}&format=json&origin=*`)
        .then(response => response.json())
        .then(data => {
            if (data.parse && data.parse.text) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.parse.text['*'], 'text/html');
                const description = doc.querySelector('.plot') || doc.querySelector('.synopsis');
                if (description) {
                    detailsRow.find('.description-loading').html(`
                        <div class="episode-description">
                            ${description.innerHTML}
                        </div>
                    `);
                } else {
                    detailsRow.find('.description-loading').text('No description available.');
                }
            }
        })
        .catch(() => {
            detailsRow.find('.description-loading').text('Failed to load episode description.');
        });
}

// Search and filter functions
function setupSearch() {
    const $searchBox = $('#searchBox');
    const $searchOptions = $('.search-option');
    const $resetSearch = $('#resetSearch');
    let searchTimeout;

    function performSearch() {
        const searchTerm = $searchBox.val().toLowerCase();
        const options = {
            title: $('#searchTitle').prop('checked'),
            show: $('#searchShow').prop('checked'),
            crossover: $('#searchCrossover').prop('checked'),
            watched: $('#searchWatched').prop('checked')
        };
        filterEpisodes(searchTerm, options);
    }

    // Search input handling with debounce
    $searchBox.on('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });

    // Search options change handling
    $searchOptions.on('change', performSearch);

    // Reset search
    $resetSearch.on('click', () => {
        $searchBox.val('');
        $('#searchTitle, #searchShow').prop('checked', true);
        $('#searchCrossover, #searchWatched').prop('checked', false);
        renderEpisodes(episodes);
    });

    // Initialize dropdown
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) new bootstrap.Dropdown(dropdownToggle);
}

function filterEpisodes(searchTerm, options) {
    const watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes') || '[]');
    
    const filteredEpisodes = episodes.filter(ep => {
        if (!searchTerm && !options.crossover && !options.watched) return true;
        
        const matches = [];
        
        if (searchTerm) {
            if (options.title) {
                matches.push(ep.name.toLowerCase().includes(searchTerm));
            }
            if (options.show) {
                matches.push(ep.series.toLowerCase().includes(searchTerm));
            }
        }
        
        if (options.crossover) {
            matches.push(!!ep.crossoverInfo);
        }
        
        if (options.watched) {
            matches.push(watchedEpisodes.includes(ep.id));
        }
        
        return matches.some(match => match);
    });

    renderEpisodes(filteredEpisodes);
}

// Helper: Save episodes to localStorage for offline use
function saveEpisodesOffline(episodes) {
    try {
        localStorage.setItem('arrowverse_episodes_offline', JSON.stringify(episodes));
    } catch (e) {
        console.warn('Failed to save episodes for offline use:', e);
    }
}

// Helper: Load episodes from offline cache
function loadEpisodesOffline() {
    try {
        const data = localStorage.getItem('arrowverse_episodes_offline');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn('Failed to load offline episodes:', e);
    }
    return null;
}

// Modified initializeApp to use offline cache as fallback and update cache after fetch
async function initializeApp() {
    let loadedFromOffline = false;
    try {
        // Try to load from offline cache first for instant display
        const offlineEpisodes = loadEpisodesOffline();
        if (offlineEpisodes && Array.isArray(offlineEpisodes) && offlineEpisodes.length > 0) {
            episodes = offlineEpisodes;
            renderEpisodes();
            loadedFromOffline = true;
        }

        // Always try to fetch latest data in background (if online)
        const fetchedEpisodes = await episodeFetcher.fetchEpisodeList();
        if (Array.isArray(fetchedEpisodes) && fetchedEpisodes.length > 0) {
            episodes = fetchedEpisodes;
            renderEpisodes();
            saveEpisodesOffline(fetchedEpisodes);
        } else if (!loadedFromOffline) {
            // If fetch failed and no offline data, show error
            $episodeList.html('<tr><td colspan="9" class="error">Failed to load episodes. Please refresh.</td></tr>');
        }
        eventHandlers.setupEventListeners();
        eventHandlers.initializeUI();
        initializeFilters();
        setupSearch();
    } catch (error) {
        console.error('Failed to initialize:', error);
        if (!loadedFromOffline) {
            $episodeList.html('<tr><td colspan="9" class="error">Failed to load episodes. Please refresh.</td></tr>');
        }
    }
}

$(document).ready(function() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = new bootstrap.Dropdown(dropdownToggle);

    // Add Reset Watched button to the UI
    if (!$('#resetWatchedBtn').length) {
        $('.main-content').prepend(`
            <div class="text-end mb-2">
                <button id="resetWatchedBtn" class="btn btn-danger btn-sm">
                    <i class="fas fa-undo"></i> Reset Watched Status
                </button>
            </div>
        `);
    }
    $('#resetWatchedBtn').off('click').on('click', function() {
        if (confirm('Are you sure you want to reset all watched statuses?')) {
            localStorage.removeItem('watchedEpisodes');
            renderEpisodes();
        }
    });

    // Attach sidebar toggle ONCE here, not in setupEventListeners
    $('#sidebarToggle').off('click').on('click', function(e) {
        e.preventDefault();
        $('#sidebar').toggleClass('active');
        $('.main-content').toggleClass('sidebar-active');
    });

    initializeApp();
});


