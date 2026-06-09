import React, { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { FONT, S } from '../utils/constants'

export default function PasswordResetScreen({ onDone }) {
  const [pwd,     setPwd]     = useState('')
  const [pwd2,    setPwd2]    = useState('')
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pwd.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')
    if (pwd !== pwd2)   return setError('As senhas não coincidem.')
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password: pwd })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(onDone, 2000)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <KeyRound size={20} color="#c8963e" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 300, color: '#e8dece', marginBottom: 6 }}>Nova senha</div>
          <div style={{ fontSize: 13, color: '#4a453f' }}>Escolhe uma nova senha para a tua conta.</div>
        </div>
        {success ? (
          <div style={{ fontSize: 13, color: '#68c880', padding: '14px 16px', background: 'rgba(104,200,128,0.08)', borderRadius: 8, border: '1px solid rgba(104,200,128,0.2)', textAlign: 'center' }}>
            Senha alterada com sucesso. A redirecionar…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Nova senha</div>
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required style={{ ...S.inp, fontSize: 14 }} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Confirmar senha</div>
              <input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} required style={{ ...S.inp, fontSize: 14 }} placeholder="Repetir senha" />
            </div>
            {error && <div style={{ fontSize: 12, color: '#e87080', padding: '8px 12px', background: 'rgba(232,112,128,0.08)', borderRadius: 6, border: '1px solid rgba(232,112,128,0.2)' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ marginTop: 8, background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 6, padding: '12px', fontSize: 13, fontWeight: 500, fontFamily: FONT, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'A guardar…' : 'Guardar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
