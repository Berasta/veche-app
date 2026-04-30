const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

const PB_URL = process.env.VITE_PB_URL || "https://admin.weche.ru";

app.get("/invite/:code", async (req, res) => {
  const { code } = req.params;
  let title = "Вече — Приглашенiе";
  let desc = "Васъ приглашаютъ въ градъ на Вече";
  let image = "https://weche.ru/logo.svg";

  try {
    const resp = await fetch(`${PB_URL}/api/collections/invitations/records?filter=code=%22${code}%22`);
    const data = await resp.json();
    const invite = data?.items?.[0];
    if (invite) {
      const serverResp = await fetch(`${PB_URL}/api/collections/servers/records/${invite.server_id}`);
      const server = await serverResp.json();
      title = `Приглашенiе въ "${server.name}"`;
      desc = `Васъ приглашаютъ въ градъ "${server.name}" на Вече. Присоединяйтесь къ бесѣдѣ!`;
    }
  } catch {}

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://weche.ru/invite/${code}" />
  ${image ? `<meta property="og:image" content="${image}" />` : ""}
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
   <meta http-equiv="refresh" content="0;url=/join/${code}" />
</head>
<body>
  <p>Перенаправленiе...</p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.listen(PORT, () => console.log(`Meta server running on :${PORT}`));
