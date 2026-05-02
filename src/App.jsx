import React, { useState, useMemo, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Wine, Plus, Search, BarChart3, LogIn, LogOut,
  Edit2, Trash2, X, Menu, Sparkles, Check,
  LayoutGrid, List, Camera, ImageOff, Eye, EyeOff, ExternalLink,
  ShieldCheck, Users, UserCheck, UserX, Settings, KeyRound,
  FileText, Download, FileSpreadsheet, TrendingUp, Share2, Send, Instagram,
} from 'lucide-react'

// ─── FONT: Outfit is loaded globally via index.html ───────────────────────────
const FONT = "'Outfit', system-ui, sans-serif"

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPA_URL = import.meta.env.VITE_SUPA_URL
const SUPA_KEY = import.meta.env.VITE_SUPA_KEY
const supabase = createClient(SUPA_URL, SUPA_KEY)
const EDGE_FN_URL       = `${SUPA_URL}/functions/v1/videiras-admin`
const SHARE_FN_URL      = `${SUPA_URL}/functions/v1/videiras-share`
const ESTIMATE_FN_URL   = `${SUPA_URL}/functions/v1/videiras-estimate`

// ─── TYPE COLORS ──────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  Tinto:     { fg: '#e87080', bg: '#2d0a12' },
  Branco:    { fg: '#e0b858', bg: '#2a1e06' },
  Rosé:      { fg: '#e878a8', bg: '#2d0f20' },
  Espumante: { fg: '#78b0d8', bg: '#091d2e' },
  Porto:     { fg: '#c078cc', bg: '#1e0828' },
  Verde:     { fg: '#68c880', bg: '#061e10' },
  Moscatel:  { fg: '#d4a838', bg: '#1e1500' },
  Laranja:   { fg: '#e88050', bg: '#2c0f00' },
}
const getTC = (t) => TYPE_COLORS[t] || { fg: '#9a8f82', bg: '#1e1b16' }

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const INIT_TYPES = ['Branco', 'Espumante', 'Madeira', 'Rosé', 'Tinto', 'Verde'];  // Madeira type added from PROVAS

const COUNTRIES_REGIONS = {
  Portugal:        ['Douro', 'Alentejo', 'Dão', 'Vinho Verde', 'Bairrada', 'Beira Interior', 'Lisboa', 'Setúbal', 'Tejo', 'Madeira', 'Trás-os-Montes', 'Beira', 'Bucelas', 'Alcobaça', 'Monção e Melgaço', 'Algarve', 'Península de Setúbal'],
  França:          ['Bordéus', 'Borgonha', 'Champagne', 'Alsácia', 'Vale do Loire', 'Rhône', 'Languedoc', 'Provence', 'Bourgogne', 'Savoie', 'Juliénas', 'Bourgueil', 'Crozes-Hermitage', 'Saint-Tropez'],
  Espanha:         ['Rioja', 'Ribera del Duero', 'Priorat', 'Rías Baixas', 'Penedès', 'Jerez', 'Rueda', 'Ribeira Sacra', 'Bierzo', 'Salamanca'],
  Itália:          ['Piemonte', 'Toscana', 'Véneto', 'Sicília', 'Campânia', 'Pecorino'],
  Alemanha:        ['Mosel', 'Rheingau', 'Pfalz', 'Baden'],
  Argentina:       ['Mendoza', 'Salta', 'Patagónia'],
  Chile:           ['Maipo', 'Colchagua', 'Casablanca'],
  EUA:             ['Napa Valley', 'Sonoma', 'Willamette Valley'],
  Austrália:       ['Barossa Valley', 'McLaren Vale', 'Yarra Valley'],
  Áustria:         ['Wachau', 'Kamptal', 'Burgenland'],
  'África do Sul': ['Stellenbosch', 'Franschhoek', 'Swartland'],
  Eslovénia:       ['Primorska', 'Posavje'],
  Outro:           [],
}

const SUPPLIERS = [
  'Garrafeira Nacional', 'Garrafeira do Carmo', 'Wine with Spirit',
  'Continente', 'El Corte Inglés', 'Quinta (direto)', 'Adega (direto)', 'Outro',
]



// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtN   = (n, dec = 2) => n == null ? '—' : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n)
const fmtInt = (n) => n == null ? '—' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
const fmt    = (n) => n != null ? fmtN(n) + ' €' : '—'
const fmtNum = (n) => n != null ? fmtN(Number(n)) : ''
// PDF: sem separador de milhares para evitar problemas de rendering
const pdfN   = (n, dec = 2) => n == null ? '—' : n.toFixed(dec).replace('.', ',')
const pdfInt = (n) => n == null ? '—' : String(Math.round(n))
const pdfFmt = (n) => n != null ? pdfN(n) + ' €' : '—'
const totalV = (w) => (w.purchasePrice || 0) * (w.quantity || 0)
const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

// ─── DB MAPPING ───────────────────────────────────────────────────────────────
const wineFromDb = (r) => ({
  id: r.id, name: r.name, type: r.type, country: r.country, region: r.region,
  year: r.year, purchasePrice: parseFloat(r.purchase_price) || 0,
  marketPrice: r.market_price != null ? parseFloat(r.market_price) : null,
  personalRating: parseFloat(r.personal_rating) || 0,
  vivinoRating: r.vivino_rating != null ? parseFloat(r.vivino_rating) : null,
  quantity: r.quantity, photo: r.photo || null, notes: r.notes || '',
  castas: r.castas || '', alcoholContent: r.alcohol_content != null ? parseFloat(r.alcohol_content) : '',
})
const wineToDb = (w) => ({
  name: w.name, type: w.type, country: w.country, region: w.region, year: w.year || null,
  purchase_price: w.purchasePrice || 0, market_price: w.marketPrice ?? null,
  personal_rating: w.personalRating || 0,
  vivino_rating: w.vivinoRating ?? null, quantity: w.quantity ?? 0,
  photo: w.photo || null, notes: w.notes || '',
  castas: w.castas || null, alcohol_content: w.alcoholContent !== '' ? parseFloat(w.alcoholContent) : null,
})
const entryFromDb = (r) => ({
  id: r.id, wineId: r.wine_id, date: r.date,
  quantity: r.quantity, supplier: r.supplier, price: parseFloat(r.price) || 0,
})
const entryToDb = (e) => ({
  wine_id: e.wineId, date: e.date, quantity: e.quantity,
  supplier: e.supplier || '', price: e.price || 0,
})
const consumptionFromDb = (r) => ({
  id: r.id, wineId: r.wine_id, date: r.date, quantity: r.quantity,
  rating: r.rating != null ? parseFloat(r.rating) : 0, notes: r.notes || '',
})
const consumptionToDb = (c) => ({
  wine_id: c.wineId, date: c.date, quantity: c.quantity,
  rating: c.rating || null, notes: c.notes || '',
})

// ─── LOCAL CACHE ──────────────────────────────────────────────────────────────
const CACHE_KEY = 'videiras_data_v1'
const loadCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null } }
const saveCache = (d) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)) } catch {} }
const clearCache = () => { try { localStorage.removeItem(CACHE_KEY) } catch {} }

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const S = {
  inp: {
    width: '100%', background: '#0d0b09', border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 6, color: '#e8dece', padding: '8px 12px', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', fontFamily: FONT,
  },
  lbl: {
    fontSize: 10, color: '#9a8f82', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: 5, display: 'block', fontWeight: 500,
  },
  field: { marginBottom: 14 },
  card:  { background: '#1e1b16', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' },
  stat:  { background: '#1e1b16', borderRadius: 8,  border: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px' },
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Stars({ value = 0, onChange, size = 14 }) {
  const [hov, setHov] = useState(null)
  const v = hov ?? value
  const handleMove = (e, s) => {
    if (!onChange) return
    const r = e.currentTarget.getBoundingClientRect()
    setHov((e.clientX - r.left) < r.width / 2 ? s - 0.5 : s)
  }
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const full = v >= s
        const half = !full && v >= s - 0.5
        return (
          <span key={s} style={{ position: 'relative', fontSize: size, lineHeight: 1, cursor: onChange ? 'pointer' : 'default', display: 'inline-block' }}
            onMouseMove={(e) => handleMove(e, s)}
            onMouseLeave={() => onChange && setHov(null)}
            onClick={() => onChange && onChange(hov ?? value)}>
            <span style={{ color: '#2e2a24' }}>★</span>
            {(full || half) && (
              <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: full ? '100%' : '50%', color: '#d4a843', display: 'block', whiteSpace: 'nowrap' }}>★</span>
            )}
          </span>
        )
      })}
    </div>
  )
}

function Badge({ type }) {
  const c = getTC(type)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
      borderRadius: 4, background: c.bg, color: c.fg, fontSize: 10, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.fg, flexShrink: 0 }} />
      {type}
    </span>
  )
}

function Btn({ children, onClick, variant = 'default', style = {}, disabled = false }) {
  const base = {
    padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 400,
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
    transition: 'background 0.15s, opacity 0.15s',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    opacity: disabled ? 0.45 : 1, fontFamily: FONT,
  }
  const variants = {
    default: { background: 'rgba(255,255,255,0.07)', color: '#e8dece' },
    gold:    { background: '#c8963e', color: '#0d0b09' },
    ghost:   { background: 'transparent', color: '#9a8f82', border: '1px solid rgba(255,255,255,0.08)' },
    danger:  { background: 'rgba(192,48,74,0.15)', color: '#e87080' },
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>
}

function WineThumb({ photo, type, size = 40, onClick }) {
  const c = getTC(type)
  if (photo) return (
    <img src={photo} alt="" onClick={onClick}
      style={{ width: size, height: size * 1.5, objectFit: 'cover', borderRadius: 4, display: 'block', flexShrink: 0,
        cursor: onClick ? 'zoom-in' : 'default', transition: 'opacity 0.15s' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '0.82' }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = '1' }}
    />
  )
  return (
    <div style={{ width: size, height: size * 1.5, borderRadius: 4, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Wine size={size * 0.45} color={c.fg} style={{ opacity: 0.45 }} />
    </div>
  )
}

function PhotoLightbox({ src: imgSrc, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div onClick={(e) => { e.stopPropagation(); onClose() }} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'zoom-out',
    }}>
      <img src={imgSrc} alt="" onClick={e => e.stopPropagation()} style={{
        maxWidth: '90vw', maxHeight: '90vh',
        objectFit: 'contain', borderRadius: 8,
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        cursor: 'default',
      }} />
      <button onClick={(e) => { e.stopPropagation(); onClose() }} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#e8dece', cursor: 'pointer',
      }}><X size={16} /></button>
    </div>
  )
}

function QuoteOverlay({ quote, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  if (!quote) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, cursor: 'pointer',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 480, width: '100%', background: '#161310',
        border: '1px solid rgba(200,150,62,0.25)', borderRadius: 16,
        padding: '40px 36px', textAlign: 'center', cursor: 'default',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: 28, color: 'rgba(200,150,62,0.3)', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 16 }}>"</div>
        <p style={{ fontSize: 16, fontWeight: 300, color: '#e8dece', fontFamily: FONT, lineHeight: 1.65, margin: '0 0 20px', letterSpacing: '0.01em' }}>
          {quote.quote}
        </p>
        {quote.author && (
          <p style={{ fontSize: 12, color: '#6a5f52', fontStyle: 'italic', margin: '0 0 28px' }}>— {quote.author}</p>
        )}
        <button onClick={onClose} style={{
          padding: '9px 28px', borderRadius: 7, border: '1px solid rgba(200,150,62,0.3)',
          background: 'rgba(200,150,62,0.08)', color: '#c8963e', cursor: 'pointer',
          fontFamily: FONT, fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,150,62,0.16)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,150,62,0.08)' }}>
          Continuar
        </button>
      </div>
    </div>
  )
}

// ─── INSTAGRAM IMAGE GENERATOR ────────────────────────────────────────────────
async function generateInstagramImage(wine, tastingNotes = '') {
  const W = 1080, H = 1080, PAD = 80
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  const fillRRect = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill() }

  const wrapLines = (text, maxW) => {
    const words = text.split(' '), lines = []
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word } else line = test
    }
    if (line) lines.push(line)
    return lines
  }

  const drawWrap = (text, cx, y, maxW, lineH, maxLines = 3) => {
    const lines = wrapLines(text, maxW).slice(0, maxLines)
    lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineH))
    return lines.length * lineH
  }

  // Load app icon from SVG
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#161310"/><rect width="32" height="32" rx="7" fill="none" stroke="#c8963e" stroke-width="1.5"/><path d="M10 7 L22 7 L19 15 Q16 18 16 18 Q16 18 13 15 Z" fill="none" stroke="#c8963e" stroke-width="1.5" stroke-linejoin="round"/><line x1="16" y1="18" x2="16" y2="24" stroke="#c8963e" stroke-width="1.5" stroke-linecap="round"/><line x1="11" y1="24" x2="21" y2="24" stroke="#c8963e" stroke-width="1.5" stroke-linecap="round"/></svg>`
  const iconImg = await new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconSvg)
  })

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#1c1915'); bg.addColorStop(1, '#0e0c0a')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Vignette
  const vig = ctx.createRadialGradient(W/2, H/2, W*0.25, W/2, H/2, W*0.8)
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

  // Gold top bar
  ctx.fillStyle = '#c8963e'; ctx.fillRect(0, 0, W, 5)

  // Corner accents
  ctx.strokeStyle = 'rgba(200,150,62,0.18)'; ctx.lineWidth = 1.5
  const CA = 36, CO = PAD
  ;[[CO,CO+CA,CO,CO,CO+CA,CO],[W-CO-CA,CO,W-CO,CO,W-CO,CO+CA],
    [CO,H-CO-CA,CO,H-CO,CO+CA,H-CO],[W-CO-CA,H-CO,W-CO,H-CO,W-CO,H-CO-CA]
  ].forEach(([x1,y1,xm,ym,x2,y2]) => { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(xm,ym); ctx.lineTo(x2,y2); ctx.stroke() })

  // Header: icon + "VIDEIRAS"
  const ICON_S = 44
  ctx.font = '300 28px Outfit, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(232,220,206,0.85)'
  const headerTextW = ctx.measureText('VIDEIRAS').width
  const headerTotalW = ICON_S + 12 + headerTextW
  const headerX = (W - headerTotalW) / 2
  const headerY = PAD + 12
  if (iconImg) ctx.drawImage(iconImg, headerX, headerY, ICON_S, ICON_S)
  ctx.textAlign = 'left'
  ctx.fillText('VIDEIRAS', headerX + ICON_S + 12, headerY + ICON_S * 0.72)

  let y = headerY + ICON_S + 36

  // Photo (if exists)
  if (wine.photo) {
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const PW = 290, PH = 360, px = (W - PW) / 2
        ctx.save(); ctx.beginPath(); ctx.roundRect(px, y, PW, PH, 12); ctx.clip()
        const scale = Math.max(PW/img.width, PH/img.height)
        ctx.drawImage(img, px+(PW-img.width*scale)/2, y+(PH-img.height*scale)/2, img.width*scale, img.height*scale)
        ctx.restore()
        ctx.strokeStyle = 'rgba(200,150,62,0.25)'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(px, y, PW, PH, 12); ctx.stroke()
        y += PH + 44; resolve()
      }
      img.onerror = () => resolve()
      img.src = wine.photo
    })
  } else {
    // Placeholder: coloured block with wine glass
    const tc = getTC(wine.type)
    const PW = 290, PH = 360, px = (W - PW) / 2

    // Background rounded rect
    ctx.save()
    ctx.beginPath(); ctx.roundRect(px, y, PW, PH, 12); ctx.clip()

    // Solid fill with type colour
    ctx.fillStyle = tc.bg
    ctx.fillRect(px, y, PW, PH)

    // Radial glow at centre
    const glow = ctx.createRadialGradient(W/2, y + PH*0.45, 10, W/2, y + PH*0.45, PW*0.55)
    glow.addColorStop(0, tc.fg + '28')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow; ctx.fillRect(px, y, PW, PH)
    ctx.restore()

    // Subtle border
    ctx.strokeStyle = tc.fg + '40'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(px, y, PW, PH, 12); ctx.stroke()

    // Wine glass drawn directly in canvas (32×32 viewBox scaled to ~130px)
    const GS = 130, GX = (W - GS) / 2, GY = y + (PH - GS) / 2 - 10
    const sc = GS / 32
    ctx.save()
    ctx.translate(GX, GY)
    ctx.scale(sc, sc)
    ctx.strokeStyle = tc.fg + 'cc'; ctx.lineWidth = 1.5 / sc; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    // Bowl
    ctx.beginPath(); ctx.moveTo(10,7); ctx.lineTo(22,7); ctx.lineTo(19,15)
    ctx.quadraticCurveTo(16,18,16,18); ctx.quadraticCurveTo(16,18,13,15); ctx.closePath(); ctx.stroke()
    // Stem
    ctx.beginPath(); ctx.moveTo(16,18); ctx.lineTo(16,24); ctx.stroke()
    // Base
    ctx.beginPath(); ctx.moveTo(11,24); ctx.lineTo(21,24); ctx.stroke()
    ctx.restore()

    y += PH + 44
  }

  // Type badge
  const tc = getTC(wine.type)
  if (wine.type) {
    ctx.font = '600 19px Outfit, system-ui, sans-serif'
    const tw = ctx.measureText(wine.type.toUpperCase()).width + 32
    ctx.fillStyle = tc.bg; fillRRect((W-tw)/2, y, tw, 32, 16)
    ctx.fillStyle = tc.fg; ctx.textAlign = 'center'
    ctx.fillText(wine.type.toUpperCase(), W/2, y + 22)
    y += 32 + 90
  }

  // Wine name
  const nLen = wine.name.length
  const nSize = nLen > 28 ? 48 : nLen > 18 ? 58 : 68
  ctx.font = `300 ${nSize}px Outfit, system-ui, sans-serif`
  ctx.fillStyle = '#e8dece'; ctx.textAlign = 'center'
  y += drawWrap(wine.name, W/2, y, W - PAD*2.5, nSize*1.22, 2) - 8

  // Year · Region · Country (no price)
  const sub = [wine.year && String(wine.year), [wine.region, wine.country].filter(Boolean).join(', ')].filter(Boolean).join('  ·  ')
  if (sub) {
    ctx.font = '300 26px Outfit, system-ui, sans-serif'; ctx.fillStyle = '#c8b89a'
    ctx.fillText(sub, W/2, y); y += 44
  }

  // Tasting notes from share modal (below year/region)
  if (tastingNotes && tastingNotes.trim()) {
    y += 4
    ctx.font = 'italic 300 23px Outfit, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(200,150,62,0.55)'
    y += drawWrap(`"${tastingNotes.trim()}"`, W/2, y, W - PAD*2.5, 34, 3) + 10
  }

  // Divider
  y += 8
  ctx.strokeStyle = 'rgba(200,150,62,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD*2, y); ctx.lineTo(W-PAD*2, y); ctx.stroke()
  y += 48

  // Stars
  if (wine.personalRating) {
    ctx.font = '400 34px Outfit, system-ui, sans-serif'; ctx.textAlign = 'left'
    const sw = ctx.measureText('★').width + 10
    const sx = (W - (5*sw - 10)) / 2
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < wine.personalRating ? '#d4a843' : '#252018'
      ctx.fillText('★', sx + i*sw, y)
    }
    ctx.textAlign = 'center'
  }

  // Gold bottom bar + branding
  ctx.fillStyle = '#c8963e'; ctx.fillRect(0, H-5, W, 5)
  ctx.font = '400 15px Outfit, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(232,220,206,0.7)'; ctx.textAlign = 'center'
  ctx.fillText('© Videiras Cellar Collection', W/2, H - PAD + 14)

  // Download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${wine.name.replace(/[^a-z0-9]/gi,'_').toLowerCase()}_instagram.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

// ─── ABOUT MODAL ──────────────────────────────────────────────────────────────
function calcAge() {
  const born = new Date(1975, 0, 5)
  const today = new Date()
  let age = today.getFullYear() - born.getFullYear()
  const m = today.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--
  return age
}

function AboutModal({ onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 380, background: '#161310',
        border: '1px solid rgba(200,150,62,0.2)', borderRadius: 16,
        padding: '32px 28px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', alignSelf: 'flex-end', marginTop: -16, marginRight: -12,
          background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', padding: 4,
          display: 'flex',
        }}><X size={16} /></button>

        <img
          src="/videiras.png"
          alt="Sérgio Henriques"
          style={{
            width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
            border: '2px solid rgba(200,150,62,0.35)', marginBottom: 20,
          }}
        />

        <div style={{ fontSize: 15, color: '#e8dece', fontWeight: 400, marginBottom: 4, fontFamily: FONT }}>
          Sérgio Henriques, {calcAge()} anos
        </div>
        <div style={{ fontSize: 10, color: '#c8963e', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20, fontFamily: FONT }}>
          o Videiras
        </div>

        <p style={{ fontSize: 13, color: '#9a8f82', lineHeight: 1.7, margin: 0, fontFamily: FONT }}>
          "Videiras" é uma alcunha com história: uma noite de copos na Queima das Fitas de Aveiro
          que terminou com o Sérgio no meio de umas vinhas. A alcunha ficou; os detalhes dessa noite
          ficaram estrategicamente esquecidos.
        </p>
        <p style={{ fontSize: 13, color: '#9a8f82', lineHeight: 1.7, margin: '14px 0 0', fontFamily: FONT }}>
          Décadas depois, a relação com o vinho evoluiu de acidente geográfico para paixão declarada
          — desenvolvida a sério durante a pandemia. A Bairrada é a região favorita, e esta aplicação
          nasceu para saber exactamente o que há em casa sem ter de abrir a garrafeira.
        </p>
      </div>
    </div>
  )
}

// ─── SHARE MODAL ──────────────────────────────────────────────────────────────
function ShareModal({ wine, session, onClose }) {
  const [email,      setEmail]      = React.useState('')
  const [sending,    setSending]    = React.useState(false)
  const [msg,        setMsg]        = React.useState('')
  const [genLoading,   setGenLoading]   = React.useState(false)
  const [tastingNotes, setTastingNotes] = React.useState('')

  const handleInstagram = async () => {
    setGenLoading(true)
    await generateInstagramImage(wine, tastingNotes)
    setGenLoading(false)
  }

  const handleSend = async () => {
    if (!email.trim()) return
    setSending(true); setMsg('')
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      const res = await fetch(SHARE_FN_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email.trim(), wine }),
      })
      const data = await res.json()
      if (data.ok) { setMsg('✓ Email enviado com sucesso!'); setEmail('') }
      else setMsg('Erro: ' + (data.error || 'Não foi possível enviar.'))
    } catch (e) {
      setMsg('Erro: ' + e.message)
    }
    setSending(false)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 400, background: '#161310',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
        padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Share2 size={14} color="#c8963e" />
              <span style={{ fontSize: 14, color: '#e8dece', fontFamily: FONT }}>Partilhar vinho</span>
            </div>
            <div style={{ fontSize: 12, color: '#4a453f', fontFamily: FONT }}>{wine.name}{wine.year ? ` · ${wine.year}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ ...S.lbl, display: 'block', marginBottom: 6 }}>Email do destinatário</label>
          <input
            style={{ ...S.inp, width: '100%' }}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder="exemplo@email.com"
            autoFocus
          />
        </div>

        {msg && (
          <div style={{
            marginBottom: 14, padding: '8px 12px', borderRadius: 6, fontSize: 12,
            color: msg.startsWith('✓') ? '#68c880' : '#e87080',
            background: msg.startsWith('✓') ? 'rgba(104,200,128,0.08)' : 'rgba(232,112,128,0.08)',
            fontFamily: FONT,
          }}>{msg}</div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 20 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="gold" onClick={handleSend} disabled={sending || !email.trim()}>
            <Send size={13} />{sending ? 'A enviar…' : 'Enviar'}
          </Btn>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
          <div style={{ fontSize: 10, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: FONT }}>Imagem para Instagram</div>
          <div style={{ marginBottom: 12 }}>
            <label style={S.lbl}>Notas de prova <span style={{ color: '#4a453f', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional — aparece apenas no cartão)</span></label>
            <textarea
              style={{ ...S.inp, minHeight: 72, resize: 'vertical', width: '100%' }}
              value={tastingNotes}
              onChange={e => setTastingNotes(e.target.value)}
              placeholder="Frutos vermelhos, taninos suaves, final longo…"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={handleInstagram} disabled={genLoading} style={{ borderColor: 'rgba(200,150,62,0.2)' }}>
              <Instagram size={13} />{genLoading ? 'A gerar…' : 'Transferir imagem'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalShell({ onClose, children, isMobile }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)',
        display: 'flex', zIndex: 100, backdropFilter: 'blur(4px)',
        ...(isMobile
          ? { alignItems: 'flex-end', justifyContent: 'stretch' }
          : { alignItems: 'center', justifyContent: 'center', padding: '24px 16px' })
      }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: FONT, overflowY: 'auto',
          ...(isMobile
            ? { width: '100%', maxHeight: '92vh', borderRadius: '16px 16px 0 0', padding: '20px 16px 32px', overflowX: 'hidden' }
            : { borderRadius: 14, padding: '28px 28px 24px', width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 48px)' })
        }}>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a8f82' }}>{subtitle}</p>}
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: 4 }}>
        <X size={18} />
      </button>
    </div>
  )
}

// ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────────
function PhotoUpload({ value, onChange }) {
  const ref = useRef()
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(await readFileAsBase64(file))
  }
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      {value
        ? <img src={value} alt="" style={{ width: 52, height: 78, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }} />
        : <div style={{ width: 52, height: 78, borderRadius: 6, background: '#0d0b09', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Camera size={18} color="#4a453f" />
          </div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        <Btn variant="ghost" onClick={() => ref.current?.click()}>
          <Camera size={13} />{value ? 'Alterar foto' : 'Adicionar foto'}
        </Btn>
        {value && <Btn variant="danger" onClick={() => onChange(null)} style={{ padding: '4px 10px', fontSize: 12 }}><ImageOff size={12} />Remover</Btn>}
      </div>
    </div>
  )
}

// ─── WINE NAME AUTOCOMPLETE ───────────────────────────────────────────────────
function WineNameAutocomplete({ value, onChange, allWines, onExactMatch, onPartialMatch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  const q = value.trim().toLowerCase()
  const suggestions = q.length >= 2
    ? allWines.filter((w) => w.name.toLowerCase().includes(q)).slice(0, 8)
    : []

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={S.inp}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => { if (suggestions.length) setOpen(true) }}
        placeholder="Ex: Quinta da Gaivosa"
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: 4,
          background: '#1e1b16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <div style={{ padding: '6px 12px 4px', fontSize: 10, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Vinhos existentes — clica para dar entrada
          </div>
          {suggestions.map((w) => (
            <div key={w.id}
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); onExactMatch(w) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                cursor: 'pointer', transition: 'background 0.1s', borderTop: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <WineThumb photo={w.photo} type={w.type} size={18} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                <div style={{ fontSize: 11, color: '#9a8f82' }}>{w.year} · {w.region}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <Badge type={w.type} />
                  <div style={{ fontSize: 10, color: w.quantity > 0 ? '#68c880' : '#e87080', marginTop: 2 }}>
                    {w.quantity > 0 ? `${w.quantity} em stock` : 'sem stock'}
                  </div>
                </div>
                <button
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onPartialMatch(w) }}
                  title="Criar novo vintage com este nome"
                  style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#6a6058', fontSize: 10,
                    cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  + vintage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── WINE FORM ────────────────────────────────────────────────────────────────
function WineForm({ wine, types, setTypes, countriesRegions, setCountriesRegions, allWines, onExactMatch, onSave, onClose, isMobile }) {
  const blank = { name: '', type: 'Tinto', country: 'Portugal', region: '', year: new Date().getFullYear(), purchasePrice: '', marketPrice: '', personalRating: 0, vivinoRating: '', quantity: 0, photo: null, notes: '', castas: '', alcoholContent: '' }
  const [f, setF] = useState(wine ? { ...wine, purchasePrice: fmtNum(wine.purchasePrice), marketPrice: fmtNum(wine.marketPrice), vivinoRating: fmtNum(wine.vivinoRating) } : blank)
  const [loadingV,   setLoadingV]   = useState(false)
  const [vivinoStatus, setVivinoStatus] = useState('idle') // 'idle' | 'ok' | 'error' | 'nokey'
  const [newType,    setNewType]    = useState('')
  const [addingType, setAddingType] = useState(false)

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const regions = (countriesRegions || COUNTRIES_REGIONS)[f.country] || []
  const allCountriesForm = Object.keys(countriesRegions || COUNTRIES_REGIONS)

  const addCountryForm = (name) => {
    setCountriesRegions?.((p) => ({ ...p, [name]: [] }))
    set('country', name); set('region', '')
  }
  const addRegionForm = (region) => {
    setCountriesRegions?.((p) => ({ ...p, [f.country]: [...(p[f.country] || []), region] }))
    set('region', region)
  }

  const fetchVivino = async () => {
    if (!f.name) return
    setLoadingV(true); setVivinoStatus('idle')
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      const res = await fetch(ESTIMATE_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${s.access_token}`,
        },
        body: JSON.stringify({ name: f.name, year: f.year || null }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const parsed = await res.json()
      if (parsed.rating && parsed.rating >= 1 && parsed.rating <= 5) {
        set('vivinoRating', parsed.rating.toFixed(1))
        setVivinoStatus('ok')
      } else {
        setVivinoStatus('error')
      }
    } catch (_) {
      setVivinoStatus('error')
    }
    setLoadingV(false)
    setTimeout(() => setVivinoStatus('idle'), 3000)
  }

  const handleSave = () => {
    if (!f.name.trim()) return
    onSave({ ...f, purchasePrice: parseFloat((f.purchasePrice + '').replace(',', '.')) || 0,
      marketPrice: parseFloat((f.marketPrice + '').replace(',', '.')) || null,
      vivinoRating: parseFloat((f.vivinoRating + '').replace(',', '.')) || null,
      year: parseInt(f.year) || null, personalRating: f.personalRating || 0,
      quantity: wine ? f.quantity : parseInt(f.quantity) || 0 })
  }

  const confirmNewType = () => {
    const t = newType.trim()
    if (!t || types.includes(t)) return
    setTypes((p) => [...p, t]); set('type', t); setNewType(''); setAddingType(false)
  }

  return (
    <>
      <ModalHeader title={wine ? 'Editar Vinho' : 'Novo Vinho'} onClose={onClose} />

      <div style={S.field}><label style={S.lbl}>Fotografia</label><PhotoUpload value={f.photo} onChange={(v) => set('photo', v)} /></div>

      <div style={S.field}>
        <label style={S.lbl}>Nome *</label>
        {!wine && allWines
          ? <WineNameAutocomplete
              value={f.name}
              onChange={(v) => set('name', v)}
              allWines={allWines}
              currentYear={f.year}
              onExactMatch={onExactMatch}
              onPartialMatch={(w) => setF((p) => ({ ...p, name: w.name, type: w.type, country: w.country, region: w.region, year: '', purchasePrice: '', personalRating: 0, vivinoRating: '', notes: '' }))}
            />
          : <input style={S.inp} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Quinta da Gaivosa" />
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', columnGap: 12, rowGap: 14, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>Tipo</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <select style={{ ...S.inp, cursor: 'pointer', flex: 1 }} value={f.type} onChange={(e) => set('type', e.target.value)}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
            {!addingType
              ? <button onClick={() => setAddingType(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '0 10px', fontSize: 18 }}>+</button>
              : <div style={{ display: 'flex', gap: 4 }}>
                  <input style={{ ...S.inp, width: 84, padding: 8 }} value={newType} onChange={(e) => setNewType(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmNewType()} placeholder="Tipo" autoFocus />
                  <button onClick={confirmNewType} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 6, color: '#c8963e', cursor: 'pointer', padding: '0 8px' }}><Check size={14} /></button>
                </div>}
          </div>
        </div>
        <div>
          <label style={S.lbl}>Ano</label>
          <input style={S.inp} type="number" value={f.year} onChange={(e) => set('year', e.target.value)} min={1900} max={2100} />
        </div>
        <div>
          <label style={S.lbl}>País</label>
          <FilterSelect
            fill
            placeholder="Seleccionar país"
            value={f.country}
            onChange={(v) => { set('country', v); set('region', '') }}
            options={allCountriesForm}
            onAdd={addCountryForm}
          />
        </div>
        <div>
          <label style={S.lbl}>Região</label>
          <FilterSelect
            fill
            placeholder={regions.length ? 'Seleccionar região' : 'Livre'}
            value={f.region}
            onChange={(v) => set('region', v)}
            options={regions}
            onAdd={addRegionForm}
          />
        </div>
        <div>
          <label style={S.lbl}>Preço de Compra (€)</label>
          <input style={S.inp} value={f.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)} placeholder="0,00" />
        </div>
        <div>
          <label style={S.lbl}>Preço de Mercado (€)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...S.inp, flex: 1 }} value={f.marketPrice} onChange={(e) => set('marketPrice', e.target.value)} placeholder="0,00" />
            {f.name && (
              <a
                href={`https://www.wine-searcher.com/find/${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Wine-Searcher`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#6a6058', textDecoration: 'none', transition: 'all 0.15s', minWidth: 36 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8dece' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6a6058' }}
              >
                <Search size={13} />
              </a>
            )}
          </div>
        </div>
        {!wine && <div><label style={S.lbl}>Quantidade Inicial</label><input style={S.inp} type="number" value={f.quantity} onChange={(e) => set('quantity', e.target.value)} min={0} /></div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>Castas</label>
          <input style={S.inp} value={f.castas} onChange={(e) => set('castas', e.target.value)} placeholder="Touriga Nacional, Aragonez…" />
        </div>
        <div>
          <label style={S.lbl}>Teor Alcoólico (%)</label>
          <input style={S.inp} type="number" step="0.1" min="0" max="25" value={f.alcoholContent} onChange={(e) => set('alcoholContent', e.target.value)} placeholder="13.5" />
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0 16px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={S.lbl}>Classificação Pessoal</label>
          <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}><Stars value={f.personalRating} onChange={(v) => set('personalRating', v)} size={22} /><span style={{ fontSize: 13, color: '#e8dece' }}>{f.personalRating || '—'}</span></div>
        </div>
        <div>
          <label style={S.lbl}>Rating Vivino</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...S.inp, flex: 1 }} value={f.vivinoRating} onChange={(e) => set('vivinoRating', e.target.value)} placeholder="0.0" />
            {f.name && (
              <a
                href={`https://www.vivino.com/search/wines?q=${encodeURIComponent([f.name, f.year].filter(Boolean).join(' '))}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Pesquisar "${f.name}${f.year ? ` ${f.year}` : ''}" no Vivino`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#6a6058', textDecoration: 'none', transition: 'all 0.15s', minWidth: 36 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e8dece' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6a6058' }}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={S.field}>
        <label style={S.lbl}>Notas</label>
        <textarea style={{ ...S.inp, minHeight: 64, resize: 'vertical' }} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Notas de prova, potencial de guarda…" />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold"  onClick={handleSave}><Check size={14} />{wine ? 'Guardar' : 'Adicionar Vinho'}</Btn>
      </div>
    </>
  )
}

// ─── ENTRY FORM ───────────────────────────────────────────────────────────────
function EntryForm({ wine, entry, suppliers, setSuppliers, entries, onSave, onClose }) {
  const [f, setF] = useState(entry
    ? { date: entry.date, quantity: entry.quantity, supplier: entry.supplier || '', price: fmtNum(entry.price) }
    : { date: new Date().toISOString().slice(0, 10), quantity: 1, supplier: suppliers?.[0] ?? SUPPLIERS[0], price: fmtNum(wine?.purchasePrice) })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const list = suppliers ?? SUPPLIERS
  return (
    <>
      <ModalHeader title={entry ? "Editar Entrada" : "Registar Entrada"} subtitle={`${wine.name} · ${wine.year}`} onClose={onClose} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div style={{ width: 80, flexShrink: 0 }}><label style={S.lbl}>Quantidade</label><input style={S.inp} type="number" min={1} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} /></div>
      </div>
      <div style={S.field}>
        <label style={S.lbl}>Fornecedor</label>
        <FilterSelect
          placeholder="Seleccionar fornecedor"
          value={f.supplier}
          onChange={(v) => set('supplier', v)}
          options={list}
          onAdd={async (v) => {
              await supabase.from('videiras_suppliers').insert({ name: v })
              setSuppliers?.((p) => [...p, v].sort((a, b) => a.localeCompare(b, 'pt')))
              set('supplier', v)
            }}
          onRemove={async (v) => {
            const hasMovements = (entries || []).some(e => e.supplier === v)
            if (hasMovements) { alert(`"${v}" tem entradas associadas e não pode ser eliminado.`); return }
            await supabase.from('videiras_suppliers').delete().eq('name', v)
            setSuppliers?.((p) => p.filter(s => s !== v))
            set('supplier', list.find(s => s !== v) || '')
          }}
        />
      </div>
      <div style={S.field}><label style={S.lbl}>Preço por Garrafa (€)</label><input style={S.inp} value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="0,00" /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={() => { if (f.quantity >= 1) { if (entry || window.confirm(`Registar entrada de ${f.quantity} ${parseInt(f.quantity) === 1 ? 'garrafa' : 'garrafas'} de "${wine.name}"?`)) onSave({ ...f, quantity: parseInt(f.quantity), price: parseFloat((f.price + '').replace(',', '.')) || 0 }) } }}><LogIn size={14} />{entry ? 'Guardar' : 'Registar Entrada'}</Btn>
      </div>
    </>
  )
}

// ─── CONSUMPTION FORM ─────────────────────────────────────────────────────────
function ConsumptionForm({ wine, consumption, onSave, onClose }) {
  const [f, setF] = useState(consumption
    ? { date: consumption.date, quantity: consumption.quantity, rating: consumption.rating || 0, notes: consumption.notes || '' }
    : { date: new Date().toISOString().slice(0, 10), quantity: 1, rating: wine?.personalRating || 0, notes: '' })
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  // When editing, the original quantity is already deducted from stock — add it back for the max
  const maxQty = consumption ? wine.quantity + consumption.quantity : wine.quantity
  return (
    <>
      <ModalHeader title={consumption ? "Editar Consumo" : "Registar Consumo"} subtitle={`${wine.name} · ${wine.year} · ${maxQty} disponíveis`} onClose={onClose} />
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 1 }}><label style={S.lbl}>Data</label><input style={S.inp} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div style={{ width: 80, flexShrink: 0 }}><label style={S.lbl}>Qtd. (máx. {maxQty})</label><input style={S.inp} type="number" min={1} max={maxQty} value={f.quantity} onChange={(e) => set('quantity', e.target.value)} /></div>
      </div>
      <div style={S.field}><label style={S.lbl}>Classificação Pessoal</label><div style={{ padding: '8px 0' }}><Stars value={f.rating} onChange={(v) => set('rating', v)} size={22} /></div></div>
      <div style={S.field}><label style={S.lbl}>Observações</label><textarea style={{ ...S.inp, minHeight: 72, resize: 'vertical' }} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ocasião, maridagem, notas de prova…" /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="gold" onClick={() => { if (f.quantity >= 1 && f.quantity <= maxQty) { if (consumption || window.confirm(`Registar consumo de ${f.quantity} ${parseInt(f.quantity) === 1 ? 'garrafa' : 'garrafas'} de "${wine.name}"?`)) onSave({ ...f, quantity: parseInt(f.quantity) }) } }}><LogOut size={14} />{consumption ? 'Guardar' : 'Registar Consumo'}</Btn>
      </div>
    </>
  )
}

// ─── WINE DETAIL ──────────────────────────────────────────────────────────────
function WineDetail({ wine, entries, consumptions, onClose, onEntry, onConsumption, onEdit, onDelete, onDeleteEntry, onDeleteConsumption, onEditEntry, onEditConsumption, session }) {
  const [tab, setTab] = useState('info')
  const [lightbox, setLightbox] = useState(false)
  const [sharing, setSharing] = useState(false)
  const wEntries  = entries.filter((e) => e.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const wConsumed = consumptions.filter((c) => c.wineId === wine.id).sort((a, b) => b.date.localeCompare(a.date))
  const tabSt = (t) => ({ padding: '8px 14px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none',
    color: tab === t ? '#e8dece' : '#9a8f82', fontFamily: FONT, fontWeight: tab === t ? 500 : 400,
    borderBottom: tab === t ? '2px solid #c8963e' : '2px solid transparent', transition: 'color 0.15s' })
  return (
    <>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={() => setLightbox(false)} />}
      {sharing && <ShareModal wine={wine} session={session} onClose={() => setSharing(false)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0 }}>
          <WineThumb photo={wine.photo} type={wine.type} size={44} onClick={wine.photo ? () => setLightbox(true) : undefined} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 6 }}><Badge type={wine.type} /></div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{wine.name}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a8f82' }}>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
          <button onClick={() => setSharing(true)} title="Partilhar" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><Share2 size={14} /></button>
          <button onClick={onEdit}   style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><Edit2 size={14} /></button>
          <button onClick={onDelete} style={{ background: 'rgba(192,48,74,0.1)',    border: 'none', borderRadius: 6, color: '#e87080', cursor: 'pointer', padding: '6px 8px' }}><Trash2 size={14} /></button>
          <button onClick={onClose}  style={{ background: 'none', border: 'none', color: '#9a8f82', cursor: 'pointer', padding: '6px 8px' }}><X size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {[{ l: 'Em Adega', v: <span style={{ fontSize: 22, fontWeight: 300, color: wine.quantity > 0 ? '#e8dece' : '#e87080', fontFamily: FONT }}>{wine.quantity}</span> },
          { l: 'Preço/Garrafa', v: <span style={{ fontSize: 18, fontWeight: 300, color: '#e8dece', fontFamily: FONT }}>{fmt(wine.purchasePrice)}</span> },
          { l: 'Valor Total', v: <span style={{ fontSize: 18, fontWeight: 300, color: '#c8963e', fontFamily: FONT }}>{fmt(totalV(wine))}</span> }
        ].map(({ l, v }) => (<div key={l} style={S.stat}><div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</div>{v}</div>))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[{ l: 'Vivino', v: wine.vivinoRating }, { l: 'Classificação Pessoal', v: wine.personalRating }].map(({ l, v }) => (
          <div key={l} style={S.stat}><div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Stars value={v} size={15} /><span style={{ fontSize: 13, color: '#e8dece' }}>{v || '—'}</span></div>
          </div>
        ))}
      </div>

      {wine.notes && <div style={{ background: 'rgba(200,150,62,0.07)', border: '1px solid rgba(200,150,62,0.15)', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#c8a050', lineHeight: 1.55 }}>{wine.notes}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Btn variant="gold"  onClick={onEntry}       style={{ flex: 1, justifyContent: 'center' }}><LogIn  size={13} />Entrada</Btn>
        <Btn variant="ghost" onClick={onConsumption} style={{ flex: 1, justifyContent: 'center' }}><LogOut size={13} />Consumo</Btn>
      </div>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
        <button style={tabSt('info')}    onClick={() => setTab('info')}>Informação</button>
        <button style={tabSt('entries')} onClick={() => setTab('entries')}>Entradas ({wEntries.length})</button>
        <button style={tabSt('consum')}  onClick={() => setTab('consum')}>Consumos ({wConsumed.length})</button>
      </div>

      {tab === 'info' && (
        <div style={{ fontSize: 13, color: '#9a8f82' }}>
          {[['Tipo', wine.type], ['País', wine.country], ['Região', wine.region || '—'], ['Ano', wine.year || '—'],
            ...(wine.castas ? [['Castas', wine.castas]] : []),
            ...(wine.alcoholContent !== '' && wine.alcoholContent != null ? [['Teor Alcoólico', `${wine.alcoholContent}%`]] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span>{k}</span><span style={{ color: '#e8dece' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'entries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wEntries.length === 0 ? <p style={{ color: '#4a453f', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sem entradas registadas.</p>
            : wEntries.map((e) => (
              <div key={e.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{e.quantity} {e.quantity === 1 ? 'garrafa' : 'garrafas'} · {e.supplier}</div>
                  <div style={{ fontSize: 11, color: '#9a8f82', marginTop: 2 }}>{e.date}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#c8963e' }}>{fmt(e.price)}/un</div>
                    <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price * e.quantity)} total</div>
                  </div>
                  {onEditEntry && (
                    <button onClick={() => onEditEntry(e)}
                      style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.color = '#c8963e'; ev.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.color = '#6a5f52'; ev.currentTarget.style.background = 'none' }}>
                      <Edit2 size={13} />
                    </button>
                  )}
                  {onDeleteEntry && (
                    <button onClick={() => { if (window.confirm(`Cancelar esta entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será revertido.`)) onDeleteEntry(e) }}
                      style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.color = '#e87080'; ev.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.color = '#6a5f52'; ev.currentTarget.style.background = 'none' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
      {tab === 'consum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {wConsumed.length === 0 ? <p style={{ color: '#4a453f', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sem consumos registados.</p>
            : wConsumed.map((c) => (
              <div key={c.id} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: '#e8dece', fontWeight: 500 }}>{c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Stars value={c.rating} size={12} />
                    <span style={{ fontSize: 11, color: '#9a8f82' }}>{c.date}</span>
                    {onEditConsumption && (
                      <button onClick={() => onEditConsumption(c)}
                        style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#c8963e'; e.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                        <Edit2 size={13} />
                      </button>
                    )}
                    {onDeleteConsumption && (
                      <button onClick={() => { if (window.confirm(`Cancelar este consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'}? O stock será reposto.`)) onDeleteConsumption(c) }}
                        style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                {c.notes && <div style={{ fontSize: 12, color: '#9a8f82', marginTop: 4 }}>{c.notes}</div>}
              </div>
            ))}
        </div>
      )}
    </>
  )
}

// ─── PIE CHART (SVG, sem dependências) ───────────────────────────────────────
const PIE_PALETTE = ['#c8963e','#78b0d8','#68c880','#e87080','#c078cc','#e88050','#d4a838','#9a8f82','#e878a8','#68a8d8']

function PieChart({ data, total }) {
  if (!data.length || total === 0) return null
  const cx = 90, cy = 90, R = 72, r = 46
  let ang = -Math.PI / 2

  // single-slice: arc path breaks at 360°, use circles instead
  if (data.length === 1) {
    const color = PIE_PALETTE[0]
    return (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 180 180" style={{ width: 150, flexShrink: 0 }}>
          <circle cx={cx} cy={cy} r={R} fill={color} opacity={0.82} />
          <circle cx={cx} cy={cy} r={r - 2} fill="#1e1b16" />
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#e8dece" fontSize="20" fontWeight="300" fontFamily="Outfit,sans-serif">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#9a8f82" fontSize="8.5" fontFamily="Outfit,sans-serif" letterSpacing="0.1">REF.</text>
        </svg>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0, opacity: 0.82 }} />
            <span style={{ fontSize: 12, color: '#e8dece', flex: 1 }}>{data[0].label}</span>
            <span style={{ fontSize: 11, color: '#9a8f82' }}>{data[0].value}</span>
            <span style={{ fontSize: 10, color: '#4a453f', minWidth: 28, textAlign: 'right' }}>100%</span>
          </div>
        </div>
      </div>
    )
  }

  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI
    const end = ang + sweep
    const cos1 = Math.cos(ang), sin1 = Math.sin(ang)
    const cos2 = Math.cos(end), sin2 = Math.sin(end)
    const large = sweep > Math.PI ? 1 : 0
    const path = [
      `M ${cx + r * cos1} ${cy + r * sin1}`,
      `L ${cx + R * cos1} ${cy + R * sin1}`,
      `A ${R} ${R} 0 ${large} 1 ${cx + R * cos2} ${cy + R * sin2}`,
      `L ${cx + r * cos2} ${cy + r * sin2}`,
      `A ${r} ${r} 0 ${large} 0 ${cx + r * cos1} ${cy + r * sin1} Z`,
    ].join(' ')
    ang = end
    return { ...d, path, color: PIE_PALETTE[i % PIE_PALETTE.length], pct: Math.round((d.value / total) * 100) }
  })
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 180 180" style={{ width: 150, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.82}>
            <title>{s.label}: {s.value} ({s.pct}%)</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={r - 2} fill="#1e1b16" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#e8dece" fontSize="20" fontWeight="300" fontFamily="Outfit,sans-serif">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#9a8f82" fontSize="8.5" fontFamily="Outfit,sans-serif" letterSpacing="0.1">REF.</text>
      </svg>
      <div style={{ flex: 1, minWidth: 100 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0, opacity: 0.82 }} />
            <span style={{ fontSize: 12, color: '#e8dece', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 11, color: '#9a8f82' }}>{s.value}</span>
            <span style={{ fontSize: 10, color: '#4a453f', minWidth: 28, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FILTER SELECT WITH INLINE ADD ────────────────────────────────────────────
function FilterSelect({ placeholder, value, onChange, options, onAdd, onRemove, fill }) {
  const [adding, setAdding] = useState(false)
  const [newVal, setNewVal] = useState('')
  const confirmAdd = () => {
    const v = newVal.trim()
    if (v && !options.includes(v)) onAdd(v)
    setNewVal(''); setAdding(false)
  }
  const handleRemove = () => {
    if (!value) return
    if (!window.confirm(`Eliminar "${value}" da lista?`)) return
    onRemove(value)
    onChange('')
  }
  if (adding) return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <input
        style={{ ...S.inp, width: 110, padding: '6px 8px', fontSize: 12 }}
        value={newVal} onChange={(e) => setNewVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setAdding(false) }}
        placeholder="Novo…" autoFocus
      />
      <button onClick={confirmAdd} style={{ background: 'rgba(200,150,62,0.2)', border: 'none', borderRadius: 5, color: '#c8963e', cursor: 'pointer', padding: '5px 7px', display: 'flex' }}><Check size={12} /></button>
      <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: '5px 4px', display: 'flex' }}><X size={12} /></button>
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: fill ? 6 : 3, alignItems: fill ? undefined : 'center', width: fill ? '100%' : undefined }}>
      <select style={{ ...S.inp, width: fill ? undefined : 'auto', flex: fill ? 1 : undefined, minWidth: fill ? 0 : undefined, fontSize: fill ? 14 : 12, cursor: 'pointer', paddingRight: 24 }} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <button onClick={() => setAdding(true)} title={`Adicionar a ${placeholder}`}
        style={fill
          ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#9a8f82', cursor: 'pointer', padding: '0 10px', fontSize: 18 }
          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, color: '#6a6058', cursor: 'pointer', padding: '4px 7px', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center' }}>+</button>
      {onRemove && value && (
        <button onClick={handleRemove} title={`Eliminar "${value}"`}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 5, color: '#3a3530', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', transition: 'color 0.15s, border-color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.borderColor = 'rgba(232,112,128,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
          <Trash2 size={11} />
        </button>
      )}
    </div>
  )
}

// ─── WINE LIST VIEW ───────────────────────────────────────────────────────────
function WineListRow({ wine, onClick, isMobile }) {
  const [lightbox, setLightbox] = React.useState(false)
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '10px 14px' : '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s', opacity: wine.quantity === 0 ? 0.45 : 1 }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      {lightbox && <PhotoLightbox src={wine.photo} onClose={(e) => { setLightbox(false) }} />}
      <WineThumb photo={wine.photo} type={wine.type} size={isMobile ? 22 : 26} onClick={wine.photo ? (e) => { e.stopPropagation(); setLightbox(true) } : undefined} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wine.name}</div>
        <div style={{ fontSize: 11, color: '#9a8f82', marginTop: 1 }}>
          {isMobile
            ? <>{[wine.region, wine.country].filter(Boolean).join(', ')}{wine.year ? ` · ${wine.year}` : ''}</>
            : [wine.region, wine.country].filter(Boolean).join(', ')}
        </div>
      </div>
      {!isMobile && <div style={{ width: 86, flexShrink: 0 }}><Badge type={wine.type} /></div>}
      {!isMobile && <div style={{ width: 52, flexShrink: 0, textAlign: 'center', fontSize: 13, color: '#9a8f82' }}>{wine.alcoholContent ? `${wine.alcoholContent}%` : '—'}</div>}
      {!isMobile && <div style={{ width: 44, flexShrink: 0, textAlign: 'center', fontSize: 13, color: '#9a8f82' }}>{wine.year || '—'}</div>}
      {!isMobile && <div style={{ width: 76, flexShrink: 0 }}><Stars value={wine.personalRating} size={12} /></div>}
      <div style={{ width: isMobile ? 32 : 44, flexShrink: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: wine.quantity > 0 ? '#68c880' : '#e87080' }}>{wine.quantity}</span>
      </div>
      {!isMobile && <div style={{ width: 72, flexShrink: 0, textAlign: 'right', fontSize: 13, color: '#c8963e' }}>{fmt(wine.purchasePrice)}</div>}
      {isMobile && <div style={{ flexShrink: 0, textAlign: 'right', fontSize: 12, color: '#c8963e', minWidth: 56 }}>{fmt(wine.purchasePrice)}</div>}
    </div>
  )
}

function WineListView({ wines, onWineClick, isMobile }) {
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState(1)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d)
    else { setSortKey(key); setSortDir(1) }
  }

  const sorted = useMemo(() => {
    return [...wines].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string') return av.localeCompare(bv, 'pt') * sortDir
      return (av - bv) * sortDir
    })
  }, [wines, sortKey, sortDir])

  const ColHead = ({ label, col, width, align = 'left', style = {} }) => {
    const active = sortKey === col
    const arrow  = active ? (sortDir === 1 ? ' ↑' : ' ↓') : ''
    return (
      <div onClick={() => handleSort(col)}
        style={{ width, flexShrink: 0, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          textAlign: align, cursor: 'pointer', userSelect: 'none', fontWeight: active ? 700 : 600,
          color: active ? '#c8963e' : '#3a3530', transition: 'color 0.15s', ...style }}>
        {label}{arrow}
      </div>
    )
  }

  return (
    <div style={{ background: '#1e1b16', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: isMobile ? '7px 14px' : '7px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#161310' }}>
        <div style={{ width: isMobile ? 22 : 26, flexShrink: 0 }} />
        <ColHead label="Vinho"  col="name"           width={undefined} style={{ flex: 1 }} />
        {!isMobile && <ColHead label="Tipo"   col="type"           width={86} />}
        {!isMobile && <ColHead label="Álcool" col="alcoholContent" width={52} align="center" />}
        {!isMobile && <ColHead label="Ano"    col="year"           width={44} align="center" />}
        {!isMobile && <ColHead label="Rating" col="personalRating" width={76} />}
        <ColHead label="Qtd."  col="quantity"       width={isMobile ? 32 : 44} align="center" />
        <ColHead label="Preço" col="purchasePrice"  width={isMobile ? 56 : 72} align="right" />
      </div>
      {sorted.length === 0
        ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#4a453f' }}><Wine size={32} style={{ marginBottom: 10, opacity: 0.2 }} /><p style={{ fontSize: 13 }}>Nenhum vinho encontrado.</p></div>
        : sorted.map((w) => <WineListRow key={w.id} wine={w} onClick={() => onWineClick(w)} isMobile={isMobile} />)}
    </div>
  )
}

// ─── WINE GRID VIEW ───────────────────────────────────────────────────────────
function WineGridView({ wines, onWineClick }) {
  if (wines.length === 0) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#4a453f' }}><Wine size={40} style={{ marginBottom: 12, opacity: 0.25 }} /><p style={{ fontSize: 14 }}>Nenhum vinho encontrado.</p></div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
      {wines.map((w) => {
        const c = getTC(w.type)
        return (
          <div key={w.id} onClick={() => onWineClick(w)}
            style={{ background: '#1e1b16', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s', opacity: w.quantity === 0 ? 0.45 : 1 }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(200,150,62,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
            {w.photo ? <img src={w.photo} alt={w.name} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
              : <div style={{ height: 4, background: c.fg, opacity: 0.6 }} />}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Badge type={w.type} />
                <span style={{ fontSize: 12, fontWeight: 500, color: w.quantity > 0 ? '#68c880' : '#e87080' }}>{w.quantity} 🍾</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 400, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', marginBottom: 2, lineHeight: 1.3 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: '#9a8f82', marginBottom: 10 }}>{[w.region, w.country].filter(Boolean).join(', ')}{w.year ? ` · ${w.year}` : ''}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stars value={w.personalRating} size={12} />
                <span style={{ fontSize: 13, color: '#c8963e' }}>{fmt(w.purchasePrice)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}



// ─── CHANGE PASSWORD SCREEN ───────────────────────────────────────────────────
function ChangePasswordScreen({ profile, onDone }) {
  const [pwd,     setPwd]     = useState('')
  const [pwd2,    setPwd2]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pwd.length < 6) return setError('A password deve ter pelo menos 6 caracteres.')
    if (pwd !== pwd2) return setError('As passwords não coincidem.')
    setLoading(true); setError('')
    const { error: pwErr } = await supabase.auth.updateUser({ password: pwd })
    if (pwErr) { setError(pwErr.message); setLoading(false); return }
    // Clear must_change_password flag
    await supabase.from('videiras_profiles').update({ must_change_password: false }).eq('id', profile.id)
    onDone()
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <KeyRound size={20} color="#c8963e" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 300, color: '#e8dece', marginBottom: 6 }}>Define a tua password</div>
          <div style={{ fontSize: 13, color: '#4a453f' }}>Por segurança, define uma nova password para a tua conta.</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Nova password</div>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Confirmar password</div>
            <input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="Repetir password" />
          </div>
          {error && <div style={{ fontSize: 12, color: '#e87080', padding: '8px 12px', background: 'rgba(232,112,128,0.08)', borderRadius: 6, border: '1px solid rgba(232,112,128,0.2)' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ marginTop: 8, background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 6, padding: '12px', fontSize: 13, fontWeight: 500, fontFamily: FONT, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'A guardar…' : 'Guardar password'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou password incorrectos.')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Wine size={22} color="#c8963e" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 200, color: '#e8dece', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Videiras</div>
          <div style={{ fontSize: 10, color: '#3a3530', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>Cellar Collection</div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="o.teu@email.pt" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ ...S.inp, fontSize: 14 }} placeholder="••••••" />
          </div>
          {error && <div style={{ fontSize: 12, color: '#e87080', padding: '8px 12px', background: 'rgba(232,112,128,0.08)', borderRadius: 6, border: '1px solid rgba(232,112,128,0.2)' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ marginTop: 8, background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 6, padding: '12px', fontSize: 13, fontWeight: 500, fontFamily: FONT, letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ session }) {
  const [users,       setUsers]       = useState([])
  const [loadingU,    setLoadingU]    = useState(true)
  const [adminTab,    setAdminTab]    = useState('utilizadores')
  const [uTab,        setUTab]        = useState('criar')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName,  setInviteName]  = useState('')
  const [inviting,    setInviting]    = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createName,  setCreateName]  = useState('')
  const [createPwd,   setCreatePwd]   = useState('')
  const [creating,    setCreating]    = useState(false)
  const [msg,         setMsg]         = useState('')
  const [backingUp,    setBackingUp]    = useState(false)
  const [quotes,       setQuotes]       = useState([])
  const [quotesLoaded, setQuotesLoaded] = useState(false)
  const [qTab,         setQTab]         = useState('list')
  const [newQuote,     setNewQuote]     = useState({ quote: '', author: '', category: 'geral' })
  const [savingQ,      setSavingQ]      = useState(false)
  const [importing,    setImporting]    = useState(false)
  const [importMsg,    setImportMsg]    = useState('')
  const [importPreview, setImportPreview] = useState(null)


  const adminFetch = async (action, method = 'GET', body = null) => {
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) return { error: 'Sessão expirada — faz login novamente.' }
      const opts = {
        method,
        headers: { 'Authorization': `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
      }
      if (body) opts.body = JSON.stringify(body)
      const r = await fetch(`${EDGE_FN_URL}?action=${action}`, opts)
      return r.json()
    } catch (err) {
      console.error('[adminFetch]', action, err)
      return { error: err.message || 'Erro de rede' }
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (createPwd.length < 6) return setMsg('Erro: A password deve ter pelo menos 6 caracteres.')
    setCreating(true); setMsg('')
    const data = await adminFetch('create', 'POST', { email: createEmail, name: createName, password: createPwd })
    if (data.ok) { setMsg(`Utilizador ${createEmail} criado!`); setCreateEmail(''); setCreateName(''); setCreatePwd(''); loadUsers() }
    else setMsg(`Erro: ${data.error}`)
    setCreating(false)
  }

  const loadUsers = async () => {
    setLoadingU(true)
    try {
      const data = await adminFetch('list')
      if (data.users) setUsers(data.users)
      else setMsg(`Erro ao carregar utilizadores: ${data.error ?? 'resposta inesperada'}`)
    } finally {
      setLoadingU(false)
    }
  }

  useEffect(() => { loadUsers(); loadQuotes() }, [])

  const loadQuotes = async () => {
    const { data } = await supabase.from('videiras_quotes').select('*').order('created_at', { ascending: false })
    if (data) { setQuotes(data); setQuotesLoaded(true) }
  }

  const saveQuote = async () => {
    if (!newQuote.quote.trim()) return
    setSavingQ(true)
    const { data } = await supabase.from('videiras_quotes').insert({ ...newQuote, active: true }).select().single()
    if (data) { setQuotes(p => [data, ...p]); setNewQuote({ quote: '', author: '', category: 'geral' }) }
    setSavingQ(false)
  }

  const toggleQuote = async (q) => {
    await supabase.from('videiras_quotes').update({ active: !q.active }).eq('id', q.id)
    setQuotes(p => p.map(x => x.id === q.id ? { ...x, active: !x.active } : x))
  }

  const deleteQuote = async (q) => {
    if (!window.confirm('Eliminar esta frase?')) return
    await supabase.from('videiras_quotes').delete().eq('id', q.id)
    setQuotes(p => p.filter(x => x.id !== q.id))
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true); setMsg('')
    try {
      const data = await adminFetch('invite', 'POST', { email: inviteEmail, name: inviteName })
      if (data.ok) { setMsg(`Convite enviado para ${inviteEmail}!`); setInviteEmail(''); setInviteName(''); loadUsers() }
      else setMsg(`Erro: ${data.error}`)
    } finally {
      setInviting(false)
    }
  }

  const toggleActive = async (u) => {
    await adminFetch('set-active', 'POST', { userId: u.id, active: !u.active })
    loadUsers()
  }

  const toggleRole = async (u) => {
    await adminFetch('set-role', 'POST', { userId: u.id, role: u.role === 'admin' ? 'user' : 'admin' })
    loadUsers()
  }

  const deleteUser = async (u) => {
    if (!window.confirm(`Eliminar permanentemente "${u.name || u.email}"?\n\nTodos os dados deste utilizador (vinhos, entradas, consumos) serão apagados. Esta acção é irreversível.`)) return
    const data = await adminFetch('delete-user', 'POST', { userId: u.id })
    if (data.ok) { setMsg(`Utilizador ${u.email} eliminado.`); loadUsers() }
    else setMsg(`Erro: ${data.error}`)
  }

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.version || !Array.isArray(data.wines)) {
          setImportMsg('Erro: ficheiro inválido ou não é um backup Videiras.')
          setImportPreview(null)
          return
        }
        setImportPreview(data)
        setImportMsg('')
      } catch {
        setImportMsg('Erro: não foi possível ler o ficheiro JSON.')
        setImportPreview(null)
      }
    }
    reader.readAsText(file)
    // reset input so same file can be selected again
    e.target.value = ''
  }

  const handleImport = async () => {
    if (!importPreview) return
    setImporting(true); setImportMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user.id

      // Wines — upsert by id, replace user_id with current user
      if (importPreview.wines?.length) {
        const wines = importPreview.wines.map(w => ({ ...w, user_id: uid }))
        const { error } = await supabase.from('videiras_wines').upsert(wines, { onConflict: 'id' })
        if (error) throw new Error('Vinhos: ' + error.message)
      }

      // Consumptions — upsert by id
      if (importPreview.consumptions?.length) {
        const cons = importPreview.consumptions.map(c => ({ ...c, user_id: uid }))
        const { error } = await supabase.from('videiras_consumptions').upsert(cons, { onConflict: 'id' })
        if (error) throw new Error('Consumos: ' + error.message)
      }

      // Entries — upsert by id
      if (importPreview.entries?.length) {
        const entries = importPreview.entries.map(e => ({ ...e, user_id: uid }))
        const { error } = await supabase.from('videiras_entries').upsert(entries, { onConflict: 'id' })
        if (error) throw new Error('Entradas: ' + error.message)
      }

      // Suppliers — upsert by name (ignore id)
      if (importPreview.suppliers?.length) {
        const sups = importPreview.suppliers.map(s => ({ name: s.name, user_id: uid }))
        const { error } = await supabase.from('videiras_suppliers').upsert(sups, { onConflict: 'user_id,name', ignoreDuplicates: true })
        if (error) throw new Error('Fornecedores: ' + error.message)
      }

      const total = (importPreview.wines?.length||0) + (importPreview.consumptions?.length||0) + (importPreview.entries?.length||0) + (importPreview.suppliers?.length||0)
      setImportMsg(`✓ Importação concluída — ${total} registos processados. Faz refresh para ver as alterações.`)
      setImportPreview(null)
    } catch (err) {
      setImportMsg('Erro: ' + err.message)
    }
    setImporting(false)
  }

  const handleBackup = async () => {
    setBackingUp(true)
    try {
      const [wRes, cRes, eRes, sRes] = await Promise.all([
        supabase.from('videiras_wines').select('*').order('name'),
        supabase.from('videiras_consumptions').select('*').order('date', { ascending: false }),
        supabase.from('videiras_entries').select('*').order('date', { ascending: false }),
        supabase.from('videiras_suppliers').select('*').order('name'),
      ])
      const backup = {
        version: 1,
        exported_at: new Date().toISOString(),
        wines:        wRes.data || [],
        consumptions: cRes.data || [],
        entries:      eRes.data || [],
        suppliers:    sRes.data || [],
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `videiras-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Erro ao exportar backup: ' + err.message)
    }
    setBackingUp(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 40 }}>

      {/* Top-level admin tabs */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 24, background: '#0d0b09', borderRadius: 7, padding: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
        {[['utilizadores', 'Utilizadores'], ['segurança', 'Segurança'], ['frases', 'Frases']].map(([t, label]) => (
          <button key={t} onClick={() => setAdminTab(t)} style={{
            flex: 1, padding: '8px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: FONT,
            fontSize: 11, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s',
            background: adminTab === t ? '#1e1b16' : 'transparent',
            color: adminTab === t ? '#c8963e' : '#4a453f',
          }}>{label}</button>
        ))}
      </div>

      {/* ── UTILIZADORES ── */}
      {adminTab === 'utilizadores' && (
        <div style={{ ...S.stat, padding: 24 }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: 1, marginBottom: 20, background: '#0d0b09', borderRadius: 6, padding: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
            {[['criar', 'Criar'], ['convidar', 'Convidar'], ['lista', `Lista (${users.length})`]].map(([t, label]) => (
              <button key={t} onClick={() => { setUTab(t); setMsg('') }} style={{
                flex: 1, padding: '6px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: FONT,
                fontSize: 11, fontWeight: 400, letterSpacing: '0.04em', transition: 'all 0.15s',
                background: uTab === t ? 'rgba(200,150,62,0.12)' : 'transparent',
                color: uTab === t ? '#c8963e' : '#4a453f',
              }}>{label}</button>
            ))}
          </div>

          {uTab === 'criar' && (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Nome</div>
                  <input value={createName} onChange={e => setCreateName(e.target.value)}
                    style={{ ...S.inp, fontSize: 13 }} placeholder="Nome do utilizador" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Email *</div>
                  <input type="email" required value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                    style={{ ...S.inp, fontSize: 13 }} placeholder="email@exemplo.pt" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Password temporária *</div>
                <input type="password" required value={createPwd} onChange={e => setCreatePwd(e.target.value)}
                  style={{ ...S.inp, fontSize: 13 }} placeholder="Mínimo 6 caracteres" />
                <div style={{ fontSize: 11, color: '#3a3530', marginTop: 5 }}>O utilizador será obrigado a alterar no primeiro login.</div>
              </div>
              {msg && <div style={{ fontSize: 12, color: msg.startsWith('Erro') ? '#e87080' : '#68c880', padding: '8px 12px', background: msg.startsWith('Erro') ? 'rgba(232,112,128,0.08)' : 'rgba(104,200,128,0.08)', borderRadius: 5 }}>{msg}</div>}
              <button type="submit" disabled={creating}
                style={{ alignSelf: 'flex-start', background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 5, padding: '9px 20px', fontSize: 12, fontWeight: 500, fontFamily: FONT, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {creating ? 'A criar…' : <><UserCheck size={13} /> Criar utilizador</>}
              </button>
            </form>
          )}

          {uTab === 'convidar' && (
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Nome</div>
                  <input value={inviteName} onChange={e => setInviteName(e.target.value)}
                    style={{ ...S.inp, fontSize: 13 }} placeholder="Nome do utilizador" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Email *</div>
                  <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    style={{ ...S.inp, fontSize: 13 }} placeholder="email@exemplo.pt" />
                </div>
              </div>
              {msg && <div style={{ fontSize: 12, color: msg.startsWith('Erro') ? '#e87080' : '#68c880', padding: '8px 12px', background: msg.startsWith('Erro') ? 'rgba(232,112,128,0.08)' : 'rgba(104,200,128,0.08)', borderRadius: 5 }}>{msg}</div>}
              <button type="submit" disabled={inviting}
                style={{ alignSelf: 'flex-start', background: 'none', color: '#c8963e', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 5, padding: '9px 20px', fontSize: 12, fontWeight: 400, fontFamily: FONT, cursor: inviting ? 'not-allowed' : 'pointer', opacity: inviting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {inviting ? 'A enviar…' : <><Plus size={13} /> Enviar convite</>}
              </button>
            </form>
          )}

          {uTab === 'lista' && (
            loadingU
              ? <div style={{ fontSize: 13, color: '#3a3530', padding: '20px 0', textAlign: 'center' }}>A carregar…</div>
              : users.map(u => {
                const isSelf = u.id === session?.user?.id
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: u.active ? '#e8dece' : '#3a3530', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {u.name || '—'}
                        {isSelf && <span style={{ fontSize: 9, background: 'rgba(200,150,62,0.15)', color: '#c8963e', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>TU</span>}
                        {u.role === 'admin' && <span style={{ fontSize: 9, background: 'rgba(104,200,128,0.12)', color: '#68c880', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>ADMIN</span>}
                        {!u.active && <span style={{ fontSize: 9, background: 'rgba(232,112,128,0.12)', color: '#e87080', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>INACTIVO</span>}
                        {u.must_change_password && <span style={{ fontSize: 9, background: 'rgba(200,150,62,0.12)', color: '#c8963e', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>1º LOGIN</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{u.email}</div>
                    </div>
                    {!isSelf && (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => toggleRole(u)} title={u.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                          style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: u.role === 'admin' ? '#68c880' : '#4a453f', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>
                          {u.role === 'admin' ? 'Admin ✓' : 'Admin'}
                        </button>
                        <button onClick={() => toggleActive(u)} title={u.active ? 'Desactivar' : 'Activar'}
                          style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: u.active ? '#e87080' : '#68c880', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>
                          {u.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => deleteUser(u)} title="Eliminar utilizador"
                          style={{ padding: '5px 8px', borderRadius: 4, border: '1px solid rgba(232,112,128,0.2)', background: 'none', color: '#e87080', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
          )}
        </div>
      )}

      {/* ── SEGURANÇA ── */}
      {adminTab === 'segurança' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Exportar + Importar */}
          <div style={{ ...S.stat, padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px 24px', alignItems: 'center' }}>
            {/* Exportar — descrição */}
            <div>
              <div style={{ fontSize: 13, color: '#e8dece', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Download size={14} color="#c8963e" /> Exportar backup
              </div>
              <div style={{ fontSize: 11, color: '#4a453f', lineHeight: 1.5 }}>
                Exporta todos os dados (vinhos, consumos, entradas, fornecedores) para um ficheiro JSON.
              </div>
            </div>
            {/* Exportar — botão */}
            <button onClick={handleBackup} disabled={backingUp} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 6,
              border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.08)',
              color: '#c8963e', cursor: backingUp ? 'not-allowed' : 'pointer',
              fontFamily: FONT, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
              opacity: backingUp ? 0.6 : 1, transition: 'all 0.15s',
            }}>
              <Download size={13} /> {backingUp ? 'A exportar…' : 'Exportar backup'}
            </button>

            {/* Separador */}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 -20px' }} />

            {/* Importar — descrição */}
            <div>
              <div style={{ fontSize: 13, color: '#e8dece', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={14} color="#c8963e" /> Importar backup
              </div>
              <div style={{ fontSize: 11, color: '#4a453f', lineHeight: 1.5 }}>
                Selecciona um ficheiro <code style={{ color: '#6a5f52', background: '#0d0b09', padding: '1px 5px', borderRadius: 3 }}>.json</code> exportado anteriormente.
                Os dados existentes são actualizados; os novos são adicionados. Nada é eliminado.
              </div>
            </div>
            {/* Importar — botão */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 6,
              border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.08)',
              color: '#c8963e', cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 500,
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              <FileText size={13} /> Importar backup
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>

            {/* Preview + mensagem — largura total */}
            {importPreview && (
              <div style={{ gridColumn: '1 / -1', padding: 14, background: '#0d0b09', borderRadius: 6, border: '1px solid rgba(200,150,62,0.2)' }}>
                <div style={{ fontSize: 11, color: '#c8963e', marginBottom: 10, fontWeight: 500 }}>
                  Backup de {importPreview.exported_at ? new Date(importPreview.exported_at).toLocaleString('pt-PT') : '—'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 14 }}>
                  {[
                    ['Vinhos',       importPreview.wines?.length       || 0],
                    ['Consumos',     importPreview.consumptions?.length || 0],
                    ['Entradas',     importPreview.entries?.length      || 0],
                    ['Fornecedores', importPreview.suppliers?.length    || 0],
                  ].map(([label, count]) => (
                    <div key={label} style={{ fontSize: 11, color: '#6a5f52' }}>
                      <span style={{ color: '#e8dece', fontWeight: 500 }}>{count}</span> {label.toLowerCase()}
                    </div>
                  ))}
                </div>
                <button onClick={handleImport} disabled={importing}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 6,
                    border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.1)',
                    color: '#c8963e', cursor: importing ? 'not-allowed' : 'pointer',
                    fontFamily: FONT, fontSize: 12, fontWeight: 500,
                    opacity: importing ? 0.6 : 1, transition: 'all 0.15s' }}>
                  <Download size={13} style={{ transform: 'rotate(180deg)' }} />
                  {importing ? 'A importar…' : 'Confirmar importação'}
                </button>
              </div>
            )}
            {importMsg && (
              <div style={{ gridColumn: '1 / -1', fontSize: 12,
                color: importMsg.startsWith('✓') ? '#68c880' : '#e87080',
                padding: '8px 12px', borderRadius: 5,
                background: importMsg.startsWith('✓') ? 'rgba(104,200,128,0.08)' : 'rgba(232,112,128,0.08)',
              }}>{importMsg}</div>
            )}
          </div>
        </div>
      )}

      {/* ── FRASES ── */}
      {adminTab === 'frases' && (
        <div style={{ ...S.stat, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Frases · {quotes.filter(q => q.active).length} activas
            </h3>
            <div style={{ display: 'flex', gap: 1, background: '#0d0b09', borderRadius: 6, padding: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
              {[['list','Lista'],['add','Nova frase']].map(([t,l]) => (
                <button key={t} onClick={() => setQTab(t)} style={{
                  padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  fontFamily: FONT, fontSize: 11,
                  background: qTab === t ? 'rgba(200,150,62,0.12)' : 'transparent',
                  color: qTab === t ? '#c8963e' : '#4a453f', transition: 'all 0.15s',
                }}>{l}</button>
              ))}
            </div>
          </div>

          {qTab === 'add' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea value={newQuote.quote} onChange={e => setNewQuote(p => ({...p, quote: e.target.value}))}
                placeholder="Escreve a frase aqui…"
                style={{ ...S.inp, minHeight: 80, resize: 'vertical', fontSize: 13 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={newQuote.author} onChange={e => setNewQuote(p => ({...p, author: e.target.value}))}
                  placeholder="Autor (opcional)" style={{ ...S.inp, fontSize: 12 }} />
                <select value={newQuote.category} onChange={e => setNewQuote(p => ({...p, category: e.target.value}))}
                  style={{ ...S.inp, fontSize: 12, cursor: 'pointer' }}>
                  {['geral','consumo','entrada','tinto','branco','rosé','espumante'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn variant="gold" onClick={saveQuote} disabled={savingQ || !newQuote.quote.trim()}>
                  {savingQ ? 'A guardar…' : 'Guardar frase'}
                </Btn>
              </div>
            </div>
          )}

          {qTab === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {!quotesLoaded && <p style={{ color: '#4a453f', fontSize: 12, textAlign: 'center' }}>A carregar…</p>}
              {quotesLoaded && quotes.length === 0 && <p style={{ color: '#4a453f', fontSize: 12, textAlign: 'center' }}>Nenhuma frase ainda.</p>}
              {quotes.map(q => (
                <div key={q.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 7, background: q.active ? 'rgba(255,255,255,0.02)' : 'transparent', border: '1px solid rgba(255,255,255,0.04)', opacity: q.active ? 1 : 0.45 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontSize: 12, color: '#e8dece', lineHeight: 1.5 }}>"{q.quote}"</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {q.author && <span style={{ fontSize: 11, color: '#6a5f52', fontStyle: 'italic' }}>— {q.author}</span>}
                      <span style={{ fontSize: 10, color: '#4a453f', background: '#0d0b09', padding: '1px 6px', borderRadius: 3 }}>{q.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => toggleQuote(q)} title={q.active ? 'Desactivar' : 'Activar'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 4,
                        color: q.active ? '#68c880' : '#4a453f', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>
                      {q.active ? '●' : '○'}
                    </button>
                    <button onClick={() => deleteQuote(q)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 4, color: '#3a3530', transition: 'all 0.15s', display: 'flex' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.background = 'none' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
function RelatoriosPanel({ wines, consumptions, entries, isMobile }) {
  const [activeReport, setActiveReport] = React.useState('stock')

  const REPORTS = [
    { id: 'stock',    label: 'Stock da Adega',        icon: <TrendingUp size={13} /> },
    { id: 'catalogo', label: 'Catálogo Completo',      icon: <FileText size={13} /> },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      {/* Report selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {REPORTS.map(r => (
            <button key={r.id} onClick={() => setActiveReport(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 6, border: `1px solid ${activeReport === r.id ? 'rgba(200,150,62,0.4)' : 'rgba(255,255,255,0.07)'}`,
              background: activeReport === r.id ? 'rgba(200,150,62,0.1)' : 'transparent',
              color: activeReport === r.id ? '#c8963e' : '#4a453f', cursor: 'pointer',
              fontFamily: FONT, fontSize: 12, transition: 'all 0.15s',
            }}>
              {r.icon} {r.label}
            </button>
          ))}
      </div>

      {activeReport === 'stock'    && <StockReport    wines={wines} consumptions={consumptions} isMobile={isMobile} />}
      {activeReport === 'catalogo' && <CatalogoReport wines={wines} consumptions={consumptions} isMobile={isMobile} />}
    </div>
  )
}

// ─── PDF HELPERS ──────────────────────────────────────────────────────────────
const pdfFooter = (doc, W, margin) => {
  // Footer bar + separator + centered text (page numbers added in post-pass)
  doc.setFillColor(22, 19, 16); doc.rect(0, 283, W, 14, 'F')
  doc.setDrawColor(50, 44, 38); doc.setLineWidth(0.2); doc.line(margin, 283.5, W - margin, 283.5)
  doc.setFontSize(6); doc.setTextColor(60, 52, 48)
  doc.text('Videiras · Cellar Collection · gerado em ' + new Date().toLocaleString('pt-PT'), W/2, 289.5, { align: 'center' })
}
const pdfAddPageNumbers = (doc, W, margin) => {
  // Post-pass: now all pages exist, so getNumberOfPages() is correct
  const total = doc.internal.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFontSize(6); doc.setTextColor(100, 90, 75)
    doc.text('Pág. ' + p + ' / ' + total, W - margin, 289.5, { align: 'right' })
  }
}
const pdfDrawHeader = (doc, W, margin, title) => {
  doc.setFillColor(13, 11, 9); doc.rect(0, 0, W, 297, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  doc.setTextColor(232, 222, 206); doc.setCharSpace(2)
  doc.text('VIDEIRAS', margin, 20)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
  doc.setTextColor(90, 80, 65); doc.setCharSpace(1.5)
  doc.text('CELLAR COLLECTION', margin, 25.5); doc.setCharSpace(0)
  doc.setFontSize(7.5); doc.setTextColor(200, 150, 62)
  doc.text(title, W - margin, 20, { align: 'right' })
  doc.setFontSize(7); doc.setTextColor(90, 80, 65)
  doc.text(new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }), W - margin, 25.5, { align: 'right' })
  doc.setDrawColor(200, 150, 62); doc.setLineWidth(0.2)
  doc.line(margin, 29, W - margin, 29)
}
const pdfAutoTableOptions = (margin) => ({
  styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 3, fillColor: [13, 11, 9], textColor: [180, 165, 145], lineColor: [35, 30, 24], lineWidth: 0.2 },
  headStyles: { fillColor: [22, 19, 16], textColor: [200, 150, 62], fontSize: 6.5, fontStyle: 'bold', halign: 'left', cellPadding: { top: 4, bottom: 4, left: 3, right: 3 } },
  footStyles: { fillColor: [22, 19, 16], textColor: [200, 150, 62], fontStyle: 'bold', fontSize: 7.5 },
  alternateRowStyles: { fillColor: [18, 15, 12] },
  columnStyles: {
    0: { cellWidth: 52 }, 1: { cellWidth: 18 }, 2: { cellWidth: 36 },
    3: { cellWidth: 12, halign: 'center' }, 4: { cellWidth: 10, halign: 'center' },
    5: { cellWidth: 22, halign: 'right' }, 6: { cellWidth: 22, halign: 'right' },
  },
  margin: { left: margin, right: margin },
})

// ─── STOCK REPORT ─────────────────────────────────────────────────────────────
function StockReport({ wines, isMobile }) {
  const inStock = wines.filter(w => w.quantity > 0).sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const totalBottles = inStock.reduce((s, w) => s + w.quantity, 0)
  const totalValue   = inStock.reduce((s, w) => s + w.purchasePrice * w.quantity, 0)
  const totalRefs    = inStock.length
  const byType = inStock.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0, value: 0, refs: 0 }
    acc[w.type].bottles += w.quantity; acc[w.type].value += w.purchasePrice * w.quantity; acc[w.type].refs++
    return acc
  }, {})

  const exportXLS = () => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    s.onload = () => {
      const rows = [['Stock da Adega — ' + new Date().toLocaleDateString('pt-PT')],[],
        ['Nome','Tipo','País','Região','Ano','Qtd','Preço Unit. (€)','Valor Total (€)'],
        ...inStock.map(w => [w.name,w.type,w.country,w.region,w.year||'—',w.quantity,Number(w.purchasePrice.toFixed(2)),Number((w.purchasePrice*w.quantity).toFixed(2))]),
        [],['TOTAL','','','','',totalBottles,'',Number(totalValue.toFixed(2))]]
      const ws = window.XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{wch:40},{wch:12},{wch:12},{wch:18},{wch:6},{wch:6},{wch:16},{wch:16}]
      ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:7}}]
      const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb,ws,'Stock')
      window.XLSX.writeFile(wb, `videiras-stock-${new Date().toISOString().slice(0,10)}.xlsx`)
    }; document.head.appendChild(s)
  }

  const exportPDF = () => {
    const s1 = document.createElement('script'); s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s1.onload = () => {
      const s2 = document.createElement('script'); s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      s2.onload = () => {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = 210, margin = 18
        pdfDrawHeader(doc, W, margin, 'RELATÓRIO DE STOCK')
        // KPIs
        const kpis = [{label:'REFERÊNCIAS',value:pdfInt(totalRefs)},{label:'GARRAFAS',value:pdfInt(totalBottles)},{label:'VALOR TOTAL',value:pdfFmt(totalValue)}]
        const kpiW = (W - margin*2 - 8) / 3
        kpis.forEach((k, i) => {
          const x = margin + i * (kpiW + 4)
          doc.setFillColor(22,19,16); doc.setDrawColor(50,44,38); doc.setLineWidth(0.3)
          doc.roundedRect(x, 33, kpiW, 16, 2, 2, 'FD')
          doc.setFontSize(6); doc.setTextColor(100,90,75); doc.text(k.label, x+kpiW/2, 38.5, {align:'center'})
          doc.setFontSize(10); doc.setTextColor(232,222,206); doc.setFont('helvetica','bold')
          doc.text(k.value, x+kpiW/2, 44.5, {align:'center'}); doc.setFont('helvetica','normal')
        })
        // Por tipo
        let yy = 55; doc.setFontSize(6.5); doc.setTextColor(200,150,62); doc.text('POR TIPO', margin, yy); yy += 4
        Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).forEach(([type, d]) => {
          doc.setFillColor(22,19,16); doc.roundedRect(margin, yy, W-margin*2, 6.5, 1, 1, 'F')
          doc.setTextColor(200,180,150); doc.setFontSize(7); doc.text(type, margin+4, yy+4.3)
          doc.setTextColor(150,140,120); doc.text(pdfInt(d.refs)+' ref · '+pdfInt(d.bottles)+' garrafas', margin+45, yy+4.3)
          doc.setTextColor(200,150,62); doc.text(pdfFmt(d.value), W-margin-4, yy+4.3, {align:'right'}); yy += 8
        })
        doc.autoTable({
          ...pdfAutoTableOptions(margin), startY: yy + 4,
          head: [['Nome','Tipo','País / Região','Ano','Qtd','Preço','Total']],
          body: inStock.map(w => [w.name,w.type,[w.region,w.country].filter(Boolean).join(' · '),w.year||'—',w.quantity,w.purchasePrice>0?pdfFmt(w.purchasePrice):'—',(w.purchasePrice*w.quantity)>0?pdfFmt(w.purchasePrice*w.quantity):'—']),
          foot: [['','','','',pdfInt(totalBottles),'',pdfFmt(totalValue)]],
          willDrawPage: (data) => { if (data.pageNumber > 1) { doc.setFillColor(13,11,9); doc.rect(0,0,W,297,'F') } },
          didDrawPage: () => pdfFooter(doc, W, margin),
        })
        pdfAddPageNumbers(doc, W, margin)
        doc.save(`videiras-stock-${new Date().toISOString().slice(0,10)}.pdf`)
      }; document.head.appendChild(s2)
    }; document.head.appendChild(s1)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#e8dece' }}>Stock da Adega</div>
          <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportXLS} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#6a9f6a',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(106,159,106,0.1)';e.currentTarget.style.borderColor='rgba(106,159,106,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> XLS</button>
          <button onClick={exportPDF} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#c8963e',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,150,62,0.1)';e.currentTarget.style.borderColor='rgba(200,150,62,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> PDF</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{label:'Referências',value:fmtInt(totalRefs),color:'#e8dece'},{label:'Garrafas',value:fmtInt(totalBottles),color:'#e8dece'},{label:'Valor total',value:fmt(totalValue),color:'#c8963e'}].map(k => (
          <div key={k.label} style={{ ...S.stat, padding: isMobile ? '14px 12px' : '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 300, color: k.color, fontFamily: FONT }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 14 }}>Por tipo</div>
        {Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
          const pct = Math.round((d.bottles / totalBottles) * 100)
          const tc = TYPE_COLORS[type] || { fg: '#9a8f82', bg: '#1a1814' }
          return (
            <div key={type} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: tc.fg, background: tc.bg, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>{type.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: '#6a5f52' }}>{fmtInt(d.refs)} ref · {fmtInt(d.bottles)} gar.</span>
                </div>
                <span style={{ fontSize: 12, color: '#c8963e' }}>{fmt(d.value)}</span>
              </div>
              <div style={{ height: 3, background: '#1a1814', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: tc.fg, opacity: 0.6, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ ...S.stat, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Nome','Tipo',!isMobile&&'País / Região',!isMobile&&'Ano','Qtd',!isMobile&&'Preço','Total'].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h==='Qtd'||h==='Preço'||h==='Total'?'right':'left', fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inStock.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i%2===1?'rgba(255,255,255,0.01)':'transparent' }}>
                  <td style={{ padding: '9px 12px', color: '#e8dece', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</td>
                  <td style={{ padding: '9px 12px' }}><Badge type={w.type} /></td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', fontSize: 11 }}>{[w.region, w.country].filter(Boolean).join(' · ')}</td>}
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'center' }}>{w.year || '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#e8dece', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.quantity}</td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.purchasePrice > 0 ? fmt(w.purchasePrice) : '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#c8963e', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{(w.purchasePrice*w.quantity) > 0 ? fmt(w.purchasePrice*w.quantity) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <td colSpan={isMobile?2:4} style={{ padding: '10px 12px', fontSize: 9, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</td>
                <td style={{ padding: '10px 12px', color: '#e8dece', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmtInt(totalBottles)}</td>
                {!isMobile && <td></td>}
                <td style={{ padding: '10px 12px', color: '#c8963e', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── CATÁLOGO COMPLETO ────────────────────────────────────────────────────────
function CatalogoReport({ wines, isMobile }) {
  const allWines = [...wines].sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const totalBottles = allWines.reduce((s, w) => s + w.quantity, 0)
  const totalValue   = allWines.reduce((s, w) => s + w.purchasePrice * w.quantity, 0)
  const totalRefs    = allWines.length
  const byType = allWines.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0, value: 0, refs: 0 }
    acc[w.type].bottles += w.quantity; acc[w.type].value += w.purchasePrice * w.quantity; acc[w.type].refs++
    return acc
  }, {})
  const maxTypeBottles = Math.max(...Object.values(byType).map(d => d.bottles), 1)

  const exportXLS = () => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    s.onload = () => {
      const rows = [['Catálogo Completo — ' + new Date().toLocaleDateString('pt-PT')],[],
        ['Nome','Tipo','País','Região','Ano','Qtd','Preço Unit. (€)','Valor Total (€)'],
        ...allWines.map(w => [w.name,w.type,w.country,w.region,w.year||'—',w.quantity,Number(w.purchasePrice.toFixed(2)),Number((w.purchasePrice*w.quantity).toFixed(2))]),
        [],['TOTAL','','','','',totalBottles,'',Number(totalValue.toFixed(2))]]
      const ws = window.XLSX.utils.aoa_to_sheet(rows)
      ws['!cols'] = [{wch:40},{wch:12},{wch:12},{wch:18},{wch:6},{wch:6},{wch:16},{wch:16}]
      ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:7}}]
      const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb,ws,'Catálogo')
      window.XLSX.writeFile(wb, `videiras-catalogo-${new Date().toISOString().slice(0,10)}.xlsx`)
    }; document.head.appendChild(s)
  }

  const exportPDF = () => {
    const s1 = document.createElement('script'); s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s1.onload = () => {
      const s2 = document.createElement('script'); s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      s2.onload = () => {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const W = 210, margin = 18
        pdfDrawHeader(doc, W, margin, 'CATÁLOGO COMPLETO')
        const kpis = [{label:'REFERÊNCIAS',value:pdfInt(totalRefs)},{label:'GARRAFAS',value:pdfInt(totalBottles)},{label:'VALOR TOTAL',value:pdfFmt(totalValue)}]
        const kpiW = (W - margin*2 - 8) / 3
        kpis.forEach((k, i) => {
          const x = margin + i * (kpiW + 4)
          doc.setFillColor(22,19,16); doc.setDrawColor(50,44,38); doc.setLineWidth(0.3)
          doc.roundedRect(x, 33, kpiW, 16, 2, 2, 'FD')
          doc.setFontSize(6); doc.setTextColor(100,90,75); doc.text(k.label, x+kpiW/2, 38.5, {align:'center'})
          doc.setFontSize(10); doc.setTextColor(232,222,206); doc.setFont('helvetica','bold')
          doc.text(k.value, x+kpiW/2, 44.5, {align:'center'}); doc.setFont('helvetica','normal')
        })
        let yy = 55; doc.setFontSize(6.5); doc.setTextColor(200,150,62); doc.text('POR TIPO', margin, yy); yy += 4
        Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).forEach(([type, d]) => {
          doc.setFillColor(22,19,16); doc.roundedRect(margin, yy, W-margin*2, 6.5, 1, 1, 'F')
          doc.setTextColor(200,180,150); doc.setFontSize(7); doc.text(type, margin+4, yy+4.3)
          doc.setTextColor(150,140,120); doc.text(pdfInt(d.refs)+' ref · '+pdfInt(d.bottles)+' garrafas', margin+45, yy+4.3)
          doc.setTextColor(200,150,62); doc.text(pdfFmt(d.value), W-margin-4, yy+4.3, {align:'right'}); yy += 8
        })
        doc.autoTable({
          ...pdfAutoTableOptions(margin), startY: yy + 4,
          head: [['Nome','Tipo','País / Região','Ano','Qtd','Preço','Total']],
          body: allWines.map(w => [w.name,w.type,[w.region,w.country].filter(Boolean).join(' · '),w.year||'—',w.quantity>0?w.quantity:'—',w.purchasePrice>0?pdfFmt(w.purchasePrice):'—',(w.purchasePrice*w.quantity)>0?pdfFmt(w.purchasePrice*w.quantity):'—']),
          foot: [['','','','',pdfInt(totalBottles),'',pdfFmt(totalValue)]],
          willDrawPage: (data) => { if (data.pageNumber > 1) { doc.setFillColor(13,11,9); doc.rect(0,0,W,297,'F') } },
          didDrawPage: () => pdfFooter(doc, W, margin),
        })
        pdfAddPageNumbers(doc, W, margin)
        doc.save(`videiras-catalogo-${new Date().toISOString().slice(0,10)}.pdf`)
      }; document.head.appendChild(s2)
    }; document.head.appendChild(s1)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#e8dece' }}>Catálogo Completo</div>
          <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportXLS} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#6a9f6a',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(106,159,106,0.1)';e.currentTarget.style.borderColor='rgba(106,159,106,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> XLS</button>
          <button onClick={exportPDF} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#c8963e',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,150,62,0.1)';e.currentTarget.style.borderColor='rgba(200,150,62,0.3)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> PDF</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{label:'Referências',value:fmtInt(totalRefs),color:'#e8dece'},{label:'Garrafas',value:fmtInt(totalBottles),color:'#e8dece'},{label:'Valor total',value:fmt(totalValue),color:'#c8963e'}].map(k => (
          <div key={k.label} style={{ ...S.stat, padding: isMobile ? '14px 12px' : '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 300, color: k.color, fontFamily: FONT }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 14 }}>Por tipo</div>
        {Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
          const pct = Math.round((d.bottles / maxTypeBottles) * 100)
          const tc = TYPE_COLORS[type] || { fg: '#9a8f82', bg: '#1a1814' }
          return (
            <div key={type} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: tc.fg, background: tc.bg, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>{type.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: '#6a5f52' }}>{fmtInt(d.refs)} ref · {fmtInt(d.bottles)} gar.</span>
                </div>
                <span style={{ fontSize: 12, color: '#c8963e' }}>{fmt(d.value)}</span>
              </div>
              <div style={{ height: 3, background: '#1a1814', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: tc.fg, opacity: 0.6, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ ...S.stat, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Nome','Tipo',!isMobile&&'País / Região',!isMobile&&'Ano','Qtd',!isMobile&&'Preço','Total'].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h==='Qtd'||h==='Preço'||h==='Total'?'right':'left', fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allWines.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i%2===1?'rgba(255,255,255,0.01)':'transparent', opacity: w.quantity===0?0.45:1 }}>
                  <td style={{ padding: '9px 12px', color: '#e8dece', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</td>
                  <td style={{ padding: '9px 12px' }}><Badge type={w.type} /></td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', fontSize: 11 }}>{[w.region, w.country].filter(Boolean).join(' · ')}</td>}
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'center' }}>{w.year || '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#e8dece', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.quantity > 0 ? w.quantity : '—'}</td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.purchasePrice > 0 ? fmt(w.purchasePrice) : '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#c8963e', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{(w.purchasePrice*w.quantity) > 0 ? fmt(w.purchasePrice*w.quantity) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <td colSpan={isMobile?2:4} style={{ padding: '10px 12px', fontSize: 9, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</td>
                <td style={{ padding: '10px 12px', color: '#e8dece', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmtInt(totalBottles)}</td>
                {!isMobile && <td></td>}
                <td style={{ padding: '10px 12px', color: '#c8963e', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}


// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ wines, entries, consumptions, isMobile }) {
  const inStock       = wines.filter(w => w.quantity > 0)
  const totalBottles  = wines.reduce((s, w) => s + w.quantity, 0)
  const totalValue    = inStock.reduce((s, w) => s + totalV(w), 0)
  const totalConsumed = consumptions.reduce((s, c) => s + c.quantity, 0)

  // "Garrafas por tipo" — só em stock
  const byTypeStock = inStock.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0 }
    acc[w.type].bottles += w.quantity
    return acc
  }, {})
  const maxBottles = Math.max(...Object.values(byTypeStock).map(v => v.bottles), 1)

  // "Por país" em stock
  const byCountryStock = inStock.reduce((acc, w) => {
    if (!acc[w.country]) acc[w.country] = { count: 0 }
    acc[w.country].count++
    return acc
  }, {})

  // "Por país" total (todas as referências)
  const byCountryAll = wines.reduce((acc, w) => {
    if (!acc[w.country]) acc[w.country] = { count: 0 }
    acc[w.country].count++
    return acc
  }, {})

  const topWines = [...inStock].sort((a, b) => totalV(b) - totalV(a)).slice(0, 5)

  // Consumos por região
  const byRegion = consumptions.reduce((acc, c) => {
    const w = wines.find(x => x.id === c.wineId)
    if (!w) return acc
    const key = w.region || w.country || 'Desconhecida'
    if (!acc[key]) acc[key] = { count: 0, bottles: 0, avgRating: 0, ratings: [] }
    acc[key].count++
    acc[key].bottles += c.quantity
    if (c.rating) acc[key].ratings.push(c.rating)
    return acc
  }, {})
  // compute avgRating
  Object.values(byRegion).forEach(d => {
    d.avgRating = d.ratings.length ? (d.ratings.reduce((s, r) => s + r, 0) / d.ratings.length) : 0
  })
  const topRegions = Object.entries(byRegion)
    .sort((a, b) => b[1].bottles - a[1].bottles)
    .slice(0, 8)
  const maxRegionBottles = topRegions.length ? topRegions[0][1].bottles : 1

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { l: 'Referências em stock', v: fmtInt(inStock.length),      c: '#e8dece' },
          { l: 'Garrafas em stock',    v: fmtInt(totalBottles),         c: '#e8dece' },
          { l: 'Valor Total',          v: fmt(totalValue),      c: '#c8963e' },
          { l: 'Consumidas',           v: fmtInt(totalConsumed),        c: '#9a8f82' },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ ...S.stat, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 300, color: c, fontFamily: FONT, letterSpacing: '-0.03em' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Garrafas por tipo + Por país em stock */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ ...S.stat, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Garrafas em stock por tipo</h3>
          {Object.entries(byTypeStock).sort((a, b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
            const c = getTC(type)
            return (
              <div key={type} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: c.fg }}>{type}</span>
                  <span style={{ fontSize: 12, color: '#9a8f82' }}>{d.bottles} gar.</span>
                </div>
                <div style={{ height: 3, background: '#26221c', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.bottles / maxBottles) * 100}%`, background: c.fg, opacity: 0.6, borderRadius: 2 }} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ ...S.stat, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Por país — em stock</h3>
          <PieChart
            total={inStock.length}
            data={Object.entries(byCountryStock).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))}
          />
        </div>
      </div>

      {/* Por país total */}
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Por país — todas as referências ({wines.length})</h3>
        <PieChart
          total={wines.length}
          data={Object.entries(byCountryAll).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))}
        />
      </div>

      {/* Consumos por região */}
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Mais consumidos por região</h3>
        {topRegions.length === 0
          ? <p style={{ fontSize: 13, color: '#3a3530' }}>Sem consumos registados.</p>
          : topRegions.map(([region, d]) => (
            <div key={region} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: '#e8dece', fontWeight: 400 }}>{region}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {d.avgRating > 0 && (
                    <span style={{ fontSize: 11, color: '#c8963e' }}>{'★'.repeat(Math.round(d.avgRating))} {d.avgRating.toFixed(1)}</span>
                  )}
                  <span style={{ fontSize: 12, color: '#9a8f82', minWidth: 60, textAlign: 'right' }}>{fmtInt(d.bottles)} {d.bottles === 1 ? 'garrafa' : 'garrafas'}</span>
                </div>
              </div>
              <div style={{ height: 3, background: '#26221c', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(d.bottles / maxRegionBottles) * 100}%`, background: '#c8963e', opacity: 0.5, borderRadius: 2, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))
        }
      </div>

      {/* Top 5 */}
      <div style={{ ...S.stat, padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Top 5 por valor em adega</h3>
        {topWines.map((w, i) => (
          <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: '#3a3530', fontWeight: 600, minWidth: 20, fontFamily: FONT }}>#{i + 1}</span>
            <WineThumb photo={w.photo} type={w.type} size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONT }}>{w.name}</div>
              <div style={{ fontSize: 11, color: '#9a8f82' }}>{w.quantity} × {fmt(w.purchasePrice)}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#c8963e', fontFamily: FONT }}>{fmt(totalV(w))}</div>
              <Badge type={w.type} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [wines,            setWines]            = useState(() => { const c = loadCache(); return c?.wines?.map(wineFromDb) ?? [] })
  const [entries,          setEntries]          = useState(() => { const c = loadCache(); return c?.entries?.map(entryFromDb) ?? [] })
  const [consumptions,     setConsumptions]     = useState(() => { const c = loadCache(); return c?.consumptions?.map(consumptionFromDb) ?? [] })
  const [session,          setSession]          = useState(null)
  const [profile,          setProfile]          = useState(null)
  const [authLoading,      setAuthLoading]      = useState(true)
  const [loading,          setLoading]          = useState(() => !loadCache())
  const [types,            setTypes]            = useState(INIT_TYPES)
  const [suppliers,        setSuppliers]        = useState([])
  const [countriesRegions, setCountriesRegions] = useState(COUNTRIES_REGIONS)

  const [view,           setView]           = useState('dashboard')
  const [search,         setSearch]         = useState('')
  const [filterType,     setFilterType]     = useState('')
  const [filterCountry,  setFilterCountry]  = useState('')
  const [filterRegion,   setFilterRegion]   = useState('')
  const [listMode,       setListMode]       = useState('list')
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [isMobile,       setIsMobile]       = useState(false)
  const [modal,          setModal]          = useState(null)
  const [activeWine,     setActiveWine]     = useState(null)
  const [activeEntry,    setActiveEntry]    = useState(null)
  const [activeCons,     setActiveCons]     = useState(null)
  const [quotes,         setQuotes]         = useState([])
  const [activeQuote,    setActiveQuote]    = useState(null)
  const [searchEntradas, setSearchEntradas] = useState('')
  const [searchConsumos, setSearchConsumos] = useState('')
  const [showAbout,      setShowAbout]      = useState(false)
  const [showNoStock,    setShowNoStock]    = useState(() => {
    try { return localStorage.getItem('videiras_showNoStock') !== 'false' } catch { return true }
  })

  // persist showNoStock
  useEffect(() => {
    try { localStorage.setItem('videiras_showNoStock', String(showNoStock)) } catch {}
  }, [showNoStock])

  // derived lists for filters
  const allCountries = useMemo(() => Object.keys(countriesRegions), [countriesRegions])
  const regionsForFilter = useMemo(() => filterCountry ? (countriesRegions[filterCountry] || []) : [], [countriesRegions, filterCountry])

  const addCountry = (name) => setCountriesRegions((p) => ({ ...p, [name]: [] }))
  const addRegionToCountry = (country, region) => setCountriesRegions((p) => ({ ...p, [country]: [...(p[country] || []), region] }))

  useEffect(() => {
    const h = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener('resize', h); h()
    return () => window.removeEventListener('resize', h)
  }, [])

  // ── AUTENTICAÇÃO ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async (userId) => {
      const { data } = await supabase.from('videiras_profiles').select('*').eq('id', userId).single()
      setProfile(data || null)
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) loadProfile(s.user.id)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        clearCache()
        setSession(null); setProfile(null)
        setWines([]); setEntries([]); setConsumptions([])
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(s)
        if (s?.user) loadProfile(s.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── CARREGAR DADOS DO SUPABASE ────────────────────────────────────────────
  useEffect(() => {
    if (!session) return
    const hasCachedData = !!loadCache()
    const load = async () => {
      if (!hasCachedData) setLoading(true)
      try {
        const [wRes, eRes, cRes, sRes, qRes] = await Promise.all([
          supabase.from('videiras_wines').select('*').order('name'),
          supabase.from('videiras_entries').select('*').order('date', { ascending: false }),
          supabase.from('videiras_consumptions').select('*').order('date', { ascending: false }),
          supabase.from('videiras_suppliers').select('name').order('name'),
          supabase.from('videiras_quotes').select('id,quote,author,category').eq('active', true),
        ])
        if (wRes.error) console.error('wines:', wRes.error)
        if (eRes.error) console.error('entries:', eRes.error)
        if (cRes.error) console.error('consumptions:', cRes.error)
        if (wRes.data) setWines(wRes.data.map(wineFromDb))
        if (eRes.data) setEntries(eRes.data.map(entryFromDb))
        if (cRes.data) setConsumptions(cRes.data.map(consumptionFromDb))
        if (sRes.data && sRes.data.length > 0) setSuppliers(sRes.data.map(r => r.name))
        else setSuppliers([...SUPPLIERS].sort((a, b) => a.localeCompare(b, 'pt')))
        if (qRes.data) setQuotes(qRes.data)
        saveCache({
          wines:        wRes.data ?? [],
          entries:      eRes.data ?? [],
          consumptions: cRes.data ?? [],
        })
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session?.user?.id])

  const closeModal = () => { setModal(null); setActiveWine(null); setActiveEntry(null); setActiveCons(null) }

  const showRandomQuote = (context) => {
    if (!quotes.length) return
    // Try to match category: type of wine or action (consumo/entrada)
    const candidates = quotes.filter(q =>
      q.category === context ||
      q.category === 'geral'
    )
    const pool = candidates.length ? candidates : quotes
    setActiveQuote(pool[Math.floor(Math.random() * pool.length)])
  }

  const addWine = async (d) => {
    const { data } = await supabase.from('videiras_wines').insert({ ...wineToDb(d), user_id: session.user.id }).select().single()
    if (data) setWines((p) => [...p, wineFromDb(data)])
    closeModal()
  }

  const editWine = async (d) => {
    const { data } = await supabase.from('videiras_wines').update(wineToDb(d)).eq('id', activeWine.id).select().single()
    if (data) setWines((p) => p.map((w) => w.id === activeWine.id ? wineFromDb(data) : w))
    closeModal()
  }

  const deleteWine = async (id) => {
    await supabase.from('videiras_wines').delete().eq('id', id)
    setWines((p) => p.filter((w) => w.id !== id))
    closeModal()
  }

  const addEntry = async (d) => {
    const wine = wines.find(w => w.id === activeWine.id)
    const newQty = (wine?.quantity || 0) + d.quantity
    const [eRes, wRes] = await Promise.all([
      supabase.from('videiras_entries').insert({ ...entryToDb({ ...d, wineId: activeWine.id }), user_id: session.user.id }).select().single(),
      supabase.from('videiras_wines').update({ quantity: newQty, purchase_price: d.price || wine?.purchasePrice || 0 }).eq('id', activeWine.id).select().single(),
    ])
    if (eRes.data) setEntries((p) => [...p, entryFromDb(eRes.data)])
    if (wRes.data) setWines((p) => p.map((w) => w.id !== activeWine.id ? w : wineFromDb(wRes.data)))
    closeModal()
    showRandomQuote('entrada')
  }

  const addConsumption = async (d) => {
    const wine = wines.find(w => w.id === activeWine.id)
    const newQty = (wine?.quantity || 0) - d.quantity
    const updates = { quantity: newQty, ...(d.rating ? { personal_rating: d.rating } : {}) }
    const [cRes, wRes] = await Promise.all([
      supabase.from('videiras_consumptions').insert({ ...consumptionToDb({ ...d, wineId: activeWine.id }), user_id: session.user.id }).select().single(),
      supabase.from('videiras_wines').update(updates).eq('id', activeWine.id).select().single(),
    ])
    if (cRes.data) setConsumptions((p) => [...p, consumptionFromDb(cRes.data)])
    if (wRes.data) setWines((p) => p.map((w) => w.id !== activeWine.id ? w : wineFromDb(wRes.data)))
    closeModal()
    const wineType = wine?.type?.toLowerCase()
    showRandomQuote(['tinto','branco','rosé','espumante'].includes(wineType) ? wineType : 'consumo')
  }

  const deleteEntry = async (entry) => {
    const wine = wines.find(w => w.id === entry.wineId)
    const newQty = Math.max(0, (wine?.quantity || 0) - entry.quantity)
    await supabase.from('videiras_entries').delete().eq('id', entry.id)
    const { data } = await supabase.from('videiras_wines').update({ quantity: newQty }).eq('id', entry.wineId).select().single()
    setEntries((p) => p.filter((e) => e.id !== entry.id))
    if (data) setWines((p) => p.map((w) => w.id !== entry.wineId ? w : wineFromDb(data)))
  }

  const deleteConsumption = async (consumption) => {
    const wine = wines.find(w => w.id === consumption.wineId)
    const newQty = (wine?.quantity || 0) + consumption.quantity
    await supabase.from('videiras_consumptions').delete().eq('id', consumption.id)
    const { data } = await supabase.from('videiras_wines').update({ quantity: newQty }).eq('id', consumption.wineId).select().single()
    setConsumptions((p) => p.filter((c) => c.id !== consumption.id))
    if (data) setWines((p) => p.map((w) => w.id !== consumption.wineId ? w : wineFromDb(data)))
  }

  const editEntry = async (originalEntry, d) => {
    const wine = wines.find(w => w.id === originalEntry.wineId)
    const qtyDiff = d.quantity - originalEntry.quantity
    const newQty  = (wine?.quantity || 0) + qtyDiff
    const [eRes, wRes] = await Promise.all([
      supabase.from('videiras_entries').update(entryToDb({ ...d, wineId: originalEntry.wineId })).eq('id', originalEntry.id).select().single(),
      supabase.from('videiras_wines').update({ quantity: newQty, purchase_price: d.price || wine?.purchasePrice || 0 }).eq('id', originalEntry.wineId).select().single(),
    ])
    if (eRes.data) setEntries(p => p.map(e => e.id === originalEntry.id ? entryFromDb(eRes.data) : e))
    if (wRes.data) setWines(p => p.map(w => w.id !== originalEntry.wineId ? w : wineFromDb(wRes.data)))
    closeModal()
  }

  const editConsumption = async (originalCons, d) => {
    const wine = wines.find(w => w.id === originalCons.wineId)
    const qtyDiff = originalCons.quantity - d.quantity
    const newQty  = (wine?.quantity || 0) + qtyDiff
    const updates = { quantity: newQty, ...(d.rating ? { personal_rating: d.rating } : {}) }
    const [cRes, wRes] = await Promise.all([
      supabase.from('videiras_consumptions').update(consumptionToDb({ ...d, wineId: originalCons.wineId })).eq('id', originalCons.id).select().single(),
      supabase.from('videiras_wines').update(updates).eq('id', originalCons.wineId).select().single(),
    ])
    if (cRes.data) setConsumptions(p => p.map(c => c.id === originalCons.id ? consumptionFromDb(cRes.data) : c))
    if (wRes.data) setWines(p => p.map(w => w.id !== originalCons.wineId ? w : wineFromDb(wRes.data)))
    closeModal()
  }

  const filtered = useMemo(() => wines.filter((w) => {
    const q = search.toLowerCase()
    const ms = !q || [w.name, w.country, w.region, w.castas].some((f) => f?.toLowerCase().includes(q))
    const stock = showNoStock || w.quantity > 0
    return ms && stock && (!filterType || w.type === filterType) && (!filterCountry || w.country === filterCountry) && (!filterRegion || w.region === filterRegion)
  }), [wines, search, filterType, filterCountry, filterRegion, showNoStock])

  const liveWine = activeWine ? wines.find((w) => w.id === activeWine.id) || activeWine : null

  const isAdmin = profile?.role === 'admin'
  const handleLogout = async () => { await supabase.auth.signOut() }

  const NAV = [
    { id: 'dashboard', icon: <BarChart3 size={15} />, label: 'Dashboard' },
    { id: 'adega',     icon: <Wine size={15} />,      label: 'Adega' },
    { id: 'entradas',  icon: <LogIn size={15} />,     label: 'Entradas' },
    { id: 'consumos',  icon: <LogOut size={15} />,    label: 'Consumos' },
    { id: 'relatorios', icon: <FileText size={15} />, label: 'Relatórios' },
    ...(isAdmin ? [{ id: 'admin', icon: <ShieldCheck size={15} />, label: 'Admin' }] : []),
  ]

  if (authLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: FONT }}>
      <div style={{ width: 40, height: 40, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine size={20} color="#c8963e" /></div>
      <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>A verificar sessão…</div>
    </div>
  )

  if (!session) return <LoginScreen />

  if (profile?.must_change_password) return <ChangePasswordScreen profile={profile} onDone={() => setProfile(p => ({ ...p, must_change_password: false }))} />

  if (profile && !profile.active) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <UserX size={32} color="#e87080" />
      <div style={{ fontSize: 15, color: '#e8dece' }}>Conta inactiva</div>
      <div style={{ fontSize: 13, color: '#4a453f' }}>Contacta o administrador.</div>
      <button onClick={handleLogout} style={{ marginTop: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#6a5f52', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontFamily: FONT, fontSize: 12 }}>Sair</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', color: '#e8dece', fontFamily: FONT }}>
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: '#0d0b09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200, gap: 16 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wine size={20} color="#c8963e" />
          </div>
          <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>A carregar adega…</div>
        </div>
      )}

      {/* SIDEBAR (desktop only) */}
      {sidebarOpen && !isMobile && (
        <div style={{ width: 216, flexShrink: 0, background: '#161310', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wine size={15} color="#c8963e" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 200, color: '#e8dece', fontFamily: FONT, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Videiras</div>
              <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 400, marginTop: 1 }}>cellar collection</div>
            </div>
          </div>

          <nav style={{ flex: 1 }}>
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 20px',
                background: view === n.id ? 'rgba(200,150,62,0.08)' : 'none',
                borderLeft: view === n.id ? '2px solid #c8963e' : '2px solid transparent',
                color: view === n.id ? '#c8963e' : '#6a6058',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: view === n.id ? 400 : 300,
                fontFamily: FONT, letterSpacing: '0.02em', transition: 'all 0.15s', textAlign: 'left',
              }}>{n.icon}{n.label}</button>
            ))}
          </nav>

          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 11, color: '#4a453f', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', fontSize: 11, fontFamily: FONT, padding: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e87080'}
              onMouseLeave={e => e.currentTarget.style.color = '#4a453f'}>
              <KeyRound size={11} /> Terminar sessão
            </button>
            <button onClick={() => setShowAbout(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', fontSize: 11, fontFamily: FONT, padding: '8px 0 0', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c8963e'}
              onMouseLeave={e => e.currentTarget.style.color = '#6a5f52'}>
              <Wine size={11} /> Quem é o Videiras?
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ padding: `0 ${isMobile ? 16 : 24}px`, borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#161310', display: 'flex', alignItems: 'center', gap: 12, height: 48, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          {!isMobile && (
            <button onClick={() => setSidebarOpen((p) => !p)} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <Menu size={17} />
            </button>
          )}
          {isMobile && (
            <div style={{ width: 24, height: 24, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wine size={12} color="#c8963e" />
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: 12, fontWeight: 400, color: '#6a6058', fontFamily: FONT, letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1 }}>
            {{ dashboard: 'Dashboard', adega: 'Adega', entradas: 'Entradas', consumos: 'Consumos', relatorios: 'Relatórios', admin: 'Admin' }[view]}
          </h1>
          {view === 'adega' && (
            <Btn variant="gold" onClick={() => setModal('addWine')}><Plus size={13} />{!isMobile && 'Vinho'}</Btn>
          )}
        </div>

        {/* content */}
        <div style={{ flex: 1, padding: isMobile ? 16 : 24, overflowY: 'auto', paddingBottom: isMobile ? 72 : 24 }}>
          {view === 'dashboard' && <Dashboard wines={wines} entries={entries} consumptions={consumptions} isMobile={isMobile} />}
          {view === 'relatorios' && <RelatoriosPanel wines={wines} consumptions={consumptions} entries={entries} isMobile={isMobile} />}
          {view === 'admin' && isAdmin && <AdminPanel session={session} />}

          {view === 'adega' && (
            <>
              {/* filtros — toolbar dentro do conteúdo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 260 }}>
                  <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
                  <input style={{ ...S.inp, paddingLeft: 30, fontSize: 13 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar…" />
                </div>
                <FilterSelect placeholder="Todos os tipos" value={filterType} onChange={setFilterType} options={types} onAdd={(v) => setTypes((p) => [...p, v])} />
                {!isMobile && <FilterSelect placeholder="Países" value={filterCountry} onChange={(v) => { setFilterCountry(v); setFilterRegion('') }} options={allCountries} onAdd={addCountry} />}
                {!isMobile && filterCountry && (
                  <FilterSelect placeholder="Regiões" value={filterRegion} onChange={setFilterRegion} options={countriesRegions[filterCountry] || []} onAdd={(v) => addRegionToCountry(filterCountry, v)} />
                )}
                <button
                  onClick={() => setShowNoStock((p) => !p)}
                  title={showNoStock ? 'Ocultar sem stock' : 'Mostrar sem stock'}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 11, fontFamily: FONT,
                    background: showNoStock ? 'transparent' : 'rgba(200,150,62,0.1)',
                    color: showNoStock ? '#4a453f' : '#c8963e', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  {showNoStock ? <Eye size={12} /> : <EyeOff size={12} />}
                  {!isMobile ? (showNoStock ? ' Com stock' : ' Só stock') : ''}
                </button>
                <div style={{ marginLeft: 'auto', display: 'flex', background: '#0d0b09', borderRadius: 6, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                  {[{ m: 'list', I: List }, { m: 'grid', I: LayoutGrid }].map(({ m, I }) => (
                    <button key={m} onClick={() => setListMode(m)}
                      style={{ padding: '6px 9px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        background: listMode === m ? 'rgba(200,150,62,0.12)' : 'transparent',
                        color: listMode === m ? '#c8963e' : '#3a3530', transition: 'all 0.15s' }}>
                      <I size={13} />
                    </button>
                  ))}
                </div>
              </div>
              {listMode === 'list'
                ? <WineListView wines={filtered} onWineClick={(w) => { setActiveWine(w); setModal('detail') }} isMobile={isMobile} />
                : <WineGridView wines={filtered} onWineClick={(w) => { setActiveWine(w); setModal('detail') }} />}
            </>
          )}

          {view === 'entradas' && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
                <input style={{ ...S.inp, paddingLeft: 34 }} value={searchEntradas} onChange={(e) => setSearchEntradas(e.target.value)} placeholder="Pesquisar por vinho ou fornecedor…" />
              </div>
              {(() => {
                const q = searchEntradas.toLowerCase()
                const filtered = [...entries]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .filter((e) => {
                    const w = wines.find((x) => x.id === e.wineId)
                    return !q || w?.name.toLowerCase().includes(q) || e.supplier.toLowerCase().includes(q) || e.date.includes(q)
                  })
                if (filtered.length === 0) return <p style={{ textAlign: 'center', color: '#4a453f', paddingTop: 40, fontSize: 13 }}>{searchEntradas ? 'Nenhum resultado.' : 'Sem entradas registadas.'}</p>
                return filtered.map((e) => {
                  const w = wines.find((x) => x.id === e.wineId)
                  return (
                    <div key={e.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, background: 'rgba(104,200,128,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LogIn size={13} color="#68c880" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                        <div style={{ fontSize: 11, color: '#9a8f82' }}>{e.supplier} · {e.date}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#68c880' }}>+{e.quantity} gar.</div>
                        <div style={{ fontSize: 11, color: '#9a8f82' }}>{fmt(e.price)}/un</div>
                      </div>
                      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        <button onClick={() => { if (w) { setActiveWine(w); setActiveEntry(e); setModal('editEntry') } }}
                          title="Editar entrada"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e2) => { e2.currentTarget.style.color = '#c8963e'; e2.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                          onMouseLeave={(e2) => { e2.currentTarget.style.color = '#6a5f52'; e2.currentTarget.style.background = 'none' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Cancelar entrada de ${e.quantity} ${e.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será revertido.`)) deleteEntry(e) }}
                          title="Cancelar entrada"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e2) => { e2.currentTarget.style.color = '#e87080'; e2.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                          onMouseLeave={(e2) => { e2.currentTarget.style.color = '#6a5f52'; e2.currentTarget.style.background = 'none' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {view === 'consumos' && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a453f' }} />
                <input style={{ ...S.inp, paddingLeft: 34 }} value={searchConsumos} onChange={(e) => setSearchConsumos(e.target.value)} placeholder="Pesquisar por vinho ou observações…" />
              </div>
              {(() => {
                const q = searchConsumos.toLowerCase()
                const filtered = [...consumptions]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .filter((c) => {
                    const w = wines.find((x) => x.id === c.wineId)
                    return !q || w?.name.toLowerCase().includes(q) || c.notes?.toLowerCase().includes(q) || c.date.includes(q)
                  })
                if (filtered.length === 0) return <p style={{ textAlign: 'center', color: '#4a453f', paddingTop: 40, fontSize: 13 }}>{searchConsumos ? 'Nenhum resultado.' : 'Sem consumos registados.'}</p>
                return filtered.map((c) => {
                  const w = wines.find((x) => x.id === c.wineId)
                  return (
                    <div key={c.id} style={{ ...S.card, display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, background: 'rgba(200,150,62,0.1)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LogOut size={13} color="#c8963e" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w?.name || '(removido)'}</div>
                        <div style={{ fontSize: 11, color: '#9a8f82', marginBottom: c.notes ? 4 : 0 }}>{c.date} · {c.quantity} {c.quantity === 1 ? 'garrafa' : 'garrafas'}</div>
                        {c.notes && <div style={{ fontSize: 12, color: '#7a6f62', fontStyle: 'italic' }}>{c.notes}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <Stars value={c.rating} size={12} />
                        <button onClick={() => { if (w) { setActiveWine(w); setActiveCons(c); setModal('editCons') } }}
                          title="Editar consumo"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#c8963e'; e.currentTarget.style.background = 'rgba(200,150,62,0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Cancelar consumo de ${c.quantity} ${c.quantity === 1 ? 'garrafa' : 'garrafas'} de "${w?.name}"? O stock será reposto.`)) deleteConsumption(c) }}
                          title="Cancelar consumo"
                          style={{ background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, display: 'flex', borderRadius: 5, transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#6a5f52'; e.currentTarget.style.background = 'none' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV (mobile) */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: '#161310', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', zIndex: 20 }}>
          {NAV.map((n) => {
            const active = view === n.id
            return (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s',
                color: active ? '#c8963e' : '#3a3530', fontFamily: FONT, padding: '4px 1px', minWidth: 0,
              }}>
                <div style={{
                  padding: active ? '2px 8px' : '2px 4px', borderRadius: 10,
                  background: active ? 'rgba(200,150,62,0.12)' : 'transparent',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {React.cloneElement(n.icon, { size: 14 })}
                </div>
                {active && (
                  <span style={{ fontSize: 7.5, letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: 600, lineHeight: 1 }}>
                    {n.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {activeQuote && <QuoteOverlay quote={activeQuote} onClose={() => setActiveQuote(null)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* MODALS */}
      {modal && (
        <ModalShell onClose={closeModal} isMobile={isMobile}>
          {modal === 'addWine'     && <WineForm types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} allWines={wines} onExactMatch={(w) => { setActiveWine(w); setModal('entry') }} onSave={addWine} onClose={closeModal} isMobile={isMobile} />}
          {modal === 'editWine'    && liveWine && <WineForm wine={liveWine} types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} onSave={editWine} onClose={closeModal} isMobile={isMobile} />}
          {modal === 'detail'      && liveWine && <WineDetail wine={liveWine} entries={entries} consumptions={consumptions} onClose={closeModal} onEntry={() => setModal('entry')} onConsumption={() => setModal('consumption')} onEdit={() => setModal('editWine')} onDelete={() => { if (window.confirm(`Tens a certeza que queres eliminar "${liveWine.name}"? Esta acção não pode ser revertida.`)) deleteWine(liveWine.id) }} onDeleteEntry={deleteEntry} onDeleteConsumption={deleteConsumption} onEditEntry={(e) => { setActiveEntry(e); setModal('editEntry') }} onEditConsumption={(c) => { setActiveCons(c); setModal('editCons') }} session={session} />}
          {modal === 'entry'       && liveWine && <EntryForm wine={liveWine} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={addEntry} onClose={closeModal} />}
          {modal === 'editEntry'    && liveWine && activeEntry && <EntryForm wine={liveWine} entry={activeEntry} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={(d) => editEntry(activeEntry, d)} onClose={closeModal} />}
          {modal === 'consumption' && liveWine && <ConsumptionForm wine={liveWine} onSave={addConsumption} onClose={closeModal} />}
          {modal === 'editCons'    && liveWine && activeCons   && <ConsumptionForm wine={liveWine} consumption={activeCons} onSave={(d) => editConsumption(activeCons, d)} onClose={closeModal} />}
        </ModalShell>
      )}
    </div>
  )
}