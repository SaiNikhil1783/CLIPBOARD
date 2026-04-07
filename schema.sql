CREATE TABLE texts (
    id CHAR(7) NOT NULL,
    content TEXT NULL,
    content_type ENUM('text','file') NOT NULL DEFAULT 'text',
    file_name VARCHAR(255) NULL,
    file_path VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    one_time TINYINT(1) NOT NULL DEFAULT 0,
    is_used TINYINT(1) NOT NULL DEFAULT 0,
    access_count INT(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE rate_limits (
    id INT(11) NOT NULL AUTO_INCREMENT,
    ip VARCHAR(45) NOT NULL,
    action VARCHAR(50) NOT NULL,
    attempt_count INT(11) NOT NULL DEFAULT 1,
    last_attempt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ip (ip),
    KEY action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
