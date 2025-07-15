// Only export the dynamic fetchCrossoverEvents function
export async function fetchCrossoverEvents() {
    // Example sources (add more as needed)
    const sources = [
        {
            url: "https://arrow.fandom.com/api.php?action=parse&page=Invasion!_(crossover_event)&format=json&origin=*",
            event: "Invasion!"
        },
        {
            url: "https://arrow.fandom.com/api.php?action=parse&page=Crisis_on_Earth-X&format=json&origin=*",
            event: "Crisis on Earth-X"
        },
        {
            url: "https://arrow.fandom.com/api.php?action=parse&page=Elseworlds&format=json&origin=*",
            event: "Elseworlds"
        },
        {
            url: "https://arrow.fandom.com/api.php?action=parse&page=Crisis_on_Infinite_Earths&format=json&origin=*",
            event: "Crisis on Infinite Earths"
        }
    ];

    const crossovers = {};

    for (const src of sources) {
        try {
            const response = await fetch(src.url);
            const data = await response.json();
            const html = data.parse.text["*"];
            const doc = new DOMParser().parseFromString(html, "text/html");
            // You need to parse the correct table or section for each event
            // This is a placeholder: you must adapt the selector to the actual wiki structure
            const table = doc.querySelector("table.wikitable");
            if (!table) continue;

            const order = [];
            const episodes = {};

            table.querySelectorAll("tr").forEach((row, idx) => {
                if (idx === 0) return; // skip header
                const cells = row.querySelectorAll("td");
                if (cells.length >= 3) {
                    const show = cells[0].textContent.trim();
                    const episode = cells[1].textContent.trim();
                    order.push(show);
                    episodes[show] = episode;
                }
            });

            crossovers[src.event] = { order, episodes };
        } catch (e) {
            console.warn(`Failed to fetch crossover: ${src.event}`, e);
        }
    }

    return crossovers;
}

// Usage example in your main script:
// const crossovers = await fetchCrossoverEvents();
// ...then use crossovers like your old CROSSOVER_EVENTS...
