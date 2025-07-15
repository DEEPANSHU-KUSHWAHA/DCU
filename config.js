export const DEBUG = false;
export const REDIS_URL = 'redis://localhost:6379';
export const STATIC_CACHE_ID = Math.random().toString(36).substring(2, 8);
export const OLD_SITE_HOST = 'flash-arrow-order.herokuapp.com';
export const NEW_SITE_URL = 'https://arrowverse.info';

export const SHOWS = {
    // Arrowverse
    ARROW: 'Arrow',
    FLASH: 'The Flash',
    SUPERGIRL: 'Supergirl',
    LEGENDS: "DC's Legends of Tomorrow",
    BATWOMAN: 'Batwoman',
    BLACK_LIGHTNING: 'Black Lightning',
    SUPERMAN_AND_LOIS: 'Superman & Lois',
    
    // Other DC Shows
    GOTHAM: 'Gotham',
    TITANS: 'Titans',
    DOOM_PATROL: 'Doom Patrol',
    PENNYWORTH: 'Pennyworth',
    WATCHMEN: 'Watchmen',
    SANDMAN: 'The Sandman',
    SWEET_TOOTH: 'Sweet Tooth',
    PEACEMAKER: 'Peacemaker',
    SWAMP_THING: 'Swamp Thing',
    KRYPTON: 'Krypton',
    NAOMI: 'Naomi',
    DMZ: 'DMZ',
    
    // Animated Series
    HARLEY_QUINN: 'Harley Quinn',
    YOUNG_JUSTICE: 'Young Justice',
    BATMAN_TAS: 'Batman: The Animated Series',
    SUPERMAN_TAS: 'Superman: The Animated Series',
    JUSTICE_LEAGUE: 'Justice League',
    TEEN_TITANS: 'Teen Titans'
};

// Add universe groupings
export const UNIVERSES = {
    ARROWVERSE: ['ARROW', 'FLASH', 'SUPERGIRL', 'LEGENDS', 'BATWOMAN', 'BLACK_LIGHTNING', 'SUPERMAN_AND_LOIS'],
    TITANS_VERSE: ['TITANS', 'DOOM_PATROL'],
    GOTHAM_VERSE: ['GOTHAM', 'PENNYWORTH'],
    DCEU_TV: ['PEACEMAKER'],
    VERTIGO: ['SANDMAN', 'SWEET_TOOTH'],
    ANIMATED: ['HARLEY_QUINN', 'YOUNG_JUSTICE', 'BATMAN_TAS', 'SUPERMAN_TAS', 'JUSTICE_LEAGUE', 'TEEN_TITANS']
};

export const SOURCES = {
    ARROW_WIKI: 'https://arrow.fandom.com/api.php',
    ARROWVERSE_INFO: 'https://arrowverse.info',
    WIKIPEDIA: 'https://en.wikipedia.org/w/api.php'
};
