import React from 'react'
import { Wine } from 'lucide-react'
import { getTC } from '../../utils/constants'

export default function WineThumb({ photo, type, size = 40, onClick }) {
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
