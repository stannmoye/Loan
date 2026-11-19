-- OIDC issuer and subject identifiers use case-sensitive matching
-- MySQL's default collations may be case-insensitive; do not merge identities
-- that differ only by case. The 0900 binary collation also avoids PAD SPACE
-- comparison semantics for these opaque identifiers.
ALTER TABLE customer_identity_links
  MODIFY issuer VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL,
  MODIFY external_subject VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin NOT NULL;
