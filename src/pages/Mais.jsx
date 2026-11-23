import React from 'react'
import { User, FileText, Settings, Wine, ChevronRight, LogOut } from 'lucide-react'
import { FONT } from '../utils/constants'

export default function Mais({ email, setView, onAbout, onLogout }) {
  const rows = [
    { icon: FileText, label: 'Relatórios',         go: () => setView('relatorios') },
    { icon: Settings, label: 'Definições',         go: () => setView('definicoes') },
    { icon: Wine,     label: 'Quem é o Videiras?', go: onAbout },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ width: 52, height: 52, borderRadius: 26, background: 'rgba(200,150,62,0.14)', color: '#c8963e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={24} /></span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: '#e8dece' }}>A minha conta</span>
          <span style={{ fontSize: 15, color: '#9a8f82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {rows.map(({ icon: Icon, label, go }, i) => (
          <button key={label} onClick={go}
            style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 64, padding: '0 16px', background: 'none', border: 'none', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', color: '#e8dece', fontFamily: FONT, fontSize: 17, textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(200,150,62,0.12)', color: '#c8963e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={20} /></span>
            <span style={{ flex: 1 }}>{label}</span>
            <ChevronRight size={20} color="#9a8f82" />
          </button>
        ))}
      </div>

      <button onClick={onLogout}
        style={{ height: 60, borderRadius: 18, border: '1px solid rgba(232,112,128,0.35)', background: 'rgba(192,48,74,0.10)', color: '#f08a98', fontFamily: FONT, fontSize: 17, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
        <LogOut size={20} />Terminar sessão
      </button>
    </div>
  )
}
