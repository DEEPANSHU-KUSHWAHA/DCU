import { Shows, SHOW_DICT_WITH_NAMES } from './config.js';

const TWELVE_HOURS = 43200;

function handleStargirlEpisodes(episodeRows) {
    episodeRows = episodeRows.filter(row => row);
    // Add missing Stargirl episodes
    episodeRows[6] = ['7', 'Shiv: Part 1', 'June 29, 2020'];
    episodeRows.insert(7, ['8', 'Shiv: Part 2', 'July 6, 2020']);
    // ...add other special cases...
    return episodeRows;
}

function parseEpisodeList(seriesSoup, series) {
    const episodes = [];
    let season = 0;
    const fromWikipedia = SHOW_DICT_WITH_NAMES[series].root.includes('wikipedia');

    const tables = fromWikipedia ? 
        seriesSoup.querySelectorAll('table.wikiepisodetable') :
        seriesSoup.querySelectorAll('table');

    tables.forEach(table => {
        const tableName = table.textContent.toLowerCase();
        if (tableName.includes('series overview')) return;

        season++;
        // ... parse table logic similar to Python version ...
    });

    return episodes;
}

function handleCrossoverOrder(episodeList, showsInList) {
    const earthXShowOrder = ['SUPERGIRL', 'ARROW', 'FLASH', 'LEGENDS_OF_TOMORROW'];
    // ... implement crossover handling similar to Python version ...
}

async function getFullSeriesEpisodeList(excludedSeries = [], fromDate = null, toDate = null) {
    const showsToGet = Object.values(SHOW_DICT_WITH_NAMES)
        .filter(show => !excludedSeries.includes(show.id));

    try {
        const showPromises = showsToGet.map(async show => {
            const response = await fetch(show.root + show.url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return parseEpisodeList(doc, show.name);
        });

        const showLists = await Promise.all(showPromises);
        return sortAndFilterEpisodes(showLists, fromDate, toDate);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        throw error;
    }
}

function sortAndFilterEpisodes(showListSet, fromDate = null, toDate = null) {
    let fullList = [];
    const showsInList = [];

    showListSet.forEach(showList => {
        fullList.push(...showList);
        showsInList.push(showList[0].series.toUpperCase());
    });

    fullList = fullList
        .map(entry => ({
            ...entry,
            airDate: new Date(entry.airDate)
        }))
        .sort((a, b) => a.airDate - b.airDate);

    handleCrossoverOrder(fullList, showsInList);
    // ... implement other special case handlers ...

    fullList = filterByAirDate(fullList, fromDate, toDate);

    return fullList.map((row, index) => ({
        ...row,
        rowNumber: index + 1,
        airDate: row.airDate.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }));
}

export { getFullSeriesEpisodeList };
