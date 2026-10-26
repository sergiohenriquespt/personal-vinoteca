// Opções de "Retirar de" num consumo: localizações com stock + garrafas sem localização atribuída.
// Só há opção 'none' se sobrarem garrafas fora das localizações → nesse caso o campo é opcional na prática.
export const consumptionLocationOptions = (wineQty, locData) => {
  const opts = locData.filter(ld => ld.quantity > 0).map(ld => ({ id: ld.location_id, name: ld.name, quantity: ld.quantity }))
  const unassigned = wineQty - opts.reduce((s, o) => s + o.quantity, 0)
  if (unassigned > 0) opts.push({ id: 'none', name: 'Sem localização', quantity: unassigned })
  return opts
}
