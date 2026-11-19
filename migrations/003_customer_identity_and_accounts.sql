CREATE TABLE IF NOT EXISTS customer_accounts (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  status ENUM('active','suspended','closed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_customer_accounts_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_identity_links (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  external_subject VARCHAR(255) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_customer_external_identity (issuer, external_subject),
  INDEX idx_customer_identity_customer (customer_id),
  CONSTRAINT fk_customer_identity_account FOREIGN KEY (customer_id)
    REFERENCES customer_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_profiles (
  customer_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  encrypted_profile MEDIUMBLOB NOT NULL,
  encryption_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_customer_profile_account FOREIGN KEY (customer_id)
    REFERENCES customer_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_sessions (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  customer_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  session_key_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at TIMESTAMP(6) NOT NULL,
  last_seen_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  revoked_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_customer_session_key (customer_id, session_key_hash),
  INDEX idx_customer_sessions_active (customer_id, revoked_at, expires_at),
  CONSTRAINT fk_customer_session_account FOREIGN KEY (customer_id)
    REFERENCES customer_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_consents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  consent_type ENUM('privacy_notice','terms_of_service') NOT NULL,
  document_version VARCHAR(64) NOT NULL,
  accepted_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_customer_consent_version (customer_id, consent_type, document_version),
  INDEX idx_customer_consents_history (customer_id, accepted_at),
  CONSTRAINT fk_customer_consent_account FOREIGN KEY (customer_id)
    REFERENCES customer_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_consent_session FOREIGN KEY (session_id)
    REFERENCES customer_sessions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_security_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  metadata_json JSON NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_customer_security_events (customer_id, created_at),
  INDEX idx_customer_security_event_type (event_type, created_at),
  CONSTRAINT fk_customer_security_event_account FOREIGN KEY (customer_id)
    REFERENCES customer_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
