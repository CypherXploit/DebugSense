export interface LocalError {
  code: string;
  title: string;
  category: string;
  explanation: string;
  cause: string;
  fix: string;
  codeExample: string;
}

export const COMMON_ERRORS: LocalError[] = [
  {
    code: "404",
    title: "Not Found",
    category: "HTTP",
    explanation: "The server cannot find the requested resource. This is one of the most common errors on the web.",
    cause: "The URL is mistyped, the resource has been moved or deleted, or the server is misconfigured.",
    fix: "Check the URL for typos, ensure the resource exists at that path, or check server routing rules.",
    codeExample: "// Example of handling a 404 in Express\napp.use((req, res) => {\n  res.status(404).send('Sorry, we cannot find that!');\n});"
  },
  {
    code: "500",
    title: "Internal Server Error",
    category: "HTTP",
    explanation: "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.",
    cause: "Server-side code crashes, database connection failures, or configuration errors.",
    fix: "Check server logs for a stack trace to identify the exact line of failure.",
    codeExample: "// Example of a 500 error catch-all\ntry {\n  // some risky operation\n} catch (error) {\n  console.error(error);\n  res.status(500).json({ error: 'Internal Server Error' });\n}"
  },
  {
    code: "TypeError: Cannot read property 'x' of undefined",
    title: "Undefined Property Access",
    category: "JavaScript",
    explanation: "Occurs when you try to access a property or call a method on a variable that is currently 'undefined'.",
    cause: "Variable was not initialized, an API returned null/undefined, or an object property is missing.",
    fix: "Use optional chaining (?.) or check if the object exists before accessing its properties.",
    codeExample: "// Bad\nconst name = user.profile.name;\n\n// Good (Optional Chaining)\nconst name = user?.profile?.name;\n\n// Good (Nullish Coalescing)\nconst name = user?.profile?.name ?? 'Guest';"
  },
  {
    code: "ReferenceError: x is not defined",
    title: "Undefined Variable Reference",
    category: "JavaScript",
    explanation: "Occurs when you try to use a variable that has not been declared or is out of scope.",
    cause: "Typo in variable name, variable declared in a different scope, or variable not declared at all.",
    fix: "Ensure the variable is declared using let, const, or var before use, and check for typos.",
    codeExample: "// Error\nconsole.log(myVar);\n\n// Fix\nconst myVar = 'Hello';\nconsole.log(myVar);"
  },
  {
    code: "403",
    title: "Forbidden",
    category: "HTTP",
    explanation: "The server understood the request but refuses to authorize it.",
    cause: "Insufficient permissions, missing authentication tokens, or IP blocking.",
    fix: "Check if the user is logged in and has the necessary roles/permissions for the resource.",
    codeExample: "// Example middleware for permission check\nfunction isAdmin(req, res, next) {\n  if (req.user.role === 'admin') next();\n  else res.status(403).send('Forbidden');\n}"
  }
];
