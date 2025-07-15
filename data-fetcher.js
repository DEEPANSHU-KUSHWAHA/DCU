let DYNAMIC_CROSSOVERS = [];
// Always prefer dashboard-edited series and sources if present in localStorage

function getDashboardSeries() {
    try {
        return JSON.parse(localStorage.getItem('dashboard_series')) || [];
    } catch {
        return [];
    }
}

function getDashboardSources() {
    try {
        const arr = JSON.parse(localStorage.getItem('dashboard_sources'));
        if (Array.isArray(arr) && arr.length) {
            const obj = {};
            arr.forEach(s => {
                obj[s.key] = s.url;
            });
            return obj;
        }
    } catch {}
    return null;
}

function getDashboardWikiUrls() {
    try {
        const arr = JSON.parse(localStorage.getItem('dashboard_series'));
        if (Array.isArray(arr) && arr.length) {
            const obj = {};
            arr.forEach(s => {
                obj[s.name] = s.wikiUrl;
            });
            return obj;
        }
    } catch {}
    return null;
}

// Use dashboard values if present, otherwise fallback to defaults
const DASHBOARD_SERIES_ARR = getDashboardSeries();
const SHOWS = (() => {
    if (Array.isArray(DASHBOARD_SERIES_ARR) && DASHBOARD_SERIES_ARR.length) {
        const obj = {};
        DASHBOARD_SERIES_ARR.forEach(s => {
            obj[s.key || s.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')] = s.name;
        });
        return obj;
    }
    return {
        ARROW: 'Arrow',
        BATWOMAN: 'Batwoman',
        BLACK_LIGHTNING: 'Black Lightning',
        CONSTANTINE: 'Constantine',
        FLASH: 'The Flash',
        FREEDOM_FIGHTERS: 'Freedom Fighters: The Ray',
        LEGENDS_OF_TOMORROW: "DC's Legends of Tomorrow",
        STARGIRL: 'Stargirl',
        SUPERGIRL: 'Supergirl',
        SUPERMAN_AND_LOIS: 'Superman & Lois',
        VIXEN: 'Vixen',
        BIRDS_OF_PREY: 'Birds of Prey', // <-- restore this line
        CROSSOVERS: 'Crossovers',
        SANDMAN: 'The Sandman',
        LUCIFER: 'Lucifer',
        TITANS: 'Titans',
        DOOM_PATROL: 'Doom Patrol',
        GOTHAM: 'Gotham',
        PENNYWORTH: 'Pennyworth',
        JUSTICE_LEAGUE: 'Justice League (DCEU)'
    };
})();

const SOURCES = getDashboardSources() || {
    ARROW_WIKI: 'https://arrow.fandom.com/api.php',
    ARROWVERSE_INFO: 'https://arrowverse.info',
    WIKIPEDIA: 'https://en.wikipedia.org/w/api.php'
};

const SHOW_WIKI_URLS = getDashboardWikiUrls() || {
    'Arrow': 'List_of_Arrow_episodes',
    'Batwoman': 'List_of_Batwoman_episodes',
    'Black Lightning': 'List_of_Black_Lightning_episodes',
    'Constantine': 'List_of_Constantine_episodes',
    'The Flash': 'List_of_The_Flash_(The_CW)_episodes',
    'Freedom Fighters: The Ray': 'Freedom_Fighters:_The_Ray',
    "DC's Legends of Tomorrow": "List_of_DC's_Legends_of_Tomorrow_episodes",
    'Stargirl': 'List_of_Stargirl_episodes',
    'Supergirl': 'List_of_Supergirl_episodes',
    'Superman & Lois': 'List_of_Superman_&_Lois_episodes',
    'Vixen': 'List_of_Vixen_episodes',
    'Birds of Prey': 'List_of_Birds_of_Prey_episodes',
    'Crossovers': 'List_of_crossover_episodes'
};

const BACKUP_EPISODES = [
    {
        id: 1,
        series: "Arrow",
        episode: "S01E01",
        name: "Pilot",
        airDate: "2012-10-10",
        source: "Local",
        watched: false
    },
    {
        id: 2,
        series: "Arrow",
        episode: "S01E02",
        name: "Honor Thy Father",
        airDate: "2012-10-17",
        source: "Local",
        watched: false
    }
    // Add more backup episodes if needed
];

// Add connected series
const CONNECTED_SERIES = {
    SANDMAN: 'The Sandman',
    LUCIFER: 'Lucifer',
    TITANS: 'Titans',
    DOOM_PATROL: 'Doom Patrol'
}; // Add semicolon here

// Remove CHARACTER_COLORS, SHOW_THEMES, getShowStyle, and any other theme/color mapping logic

// Remove the old SHOW_STYLES constant and replace with enhanced version
const SHOW_THEMES = {
    [SHOWS.FLASH]: {
        type: 'speedster',
        colors: {
            primary: '#ba0c0c',
            secondary: '#ffd700',
            accent: '#ff0000'
        },
        gradients: ['#ba0c0c', '#ff3019']
    },
    [SHOWS.ARROW]: {
        type: 'vigilante',
        colors: {
            primary: '#1e4620',
            secondary: '#2e7d32',
            accent: '#388e3c'
        },
        gradients: ['#1e4620', '#2e7d32']
    },
    [SHOWS.SUPERGIRL]: {
        type: 'kryptonian',
        colors: {
            primary: '#0d47a1',  // Super blue
            secondary: '#ffd700', // House of El gold
            accent: '#dc0000'    // Cape red
        },
        gradients: ['#0d47a1', '#1565c0']
    },
    // Add more shows with their themes...
};

// Single enhanced version of getShowStyle
function getShowStyle(showName, episodeName = '') {
    const crossoverInfo = episodeName ? findCrossoverEvent(episodeName, showName) : null;
    return CHARACTER_COLORS.generateStyle(
        showName, 
        !!crossoverInfo, 
        crossoverInfo?.color
    );
}

// Fix episode numbering with global counter
let globalEpisodeId = 1;

// Add this helper before parseWikiTable
function getShowColor(showName) {
    if (Array.isArray(DASHBOARD_SERIES_ARR)) {
        const found = DASHBOARD_SERIES_ARR.find(s => s.name === showName);
        return found && found.rowColor ? found.rowColor : null;
    }
    return null;
}

function getShowTextColor(showName) {
    if (Array.isArray(DASHBOARD_SERIES_ARR)) {
        const found = DASHBOARD_SERIES_ARR.find(s => s.name === showName);
        return found && found.textColor ? found.textColor : null;
    }
    return null;
}

function getShowWikiUrl(showName) {
    if (Array.isArray(DASHBOARD_SERIES_ARR)) {
        const found = DASHBOARD_SERIES_ARR.find(s => s.name === showName);
        return found && found.wikiUrl ? found.wikiUrl : null;
    }
    return null;
}

function parseWikiTable(table, showName, startId) {
    const episodes = [];
    let titleIndex = -1, dateIndex = -1;
    let currentSeason = "01";
    let episodeInSeason = 1;

    // Find season number from previous h2/h3 heading
    let prevElement = table.previousElementSibling;
    while (prevElement) {
        if (prevElement.tagName === 'H2' || prevElement.tagName === 'H3') {
            const seasonMatch = prevElement.textContent.match(/Season\s*(\d+)/i);
            if (seasonMatch) {
                currentSeason = seasonMatch[1].padStart(2, '0');
                break;
            }
        }
        prevElement = prevElement.previousElementSibling;
    }

    // Find column indices
    const headerRow = table.querySelector('tr');
    if (headerRow) {
        const headers = headerRow.querySelectorAll('th');
        headers.forEach((header, index) => {
            const text = header.textContent.toLowerCase();
            if (text.includes('title') || text.includes('name')) titleIndex = index;
            if (text.includes('air') || text.includes('date')) dateIndex = index;
        });
    }

    table.querySelectorAll('tr').forEach((row, index) => {
        if (index === 0) return;
        const cols = row.querySelectorAll('td');
        if (cols.length >= 3) {
            const airDateStr = cols[dateIndex]?.textContent?.trim() || '';
            const titleCell = cols[titleIndex];
            let name = '';
            if (titleCell) {
                const link = titleCell.querySelector('a');
                name = link ? link.textContent : titleCell.textContent;
                name = name.replace(/"/g, '').replace(/\[\d+\]/g, '').trim();
            }
            if (airDateStr && name) {
                // Normalize episode code for matching
                const thisEpCode = `S${currentSeason}E${String(episodeInSeason).padStart(2, '0')}`.toUpperCase();
                const crossover = DYNAMIC_CROSSOVERS.find(c =>
                    c.show === showName &&
                    (c.episodeCode === thisEpCode ||
                     name.toLowerCase().includes(c.episodeTitle.toLowerCase()))
                );
                if (crossover) {
                    console.log('[DEBUG] Matched crossover:', crossover, 'for episode', name, thisEpCode);
                }
                episodes.push({
                    id: globalEpisodeId++,
                    series: showName,
                    episode: `S${currentSeason}-E${String(episodeInSeason).padStart(2, '0')}`,
                    name: name,
                    airDate: parseWikiDate(airDateStr),
                    source: 'Arrow Wiki',
                    className: `${showName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    watched: false,
                    style: `background-color: ${getShowColor(showName) || '#222'}; color: ${getShowTextColor(showName) || '#fff'};`,
                    crossoverInfo: crossover ? { title: crossover.eventName, color: crossover.color } : null
                });
                episodeInSeason++;
            }
        }
    });
    return episodes;
}

function parseWikiDate(dateStr) {
    if (!dateStr || !dateStr.match(/\d{4}/)) return '';
    try {
        // Clean up date string
        dateStr = dateStr
            .replace(/\[\d+\]/g, '')
            .replace(/\(.+?\)/g, '')
            .trim();

        const months = {
            'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
            'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
            'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };

        // Handle various date formats
        let match = dateStr.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
        if (match) {
            const [, month, day, year] = match;
            const monthNum = months[month.toLowerCase().substring(0, 3)];
            if (monthNum) {
                return `${year}-${monthNum}-${day.padStart(2, '0')}`;
            }
        }

        return '';
    } catch (error) {
        console.warn('Date parsing error:', dateStr, error);
        return '';
    }
}
// DYNAMIC_CROSSOVERS = await fetchCrossoverEvents();
// Update fetchEpisodeList to use new parsing
class EpisodeFetcher {
    async fetchEpisodeList(newestFirst = false) {
        try {
            this.showLoading();
            debugLog('[DEBUG] ====== Starting Episode Fetch ======');

            // Fetch all crossovers from all sources
            DYNAMIC_CROSSOVERS = await fetchAllCrossoverEvents();

            let episodes = [];
            let id = 1;

            // Fetch Arrow first
            debugLog('[DEBUG] Fetching Arrow episodes...');
            const arrowEpisodes = await this.fetchShowEpisodes(SHOWS.ARROW, id);
            debugLog(`[DEBUG] Got ${arrowEpisodes.length} Arrow episodes`);
            episodes.push(...arrowEpisodes);
            id += arrowEpisodes.length;

            // Find Arrow S02E23
            const arrowS02End = arrowEpisodes.findIndex(ep => ep.episode === 'S02-E23');
            debugLog(`[DEBUG] Arrow S02E23 index: ${arrowS02End}`);

            // Fetch Flash
            debugLog('[DEBUG] Fetching Flash episodes...');
            let flashEpisodes = [];
            if (SHOWS.FLASH && typeof SHOWS.FLASH === 'string') {
                flashEpisodes = await this.fetchShowEpisodes(SHOWS.FLASH, id);
                debugLog(`[DEBUG] Got ${flashEpisodes.length} Flash episodes`);
            } else {
                debugLog('[WARN] SHOWS.FLASH is not defined or not a string:', SHOWS.FLASH);
            }

            if (arrowS02End !== -1 && flashEpisodes.length > 0) {
                episodes.splice(arrowS02End + 1, 0, ...flashEpisodes);
                debugLog('[DEBUG] Inserted Flash episodes after Arrow S02E23');
            } else {
                debugLog('[WARN] Could not insert Flash episodes at correct position');
                episodes.push(...flashEpisodes);
            }

            // Fetch remaining shows
            for (const [showKey, showName] of Object.entries(SHOWS)) {
                if (
                    showName &&
                    showName !== SHOWS.ARROW &&
                    showName !== SHOWS.FLASH &&
                    typeof showName === 'string'
                ) {
                    const showEpisodes = await this.fetchShowEpisodes(showName, id);
                    episodes.push(...showEpisodes);
                    id += showEpisodes.length;
                }
            }

            // Filter out episodes without valid dates
            episodes = episodes.filter(ep => ep.airDate);
            
            // First sort by air date
            episodes.sort((a, b) => {
                const dateA = new Date(a.airDate);
                const dateB = new Date(b.airDate);
                return dateA - dateB;
            });

            // Find Arrow S02E23
            const arrowS02EndIdx = episodes.findIndex(ep => 
                ep.series === 'Arrow' && 
                ep.episode.startsWith('S02') && 
                ep.episode.endsWith('23')
            );

            if (arrowS02EndIdx !== -1) {
                // Get all Flash episodes
                const flashEpisodes = episodes.filter(ep => ep.series === 'The Flash');
                if (flashEpisodes.length > 0) {
                    // Remove Flash episodes from main array
                    episodes = episodes.filter(ep => ep.series !== 'The Flash');
                    // Insert them after Arrow S02E23
                    episodes.splice(arrowS02EndIdx + 1, 0, ...flashEpisodes);
                }
            }

            // Reassign IDs
            episodes = episodes.map((ep, idx) => ({...ep, id: idx + 1}));

            if (newestFirst) {
                episodes.reverse();
            }

            // Sort shows in chronological order
            const showOrder = {
                'Arrow': 1,
                'Birds of Prey': 2,
                'The Flash': 3,
                'Crossovers': 4,
                'Constantine': 5,
                'Supergirl': 6,
                "DC's Legends of Tomorrow": 7,
                'Vixen': 8,
                'Freedom Fighters: The Ray': 9,
                'Black Lightning': 10,
                'Batwoman': 11,
                'Stargirl': 12,
                'Superman & Lois': 13
            };

            // Sort episodes by show order, season, and episode
            episodes.sort((a, b) => {
                // First compare to air date for basic ordering
                const dateA = new Date(a.airDate);
                const dateB = new Date(b.airDate);
                const dateDiff = dateA - dateB;

                // Special handling for The Flash to appear after Arrow S02
                if (a.series === 'Arrow' && b.series === 'The Flash') {
                    const arrowSeason = parseInt(a.episode.match(/S(\d+)/)[1]);
                    return arrowSeason <= 2 ? -1 : 1;
                }
                if (a.series === 'The Flash' && b.series === 'Arrow') {
                    const arrowSeason = parseInt(b.episode.match(/S(\d+)/)[1]);
                    return arrowSeason <= 2 ? 1 : -1;
                }

                // Use air date if it differs by more than a week
                if (Math.abs(dateDiff) > 7 * 24 * 60 * 60 * 1000) {
                    return dateDiff;
                }

                // Otherwise use show order
                return showOrder[a.series] - showOrder[b.series];
            });

            // Update episode sorting in fetchEpisodeList
            episodes.sort((a, b) => {
                // Special handling for Flash episodes
                if (a.series === 'The Flash' || b.series === 'The Flash') {
                    // If one is Arrow and other is Flash, handle special ordering
                    if (a.series === 'Arrow' || b.series === 'Arrow') {
                        const arrowEp = a.series === 'Arrow' ? a : b;
                        const arrowSeason = parseInt(arrowEp.episode.match(/S(\d+)/)[1]);
                        
                        // Flash should appear after Arrow S02E23
                        if (arrowSeason <= 2) return a.series === 'Arrow' ? -1 : 1;
                        
                        // After Arrow S02, use air dates
                        const dateA = new Date(a.airDate);
                        const dateB = new Date(b.airDate);
                        return dateA - dateB;
                    }
                }

                // For other shows use normal chronological order
                const dateA = new Date(a.airDate);
                const dateB = new Date(b.airDate);
                return dateA - dateB;
            });

            if (episodes.length > 0) {
                console.log(`Successfully loaded ${episodes.length} episodes in chronological order`);
                localStorage.setItem('arrowverse_episodes', JSON.stringify(episodes));
            }

            this.hideLoading();
            return episodes;
        } catch (error) {
            console.error('[ERROR] Main fetch error:', error);
            console.error('[ERROR] Stack:', error.stack);
            return BACKUP_EPISODES;
        }
    }

    async fetchShowEpisodes(showName, startId) {
        if (!showName || typeof showName !== 'string') {
            console.warn('[WARN] fetchShowEpisodes called with invalid showName:', showName);
            return [];
        }
        try {
            console.log(`[DEBUG] Starting fetch for ${showName}`);
            const url = new URL(SOURCES.ARROW_WIKI);
            url.searchParams.set('action', 'parse');
            url.searchParams.set('format', 'json');
            url.searchParams.set('origin', '*');
            // Always use showName for SHOW_WIKI_URLS lookup
            let wikiUrl = SHOW_WIKI_URLS[showName];
            const dashboardWikiUrl = getShowWikiUrl(showName);
            if (dashboardWikiUrl) wikiUrl = dashboardWikiUrl;
            if (wikiUrl) {
                url.searchParams.set('page', wikiUrl);
            } else {
                url.searchParams.set('page', `List_of_${showName.replace(/ /g, '_')}_episodes`);
            }

            console.log(`[DEBUG] Fetching URL: ${url.toString()}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`[ERROR] HTTP ${response.status} for ${showName}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[DEBUG] Got data for ${showName}:`, {
                hasData: !!data,
                hasParseData: !!data.parse,
                hasText: !!data.parse?.text,
                textLength: data.parse?.text?.['*']?.length
            });

            let episodes = [];
            if (data.parse?.text?.['*']) {
                const doc = new DOMParser().parseFromString(data.parse.text['*'], 'text/html');
                const tables = doc.querySelectorAll('table.wikitable');
                console.log(`[DEBUG] Found ${tables.length} tables for ${showName}`);
                
                tables.forEach((table, index) => {
                    const newEpisodes = parseWikiTable(table, showName, startId);
                    console.log(`[DEBUG] Table ${index + 1} parsed: ${newEpisodes.length} episodes`);
                    episodes.push(...newEpisodes);
                    startId += newEpisodes.length;
                });
            }

            const validEpisodes = episodes.filter(ep => ep.airDate);
            console.log(`[DEBUG] ${showName} final episodes: ${validEpisodes.length} (filtered from ${episodes.length})`);
            return validEpisodes;

        } catch (error) {
            console.error(`[ERROR] Failed to fetch ${showName}:`, error);
            console.error(`[ERROR] Stack trace:`, error.stack);
            return [];
        }
    }

    updateProgress(percent) {
        const progressBar = document.getElementById('loadingProgress');
        if (progressBar) {
            const progress = Math.min(100, Math.max(0, percent));
            progressBar.style.width = `${progress}%`;
            console.log(`Loading progress: ${progress}%`);
        }
    }

    showLoading() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = 'block';
            this.updateProgress(0);
        }
    }

    hideLoading() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    updateLoadingStatus(status) {
        const statusElement = document.getElementById('loadingStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
}

const episodeFetcher = new EpisodeFetcher();

const UNIVERSES = {
    ARROWVERSE: ['ARROW', 'FLASH', 'SUPERGIRL', 'LEGENDS', 'BATWOMAN', 'BLACK_LIGHTNING', 'SUPERMAN_AND_LOIS'],
    TITANS_VERSE: ['TITANS', 'DOOM_PATROL'],
    GOTHAM_VERSE: ['GOTHAM', 'PENNYWORTH'],
    DCEU_TV: ['PEACEMAKER'],
    VERTIGO: ['SANDMAN', 'SWEET_TOOTH'],
    ANIMATED: ['HARLEY_QUINN', 'YOUNG_JUSTICE', 'BATMAN_TAS', 'SUPERMAN_TAS', 'JUSTICE_LEAGUE', 'TEEN_TITANS']
};

// Single export of all constants
export { SHOWS, SOURCES, UNIVERSES };
export default episodeFetcher;

function enrichWithCrossovers(episodes) {
    return episodes;
}

function findCrossoverInfo(episode) {
    return null;
}

function mergeEpisodeData(wikiEpisodes, arrowverseEpisodes) {
    const merged = new Map();

    [...wikiEpisodes, ...arrowverseEpisodes].forEach(episode => {
        const key = `${episode.series}-${episode.episode}`;
        if (!merged.has(key)) {
            merged.set(key, episode);
        } else {
            // Merge data preferring Arrowverse.info for crossovers
            merged.set(key, {
                ...merged.get(key),
                ...episode,
                crossover: episode.crossover || merged.get(key).crossover
            });
        }
    });
    
    return Array.from(merged.values());
}

function parseWikiEpisodes(data, series) {
    const episodes = [];
    let id = 1;

    if (data?.parse?.sections) {
        data.parse.sections.forEach(section => {
            if (section.toc && section.toc.length) {
                section.toc.forEach(item => {
                    const episodeTitle = item.title;
                    const episodeLink = item.anchor;
                    
                    // Simple heuristic to extract season and episode number
                    const match = episodeTitle.match(/S(\\d+)E(\\d+)/);
                    if (match) {
                        const [, season, episode] = match;
                        episodes.push({
                            id: id++,
                            series,
                            episode: `S${season}E${episode}`,
                            name: episodeTitle,
                            airDate: '', // Air date not available from this source
                            source: 'Arrow Wiki',
                            watched: false
                        });
                    }
                });
            }
        });
    }

    return episodes;
}

// Add crossover parsing
async function fetchCrossoverEpisodes(startId) {
    return [];
}

function findCrossoverEvent(episodeName, showName) {
    return null;
}

// Fetch crossovers from multiple sources and merge
async function fetchAllCrossoverEvents() {
    const sources = [
        // Arrowverse Wiki only (reliable structure)
        'https://arrow.fandom.com/api.php?action=parse&page=List_of_crossover_episodes&format=json&origin=*'
    ];
    let allCrossovers = [];
    for (const url of sources) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data.parse || !data.parse.text) continue;
            const html = data.parse.text['*'];
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const tables = doc.querySelectorAll('table.wikitable');
            tables.forEach(table => {
                table.querySelectorAll('tr').forEach((row, idx) => {
                    if (idx === 0) return; // skip header
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 4) {
                        const eventName = cells[0].textContent.trim();
                        const show = cells[1].textContent.trim();
                        const episodeCode = cells[2].textContent.trim().replace(/[-\s]/g, '').toUpperCase();
                        const episodeTitle = cells[3].textContent.trim();
                        let color = stringToColor(eventName);
                        allCrossovers.push({ eventName, show, episodeCode, episodeTitle, color });
                    }
                });
            });
        } catch (e) {
            console.warn('Failed to fetch crossovers from', url, e);
        }
    }
    console.log('[DEBUG] Fetched crossovers:', allCrossovers);
    return allCrossovers;
}

// Helper: generate a color from a string
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        color += ('00' + ((hash >> (i * 8)) & 0xFF).toString(16)).slice(-2);
    }
    return color;
}

// Add a global debug log buffer and a dashboard console button
let DEBUG_LOGS = [];
function debugLog(...args) {
    DEBUG_LOGS.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '));
}

// Replace all console.log, console.warn, console.error, console.debug in this file with debugLog
// Example: console.log('[DEBUG] ...') => debugLog('[DEBUG] ...')
// Example: console.warn('Failed to fetch ...') => debugLog('WARN:', ...)
// Example: console.error('Failed to fetch ...') => debugLog('ERROR:', ...)

// ...in fetchEpisodeList and other functions...







