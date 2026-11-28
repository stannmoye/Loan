/**
 * Splits ordinary MySQL migration SQL into executable statements without
 * treating semicolons inside quoted strings or SQL comments as delimiters.
 * Stored-program delimiter directives are intentionally unsupported.
 */
export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let index = 0;
  let quote: "'" | '"' | "`" | null = null;
  let lineComment = false;
  let blockComment = false;

  while (index < sql.length) {
    const char = sql[index]!;
    const next = sql[index + 1];

    if (lineComment) {
      if (char === "\n" || char === "\r") {
        lineComment = false;
        current += char;
      }
      index += 1;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        current += " ";
        index += 2;
      } else {
        index += 1;
      }
      continue;
    }

    if (quote !== null) {
      current += char;
      if (char === "\\" && quote !== "`" && next !== undefined) {
        current += next;
        index += 2;
        continue;
      }
      if (char === quote) {
        if (next === quote) {
          current += next;
          index += 2;
          continue;
        }
        quote = null;
      }
      index += 1;
      continue;
    }

    if (char === "-" && next === "-") {
      const following = sql[index + 2];
      if (following === undefined || following.charCodeAt(0) <= 32) {
        lineComment = true;
        index += 2;
        continue;
      }
    }
    if (char === "#") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 2;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
      index += 1;
      continue;
    }
    if (char === ";") {
      const statement = current.trim();
      if (statement.length > 0) statements.push(statement);
      current = "";
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  if (blockComment) throw new Error("Unterminated SQL block comment");
  if (quote !== null) throw new Error("Unterminated SQL quoted value");

  const finalStatement = current.trim();
  if (finalStatement.length > 0) statements.push(finalStatement);
  return statements;
}
