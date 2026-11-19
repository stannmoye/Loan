import { describe, expect, it } from "vitest";
import { splitSqlStatements } from "../src/db/sql-statements.js";

describe("MySQL migration SQL statement splitting", () => {
  it("splits multiple statements without splitting a semicolon inside a string", () => {
    expect(splitSqlStatements(
      "INSERT INTO messages (body) VALUES ('part one; part two'); SELECT 1;"
    )).toEqual([
      "INSERT INTO messages (body) VALUES ('part one; part two')",
      "SELECT 1"
    ]);
  });

  it("ignores semicolons inside MySQL line and block comments", () => {
    const sql = [
      "-- A comment; with a delimiter",
      "CREATE TABLE example (id INT);",
      "# Another; comment",
      "/* Block; comment */",
      "ALTER TABLE example ADD COLUMN label VARCHAR(20);"
    ].join("\n");
    expect(splitSqlStatements(sql)).toEqual([
      "CREATE TABLE example (id INT)",
      "ALTER TABLE example ADD COLUMN label VARCHAR(20)"
    ]);
  });

  it("preserves quoted identifiers and doubled quote escapes", () => {
    const identifierQuote = String.fromCharCode(96);
    const sql = "INSERT INTO " + identifierQuote + "order;items" + identifierQuote +
      " (" + identifierQuote + "description" + identifierQuote + ") VALUES ('it''s; valid');";
    expect(splitSqlStatements(sql)).toEqual([sql.slice(0, -1)]);
  });

  it("does not interpret a double dash without the MySQL comment whitespace rule as a comment", () => {
    expect(splitSqlStatements("SELECT 5--2; SELECT 3;")).toEqual([
      "SELECT 5--2",
      "SELECT 3"
    ]);
  });

  it("rejects unterminated block comments and quoted values", () => {
    expect(() => splitSqlStatements("SELECT 1 /* not closed")).toThrow(/block comment/i);
    expect(() => splitSqlStatements("SELECT 'not closed")).toThrow(/quoted value/i);
  });
});
