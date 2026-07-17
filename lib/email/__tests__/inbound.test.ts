/**
 * Tests for Resend inbound-email parsing helpers.
 */
import { describe, it, expect } from "vitest";
import {
  isInboundEmailEvent,
  parseResendInboundEvent,
  inboundDedupeKey,
} from "../inbound";

describe("isInboundEmailEvent", () => {
  it("recognizes received/inbound event types", () => {
    expect(isInboundEmailEvent({ type: "email.received", data: {} })).toBe(true);
    expect(isInboundEmailEvent({ type: "inbound.email.received", data: {} })).toBe(true);
  });

  it("ignores outbound delivery events", () => {
    expect(isInboundEmailEvent({ type: "email.delivered", data: {} })).toBe(false);
    expect(isInboundEmailEvent({ type: "email.bounced", data: {} })).toBe(false);
  });

  it("falls back to payload shape when type is missing", () => {
    expect(
      isInboundEmailEvent({ data: { from: "a@b.com", text: "hi" } })
    ).toBe(true);
    expect(isInboundEmailEvent({ data: { foo: "bar" } })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isInboundEmailEvent(null)).toBe(false);
    expect(isInboundEmailEvent("nope")).toBe(false);
  });
});

describe("parseResendInboundEvent", () => {
  it("parses a header-array inbound payload (reply shape)", () => {
    const event = {
      type: "email.received",
      created_at: "2026-05-22T10:00:00.000Z",
      data: {
        from: "Jane Brand <jane@brand.com>",
        to: ["Info@revieweriq.com"],
        subject: "Re: Partnership with ReviewIQ",
        text: "Sounds great, let's talk.",
        html: "<p>Sounds great, let's talk.</p>",
        headers: [
          { name: "Message-ID", value: "<reply-123@brand.com>" },
          { name: "In-Reply-To", value: "<outreach-99@revieweriq.com>" },
          { name: "References", value: "<outreach-99@revieweriq.com>" },
        ],
      },
    };

    const parsed = parseResendInboundEvent(event);
    expect(parsed.fromEmail).toBe("jane@brand.com");
    expect(parsed.fromName).toBe("Jane Brand");
    expect(parsed.toEmail).toBe("Info@revieweriq.com");
    expect(parsed.subject).toBe("Re: Partnership with ReviewIQ");
    expect(parsed.bodyText).toBe("Sounds great, let's talk.");
    expect(parsed.bodyHtml).toContain("Sounds great");
    expect(parsed.messageId).toBe("<reply-123@brand.com>");
    expect(parsed.inReplyTo).toBe("<outreach-99@revieweriq.com>");
    expect(parsed.references).toBe("<outreach-99@revieweriq.com>");
    expect(parsed.eventType).toBe("email.received");
    expect(parsed.receivedAt.toISOString()).toBe("2026-05-22T10:00:00.000Z");
  });

  it("parses object-form from/to and a header map", () => {
    const event = {
      type: "inbound.email.received",
      data: {
        from: { email: "creator@yt.com", name: "Cool Creator" },
        to: { email: "Info@revieweriq.com" },
        subject: "Re: collab",
        text: "interested",
        headers: { "In-Reply-To": "<x@revieweriq.com>", "Message-ID": "<m@yt.com>" },
      },
    };
    const parsed = parseResendInboundEvent(event);
    expect(parsed.fromEmail).toBe("creator@yt.com");
    expect(parsed.fromName).toBe("Cool Creator");
    expect(parsed.toEmail).toBe("Info@revieweriq.com");
    expect(parsed.inReplyTo).toBe("<x@revieweriq.com>");
    expect(parsed.messageId).toBe("<m@yt.com>");
  });

  it("handles bare email addresses and missing headers", () => {
    const parsed = parseResendInboundEvent({
      type: "email.received",
      data: { from: "plain@sender.com", to: "Info@revieweriq.com", text: "hello" },
    });
    expect(parsed.fromEmail).toBe("plain@sender.com");
    expect(parsed.fromName).toBeNull();
    expect(parsed.inReplyTo).toBeNull();
    expect(parsed.messageId).toBeNull();
    expect(parsed.receivedAt).toBeInstanceOf(Date);
  });
});

describe("inboundDedupeKey", () => {
  it("prefers the Message-ID", () => {
    const parsed = parseResendInboundEvent({
      type: "email.received",
      data: { from: "a@b.com", text: "x", headers: { "Message-ID": "<m@b.com>" } },
    });
    expect(inboundDedupeKey(parsed, "svix_1")).toBe("mid:<m@b.com>");
  });

  it("falls back to the svix id, then a fingerprint", () => {
    const parsed = parseResendInboundEvent({
      type: "email.received",
      data: { from: "a@b.com", subject: "s", text: "x" },
    });
    expect(inboundDedupeKey(parsed, "svix_1")).toBe("svix:svix_1");
    expect(inboundDedupeKey(parsed, null)).toMatch(/^fp:a@b\.com\|s\|/);
  });
});
