CREATE TABLE IF NOT EXISTS currencies (
  code CHAR(3) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  minor_unit TINYINT UNSIGNED NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS countries (
  code CHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  default_currency_code CHAR(3) NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_country_currency FOREIGN KEY (default_currency_code) REFERENCES currencies(code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS country_currencies (
  country_code CHAR(2) NOT NULL,
  currency_code CHAR(3) NOT NULL,
  usage_type ENUM('local','global','settlement') NOT NULL DEFAULT 'local',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (country_code, currency_code),
  CONSTRAINT fk_country_currency_country FOREIGN KEY (country_code) REFERENCES countries(code),
  CONSTRAINT fk_country_currency_currency FOREIGN KEY (currency_code) REFERENCES currencies(code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(1000) NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_product_types (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_product_type_category FOREIGN KEY (category_id) REFERENCES loan_categories(id),
  UNIQUE KEY uq_product_type_category (id, category_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(48) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  product_type_id BIGINT UNSIGNED NOT NULL,
  status ENUM('draft','active','paused','retired') NOT NULL DEFAULT 'draft',
  display_order INT NOT NULL DEFAULT 0,
  created_by VARCHAR(128) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES loan_categories(id),
  CONSTRAINT fk_product_type FOREIGN KEY (product_type_id) REFERENCES loan_product_types(id),
  CONSTRAINT fk_product_type_category_match FOREIGN KEY (product_type_id, category_id) REFERENCES loan_product_types(id, category_id),
  INDEX idx_products_status_order (status, display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_product_versions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  loan_product_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  status ENUM('draft','published','superseded') NOT NULL DEFAULT 'draft',
  published_loan_product_id BIGINT UNSIGNED GENERATED ALWAYS AS (CASE WHEN status = 'published' THEN loan_product_id ELSE NULL END) STORED,
  currency_code CHAR(3) NOT NULL,
  minimum_amount DECIMAL(19,4) NOT NULL,
  maximum_amount DECIMAL(19,4) NOT NULL,
  minimum_duration_days INT UNSIGNED NOT NULL,
  maximum_duration_days INT UNSIGNED NOT NULL,
  interest_model ENUM('fixed','variable','zero_interest') NOT NULL,
  annual_interest_rate_bps INT UNSIGNED NOT NULL,
  repayment_frequency ENUM('weekly','biweekly','monthly','quarterly','bullet') NOT NULL,
  requires_collateral BOOLEAN NOT NULL DEFAULT FALSE,
  requires_guarantor BOOLEAN NOT NULL DEFAULT FALSE,
  risk_review_required BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from TIMESTAMP(6) NULL,
  effective_until TIMESTAMP(6) NULL,
  created_by VARCHAR(128) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_product_version (loan_product_id, version_number),
  UNIQUE KEY uq_product_version_product (id, loan_product_id),
  UNIQUE KEY uq_published_product_version (published_loan_product_id),
  CONSTRAINT fk_version_product FOREIGN KEY (loan_product_id) REFERENCES loan_products(id),
  CONSTRAINT fk_version_currency FOREIGN KEY (currency_code) REFERENCES currencies(code),
  CONSTRAINT chk_amount_range CHECK (minimum_amount > 0 AND maximum_amount >= minimum_amount),
  CONSTRAINT chk_duration_range CHECK (minimum_duration_days > 0 AND maximum_duration_days >= minimum_duration_days),
  CONSTRAINT chk_zero_rate CHECK (interest_model <> 'zero_interest' OR annual_interest_rate_bps = 0),
  INDEX idx_versions_catalogue (status, currency_code, effective_from, effective_until)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_product_countries (
  loan_product_id BIGINT UNSIGNED NOT NULL,
  country_code CHAR(2) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_by VARCHAR(128) NOT NULL,
  PRIMARY KEY (loan_product_id, country_code),
  CONSTRAINT fk_product_country_product FOREIGN KEY (loan_product_id) REFERENCES loan_products(id),
  CONSTRAINT fk_product_country_country FOREIGN KEY (country_code) REFERENCES countries(code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id VARCHAR(128) NOT NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(128) NOT NULL,
  metadata_json JSON NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_audit_entity (entity_type, entity_id, created_at),
  INDEX idx_audit_actor (actor_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(120) PRIMARY KEY,
  applied_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;
