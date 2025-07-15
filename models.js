class Episode {
    constructor({
        name,
        show,
        synopsis = '',
        link = '',
        airDate = null,
        watched = false
    }) {
        this.name = name;
        this.show = show;
        this.synopsis = synopsis;
        this.link = link;
        this.airDate = airDate ? new Date(airDate) : null;
        this.watched = watched;
    }

    toString() {
        return this.name;
    }
}

class Show {
    constructor({
        name,
        htmlId,
        sourceUrl
    }) {
        this.name = name;
        this.htmlId = htmlId;
        this.sourceUrl = sourceUrl;
        this.episodes = [];
    }

    toString() {
        return this.name;
    }

    addEpisode(episode) {
        this.episodes.push(episode);
    }
}

class ShowEpisodeOrder {
    constructor({
        showOrder = {},
        start = null,
        end = null
    }) {
        this.showOrder = showOrder;
        this.start = start ? new Date(start) : null;
        this.end = end ? new Date(end) : null;
    }

    setDateRange(start, end) {
        this.start = start ? new Date(start) : null;
        this.end = end ? new Date(end) : null;
    }
}

export { Episode, Show, ShowEpisodeOrder };
