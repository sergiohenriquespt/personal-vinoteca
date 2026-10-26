import { supabase, wineFromDb, consumptionFromDb, consumptionToDb } from '../lib/supabase'

export function useConsumptions({ session, wines, setWines, wineLocations, setWineLocations, consumptions, setConsumptions, closeModal }) {
  // linhas a 0 ficam na BD para o edit/delete de um consumo poder devolver garrafas à localização
  const adjustLocation = async (wl, delta) => {
    const { data } = await supabase.from('videiras_wine_locations')
      .update({ quantity: Math.max(0, wl.quantity + delta) }).eq('id', wl.id).select().single()
    if (data) setWineLocations(p => p.map(x => x.id === wl.id ? data : x))
  }
  const findLocation = (c) => c.locationId && wineLocations.find(wl => wl.wine_id === c.wineId && wl.location_id === c.locationId)

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
    const wl = findLocation({ ...d, wineId: activeWineId })
    if (wl) await adjustLocation(wl, -d.quantity)
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
        .update(consumptionToDb({ ...d, wineId: originalCons.wineId, locationId: originalCons.locationId }))
        .eq('id', originalCons.id).select().single(),
      supabase.from('videiras_wines').update(updates).eq('id', originalCons.wineId).select().single(),
    ])
    if (cRes.data) setConsumptions(p => p.map(c => c.id === originalCons.id ? consumptionFromDb(cRes.data) : c))
    if (wRes.data) setWines(p => p.map(w => w.id !== originalCons.wineId ? w : wineFromDb(wRes.data)))
    const wl = findLocation(originalCons)
    if (wl && qtyDiff) await adjustLocation(wl, qtyDiff)
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
    const wl = findLocation(consumption)
    if (wl) await adjustLocation(wl, consumption.quantity)
  }

  return { addConsumption, editConsumption, deleteConsumption }
}
