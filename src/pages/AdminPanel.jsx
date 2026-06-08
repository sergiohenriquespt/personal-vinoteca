import React, { useState, useEffect } from 'react'
import { Camera, Download, FileText, UserCheck, UserX, Plus, Trash2 } from 'lucide-react'
import { supabase, EDGE_FN_URL, PHOTO_BUCKET } from '../lib/supabase'
import { FONT, S } from '../utils/constants'
import Btn from '../components/ui/Btn'

function MigratePhotosCard({ session }) {
  const [status,   setStatus]   = useState('idle')
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 })

  const run = async () => {
    if (!window.confirm('Migrar todas as fotos em base64 para Supabase Storage?\n\nEsta operação pode demorar alguns minutos. Não feches o browser.')) return
    setStatus('running')
    const { data: wines } = await supabase.from('videiras_wines').select('id, photo').not('photo', 'is', null)
    const base64Wines = (wines || []).filter(w => w.photo?.startsWith('data:'))
    if (!base64Wines.length) { setStatus('done'); setProgress({ done: 0, total: 0, failed: 0 }); return }
    setProgress({ done: 0, total: base64Wines.length, failed: 0 })
    let done = 0, failed = 0
    for (const wine of base64Wines) {
      try {
        const [header, b64] = wine.photo.split(',')
        const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
        const bytes = atob(b64)
        const arr = new Uint8Array(bytes.length)
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
        const blob = new Blob([arr], { type: mime })
        const path = `${session.user.id}/${wine.id}`
        const { error: upErr } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: mime, upsert: true })
        if (upErr) throw new Error(upErr.message)
        const { data: { publicUrl } } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path)
        const { error: dbErr } = await supabase.from('videiras_wines').update({ photo: publicUrl }).eq('id', wine.id)
        if (dbErr) throw new Error(dbErr.message)
        done++
      } catch (err) {
        console.error(`[migrate] wine ${wine.id}:`, err.message)
        failed++
      }
      setProgress({ done, total: base64Wines.length, failed })
    }
    setStatus('done')
  }

  return (
    <div style={{ ...S.stat, padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px 24px', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13, color: '#e8dece', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Camera size={14} color="#c8963e" /> Migrar fotos para Storage
        </div>
        <div style={{ fontSize: 11, color: '#4a453f', lineHeight: 1.5 }}>
          Move as fotos guardadas em base64 na base de dados para Supabase Storage, libertando espaço e eliminando os timeouts.
          {status === 'running' && <span style={{ color: '#c8963e' }}> A migrar {progress.done}/{progress.total}…</span>}
          {status === 'done'    && <span style={{ color: '#68c880' }}> Concluído — {progress.done} migradas{progress.failed > 0 ? `, ${progress.failed} falhas` : ''}.</span>}
        </div>
      </div>
      <button onClick={run} disabled={status === 'running'} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 6, border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.08)', color: '#c8963e', cursor: status === 'running' ? 'not-allowed' : 'pointer', fontSize: 12, fontFamily: FONT, opacity: status === 'running' ? 0.7 : 1 }}>
        <Camera size={13} /> {status === 'running' ? 'A migrar…' : 'Migrar fotos'}
      </button>
    </div>
  )
}

export default function AdminPanel({ session, isAdmin }) {
  const [users,        setUsers]        = useState([])
  const [loadingU,     setLoadingU]     = useState(true)
  const [adminTab,     setAdminTab]     = useState(isAdmin ? 'utilizadores' : 'segurança')
  const [uTab,         setUTab]         = useState('criar')
  const [inviteEmail,  setInviteEmail]  = useState('')
  const [inviteName,   setInviteName]   = useState('')
  const [inviting,     setInviting]     = useState(false)
  const [createEmail,  setCreateEmail]  = useState('')
  const [createName,   setCreateName]   = useState('')
  const [createPwd,    setCreatePwd]    = useState('')
  const [creating,     setCreating]     = useState(false)
  const [msg,          setMsg]          = useState('')
  const [backingUp,    setBackingUp]    = useState(false)
  const [quotes,       setQuotes]       = useState([])
  const [quotesLoaded, setQuotesLoaded] = useState(false)
  const [qTab,         setQTab]         = useState('list')
  const [newQuote,     setNewQuote]     = useState({ quote: '', author: '', category: 'geral' })
  const [savingQ,      setSavingQ]      = useState(false)
  const [importing,    setImporting]    = useState(false)
  const [importMsg,    setImportMsg]    = useState('')
  const [importPreview, setImportPreview] = useState(null)

  const adminFetch = async (action, method = 'GET', body = null) => {
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) return { error: 'Sessão expirada — faz login novamente.' }
      const opts = { method, headers: { 'Authorization': `Bearer ${s.access_token}`, 'Content-Type': 'application/json' } }
      if (body) opts.body = JSON.stringify(body)
      const r = await fetch(`${EDGE_FN_URL}?action=${action}`, opts)
      return r.json()
    } catch (err) {
      console.error('[adminFetch]', action, err)
      return { error: err.message || 'Erro de rede' }
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (createPwd.length < 6) return setMsg('Erro: A password deve ter pelo menos 6 caracteres.')
    setCreating(true); setMsg('')
    const data = await adminFetch('create', 'POST', { email: createEmail, name: createName, password: createPwd })
    if (data.ok) { setMsg(`Utilizador ${createEmail} criado!`); setCreateEmail(''); setCreateName(''); setCreatePwd(''); loadUsers() }
    else setMsg(`Erro: ${data.error}`)
    setCreating(false)
  }

  const loadUsers = async () => {
    setLoadingU(true)
    try {
      const data = await adminFetch('list')
      if (data.users) setUsers(data.users)
      else setMsg(`Erro ao carregar utilizadores: ${data.error ?? 'resposta inesperada'}`)
    } finally { setLoadingU(false) }
  }

  useEffect(() => { if (isAdmin) loadUsers(); loadQuotes() }, [])

  const loadQuotes = async () => {
    const { data } = await supabase.from('videiras_quotes').select('*').order('created_at', { ascending: false })
    if (data) { setQuotes(data); setQuotesLoaded(true) }
  }

  const saveQuote = async () => {
    if (!newQuote.quote.trim()) return
    setSavingQ(true)
    const { data } = await supabase.from('videiras_quotes').insert({ ...newQuote, active: true, user_id: session.user.id }).select().single()
    if (data) { setQuotes(p => [data, ...p]); setNewQuote({ quote: '', author: '', category: 'geral' }) }
    setSavingQ(false)
  }

  const toggleQuote = async (q) => {
    await supabase.from('videiras_quotes').update({ active: !q.active }).eq('id', q.id)
    setQuotes(p => p.map(x => x.id === q.id ? { ...x, active: !x.active } : x))
  }

  const deleteQuote = async (q) => {
    if (!window.confirm('Eliminar esta frase?')) return
    await supabase.from('videiras_quotes').delete().eq('id', q.id)
    setQuotes(p => p.filter(x => x.id !== q.id))
  }

  const handleInvite = async (e) => {
    e.preventDefault(); setInviting(true); setMsg('')
    try {
      const data = await adminFetch('invite', 'POST', { email: inviteEmail, name: inviteName })
      if (data.ok) { setMsg(`Convite enviado para ${inviteEmail}!`); setInviteEmail(''); setInviteName(''); loadUsers() }
      else setMsg(`Erro: ${data.error}`)
    } finally { setInviting(false) }
  }

  const toggleActive = async (u) => { await adminFetch('set-active', 'POST', { userId: u.id, active: !u.active }); loadUsers() }
  const toggleRole   = async (u) => { await adminFetch('set-role',   'POST', { userId: u.id, role: u.role === 'admin' ? 'user' : 'admin' }); loadUsers() }

  const deleteUser = async (u) => {
    if (!window.confirm(`Eliminar permanentemente "${u.name || u.email}"?\n\nTodos os dados deste utilizador (vinhos, entradas, consumos) serão apagados. Esta acção é irreversível.`)) return
    const data = await adminFetch('delete-user', 'POST', { userId: u.id })
    if (data.ok) { setMsg(`Utilizador ${u.email} eliminado.`); loadUsers() }
    else setMsg(`Erro: ${data.error}`)
  }

  const handleImportFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.version || !Array.isArray(data.wines)) { setImportMsg('Erro: ficheiro inválido ou não é um backup Videiras.'); setImportPreview(null); return }
        setImportPreview(data); setImportMsg('')
      } catch { setImportMsg('Erro: não foi possível ler o ficheiro JSON.'); setImportPreview(null) }
    }
    reader.readAsText(file); e.target.value = ''
  }

  const handleImport = async () => {
    if (!importPreview) return
    setImporting(true); setImportMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user.id
      if (importPreview.wines?.length) {
        const { error } = await supabase.from('videiras_wines').upsert(importPreview.wines.map(w => ({ ...w, user_id: uid })), { onConflict: 'id' })
        if (error) throw new Error('Vinhos: ' + error.message)
      }
      if (importPreview.consumptions?.length) {
        const { error } = await supabase.from('videiras_consumptions').upsert(importPreview.consumptions.map(c => ({ ...c, user_id: uid })), { onConflict: 'id' })
        if (error) throw new Error('Consumos: ' + error.message)
      }
      if (importPreview.entries?.length) {
        const { error } = await supabase.from('videiras_entries').upsert(importPreview.entries.map(e => ({ ...e, user_id: uid })), { onConflict: 'id' })
        if (error) throw new Error('Entradas: ' + error.message)
      }
      if (importPreview.suppliers?.length) {
        const { error } = await supabase.from('videiras_suppliers').upsert(importPreview.suppliers.map(s => ({ name: s.name, user_id: uid })), { onConflict: 'user_id,name', ignoreDuplicates: true })
        if (error) throw new Error('Fornecedores: ' + error.message)
      }
      const total = (importPreview.wines?.length||0) + (importPreview.consumptions?.length||0) + (importPreview.entries?.length||0) + (importPreview.suppliers?.length||0)
      setImportMsg(`✓ Importação concluída — ${total} registos processados. Faz refresh para ver as alterações.`)
      setImportPreview(null)
    } catch (err) { setImportMsg('Erro: ' + err.message) }
    setImporting(false)
  }

  const handleBackup = async () => {
    setBackingUp(true)
    try {
      const [wRes, cRes, eRes, sRes] = await Promise.all([
        supabase.from('videiras_wines').select('*').order('name'),
        supabase.from('videiras_consumptions').select('*').order('date', { ascending: false }),
        supabase.from('videiras_entries').select('*').order('date', { ascending: false }),
        supabase.from('videiras_suppliers').select('*').order('name'),
      ])
      const backup = { version: 1, exported_at: new Date().toISOString(), wines: wRes.data || [], consumptions: cRes.data || [], entries: eRes.data || [], suppliers: sRes.data || [] }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `videiras-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { alert('Erro ao exportar backup: ' + err.message) }
    setBackingUp(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', gap: 1, marginBottom: 24, background: '#0d0b09', borderRadius: 7, padding: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
        {[...(isAdmin ? [['utilizadores', 'Utilizadores']] : []), ['segurança', 'Segurança'], ['frases', 'Frases']].map(([t, label]) => (
          <button key={t} onClick={() => setAdminTab(t)} style={{ flex: 1, padding: '8px 10px', borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 11, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s', background: adminTab === t ? '#1e1b16' : 'transparent', color: adminTab === t ? '#c8963e' : '#4a453f' }}>{label}</button>
        ))}
      </div>

      {adminTab === 'utilizadores' && (
        <div style={{ ...S.stat, padding: 24 }}>
          <div style={{ display: 'flex', gap: 1, marginBottom: 20, background: '#0d0b09', borderRadius: 6, padding: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
            {[['criar', 'Criar'], ['convidar', 'Convidar'], ['lista', `Lista (${users.length})`]].map(([t, label]) => (
              <button key={t} onClick={() => { setUTab(t); setMsg('') }} style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 11, fontWeight: 400, letterSpacing: '0.04em', transition: 'all 0.15s', background: uTab === t ? 'rgba(200,150,62,0.12)' : 'transparent', color: uTab === t ? '#c8963e' : '#4a453f' }}>{label}</button>
            ))}
          </div>

          {uTab === 'criar' && (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Nome</div><input value={createName} onChange={e => setCreateName(e.target.value)} style={{ ...S.inp, fontSize: 13 }} placeholder="Nome do utilizador" /></div>
                <div><div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Email *</div><input type="email" required value={createEmail} onChange={e => setCreateEmail(e.target.value)} style={{ ...S.inp, fontSize: 13 }} placeholder="email@exemplo.pt" /></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Password temporária *</div>
                <input type="password" required value={createPwd} onChange={e => setCreatePwd(e.target.value)} style={{ ...S.inp, fontSize: 13 }} placeholder="Mínimo 6 caracteres" />
                <div style={{ fontSize: 11, color: '#3a3530', marginTop: 5 }}>O utilizador será obrigado a alterar no primeiro login.</div>
              </div>
              {msg && <div style={{ fontSize: 12, color: msg.startsWith('Erro') ? '#e87080' : '#68c880', padding: '8px 12px', background: msg.startsWith('Erro') ? 'rgba(232,112,128,0.08)' : 'rgba(104,200,128,0.08)', borderRadius: 5 }}>{msg}</div>}
              <button type="submit" disabled={creating} style={{ alignSelf: 'flex-start', background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 5, padding: '9px 20px', fontSize: 12, fontWeight: 500, fontFamily: FONT, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {creating ? 'A criar…' : <><UserCheck size={13} /> Criar utilizador</>}
              </button>
            </form>
          )}

          {uTab === 'convidar' && (
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Nome</div><input value={inviteName} onChange={e => setInviteName(e.target.value)} style={{ ...S.inp, fontSize: 13 }} placeholder="Nome do utilizador" /></div>
                <div><div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Email *</div><input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={{ ...S.inp, fontSize: 13 }} placeholder="email@exemplo.pt" /></div>
              </div>
              {msg && <div style={{ fontSize: 12, color: msg.startsWith('Erro') ? '#e87080' : '#68c880', padding: '8px 12px', background: msg.startsWith('Erro') ? 'rgba(232,112,128,0.08)' : 'rgba(104,200,128,0.08)', borderRadius: 5 }}>{msg}</div>}
              <button type="submit" disabled={inviting} style={{ alignSelf: 'flex-start', background: 'none', color: '#c8963e', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 5, padding: '9px 20px', fontSize: 12, fontWeight: 400, fontFamily: FONT, cursor: inviting ? 'not-allowed' : 'pointer', opacity: inviting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {inviting ? 'A enviar…' : <><Plus size={13} /> Enviar convite</>}
              </button>
            </form>
          )}

          {uTab === 'lista' && (
            loadingU
              ? <div style={{ fontSize: 13, color: '#3a3530', padding: '20px 0', textAlign: 'center' }}>A carregar…</div>
              : users.map(u => {
                const isSelf = u.id === session?.user?.id
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: u.active ? '#e8dece' : '#3a3530', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {u.name || '—'}
                        {isSelf && <span style={{ fontSize: 9, background: 'rgba(200,150,62,0.15)', color: '#c8963e', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>TU</span>}
                        {u.role === 'admin' && <span style={{ fontSize: 9, background: 'rgba(104,200,128,0.12)', color: '#68c880', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>ADMIN</span>}
                        {!u.active && <span style={{ fontSize: 9, background: 'rgba(232,112,128,0.12)', color: '#e87080', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>INACTIVO</span>}
                        {u.must_change_password && <span style={{ fontSize: 9, background: 'rgba(200,150,62,0.12)', color: '#c8963e', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.08em' }}>1º LOGIN</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#4a453f', marginTop: 2 }}>{u.email}</div>
                    </div>
                    {!isSelf && (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => toggleRole(u)} title={u.role === 'admin' ? 'Remover admin' : 'Tornar admin'} style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: u.role === 'admin' ? '#68c880' : '#4a453f', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>{u.role === 'admin' ? 'Admin ✓' : 'Admin'}</button>
                        <button onClick={() => toggleActive(u)} title={u.active ? 'Desactivar' : 'Activar'} style={{ padding: '5px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: u.active ? '#e87080' : '#68c880', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>{u.active ? 'Desactivar' : 'Activar'}</button>
                        <button onClick={() => deleteUser(u)} title="Eliminar utilizador" style={{ padding: '5px 8px', borderRadius: 4, border: '1px solid rgba(232,112,128,0.2)', background: 'none', color: '#e87080', cursor: 'pointer', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                )
              })
          )}
        </div>
      )}

      {adminTab === 'segurança' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MigratePhotosCard session={session} />
          <div style={{ ...S.stat, padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px 24px', alignItems: 'center' }}>
            <div><div style={{ fontSize: 13, color: '#e8dece', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Download size={14} color="#c8963e" /> Exportar backup</div><div style={{ fontSize: 11, color: '#4a453f', lineHeight: 1.5 }}>Exporta todos os dados (vinhos, consumos, entradas, fornecedores) para um ficheiro JSON.</div></div>
            <button onClick={handleBackup} disabled={backingUp} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 6, border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.08)', color: '#c8963e', cursor: backingUp ? 'not-allowed' : 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', opacity: backingUp ? 0.6 : 1, transition: 'all 0.15s' }}>
              <Download size={13} /> {backingUp ? 'A exportar…' : 'Exportar backup'}
            </button>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.04)', margin: '0 -20px' }} />
            <div><div style={{ fontSize: 13, color: '#e8dece', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={14} color="#c8963e" /> Importar backup</div><div style={{ fontSize: 11, color: '#4a453f', lineHeight: 1.5 }}>Selecciona um ficheiro <code style={{ color: '#6a5f52', background: '#0d0b09', padding: '1px 5px', borderRadius: 3 }}>.json</code> exportado anteriormente. Os dados existentes são actualizados; os novos são adicionados. Nada é eliminado.</div></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 6, border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.08)', color: '#c8963e', cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              <FileText size={13} /> Importar backup<input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>
            {importPreview && (
              <div style={{ gridColumn: '1 / -1', padding: 14, background: '#0d0b09', borderRadius: 6, border: '1px solid rgba(200,150,62,0.2)' }}>
                <div style={{ fontSize: 11, color: '#c8963e', marginBottom: 10, fontWeight: 500 }}>Backup de {importPreview.exported_at ? new Date(importPreview.exported_at).toLocaleString('pt-PT') : '—'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 14 }}>
                  {[['Vinhos', importPreview.wines?.length||0],['Consumos', importPreview.consumptions?.length||0],['Entradas', importPreview.entries?.length||0],['Fornecedores', importPreview.suppliers?.length||0]].map(([label, count]) => (
                    <div key={label} style={{ fontSize: 11, color: '#6a5f52' }}><span style={{ color: '#e8dece', fontWeight: 500 }}>{count}</span> {label.toLowerCase()}</div>
                  ))}
                </div>
                <button onClick={handleImport} disabled={importing} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 6, border: '1px solid rgba(200,150,62,0.3)', background: 'rgba(200,150,62,0.1)', color: '#c8963e', cursor: importing ? 'not-allowed' : 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 500, opacity: importing ? 0.6 : 1, transition: 'all 0.15s' }}>
                  <Download size={13} style={{ transform: 'rotate(180deg)' }} />{importing ? 'A importar…' : 'Confirmar importação'}
                </button>
              </div>
            )}
            {importMsg && <div style={{ gridColumn: '1 / -1', fontSize: 12, color: importMsg.startsWith('✓') ? '#68c880' : '#e87080', padding: '8px 12px', borderRadius: 5, background: importMsg.startsWith('✓') ? 'rgba(104,200,128,0.08)' : 'rgba(232,112,128,0.08)' }}>{importMsg}</div>}
          </div>
        </div>
      )}

      {adminTab === 'frases' && (
        <div style={{ ...S.stat, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 10, color: '#9a8f82', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Frases · {quotes.filter(q => q.active).length} activas</h3>
            <div style={{ display: 'flex', gap: 1, background: '#0d0b09', borderRadius: 6, padding: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
              {[['list','Lista'],['add','Nova frase']].map(([t,l]) => (
                <button key={t} onClick={() => setQTab(t)} style={{ padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 11, background: qTab === t ? 'rgba(200,150,62,0.12)' : 'transparent', color: qTab === t ? '#c8963e' : '#4a453f', transition: 'all 0.15s' }}>{l}</button>
              ))}
            </div>
          </div>

          {qTab === 'add' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea value={newQuote.quote} onChange={e => setNewQuote(p => ({...p, quote: e.target.value}))} placeholder="Escreve a frase aqui…" style={{ ...S.inp, minHeight: 80, resize: 'vertical', fontSize: 13 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={newQuote.author} onChange={e => setNewQuote(p => ({...p, author: e.target.value}))} placeholder="Autor (opcional)" style={{ ...S.inp, fontSize: 12 }} />
                <select value={newQuote.category} onChange={e => setNewQuote(p => ({...p, category: e.target.value}))} style={{ ...S.inp, fontSize: 12, cursor: 'pointer' }}>
                  {['geral','consumo','entrada','tinto','branco','rosé','espumante'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn variant="gold" onClick={saveQuote} disabled={savingQ || !newQuote.quote.trim()}>{savingQ ? 'A guardar…' : 'Guardar frase'}</Btn>
              </div>
            </div>
          )}

          {qTab === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {!quotesLoaded && <p style={{ color: '#4a453f', fontSize: 12, textAlign: 'center' }}>A carregar…</p>}
              {quotesLoaded && quotes.length === 0 && <p style={{ color: '#4a453f', fontSize: 12, textAlign: 'center' }}>Nenhuma frase ainda.</p>}
              {quotes.map(q => {
                const isOwn = q.user_id === session.user.id
                return (
                  <div key={q.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 7, background: q.active ? 'rgba(255,255,255,0.02)' : 'transparent', border: '1px solid rgba(255,255,255,0.04)', opacity: q.active ? 1 : 0.45 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontSize: 12, color: '#e8dece', lineHeight: 1.5 }}>"{q.quote}"</p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {q.author && <span style={{ fontSize: 11, color: '#6a5f52', fontStyle: 'italic' }}>— {q.author}</span>}
                        <span style={{ fontSize: 10, color: '#4a453f', background: '#0d0b09', padding: '1px 6px', borderRadius: 3 }}>{q.category}</span>
                        {!isOwn && <span style={{ fontSize: 9, color: '#3a3530', letterSpacing: '0.06em', textTransform: 'uppercase' }}>partilhada</span>}
                      </div>
                    </div>
                    {isOwn && (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => toggleQuote(q)} title={q.active ? 'Desactivar' : 'Activar'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 4, color: q.active ? '#68c880' : '#4a453f', fontSize: 11, fontFamily: FONT, transition: 'all 0.15s' }}>{q.active ? '●' : '○'}</button>
                        <button onClick={() => deleteQuote(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 4, color: '#3a3530', transition: 'all 0.15s', display: 'flex' }} onMouseEnter={e => { e.currentTarget.style.color = '#e87080'; e.currentTarget.style.background = 'rgba(232,112,128,0.1)' }} onMouseLeave={e => { e.currentTarget.style.color = '#3a3530'; e.currentTarget.style.background = 'none' }}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
