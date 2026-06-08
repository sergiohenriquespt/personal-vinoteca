import { supabase, wineFromDb, consumptionFromDb, consumptionToDb } from '../lib/supabase'

export function useConsumptions({ session, wines, setWines, wineLocations, setWineLocations, consumptions, setConsumptions, closeModal }) {
  const addConsumption = async (d, activeWineId) => {
    const wine = wines.find(w => w.id === activeWineId)
    const newQty = (wine?.quantity || 0) - d.quantity
    const updates = { quantity: newQty, ...(d.rating ? { personal_rating: d.rating } : {}) }
    const [cRes, wRes] = await Promise.all([
      supabase.from('videiras_consumptions')
        .insert({ ...consumptionToDb({ ...d, wineId: activeWineId }), user_id: session.user.id })
        .select().single(),
      supabase.from('videiras_wines').update(updates).eq('id', activeWineId).select().single(),
    ])
    if (cRes.data) setConsumptions(p => [...p, consumptionFromDb(cRes.data)])
    if (wRes.data) setWines(p => p.map(w => w.id !== activeWineId ? w : wineFromDb(wRes.data)))
    if (d.locationId) {
      const existing = wineLocations.find(wl => wl.wine_id === activeWineId && wl.location_id === d.locationId)
      if (existing) {
        const newLocQty = existing.quantity - d.quantity
        if (newLocQty <= 0) {
          await supabase.from('videiras_wine_locations').delete().eq('id', existing.id)
          setWineLocations(p => p.filter(wl => wl.id !== existing.id))
        } else {
          const { data } = await supabase.from('videiras_wine_locations')
            .update({ quantity: newLocQty }).eq('id', existing.id).select().single()
          if (data) setWineLocations(p => p.map(wl => wl.id === existing.id ? data : wl))
        }
      }
    }
    closeModal()
    return wine?.type
  }

  const editConsumption = async (originalCons, d) => {
    const wine = wines.find(w => w.id === originalCons.wineId)
    const qtyDiff = originalCons.quantity - d.quantity
    const newQty  = (wine?.quantity || 0) + qtyDiff
    const updates = { quantity: newQty, ...(d.rating ? { personal_rating: d.rating } : {}) }
    const [cRes, wRes] = await Promise.all([
      supabase.from('videiras_consumptions')
        .update(consumptionToDb({ ...d, wineId: originalCons.wineId }))
        .eq('id', originalCons.id).select().single(),
      supabase.from('videiras_wines').update(updates).eq('id', originalCons.wineId).select().single(),
    ])
    if (cRes.data) setConsumptions(p => p.map(c => c.id === originalCons.id ? consumptionFromDb(cRes.data) : c))
    if (wRes.data) setWines(p => p.map(w => w.id !== originalCons.wineId ? w : wineFromDb(wRes.data)))
    closeModal()
  }

  const deleteConsumption = async (consumption) => {
    const wine = wines.find(w => w.id === consumption.wineId)
    const newQty = (wine?.quantity || 0) + consumption.quantity
    await supabase.from('videiras_consumptions').delete().eq('id', consumption.id)
    const { data } = await supabase.from('videiras_wines')
      .update({ quantity: newQty }).eq('id', consumption.wineId).select().single()
    setConsumptions(p => p.filter(c => c.id !== consumption.id))
    if (data) setWines(p => p.map(w => w.id !== consumption.wineId ? w : wineFromDb(data)))
  }

  return { addConsumption, editConsumption, deleteConsumption }
}
