const fp = require('fastify-plugin')

/**
 * Fastify API Discovery Plugin
 * Collects all registered routes and serves an interactive web dashboard & JSON endpoint
 */
async function apiDiscoveryPlugin(fastify, options) {
    const discoveredRoutes = []

    // Hook into route registration
    fastify.addHook('onRoute', (routeOptions) => {
        const methods = Array.isArray(routeOptions.method)
            ? routeOptions.method
            : [routeOptions.method]

        // Skip internal Fastify HEAD routes and the discovery routes themselves
        const filteredMethods = methods.filter((m) => m !== 'HEAD')
        if (filteredMethods.length === 0) return
        if (
            routeOptions.url === '/routes' ||
            routeOptions.url === '/discovery' ||
            routeOptions.url === '/api/v1/routes'
        ) {
            return
        }

        filteredMethods.forEach((method) => {
            const url = routeOptions.url
            const parts = url.split('/').filter(Boolean)
            const v1Index = parts.indexOf('v1')
            let group = 'general'
            if (v1Index !== -1 && parts[v1Index + 1]) {
                group = parts[v1Index + 1]
            } else if (parts[0]) {
                group = parts[0]
            }

            // Detect if route requires authentication
            const preHandlers = Array.isArray(routeOptions.preHandler)
                ? routeOptions.preHandler
                : routeOptions.preHandler
                  ? [routeOptions.preHandler]
                  : []

            const isAuth =
                url.includes('/profile') ||
                preHandlers.some(
                    (fn) =>
                        fn &&
                        (fn.name === 'auth' ||
                            fn.toString().includes('jwtVerify'))
                )

            // Extract schema parameters
            const schema = routeOptions.schema || {}
            const bodySchema = schema.body || null
            const querySchema = schema.querystring || schema.query || null
            const paramsSchema = schema.params || null
            const responseSchema = schema.response || null

            // Avoid duplicates
            const exists = discoveredRoutes.some(
                (r) => r.method === method && r.url === url
            )
            if (!exists) {
                discoveredRoutes.push({
                    method,
                    url,
                    group,
                    isAuth,
                    schema: {
                        body: bodySchema,
                        querystring: querySchema,
                        params: paramsSchema,
                        response: responseSchema,
                    },
                })
            }
        })
    })

    // Handler for rendering HTML or JSON
    const discoveryHandler = async (request, reply) => {
        const wantsJson =
            request.query.format === 'json' ||
            (request.headers['accept'] &&
                request.headers['accept'].includes('application/json'))

        // Sort routes: group ascending, then url ascending, then method
        const sortedRoutes = [...discoveredRoutes].sort((a, b) => {
            if (a.group !== b.group) return a.group.localeCompare(b.group)
            if (a.url !== b.url) return a.url.localeCompare(b.url)
            return a.method.localeCompare(b.method)
        })

        if (wantsJson) {
            const groups = [...new Set(sortedRoutes.map((r) => r.group))]
            return reply.send({
                total: sortedRoutes.length,
                groups,
                routes: sortedRoutes,
            })
        }

        const groups = [...new Set(sortedRoutes.map((r) => r.group))]
        const host =
            request.headers.host || `127.0.0.1:${process.env.APP_PORT || 5001}`
        const protocol = request.protocol || 'http'
        const baseUrl = `${protocol}://${host}`

        const html = renderDashboardHtml(sortedRoutes, groups, baseUrl)
        return reply.type('text/html').send(html)
    }

    // Register discovery endpoints
    fastify.get('/routes', discoveryHandler)
    fastify.get('/discovery', discoveryHandler)
    fastify.get('/api/v1/routes', discoveryHandler)

    // Log banner on ready
    fastify.addHook('onReady', async () => {
        const port = process.env.APP_PORT || 5001
        console.log(
            `\n\x1b[36m┌─────────────────────────────────────────────────────────────┐\x1b[0m`
        )
        console.log(
            `\x1b[36m│\x1b[0m \x1b[1m\x1b[32m🚀 API Discovery Dashboard Active\x1b[0m                           \x1b[36m│\x1b[0m`
        )
        console.log(
            `\x1b[36m│\x1b[0m ➜ Web Explorer: \x1b[4m\x1b[34mhttp://127.0.0.1:${port}/routes\x1b[0m             \x1b[36m│\x1b[0m`
        )
        console.log(
            `\x1b[36m│\x1b[0m ➜ JSON Export:  \x1b[4m\x1b[34mhttp://127.0.0.1:${port}/routes?format=json\x1b[0m \x1b[36m│\x1b[0m`
        )
        console.log(
            `\x1b[36m│\x1b[0m ➜ Total Routes: \x1b[1m\x1b[33m${discoveredRoutes.length} endpoints discovered\x1b[0m             \x1b[36m│\x1b[0m`
        )
        console.log(
            `\x1b[36m└─────────────────────────────────────────────────────────────┘\x1b[0m\n`
        )
    })
}

function renderDashboardHtml(routes, groups, baseUrl) {
    const serializedRoutes = JSON.stringify(routes).replace(/</g, '\\u003c')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rajbari City API Explorer</title>
  <style>
    :root {
      --bg: #090d16;
      --surface: #0f172a;
      --surface-hover: #1e293b;
      --surface-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --primary: #38bdf8;
      --primary-glow: rgba(56, 189, 248, 0.15);
      
      --badge-get-bg: rgba(14, 165, 233, 0.15);
      --badge-get-text: #38bdf8;
      --badge-post-bg: rgba(34, 197, 94, 0.15);
      --badge-post-text: #4ade80;
      --badge-put-bg: rgba(245, 158, 11, 0.15);
      --badge-put-text: #fbbf24;
      --badge-patch-bg: rgba(168, 85, 247, 0.15);
      --badge-patch-text: #c084fc;
      --badge-delete-bg: rgba(239, 68, 68, 0.15);
      --badge-delete-text: #f87171;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 60px;
    }

    /* Header */
    header {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid var(--surface-border);
      padding: 16px 24px;
    }
    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
      box-shadow: 0 0 16px var(--primary-glow);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .badge-count {
      font-size: 12px;
      padding: 3px 10px;
      background: rgba(56, 189, 248, 0.15);
      color: var(--primary);
      border-radius: 9999px;
      font-weight: 600;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-json {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: var(--text-muted);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-json:hover {
      background: var(--surface-hover);
      color: var(--text);
      border-color: var(--primary);
    }

    /* Controls Bar */
    .controls-container {
      max-width: 1400px;
      margin: 24px auto 0;
      padding: 0 24px;
    }
    .search-row {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      align-items: center;
    }
    .search-wrapper {
      flex: 1;
      min-width: 280px;
      position: relative;
    }
    .search-input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: var(--text);
      padding: 12px 16px 12px 42px;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-dim);
      pointer-events: none;
    }

    .filter-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .pill {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: var(--text-muted);
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s;
    }
    .pill:hover {
      background: var(--surface-hover);
      color: var(--text);
    }
    .pill.active {
      background: var(--primary);
      color: #04101e;
      border-color: var(--primary);
    }

    .select-group {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: var(--text);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      outline: none;
      cursor: pointer;
    }

    /* Main Container */
    main {
      max-width: 1400px;
      margin: 24px auto 0;
      padding: 0 24px;
    }

    .stats-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: var(--text-dim);
      font-size: 13px;
    }

    /* Route Cards */
    .routes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .route-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 10px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .route-card:hover {
      border-color: #475569;
    }
    .route-header {
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      gap: 14px;
    }
    .route-left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      overflow: hidden;
    }
    .method-badge {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      min-width: 65px;
      text-align: center;
      letter-spacing: 0.05em;
    }
    .method-GET { background: var(--badge-get-bg); color: var(--badge-get-text); border: 1px solid rgba(56, 189, 248, 0.3); }
    .method-POST { background: var(--badge-post-bg); color: var(--badge-post-text); border: 1px solid rgba(34, 197, 94, 0.3); }
    .method-PUT { background: var(--badge-put-bg); color: var(--badge-put-text); border: 1px solid rgba(245, 158, 11, 0.3); }
    .method-PATCH { background: var(--badge-patch-bg); color: var(--badge-patch-text); border: 1px solid rgba(168, 85, 247, 0.3); }
    .method-DELETE { background: var(--badge-delete-bg); color: var(--badge-delete-text); border: 1px solid rgba(239, 68, 68, 0.3); }

    .route-path {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      word-break: break-all;
    }
    .route-path span.param {
      color: #fb923c;
    }

    .route-tags {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .tag {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 500;
      background: rgba(148, 163, 184, 0.1);
      color: var(--text-muted);
      border: 1px solid rgba(148, 163, 184, 0.15);
      text-transform: capitalize;
    }
    .tag.auth {
      background: rgba(234, 179, 8, 0.1);
      color: #facc15;
      border-color: rgba(234, 179, 8, 0.25);
    }
    .tag.public {
      background: rgba(56, 189, 248, 0.08);
      color: #7dd3fc;
      border-color: rgba(56, 189, 248, 0.2);
    }
    .tag.schema {
      background: rgba(168, 85, 247, 0.1);
      color: #c084fc;
      border-color: rgba(168, 85, 247, 0.2);
    }

    .route-arrow {
      color: var(--text-dim);
      font-size: 12px;
      transition: transform 0.2s;
    }
    .route-card.open .route-arrow {
      transform: rotate(90deg);
    }

    /* Route Details Expansion */
    .route-details {
      display: none;
      padding: 16px 18px 20px;
      background: #090e1a;
      border-top: 1px solid var(--surface-border);
      font-size: 13px;
    }
    .route-card.open .route-details {
      display: block;
    }

    .actions-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 16px;
    }
    .btn-action {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-action:hover {
      background: var(--surface-hover);
      color: var(--text);
      border-color: var(--primary);
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      margin: 14px 0 8px;
    }

    pre.code-block {
      background: #020617;
      border: 1px solid #1e293b;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #e2e8f0;
      overflow-x: auto;
      max-height: 280px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-dim);
      font-size: 15px;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      border: 1px solid var(--primary);
      color: var(--text);
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.2s;
      pointer-events: none;
      z-index: 100;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
</head>
<body>

  <header>
    <div class="header-inner">
      <div class="brand">
        <div class="brand-icon">RC</div>
        <div>
          <div class="brand-title">Rajbari City API Explorer</div>
        </div>
        <span class="badge-count" id="totalCountBadge">${routes.length} routes</span>
      </div>
      <div class="header-actions">
        <a href="?format=json" target="_blank" class="btn-json">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Export JSON
        </a>
      </div>
    </div>
  </header>

  <div class="controls-container">
    <div class="search-row">
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" class="search-input" placeholder="Search by route URL, method, module (e.g. auth, /blood, :id)..." autofocus>
      </div>

      <div class="filter-pills" id="methodPills">
        <div class="pill active" data-method="ALL">ALL</div>
        <div class="pill" data-method="GET">GET</div>
        <div class="pill" data-method="POST">POST</div>
        <div class="pill" data-method="PATCH">PATCH</div>
        <div class="pill" data-method="PUT">PUT</div>
        <div class="pill" data-method="DELETE">DELETE</div>
      </div>

      <select id="groupSelect" class="select-group">
        <option value="ALL">All Modules (${groups.length})</option>
        ${groups.map((g) => `<option value="${g}">${g.toUpperCase()}</option>`).join('')}
      </select>

      <div class="filter-pills" id="authPills">
        <div class="pill active" data-auth="ALL">All Access</div>
        <div class="pill" data-auth="AUTH">🔒 Auth Only</div>
        <div class="pill" data-auth="PUBLIC">🌐 Public Only</div>
      </div>
    </div>
  </div>

  <main>
    <div class="stats-bar">
      <span id="resultCount">Showing ${routes.length} of ${routes.length} routes</span>
      <span style="font-family: ui-monospace, monospace;">Host: ${baseUrl}</span>
    </div>

    <div class="routes-list" id="routesList"></div>
    <div class="empty-state" id="emptyState" style="display: none;">No routes matched your search criteria.</div>
  </main>

  <div class="toast" id="toast">Copied to clipboard!</div>

  <script>
    const allRoutes = ${serializedRoutes};
    const baseUrl = ${JSON.stringify(baseUrl)};
    let selectedMethod = 'ALL';
    let selectedGroup = 'ALL';
    let selectedAuth = 'ALL';
    let searchQuery = '';

    const routesListEl = document.getElementById('routesList');
    const emptyStateEl = document.getElementById('emptyState');
    const resultCountEl = document.getElementById('resultCount');
    const searchInputEl = document.getElementById('searchInput');
    const groupSelectEl = document.getElementById('groupSelect');
    const toastEl = document.getElementById('toast');

    function showToast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      setTimeout(() => toastEl.classList.remove('show'), 2000);
    }

    function formatPath(path) {
      return path.replace(/(:\w+)/g, '<span class="param">$1</span>');
    }

    function generateCurl(route) {
      let cmd = 'curl -X ' + route.method + ' "' + baseUrl + route.url + '"';
      if (route.isAuth) {
        cmd += ' \\\n  -H "Authorization: Bearer YOUR_TOKEN_HERE"';
      }
      if (['POST', 'PATCH', 'PUT'].includes(route.method)) {
        cmd += ' \\\n  -H "Content-Type: application/json"';
        const sampleBody = generateSampleBody(route.schema ? route.schema.body : null);
        cmd += ' \\\n  -d \\'' + JSON.stringify(sampleBody, null, 2) + '\\'';
      }
      return cmd;
    }

    function generateSampleBody(bodySchema) {
      if (!bodySchema || !bodySchema.properties) return {};
      const obj = {};
      for (const [key, val] of Object.entries(bodySchema.properties)) {
        if (val.enum && val.enum.length > 0) {
          obj[key] = val.enum[0];
        } else if (val.type === 'string') {
          obj[key] = key.toLowerCase().includes('otp') ? '1234' : 'string';
        } else if (val.type === 'number' || val.type === 'integer') {
          obj[key] = 1;
        } else if (val.type === 'boolean') {
          obj[key] = true;
        } else if (val.type === 'array') {
          obj[key] = [];
        } else {
          obj[key] = null;
        }
      }
      return obj;
    }

    function renderRoutes() {
      const filtered = allRoutes.filter(r => {
        if (selectedMethod !== 'ALL' && r.method !== selectedMethod) return false;
        if (selectedGroup !== 'ALL' && r.group !== selectedGroup) return false;
        if (selectedAuth === 'AUTH' && !r.isAuth) return false;
        if (selectedAuth === 'PUBLIC' && r.isAuth) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchUrl = r.url.toLowerCase().includes(q);
          const matchMethod = r.method.toLowerCase().includes(q);
          const matchGroup = r.group.toLowerCase().includes(q);
          if (!matchUrl && !matchMethod && !matchGroup) return false;
        }
        return true;
      });

      resultCountEl.textContent = 'Showing ' + filtered.length + ' of ' + allRoutes.length + ' routes';
      routesListEl.innerHTML = '';

      if (filtered.length === 0) {
        emptyStateEl.style.display = 'block';
        return;
      }
      emptyStateEl.style.display = 'none';

      filtered.forEach((r, idx) => {
        const card = document.createElement('div');
        card.className = 'route-card';
        card.id = 'route-' + idx;

        const hasSchema = !!(r.schema && (r.schema.body || r.schema.querystring || r.schema.params));

        card.innerHTML = \`
          <div class="route-header" onclick="toggleCard('\${idx}')">
            <div class="route-left">
              <span class="method-badge method-\${r.method}">\${r.method}</span>
              <span class="route-path">\${formatPath(r.url)}</span>
            </div>
            <div class="route-tags">
              <span class="tag">\${r.group}</span>
              <span class="tag \${r.isAuth ? 'auth' : 'public'}">\${r.isAuth ? '🔒 Auth' : '🌐 Public'}</span>
              \${hasSchema ? '<span class="tag schema">Schema</span>' : ''}
              <span class="route-arrow">▶</span>
            </div>
          </div>
          <div class="route-details" id="details-\${idx}">
            <div class="actions-bar">
              <button class="btn-action" onclick="copyText('\${baseUrl}\${r.url}', 'Full URL copied!')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy URL
              </button>
              <button class="btn-action" onclick="copyCurl('\${idx}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                Copy cURL
              </button>
            </div>

            <div class="section-title">cURL Command</div>
            <pre class="code-block" id="curl-code-\${idx}">\${escapeHtml(generateCurl(r))}</pre>

            \${r.schema && r.schema.body ? \`
              <div class="section-title">Request Body Schema</div>
              <pre class="code-block">\${escapeHtml(JSON.stringify(r.schema.body, null, 2))}</pre>
            \` : ''}

            \${r.schema && r.schema.querystring ? \`
              <div class="section-title">Query Parameters Schema</div>
              <pre class="code-block">\${escapeHtml(JSON.stringify(r.schema.querystring, null, 2))}</pre>
            \` : ''}

            \${r.schema && r.schema.params ? \`
              <div class="section-title">URL Params Schema</div>
              <pre class="code-block">\${escapeHtml(JSON.stringify(r.schema.params, null, 2))}</pre>
            \` : ''}
          </div>
        \`;
        routesListEl.appendChild(card);
      });
    }

    function toggleCard(idx) {
      const card = document.getElementById('route-' + idx);
      if (card) card.classList.toggle('open');
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function copyText(text, msg = 'Copied!') {
      navigator.clipboard.writeText(text).then(() => showToast(msg));
    }

    function copyCurl(idx) {
      const el = document.getElementById('curl-code-' + idx);
      if (el) {
        navigator.clipboard.writeText(el.textContent).then(() => showToast('cURL command copied!'));
      }
    }

    // Event listeners
    searchInputEl.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderRoutes();
    });

    document.getElementById('methodPills').addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      document.querySelectorAll('#methodPills .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedMethod = pill.dataset.method;
      renderRoutes();
    });

    document.getElementById('authPills').addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      document.querySelectorAll('#authPills .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedAuth = pill.dataset.auth;
      renderRoutes();
    });

    groupSelectEl.addEventListener('change', (e) => {
      selectedGroup = e.target.value;
      renderRoutes();
    });

    // Initial render
    renderRoutes();
  </script>
</body>
</html>`
}

module.exports = fp(apiDiscoveryPlugin, {
    name: 'apiDiscovery',
})
