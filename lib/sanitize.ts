// Sanitize user input against XSS attacks
// Strips HTML tags and dangerous patterns from user-submitted content

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeSearchQuery(query: string): string {
  // Remove potential SQL/NoSQL injection patterns and limit length
  return query
    .replace(/[<>'"`;\\]/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi, '')
    .trim()
    .slice(0, 200);
}

export function sanitizeReviewContent(content: string): string {
  // Allow basic text but strip HTML/script tags
  return sanitizeHtml(content).trim();
}
