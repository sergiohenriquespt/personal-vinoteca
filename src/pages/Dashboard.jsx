import React from 'react'
import { FONT, S, PIE_PALETTE, getTC } from '../utils/constants'
import { fmt, fmtInt, totalV } from '../utils/format'
import Stars from '../components/ui/Stars'
import Badge from '../components/ui/Badge'
import WineThumb from '../components/ui/WineThumb'

function PieChart({ data, total }) {
  if (!data.length || total === 0) return null
  const cx = 90, cy = 90, R = 72, r = 46
  let ang = -Math.PI / 2

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
          <path key={i} d={s.path} fill={s.color} opacity={0.82}><title>{s.label}: {s.value} ({s.pct}%)</title></path>
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

export default function Dashboard({ wines, entries, consumptions, isMobile }) {
  const inStock       = wines.filter(w => w.quantity > 0)
  const totalBottles  = wines.reduce((s, w) => s + w.quantity, 0)
  const totalValue    = inStock.reduce((s, w) => s + totalV(w), 0)
  const totalConsumed = consumptions.reduce((s, c) => s + c.quantity, 0)

  const byTypeStock = inStock.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0 }
    acc[w.type].bottles += w.quantity
    return acc
  }, {})
  const maxBottles = Math.max(...Object.values(byTypeStock).map(v => v.bottles), 1)

  const byCountryStock = inStock.reduce((acc, w) => { if (!acc[w.country]) acc[w.country] = { count: 0 }; acc[w.country].count++; return acc }, {})
  const byCountryAll   = wines.reduce((acc, w) => { if (!acc[w.country]) acc[w.country] = { count: 0 }; acc[w.country].count++; return acc }, {})

  const topWines = [...inStock].sort((a, b) => totalV(b) - totalV(a)).slice(0, 5)

  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisYearKey  = String(now.getFullYear())
  const spentThisMonth = entries.filter(e => e.date.startsWith(thisMonthKey)).reduce((s, e) => s + e.price * e.quantity, 0)
  const spentThisYear  = entries.filter(e => e.date.startsWith(thisYearKey)).reduce((s, e) => s + e.price * e.quantity, 0)
  const spentTotal     = entries.reduce((s, e) => s + e.price * e.quantity, 0)
  const last12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '')
    const spent = entries.filter(e => e.date.startsWith(key)).reduce((s, e) => s + e.price * e.quantity, 0)
    return { key, label, spent, isCurrent: key === thisMonthKey }
  })
  const maxMonthSpend = Math.max(...last12.map(m => m.spent), 1)

  const byRegion = consumptions.reduce((acc, c) => {
    const w = wines.find(x => x.id === c.wineId)
    if (!w) return acc
    const key = w.region || w.country || 'Desconhecida'
    if (!acc[key]) acc[key] = { count: 0, bottles: 0, avgRating: 0, ratings: [] }
    acc[key].count++; acc[key].bottles += c.quantity
    if (c.rating) acc[key].ratings.push(c.rating)
    return acc
  }, {})
  Object.values(byRegion).forEach(d => {
    d.avgRating = d.ratings.length ? (d.ratings.reduce((s, r) => s + r, 0) / d.ratings.length) : 0
  })
  const topRegions = Object.entries(byRegion).sort((a, b) => b[1].bottles - a[1].bottles).slice(0, 8)
  const maxRegionBottles = topRegions.length ? topRegions[0][1].bottles : 1

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { l: 'Referências em stock', v: fmtInt(inStock.length),    c: '#e8dece' },
          { l: 'Garrafas em stock',    v: fmtInt(totalBottles),       c: '#e8dece' },
          { l: 'Valor Total',          v: fmt(totalValue),            c: '#c8963e' },
          { l: 'Consumidas',           v: fmtInt(totalConsumed),      c: '#9a8f82' },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ ...S.stat, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 300, color: c, fontFamily: FONT, letterSpacing: '-0.03em' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Resumo de gastos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[{ l: 'Este mês', v: fmt(spentThisMonth) }, { l: thisYearKey, v: fmt(spentThisYear) }, { l: 'Histórico', v: fmt(spentTotal) }].map(({ l, v }) => (
            <div key={l} style={{ background: '#0d0b09', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 300, color: '#c8963e', fontFamily: FONT, letterSpacing: '-0.02em' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64 }}>
          {last12.map(({ key, label, spent, isCurrent }) => (
            <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <div title={fmt(spent)} style={{ width: '100%', borderRadius: '2px 2px 0 0', background: isCurrent ? '#c8963e' : 'rgba(200,150,62,0.25)', height: spent > 0 ? `${Math.max((spent / maxMonthSpend) * 52, 3)}px` : '2px', transition: 'height 0.3s ease' }} />
              <div style={{ fontSize: 8.5, color: isCurrent ? '#c8963e' : '#3a3530', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

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
          <PieChart total={inStock.length} data={Object.entries(byCountryStock).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))} />
        </div>
      </div>

      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Por país — todas as referências ({wines.length})</h3>
        <PieChart total={wines.length} data={Object.entries(byCountryAll).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))} />
      </div>

      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Mais consumidos por região</h3>
        {topRegions.length === 0
          ? <p style={{ fontSize: 13, color: '#3a3530' }}>Sem consumos registados.</p>
          : topRegions.map(([region, d]) => (
            <div key={region} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: '#e8dece', fontWeight: 400 }}>{region}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {d.avgRating > 0 && <span style={{ fontSize: 11, color: '#c8963e' }}>{'★'.repeat(Math.round(d.avgRating))} {d.avgRating.toFixed(1)}</span>}
                  <span style={{ fontSize: 12, color: '#9a8f82', minWidth: 60, textAlign: 'right' }}>{fmtInt(d.bottles)} {d.bottles === 1 ? 'garrafa' : 'garrafas'}</span>
                </div>
              </div>
              <div style={{ height: 3, background: '#26221c', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(d.bottles / maxRegionBottles) * 100}%`, background: '#c8963e', opacity: 0.5, borderRadius: 2, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
      </div>

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
