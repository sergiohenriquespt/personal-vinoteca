import React, { useState, useMemo, useEffect } from 'react'
import { Wine, UserX, ChevronLeft } from 'lucide-react'
import { supabase, loadCache, saveCache, clearCache, wineFromDb, entryFromDb, consumptionFromDb } from './lib/supabase'
import { FONT, S, INIT_TYPES, COUNTRIES_REGIONS, SUPPLIERS } from './utils/constants'
import { bottleLabel } from './utils/constants'

import { useWines }        from './hooks/useWines'
import { useEntries }      from './hooks/useEntries'
import { useConsumptions } from './hooks/useConsumptions'

import ModalShell, { ModalHeader } from './components/ui/ModalShell'
import Btn                from './components/ui/Btn'
import QuoteOverlay       from './components/QuoteOverlay'
import AboutModal         from './components/AboutModal'
import LoginScreen        from './components/LoginScreen'
import ChangePasswordScreen  from './components/ChangePasswordScreen'
import PasswordResetScreen   from './components/PasswordResetScreen'
import WineForm           from './components/WineForm'
import WineDetail         from './components/WineDetail'
import EntryForm          from './components/EntryForm'
import ConsumptionForm    from './components/ConsumptionForm'
import Adega              from './pages/Adega'
import Dashboard          from './pages/Dashboard'
import Entradas           from './pages/Entradas'
import Consumos           from './pages/Consumos'
import Relatorios         from './pages/Relatorios'
import AdminPanel         from './pages/AdminPanel'
import Mais               from './pages/Mais'
import MobileNav          from './components/MobileNav'
import Sidebar            from './components/Sidebar'

const WINE_DATA_SELECT = 'id,name,type,country,region,year,purchase_price,market_price,personal_rating,vivino_rating,quantity,notes,castas,alcohol_content,producer,winemaker,bottle_size,location,photo,critic_ratings'

function ConfirmStep({ title, message, onYes, onNo, enterToConfirm, yesLabel = 'Sim', noLabel = 'Não' }) {
  useEffect(() => {
    if (!enterToConfirm) return
    const handler = (e) => { if (e.key === 'Enter') onYes() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onYes, enterToConfirm])

  return (
    <>
      <ModalHeader title={title} onClose={onNo} />
      <p style={{ fontSize: 14, color: '#e8dece', margin: '0 0 28px', lineHeight: 1.6 }}>{message}</p>
      <div className="vt-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onNo}>{noLabel}</Btn>
        <Btn variant="gold" onClick={onYes}>{yesLabel}</Btn>
      </div>
    </>
  )
}

export default function App() {
  const [wines,            setWines]            = useState(() => { const c = loadCache(); return c?.wines?.map(wineFromDb) ?? [] })
  const [entries,          setEntries]          = useState(() => { const c = loadCache(); return c?.entries?.map(entryFromDb) ?? [] })
  const [consumptions,     setConsumptions]     = useState(() => { const c = loadCache(); return c?.consumptions?.map(consumptionFromDb) ?? [] })
  const [session,          setSession]          = useState(null)
  const [profile,          setProfile]          = useState(null)
  const [authLoading,      setAuthLoading]      = useState(true)
  const [loading,          setLoading]          = useState(() => !loadCache())
  const [types,            setTypes]            = useState(INIT_TYPES)
  const [suppliers,        setSuppliers]        = useState([])
  const [locations,        setLocations]        = useState([])
  const [wineLocations,    setWineLocations]    = useState([])
  const [critics,          setCritics]          = useState([])
  const [countriesRegions, setCountriesRegions] = useState(COUNTRIES_REGIONS)
  const [quotes,           setQuotes]           = useState([])
  const [view,             setView]             = useState('dashboard')
  const [search,           setSearch]           = useState('')
  const [filterType,       setFilterType]       = useState('')
  const [filterCountry,    setFilterCountry]    = useState('')
  const [filterRegion,     setFilterRegion]     = useState('')
  const [filterBottleSize, setFilterBottleSize] = useState('')
  const [listMode,         setListMode]         = useState('list')
  const [isMobile,         setIsMobile]         = useState(false)
  const [modal,            setModal]            = useState(null)
  const [activeWine,       setActiveWine]       = useState(null)
  const [activeEntry,      setActiveEntry]      = useState(null)
  const [activeCons,       setActiveCons]       = useState(null)
  const [activeQuote,      setActiveQuote]      = useState(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [pendingPriceUpdate, setPendingPriceUpdate] = useState(null)
  const [fromNewWine,        setFromNewWine]        = useState(false)
  const [showAbout,        setShowAbout]        = useState(false)
  const [showNoStock,      setShowNoStock]      = useState(() => {
    try { return localStorage.getItem('videiras_showNoStock') !== 'false' } catch { return true }
  })

  // cada separador abre no topo (o scroll é da janela, partilhado entre vistas)
  useEffect(() => { window.scrollTo(0, 0) }, [view])

  useEffect(() => { try { localStorage.setItem('videiras_showNoStock', String(showNoStock)) } catch {} }, [showNoStock])

  useEffect(() => {
    const h = () => { setIsMobile(window.innerWidth < 768) }
    window.addEventListener('resize', h); h()
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => {
    const loadProfile = async (userId) => {
      const { data } = await supabase.from('videiras_profiles').select('*').eq('id', userId).single()
      setProfile(data || null)
    }
    const authTimeout = setTimeout(() => setAuthLoading(false), 8000)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      clearTimeout(authTimeout); setSession(s)
      if (s?.user) loadProfile(s.user.id)
      setAuthLoading(false)
    }).catch(() => { clearTimeout(authTimeout); setAuthLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') { clearCache(); setSession(null); setProfile(null); setWines([]); setEntries([]); setConsumptions([]) }
      else if (event === 'PASSWORD_RECOVERY') { setSession(s); setShowPasswordReset(true) }
      else if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) { setSession(s); if (s?.user) loadProfile(s.user.id) }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    const hasCached = !!loadCache()
    const load = async () => {
      if (!hasCached) setLoading(true)
      try {
        const [wRes, eRes, cRes, sRes, qRes, lRes, wlRes, crRes] = await Promise.all([
          supabase.from('videiras_wines').select(WINE_DATA_SELECT).order('name'),
          supabase.from('videiras_entries').select('*').order('date', { ascending: false }),
          supabase.from('videiras_consumptions').select('*').order('date', { ascending: false }),
          supabase.from('videiras_suppliers').select('name').order('name'),
          supabase.from('videiras_quotes').select('id,quote,author,category').eq('active', true),
          supabase.from('videiras_locations').select('id,name').order('name'),
          supabase.from('videiras_wine_locations').select('id,wine_id,location_id,quantity'),
          supabase.from('videiras_critics').select('id,abbrev,name,scale,sort_order').eq('active', true).order('sort_order'),
        ])
        if (wRes.data) setWines(wRes.data.map(wineFromDb))
        if (eRes.data) setEntries(eRes.data.map(entryFromDb))
        if (cRes.data) setConsumptions(cRes.data.map(consumptionFromDb))
        if (sRes.data?.length > 0) setSuppliers(sRes.data.map(r => r.name))
        else setSuppliers([...SUPPLIERS].sort((a, b) => a.localeCompare(b, 'pt')))
        if (qRes.data)  setQuotes(qRes.data)
        if (lRes.data)  setLocations(lRes.data)
        if (wlRes.data) setWineLocations(wlRes.data)
        if (crRes.data) setCritics(crRes.data)
        saveCache({ wines: wRes.data ?? [], entries: eRes.data ?? [], consumptions: cRes.data ?? [] })
      } catch (err) { console.error('Erro ao carregar dados:', err) }
      finally { setLoading(false) }
    }
    load()
  }, [session?.user?.id])

  const closeModal = () => { setModal(null); setActiveWine(null); setActiveEntry(null); setActiveCons(null); setFromNewWine(false); setPendingPriceUpdate(null) }

  const showRandomQuote = (context) => {
    if (!quotes.length) return
    const candidates = quotes.filter(q => q.category === context || q.category === 'geral')
    const pool = candidates.length ? candidates : quotes
    setActiveQuote(pool[Math.floor(Math.random() * pool.length)])
  }

  const { addWine, editWine, deleteWine } = useWines({ session, wines, setWines, wineLocations, setWineLocations, closeModal })
  const { addEntry, editEntry, deleteEntry } = useEntries({ session, wines, setWines, wineLocations, setWineLocations, entries, setEntries, closeModal })
  const { addConsumption, editConsumption, deleteConsumption } = useConsumptions({ session, wines, setWines, wineLocations, setWineLocations, consumptions, setConsumptions, closeModal })

  const handleAddEntry = async (d) => {
    const wineId = activeWine?.id
    await addEntry(d, wineId, () => {
      if (d.price > 0) {
        setPendingPriceUpdate({ wineId, price: d.price })
        setModal('confirmPrice')
      } else {
        closeModal()
        showRandomQuote('entrada')
      }
    })
  }
  const handleAddConsumption = async (d) => {
    const wineType = await addConsumption(d, activeWine?.id)
    const t = wineType?.toLowerCase()
    showRandomQuote(['tinto','branco','rosé','espumante'].includes(t) ? t : 'consumo')
  }

  const allCountries      = useMemo(() => Object.keys(countriesRegions), [countriesRegions])
  const regionsForFilter  = useMemo(() => filterCountry ? (countriesRegions[filterCountry] || []) : [], [countriesRegions, filterCountry])
  const addCountry        = (name) => setCountriesRegions(p => ({ ...p, [name]: [] }))
  const addRegionToCountry = (country, region) => setCountriesRegions(p => ({ ...p, [country]: [...(p[country] || []), region] }))
  const allTypes          = useMemo(() => [...new Set([...types, ...wines.map(w => w.type).filter(Boolean)])], [types, wines])
  const bottleSizesInUse  = useMemo(() => [...new Set(wines.map(w => w.bottleSize || 750))].sort((a, b) => a - b), [wines])
  const filtered = useMemo(() => wines.filter(w => {
    const q = search.toLowerCase()
    const ms = !q || [w.name, w.country, w.region, w.castas, w.producer, w.winemaker].some(f => f?.toLowerCase().includes(q))
    return ms && (showNoStock || w.quantity > 0)
      && (!filterType       || w.type === filterType)
      && (!filterCountry    || w.country === filterCountry)
      && (!filterRegion     || w.region === filterRegion)
      && (!filterBottleSize || (w.bottleSize || 750) === filterBottleSize)
  }), [wines, search, filterType, filterCountry, filterRegion, filterBottleSize, showNoStock])

  const liveWine = activeWine ? wines.find(w => w.id === activeWine.id) || activeWine : null
  const isAdmin  = profile?.role === 'admin'
  const handleLogout = async () => { if (!window.confirm('Tens a certeza que pretendes terminar a sessão?')) return; await supabase.auth.signOut() }

  const confirmDeleteWine = () => { if (liveWine && window.confirm(`Tens a certeza que queres eliminar "${liveWine.name}"? Esta acção não pode ser revertida.`)) deleteWine(liveWine.id) }
  const handleQuickAction = (id) => { if (id !== 'addWine') setActiveWine(null); setModal(id) }


  if (authLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: FONT }}>
      <div style={{ width: 40, height: 40, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine size={20} color="#c8963e" /></div>
      <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>A verificar sessão…</div>
    </div>
  )
  if (showPasswordReset) return <PasswordResetScreen onDone={() => setShowPasswordReset(false)} />
  if (!session) return <LoginScreen />
  if (profile?.must_change_password) return <ChangePasswordScreen profile={profile} onDone={() => setProfile(p => ({ ...p, must_change_password: false }))} />
  if (profile && !profile.active) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <UserX size={32} color="#e87080" />
      <div style={{ fontSize: 15, color: '#e8dece' }}>Conta inactiva</div>
      <div style={{ fontSize: 13, color: '#4a453f' }}>Contacta o administrador.</div>
      <button onClick={handleLogout} style={{ marginTop: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#6a5f52', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontFamily: FONT, fontSize: 12 }}>Sair</button>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', color: '#e8dece', fontFamily: FONT }}>
      {loading && (
        <>
          <style>{`@keyframes vt-spin{to{transform:rotate(360deg)}}@keyframes vt-pulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}@keyframes vt-fade{0%,100%{opacity:0.35}50%{opacity:0.9}}`}</style>
          <div style={{ position: 'fixed', inset: 0, background: '#0d0b09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200, gap: 20 }}>
            <div style={{ position: 'relative', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '2px solid rgba(200,150,62,0.15)', borderTopColor: '#c8963e', animation: 'vt-spin 1.1s linear infinite' }} />
              <div style={{ width: 40, height: 40, background: 'rgba(200,150,62,0.10)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'vt-pulse 2s ease-in-out infinite' }}><Wine size={20} color="#c8963e" /></div>
            </div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.2em', textTransform: 'uppercase', animation: 'vt-fade 1.8s ease-in-out infinite' }}>A carregar adega…</div>
          </div>
        </>
      )}

      {!isMobile && <Sidebar view={view} setView={setView} onAction={handleQuickAction} email={profile?.email} onAbout={() => setShowAbout(true)} onLogout={handleLogout} />}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: isMobile ? 'max(20px, env(safe-area-inset-top)) 16px 16px' : '40px 48px 24px' }}>
          <div style={{ maxWidth: isMobile ? undefined : 1120, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && ['relatorios', 'definicoes'].includes(view) && (
              <button onClick={() => setView('mais')} aria-label="Voltar" style={{ width: 48, height: 48, borderRadius: 24, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.08)', color: '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><ChevronLeft size={24} /></button>
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? 32 : 38, lineHeight: 1.2, fontWeight: 300, color: '#e8dece', fontFamily: FONT, letterSpacing: '-0.02em', flex: 1 }}>
              {{ dashboard: 'A tua adega', adega: 'Adega', entradas: 'Registos', consumos: 'Registos', relatorios: 'Relatórios', definicoes: 'Definições', mais: 'Mais' }[view]}
            </h1>
          </div>
        </div>

        <div style={{ flex: 1, padding: isMobile ? '0 16px' : '0 48px', paddingBottom: isMobile ? 'calc(110px + env(safe-area-inset-bottom))' : 48 }}>
         <div style={{ maxWidth: isMobile ? undefined : 1120, margin: '0 auto' }}>
          {['entradas', 'consumos'].includes(view) && (
            <div role="tablist" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: '#1e1b16', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16, maxWidth: 800, marginInline: 'auto' }}>
              {[['consumos', 'Consumos'], ['entradas', 'Entradas']].map(([id, label]) => (
                <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)} style={{ height: 48, borderRadius: 12, border: 'none', fontFamily: FONT, fontSize: 16, cursor: 'pointer', fontWeight: view === id ? 600 : 500, background: view === id ? '#2e2920' : 'transparent', color: view === id ? '#e8dece' : '#9a8f82' }}>{label}</button>
              ))}
            </div>
          )}
          {view === 'dashboard'  && <Dashboard wines={wines} entries={entries} consumptions={consumptions} isMobile={isMobile} />}
          {view === 'adega'      && <Adega wines={wines} wineLocations={wineLocations} locations={locations} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} filterCountry={filterCountry} setFilterCountry={setFilterCountry} filterRegion={filterRegion} setFilterRegion={setFilterRegion} filterBottleSize={filterBottleSize} setFilterBottleSize={setFilterBottleSize} listMode={listMode} setListMode={setListMode} showNoStock={showNoStock} setShowNoStock={setShowNoStock} types={types} setTypes={setTypes} allCountries={allCountries} countriesRegions={countriesRegions} regionsForFilter={regionsForFilter} addCountry={addCountry} addRegionToCountry={addRegionToCountry} bottleSizesInUse={bottleSizesInUse} filtered={filtered} isMobile={isMobile} onWineClick={w => { setActiveWine(w); setModal('detail') }} onAddWine={() => setModal('addWine')} />}
          {view === 'entradas'   && <Entradas entries={entries} wines={wines} onEditEntry={(e, w) => { setActiveWine(w); setActiveEntry(e); setModal('editEntry') }} onDeleteEntry={deleteEntry} isMobile={isMobile} />}
          {view === 'consumos'   && <Consumos consumptions={consumptions} wines={wines} onEditConsumption={(c, w) => { setActiveWine(w); setActiveCons(c); setModal('editCons') }} onDeleteConsumption={deleteConsumption} isMobile={isMobile} />}
          {view === 'relatorios' && <div className="vt-legible"><Relatorios wines={wines} consumptions={consumptions} entries={entries} isMobile={isMobile} /></div>}
          {view === 'definicoes' && <div className="vt-legible"><AdminPanel session={session} isAdmin={isAdmin} /></div>}
          {view === 'mais'       && <Mais email={profile?.email} setView={setView} onAbout={() => setShowAbout(true)} onLogout={handleLogout} />}
         </div>
        </div>
      </div>

      {isMobile && <MobileNav view={view} setView={setView} onAction={handleQuickAction} />}

      {activeQuote  && <QuoteOverlay quote={activeQuote} onClose={() => setActiveQuote(null)} />}
      {showAbout    && <AboutModal onClose={() => setShowAbout(false)} />}
      {modal && (
        <ModalShell onClose={closeModal} isMobile={isMobile} fullScreen={!['confirmEntry', 'confirmPrice'].includes(modal)}>
          {modal === 'addWine'     && <WineForm types={allTypes} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} allWines={wines} onExactMatch={w => { setActiveWine(w); setModal('entry') }} onSave={d => addWine(d, (createdWine) => { setActiveWine(createdWine); setModal('confirmEntry') })} onClose={closeModal} isMobile={isMobile} locations={locations} setLocations={setLocations} session={session} wineLocationRows={[]} critics={critics} />}
          {modal === 'editWine'    && liveWine && <WineForm wine={liveWine} types={allTypes} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} onSave={d => editWine(d, activeWine.id)} onDelete={confirmDeleteWine} onClose={closeModal} isMobile={isMobile} locations={locations} setLocations={setLocations} session={session} wineLocationRows={wineLocations.filter(wl => wl.wine_id === activeWine?.id && wl.quantity > 0).map(wl => ({ locationId: wl.location_id, quantity: wl.quantity }))} critics={critics} />}
          {modal === 'detail'      && liveWine && <WineDetail wine={liveWine} entries={entries} consumptions={consumptions} onClose={closeModal} onEntry={() => setModal('entry')} onConsumption={() => setModal('consumption')} onEdit={() => setModal('editWine')} onDeleteEntry={deleteEntry} onDeleteConsumption={deleteConsumption} onEditEntry={e => { setActiveEntry(e); setModal('editEntry') }} onEditConsumption={c => { setActiveCons(c); setModal('editCons') }} session={session} wineLocations={wineLocations} locations={locations} critics={critics} isMobile={isMobile} />}
          {modal === 'entry'       && liveWine && <EntryForm wine={liveWine} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={handleAddEntry} onClose={closeModal} session={session} locations={locations} noPrefill={fromNewWine} />}
          {modal === 'newEntry'    && <EntryForm wine={activeWine} allowWineSelection={true} onWineChange={w => setActiveWine(w)} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={handleAddEntry} onClose={closeModal} session={session} locations={locations} />}
          {modal === 'editEntry'   && liveWine && activeEntry && <EntryForm wine={liveWine} entry={activeEntry} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={d => editEntry(activeEntry, d)} onClose={closeModal} session={session} locations={locations} />}
          {modal === 'consumption' && liveWine && <ConsumptionForm wine={liveWine} onSave={handleAddConsumption} onClose={closeModal} wineLocations={wineLocations} locations={locations} />}
          {modal === 'newCons'     && <ConsumptionForm wine={activeWine} allowWineSelection={true} onWineChange={w => setActiveWine(w)} onSave={handleAddConsumption} onClose={closeModal} wineLocations={wineLocations} locations={locations} />}
          {modal === 'editCons'    && liveWine && activeCons && <ConsumptionForm wine={liveWine} consumption={activeCons} onSave={d => editConsumption(activeCons, d)} onClose={closeModal} wineLocations={wineLocations} locations={locations} />}
          {modal === 'confirmEntry' && liveWine && (
            <ConfirmStep
              title="Vinho criado"
              message={`«${liveWine.name}» foi adicionado com 0 garrafas. O stock entra pelas entradas — registar a primeira agora?`}
              yesLabel="Registar entrada"
              noLabel="Agora não"
              onYes={() => { setFromNewWine(true); setModal('entry') }}
              onNo={closeModal}
            />
          )}
          {modal === 'confirmPrice' && pendingPriceUpdate && (
            <ConfirmStep
              title="Atualizar preço"
              message={`Pretende atualizar o preço de compra na ficha do vinho para ${Number(pendingPriceUpdate.price).toFixed(2).replace('.', ',')}€?`}
              onYes={async () => {
                await supabase.from('videiras_wines')
                  .update({ purchase_price: pendingPriceUpdate.price })
                  .eq('id', pendingPriceUpdate.wineId)
                setWines(p => p.map(w => w.id === pendingPriceUpdate.wineId ? { ...w, purchasePrice: pendingPriceUpdate.price } : w))
                closeModal()
                showRandomQuote('entrada')
              }}
              onNo={() => { closeModal(); showRandomQuote('entrada') }}
              enterToConfirm
            />
          )}
        </ModalShell>
      )}
    </div>
  )
}
