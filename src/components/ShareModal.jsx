import React, { useRef, useState } from 'react'
import { X, Share2, Send, Instagram } from 'lucide-react'
import { supabase, SHARE_FN_URL } from '../lib/supabase'
import { FONT, S, getTC } from '../utils/constants'
import Btn from './ui/Btn'

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

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#161310"/><rect width="32" height="32" rx="7" fill="none" stroke="#c8963e" stroke-width="1.5"/><path d="M10 7 L22 7 L19 15 Q16 18 16 18 Q16 18 13 15 Z" fill="none" stroke="#c8963e" stroke-width="1.5" stroke-linejoin="round"/><line x1="16" y1="18" x2="16" y2="24" stroke="#c8963e" stroke-width="1.5" stroke-linecap="round"/><line x1="11" y1="24" x2="21" y2="24" stroke="#c8963e" stroke-width="1.5" stroke-linecap="round"/></svg>`
  const iconImg = await new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconSvg)
  })

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#1c1915'); bg.addColorStop(1, '#0e0c0a')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  const vig = ctx.createRadialGradient(W/2, H/2, W*0.25, W/2, H/2, W*0.8)
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#c8963e'; ctx.fillRect(0, 0, W, 5)

  ctx.strokeStyle = 'rgba(200,150,62,0.18)'; ctx.lineWidth = 1.5
  const CA = 36, CO = PAD
  ;[[CO,CO+CA,CO,CO,CO+CA,CO],[W-CO-CA,CO,W-CO,CO,W-CO,CO+CA],
    [CO,H-CO-CA,CO,H-CO,CO+CA,H-CO],[W-CO-CA,H-CO,W-CO,H-CO,W-CO,H-CO-CA]
  ].forEach(([x1,y1,xm,ym,x2,y2]) => { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(xm,ym); ctx.lineTo(x2,y2); ctx.stroke() })

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

  if (wine.photo) {
    await new Promise(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
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
    const tc = getTC(wine.type)
    const PW = 290, PH = 360, px = (W - PW) / 2
    ctx.save()
    ctx.beginPath(); ctx.roundRect(px, y, PW, PH, 12); ctx.clip()
    ctx.fillStyle = tc.bg; ctx.fillRect(px, y, PW, PH)
    const glow = ctx.createRadialGradient(W/2, y + PH*0.45, 10, W/2, y + PH*0.45, PW*0.55)
    glow.addColorStop(0, tc.fg + '28'); glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow; ctx.fillRect(px, y, PW, PH)
    ctx.restore()
    ctx.strokeStyle = tc.fg + '40'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(px, y, PW, PH, 12); ctx.stroke()
    const GS = 130, GX = (W - GS) / 2, GY = y + (PH - GS) / 2 - 10
    const sc = GS / 32
    ctx.save(); ctx.translate(GX, GY); ctx.scale(sc, sc)
    ctx.strokeStyle = tc.fg + 'cc'; ctx.lineWidth = 1.5 / sc; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(10,7); ctx.lineTo(22,7); ctx.lineTo(19,15)
    ctx.quadraticCurveTo(16,18,16,18); ctx.quadraticCurveTo(16,18,13,15); ctx.closePath(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(16,18); ctx.lineTo(16,24); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(11,24); ctx.lineTo(21,24); ctx.stroke()
    ctx.restore()
    y += PH + 44
  }

  const tc = getTC(wine.type)
  if (wine.type) {
    ctx.font = '600 19px Outfit, system-ui, sans-serif'
    const tw = ctx.measureText(wine.type.toUpperCase()).width + 32
    ctx.fillStyle = tc.bg; fillRRect((W-tw)/2, y, tw, 32, 16)
    ctx.fillStyle = tc.fg; ctx.textAlign = 'center'
    ctx.fillText(wine.type.toUpperCase(), W/2, y + 22)
    y += 32 + 90
  }

  const nLen = wine.name.length
  const nSize = nLen > 28 ? 48 : nLen > 18 ? 58 : 68
  ctx.font = `300 ${nSize}px Outfit, system-ui, sans-serif`
  ctx.fillStyle = '#e8dece'; ctx.textAlign = 'center'
  y += drawWrap(wine.name, W/2, y, W - PAD*2.5, nSize*1.22, 2) - 8

  const sub = [wine.year && String(wine.year), [wine.region, wine.country].filter(Boolean).join(', ')].filter(Boolean).join('  ·  ')
  if (sub) {
    ctx.font = '300 26px Outfit, system-ui, sans-serif'; ctx.fillStyle = '#c8b89a'
    ctx.fillText(sub, W/2, y); y += 44
  }

  if (tastingNotes && tastingNotes.trim()) {
    y += 4
    ctx.font = 'italic 300 23px Outfit, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(200,150,62,0.55)'
    y += drawWrap(`"${tastingNotes.trim()}"`, W/2, y, W - PAD*2.5, 34, 3) + 10
  }

  y += 8
  ctx.strokeStyle = 'rgba(200,150,62,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD*2, y); ctx.lineTo(W-PAD*2, y); ctx.stroke()
  y += 48

  if (wine.personalRating) {
    ctx.font = '400 34px Outfit, system-ui, sans-serif'; ctx.textAlign = 'left'
    const starW = ctx.measureText('★').width
    const sw = starW + 10
    const sx = (W - (5*sw - 10)) / 2
    for (let i = 0; i < 5; i++) {
      const x = sx + i*sw
      const full = wine.personalRating >= i + 1
      const half = !full && wine.personalRating >= i + 0.5
      ctx.fillStyle = '#252018'; ctx.fillText('★', x, y)
      if (full) { ctx.fillStyle = '#d4a843'; ctx.fillText('★', x, y) }
      else if (half) {
        ctx.save(); ctx.beginPath(); ctx.rect(x, y - 40, starW / 2, 48); ctx.clip()
        ctx.fillStyle = '#d4a843'; ctx.fillText('★', x, y); ctx.restore()
      }
    }
    ctx.textAlign = 'center'
  }

  ctx.fillStyle = '#c8963e'; ctx.fillRect(0, H-5, W, 5)
  ctx.font = '400 15px Outfit, system-ui, sans-serif'
  ctx.fillStyle = 'rgba(232,220,206,0.7)'; ctx.textAlign = 'center'
  ctx.fillText('© Videiras Cellar Collection', W/2, H - PAD + 14)

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${wine.name.replace(/[^a-z0-9]/gi,'_').toLowerCase()}_instagram.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

export default function ShareModal({ wine, session, onClose }) {
  const bdRef = useRef(false)
  const [email,        setEmail]        = useState('')
  const [sending,      setSending]      = useState(false)
  const [msg,          setMsg]          = useState('')
  const [genLoading,   setGenLoading]   = useState(false)
  const [tastingNotes, setTastingNotes] = useState('')

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
    <div
      onMouseDown={e => { bdRef.current = e.target === e.currentTarget }}
      onClick={e => { if (bdRef.current && e.target === e.currentTarget) onClose() }}
      style={{
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
            style={{ ...S.inp, width: '100%' }} type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder="exemplo@email.com" autoFocus
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
              value={tastingNotes} onChange={e => setTastingNotes(e.target.value)}
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
