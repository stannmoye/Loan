CREATE TABLE IF NOT EXISTS loan_product_approval_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  loan_product_id BIGINT UNSIGNED NOT NULL,
  product_version_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  submitted_by VARCHAR(128) NOT NULL,
  submitted_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  decided_by VARCHAR(128) NULL,
  decided_at TIMESTAMP(6) NULL,
  decision_note VARCHAR(2000) NULL,
  pending_loan_product_id BIGINT UNSIGNED GENERATED ALWAYS AS (CASE WHEN status = 'pending' THEN loan_product_id ELSE NULL END) STORED,
  CONSTRAINT chk_approval_decision_state CHECK (
    (status = 'pending' AND decided_by IS NULL AND decided_at IS NULL) OR
    (status <> 'pending' AND decided_by IS NOT NULL AND decided_at IS NOT NULL)
  ),
  CONSTRAINT chk_rejected_has_reason CHECK (
    status <> 'rejected' OR (decision_note IS NOT NULL AND CHAR_LENGTH(TRIM(decision_note)) >= 5)
  ),
  CONSTRAINT fk_approval_product FOREIGN KEY (loan_product_id) REFERENCES loan_products(id),
  CONSTRAINT fk_approval_product_version FOREIGN KEY (product_version_id, loan_product_id) REFERENCES loan_product_versions(id, loan_product_id),
  UNIQUE KEY uq_pending_approval_product (pending_loan_product_id),
  INDEX idx_approval_queue (status, submitted_at),
  INDEX idx_approval_product (loan_product_id, status)
) ENGINE=InnoDB;
