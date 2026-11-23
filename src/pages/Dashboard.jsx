import React from 'react'
import { FONT, PIE_PALETTE, getTC } from '../utils/constants'
import { fmt, fmtInt, totalV } from '../utils/format'
import WineThumb from '../components/ui/WineThumb'
import CountUp from '../components/ui/CountUp'

function PieChart({ data, total }) {
  if (!data.length || total === 0) return null
  const cx = 90, cy = 90, R = 72, r = 46
  let ang = -Math.PI / 2

  if (data.length === 1) {
    const color = PIE_PALETTE[0]
    return (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 180 180" style={{ width: 160, flexShrink: 0 }}>
          <circle cx={cx} cy={cy} r={R} fill={color} opacity={0.82} />
          <circle cx={cx} cy={cy} r={r - 2} fill="#1e1b16" />
          <text x={cx} y={cy - 5} textAnchor="middle" fill="#e8dece" fontSize="20" fontWeight="300" fontFamily="Outfit,sans-serif">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#9a8f82" fontSize="8.5" fontFamily="Outfit,sans-serif" letterSpacing="0.1">REF.</text>
        </svg>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '10px minmax(0, 1fr) 40px 44px', alignItems: 'center', columnGap: 10, marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color, opacity: 0.82 }} />
            <span style={{ fontSize: 15, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data[0].label}</span>
            <span style={{ fontSize: 14, color: '#9a8f82', textAlign: 'right' }}>{data[0].value}</span>
            <span style={{ fontSize: 13, color: '#9a8f82', textAlign: 'right' }}>100%</span>
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
      <svg viewBox="0 0 180 180" style={{ width: 160, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.82}><title>{s.label}: {s.value} ({s.pct}%)</title></path>
        ))}
        <circle cx={cx} cy={cy} r={r - 2} fill="#1e1b16" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#e8dece" fontSize="20" fontWeight="300" fontFamily="Outfit,sans-serif">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#9a8f82" fontSize="8.5" fontFamily="Outfit,sans-serif" letterSpacing="0.1">REF.</text>
      </svg>
      <div style={{ flex: 1, minWidth: 180 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px minmax(0, 1fr) 40px 44px', alignItems: 'center', columnGap: 10, marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, opacity: 0.82 }} />
            <span style={{ fontSize: 15, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
            <span style={{ fontSize: 14, color: '#9a8f82', textAlign: 'right' }}>{s.value}</span>
            <span style={{ fontSize: 13, color: '#9a8f82', textAlign: 'right' }}>{s.pct}%</span>
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
  const withMarketPrice = inStock.filter(w => w.marketPrice != null)
  const marketValue   = withMarketPrice.length ? withMarketPrice.reduce((s, w) => s + w.marketPrice * w.quantity, 0) : null

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

  const card = { background: '#1e1b16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: isMobile ? 20 : 24 }
  const h3 = { margin: '0 0 18px', fontSize: 18, fontWeight: 500, color: '#e8dece', fontFamily: FONT }
  const bar = (pct, color, opacity = 0.7) => (
    <div style={{ height: 8, background: '#2a251f', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, opacity, borderRadius: 4, transition: 'width 0.4s ease' }} />
    </div>
  )

  return (
    <div style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16 }}>
        <div style={{ ...card, gridColumn: isMobile ? '1 / -1' : 'span 2', gridRow: isMobile ? undefined : 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, padding: isMobile ? 24 : 28 }}>
          <div style={{ fontSize: 14, color: '#9a8f82', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Garrafas em stock</div>
          <div style={{ fontSize: isMobile ? 64 : 88, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#e8dece', fontFamily: FONT }}><CountUp from={0} to={totalBottles} duration={1.2} separator="." startWhen={totalBottles > 0} /></div>
          <div style={{ fontSize: isMobile ? 16 : 17, color: '#9a8f82' }}>em <span style={{ color: '#e8dece' }}>{fmtInt(inStock.length)}</span> referências</div>
        </div>
        {[
          { l: 'Valor total',      v: fmt(totalValue),        c: '#c8963e' },
          { l: 'Valor de mercado', v: fmt(marketValue),       c: '#c8963e' },
          { l: 'Consumidas',       v: fmtInt(totalConsumed),  c: '#e8dece' },
          { l: 'Gasto este mês',   v: fmt(spentThisMonth),    c: '#e8dece' },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ ...card, borderRadius: 20, padding: isMobile ? 18 : 20 }}>
            <div style={{ fontSize: isMobile ? 14 : 15, color: '#9a8f82' }}>{l}</div>
            <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 300, color: c, marginTop: 6, letterSpacing: '-0.02em', fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <h3 style={h3}>Gastos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 20 }}>
            {[{ l: 'Este mês', v: spentThisMonth }, { l: thisYearKey, v: spentThisYear }, { l: 'Histórico', v: spentTotal }].map(({ l, v }) => (
              <div key={l} style={{ background: '#161310', borderRadius: 12, padding: isMobile ? '10px 10px' : '12px 14px', minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#9a8f82' }}>{l}</div>
                <div style={{ fontSize: isMobile ? 15 : 19, fontWeight: isMobile ? 400 : 300, color: '#c8963e', marginTop: 4, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontFamily: FONT }}>{fmt(v)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
            {last12.map(({ key, label, spent, isCurrent }) => (
              <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div title={fmt(spent)} style={{ width: '100%', borderRadius: '6px 6px 2px 2px', background: isCurrent ? '#c8963e' : 'rgba(200,150,62,0.3)', height: spent > 0 ? `${Math.max((spent / maxMonthSpend) * 105, 4)}px` : '2px', transition: 'height 0.3s ease' }} />
                <div style={{ fontSize: 12, color: isCurrent ? '#c8963e' : '#9a8f82', fontWeight: isCurrent ? 600 : 400 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <h3 style={h3}>Stock por tipo</h3>
          {Object.entries(byTypeStock).sort((a, b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
            const c = getTC(type)
            return (
              <div key={type} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 16 }}>
                  <span style={{ color: c.fg }}>{type}</span>
                  <span style={{ color: '#9a8f82' }}>{d.bottles} {d.bottles === 1 ? 'garrafa' : 'garrafas'}</span>
                </div>
                {bar((d.bottles / maxBottles) * 100, c.fg)}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <h3 style={h3}>Por país — em stock</h3>
          <PieChart total={inStock.length} data={Object.entries(byCountryStock).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))} />
        </div>
        <div style={card}>
          <h3 style={h3}>Por país — todas as referências ({wines.length})</h3>
          <PieChart total={wines.length} data={Object.entries(byCountryAll).sort((a, b) => b[1].count - a[1].count).map(([label, d]) => ({ label, value: d.count }))} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <h3 style={h3}>Mais consumidos por região</h3>
          {topRegions.length === 0
            ? <p style={{ fontSize: 16, color: '#9a8f82' }}>Sem consumos registados.</p>
            : topRegions.map(([region, d]) => (
              <div key={region} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                  <span style={{ fontSize: 16, color: '#e8dece' }}>{region}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, fontSize: 15 }}>
                    {d.avgRating > 0 && <span style={{ color: '#c8963e' }}>★ {d.avgRating.toFixed(1)}</span>}
                    <span style={{ color: '#9a8f82' }}>{fmtInt(d.bottles)} {d.bottles === 1 ? 'garrafa' : 'garrafas'}</span>
                  </div>
                </div>
                {bar((d.bottles / maxRegionBottles) * 100, '#c8963e', 0.6)}
              </div>
            ))}
        </div>
        <div style={card}>
          <h3 style={h3}>Top 5 por valor em adega</h3>
          {topWines.map((w, i) => (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 15, color: '#9a8f82', fontWeight: 600, minWidth: 24, fontFamily: FONT }}>{i + 1}</span>
              <WineThumb photo={w.photo} type={w.type} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, color: '#e8dece', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONT }}>{w.name}</div>
                <div style={{ fontSize: 14, color: '#9a8f82' }}>{w.quantity} × {fmt(w.purchasePrice)}</div>
              </div>
              <div style={{ fontSize: 17, color: '#c8963e', fontFamily: FONT, flexShrink: 0 }}>{fmt(totalV(w))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
