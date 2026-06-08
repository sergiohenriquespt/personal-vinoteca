import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function PhotoLightbox({ src: imgSrc, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div onClick={e => { e.stopPropagation(); onClose() }} style={{
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
      <button onClick={e => { e.stopPropagation(); onClose() }} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#e8dece', cursor: 'pointer',
      }}><X size={16} /></button>
    </div>
  )
}
