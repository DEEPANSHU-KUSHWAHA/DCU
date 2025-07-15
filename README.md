# Arrowverse Series Ordering

This is a project that aims to centralize the series in the Arrowverse that
have crossovers to make it easy to watch the episodes in the correct
order.

### How It Works:

This project dynamically fetches episode data from the [Arrow Wiki](http://arrow.fandom.com)
using their MediaWiki API. Episodes are automatically ordered by air date and
crossover information is extracted from episode descriptions.

The data is cached locally in your browser to improve performance and reduce
API calls. Manual refresh can be triggered from the interface.

### Currently Supported Series:

* Arrow
* Batwoman
* Black Lightning
* Constantine
* DC's Legends of Tomorrow
* The Flash
* Freedom Fighters: The Ray
* Stargirl
* Supergirl
* Superman & Lois
* Vixen

### How to Use the Website:

1. Open `index.html` in your web browser
2. Use the filter box to exclude specific shows
3. Set date ranges to filter episodes
4. Click "NEWEST FIRST" to change sort order
5. Click "DISABLE COLOR" to remove series colors
6. Click "TOGGLE DARK MODE" to switch theme
7. Check the checkbox in the "Watched" column to track viewed episodes
8. Click "REFRESH DATA" to fetch latest episodes from Arrow Wiki

Your watched status and cached episode data will be saved locally in your browser.
No installation or setup required - just open index.html and start tracking!
