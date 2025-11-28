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

  // Validate expression syntax (whitelist approach)
  validateExpression(jsExpression);

  try {
    // Create function with context variables as parameters
    const varNames = Object.keys(context);
    const varValues = Object.values(context);

    // Build function body with safe evaluation
    const fn = new Function(...varNames, `return ${jsExpression};`);

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
 * Convert SmartAssembly syntax to JavaScript operators
 * - AND → &&
 * - OR → ||
 * - == → ===
 * - <> → !==
 * - Preserve ==, !=, <, >, <=, >=
 */
function convertToJavaScript(expression: string): string {
  return expression
    // Replace logical operators (case-insensitive, word boundaries)
    .replace(/\bAND\b/gi, '&&')
    .replace(/\bOR\b/gi, '||')
    .replace(/\bNOT\b/gi, '!')

    // Replace comparison operators
    .replace(/<>/g, '!==')  // Not equal (SmartAssembly)
    .replace(/(?<![!<>=])={2}(?!=)/g, '===')  // == → === (but not === or !== or <==)

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
