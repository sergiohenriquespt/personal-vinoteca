import React, { useState, useEffect, useRef } from 'react'
import { X, Volume2, VolumeX, Wine } from 'lucide-react'
import { FONT } from '../utils/constants'

function calcAge() {
  const born = new Date(1975, 0, 5)
  const today = new Date()
  let age = today.getFullYear() - born.getFullYear()
  const m = today.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--
  return age
}

export default function AboutModal({ onClose }) {
  const bdRef    = useRef(false)
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.35
    audio.play().catch(() => {})
    return () => { audio.pause(); audio.currentTime = 0 }
  }, [])

  return (
    <div
      onMouseDown={e => { bdRef.current = e.target === e.currentTarget }}
      onClick={e => { if (bdRef.current && e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <audio ref={audioRef} src="/videiras.mp3" loop />
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: '#161310', border: '1px solid rgba(200,150,62,0.2)', borderRadius: 16, padding: '32px 28px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', alignSelf: 'flex-end', marginTop: -16, marginRight: -12, background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', padding: 4, display: 'flex' }}><X size={16} /></button>
        <img src="/videiras.jpg" alt="Sérgio Henriques" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(200,150,62,0.35)', marginBottom: 20 }} />
        <div style={{ fontSize: 15, color: '#e8dece', fontWeight: 400, marginBottom: 4, fontFamily: FONT }}>Sérgio Henriques, {calcAge()} anos</div>
        <div style={{ fontSize: 10, color: '#c8963e', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20, fontFamily: FONT }}>o Videiras</div>
        <p style={{ fontSize: 13, color: '#9a8f82', lineHeight: 1.7, margin: 0, fontFamily: FONT }}>
          "Videiras" é uma alcunha com história: uma noite de copos na Queima das Fitas de Aveiro que terminou com o Sérgio no meio de umas vinhas. A alcunha ficou; os detalhes dessa noite ficaram estrategicamente esquecidos.
        </p>
        <p style={{ fontSize: 13, color: '#9a8f82', lineHeight: 1.7, margin: '14px 0 0', fontFamily: FONT }}>
          Décadas depois, a relação com o vinho evoluiu de acidente geográfico para paixão declarada — desenvolvida a sério durante a pandemia, na convivência com o amigo João Camões. A Bairrada é a região favorita, e esta aplicação nasceu para saber exactamente o que há em casa sem ter de abrir a garrafeira.
        </p>
        <button
          onClick={() => { const audio = audioRef.current; if (!audio) return; audio.muted = !audio.muted; setMuted(audio.muted) }}
          style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, color: muted ? '#3a3530' : '#c8963e', fontSize: 11, fontFamily: FONT, letterSpacing: '0.1em', transition: 'color 0.2s' }}>
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          {muted ? 'som desligado' : 'som ligado'}
        </button>
      </div>
    </div>
  )
}
