const WIKIPEDIA = 'wikipedia.org';

function urlForm(episodeName) {
    return episodeName.replace(/\s+/g, '_');
}

function getEpisodeUrl(episodeName, series, showConfig) {
    const rootUrl = showConfig[series].root;
    const fromWikipedia = rootUrl.includes(WIKIPEDIA);

    if (episodeName === 'Pilot' || fromWikipedia) {
        return rootUrl + urlForm(`${episodeName} (${series})`);
    }
    return rootUrl + urlForm(episodeName);
}

function getShowConfig() {
    return {
        'Arrow': { root: 'https://arrow.fandom.com/wiki/' },
        'The Flash': { root: 'https://arrow.fandom.com/wiki/' },
        'Supergirl': { root: 'https://arrow.fandom.com/wiki/' },
        'DC\'s Legends of Tomorrow': { root: 'https://arrow.fandom.com/wiki/' },
        // ...add other shows
    };
}

function sortEpisodes(episodes, newestFirst = false) {
    return episodes.sort((a, b) => {
        const dateA = new Date(a.airDate);
        const dateB = new Date(b.airDate);
        return newestFirst ? dateB - dateA : dateA - dateB;
    });
}
