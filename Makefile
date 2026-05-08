.PHONY: windows windows-fast clean

VITE_PB_URL ?= https://admin.weche.ru
TARGET = x86_64-pc-windows-gnu
BUNDLE_DIR = src-tauri/target/$(TARGET)/release/bundle/nsis

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
