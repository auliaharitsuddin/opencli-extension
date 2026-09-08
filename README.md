# OpenCLI Extension

Browser automation bridge for the [OpenCLI](https://github.com/jackwener/opencli) CLI tool. This is a Chrome (Manifest V3) extension that lets the `opencli` command-line daemon running on your machine control a real Chrome tab — navigate, click, type, screenshot, capture network traffic, and more — using the Chrome DevTools Protocol (CDP).

## What it does

The extension connects to a local daemon over WebSocket (`ws://localhost:19825/ext`). Whenever you run an `opencli` command, the CLI's local daemon sends instructions to this extension, which uses `chrome.debugger` to attach to the active tab and execute them via CDP. There is no cloud service involved — everything stays on your machine.

## Functions

- Maintains a persistent WebSocket connection to the local OpenCLI daemon and auto-reconnects if it drops.
- Attaches the Chrome DevTools debugger to a tab on demand (`chrome.debugger.attach`) and issues CDP commands (`Runtime.evaluate`, screenshots, network capture, etc.).
- Tracks per-tab and per-frame debugging targets so automation can target iframes, not just top-level pages.
- Captures response/request bodies for network requests, up to size limits, for the CLI to inspect.
- Shows live connection status (connected / connecting / disconnected) and the daemon version in the toolbar popup.
- Exposes a "profile" context ID (copyable from the popup) that the daemon uses to route commands to the right browser session.

## All features

- **Popup UI** (`popup.html` / `popup.js`): status dot (connected/connecting/disconnected), daemon version display, extension version display, copyable context/profile ID, hint text when disconnected.
- **Background service worker** (`dist/background.js`, built from source, MV3):
  - WebSocket client to `ws://localhost:19825/ext`, HTTP ping to `http://localhost:19825/ping`.
  - CDP command execution with timeouts (60s default, 2s for connectivity probes) and clear timeout error messages (e.g. detecting a blocking native dialog).
  - Debugger attach/detach lifecycle management with retry logic (2 retries normally, 5 with "aggressive retry").
  - JS evaluation in page context (`Runtime.evaluate`) with promise awaiting and exception surfacing.
  - Screenshot capture (`format`, `fullPage`, custom `width`/`height` via device metrics override).
  - Network request/response body capture with size caps (8 MB response, 1 MB request).
  - Frame-aware targeting so automation can act inside iframes.
- **Permissions used**: `debugger`, `tabs`, `cookies`, `activeTab`, `alarms`, `storage`, `tabGroups`, `downloads`, plus `<all_urls>` host access (required for CDP attach on arbitrary pages).

## Terminology

| Term | Meaning |
|---|---|
| Daemon | The local background process started by the `opencli` CLI that this extension connects to over WebSocket. |
| CDP | Chrome DevTools Protocol — the low-level protocol used to control the browser (navigation, evaluation, screenshots, network). |
| Context ID / Profile | An identifier shown in the popup that the daemon uses to address a specific browser/tab session. |
| Tab lease | A tab the daemon has claimed for automation for the duration of a command sequence. |
| MV3 | Chrome Extension Manifest Version 3 — the extension platform this is built on. |

## How to use

1. Install the [OpenCLI CLI](https://github.com/jackwener/opencli) and make sure its local daemon is running (it listens on port `19825`).
2. Load this extension in Chrome:
   - Go to `chrome://extensions`, enable "Developer mode", click "Load unpacked", and select this folder.
3. Run any `opencli` command from your terminal — the extension will automatically connect to the daemon.
4. Click the extension icon to see connection status, daemon version, and copy the current context/profile ID.

No environment variables or API keys are required — this extension only talks to a daemon on `localhost`.

---

## Bahasa Indonesia

Jembatan otomasi browser untuk tool CLI [OpenCLI](https://github.com/jackwener/opencli). Ini adalah ekstensi Chrome (Manifest V3) yang memungkinkan daemon CLI `opencli` yang berjalan di komputer Anda mengontrol tab Chrome sungguhan — navigasi, klik, ketik, screenshot, tangkap trafik jaringan, dan lainnya — menggunakan Chrome DevTools Protocol (CDP).

## Fungsi

Ekstensi ini terhubung ke daemon lokal melalui WebSocket (`ws://localhost:19825/ext`). Setiap kali Anda menjalankan perintah `opencli`, daemon lokal CLI mengirim instruksi ke ekstensi ini, yang menggunakan `chrome.debugger` untuk melekat ke tab aktif dan mengeksekusi instruksi tersebut lewat CDP. Tidak ada layanan cloud yang terlibat — semuanya berjalan di komputer Anda sendiri.

- Menjaga koneksi WebSocket persisten ke daemon OpenCLI lokal dan otomatis reconnect jika terputus.
- Melekatkan Chrome DevTools debugger ke tab sesuai permintaan (`chrome.debugger.attach`) dan mengeksekusi perintah CDP (`Runtime.evaluate`, screenshot, tangkap jaringan, dll).
- Melacak target debugging per-tab dan per-frame sehingga otomasi bisa menargetkan iframe, bukan hanya halaman utama.
- Menangkap body request/response jaringan (dengan batas ukuran) untuk diperiksa CLI.
- Menampilkan status koneksi secara live (terhubung / menghubungkan / terputus) dan versi daemon di popup toolbar.
- Menyediakan ID "profile" konteks (bisa disalin dari popup) yang digunakan daemon untuk merutekan perintah ke sesi browser yang tepat.

## Semua fitur

- **UI Popup** (`popup.html` / `popup.js`): indikator status (terhubung/menghubungkan/terputus), tampilan versi daemon, tampilan versi ekstensi, ID context/profile yang bisa disalin, teks bantuan saat terputus.
- **Background service worker** (`dist/background.js`, hasil build dari source, MV3):
  - Klien WebSocket ke `ws://localhost:19825/ext`, ping HTTP ke `http://localhost:19825/ping`.
  - Eksekusi perintah CDP dengan timeout (default 60 detik, 2 detik untuk probe konektivitas) dan pesan error timeout yang jelas (mis. mendeteksi dialog native yang memblokir).
  - Manajemen siklus attach/detach debugger dengan logika retry (2x normal, 5x saat "aggressive retry").
  - Evaluasi JS dalam konteks halaman (`Runtime.evaluate`) dengan await promise dan penampilan exception.
  - Penangkapan screenshot (`format`, `fullPage`, override `width`/`height` kustom lewat device metrics).
  - Penangkapan body request/response jaringan dengan batas ukuran (respons 8 MB, request 1 MB).
  - Penargetan sadar-frame sehingga otomasi bisa beraksi di dalam iframe.
- **Permission yang digunakan**: `debugger`, `tabs`, `cookies`, `activeTab`, `alarms`, `storage`, `tabGroups`, `downloads`, plus akses host `<all_urls>` (diperlukan untuk attach CDP di sembarang halaman).

## Istilah

| Istilah | Arti |
|---|---|
| Daemon | Proses background lokal yang dijalankan CLI `opencli`, tempat ekstensi ini terhubung lewat WebSocket. |
| CDP | Chrome DevTools Protocol — protokol tingkat rendah untuk mengontrol browser (navigasi, evaluasi, screenshot, jaringan). |
| Context ID / Profile | Identifier yang ditampilkan di popup, dipakai daemon untuk mengalamatkan sesi browser/tab tertentu. |
| Tab lease | Tab yang diklaim daemon untuk otomasi selama durasi rangkaian perintah. |
| MV3 | Chrome Extension Manifest Version 3 — platform ekstensi tempat ini dibangun. |

## Cara menggunakan

1. Install [OpenCLI CLI](https://github.com/jackwener/opencli) dan pastikan daemon lokalnya berjalan (mendengarkan di port `19825`).
2. Muat ekstensi ini di Chrome:
   - Buka `chrome://extensions`, aktifkan "Developer mode", klik "Load unpacked", lalu pilih folder ini.
3. Jalankan perintah `opencli` apa pun dari terminal — ekstensi akan otomatis terhubung ke daemon.
4. Klik ikon ekstensi untuk melihat status koneksi, versi daemon, dan menyalin ID context/profile saat ini.

Tidak diperlukan environment variable atau API key — ekstensi ini hanya berkomunikasi dengan daemon di `localhost`.
