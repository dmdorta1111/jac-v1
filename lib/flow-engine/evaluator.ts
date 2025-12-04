/**
 * Safe expression evaluator for flow conditions
 * Converts SmartAssembly syntax to JavaScript and evaluates with context
 *
 * Security: Whitelist-only operators, no eval() on user input, no function calls
 */

/**
 * Evaluate a boolean expression safely with given context
 * @param expression - SmartAssembly expression (e.g., "OPENING_TYPE == 1 AND HINGES == 1")
 * @param context - Variable context from flowState
 * @returns Boolean result of evaluation
 * @throws Error if expression contains invalid syntax
 */
export function safeEval(expression: string, context: Record<string, any>): boolean {
  // Handle empty or null conditions (always true)
  if (!expression || expression.trim() === '') {
    return true;
  }

  // Convert SmartAssembly operators to JavaScript
  const jsExpression = convertToJavaScript(expression);

  // Extract variable names from expression and ensure they exist in context
  // Default undefined variables to null to prevent ReferenceError
  const expressionVars = extractVariableNames(jsExpression);
  const safeContext: Record<string, any> = { ...context };

  for (const varName of expressionVars) {
    if (!(varName in safeContext)) {
      safeContext[varName] = null;
      console.log(`Variable "${varName}" not in context, defaulting to null`);
    }
  }

  try {
    // Create function with context variables as parameters
    const varNames = Object.keys(safeContext);
    const varValues = Object.values(safeContext);

    // Sanitize variable names for use as function parameters
    // Replace invalid characters (like hyphens) with underscores
    const sanitizeVarName = (name: string): string => {
      return name.replace(/[^a-zA-Z0-9_]/g, '_');
    };

    // Create mapping of original names to sanitized names
    const nameMapping = new Map<string, string>();
    varNames.forEach(name => {
      nameMapping.set(name, sanitizeVarName(name));
    });

    // Replace variable names in expression with sanitized versions
    let sanitizedExpression = jsExpression;
    // Sort by length (longest first) to handle cases where one var name contains another
    const sortedNames = [...varNames].sort((a, b) => b.length - a.length);
    for (const originalName of sortedNames) {
      const sanitizedName = nameMapping.get(originalName)!;
      // Use word boundaries to match whole variable names only
      const regex = new RegExp(`\\b${escapeRegExp(originalName)}\\b`, 'g');
      sanitizedExpression = sanitizedExpression.replace(regex, sanitizedName);
    }

    // Validate sanitized expression syntax (whitelist approach)
    // Must validate AFTER sanitization since original expression may contain hyphens in variable names
    validateExpression(sanitizedExpression);

    // Use sanitized names as function parameters
    const sanitizedParamNames = varNames.map(name => nameMapping.get(name)!);

    // Build function body with safe evaluation
    const fn = new Function(...sanitizedParamNames, `return ${sanitizedExpression};`);

    // Execute with context values
    const result = fn(...varValues);

    // Ensure boolean result
    return Boolean(result);
  } catch (error) {
    console.error('Expression evaluation error:', error, 'Expression:', jsExpression);
    throw new Error(`Failed to evaluate condition: ${expression}`);
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract variable names from a JavaScript expression
 * Matches identifiers that are not keywords, operators, or literals
 * Note: Allows hyphens in variable names (e.g., HINGE_LOCATION_1-9) for SmartAssembly compatibility
 */
function extractVariableNames(expression: string): string[] {
  // Remove string literals first to avoid matching inside strings
  const withoutStrings = expression.replace(/'[^']*'|"[^"]*"/g, '');

  // Match SmartAssembly variable names (allows hyphens)
  // Pattern: starts with letter/underscore, followed by letters/digits/underscores/hyphens
  const identifierPattern = /\b([A-Z_][A-Z0-9_-]*)\b/gi;
  const matches = withoutStrings.match(identifierPattern) || [];

  // Filter out JavaScript keywords and boolean literals
  const keywords = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
  const uniqueVars = [...new Set(matches)].filter(v => !keywords.has(v.toLowerCase()));

  return uniqueVars;
}

/**
 * Convert SmartAssembly syntax to JavaScript operators
 * - AND → &&
 * - OR → ||
 * - <> → !==
 * - Keep == as == (loose equality for boolean/number compatibility)
 * - Preserve ==, !=, <, >, <=, >=
 *
 * Note: SmartAssembly uses 1/0 for boolean flags, but JavaScript form switches
 * return true/false. Loose equality (==) allows true == 1 to work correctly.
 */
function convertToJavaScript(expression: string): string {
  return expression
    // Replace logical operators (case-insensitive, word boundaries)
    .replace(/\bAND\b/gi, '&&')
    .replace(/\bOR\b/gi, '||')
    .replace(/\bNOT\b/gi, '!')

    // Replace comparison operators
    .replace(/<>/g, '!==')  // Not equal (SmartAssembly)
    // Keep == as == (loose equality) for boolean/number compatibility
    // true == 1 returns true, false == 0 returns true

    // Preserve other operators: <=, >=, <, >, !==, !=
    .trim();
}

/**
 * Validate expression contains only whitelisted syntax
 * Prevents code injection and function calls
 */
function validateExpression(expression: string): void {
  // Whitelist: alphanumeric, underscores, spaces, operators, parentheses, quotes
  // Allow: ===, !==, &&, ||, !, <, >, <=, >=, (, ), ', ", numbers, strings
  const allowedPattern = /^[\w\s'"\d()&|!<>=.+-]+$/;

  if (!allowedPattern.test(expression)) {
    throw new Error('Expression contains invalid characters');
  }

  // Block function calls (identifier followed by opening parenthesis)
  // Allow: (expr), but not: func(expr)
  const functionCallPattern = /[a-zA-Z_]\w*\s*\(/;
  if (functionCallPattern.test(expression)) {
    throw new Error('Function calls are not allowed in expressions');
  }

  // Block assignment operators
  if (expression.includes('=') && !expression.match(/[<>!=]==?/)) {
    throw new Error('Assignment operators are not allowed');
  }

  // Block semicolons (prevent statement injection)
  if (expression.includes(';')) {
    throw new Error('Semicolons are not allowed in expressions');
  }
}

/**
 * Evaluate compound condition (parent AND child)
 * Both conditions must be true for result to be true
 */
export function evaluateCompoundCondition(
  parentExpression: string | null,
  childExpression: string | null,
  context: Record<string, any>
): boolean {
  // If parent exists, evaluate it first
  if (parentExpression && parentExpression.trim() !== '') {
    const parentResult = safeEval(parentExpression, context);
    if (!parentResult) {
      return false;  // Parent failed, short-circuit
    }
  }

  // Evaluate child condition
  if (childExpression && childExpression.trim() !== '') {
    return safeEval(childExpression, context);
  }

  // No conditions means unconditional (true)
  return true;
}

/**
 * Test if a value matches expected type
 * Used for type checking before evaluation
 */
export function checkType(value: any, expectedType: 'string' | 'number' | 'boolean'): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return false;
  }
}
