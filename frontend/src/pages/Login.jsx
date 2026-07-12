import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'

export default function Login() {
  const { login } = useAuth()
  const [tab, setTab]   = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    setErr(''); setLoading(true)
    try {
      const body = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }
      const data = await apiFetch('/auth/' + tab, { method:'POST', body: JSON.stringify(body) })
      login(data.token, data.user)
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  const s = {
    page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' },
    card: { width:'100%', maxWidth:420, background:'var(--paper-card)', border:'1px solid var(--rule)',
            borderRadius:4, padding:'3rem 2.5rem 2.5rem', boxShadow:'var(--shadow-lift)', position:'relative' },
    cornerMark: { position:'absolute', top:14, right:18, fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-faint)', letterSpacing:'.08em' },
    eyebrow: { fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:'var(--accent)', marginBottom:8 },
    title: { fontFamily:'var(--display)', fontSize:'2.1rem', fontWeight:600, color:'var(--ink)', marginBottom:6, letterSpacing:'-0.01em' },
    sub: { fontSize:13.5, color:'var(--ink-soft)', marginBottom:'2rem', lineHeight:1.5 },
    tabs: { display:'flex', borderBottom:'1px solid var(--rule)', marginBottom:'1.75rem' },
    tab: (active) => ({ flex:1, padding:'10px 0', border:'none', background:'transparent', cursor:'pointer',
      fontFamily:'var(--body)', fontSize:13, fontWeight:600, letterSpacing:'.03em',
      color: active ? 'var(--ink)' : 'var(--ink-faint)',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', marginBottom:-1, transition:'all .2s' }),
    grp: { marginBottom:16 },
    lbl: { display:'block', fontFamily:'var(--mono)', fontSize:10.5, fontWeight:700, letterSpacing:'.1em',
           textTransform:'uppercase', color:'var(--ink-soft)', marginBottom:7 },
    inp: { width:'100%', background:'transparent', border:'none', borderBottom:'1.5px solid var(--rule)',
           padding:'8px 2px', fontSize:15, color:'var(--ink)', outline:'none', transition:'border-color .2s' },
    btn: { width:'100%', background:'var(--ink)', border:'none', borderRadius:3, padding:13,
           fontFamily:'var(--body)', fontSize:14, fontWeight:600, letterSpacing:'.02em', color:'var(--paper)',
           cursor:'pointer', marginTop:'1.5rem', opacity: loading ? .6 : 1, transition:'opacity .15s' },
    err: { background:'var(--expense-bg)', border:'1px solid var(--expense)', borderRadius:3,
           padding:'10px 14px', fontSize:13, color:'var(--expense)', marginBottom:'1rem' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <span style={s.cornerMark}>LEDGER · 09</span>
        <div style={s.eyebrow}>Personal Finance</div>
        <h1 style={s.title}>The Ledger</h1>
        <p style={s.sub}>Track every rupee in, every rupee out. A running account of what's yours.</p>

        <div style={s.tabs}>
          <button style={s.tab(tab==='login')}    onClick={()=>setTab('login')}>Sign In</button>
          <button style={s.tab(tab==='register')} onClick={()=>setTab('register')}>New Account</button>
        </div>

        {err && <div style={s.err}>{err}</div>}

        {tab==='register' && (
          <div style={s.grp}>
            <label style={s.lbl}>Name</label>
            <input style={s.inp} name="name" placeholder="Your full name" value={form.name} onChange={onChange}
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--rule)'}/>
          </div>
        )}
        <div style={s.grp}>
          <label style={s.lbl}>Email</label>
          <input style={s.inp} name="email" type="email" placeholder="you@email.com" value={form.email} onChange={onChange}
            onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--rule)'}/>
        </div>
        <div style={s.grp}>
          <label style={s.lbl}>Password</label>
          <input style={s.inp} name="password" type="password" placeholder="••••••••" value={form.password}
            onChange={onChange} onKeyDown={e=>e.key==='Enter'&&submit()}
            onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--rule)'}/>
        </div>

        <button style={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Please wait…' : tab==='login' ? 'Open Ledger' : 'Start Ledger'}
        </button>
      </div>
    </div>
  )
}