# 📋 ClipShare

> *"We Tried… and accidentally built this."*

**ClipShare** is a lightweight, secure, and visually polished instant-sharing platform built for shared hosting environments. Share plain text or upload files with friends, colleagues, or yourself — no account, no sign-up, no bloat. Generate a 7-digit key, scan a QR code, or share a link. That's it.

**Live Demo:** [https://underroot.io/asd/](https://underroot.io/asd/)

---

## 📌 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Database Schema](#-database-schema)
5. [Setup & Installation](#-setup--installation)
6. [Configuration](#-configuration)
7. [API Reference](#-api-reference)
8. [QR & URL Encoding](#-qr--url-encoding)
9. [Security Architecture](#-security-architecture)
10. [UI/UX Design System](#-uiux-design-system)
11. [Rate Limiting](#-rate-limiting)
12. [File Handling](#-file-handling)
13. [Browser Compatibility](#-browser-compatibility)
14. [Known Limitations](#-known-limitations)
15. [Deployment Checklist](#-deployment-checklist)

---

## ✨ Features

### Core Functionality
| Feature | Description |
|---|---|
| **Text Sharing** | Paste any text (up to ~500 KB) and generate a 7-digit retrieval key |
| **File Sharing** | Upload files up to 20 MB; supported types: JPG, PNG, GIF, WEBP, SVG, PDF, MP4, MOV, AVI, DOC, DOCX, TXT |
| **7-Digit Key** | Every share generates a unique, collision-checked 7-digit numeric key |
| **QR Code** | Auto-generated QR code after every share — encodes a full retrieval URL |
| **Download QR** | Save the QR code as a PNG file with one click |
| **Copy Link** | Copy the full shareable retrieval URL to clipboard instantly |
| **Expiry Control** | Set content to expire in 1 Hour, 24 Hours, 7 Days, or Never |
| **One-Time Access** | Toggle to auto-invalidate content after the first successful retrieval |
| **URL Auto-Fill** | Visiting `?c=<token>` auto-switches to Retrieve tab, decodes the key, and auto-submits |
| **Access Counter** | Every retrieval increments and displays a visible access count |
| **Expiry Remaining** | Shows time remaining on retrieved content (e.g., "22h 14m remaining") |

### UI/UX Highlights
| Feature | Description |
|---|---|
| **Glassmorphism** | Frosted-glass cards with backdrop blur, inset highlights, and left/top border gradients |
| **Custom Cursor** | Green glowing cursor dot with a lagging outer ring — expands on hover, shrinks on click |
| **Floating Bubbles** | 12 translucent animated bubbles rise continuouslyin the background |
| **Ambient Orbs** | 3 large blurred gradient orbs drift slowly in the background for visual depth |
| **Particle Bursts** | Green sparks explode from the click point when switching between Share/Retrieve tabs |
| **Direction-Aware Slides** | Tab content slides left/right based on navigation direction |
| **Ripple Waves** | Click ripple effect on all buttons and tabs |
| **Card Shimmer** | Periodic glowing light sweep across the main card |
| **Inner Tab Slide-Up** | Text ↔ File inner tab switches animate with a vertical slide-up |
| **Focus Pulse** | Subtle green pulse ring on focused inputs |
| **Drag-and-Drop** | Drop files directly onto the upload zone |
| **Responsive Design** | Mobile-optimised layout; animations scaled back on small screens |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla CSS3, Vanilla JavaScript (ES2020+) |
| **Backend** | PHP 7.4+ (PDO, prepared statements only) |
| **Database** | MySQL / MariaDB |
| **QR Library** | [qrcodejs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) — client-side only |
| **Fonts** | Google Fonts — Inter (UI), JetBrains Mono (key display) |
| **Hosting** | Shared hosting (Apache + mod_rewrite) |
| **No frameworks** | Zero NPM, Zero Node.js, Zero build tools |

---

## 📁 Project Structure

```
clipboard/
├── index.html          # Single-page UI — all tabs, modals, and forms
├── style.css           # Full design system — variables, components, animations
├── script.js           # All frontend logic — AJAX, QR, animations, cursor, bubbles
├── api.php             # REST-like POST-only API — store_text, store_file, retrieve
├── config.php          # Database credentials + auto-schema bootstrap
├── .htaccess           # Apache rules — HTTPS redirect, security headers, dir listing
├── background.png      # Desk/stationery background image
└── uploads/
    ├── .htaccess       # Blocks PHP execution inside uploads folder
    └── [stored files]  # Hex-named uploaded files (e.g. a3f9b1c2....pdf)
```

### File Roles

#### `index.html`
The entire application lives in a single HTML file with no server-side rendering. It contains:
- The **header** glass card with logo and tagline
- **Main tab strip** (Share / Retrieve)
- **Share tab** with two inner sub-tabs: Text and File
- **Retrieve tab** with key input, text result box, and file result box
- **Global error modal** for rate limit and network errors
- Animated background elements: `#bubblesBg`, `.orb-ambient`, `.bg-orb`
- Custom cursor elements: `#cursorDot`, `#cursorRing`

#### `style.css`
~1,400 lines of pure CSS structured as:
- CSS custom properties (design tokens)
- Base reset and global typography
- Header, tabs, card container
- Form elements — textarea, inputs, selects, toggles
- Button variants — primary, secondary, icon, sm
- Result boxes — key display, meta pills, QR panel
- Drop zone — drag states, file preview
- Progress bar for uploads
- File result card
- Modal overlay
- QR glass card — glass container, action buttons, fade animations
- Responsive breakpoints (`@media (max-width: 520px)`)
- UI enhancement block — custom cursor, floating bubbles, ambient orbs, particle, ripple, shimmer, directional slide

#### `script.js`
~820 lines structured into named sections:
- `MODAL` — global error modal open/close
- `MAIN TAB SWITCHING` — direction-aware slide + particle burst system
- `INNER TAB SWITCHING` — Text / File sub-tab with slide-up
- `SHARE TEXT` — form submit → AJAX → key display → QR generation
- `SHARE FILE` — drop zone, client-side validation, XHR upload with progress, QR generation
- `RETRIEVE` — form submit → AJAX → render text or file result card
- `COPY BUTTONS` — clipboard API wrappers
- `KEY DISPLAY (DYNAMIC)` — pulsing animated key digit display
- `UI ENHANCEMENTS` — custom cursor, floating bubbles, ambient orbs, ripple waves
- `QR CODE` — `generateQR()`, `wireQrActions()`, `encodeKey()`, `decodeKey()`
- `URL AUTO-FILL` — reads `?c=` param, decodes it, switches tab, auto-submits retrieve

#### `api.php`
POST-only PHP API. All responses are JSON. Sections:
- Security: POST-method enforcement, rate limiting, IP extraction
- `store_text` — validates, stores text, returns key
- `store_file` — validates extension + MIME type, stores file, returns key
- `retrieve` — validates key, checks expiry, one-time, increments access count, returns content

#### `config.php`
Loaded by `api.php` via `require_once`. Responsibilities:
- Establishes a PDO connection with `utf8mb4` charset
- Bootstraps the `texts` table on first run
- Bootstraps the `rate_limits` table on first run
- Safely `ALTER TABLE` to add new columns on older deployments (migration-safe)

---

## 🗄 Database Schema

### `texts` table

| Column | Type | Description |
|---|---|---|
| `id` | `CHAR(7)` PK | The 7-digit numeric key (e.g. `0042819`) |
| `content` | `TEXT` | Stored plain text (NULL for file shares) |
| `content_type` | `ENUM('text','file')` | Distinguishes text from file entries |
| `file_name` | `VARCHAR(255)` | Original filename as uploaded by user |
| `file_path` | `VARCHAR(255)` | Relative path to stored file (e.g. `uploads/abc123.pdf`) |
| `created_at` | `TIMESTAMP` | Auto-set on insert |
| `expires_at` | `DATETIME` | NULL = never expires; otherwise a future datetime |
| `one_time` | `TINYINT(1)` | 1 = invalidate after first retrieval |
| `is_used` | `TINYINT(1)` | 1 = already retrieved (used by one-time logic) |
| `access_count` | `INT UNSIGNED` | Total number of successful retrievals |

**Indexes:** `PRIMARY KEY (id)`, `INDEX idx_expires (expires_at)`

---

### `rate_limits` table

| Column | Type | Description |
|---|---|---|
| `ip` | `VARCHAR(45)` | Client IP address (supports IPv6) |
| `action` | `VARCHAR(50)` | Action type: `'store'` or `'retrieve'` |
| `attempt_count` | `INT UNSIGNED` | Number of attempts in the current window |
| `last_attempt` | `DATETIME` | Timestamp of the most recent attempt |

**Indexes:** `PRIMARY KEY (ip, action)`, `INDEX idx_last (last_attempt)`

---

### SQL (Manual Setup)

If you prefer to create tables manually rather than letting `config.php` bootstrap them:

```sql
CREATE TABLE IF NOT EXISTS texts (
    id           CHAR(7)                       PRIMARY KEY,
    content      TEXT,
    content_type ENUM('text','file')           NOT NULL DEFAULT 'text',
    file_name    VARCHAR(255)                  DEFAULT NULL,
    file_path    VARCHAR(255)                  DEFAULT NULL,
    created_at   TIMESTAMP                     DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME                      DEFAULT NULL,
    one_time     TINYINT(1)                    NOT NULL DEFAULT 0,
    is_used      TINYINT(1)                    NOT NULL DEFAULT 0,
    access_count INT UNSIGNED                  NOT NULL DEFAULT 0,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
    ip            VARCHAR(45)   NOT NULL,
    action        VARCHAR(50)   NOT NULL,
    attempt_count INT UNSIGNED  NOT NULL DEFAULT 1,
    last_attempt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip, action),
    INDEX idx_last (last_attempt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## ⚙️ Setup & Installation

### Requirements

- PHP **7.4 or higher** with PDO and PDO_MySQL extensions enabled
- MySQL **5.7+** or MariaDB **10.3+**
- Apache with `mod_rewrite` enabled
- HTTPS (recommended; enforced in `.htaccess`)

### Steps

**1. Clone or upload all files to your server**

```
clipboard/
├── index.html
├── style.css
├── script.js
├── api.php
├── config.php
├── .htaccess
├── background.png
└── uploads/   ← create this folder if it doesn't exist
```

**2. Create the `uploads/` directory and set permissions**

```bash
mkdir uploads
chmod 755 uploads
```

**3. Create a `.htaccess` inside `uploads/`** (done automatically on first upload, but you can pre-create it):

```
Options -Indexes
php_flag engine off
AddHandler cgi-script .php .pl .py .sh .exe
Options -ExecCGI
```

**4. Fill in your database credentials in `config.php`**

```php
$dbHost = 'localhost';
$dbName = 'your_database_name';
$dbUser = 'your_database_user';
$dbPass = 'your_database_password';
```

**5. Update the base URL in `script.js`**

At the very top of `script.js`:

```javascript
const CLIPSHARE_BASE_URL = 'https://your-domain.com/your-path/';
```

**6. Upload everything and visit your URL**

On the first request, `config.php` will automatically create all required tables. No manual SQL migration needed.

---

## 🔧 Configuration

### Expiry Options

Expiry durations are defined in `api.php` inside the `parseExpiry()` function:

```php
$map = [
    '1h'    => '+1 hour',
    '24h'   => '+24 hours',
    '7d'    => '+7 days',
    'never' => null,   // NULL in DB = no expiry
];
```

To add a new option (e.g., 30 days):
1. Add `'30d' => '+30 days'` to the `$map` in `api.php`
2. Add `<option value="30d">30 Days</option>` to both expiry `<select>` elements in `index.html`
3. Add `'30d': 2592000` to the `map` in `getExpirySecondsFromValue()` in `script.js`

### File Size Limit

In `api.php`:
```php
define('MAX_FILE_SIZE', 20 * 1024 * 1024); // 20 MB — change as needed
```

Note: Also respect your PHP and server `upload_max_filesize` and `post_max_size` settings.

### Rate Limiting Window

In `api.php` inside `isRateLimited()`:
```php
$windowSec   = 60;   // rolling window in seconds
$maxAttempts = 10;   // max requests within that window
```

### Allowed File Types

```php
define('ALLOWED_MIME', [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);
```

Add or remove MIME types here to control what file types are accepted server-side. The frontend `accept` attribute in `index.html` should be kept in sync.

---

## 📡 API Reference

All API calls are made to `api.php` via **HTTP POST** only. All responses are JSON.

### `POST api.php` — Store Text

**Request (FormData):**

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | ✅ | `"store_text"` |
| `text` | string | ✅ | The text content to share (max ~500 KB) |
| `expiry` | string | ✅ | One of: `1h`, `24h`, `7d`, `never` |
| `one_time` | string | ✅ | `"1"` to enable one-time access, `"0"` otherwise |

**Success Response:**
```json
{ "success": true, "key": "0042819" }
```

**Error Response:**
```json
{ "success": false, "error": "Text cannot be empty." }
```

**Rate Limited (HTTP 429):**
```json
{ "success": false, "error": "Rate limit exceeded. Please wait a minute and try again." }
```

---

### `POST api.php` — Store File

**Request (FormData):**

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | ✅ | `"store_file"` |
| `file` | File | ✅ | The file to upload (max 20 MB) |
| `expiry` | string | ✅ | One of: `1h`, `24h`, `7d`, `never` |
| `one_time` | string | ✅ | `"1"` to enable one-time access, `"0"` otherwise |

**Success Response:**
```json
{ "success": true, "key": "1823045" }
```

**Error Responses:**
```json
{ "success": false, "error": "File exceeds 20MB limit." }
{ "success": false, "error": "File type not allowed: .exe" }
{ "success": false, "error": "Unsupported file type: application/octet-stream" }
```

---

### `POST api.php` — Retrieve Content

**Request (FormData):**

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | ✅ | `"retrieve"` |
| `key` | string | ✅ | The 7-digit numeric key |

**Success Response (text):**
```json
{
    "success": true,
    "type": "text",
    "content": "Hello, world!",
    "access_count": 3,
    "expiry_remaining": 82800,
    "one_time": false
}
```

**Success Response (file):**
```json
{
    "success": true,
    "type": "file",
    "file_name": "report.pdf",
    "file_path": "uploads/a3f9b1c2d4e5f6a7b8c9d0e1f2a3b4c5.pdf",
    "access_count": 1,
    "expiry_remaining": null,
    "one_time": true
}
```

**Error Responses:**
```json
{ "success": false, "error": "Key not found. Please check and try again." }
{ "success": false, "error": "This content has expired." }
{ "success": false, "error": "This content was already accessed and is no longer available." }
{ "success": false, "error": "Invalid key. Must be exactly 7 digits." }
```

> **Note:** `expiry_remaining` is in **seconds**. `null` means the content never expires.

---

## 🔲 QR & URL Encoding

### Why Encoding?

The raw 7-digit key is **not exposed** in the shareable URL. Instead, it is encoded using **URL-safe Base64** to add a lightweight layer of obfuscation, preventing casual enumeration of keys from shared links.

### Encoding (JavaScript — `encodeKey()`)

```javascript
function encodeKey(key) {
    return btoa(key)
        .replace(/=/g,  '')   // strip Base64 padding
        .replace(/\+/g, '-')  // make URL-safe
        .replace(/\//g, '_'); // make URL-safe
}
```

**Example:**
```
key      →  "1234567"
btoa()   →  "MTIzNDU2Nw=="
encoded  →  "MTIzNDU2Nw"    (padding stripped, already URL-safe here)
```

**The QR code encodes:**
```
https://underroot.io/asd/?c=MTIzNDU2Nw
```

### Decoding (JavaScript — `decodeKey()`)

Used by the URL auto-fill feature:

```javascript
function decodeKey(token) {
    try {
        const b64    = token.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
        const decoded = atob(padded);
        return /^\d{7}$/.test(decoded) ? decoded : null;
    } catch {
        return null;
    }
}
```

### Decoding (PHP — `api.php`)

Used when an API call arrives via a QR scan (GET param `c` is present):

```php
if (isset($_GET['c'])) {
    $encoded   = $_GET['c'];
    $encoded   = str_replace(['-', '_'], ['+', '/'], $encoded);
    $remainder = strlen($encoded) % 4;
    if ($remainder !== 0) {
        $encoded .= str_repeat('=', 4 - $remainder);
    }
    $decoded = base64_decode($encoded, true);
    if ($decoded === false || !preg_match('/^\d{7}$/', $decoded)) {
        // Reject tampered tokens
    }
    $key = $decoded;
}
```

### URL Auto-Fill Flow

When a user scans the QR or opens a shared link:

```
User opens  →  https://underroot.io/asd/?c=MTIzNDU2Nw
JS reads    →  URLSearchParams → token = "MTIzNDU2Nw"
Decodes     →  "1234567"  (validates /^\d{7}$/)
Switches    →  Retrieve tab (with slide animation)
Fills       →  key input with "1234567"
Submits     →  retrieve form auto-submitted after 350ms delay
```

---

## 🔐 Security Architecture

### Transport Security
- `.htaccess` forces **HTTPS** with a `301` redirect on all HTTP requests
- `Strict-Transport-Security` can be added via the `mod_headers` block

### API Security
- **POST-only enforcement** — `api.php` rejects all non-POST requests with `HTTP 405`
- **No GET-based queries** — data is never read from URL parameters in the API (only the QR decode path, with strict validation)
- **Prepared statements only** — all database queries use PDO with `?` placeholders; SQL injection is not possible

### File Upload Security

| Layer | Mechanism |
|---|---|
| **Client-side extension block** | Blocked list in `script.js` prevents `.php`, `.js`, `.py`, `.sh`, `.exe`, etc. from being selected |
| **Server-side extension block** | `BLOCKED_EXT` constant in `api.php` re-validates extension — client check is cosmetic only |
| **MIME type validation** | `finfo` reads the actual file bytes to determine real MIME type, not just the filename |
| **Random filename** | Files are stored as `bin2hex(random_bytes(16)).ext` — original filename is never used for storage |
| **PHP disabled in uploads** | `uploads/.htaccess` sets `php_flag engine off` and blocks CGI execution |
| **No directory listing** | Both root and uploads `.htaccess` set `Options -Indexes` |

### Key Security
- Keys are **7-digit numbers** (10,000,000 possibilities) checked for uniqueness at generation time
- **URL-safe Base64 obfuscation** prevents casual key enumeration from links/QR codes
- The QR/link URL contains an **opaque token** (`?c=...`), not the raw key
- Tampered tokens (invalid Base64 or non-7-digit result) are rejected with `HTTP 400`

### Security Headers (`.htaccess`)
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### `config.php` Protection
Direct browser access to `config.php` is blocked via `.htaccess`:
```apache
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>
```

---

## 🎨 UI/UX Design System

### Color Palette (CSS Variables)

```css
--primary:       #007236   /* GITAM / brand green */
--primary-mid:   #00a34d   /* lighter green for gradients */
--primary-glow:  rgba(0, 114, 54, 0.28)
--primary-light: rgba(0, 114, 54, 0.1)
--text-main:     #0f172a
--text-muted:    #64748b
--glass-border:  rgba(255,255,255,0.3)
```

### Typography
- **UI Font:** Inter (400, 500, 600, 700) via Google Fonts
- **Key Display:** JetBrains Mono (700) for the 7-digit key — monospaced for visual consistency

### Glassmorphism Values
```css
background:      rgba(255, 255, 255, 0.40)
backdrop-filter: blur(6px)
border:          1px solid rgba(255, 255, 255, 0.30)
box-shadow:      0 8px 32px rgba(0,0,0,0.1),
                 inset 0 1px 0 rgba(255,255,255,0.5),   /* top highlight */
                 inset 0 -1px 0 rgba(255,255,255,0.1),  /* bottom subtle */
                 inset 1px 0 0 rgba(255,255,255,0.5);   /* left edge line */
```

### Animation Inventory

| Animation | Trigger | CSS Keyframe / JS |
|---|---|---|
| Floating bubbles | Page load | `@keyframes bubbleRise` |
| Ambient orb drift | Page load | `@keyframes orbDrift` |
| Custom cursor follow | `mousemove` | JS `requestAnimationFrame` |
| Cursor expand | `mouseenter` on interactive elements | JS class toggle |
| Cursor shrink | `mousedown` | JS class toggle |
| Tab slide (directional) | Tab click | JS — adds `slide-from-right`/`slide-from-left` |
| Inner tab slide-up | Inner tab click | JS — adds `slide-from-bottom` |
| Particle burst | Main tab click | JS — spawns 14 `<span>` particles |
| Ripple wave | Any button/tab click | JS — spawns `.ripple-wave` on click coords |
| Card shimmer | Periodic (9s interval) | `@keyframes cardSweepShimmer` |
| QR fade-in | After QR generation | JS class swap `qr-hidden` → `qr-visible` |
| Focus pulse ring | Input focus | `@keyframes inputFocusPulse` |

---

## 🚦 Rate Limiting

Rate limiting is per-IP, per-action, with a rolling 60-second window.

| Setting | Value |
|---|---|
| Window | 60 seconds |
| Max attempts | 10 per window |
| Actions tracked | `store` (text + file share), `retrieve` |

**Behaviour:**
- On each request, the IP+action pair is looked up in `rate_limits`
- If the last attempt was ≥ 60 seconds ago, the counter **resets to 1**
- If the counter is ≥ 10, the request is rejected with `HTTP 429`
- Otherwise the counter is incremented and the request proceeds

**Frontend handling:**
- HTTP 429 responses trigger the **global error modal** (not an inline error), ensuring the user sees the rate-limit message regardless of which tab they're on

---

## 📁 File Handling

### Upload Flow

```
User selects file
    ↓
Client-side validation (size ≤ 20MB, extension not in BLOCKED_EXT_CLIENT)
    ↓
XHR POST to api.php with FormData (progress events update the progress bar)
    ↓
Server-side validation (size, extension, MIME type via finfo)
    ↓
File renamed to:  bin2hex(random_bytes(16)) + '.' + sanitised_extension
    ↓
Stored in:  uploads/<random_hex_name>.<ext>
    ↓
Original filename + relative path stored in DB
    ↓
7-digit key returned to frontend
```

### Retrieval Flow

```
User enters key (or scans QR → auto-fill)
    ↓
POST to api.php with action=retrieve, key=XXXXXXX
    ↓
DB lookup: check expiry, one_time, is_used
    ↓
Mark as used + increment access_count
    ↓
Return file_name + file_path to frontend
    ↓
Frontend builds direct download link:
    <a href="uploads/<hex_name>.ext" download="original_filename">
```

### Stored File Security

Uploaded files:
- Are **never executed** (PHP engine disabled in uploads folder)
- Are **not guessable** (random 16-byte hex name = 32 hex chars)
- Are **not browseable** (directory listing disabled)
- Are **served under their original name** via the `download` attribute on the anchor tag (the stored name stays hidden)

---

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Core share/retrieve | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ (HTTPS only) | ✅ |
| QR generation | ✅ | ✅ | ✅ | ✅ |
| QR download (canvas) | ✅ | ✅ | ✅ | ✅ |
| Drag-and-drop upload | ✅ | ✅ | ✅ | ✅ |
| Backdrop-filter blur | ✅ | ✅ | ✅ | ✅ |
| Custom cursor | ✅ | ✅ | ✅ | ✅ |
| CSS animations | ✅ | ✅ | ✅ | ✅ |

> ⚠️ The `navigator.clipboard` API requires **HTTPS**. On `localhost` without HTTPS, copy-to-clipboard buttons will silently fail.

---

## ⚠️ Known Limitations

| Limitation | Notes |
|---|---|
| **No user accounts** | All keys are anonymous. If you lose your key, content is unrecoverable. |
| **No file deletion UI** | Uploaded files cannot be deleted by the user. Expiry is the only removal mechanism. |
| **No cleanup cron** | Expired entries remain in the DB and `uploads/` until manually purged. Consider a cron job running `DELETE FROM texts WHERE expires_at < NOW()` and cleaning up orphaned files. |
| **10M key space** | With 7-digit numeric keys, there are 10,000,000 possible keys. At very high volumes, collision retries may become frequent. |
| **No encryption at rest** | Text content is stored as plain text in MySQL. Consider encrypting sensitive content before pasting. |
| **Single-file architecture** | `api.php` handles all actions in one file for shared hosting simplicity. Scaling to high traffic would require architectural changes. |

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] `config.php` — database credentials filled in
- [ ] `script.js` — `CLIPSHARE_BASE_URL` points to your live URL (with trailing slash)
- [ ] `uploads/` directory exists and is **writable** by the web server (`chmod 755` or `chmod 777`)
- [ ] `uploads/.htaccess` is present and blocks PHP execution
- [ ] HTTPS is active on your domain (required for Clipboard API + security headers)
- [ ] `mod_rewrite` is enabled on your Apache server (for `.htaccess` rules)
- [ ] PHP `extension=pdo_mysql` is enabled on your host
- [ ] `upload_max_filesize` and `post_max_size` in `php.ini` are ≥ 20M
- [ ] Test text share → key generated → retrieve works
- [ ] Test file upload → progress bar shows → key generated → download works
- [ ] Test QR scan → URL auto-fill → auto-retrieve
- [ ] Test expiry (set 1h, wait, attempt retrieval → "expired" error)
- [ ] Test one-time access (retrieve twice → second attempt rejected)
- [ ] Test rate limiting (submit > 10 times quickly → 429 modal appears)

---

## 📄 License

This project is open for personal and educational use. No formal license is currently applied. If you fork or adapt this project, a credit back would be appreciated.

---

*Built with ❤️ and too much coffee.*
