/**
 * Сервер автообновлений для Tauri приложения
 * Запуск: node updater-server.js
 * Порт: 3002 (или PORT из переменной окружения)
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.UPDATER_PORT || 3002;
const UPDATES_DIR = path.join(__dirname, "..", "updates");

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS для разрешения запросов из приложения
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Статические файлы релизов
app.use("/releases", express.static(path.join(UPDATES_DIR, "releases")));

/**
 * Endpoint для проверки обновлений
 * GET /updates/:target/:current_version
 * 
 * :target - платформа (windows-x86_64, darwin-aarch64, darwin-x86_64, linux-x86_64)
 * :current_version - текущая версия приложения
 * 
 * Возвращает JSON с информацией о доступном обновлении
 */
app.get("/updates/:target/:current_version", (req, res) => {
  const { target, current_version } = req.params;
  
  console.log(`Checking update for ${target}, current version: ${current_version}`);

  // Читаем releases.json
  const releasesPath = path.join(UPDATES_DIR, "releases.json");
  
  if (!fs.existsSync(releasesPath)) {
    console.log("No releases.json found");
    return res.status(204).send(); // No Content - нет обновлений
  }

  let releases;
  try {
    releases = JSON.parse(fs.readFileSync(releasesPath, "utf8"));
  } catch (err) {
    console.error("Error reading releases.json:", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  // Находим последний релиз для данной платформы
  const platformReleases = releases.filter(r => 
    r.platforms && r.platforms[target]
  );

  if (platformReleases.length === 0) {
    console.log(`No releases found for platform: ${target}`);
    return res.status(204).send();
  }

  // Сортируем по версии (предполагается semver)
  platformReleases.sort((a, b) => compareVersions(b.version, a.version));
  const latestRelease = platformReleases[0];

  // Проверяем, нужно ли обновление
  if (compareVersions(latestRelease.version, current_version) <= 0) {
    console.log(`Current version ${current_version} is up to date`);
    return res.status(204).send();
  }

  // Формируем ответ
  const platform = latestRelease.platforms[target];
  const response = {
    version: latestRelease.version,
    notes: latestRelease.notes || `Обновление до версии ${latestRelease.version}`,
    pub_date: latestRelease.pub_date || new Date().toISOString(),
    platforms: {
      [target]: {
        signature: platform.signature,
        url: platform.url.startsWith("http") 
          ? platform.url 
          : `${req.protocol}://${req.get("host")}${platform.url}`
      }
    }
  };

  console.log(`Update available: ${latestRelease.version}`);
  res.json(response);
});

// Healthcheck endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "tauri-updater" });
});

// Информация о доступных релизах
app.get("/releases-info", (req, res) => {
  const releasesPath = path.join(UPDATES_DIR, "releases.json");
  
  if (!fs.existsSync(releasesPath)) {
    return res.json({ releases: [] });
  }

  try {
    const releases = JSON.parse(fs.readFileSync(releasesPath, "utf8"));
    res.json({ releases });
  } catch (err) {
    res.status(500).json({ error: "Error reading releases" });
  }
});

// Сравнение версий (простая semver реализация)
function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);
  
  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

// Запуск сервера
app.listen(PORT, () => {
  console.log("\n=== Tauri Updater Server ===");
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Updates directory: ${UPDATES_DIR}`);
  console.log(`\nEndpoints:`);
  console.log(`  - GET /updates/:target/:version - Check for updates`);
  console.log(`  - GET /releases/:filename - Download release file`);
  console.log(`  - GET /releases-info - List all releases`);
  console.log(`  - GET /health - Health check`);
  console.log("\n");
});

module.exports = app;
