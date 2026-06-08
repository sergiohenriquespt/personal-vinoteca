import React, { useState } from 'react'
import { Wine } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { FONT, S } from '../utils/constants'

export default function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou password incorrectos.')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0b09', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(200,150,62,0.12)', border: '1px solid rgba(200,150,62,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Wine size={22} color="#c8963e" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 200, color: '#e8dece', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Videiras</div>
          <div style={{ fontSize: 10, color: '#3a3530', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>Cellar Collection</div>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ ...S.inp, fontSize: 14 }} placeholder="o.teu@email.pt" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#4a453f', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...S.inp, fontSize: 14 }} placeholder="••••••" />
          </div>
          {error && <div style={{ fontSize: 12, color: '#e87080', padding: '8px 12px', background: 'rgba(232,112,128,0.08)', borderRadius: 6, border: '1px solid rgba(232,112,128,0.2)' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ marginTop: 8, background: '#c8963e', color: '#0d0b09', border: 'none', borderRadius: 6, padding: '12px', fontSize: 13, fontWeight: 500, fontFamily: FONT, letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
