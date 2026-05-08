.PHONY: windows windows-fast clean deploy deploy-updater release

VITE_PB_URL   ?= https://admin.weche.ru
TARGET         = x86_64-pc-windows-gnu
BUNDLE_DIR     = src-tauri/target/$(TARGET)/release/bundle/nsis

GHCR_FRONTEND  = ghcr.io/berasta/veche-app
GHCR_UPDATER   = ghcr.io/berasta/veche-updater
NAMESPACE      = veche
UPDATES_DIR    = ../updates

# ─── Windows build ───────────────────────────────────────────────────────────

windows:
	VITE_PB_URL=$(VITE_PB_URL) npm run build
	npx tauri build --target $(TARGET)
	@echo ""
	@echo "Готово: $(BUNDLE_DIR)/$(shell ls $(BUNDLE_DIR) 2>/dev/null | grep .exe | head -1)"

windows-fast:
	npx tauri build --target $(TARGET)
	@echo ""
	@echo "Готово: $(BUNDLE_DIR)/$(shell ls $(BUNDLE_DIR) 2>/dev/null | grep .exe | head -1)"

clean:
	rm -rf src-tauri/target/$(TARGET)

# ─── Deploy web frontend ─────────────────────────────────────────────────────

deploy:
	@echo "=== Building frontend image ==="
	docker build --platform linux/amd64 -t $(GHCR_FRONTEND):latest .
	@echo "=== Pushing ==="
	docker push $(GHCR_FRONTEND):latest
	@echo "=== Rolling out ==="
	kubectl rollout restart deployment/veche-frontend-app -n $(NAMESPACE)
	kubectl rollout status deployment/veche-frontend-app -n $(NAMESPACE) --timeout=120s
	@echo "=== Done ==="

# ─── Deploy updater server ───────────────────────────────────────────────────

deploy-updater:
	@echo "=== Building updater image ==="
	docker build --platform linux/amd64 -t $(GHCR_UPDATER):latest $(UPDATES_DIR)
	@echo "=== Pushing ==="
	docker push $(GHCR_UPDATER):latest
	@echo "=== Rolling out ==="
	kubectl set image deployment/veche-updater updater=$(GHCR_UPDATER):latest -n $(NAMESPACE)
	kubectl rollout status deployment/veche-updater -n $(NAMESPACE) --timeout=60s
	@echo "=== Done ==="

# ─── Full desktop release ────────────────────────────────────────────────────
# Usage: make release VERSION=0.4.0
# Requires ~/.tauri/veche.key (or override TAURI_KEY) and TAURI_KEY_PASS

TAURI_KEY      ?= $(HOME)/.tauri/veche.key
TAURI_KEY_PASS ?=

release:
ifndef VERSION
	@echo "Usage: make release VERSION=0.4.0"
	@exit 1
endif
	@echo "=== Release v$(VERSION) ==="
	@echo "--- 1/4 Bumping version ---"
	jq '.version = "$(VERSION)"' src-tauri/tauri.conf.json > src-tauri/tauri.conf.json.tmp \
		&& mv src-tauri/tauri.conf.json.tmp src-tauri/tauri.conf.json
	@echo "--- 2/4 Building Windows installer (signed) ---"
	TAURI_SIGNING_PRIVATE_KEY="$$(cat $(TAURI_KEY))" \
	TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$(TAURI_KEY_PASS)" \
	VITE_PB_URL=$(VITE_PB_URL) npm run build
	TAURI_SIGNING_PRIVATE_KEY="$$(cat $(TAURI_KEY))" \
	TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$(TAURI_KEY_PASS)" \
	npx tauri build --target $(TARGET)
	@echo "--- 3/4 Updating releases.json ---"
	$(eval INSTALLER := $(shell ls $(BUNDLE_DIR)/*.exe 2>/dev/null | head -1))
	@[ -f "$(INSTALLER).sig" ] || (echo "ERROR: $(INSTALLER).sig not found. Is TAURI_SIGNING_PRIVATE_KEY set?" && exit 1)
	@mkdir -p $(UPDATES_DIR)/releases
	cp "$(INSTALLER)" "$(UPDATES_DIR)/releases/"
	node -e "\
		const fs = require('fs'); \
		const p = '$(UPDATES_DIR)/releases.json'; \
		const cfg = JSON.parse(fs.readFileSync(p, 'utf8')); \
		const file = require('path').basename('$(INSTALLER)'); \
		const sig = fs.readFileSync('$(INSTALLER).sig', 'utf8').trim(); \
		const entry = { version: '$(VERSION)', notes: 'Обновление до версии $(VERSION)', \
			pub_date: new Date().toISOString(), \
			platforms: { 'windows-x86_64': { signature: sig, url: '/releases/' + file } } }; \
		cfg.releases = [entry, ...cfg.releases.filter(r => r.version !== '$(VERSION)')]; \
		fs.writeFileSync(p, JSON.stringify(cfg, null, 2)); \
		console.log('releases.json updated for v$(VERSION)'); \
	"
	@echo "--- 4/4 Deploying updater ---"
	$(MAKE) deploy-updater
	@echo ""
	@echo "=== Release v$(VERSION) done! ==="
	@echo "Installer: $(INSTALLER)"
