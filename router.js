import { getFullSeriesEpisodeList } from './episode-fetcher.js';
import { generateAtomFeed } from './feed-generator.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.setupRoutes();
    }

    setupRoutes() {
        this.addRoute('/', this.index.bind(this));
        this.addRoute('/api', this.api.bind(this));
        this.addRoute('/recent_episodes.atom', this.recentEpisodes.bind(this));
        this.addRoute('/newest_first', this.indexNewestFirst.bind(this));
        this.addRoute('/hide/:hideList', this.indexWithHidden.bind(this));
        this.addRoute('/hide/:hideList/newest_first', this.indexWithHiddenNewestFirst.bind(this));
    }

    async handleRoute() {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        
        const newestFirst = params.get('newest_first') === 'true';
        const hideShows = params.getAll('hide_show');
        const fromDate = params.get('from_date');
        const toDate = params.get('to_date');

        const context = {
            newestFirst,
            hideShows,
            fromDate,
            toDate
        };

        try {
            const episodes = await getFullSeriesEpisodeList(hideShows, fromDate, toDate);
            context.tableContent = newestFirst ? episodes.reverse() : episodes;
            
            const route = this.findRoute(path);
            if (route) {
                await route.handler(context);
            }
        } catch (error) {
            console.error('Route handling error:', error);
        }
    }

    // Route handlers
    async index(context) {
        await this.renderTemplate('index.html', context);
    }

    async api(context) {
        return JSON.stringify(context.tableContent);
    }

    async recentEpisodes(context) {
        const episodes = context.tableContent.slice(0, 15);
        return generateAtomFeed(episodes);
    }

    // ... other route handlers ...
}

export const router = new Router();
