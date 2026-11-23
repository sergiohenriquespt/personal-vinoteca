import assert from 'node:assert/strict'
import { localISODate } from './format.js'

const pad = (n) => String(n).padStart(2, '0')
const d = new Date()
assert.equal(localISODate(), `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
// ontem é sempre exatamente 1 dia antes (inclui viragens de mês/ano)
assert.equal((new Date(localISODate()) - new Date(localISODate(-1))) / 864e5, 1)
assert.match(localISODate(-400), /^\d{4}-\d{2}-\d{2}$/)

console.log('format: ok')
