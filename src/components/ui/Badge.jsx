import React from 'react'
import { FONT, getTC } from '../../utils/constants'

export default function Badge({ type }) {
  const c = getTC(type)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
      borderRadius: 4, background: c.bg, color: c.fg, fontSize: 10, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.fg, flexShrink: 0 }} />
      {type}
    </span>
  )
}
