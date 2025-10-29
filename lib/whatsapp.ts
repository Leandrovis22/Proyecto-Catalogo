/**
 * WhatsApp Cloud API (Meta) helper
 * - Sends text messages using the WhatsApp Cloud API (Graph API)
 * - Implements a simple in-memory rate limiter as fallback
 * - Attempts to log notifications to DB if a Drizzle/D1 instance is available
 */
import axios from 'axios'
import { getDb } from './db'

const WA_TOKEN = process.env.WA_CLOUD_TOKEN || ''
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID || ''
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '' // e.g. 5491112345678

if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) {
  console.warn('WA_CLOUD_TOKEN or WA_PHONE_NUMBER_ID not set — WhatsApp Cloud API will not work until configured')
}

// Simple in-memory rate limiter (per-target token bucket)
type RateState = { tokens: number; lastRefill: number }
const rateMap = new Map<string, RateState>()
const MAX_TOKENS = 5 // allow burst of 5
const REFILL_INTERVAL_MS = 60 * 1000 // refill 1 token per minute

function refillTokens(state: RateState) {
  const now = Date.now()
  const elapsed = now - state.lastRefill
  const tokensToAdd = Math.floor(elapsed / REFILL_INTERVAL_MS)
  if (tokensToAdd > 0) {
    state.tokens = Math.min(MAX_TOKENS, state.tokens + tokensToAdd)
    state.lastRefill = now
  }
}

async function logNotificationToDb(target: string, orderId: string | null, status: string) {
  try {
    const db = getDb(undefined)
    if (!db) return null
    // If Drizzle is available, try to insert into notifications_log table
    // The actual API depends on your Drizzle setup; this is a best-effort attempt
    // and will not throw if Drizzle isn't configured for local dev.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyDb: any = db
    if (anyDb && anyDb.insert) {
      await anyDb.insert('notifications_log').values({ target, order_id: orderId, status, created_at: new Date().toISOString() })
    }
  } catch (err) {
    // ignore DB logging errors — it's non-fatal for sending
    console.warn('Failed to log notification to DB:', err)
  }
}

export async function canSendTo(target: string) {
  const key = String(target)
  let state = rateMap.get(key)
  if (!state) {
    state = { tokens: MAX_TOKENS, lastRefill: Date.now() }
    rateMap.set(key, state)
  }
  refillTokens(state)
  if (state.tokens > 0) {
    state.tokens -= 1
    return true
  }
  return false
}

export async function sendWhatsAppCloud(toNumber: string, text: string) {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) throw new Error('WhatsApp Cloud API not configured')

  const url = `https://graph.facebook.com/v17.0/${WA_PHONE_NUMBER_ID}/messages`
  const payload = {
    messaging_product: 'whatsapp',
    to: toNumber,
    type: 'text',
    text: { body: text }
  }

  const res = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' }
  })

  return res.data
}

/**
 * High-level: send order notification to admin via WhatsApp Cloud API
 * - orderSummary should contain at least: id, customerName, customerPhone
 */
export async function sendOrderNotification(orderSummary: { id: string; customerName: string; customerPhone: string }) {
  const admin = ADMIN_WHATSAPP_NUMBER
  if (!admin) throw new Error('ADMIN_WHATSAPP_NUMBER is not set')

  const target = String(admin)
  const canSend = await canSendTo(target)
  if (!canSend) {
    await logNotificationToDb(target, orderSummary.id, 'rate_limited')
    throw new Error('Rate limit exceeded for target ' + target)
  }

  const link = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tu-dominio.com'}/admin/orders/${orderSummary.id}`
  const message = `Nueva orden completa\nCliente: ${orderSummary.customerName}\nTel: ${orderSummary.customerPhone}\nVer orden: ${link}`

  try {
    const result = await sendWhatsAppCloud(target, message)
    await logNotificationToDb(target, orderSummary.id, 'sent')
    return result
  } catch (err) {
    await logNotificationToDb(target, orderSummary.id, 'error')
    throw err
  }
}
