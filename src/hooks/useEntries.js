import { supabase, wineFromDb, entryFromDb, entryToDb } from '../lib/supabase'

export function useEntries({ session, wines, setWines, wineLocations, setWineLocations, entries, setEntries, closeModal }) {
  const addEntry = async (d, activeWineId) => {
    const wine = wines.find(w => w.id === activeWineId)
    const newQty = (wine?.quantity || 0) + d.quantity
    const [eRes, wRes] = await Promise.all([
      supabase.from('videiras_entries')
        .insert({ ...entryToDb({ ...d, wineId: activeWineId }), user_id: session.user.id })
        .select().single(),
      supabase.from('videiras_wines')
        .update({ quantity: newQty, purchase_price: d.price || wine?.purchasePrice || 0 })
        .eq('id', activeWineId).select().single(),
    ])
    if (eRes.data) setEntries(p => [...p, entryFromDb(eRes.data)])
    if (wRes.data) setWines(p => p.map(w => w.id !== activeWineId ? w : wineFromDb(wRes.data)))
    if (d.locationId) {
      const existing = wineLocations.find(wl => wl.wine_id === activeWineId && wl.location_id === d.locationId)
      if (existing) {
        const { data } = await supabase.from('videiras_wine_locations')
          .update({ quantity: existing.quantity + d.quantity }).eq('id', existing.id).select().single()
        if (data) setWineLocations(p => p.map(wl => wl.id === existing.id ? data : wl))
      } else {
        const { data } = await supabase.from('videiras_wine_locations')
          .insert({ wine_id: activeWineId, location_id: d.locationId, quantity: d.quantity }).select().single()
        if (data) setWineLocations(p => [...p, data])
      }
    }
    closeModal()
  }

  const editEntry = async (originalEntry, d) => {
    const wine = wines.find(w => w.id === originalEntry.wineId)
    const qtyDiff = d.quantity - originalEntry.quantity
    const newQty  = (wine?.quantity || 0) + qtyDiff
    const [eRes, wRes] = await Promise.all([
      supabase.from('videiras_entries')
        .update(entryToDb({ ...d, wineId: originalEntry.wineId }))
        .eq('id', originalEntry.id).select().single(),
      supabase.from('videiras_wines')
        .update({ quantity: newQty, purchase_price: d.price || wine?.purchasePrice || 0 })
        .eq('id', originalEntry.wineId).select().single(),
    ])
    if (eRes.data) setEntries(p => p.map(e => e.id === originalEntry.id ? entryFromDb(eRes.data) : e))
    if (wRes.data) setWines(p => p.map(w => w.id !== originalEntry.wineId ? w : wineFromDb(wRes.data)))
    closeModal()
  }

  const deleteEntry = async (entry) => {
    const wine = wines.find(w => w.id === entry.wineId)
    const newQty = Math.max(0, (wine?.quantity || 0) - entry.quantity)
    await supabase.from('videiras_entries').delete().eq('id', entry.id)
    const { data } = await supabase.from('videiras_wines')
      .update({ quantity: newQty }).eq('id', entry.wineId).select().single()
    setEntries(p => p.filter(e => e.id !== entry.id))
    if (data) setWines(p => p.map(w => w.id !== entry.wineId ? w : wineFromDb(data)))
  }

  return { addEntry, editEntry, deleteEntry }
}
