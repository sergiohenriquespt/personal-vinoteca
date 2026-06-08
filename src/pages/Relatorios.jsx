import React from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)
import { TrendingUp, FileText, Download } from 'lucide-react'
import { FONT, S, TYPE_COLORS } from '../utils/constants'
import { fmt, fmtInt, pdfN, pdfInt, pdfFmt } from '../utils/format'
import Badge from '../components/ui/Badge'

// ─── PDF HELPERS ──────────────────────────────────────────────────────────────
const pdfFooter = (doc, W, margin) => {
  doc.setFillColor(22, 19, 16); doc.rect(0, 283, W, 14, 'F')
  doc.setDrawColor(50, 44, 38); doc.setLineWidth(0.2); doc.line(margin, 283.5, W - margin, 283.5)
  doc.setFontSize(6); doc.setTextColor(60, 52, 48)
  doc.text('Videiras · Cellar Collection · gerado em ' + new Date().toLocaleString('pt-PT'), W/2, 289.5, { align: 'center' })
}
const pdfAddPageNumbers = (doc, W, margin) => {
  const total = doc.internal.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFontSize(6); doc.setTextColor(100, 90, 75)
    doc.text('Pág. ' + p + ' / ' + total, W - margin, 289.5, { align: 'right' })
  }
}
const pdfDrawHeader = (doc, W, margin, title) => {
  doc.setFillColor(13, 11, 9); doc.rect(0, 0, W, 297, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  doc.setTextColor(232, 222, 206); doc.setCharSpace(2)
  doc.text('VIDEIRAS', margin, 20)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
  doc.setTextColor(90, 80, 65); doc.setCharSpace(1.5)
  doc.text('CELLAR COLLECTION', margin, 25.5); doc.setCharSpace(0)
  doc.setFontSize(7.5); doc.setTextColor(200, 150, 62)
  doc.text(title, W - margin, 20, { align: 'right' })
  doc.setFontSize(7); doc.setTextColor(90, 80, 65)
  doc.text(new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }), W - margin, 25.5, { align: 'right' })
  doc.setDrawColor(200, 150, 62); doc.setLineWidth(0.2)
  doc.line(margin, 29, W - margin, 29)
}
const pdfAutoTableOptions = (margin) => ({
  styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 3, fillColor: [13, 11, 9], textColor: [180, 165, 145], lineColor: [35, 30, 24], lineWidth: 0.2 },
  headStyles: { fillColor: [22, 19, 16], textColor: [200, 150, 62], fontSize: 6.5, fontStyle: 'bold', halign: 'left', cellPadding: { top: 4, bottom: 4, left: 3, right: 3 } },
  footStyles: { fillColor: [22, 19, 16], textColor: [200, 150, 62], fontStyle: 'bold', fontSize: 7.5 },
  alternateRowStyles: { fillColor: [18, 15, 12] },
  columnStyles: { 0: { cellWidth: 52 }, 1: { cellWidth: 18 }, 2: { cellWidth: 36 }, 3: { cellWidth: 12, halign: 'center' }, 4: { cellWidth: 10, halign: 'center' }, 5: { cellWidth: 22, halign: 'right' }, 6: { cellWidth: 22, halign: 'right' } },
  margin: { left: margin, right: margin },
})

// ─── STOCK REPORT ─────────────────────────────────────────────────────────────
function StockReport({ wines, isMobile }) {
  const inStock     = wines.filter(w => w.quantity > 0).sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const totalBottles = inStock.reduce((s, w) => s + w.quantity, 0)
  const totalValue   = inStock.reduce((s, w) => s + w.purchasePrice * w.quantity, 0)
  const totalRefs    = inStock.length
  const byType = inStock.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0, value: 0, refs: 0 }
    acc[w.type].bottles += w.quantity; acc[w.type].value += w.purchasePrice * w.quantity; acc[w.type].refs++
    return acc
  }, {})

  const exportXLS = () => {
    const rows = [
      ['Stock da Adega — ' + new Date().toLocaleDateString('pt-PT')], [],
      ['Nome','Tipo','País','Região','Ano','Produtor','Enólogo','Castas','Álcool (%)','Formato (ml)','Qtd','Preço Compra (€)','Preço Mercado (€)','Valor Total (€)','Rating Pessoal','Rating Vivino','Notas'],
      ...inStock.map(w => [w.name, w.type, w.country, w.region||'', w.year||'', w.producer||'', w.winemaker||'', w.castas||'', w.alcoholContent!==''&&w.alcoholContent!=null?Number(w.alcoholContent):'', w.bottleSize||750, w.quantity, Number(w.purchasePrice.toFixed(2)), w.marketPrice!=null?Number(w.marketPrice.toFixed(2)):'', Number((w.purchasePrice*w.quantity).toFixed(2)), w.personalRating||'', w.vivinoRating!=null?w.vivinoRating:'', w.notes||'']),
      [], ['TOTAL','','','','','','','','','',totalBottles,'','',Number(totalValue.toFixed(2)),'','',''],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:40},{wch:12},{wch:12},{wch:18},{wch:6},{wch:22},{wch:22},{wch:22},{wch:10},{wch:12},{wch:6},{wch:16},{wch:16},{wch:14},{wch:14},{wch:14},{wch:40}]
    ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:16}}]
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Stock')
    XLSX.writeFile(wb, `videiras-stock-${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210, margin = 18
    pdfDrawHeader(doc, W, margin, 'RELATÓRIO DE STOCK')
    const kpis = [{label:'REFERÊNCIAS',value:pdfInt(totalRefs)},{label:'GARRAFAS',value:pdfInt(totalBottles)},{label:'VALOR TOTAL',value:pdfFmt(totalValue)}]
    const kpiW = (W - margin*2 - 8) / 3
    kpis.forEach((k, i) => {
      const x = margin + i * (kpiW + 4)
      doc.setFillColor(22,19,16); doc.setDrawColor(50,44,38); doc.setLineWidth(0.3)
      doc.roundedRect(x, 33, kpiW, 16, 2, 2, 'FD')
      doc.setFontSize(6); doc.setTextColor(100,90,75); doc.text(k.label, x+kpiW/2, 38.5, {align:'center'})
      doc.setFontSize(10); doc.setTextColor(232,222,206); doc.setFont('helvetica','bold')
      doc.text(k.value, x+kpiW/2, 44.5, {align:'center'}); doc.setFont('helvetica','normal')
    })
    let yy = 55; doc.setFontSize(6.5); doc.setTextColor(200,150,62); doc.text('POR TIPO', margin, yy); yy += 4
    Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).forEach(([type, d]) => {
      doc.setFillColor(22,19,16); doc.roundedRect(margin, yy, W-margin*2, 6.5, 1, 1, 'F')
      doc.setTextColor(200,180,150); doc.setFontSize(7); doc.text(type, margin+4, yy+4.3)
      doc.setTextColor(150,140,120); doc.text(pdfInt(d.refs)+' ref · '+pdfInt(d.bottles)+' garrafas', margin+45, yy+4.3)
      doc.setTextColor(200,150,62); doc.text(pdfFmt(d.value), W-margin-4, yy+4.3, {align:'right'}); yy += 8
    })
    doc.autoTable({ ...pdfAutoTableOptions(margin), startY: yy + 4,
      head: [['Nome','Tipo','País / Região','Ano','Qtd','Preço','Total']],
      body: inStock.map(w => [w.name,w.type,[w.region,w.country].filter(Boolean).join(' · '),w.year||'—',w.quantity,w.purchasePrice>0?pdfFmt(w.purchasePrice):'—',(w.purchasePrice*w.quantity)>0?pdfFmt(w.purchasePrice*w.quantity):'—']),
      foot: [['','','','',pdfInt(totalBottles),'',pdfFmt(totalValue)]],
      willDrawPage: (data) => { if (data.pageNumber > 1) { doc.setFillColor(13,11,9); doc.rect(0,0,W,297,'F') } },
      didDrawPage: () => pdfFooter(doc, W, margin),
    })
    pdfAddPageNumbers(doc, W, margin)
    doc.save(`videiras-stock-${new Date().toISOString().slice(0,10)}.pdf`)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#e8dece' }}>Stock da Adega</div>
          <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportXLS} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#6a9f6a',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(106,159,106,0.1)';e.currentTarget.style.borderColor='rgba(106,159,106,0.3)'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> XLS</button>
          <button onClick={exportPDF} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#c8963e',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,150,62,0.1)';e.currentTarget.style.borderColor='rgba(200,150,62,0.3)'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> PDF</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{label:'Referências',value:fmtInt(totalRefs),color:'#e8dece'},{label:'Garrafas',value:fmtInt(totalBottles),color:'#e8dece'},{label:'Valor total',value:fmt(totalValue),color:'#c8963e'}].map(k => (
          <div key={k.label} style={{ ...S.stat, padding: isMobile ? '14px 12px' : '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 300, color: k.color, fontFamily: FONT }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 14 }}>Por tipo</div>
        {Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
          const pct = Math.round((d.bottles / totalBottles) * 100)
          const tc = TYPE_COLORS[type] || { fg: '#9a8f82', bg: '#1a1814' }
          return (
            <div key={type} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: tc.fg, background: tc.bg, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>{type.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: '#6a5f52' }}>{fmtInt(d.refs)} ref · {fmtInt(d.bottles)} gar.</span>
                </div>
                <span style={{ fontSize: 12, color: '#c8963e' }}>{fmt(d.value)}</span>
              </div>
              <div style={{ height: 3, background: '#1a1814', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: tc.fg, opacity: 0.6, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ ...S.stat, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Nome','Tipo',!isMobile&&'País / Região',!isMobile&&'Ano','Qtd',!isMobile&&'Preço','Total'].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h==='Qtd'||h==='Preço'||h==='Total'?'right':'left', fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inStock.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i%2===1?'rgba(255,255,255,0.01)':'transparent' }}>
                  <td style={{ padding: '9px 12px', color: '#e8dece', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</td>
                  <td style={{ padding: '9px 12px' }}><Badge type={w.type} /></td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', fontSize: 11 }}>{[w.region, w.country].filter(Boolean).join(' · ')}</td>}
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'center' }}>{w.year || '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#e8dece', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.quantity}</td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.purchasePrice > 0 ? fmt(w.purchasePrice) : '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#c8963e', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{(w.purchasePrice*w.quantity) > 0 ? fmt(w.purchasePrice*w.quantity) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <td colSpan={isMobile?2:4} style={{ padding: '10px 12px', fontSize: 9, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</td>
                <td style={{ padding: '10px 12px', color: '#e8dece', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmtInt(totalBottles)}</td>
                {!isMobile && <td></td>}
                <td style={{ padding: '10px 12px', color: '#c8963e', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── CATÁLOGO COMPLETO ────────────────────────────────────────────────────────
function CatalogoReport({ wines, isMobile }) {
  const allWines    = [...wines].sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const totalBottles = allWines.reduce((s, w) => s + w.quantity, 0)
  const totalValue   = allWines.reduce((s, w) => s + w.purchasePrice * w.quantity, 0)
  const totalRefs    = allWines.length
  const byType = allWines.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { bottles: 0, value: 0, refs: 0 }
    acc[w.type].bottles += w.quantity; acc[w.type].value += w.purchasePrice * w.quantity; acc[w.type].refs++
    return acc
  }, {})
  const maxTypeBottles = Math.max(...Object.values(byType).map(d => d.bottles), 1)

  const exportXLS = () => {
    const rows = [
      ['Catálogo Completo — ' + new Date().toLocaleDateString('pt-PT')], [],
      ['Nome','Tipo','País','Região','Ano','Produtor','Enólogo','Castas','Álcool (%)','Formato (ml)','Qtd','Preço Compra (€)','Preço Mercado (€)','Valor Total (€)','Rating Pessoal','Rating Vivino','Notas'],
      ...allWines.map(w => [w.name, w.type, w.country, w.region||'', w.year||'', w.producer||'', w.winemaker||'', w.castas||'', w.alcoholContent!==''&&w.alcoholContent!=null?Number(w.alcoholContent):'', w.bottleSize||750, w.quantity, Number(w.purchasePrice.toFixed(2)), w.marketPrice!=null?Number(w.marketPrice.toFixed(2)):'', Number((w.purchasePrice*w.quantity).toFixed(2)), w.personalRating||'', w.vivinoRating!=null?w.vivinoRating:'', w.notes||'']),
      [], ['TOTAL','','','','','','','','','',totalBottles,'','',Number(totalValue.toFixed(2)),'','',''],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:40},{wch:12},{wch:12},{wch:18},{wch:6},{wch:22},{wch:22},{wch:22},{wch:10},{wch:12},{wch:6},{wch:16},{wch:16},{wch:14},{wch:14},{wch:14},{wch:40}]
    ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:16}}]
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Catálogo')
    XLSX.writeFile(wb, `videiras-catalogo-${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210, margin = 18
    pdfDrawHeader(doc, W, margin, 'CATÁLOGO COMPLETO')
    const kpis = [{label:'REFERÊNCIAS',value:pdfInt(totalRefs)},{label:'GARRAFAS',value:pdfInt(totalBottles)},{label:'VALOR TOTAL',value:pdfFmt(totalValue)}]
    const kpiW = (W - margin*2 - 8) / 3
    kpis.forEach((k, i) => {
      const x = margin + i * (kpiW + 4)
      doc.setFillColor(22,19,16); doc.setDrawColor(50,44,38); doc.setLineWidth(0.3)
      doc.roundedRect(x, 33, kpiW, 16, 2, 2, 'FD')
      doc.setFontSize(6); doc.setTextColor(100,90,75); doc.text(k.label, x+kpiW/2, 38.5, {align:'center'})
      doc.setFontSize(10); doc.setTextColor(232,222,206); doc.setFont('helvetica','bold')
      doc.text(k.value, x+kpiW/2, 44.5, {align:'center'}); doc.setFont('helvetica','normal')
    })
    let yy = 55; doc.setFontSize(6.5); doc.setTextColor(200,150,62); doc.text('POR TIPO', margin, yy); yy += 4
    Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).forEach(([type, d]) => {
      doc.setFillColor(22,19,16); doc.roundedRect(margin, yy, W-margin*2, 6.5, 1, 1, 'F')
      doc.setTextColor(200,180,150); doc.setFontSize(7); doc.text(type, margin+4, yy+4.3)
      doc.setTextColor(150,140,120); doc.text(pdfInt(d.refs)+' ref · '+pdfInt(d.bottles)+' garrafas', margin+45, yy+4.3)
      doc.setTextColor(200,150,62); doc.text(pdfFmt(d.value), W-margin-4, yy+4.3, {align:'right'}); yy += 8
    })
    doc.autoTable({ ...pdfAutoTableOptions(margin), startY: yy + 4,
      head: [['Nome','Tipo','País / Região','Ano','Qtd','Preço','Total']],
      body: allWines.map(w => [w.name,w.type,[w.region,w.country].filter(Boolean).join(' · '),w.year||'—',w.quantity>0?w.quantity:'—',w.purchasePrice>0?pdfFmt(w.purchasePrice):'—',(w.purchasePrice*w.quantity)>0?pdfFmt(w.purchasePrice*w.quantity):'—']),
      foot: [['','','','',pdfInt(totalBottles),'',pdfFmt(totalValue)]],
      willDrawPage: (data) => { if (data.pageNumber > 1) { doc.setFillColor(13,11,9); doc.rect(0,0,W,297,'F') } },
      didDrawPage: () => pdfFooter(doc, W, margin),
    })
    pdfAddPageNumbers(doc, W, margin)
    doc.save(`videiras-catalogo-${new Date().toISOString().slice(0,10)}.pdf`)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#e8dece' }}>Catálogo Completo</div>
          <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportXLS} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#6a9f6a',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(106,159,106,0.1)';e.currentTarget.style.borderColor='rgba(106,159,106,0.3)'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> XLS</button>
          <button onClick={exportPDF} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:6,border:'1px solid rgba(255,255,255,0.08)',background:'none',color:'#c8963e',cursor:'pointer',fontFamily:FONT,fontSize:11,transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='rgba(200,150,62,0.1)';e.currentTarget.style.borderColor='rgba(200,150,62,0.3)'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}><Download size={12}/> PDF</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[{label:'Referências',value:fmtInt(totalRefs),color:'#e8dece'},{label:'Garrafas',value:fmtInt(totalBottles),color:'#e8dece'},{label:'Valor total',value:fmt(totalValue),color:'#c8963e'}].map(k => (
          <div key={k.label} style={{ ...S.stat, padding: isMobile ? '14px 12px' : '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 300, color: k.color, fontFamily: FONT }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.stat, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 14 }}>Por tipo</div>
        {Object.entries(byType).sort((a,b) => b[1].bottles - a[1].bottles).map(([type, d]) => {
          const pct = Math.round((d.bottles / maxTypeBottles) * 100)
          const tc = TYPE_COLORS[type] || { fg: '#9a8f82', bg: '#1a1814' }
          return (
            <div key={type} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: tc.fg, background: tc.bg, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>{type.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: '#6a5f52' }}>{fmtInt(d.refs)} ref · {fmtInt(d.bottles)} gar.</span>
                </div>
                <span style={{ fontSize: 12, color: '#c8963e' }}>{fmt(d.value)}</span>
              </div>
              <div style={{ height: 3, background: '#1a1814', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: tc.fg, opacity: 0.6, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ ...S.stat, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Nome','Tipo',!isMobile&&'País / Região',!isMobile&&'Ano','Qtd',!isMobile&&'Preço','Total'].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: h==='Qtd'||h==='Preço'||h==='Total'?'right':'left', fontSize: 9, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allWines.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i%2===1?'rgba(255,255,255,0.01)':'transparent', opacity: w.quantity===0?0.45:1 }}>
                  <td style={{ padding: '9px 12px', color: '#e8dece', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</td>
                  <td style={{ padding: '9px 12px' }}><Badge type={w.type} /></td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', fontSize: 11 }}>{[w.region, w.country].filter(Boolean).join(' · ')}</td>}
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'center' }}>{w.year || '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#e8dece', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.quantity > 0 ? w.quantity : '—'}</td>
                  {!isMobile && <td style={{ padding: '9px 12px', color: '#6a5f52', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{w.purchasePrice > 0 ? fmt(w.purchasePrice) : '—'}</td>}
                  <td style={{ padding: '9px 12px', color: '#c8963e', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{(w.purchasePrice*w.quantity) > 0 ? fmt(w.purchasePrice*w.quantity) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <td colSpan={isMobile?2:4} style={{ padding: '10px 12px', fontSize: 9, color: '#4a453f', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</td>
                <td style={{ padding: '10px 12px', color: '#e8dece', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmtInt(totalBottles)}</td>
                {!isMobile && <td></td>}
                <td style={{ padding: '10px 12px', color: '#c8963e', textAlign: 'right', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── RELATÓRIOS PANEL ─────────────────────────────────────────────────────────
export default function Relatorios({ wines, consumptions, entries, isMobile }) {
  const [activeReport, setActiveReport] = React.useState('stock')
  const REPORTS = [
    { id: 'stock',    label: 'Stock da Adega',   icon: <TrendingUp size={13} /> },
    { id: 'catalogo', label: 'Catálogo Completo', icon: <FileText size={13} /> },
  ]
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {REPORTS.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 6, border: `1px solid ${activeReport === r.id ? 'rgba(200,150,62,0.4)' : 'rgba(255,255,255,0.07)'}`,
            background: activeReport === r.id ? 'rgba(200,150,62,0.1)' : 'transparent',
            color: activeReport === r.id ? '#c8963e' : '#4a453f', cursor: 'pointer',
            fontFamily: FONT, fontSize: 12, transition: 'all 0.15s',
          }}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>
      {activeReport === 'stock'    && <StockReport    wines={wines} consumptions={consumptions} isMobile={isMobile} />}
      {activeReport === 'catalogo' && <CatalogoReport wines={wines} consumptions={consumptions} isMobile={isMobile} />}
    </div>
  )
}
