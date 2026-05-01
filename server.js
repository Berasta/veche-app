const express = require("express");
const sharp = require("sharp");
const app = express();
const PORT = process.env.PORT || 3001;

const PB_URL = process.env.VITE_PB_URL || "https://admin.weche.ru";
const APP_URL = process.env.APP_URL || "https://weche.ru";

function generateSvg(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a120c"/>
      <stop offset="100%" stop-color="#2d2117"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#e8c56a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.3"/>
  <ellipse cx="600" cy="370" rx="350" ry="60" fill="#d4af37" opacity="0.06"/>
  <text x="600" y="210" text-anchor="middle" font-size="72" font-family="Apple Color Emoji,sans-serif">🏰</text>
  <text x="600" y="300" text-anchor="middle" fill="#d4af37" font-size="32" font-family="Georgia,serif" font-weight="600">Приглашенiе въ градъ</text>
  <text x="600" y="380" text-anchor="middle" fill="#f5ede0" font-size="56" font-family="Georgia,serif" font-weight="700">${escapeXml(name)}</text>
  <line x1="500" y1="410" x2="700" y2="410" stroke="#d4af37" stroke-width="2" opacity="0.4"/>
  <text x="600" y="450" text-anchor="middle" fill="#a89577" font-size="20" font-family="Georgia,serif">Вече — древнерусскiй голосовой мессенджеръ</text>
</svg>`;
}

// PNG preview card for OG image (converted from SVG via sharp)
app.get("/api/og", async (req, res) => {
  const name = req.query.title || "Вече";
  try {
    const svg = generateSvg(name);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Content-Length", png.length);
    res.send(png);
  } catch (e) {
    // fallback: return SVG if sharp fails
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(generateSvg(name));
  }
});

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

app.get("/invite/:code", async (req, res) => {
  const { code } = req.params;
  let title = "Вече — Приглашенiе";
  let desc = "Васъ приглашаютъ въ градъ на Вече. Присоединяйтесь къ бесѣдѣ!";
  let serverName = "Вече";

  try {
    const filter = `code = "${code}"`;
    const resp = await fetch(`${PB_URL}/api/collections/invitations/records?filter=${encodeURIComponent(filter)}`);
    const data = await resp.json();
    const invite = data?.items?.[0];
    if (invite) {
      const serverResp = await fetch(`${PB_URL}/api/collections/servers/records/${invite.server_id}`);
      if (serverResp.ok) {
        const server = await serverResp.json();
        serverName = server.name || "Градъ";
        title = `Приглашенiе въ градъ "${serverName}"`;
        desc = `Васъ приглашаютъ въ "${serverName}" на Вече — древнерусскiй голосовой мессенджеръ.`;
      }
    }
  } catch (e) {
    console.error("Meta server error:", e.message);
  }

  const ogImage = `${APP_URL}/api/og?title=${encodeURIComponent(serverName)}`;

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="icon" type="image/svg+xml" href="${APP_URL}/logo.svg" />

  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${APP_URL}/invite/${code}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="Вече" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <meta http-equiv="refresh" content="0;url=/join/${code}" />

  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a120c; color: #f5ede0; font-family: Georgia, serif; }
    .card { text-align: center; padding: 2rem; }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem; color: #d4af37; }
    p { font-size: 0.9rem; color: #a89577; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🏰</div>
    <h1>${escapeHtml(title)}</h1>
    <p>Перенаправленiе въ градъ...</p>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

app.listen(PORT, () => console.log(`Meta server running on :${PORT}`));
