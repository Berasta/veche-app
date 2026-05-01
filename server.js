const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

const PB_URL = process.env.VITE_PB_URL || "https://admin.weche.ru";
const APP_URL = process.env.APP_URL || "https://weche.ru";

function generateOgImage(name, code) {
  const encoded = encodeURIComponent(name || "Вече");
  // Generate an SVG preview card as data URL
  return `${APP_URL}/api/og?title=${encoded}&code=${code}`;
}

app.get("/invite/:code", async (req, res) => {
  const { code } = req.params;
  let title = "Вече — Приглашенiе";
  let desc = "Васъ приглашаютъ въ градъ на Вече. Присоединяйтесь къ бесѣдѣ!";
  let serverName = "";

  try {
    const resp = await fetch(`${PB_URL}/api/collections/invitations/records?filter=code=%22${code}%22`);
    const data = await resp.json();
    const invite = data?.items?.[0];
    if (invite) {
      const serverResp = await fetch(`${PB_URL}/api/collections/servers/records/${invite.server_id}`);
      const server = await serverResp.json();
      serverName = server.name;
      title = `Приглашенiе въ градъ "${server.name}"`;
      desc = `Васъ приглашаютъ въ "${server.name}" на Вече — древнерусскiй голосовой мессенджеръ.`;
    }
  } catch {}

  const ogImage = `${APP_URL}/logo.svg`;

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="icon" type="image/svg+xml" href="${APP_URL}/logo.svg" />

  <!-- Open Graph -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${APP_URL}/invite/${code}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta property="og:site_name" content="Вече" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- Telegram -->
  <meta property="telegram:channel" content="@veche_app" />

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
    <h1>${title}</h1>
    <p>Перенаправленiе въ градъ...</p>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.listen(PORT, () => console.log(`Meta server running on :${PORT}`));
