export const CROSSOVER_EVENTS = {
    'Crisis on Earth-X': {
        parts: [
            { series: 'Supergirl', episode: 'S03E08' },
            { series: 'Arrow', episode: 'S06E08' },
            { series: 'The Flash', episode: 'S04E08' },
            { series: "DC's Legends of Tomorrow", episode: 'S03E08' }
        ]
    },
    'Elseworlds': {
        parts: [
            { series: 'The Flash', episode: 'S05E09' },
            { series: 'Arrow', episode: 'S07E09' },
            { series: 'Supergirl', episode: 'S04E09' }
        ]
    },
    'Crisis on Infinite Earths': {
        parts: [
            { series: 'Supergirl', episode: 'S05E09' },
            { series: 'Batwoman', episode: 'S01E09' },
            { series: 'The Flash', episode: 'S06E09' },
            { series: 'Arrow', episode: 'S08E08' },
            { series: "DC's Legends of Tomorrow", episode: 'S05E00' }
        ]
    }
};

export function findCrossover(series, episodeCode) {
    for (const [name, event] of Object.entries(CROSSOVER_EVENTS)) {
        const partIndex = event.parts.findIndex(p => 
            p.series === series && p.episode === episodeCode
        );
        
        if (partIndex !== -1) {
            return {
                name,
                part: partIndex + 1,
                totalParts: event.parts.length
            };
        }
    }
    return null;
}
