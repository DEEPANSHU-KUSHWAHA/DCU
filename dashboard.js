// Admin Dashboard for Arrowverse Info
// No login required, accessible from sidebar



let dashboardState = {
    series: [], // {name, wikiUrl, color, ...}
    urls: [],   // {label, url}
    columns: [], // New state for columns
    errors: []
};

// Utility: log errors to dashboard
window.dashboardLogError = function(msg) {
    dashboardState.errors.push({
        time: new Date().toLocaleTimeString(),
        message: msg
    });
    renderDashboardErrors();
};
window.onerror = function(msg, url, line, col, error) {
    dashboardLogError(`${msg} (${url}:${line})`);
};

// Utility to get/set dashboard series with backup for deleted items
function getDashboardSeries() {
    try {
        return JSON.parse(localStorage.getItem('dashboard_series')) || [];
    } catch {
        return [];
    }
}
function setDashboardSeries(seriesArr) {
    localStorage.setItem('dashboard_series', JSON.stringify(seriesArr));
}
function getDeletedSeriesBackup() {
    try {
        return JSON.parse(localStorage.getItem('dashboard_deleted_series')) || [];
    } catch {
        return [];
    }
}
function setDeletedSeriesBackup(arr) {
    localStorage.setItem('dashboard_deleted_series', JSON.stringify(arr));
}

// Add this at the very top of the file
function renderDashboardErrors(error) {
    const panel = document.getElementById('dashboardPanel');
    if (panel) {
        panel.innerHTML = `<div class="alert alert-danger">Dashboard Error: ${error}</div>`;
        panel.style.display = 'block';
    }
}

window.renderDashboard = function() {
    const panel = document.getElementById('dashboardPanel');
    if (!panel) return;

    let seriesArr = getDashboardSeries();
    let deletedArr = getDeletedSeriesBackup();

    // Add a blank row at the end for adding a new series
    const addRow = {
        name: '',
        wikiUrl: '',
        rowColor: '#222222',
        textColor: '#ffffff'
    };

    let html = `<h3>Manage Series</h3>
    <div class="table-responsive">
    <table class="table table-bordered align-middle" style="background:#232323;color:#fff;">
        <thead>
            <tr>
                <th style="min-width:120px;">Name</th>
                <th style="min-width:180px;">Wiki URL (API)</th>
                <th style="min-width:80px;">Row Color</th>
                <th style="min-width:80px;">Text Color</th>
                <th style="min-width:80px;">Preview</th>
                <th style="min-width:80px;">Action</th>
            </tr>
        </thead>
        <tbody id="series-list">
        ${seriesArr.map((s, idx) => `
            <tr>
                <td>
                    <input type="text" class="form-control form-control-sm series-name-input" value="${s.name}" data-idx="${idx}" placeholder="Series Name">
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm series-wikiurl-input" value="${s.wikiUrl || ''}" data-idx="${idx}" placeholder="Wiki URL">
                </td>
                <td>
                    <input type="color" class="form-control form-control-color series-rowcolor-input" value="${s.rowColor || '#222222'}" data-idx="${idx}" title="Row Color">
                </td>
                <td>
                    <input type="color" class="form-control form-control-color series-textcolor-input" value="${s.textColor || '#ffffff'}" data-idx="${idx}" title="Text Color">
                </td>
                <td>
                    <div style="width:80px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;
                        background:${s.rowColor || '#222'};color:${s.textColor || '#fff'};font-weight:bold;">
                        ${s.name}
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger delete-series-btn" data-idx="${idx}">Delete</button>
                </td>
            </tr>
        `).join('')}
        <tr>
            <td>
                <input type="text" class="form-control form-control-sm series-name-input" value="" data-idx="add" placeholder="New Series Name">
            </td>
            <td>
                <input type="text" class="form-control form-control-sm series-wikiurl-input" value="" data-idx="add" placeholder="Wiki URL">
            </td>
            <td>
                <input type="color" class="form-control form-control-color series-rowcolor-input" value="#222222" data-idx="add" title="Row Color">
            </td>
            <td>
                <input type="color" class="form-control form-control-color series-textcolor-input" value="#ffffff" data-idx="add" title="Text Color">
            </td>
            <td>
                <div style="width:80px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;
                    background:#222;color:#fff;font-weight:bold;">
                    <!-- Preview will update via JS -->
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-success add-series-btn" data-idx="add">Add</button>
            </td>
        </tr>
        </tbody>
    </table>
    </div>
    <button class="btn btn-success mb-3 ms-2" id="apply-changes-btn">Apply Changes</button>
    `;

    // Restore deleted section
    html += `<h4>Restore Deleted Series</h4>
    <ul class="list-group mb-3" id="deleted-series-list">
        ${deletedArr.length === 0 ? '<li class="list-group-item text-muted">No deleted series</li>' : ''}
        ${deletedArr.map((s, idx) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${s.name}</span>
                <button class="btn btn-sm btn-success restore-series-btn" data-idx="${idx}">Restore</button>
            </li>
        `).join('')}
    </ul>
    `;

    // Add a button to show debug logs
    html += `
    <button class="btn btn-secondary mb-3 ms-2" id="show-console-btn">Show Fetch Console</button>
    <pre id="dashboard-console" style="display:none;max-height:300px;overflow:auto;background:#181818;color:#0f0;padding:12px;border-radius:6px;font-size:13px;"></pre>
    `;

    panel.innerHTML = html;

    // Name edit handler
    panel.querySelectorAll('.series-name-input').forEach(input => {
        input.onchange = function() {
            const idx = this.dataset.idx;
            if (idx === "add") return; // handled by add button
            const arr = getDashboardSeries();
            arr[idx].name = this.value;
            setDashboardSeries(arr);
        };
    });

    // Wiki URL edit handler
    panel.querySelectorAll('.series-wikiurl-input').forEach(input => {
        input.onchange = function() {
            const idx = this.dataset.idx;
            if (idx === "add") return;
            const arr = getDashboardSeries();
            arr[idx].wikiUrl = this.value;
            setDashboardSeries(arr);
        };
    });

    // Row color edit handler
    panel.querySelectorAll('.series-rowcolor-input').forEach(input => {
        input.oninput = function() {
            const idx = this.dataset.idx;
            if (idx === "add") return;
            const arr = getDashboardSeries();
            arr[idx].rowColor = this.value;
            setDashboardSeries(arr);
        };
    });

    // Text color edit handler
    panel.querySelectorAll('.series-textcolor-input').forEach(input => {
        input.oninput = function() {
            const idx = this.dataset.idx;
            if (idx === "add") return;
            const arr = getDashboardSeries();
            arr[idx].textColor = this.value;
            setDashboardSeries(arr);
        };
    });

    // Add new series handler (from the blank row)
    panel.querySelector('.add-series-btn').onclick = function() {
        const name = panel.querySelector('.series-name-input[data-idx="add"]').value.trim();
        const wikiUrl = panel.querySelector('.series-wikiurl-input[data-idx="add"]').value.trim();
        const rowColor = panel.querySelector('.series-rowcolor-input[data-idx="add"]').value;
        const textColor = panel.querySelector('.series-textcolor-input[data-idx="add"]').value;
        if (!name) {
            alert('Please enter a series name.');
            return;
        }
        const arr = getDashboardSeries();
        arr.push({
            name,
            key: name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
            wikiUrl,
            rowColor,
            textColor
        });
        setDashboardSeries(arr);
        window.renderDashboard();
    };

    // Delete handler
    panel.querySelectorAll('.delete-series-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.dataset.idx);
            const arr = getDashboardSeries();
            const delArr = getDeletedSeriesBackup();
            const [removed] = arr.splice(idx, 1);
            if (removed) {
                delArr.push(removed);
                setDashboardSeries(arr);
                setDeletedSeriesBackup(delArr);
                window.renderDashboard();
            }
        };
    });

    // Restore handler
    panel.querySelectorAll('.restore-series-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.dataset.idx);
            const arr = getDashboardSeries();
            const delArr = getDeletedSeriesBackup();
            const [restored] = delArr.splice(idx, 1);
            if (restored) {
                arr.push(restored);
                setDashboardSeries(arr);
                setDeletedSeriesBackup(delArr);
                window.renderDashboard();
            }
        };
    });

    // Apply changes handler
    panel.querySelector('#apply-changes-btn').onclick = function() {
        window.renderDashboard();
        if (window.initializeApp) window.initializeApp();
    };

    // Show/hide debug logs on button click
    const showConsoleBtn = panel.querySelector('#show-console-btn');
    const dashboardConsole = panel.querySelector('#dashboard-console');
    if (showConsoleBtn && dashboardConsole) {
        showConsoleBtn.onclick = function() {
            if (dashboardConsole.style.display === 'none') {
                dashboardConsole.textContent = getDebugLogs();
                dashboardConsole.style.display = 'block';
                showConsoleBtn.textContent = 'Hide Fetch Console';
            } else {
                dashboardConsole.style.display = 'none';
                showConsoleBtn.textContent = 'Show Fetch Console';
            }
        };
    }
};

// Render dashboard UI
function renderDashboard() {
    const $dash = $('#dashboardPanel');
    $dash.html(`
        <div class="row mb-3">
            <div class="col-6">
                <h4 class="mb-2">API Sources</h4>
                <div class="mb-2 text-muted" style="font-size:14px;">These are the API endpoints used to fetch show and episode data. You can add, edit, or remove sources as needed.</div>
                <table class="table table-bordered" id="sourcesTable">
                    <thead><tr><th style="width:30%">Key</th><th style="width:60%">URL</th><th style="width:10%">Actions</th></tr></thead>
                    <tbody>
                        ${dashboardState.sources.map((s, i) => `
                            <tr>
                                <td><input value="${s.key}" data-idx="${i}" class="edit-source-key form-control" style="width:100%"></td>
                                <td><input value="${s.url}" data-idx="${i}" class="edit-source-url form-control" style="width:100%"></td>
                                <td>
                                    <button class="btn btn-danger btn-sm remove-source" data-idx="${i}">Remove</button>
                                    <a href="${s.url}" target="_blank" class="btn btn-info btn-sm ms-1">Visit</a>
                                </td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td><input placeholder="Key (e.g. ARROW_WIKI)" id="newSourceKey" class="form-control" style="width:100%"></td>
                            <td><input placeholder="API URL" id="newSourceUrl" class="form-control" style="width:100%"></td>
                            <td><button class="btn btn-success btn-sm" id="addSourceBtn">Add</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="col-6">
                <h4 class="mb-2">Series Management</h4>
                <div class="mb-2 text-muted" style="font-size:14px;">These are the TV shows tracked by the app. You can add, edit, or remove shows and their Wiki URLs.</div>
                <table class="table table-bordered" id="seriesTable">
                    <thead><tr><th>Name</th><th>Wiki URL</th><th>Color</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${dashboardState.series.map((s, i) => `
                            <tr>
                                <td><input value="${s.name}" data-idx="${i}" class="edit-series-name form-control"></td>
                                <td><input value="${s.wikiUrl}" data-idx="${i}" class="edit-series-url form-control"></td>
                                <td><input type="color" value="${s.color || '#cccccc'}" data-idx="${i}" class="edit-series-color"></td>
                                <td>
                                    <button class="btn btn-danger btn-sm remove-series" data-idx="${i}">Remove</button>
                                </td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td><input placeholder="New series name" id="newSeriesName" class="form-control"></td>
                            <td><input placeholder="Wiki URL (e.g. List_of_Arrow_episodes)" id="newSeriesUrl" class="form-control"></td>
                            <td><input type="color" id="newSeriesColor" value="#cccccc"></td>
                            <td><button class="btn btn-success btn-sm" id="addSeriesBtn">Add</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-6">
                <h4 class="mb-2">Custom URLs</h4>
                <ul id="urlList">
                    ${dashboardState.urls.map((u, i) => `
                        <li>
                            <input value="${u.label}" data-idx="${i}" class="edit-url-label">:
                            <input value="${u.url}" data-idx="${i}" class="edit-url-url">
                            <button class="btn btn-danger btn-sm remove-url" data-idx="${i}">Remove</button>
                        </li>
                    `).join('')}
                    <li>
                        <input placeholder="Label" id="newUrlLabel">
                        <input placeholder="URL" id="newUrlUrl">
                        <button class="btn btn-success btn-sm" id="addUrlBtn">Add</button>
                    </li>
                </ul>
            </div>
            <div class="col-6">
                <h4 class="mb-2">Columns</h4>
                <ul id="columnList">
                    ${dashboardState.columns?.map((col, i) => `
                        <li>
                            <input value="${col}" data-idx="${i}" class="edit-column-name">
                            <button class="btn btn-danger btn-sm remove-column" data-idx="${i}">Remove</button>
                        </li>
                    `).join('') || ''}
                    <li>
                        <input placeholder="New column name" id="newColumnName">
                        <button class="btn btn-success btn-sm" id="addColumnBtn">Add</button>
                    </li>
                </ul>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-12">
                <h4 class="mb-2">Other Options</h4>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="location.reload()">Reload Dashboard</button>
                </div>
            </div>
        </div>
    `);
}

// Helper to get and set SHOWS and SHOW_WIKI_URLS from global
function getSeriesFromGlobals() {
    if (window.SHOWS && window.SHOW_WIKI_URLS) {
        return Object.entries(window.SHOWS).map(([key, name]) => ({
            key,
            name,
            wikiUrl: window.SHOW_WIKI_URLS[name] || '',
            color: '#cccccc' // Default, can be enhanced
        }));
    }
    return [];
}
function updateGlobalsFromDashboard() {
    if (window.SHOWS && window.SHOW_WIKI_URLS) {
        // Clear and repopulate
        Object.keys(window.SHOWS).forEach(k => delete window.SHOWS[k]);
        Object.keys(window.SHOW_WIKI_URLS).forEach(k => delete window.SHOW_WIKI_URLS[k]);
        dashboardState.series.forEach(s => {
            window.SHOWS[s.key || s.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')] = s.name;
            window.SHOW_WIKI_URLS[s.name] = s.wikiUrl;
        });
        // Optionally persist to localStorage
        localStorage.setItem('dashboard_series', JSON.stringify(dashboardState.series));
    }
}
// On dashboard open, load from globals or localStorage
function loadDashboardState() {
    let loaded = false;
    if (localStorage.getItem('dashboard_series')) {
        try {
            dashboardState.series = JSON.parse(localStorage.getItem('dashboard_series'));
            loaded = true;
        } catch {}
    }
    if (!loaded) {
        dashboardState.series = getSeriesFromGlobals();
    }
    // URLs: can be extended
    dashboardState.urls = JSON.parse(localStorage.getItem('dashboard_urls') || '[]');
    // Columns: new state
    dashboardState.columns = JSON.parse(localStorage.getItem('dashboard_columns') || '[]');
    // Add SOURCES to dashboard state
    if (!dashboardState.sources) dashboardState.sources = JSON.parse(localStorage.getItem('dashboard_sources') || '[]');
}
// Save URLs on change
function saveDashboardUrls() {
    localStorage.setItem('dashboard_urls', JSON.stringify(dashboardState.urls));
}

// Default series for dashboard initialization
const DEFAULT_SERIES = [
    { name: 'Arrow', wikiUrl: 'List_of_Arrow_episodes', color: '#1e4620' },
    { name: 'Batwoman', wikiUrl: 'List_of_Batwoman_episodes', color: '#b71c1c' },
    { name: 'Black Lightning', wikiUrl: 'List_of_Black_Lightning_episodes', color: '#212121' },
    { name: 'Constantine', wikiUrl: 'List_of_Constantine_episodes', color: '#4a148c' },
    { name: 'The Flash', wikiUrl: 'List_of_The_Flash_(The_CW)_episodes', color: '#ba0c0c' },
    { name: 'Freedom Fighters: The Ray', wikiUrl: 'Freedom_Fighters:_The_Ray', color: '#ffb300' },
    { name: "DC's Legends of Tomorrow", wikiUrl: "List_of_DC's_Legends_of_Tomorrow_episodes", color: '#7b1fa2' },
    { name: 'Stargirl', wikiUrl: 'List_of_Stargirl_episodes', color: '#1976d2' },
    { name: 'Supergirl', wikiUrl: 'List_of_Supergirl_episodes', color: '#0d47a1' },
    { name: 'Superman & Lois', wikiUrl: 'List_of_Superman_&_Lois_episodes', color: '#01579b' },
    { name: 'Vixen', wikiUrl: 'List_of_Vixen_episodes', color: '#388e3c' },
    { name: 'Birds of Prey', wikiUrl: 'List_of_Birds_of_Prey_episodes', color: '#607d8b' },
    { name: 'Crossovers', wikiUrl: 'List_of_crossover_episodes', color: '#ff9800' },
    { name: 'The Sandman', wikiUrl: 'List_of_The_Sandman_episodes', color: '#263238' },
    { name: 'Lucifer', wikiUrl: 'List_of_Lucifer_episodes', color: '#880e4f' },
    { name: 'Titans', wikiUrl: 'List_of_Titans_episodes', color: '#37474f' },
    { name: 'Doom Patrol', wikiUrl: 'List_of_Doom_Patrol_episodes', color: '#5d4037' },
    { name: 'Gotham', wikiUrl: 'List_of_Gotham_episodes', color: '#263238' },
    { name: 'Pennyworth', wikiUrl: 'List_of_Pennyworth_episodes', color: '#6d4c41' },
    { name: 'Justice League (DCEU)', wikiUrl: 'List_of_Justice_League_(DCEU)_episodes', color: '#212121' }
];
// Initialize dashboardState.series with defaults if empty
if (!dashboardState.series || !dashboardState.series.length) {
    dashboardState.series = JSON.parse(localStorage.getItem('dashboard_series') || 'null') || DEFAULT_SERIES;
    localStorage.setItem('dashboard_series', JSON.stringify(dashboardState.series));
}

// Render and event handlers for dashboard
$(document).ready(function() {
    // Only show console toggle if on dashboard.html
    if (window.location.pathname.endsWith('dashboard.html') && $('#dashboardPanel').length) {
        if (!$('#dashboardConsoleToggle').length) {
            $('body').append('<button id="dashboardConsoleToggle" style="position:fixed;bottom:16px;right:16px;z-index:9999;background:#222;color:#fff;border:none;padding:10px 18px;border-radius:6px;box-shadow:0 2px 8px #000;">Console</button>');
        }
        if (!$('#dashboardConsolePanel').length) {
            $('body').append('<div id="dashboardConsolePanel" style="display:none;position:fixed;bottom:60px;right:16px;width:420px;height:180px;background:#181818;color:#b9f5d8;font-family:monospace;font-size:13px;border-radius:8px;box-shadow:0 2px 16px #000;z-index:9999;overflow:auto;padding:10px 12px;opacity:0.95;">Console</div>');
        }
        $('#dashboardConsoleToggle').off('click').on('click', function() {
            $('#dashboardConsolePanel').toggle();
        });
    } else {
        $('#dashboardConsolePanel').remove();
        $('#dashboardConsoleToggle').remove();
    }

    // Initial load
    loadDashboardState();
    renderDashboard();

    // Event handlers
    $(document).on('click', '#addSeriesBtn', function() {
        const name = $('#newSeriesName').val().trim();
        const wikiUrl = $('#newSeriesUrl').val().trim();
        const color = $('#newSeriesColor').val();
        if (name && wikiUrl) {
            dashboardState.series.push({name, wikiUrl, color});
            renderDashboard();
        }
    });
    $(document).on('click', '.remove-series', function() {
        const idx = $(this).data('idx');
        dashboardState.series.splice(idx, 1);
        renderDashboard();
    });
    $(document).on('input', '.edit-series-name', function() {
        dashboardState.series[$(this).data('idx')].name = $(this).val();
    });
    $(document).on('input', '.edit-series-url', function() {
        dashboardState.series[$(this).data('idx')].wikiUrl = $(this).val();
    });
    $(document).on('input', '.edit-series-color', function() {
        dashboardState.series[$(this).data('idx')].color = $(this).val();
    });
    $(document).on('click', '#addUrlBtn', function() {
        const label = $('#newUrlLabel').val().trim();
        const url = $('#newUrlUrl').val().trim();
        if (label && url) {
            dashboardState.urls.push({label, url});
            renderDashboard();
        }
    });
    $(document).on('click', '.remove-url', function() {
        const idx = $(this).data('idx');
        dashboardState.urls.splice(idx, 1);
        renderDashboard();
    });
    $(document).on('input', '.edit-url-label', function() {
        dashboardState.urls[$(this).data('idx')].label = $(this).val();
    });
    $(document).on('input', '.edit-url-url', function() {
        dashboardState.urls[$(this).data('idx')].url = $(this).val();
    });
    $(document).on('click', '#addColumnBtn', function() {
        const name = $('#newColumnName').val().trim();
        if (name) {
            dashboardState.columns.push(name);
            localStorage.setItem('dashboard_columns', JSON.stringify(dashboardState.columns));
            renderDashboard();
        }
    });
    $(document).on('click', '.remove-column', function() {
        const idx = $(this).data('idx');
        dashboardState.columns.splice(idx, 1);
        localStorage.setItem('dashboard_columns', JSON.stringify(dashboardState.columns));
        renderDashboard();
    });
    $(document).on('input', '.edit-column-name', function() {
        dashboardState.columns[$(this).data('idx')] = $(this).val();
        localStorage.setItem('dashboard_columns', JSON.stringify(dashboardState.columns));
    });
    $(document).on('click', '#addSourceBtn', function() {
        const key = $('#newSourceKey').val().trim();
        const url = $('#newSourceUrl').val().trim();
        if (key && url) {
            dashboardState.sources.push({key, url});
            localStorage.setItem('dashboard_sources', JSON.stringify(dashboardState.sources));
            renderDashboard();
        }
    });
    $(document).on('click', '.remove-source', function() {
        const idx = $(this).data('idx');
        dashboardState.sources.splice(idx, 1);
        localStorage.setItem('dashboard_sources', JSON.stringify(dashboardState.sources));
        renderDashboard();
    });
    $(document).on('input', '.edit-source-key', function() {
        dashboardState.sources[$(this).data('idx')].key = $(this).val();
        localStorage.setItem('dashboard_sources', JSON.stringify(dashboardState.sources));
    });
    $(document).on('input', '.edit-source-url', function() {
        dashboardState.sources[$(this).data('idx')].url = $(this).val();
        localStorage.setItem('dashboard_sources', JSON.stringify(dashboardState.sources));
    });

    // Override showDashboard to load state and update globals on close
    document.showDashboard = function() {
        loadDashboardState();
        $('#mainContent').hide();
        $('#dashboardPanel').show();
        renderDashboard();
    };
    document.hideDashboard = function() {
        $('#dashboardPanel').hide();
        $('#mainContent').show();
        updateGlobalsFromDashboard();
        // Optionally, refresh main app (if needed)
        if (window.initializeApp) window.initializeApp();
    };

    // Update event handlers to save on change
    $(document).on('input', '.edit-series-name, .edit-series-url, .edit-series-color', function() {
        updateGlobalsFromDashboard();
    });
    $(document).on('input', '.edit-url-label, .edit-url-url', function() {
        saveDashboardUrls();
    });
    $(document).on('click', '#addSeriesBtn, .remove-series', function() {
        updateGlobalsFromDashboard();
    });
    $(document).on('click', '#addUrlBtn, .remove-url', function() {
        saveDashboardUrls();
    });
    $(document).on('click', '#addColumnBtn, .remove-column', function() {
        localStorage.setItem('dashboard_columns', JSON.stringify(dashboardState.columns));
    });

    // Render logs/errors to the terminal console
    function renderDashboardErrors() {
        const $console = $('#dashboardConsolePanel');
        const html = dashboardState.errors.map(e => `<div>[${e.time}] ${e.message}</div>`).join('');
        if ($console.length) $console.html('<b style="color:#fff;">Console</b><hr style="margin:4px 0;">' + html);
    }
    // Add a log function for API/show fetching
    window.dashboardLog = function(msg) {
        if (!dashboardState.errors) dashboardState.errors = [];
        dashboardState.errors.push({ time: new Date().toLocaleTimeString(), message: msg });
        renderDashboardErrors();
    };
});

