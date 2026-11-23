import React, { useState } from 'react'
import { Search, List, LayoutGrid, SlidersHorizontal } from 'lucide-react'
import { S, FONT, getTC, chipStyle } from '../utils/constants'
import { bottleLabel } from '../utils/constants'
import { WineListView, WineGridView, WineMobileList } from '../components/WineCard'

const selectSt = { ...S.inp, minHeight: 48, fontSize: 16, borderRadius: 12, background: '#1e1b16', cursor: 'pointer' }

export default function Adega({
  wines, wineLocations, locations,
  search, setSearch,
  filterType, setFilterType,
  filterCountry, setFilterCountry,
  filterRegion, setFilterRegion,
  filterBottleSize, setFilterBottleSize,
  listMode, setListMode,
  showNoStock, setShowNoStock,
  types,
  allCountries,
  countriesRegions,
  bottleSizesInUse,
  filtered,
  isMobile: m,
  onWineClick,
}) {
  const [showFilters, setShowFilters] = useState(false)
  const inUse = new Set(wines.map(w => w.type))
  const typeChips = [...types.filter(t => inUse.has(t)), ...[...inUse].filter(t => t && !types.includes(t))]
  const activeFilters = [filterCountry, filterRegion, filterBottleSize].filter(Boolean).length
  const onlyStock = !showNoStock
  const bottles = filtered.reduce((s, w) => s + w.quantity, 0)
  const h = m ? 54 : 48

  const stockSwitch = (
    <button onClick={() => setShowNoStock(p => !p)} role="switch" aria-checked={onlyStock}
      style={{ height: 44, padding: 0, border: 'none', background: 'transparent', color: '#e8dece', fontFamily: FONT, fontSize: m ? 16 : 15, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0, alignSelf: m ? 'flex-end' : undefined }}>
      Só com stock
      <span style={{ width: 50, height: 30, borderRadius: 15, position: 'relative', background: onlyStock ? '#c8963e' : '#3a3530', transition: 'background 0.15s' }}>
        <span style={{ position: 'absolute', top: 3, left: onlyStock ? 23 : 3, width: 24, height: 24, borderRadius: 12, background: '#fff', transition: 'left 0.15s' }} />
      </span>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 16, color: '#9a8f82', flex: m ? '1 1 100%' : 1 }}>{filtered.length} {filtered.length === 1 ? 'referência' : 'referências'} · {bottles} {bottles === 1 ? 'garrafa' : 'garrafas'}</div>
        <label style={{ flex: m ? 1 : '0 1 400px', height: h, borderRadius: m ? 16 : 14, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', color: '#9a8f82', boxSizing: 'border-box' }}>
          <Search size={m ? 22 : 20} style={{ flexShrink: 0 }} />
          <input type="search" aria-label="Pesquisar vinhos" value={search} onChange={e => setSearch(e.target.value)} placeholder={m ? 'Pesquisar vinho, região…' : 'Pesquisar vinho, região, castas…'}
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#e8dece', fontSize: m ? 17 : 16, fontFamily: FONT }} />
        </label>
        <button onClick={() => setShowFilters(p => !p)} aria-expanded={showFilters} aria-label={`Filtros${activeFilters ? ` (${activeFilters} ativos)` : ''}`}
          style={{ minWidth: h, height: h, padding: m ? 0 : '0 16px', gap: 8, borderRadius: m ? 16 : 14, background: showFilters ? 'rgba(200,150,62,0.14)' : '#1e1b16', border: `1px solid ${showFilters ? 'rgba(200,150,62,0.4)' : 'rgba(255,255,255,0.08)'}`, color: showFilters ? '#c8963e' : '#e8dece', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', flexShrink: 0, fontFamily: FONT, fontSize: 15 }}>
          <SlidersHorizontal size={m ? 22 : 18} />{!m && 'Filtros'}
          {activeFilters > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, background: '#c8963e', color: '#0d0b09', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilters}</span>}
        </button>
        {!m && (
          <div style={{ display: 'flex', height: 48, borderRadius: 14, background: '#1e1b16', border: '1px solid rgba(255,255,255,0.08)', padding: 4, boxSizing: 'border-box', gap: 4 }}>
            {[{ mode: 'list', I: List, label: 'Lista' }, { mode: 'grid', I: LayoutGrid, label: 'Grelha' }].map(({ mode, I, label }) => (
              <button key={mode} onClick={() => setListMode(mode)} aria-label={label} aria-pressed={listMode === mode}
                style={{ width: 40, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: listMode === mode ? 'rgba(200,150,62,0.14)' : 'transparent', color: listMode === mode ? '#c8963e' : '#9a8f82' }}>
                <I size={18} />
              </button>
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <div style={{ display: 'grid', gridTemplateColumns: m ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, padding: 14, borderRadius: 18, background: '#161310', border: '1px solid rgba(255,255,255,0.06)' }}>
          <select aria-label="País" style={{ ...selectSt, minHeight: m ? 52 : 48, fontSize: m ? 17 : 16 }} value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterRegion('') }}>
            <option value="">Todos os países</option>
            {allCountries.map(c => <option key={c}>{c}</option>)}
          </select>
          {filterCountry && (
            <select aria-label="Região" style={{ ...selectSt, minHeight: m ? 52 : 48, fontSize: m ? 17 : 16 }} value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
              <option value="">Todas as regiões</option>
              {(countriesRegions[filterCountry] || []).map(r => <option key={r}>{r}</option>)}
            </select>
          )}
          {bottleSizesInUse.length > 1 && (
            <select aria-label="Formato" style={{ ...selectSt, minHeight: m ? 52 : 48, fontSize: m ? 17 : 16 }} value={filterBottleSize} onChange={e => setFilterBottleSize(e.target.value ? parseInt(e.target.value) : '')}>
              <option value="">Todos os formatos</option>
              {bottleSizesInUse.map(ml => <option key={ml} value={ml}>{bottleLabel(ml)}</option>)}
            </select>
          )}
          {activeFilters > 0 && (
            <button onClick={() => { setFilterCountry(''); setFilterRegion(''); setFilterBottleSize('') }}
              style={{ height: 48, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#e8dece', fontFamily: FONT, fontSize: 16, cursor: 'pointer' }}>Limpar filtros</button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: m ? 'column' : 'row', alignContent: 'stretch' }}>
        <div style={m
          ? { display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '0 16px', scrollbarWidth: 'none', alignSelf: 'stretch' }
          : { display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <button onClick={() => setFilterType('')} aria-pressed={!filterType} style={chipStyle(!filterType)}>Todos</button>
          {typeChips.map(t => {
            const on = filterType === t
            return (
              <button key={t} onClick={() => setFilterType(on ? '' : t)} aria-pressed={on} style={chipStyle(on)}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: on ? '#0d0b09' : getTC(t).fg }} />{t}
              </button>
            )
          })}
        </div>
        {stockSwitch}
      </div>

      {m
        ? <WineMobileList wines={filtered} onWineClick={onWineClick} wineLocations={wineLocations} locations={locations} />
        : listMode === 'list'
          ? <WineListView wines={filtered} onWineClick={onWineClick} wineLocations={wineLocations} locations={locations} />
          : <WineGridView wines={filtered} onWineClick={onWineClick} wineLocations={wineLocations} locations={locations} />}
    </div>
  )
}
