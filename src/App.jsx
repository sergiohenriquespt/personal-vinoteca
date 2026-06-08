import React, { useState, useMemo, useEffect } from 'react'
import { Wine, Plus, BarChart3, LogIn, LogOut, Menu, Settings, FileText, UserX, KeyRound, UserCheck } from 'lucide-react'
import { supabase, loadCache, saveCache, clearCache, wineFromDb, entryFromDb, consumptionFromDb } from './lib/supabase'
import { FONT, S, INIT_TYPES, COUNTRIES_REGIONS, SUPPLIERS } from './utils/constants'
import { bottleLabel } from './utils/constants'

import { useWines }        from './hooks/useWines'
import { useEntries }      from './hooks/useEntries'
import { useConsumptions } from './hooks/useConsumptions'

import ModalShell         from './components/ui/ModalShell'
import Btn                from './components/ui/Btn'
import QuoteOverlay       from './components/QuoteOverlay'
import AboutModal         from './components/AboutModal'
import LoginScreen        from './components/LoginScreen'
import ChangePasswordScreen from './components/ChangePasswordScreen'
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

const WINE_DATA_SELECT = 'id,name,type,country,region,year,purchase_price,market_price,personal_rating,vivino_rating,quantity,notes,castas,alcohol_content,producer,winemaker,bottle_size,location,photo,critic_ratings'

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
  const [sidebarOpen,      setSidebarOpen]      = useState(true)
  const [isMobile,         setIsMobile]         = useState(false)
  const [modal,            setModal]            = useState(null)
  const [activeWine,       setActiveWine]       = useState(null)
  const [activeEntry,      setActiveEntry]      = useState(null)
  const [activeCons,       setActiveCons]       = useState(null)
  const [activeQuote,      setActiveQuote]      = useState(null)
  const [showAbout,        setShowAbout]        = useState(false)
  const [showMobileMenu,   setShowMobileMenu]   = useState(false)
  const [showNoStock,      setShowNoStock]      = useState(() => {
    try { return localStorage.getItem('videiras_showNoStock') !== 'false' } catch { return true }
  })

  useEffect(() => { try { localStorage.setItem('videiras_showNoStock', String(showNoStock)) } catch {} }, [showNoStock])

  useEffect(() => {
    const h = () => { const mobile = window.innerWidth < 768; setIsMobile(mobile); setSidebarOpen(!mobile) }
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

  const closeModal = () => { setModal(null); setActiveWine(null); setActiveEntry(null); setActiveCons(null) }

  const showRandomQuote = (context) => {
    if (!quotes.length) return
    const candidates = quotes.filter(q => q.category === context || q.category === 'geral')
    const pool = candidates.length ? candidates : quotes
    setActiveQuote(pool[Math.floor(Math.random() * pool.length)])
  }

  const { addWine, editWine, deleteWine } = useWines({ session, wines, setWines, wineLocations, setWineLocations, closeModal })
  const { addEntry, editEntry, deleteEntry } = useEntries({ session, wines, setWines, wineLocations, setWineLocations, entries, setEntries, closeModal })
  const { addConsumption, editConsumption, deleteConsumption } = useConsumptions({ session, wines, setWines, wineLocations, setWineLocations, consumptions, setConsumptions, closeModal })

  const handleAddEntry = async (d) => { await addEntry(d, activeWine?.id); showRandomQuote('entrada') }
  const handleAddConsumption = async (d) => {
    const wineType = await addConsumption(d, activeWine?.id)
    const t = wineType?.toLowerCase()
    showRandomQuote(['tinto','branco','rosé','espumante'].includes(t) ? t : 'consumo')
  }

  const allCountries      = useMemo(() => Object.keys(countriesRegions), [countriesRegions])
  const regionsForFilter  = useMemo(() => filterCountry ? (countriesRegions[filterCountry] || []) : [], [countriesRegions, filterCountry])
  const addCountry        = (name) => setCountriesRegions(p => ({ ...p, [name]: [] }))
  const addRegionToCountry = (country, region) => setCountriesRegions(p => ({ ...p, [country]: [...(p[country] || []), region] }))
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

  const NAV = [
    { id: 'dashboard',  icon: <BarChart3 size={15} />, label: 'Dashboard' },
    { id: 'adega',      icon: <Wine size={15} />,      label: 'Adega' },
    { id: 'entradas',   icon: <LogIn size={15} />,     label: 'Entradas' },
    { id: 'consumos',   icon: <LogOut size={15} />,    label: 'Consumos' },
    { id: 'relatorios', icon: <FileText size={15} />,  label: 'Relatórios' },
    { id: 'definicoes', icon: <Settings size={15} />,  label: 'Definições' },
  ]

  if (authLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: FONT }}>
      <div style={{ width: 40, height: 40, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine size={20} color="#c8963e" /></div>
      <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.2em', textTransform: 'uppercase' }}>A verificar sessão…</div>
    </div>
  )
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

      {sidebarOpen && !isMobile && (
        <div style={{ width: 216, flexShrink: 0, background: '#161310', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wine size={15} color="#c8963e" /></div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 200, color: '#e8dece', fontFamily: FONT, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Videiras</div>
              <div style={{ fontSize: 9, color: '#4a453f', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 400, marginTop: 1 }}>cellar collection</div>
            </div>
          </div>
          <nav style={{ flex: 1 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setView(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 20px', background: view === n.id ? 'rgba(200,150,62,0.08)' : 'none', borderLeft: view === n.id ? '2px solid #c8963e' : '2px solid transparent', color: view === n.id ? '#c8963e' : '#6a6058', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: view === n.id ? 400 : 300, fontFamily: FONT, letterSpacing: '0.02em', transition: 'all 0.15s', textAlign: 'left' }}>{n.icon}{n.label}</button>
            ))}
          </nav>
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 11, color: '#4a453f', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', fontSize: 11, fontFamily: FONT, padding: 0, transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#e87080'} onMouseLeave={e => e.currentTarget.style.color = '#4a453f'}><KeyRound size={11} /> Terminar sessão</button>
            <button onClick={() => setShowAbout(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', fontSize: 11, fontFamily: FONT, padding: '8px 0 0', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#c8963e'} onMouseLeave={e => e.currentTarget.style.color = '#6a5f52'}><Wine size={11} /> Quem é o Videiras?</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: `0 ${isMobile ? 16 : 24}px`, borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#161310', display: 'flex', alignItems: 'center', gap: 12, height: 48, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          {!isMobile && <button onClick={() => setSidebarOpen(p => !p)} style={{ background: 'none', border: 'none', color: '#6a6058', cursor: 'pointer', padding: 4, display: 'flex' }}><Menu size={17} /></button>}
          {isMobile && <div style={{ width: 24, height: 24, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.25)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wine size={12} color="#c8963e" /></div>}
          <h1 style={{ margin: 0, fontSize: 12, fontWeight: 400, color: '#6a6058', fontFamily: FONT, letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1 }}>
            {{ dashboard: 'Dashboard', adega: 'Adega', entradas: 'Entradas', consumos: 'Consumos', relatorios: 'Relatórios', definicoes: 'Definições' }[view]}
          </h1>
          {view === 'adega' && <Btn variant="gold" onClick={() => setModal('addWine')}><Plus size={13} />{!isMobile && 'Vinho'}</Btn>}
          {isMobile && <button onClick={() => setShowMobileMenu(true)} style={{ background: 'none', border: 'none', color: '#4a453f', cursor: 'pointer', padding: 4, display: 'flex', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#c8963e'} onMouseLeave={e => e.currentTarget.style.color = '#4a453f'}><UserCheck size={16} /></button>}
        </div>

        <div style={{ flex: 1, padding: isMobile ? 16 : 24, overflowY: 'auto', paddingBottom: isMobile ? 72 : 24 }}>
          {view === 'dashboard'  && <Dashboard wines={wines} entries={entries} consumptions={consumptions} isMobile={isMobile} />}
          {view === 'adega'      && <Adega wines={wines} wineLocations={wineLocations} locations={locations} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} filterCountry={filterCountry} setFilterCountry={setFilterCountry} filterRegion={filterRegion} setFilterRegion={setFilterRegion} filterBottleSize={filterBottleSize} setFilterBottleSize={setFilterBottleSize} listMode={listMode} setListMode={setListMode} showNoStock={showNoStock} setShowNoStock={setShowNoStock} types={types} setTypes={setTypes} allCountries={allCountries} countriesRegions={countriesRegions} regionsForFilter={regionsForFilter} addCountry={addCountry} addRegionToCountry={addRegionToCountry} bottleSizesInUse={bottleSizesInUse} filtered={filtered} isMobile={isMobile} onWineClick={w => { setActiveWine(w); setModal('detail') }} onAddWine={() => setModal('addWine')} />}
          {view === 'entradas'   && <Entradas entries={entries} wines={wines} onEditEntry={(e, w) => { setActiveWine(w); setActiveEntry(e); setModal('editEntry') }} onDeleteEntry={deleteEntry} />}
          {view === 'consumos'   && <Consumos consumptions={consumptions} wines={wines} onEditConsumption={(c, w) => { setActiveWine(w); setActiveCons(c); setModal('editCons') }} onDeleteConsumption={deleteConsumption} />}
          {view === 'relatorios' && <Relatorios wines={wines} consumptions={consumptions} entries={entries} isMobile={isMobile} />}
          {view === 'definicoes' && <AdminPanel session={session} isAdmin={isAdmin} />}
        </div>
      </div>

      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: '#161310', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', zIndex: 20 }}>
          {NAV.map(n => {
            const active = view === n.id
            return (
              <button key={n.id} onClick={() => setView(n.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s', color: active ? '#c8963e' : '#3a3530', fontFamily: FONT, padding: '4px 1px', minWidth: 0 }}>
                <div style={{ padding: active ? '2px 8px' : '2px 4px', borderRadius: 10, background: active ? 'rgba(200,150,62,0.12)' : 'transparent', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{React.cloneElement(n.icon, { size: 14 })}</div>
                {active && <span style={{ fontSize: 7.5, letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: 600, lineHeight: 1 }}>{n.label}</span>}
              </button>
            )
          })}
        </div>
      )}

      {activeQuote  && <QuoteOverlay quote={activeQuote} onClose={() => setActiveQuote(null)} />}
      {showAbout    && <AboutModal onClose={() => setShowAbout(false)} />}
      {showMobileMenu && (
        <div onMouseDown={() => setShowMobileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onMouseDown={e => e.stopPropagation()} style={{ width: '100%', background: '#161310', borderTop: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', padding: '20px 24px 40px' }}>
            <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 11, color: '#4a453f', marginBottom: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONT }}>{profile?.email}</div>
            <button onClick={() => { setShowMobileMenu(false); handleLogout() }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', fontSize: 14, fontFamily: FONT, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#e87080'} onMouseLeave={e => e.currentTarget.style.color = '#6a5f52'}><KeyRound size={15} /> Terminar sessão</button>
            <button onClick={() => { setShowMobileMenu(false); setShowAbout(true) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', color: '#6a5f52', cursor: 'pointer', fontSize: 14, fontFamily: FONT, padding: '12px 0', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#c8963e'} onMouseLeave={e => e.currentTarget.style.color = '#6a5f52'}><Wine size={15} /> Quem é o Videiras?</button>
          </div>
        </div>
      )}

      {modal && (
        <ModalShell onClose={closeModal} isMobile={isMobile}>
          {modal === 'addWine'     && <WineForm types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} allWines={wines} onExactMatch={w => { setActiveWine(w); setModal('entry') }} onSave={addWine} onClose={closeModal} isMobile={isMobile} locations={locations} setLocations={setLocations} session={session} wineLocationRows={[]} critics={critics} />}
          {modal === 'editWine'    && liveWine && <WineForm wine={liveWine} types={types} setTypes={setTypes} countriesRegions={countriesRegions} setCountriesRegions={setCountriesRegions} onSave={d => editWine(d, activeWine.id)} onClose={closeModal} isMobile={isMobile} locations={locations} setLocations={setLocations} session={session} wineLocationRows={wineLocations.filter(wl => wl.wine_id === activeWine?.id).map(wl => ({ locationId: wl.location_id, quantity: wl.quantity }))} critics={critics} />}
          {modal === 'detail'      && liveWine && <WineDetail wine={liveWine} entries={entries} consumptions={consumptions} onClose={closeModal} onEntry={() => setModal('entry')} onConsumption={() => setModal('consumption')} onEdit={() => setModal('editWine')} onDelete={() => { if (window.confirm(`Tens a certeza que queres eliminar "${liveWine.name}"? Esta acção não pode ser revertida.`)) deleteWine(liveWine.id) }} onDeleteEntry={deleteEntry} onDeleteConsumption={deleteConsumption} onEditEntry={e => { setActiveEntry(e); setModal('editEntry') }} onEditConsumption={c => { setActiveCons(c); setModal('editCons') }} session={session} wineLocations={wineLocations} locations={locations} critics={critics} />}
          {modal === 'entry'       && liveWine && <EntryForm wine={liveWine} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={handleAddEntry} onClose={closeModal} session={session} locations={locations} />}
          {modal === 'editEntry'   && liveWine && activeEntry && <EntryForm wine={liveWine} entry={activeEntry} suppliers={suppliers} setSuppliers={setSuppliers} entries={entries} onSave={d => editEntry(activeEntry, d)} onClose={closeModal} session={session} locations={locations} />}
          {modal === 'consumption' && liveWine && <ConsumptionForm wine={liveWine} onSave={handleAddConsumption} onClose={closeModal} wineLocations={wineLocations} locations={locations} />}
          {modal === 'editCons'    && liveWine && activeCons && <ConsumptionForm wine={liveWine} consumption={activeCons} onSave={d => editConsumption(activeCons, d)} onClose={closeModal} wineLocations={wineLocations} locations={locations} />}
        </ModalShell>
      )}
    </div>
  )
}
