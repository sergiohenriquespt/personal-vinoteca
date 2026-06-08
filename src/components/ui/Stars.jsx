import React, { useState } from 'react'

export default function Stars({ value = 0, onChange, size = 14 }) {
  const [hov, setHov] = useState(null)
  const v = hov ?? value
  const handleMove = (e, s) => {
    if (!onChange) return
    const r = e.currentTarget.getBoundingClientRect()
    setHov((e.clientX - r.left) < r.width / 2 ? s - 0.5 : s)
  }
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => {
        const full = v >= s
        const half = !full && v >= s - 0.5
        return (
          <span key={s} style={{ position: 'relative', fontSize: size, lineHeight: 1, cursor: onChange ? 'pointer' : 'default', display: 'inline-block' }}
            onMouseMove={e => handleMove(e, s)}
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
