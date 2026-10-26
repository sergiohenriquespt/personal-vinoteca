import assert from 'node:assert/strict'
import { consumptionLocationOptions as opts } from './consumptionLocation.js'

const cave = { location_id: 'a', name: 'Cave', quantity: 3 }
const garr = { location_id: 'b', name: 'Garrafeira', quantity: 1 }

// tudo atribuído → só localizações, campo obrigatório
assert.deepEqual(opts(4, [cave, garr]).map(o => o.id), ['a', 'b'])
// parcial → aparece 'Sem localização' com o resto
assert.deepEqual(opts(5, [cave]).at(-1), { id: 'none', name: 'Sem localização', quantity: 2 })
// vinho antigo sem localizações → só 'none' (auto-selecionado no form)
assert.deepEqual(opts(2, []), [{ id: 'none', name: 'Sem localização', quantity: 2 }])
// localizações a 0 são ignoradas
assert.deepEqual(opts(1, [{ ...cave, quantity: 0 }, garr]).map(o => o.id), ['b'])

console.log('consumptionLocation: ok')
