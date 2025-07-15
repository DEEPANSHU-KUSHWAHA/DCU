export function generateAtomFeed(episodes) {
    const feed = document.implementation.createDocument(null, 'feed', null);
    feed.documentElement.setAttribute('xmlns', 'http://www.w3.org/2005/Atom');

    const title = feed.createElement('title');
    title.textContent = 'Arrowverse.info - Recent Episodes';
    feed.documentElement.appendChild(title);

    episodes.forEach(episode => {
        const entry = feed.createElement('entry');
        
        const entryTitle = feed.createElement('title');
        entryTitle.textContent = `${episode.series} - ${episode.episode_id} - ${episode.episode_name}`;
        entry.appendChild(entryTitle);

        const content = feed.createElement('content');
        content.textContent = `${episode.series} ${episode.episode_id} ${episode.episode_name} will air on ${episode.air_date}`;
        entry.appendChild(content);

        feed.documentElement.appendChild(entry);
    });

    return new XMLSerializer().serializeToString(feed);
}
