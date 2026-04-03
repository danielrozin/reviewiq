/**
 * Tests for lib/consent.ts — GDPR consent utilities.
 */
import { describe, it, expect } from 'vitest'
import {
  isEuEea,
  getCountryFromHeaders,
  hashIp,
  toGoogleConsentMode,
  defaultConsentForRegion,
  CURRENT_POLICY_VERSION,
} from '../consent'

describe('isEuEea', () => {
  it('returns true for EU countries', () => {
    const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'SE', 'AT', 'BE']
    for (const code of euCountries) {
      expect(isEuEea(code)).toBe(true)
    }
  })

  it('returns true for EEA (non-EU) countries', () => {
    expect(isEuEea('IS')).toBe(true)
    expect(isEuEea('LI')).toBe(true)
    expect(isEuEea('NO')).toBe(true)
  })

  it('returns true for UK (GDPR)', () => {
    expect(isEuEea('GB')).toBe(true)
  })

  it('returns false for non-EU countries', () => {
    expect(isEuEea('US')).toBe(false)
    expect(isEuEea('CN')).toBe(false)
    expect(isEuEea('JP')).toBe(false)
    expect(isEuEea('IL')).toBe(false)
  })

  it('returns false for null/undefined', () => {
    expect(isEuEea(null)).toBe(false)
    expect(isEuEea(undefined)).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isEuEea('de')).toBe(true)
    expect(isEuEea('De')).toBe(true)
  })
})

describe('getCountryFromHeaders', () => {
  it('extracts country from x-vercel-ip-country header', () => {
    const headers = new Headers({ 'x-vercel-ip-country': 'US' })
    expect(getCountryFromHeaders(headers)).toBe('US')
  })

  it('returns null when header is missing', () => {
    const headers = new Headers()
    expect(getCountryFromHeaders(headers)).toBe(null)
  })
})

describe('hashIp', () => {
  it('returns a 16-character hex string', () => {
    const hash = hashIp('192.168.1.1')
    expect(hash).toHaveLength(16)
    expect(hash).toMatch(/^[a-f0-9]{16}$/)
  })

  it('returns consistent hash for same input', () => {
    expect(hashIp('10.0.0.1')).toBe(hashIp('10.0.0.1'))
  })

  it('returns different hashes for different IPs', () => {
    expect(hashIp('10.0.0.1')).not.toBe(hashIp('10.0.0.2'))
  })
})

describe('toGoogleConsentMode', () => {
  it('maps full consent correctly', () => {
    const mode = toGoogleConsentMode({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    })
    expect(mode).toEqual({
      ad_storage: 'granted',
      analytics_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })

  it('maps restricted consent correctly', () => {
    const mode = toGoogleConsentMode({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    })
    expect(mode).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  })

  it('maps mixed consent correctly', () => {
    const mode = toGoogleConsentMode({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: true,
    })
    expect(mode.analytics_storage).toBe('granted')
    expect(mode.ad_storage).toBe('denied')
    expect(mode.ad_user_data).toBe('denied')
    expect(mode.ad_personalization).toBe('denied')
  })
})

describe('defaultConsentForRegion', () => {
  it('grants all for non-EU', () => {
    const consent = defaultConsentForRegion(false)
    expect(consent).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    })
  })

  it('restricts non-necessary categories for EU', () => {
    const consent = defaultConsentForRegion(true)
    expect(consent).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    })
  })
})

describe('CURRENT_POLICY_VERSION', () => {
  it('is defined and non-empty', () => {
    expect(CURRENT_POLICY_VERSION).toBeDefined()
    expect(CURRENT_POLICY_VERSION.length).toBeGreaterThan(0)
  })
})
