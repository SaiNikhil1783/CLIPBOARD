<?php
// config.php

$dbHost = 'localhost';         
$dbName = '';                  
$dbUser = '';                  
$dbPass = '';                  


try {
    $db = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);


    $db->exec("CREATE TABLE IF NOT EXISTS texts (
        id         CHAR(7)                       PRIMARY KEY,
        content    TEXT,
        content_type ENUM('text','file')         NOT NULL DEFAULT 'text',
        file_name  VARCHAR(255)                  DEFAULT NULL,
        file_path  VARCHAR(255)                  DEFAULT NULL,
        created_at TIMESTAMP                     DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME                      DEFAULT NULL,
        one_time   TINYINT(1)                    NOT NULL DEFAULT 0,
        is_used    TINYINT(1)                    NOT NULL DEFAULT 0,
        access_count INT UNSIGNED               NOT NULL DEFAULT 0,
        INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");


    $alterCols = [
        "content_type ENUM('text','file') NOT NULL DEFAULT 'text'",
        "file_name    VARCHAR(255) DEFAULT NULL",
        "file_path    VARCHAR(255) DEFAULT NULL",
        "expires_at   DATETIME DEFAULT NULL",
        "one_time     TINYINT(1) NOT NULL DEFAULT 0",
        "is_used      TINYINT(1) NOT NULL DEFAULT 0",
        "access_count INT UNSIGNED NOT NULL DEFAULT 0",
    ];
    foreach ($alterCols as $colDef) {
        $colName = preg_split('/\s+/', trim($colDef))[0];
        $check = $db->query("SHOW COLUMNS FROM texts LIKE '$colName'")->fetch();
        if (!$check) {
            $db->exec("ALTER TABLE texts ADD COLUMN $colDef");
        }
    }


    $db->exec("CREATE TABLE IF NOT EXISTS rate_limits (
        ip            VARCHAR(45)   NOT NULL,
        action        VARCHAR(50)   NOT NULL,
        attempt_count INT UNSIGNED  NOT NULL DEFAULT 1,
        last_attempt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (ip, action),
        INDEX idx_last (last_attempt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $rlCols = [
        "attempt_count INT UNSIGNED NOT NULL DEFAULT 1",
        "last_attempt  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
    ];
    foreach ($rlCols as $colDef) {
        $colName = preg_split('/\s+/', trim($colDef))[0];
        $check = $db->query("SHOW COLUMNS FROM rate_limits LIKE '$colName'")->fetch();
        if (!$check) {
            $db->exec("ALTER TABLE rate_limits ADD COLUMN $colDef");
        }
    }

} catch (PDOException $e) {

    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Database connection failed. Please check config.php credentials.']);
    exit;
}
?>