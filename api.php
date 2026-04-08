<?php

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Security: POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
    exit;
}

require_once __DIR__ . '/config.php';

//Allowed file extensions / MIME types
define('BLOCKED_EXT', ['php', 'php3', 'php4', 'php5', 'phtml', 'js', 'html', 'htm',
    'exe', 'sh', 'bat', 'cmd', 'py', 'rb', 'pl', 'cgi', 'asp', 'aspx', 'jar', 'msi', 'vbs']);

define('ALLOWED_MIME', [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);

define('MAX_FILE_SIZE', 20 * 1024 * 1024); // 20 MB
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// Rate Limiter
function isRateLimited(PDO $db, string $ip, string $action): bool
{
    $windowSec = 60;
    $maxAttempts = 10;

    // Fetch existing record
    $stmt = $db->prepare(
        "SELECT attempt_count, last_attempt FROM rate_limits WHERE ip = ? AND action = ?"
    );
    $stmt->execute([$ip, $action]);
    $row = $stmt->fetch();

    $now = new DateTime();

    if ($row) {
        $lastAttempt = new DateTime($row['last_attempt']);
        $elapsed = $now->getTimestamp() - $lastAttempt->getTimestamp();

        if ($elapsed >= $windowSec) {
            // Reset window
            $upd = $db->prepare(
                "UPDATE rate_limits SET attempt_count = 1, last_attempt = NOW() WHERE ip = ? AND action = ?"
            );
            $upd->execute([$ip, $action]);
            return false;
        }

        if ((int)$row['attempt_count'] >= $maxAttempts) {
            return true; 
        }

        // Increment
        $upd = $db->prepare(
            "UPDATE rate_limits SET attempt_count = attempt_count + 1 WHERE ip = ? AND action = ?"
        );
        $upd->execute([$ip, $action]);
        return false;
    }

    // First attempt — insert
    $ins = $db->prepare(
        "INSERT INTO rate_limits (ip, action, attempt_count, last_attempt) VALUES (?, ?, 1, NOW())"
    );
    $ins->execute([$ip, $action]);
    return false;
}

// Unique 7-digit key generator
function generateUniqueKey(PDO $db): string
{
    do {
        $key = str_pad((string)rand(0, 9999999), 7, '0', STR_PAD_LEFT);
        $stmt = $db->prepare("SELECT COUNT(*) FROM texts WHERE id = ?");
        $stmt->execute([$key]);
    } while ((int)$stmt->fetchColumn() > 0);
    return $key;
}

// Parse expiry
function parseExpiry(string $expiry): ?string
{
    $map = [
        '1h'   => '+1 hour',
        '24h'  => '+24 hours',
        '7d'   => '+7 days',
        'never' => null,
    ];
    if (!array_key_exists($expiry, $map)) return null; // defaults to never
    if ($map[$expiry] === null) return null;
    return date('Y-m-d H:i:s', strtotime($map[$expiry]));
}

// Router
$action = $_POST['action'] ?? '';
$ip     = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ip     = trim(explode(',', $ip)[0]); // take first IP if behind proxy

// ACTION: store_text
if ($action === 'store_text') {
    if (isRateLimited($db, $ip, 'store')) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Rate limit exceeded. Please wait a minute and try again.']);
        exit;
    }

    $text    = trim($_POST['text'] ?? '');
    $expiry  = trim($_POST['expiry'] ?? 'never');
    $oneTime = (isset($_POST['one_time']) && $_POST['one_time'] === '1') ? 1 : 0;

    if (empty($text)) {
        echo json_encode(['success' => false, 'error' => 'Text cannot be empty.']);
        exit;
    }

    if (mb_strlen($text) > 500000) {
        echo json_encode(['success' => false, 'error' => 'Text is too large (max 500KB).']);
        exit;
    }

    $expiresAt = parseExpiry($expiry);
    $key = generateUniqueKey($db);

    $stmt = $db->prepare(
        "INSERT INTO texts (id, content, content_type, expires_at, one_time)
         VALUES (?, ?, 'text', ?, ?)"
    );
    $stmt->execute([$key, $text, $expiresAt, $oneTime]);

    echo json_encode(['success' => true, 'key' => $key]);
    exit;
}

// ACTION: store_file
if ($action === 'store_file') {
    if (isRateLimited($db, $ip, 'store')) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Rate limit exceeded. Please wait a minute and try again.']);
        exit;
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errMsg = $_FILES['file']['error'] ?? 'No file uploaded.';
        echo json_encode(['success' => false, 'error' => 'File upload error: ' . $errMsg]);
        exit;
    }

    $file     = $_FILES['file'];
    $origName = basename($file['name']);
    $tmpPath  = $file['tmp_name'];
    $fileSize = $file['size'];


    if ($fileSize > MAX_FILE_SIZE) {
        echo json_encode(['success' => false, 'error' => 'File exceeds 20MB limit.']);
        exit;
    }


    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (in_array($ext, BLOCKED_EXT, true)) {
        echo json_encode(['success' => false, 'error' => 'File type not allowed: .' . $ext]);
        exit;
    }


    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($tmpPath);
    if (!in_array($mimeType, ALLOWED_MIME, true)) {
        echo json_encode(['success' => false, 'error' => 'Unsupported file type: ' . $mimeType]);
        exit;
    }


    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
        file_put_contents(UPLOAD_DIR . '.htaccess', "Options -Indexes\nphp_flag engine off\nAddHandler cgi-script .php .pl .py .sh .exe\nOptions -ExecCGI\n");
    }


    $safeExt      = preg_replace('/[^a-z0-9]/i', '', $ext);
    $storedName   = bin2hex(random_bytes(16)) . '.' . $safeExt;
    $destPath     = UPLOAD_DIR . $storedName;
    $relativePath = 'uploads/' . $storedName;

    if (!move_uploaded_file($tmpPath, $destPath)) {
        echo json_encode(['success' => false, 'error' => 'Failed to save file. Check server permissions.']);
        exit;
    }

    $expiry    = trim($_POST['expiry'] ?? 'never');
    $oneTime   = (isset($_POST['one_time']) && $_POST['one_time'] === '1') ? 1 : 0;
    $expiresAt = parseExpiry($expiry);
    $key       = generateUniqueKey($db);

    $stmt = $db->prepare(
        "INSERT INTO texts (id, content_type, file_name, file_path, expires_at, one_time)
         VALUES (?, 'file', ?, ?, ?, ?)"
    );
    $stmt->execute([$key, $origName, $relativePath, $expiresAt, $oneTime]);

    echo json_encode(['success' => true, 'key' => $key]);
    exit;
}

// ACTION: retrieve
if ($action === 'retrieve') {
    if (isRateLimited($db, $ip, 'retrieve')) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Rate limit exceeded. Please wait a minute and try again.']);
        exit;
    }

    // Key extraction
    // QR links use ?c=<url-safe-base64> to hide the raw key.
    // The normal retrieve form posts the raw key via POST['key'].
    $key = null;

    if (isset($_GET['c'])) {
        // Decode URL-safe Base64 (from QR / shared link)
        $encoded = $_GET['c'];
        $encoded = str_replace(['-', '_'], ['+', '/'], $encoded);
        // Restore Base64 padding
        $remainder = strlen($encoded) % 4;
        if ($remainder !== 0) {
            $encoded .= str_repeat('=', 4 - $remainder);
        }
        $decoded = base64_decode($encoded, true);
        if ($decoded === false || !preg_match('/^\d{7}$/', $decoded)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid or tampered key token.']);
            exit;
        }
        $key = $decoded;
    } else {

        $key = trim($_POST['key'] ?? '');
    }

    if (!preg_match('/^\d{7}$/', $key)) {
        echo json_encode(['success' => false, 'error' => 'Invalid key. Must be exactly 7 digits.']);
        exit;
    }

    $stmt = $db->prepare(
        "SELECT id, content, content_type, file_name, file_path,
                expires_at, one_time, is_used, access_count, created_at
         FROM texts WHERE id = ?"
    );
    $stmt->execute([$key]);
    $row = $stmt->fetch();

    if (!$row) {
        echo json_encode(['success' => false, 'error' => 'Key not found. Please check and try again.']);
        exit;
    }

    // Check expiry
    if ($row['expires_at'] !== null) {
        $now       = new DateTime();
        $expiresAt = new DateTime($row['expires_at']);
        if ($now > $expiresAt) {
            echo json_encode(['success' => false, 'error' => 'This content has expired.']);
            exit;
        }
    }

    // Check one-time usage
    if ($row['one_time'] && $row['is_used']) {
        echo json_encode(['success' => false, 'error' => 'This content was already accessed and is no longer available.']);
        exit;
    }

    $upd = $db->prepare(
        "UPDATE texts SET is_used = 1, access_count = access_count + 1 WHERE id = ?"
    );
    $upd->execute([$key]);


    $expiryRemaining = null;
    if ($row['expires_at']) {
        $now      = new DateTime();
        $exp      = new DateTime($row['expires_at']);
        $diffSecs = $exp->getTimestamp() - $now->getTimestamp();
        $expiryRemaining = $diffSecs > 0 ? $diffSecs : 0;
    }

    $accessCount = (int)$row['access_count'] + 1;

    if ($row['content_type'] === 'file') {
        echo json_encode([
            'success'          => true,
            'type'             => 'file',
            'file_name'        => $row['file_name'],
            'file_path'        => $row['file_path'],
            'access_count'     => $accessCount,
            'expiry_remaining' => $expiryRemaining,
            'one_time'         => (bool)$row['one_time'],
        ]);
    } else {
        echo json_encode([
            'success'          => true,
            'type'             => 'text',
            'content'          => $row['content'],
            'access_count'     => $accessCount,
            'expiry_remaining' => $expiryRemaining,
            'one_time'         => (bool)$row['one_time'],
        ]);
    }
    exit;
}

// Unknown action
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown action.']);
?>
