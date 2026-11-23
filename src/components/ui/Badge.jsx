import React from 'react'
import { FONT, getTC } from '../../utils/constants'

export default function Badge({ type }) {
  const c = getTC(type)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      borderRadius: 12, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600,
      letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: FONT, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.fg, flexShrink: 0 }} />
      {type}
    </span>
  )
}
