import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Escapa caracteres HTML para prevenir XSS no corpo do email */
function esc(str: unknown): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function clamp(str: unknown, max: number): string {
  const s = String(str ?? '')
  return s.length > max ? s.slice(0, max) : s
}

// verify_jwt: false — auth manual via service_role (necessário para verificar perfil)
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Não autenticado' }, 401)
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !user) return json({ error: 'Token inválido' }, 401)

  const body = await req.json().catch(() => ({}))
  const { to, wine, senderName } = body

  if (!to || typeof to !== 'string' || !EMAIL_RE.test(to) || to.length > 254)
    return json({ error: 'Email de destino inválido' }, 400)
  if (!wine || typeof wine !== 'object')
    return json({ error: 'Parâmetros em falta' }, 400)

  const GMAIL_USER = Deno.env.get('GMAIL_USER')
  const GMAIL_PASS = Deno.env.get('GMAIL_APP_PASSWORD')
  if (!GMAIL_USER || !GMAIL_PASS) return json({ error: 'Gmail não configurado' }, 500)

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  })

  const stars = (n: number) => {
    if (!n) return '—'
    return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)) + ` (${n.toFixed(1)})`
  }

  const typeColors: Record<string, { bg: string; text: string }> = {
    'tinto':     { bg: '#3d1f1f', text: '#c87878' },
    'branco':    { bg: '#3d3a1a', text: '#d4c878' },
    'rosé':      { bg: '#3d1f2a', text: '#d4788c' },
    'espumante': { bg: '#1a2a3d', text: '#78a8d4' },
    'verde':     { bg: '#1a3d1a', text: '#78c878' },
    'porto':     { bg: '#3d2a14', text: '#c8963e' },
  }
  const wineType = clamp(wine.type, 50).toLowerCase()
  const tc = typeColors[wineType] || { bg: '#2a2520', text: '#9a8f82' }

  // Sanitizar todos os campos antes de usar no HTML
  const safeName       = esc(clamp(wine.name, 200))
  const safeType       = esc(clamp(wine.type, 50))
  const safeCountry    = esc(clamp(wine.country, 100))
  const safeRegion     = esc(clamp(wine.region, 100))
  const safeNotes      = esc(clamp(wine.notes, 1000))
  const safeSenderName = esc(clamp(senderName, 100))

  const wineYear = Number.isInteger(Number(wine.year)) ? Number(wine.year) : null
  const safeYear = (wineYear && wineYear >= 1900 && wineYear <= new Date().getFullYear() + 2)
    ? String(wineYear) : ''

  const purchasePrice = typeof wine.purchasePrice === 'number' && wine.purchasePrice > 0
    ? wine.purchasePrice : null
  const personalRating = typeof wine.personalRating === 'number' && wine.personalRating > 0
    ? wine.personalRating : null
  const vivinoRating = typeof wine.vivinoRating === 'number' && wine.vivinoRating > 0
    ? wine.vivinoRating : null

  const rows: [string, string][] = []
  if (safeCountry)    rows.push(['País',           safeCountry])
  if (safeRegion)     rows.push(['Região',          safeRegion])
  if (safeYear)       rows.push(['Ano',             safeYear])
  if (purchasePrice)  rows.push(['Preço',           purchasePrice.toFixed(2).replace('.', ',') + ' €'])
  if (personalRating) rows.push(['Classificação',   stars(personalRating)])
  if (vivinoRating)   rows.push(['Rating Vivino',   vivinoRating.toFixed(1) + ' / 5'])

  const tableRows = rows.map(([label, value], i) => `
    <tr style="background:${i % 2 === 0 ? '#0d0b09' : '#111008'}">
      <td style="padding:11px 24px;color:#6a5f52;font-size:11px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;width:150px;border-bottom:1px solid #1e1b16">${label}</td>
      <td style="padding:11px 24px;color:#e8dece;font-size:14px;font-family:Arial,sans-serif;border-bottom:1px solid #1e1b16">${value}</td>
    </tr>`).join('')

  const notesBlock = safeNotes ? `
    <tr><td colspan="2" style="padding:0">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:16px 24px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#161310;border:1px solid #3a2e1a;border-radius:6px">
            <tr><td style="padding:14px 16px">
              <div style="font-size:10px;color:#6a5f52;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Notas</div>
              <div style="font-size:13px;color:#c8a050;font-family:Arial,sans-serif;line-height:1.6">${safeNotes}</div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>` : ''

  const locationLine = [safeRegion, safeCountry].filter(Boolean).join(' · ') + (safeYear ? ' · ' + safeYear : '')

  const html = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeName}</title></head>
<body style="margin:0;padding:0;background:#0d0b09">

<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0d0b09" style="background:#0d0b09;padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

  <!-- HEADER -->
  <tr><td style="background:#161310;padding:24px 28px;border-top-left-radius:10px;border-top-right-radius:10px;border:1px solid #2a2520;border-bottom:none">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div style="font-size:17px;font-weight:normal;color:#e8dece;font-family:Arial,sans-serif;letter-spacing:3px">VIDEIRAS</div>
          <div style="font-size:9px;color:#4a453f;font-family:Arial,sans-serif;letter-spacing:3px;margin-top:3px">CELLAR COLLECTION</div>
        </td>
        <td align="right">
          <div style="font-size:9px;color:#6a5f52;font-family:Arial,sans-serif;letter-spacing:2px">FICHA DE VINHO</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- GOLD LINE -->
  <tr><td height="2" style="background:#c8963e;font-size:0;line-height:0">&nbsp;</td></tr>

  <!-- WINE NAME BLOCK -->
  <tr><td style="background:#111008;padding:28px 28px 20px;border-left:1px solid #2a2520;border-right:1px solid #2a2520">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td>
        <!-- Type badge -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:14px">
          <tr><td style="background:${tc.bg};border:1px solid ${tc.text};border-radius:3px;padding:3px 10px">
            <span style="font-size:10px;color:${tc.text};font-family:Arial,sans-serif;font-weight:bold;letter-spacing:2px">${safeType.toUpperCase()}</span>
          </td></tr>
        </table>
        <!-- Name -->
        <div style="font-size:22px;font-weight:normal;color:#e8dece;font-family:Arial,sans-serif;line-height:1.25;margin-bottom:8px">${safeName}</div>
        <!-- Location + year -->
        <div style="font-size:13px;color:#6a5f52;font-family:Arial,sans-serif">${locationLine}</div>
      </td></tr>
    </table>
  </td></tr>

  <!-- DETAILS TABLE -->
  <tr><td style="border-left:1px solid #2a2520;border-right:1px solid #2a2520">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${tableRows}
      ${notesBlock}
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#161310;padding:16px 28px;text-align:center;border:1px solid #2a2520;border-top:1px solid #2a2520;border-bottom-left-radius:10px;border-bottom-right-radius:10px">
    <div style="font-size:10px;color:#3a3530;font-family:Arial,sans-serif;letter-spacing:1px">Partilhado por ${safeSenderName || esc(GMAIL_USER)} via VIDEIRAS · Cellar Collection</div>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`

  try {
    await transporter.sendMail({
      from: `"Videiras" <${GMAIL_USER}>`,
      to,
      subject: `${clamp(wine.name, 200)}${safeYear ? ' ' + safeYear : ''} · Videiras`,
      html,
    })
    return json({ ok: true })
  } catch (e: unknown) {
    return json({ error: e instanceof Error ? e.message : 'Erro ao enviar email' }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
