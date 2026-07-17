/**
 * Parsing helpers for Resend inbound-email webhooks.
 *
 * Resend signs inbound webhooks with Svix and posts a JSON event whose shape
 * varies slightly by account/version. These helpers normalize the payload into
 * a flat record we persist as an OutreachReply, tolerating both string and
 * object forms for `from`/`to` and both array and map forms for `headers`.
 */

export interface ParsedInboundReply {
  fromEmail: string;
  fromName: string | null;
  toEmail: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  messageId: string | null;
  inReplyTo: string | null;
  references: string | null;
  headers: Record<string, string>;
  eventType: string | null;
  receivedAt: Date;
}

type Json = Record<string, unknown>;

/** True for events that carry an inbound (received) email payload. */
export function isInboundEmailEvent(event: unknown): boolean {
  if (!event || typeof event !== "object") return false;
  const e = event as Json;
  const type = typeof e.type === "string" ? e.type.toLowerCase() : "";
  if (type.includes("received") || type.includes("inbound")) return true;
  // Fallback: some inbound payloads omit a recognizable type but clearly look
  // like a received email (a sender plus a body or subject).
  const data = (e.data ?? e) as Json;
  const hasSender = data.from != null;
  const hasContent = data.text != null || data.html != null || data.subject != null;
  return type === "" && hasSender && hasContent;
}

/** "Display Name <addr@x.com>" or "addr@x.com" → { email, name }. */
function parseAddress(value: unknown): { email: string; name: string | null } {
  if (value == null) return { email: "", name: null };
  if (typeof value === "object") {
    const o = value as Json;
    const email = String(o.email ?? o.address ?? "").trim();
    const name = o.name != null ? String(o.name).trim() : null;
    return { email, name: name || null };
  }
  const str = String(value).trim();
  const match = str.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (match) {
    const name = match[1].trim();
    return { email: match[2].trim(), name: name || null };
  }
  return { email: str, name: null };
}

/** First address from a string, array, or object. */
function firstAddress(value: unknown): { email: string; name: string | null } {
  if (Array.isArray(value)) return parseAddress(value[0]);
  return parseAddress(value);
}

/** Normalize headers (array of {name,value} OR a plain map) to a lowercase map. */
function normalizeHeaders(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(value)) {
    for (const h of value) {
      if (h && typeof h === "object") {
        const o = h as Json;
        const name = o.name ?? o.key;
        if (name != null && o.value != null) {
          out[String(name).toLowerCase()] = String(o.value);
        }
      }
    }
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Json)) {
      if (v != null) out[k.toLowerCase()] = String(v);
    }
  }
  return out;
}

/** Read a header from the normalized map, falling back to data fields. */
function pick(
  headers: Record<string, string>,
  data: Json,
  header: string,
  ...dataKeys: string[]
): string | null {
  const fromHeader = headers[header.toLowerCase()];
  if (fromHeader) return fromHeader;
  for (const key of dataKeys) {
    if (data[key] != null) return String(data[key]);
  }
  return null;
}

export function parseResendInboundEvent(event: unknown): ParsedInboundReply {
  const e = (event && typeof event === "object" ? event : {}) as Json;
  const data = (e.data && typeof e.data === "object" ? e.data : e) as Json;

  const from = firstAddress(data.from);
  const to = firstAddress(data.to);
  const headers = normalizeHeaders(data.headers);

  const eventType = typeof e.type === "string" ? e.type : null;
  const createdAt = data.created_at ?? e.created_at;
  const receivedAt =
    typeof createdAt === "string" || typeof createdAt === "number"
      ? new Date(createdAt)
      : new Date();

  return {
    fromEmail: from.email,
    fromName: from.name,
    toEmail: to.email || null,
    subject: data.subject != null ? String(data.subject) : null,
    bodyText: data.text != null ? String(data.text) : null,
    bodyHtml: data.html != null ? String(data.html) : null,
    messageId: pick(headers, data, "message-id", "message_id", "messageId"),
    inReplyTo: pick(headers, data, "in-reply-to", "in_reply_to", "inReplyTo"),
    references: pick(headers, data, "references", "references"),
    headers,
    eventType,
    receivedAt: isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
  };
}

/**
 * Stable identity for idempotent upserts. Prefer the Message-ID, then the Svix
 * delivery id, then a synthesized fingerprint so retries never duplicate rows.
 */
export function inboundDedupeKey(
  parsed: ParsedInboundReply,
  svixId: string | null
): string {
  if (parsed.messageId) return `mid:${parsed.messageId}`;
  if (svixId) return `svix:${svixId}`;
  return `fp:${parsed.fromEmail}|${parsed.subject ?? ""}|${parsed.receivedAt.toISOString()}`;
}
