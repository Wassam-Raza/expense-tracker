import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const CATEGORIES_EXPENSE = ['Food','Transport','Housing','Utilities','Health','Shopping','Entertainment','Education','Other']
const CATEGORIES_INCOME  = ['Salary','Freelance','Business','Investment','Gift','Other']

const CAT_COLORS = {
  Food:'#a13d2b', Transport:'#9b6b3c', Housing:'#6b5b95', Utilities:'#3d6b8a',
  Health:'#2f6e4f', Shopping:'#c4633b', Entertainment:'#b08968', Education:'#5c7a5c', Other:'#8a8374',
  Salary:'#2f6e4f', Freelance:'#3d7a5c', Business:'#4a7c59', Investment:'#5a8a6a', Gift:'#6b9a76',
}

export default function Dashboard() {
  const { token, user, logout } = useAuth()
  const [summary, setSummary]   = useState(null)
  const [txns, setTxns]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTxn, setEditTxn]       = useState(null)
  const [toast, setToast]           = useState('')

  const [form, setForm] = useState({ type:'expense', amount:'', category:'Food', note:'', date: new Date().toISOString().slice(0,10) })

  const load = async () => {
    try {
      const [sum, list] = await Promise.all([
        apiFetch('/transactions/summary', {}, token),
        apiFetch('/transactions', {}, token),
      ])
      setSummary(sum); setTxns(list)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 2500) }

  const openAdd = () => {
    setEditTxn(null)
    setForm({ type:'expense', amount:'', category:'Food', note:'', date: new Date().toISOString().slice(0,10) })
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setEditTxn(t)
    setForm({ type:t.type, amount:String(t.amount), category:t.category, note:t.note||'', date: new Date(t.date).toISOString().slice(0,10) })
    setModalOpen(true)
  }

  const submitForm = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { showToast('Enter a valid amount'); return }
    try {
      const body = JSON.stringify({ ...form, amount: parseFloat(form.amount) })
      if (editTxn) await apiFetch(`/transactions/${editTxn._id}`, { method:'PUT', body }, token)
      else         await apiFetch('/transactions', { method:'POST', body }, token)
      setModalOpen(false)
      showToast(editTxn ? 'Entry updated' : 'Entry recorded')
      await load()
    } catch (e) { showToast(e.message) }
  }

  const deleteTxn = async (id) => {
    if (!confirm('Delete this entry?')) return
    try { await apiFetch(`/transactions/${id}`, { method:'DELETE' }, token); showToast('Entry deleted'); await load() }
    catch (e) { showToast(e.message) }
  }

  const fmt = (n) => `Rs ${Number(n||0).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0})}`

  const filteredTxns = txns.filter(t => filterType==='all' ? true : t.type===filterType)

  const s = {
    page:     { minHeight:'100vh' },
    topbar:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.75rem 2rem 1.25rem',
                borderBottom:'1px solid var(--rule)', flexWrap:'wrap', gap:12 },
    brand:    { display:'flex', alignItems:'baseline', gap:10 },
    brandTitle: { fontFamily:'var(--display)', fontSize:'1.7rem', fontWeight:600, color:'var(--ink)', letterSpacing:'-.01em' },
    brandTag: { fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-faint)', letterSpacing:'.1em' },
    userArea: { display:'flex', alignItems:'center', gap:14 },
    userName: { fontSize:13, color:'var(--ink-soft)' },
    logoutBtn:{ background:'transparent', border:'1px solid var(--rule)', borderRadius:3, padding:'7px 14px',
                fontSize:12.5, fontWeight:600, color:'var(--ink-soft)', cursor:'pointer', transition:'all .15s' },

    container:{ maxWidth:1100, margin:'0 auto', padding:'2rem' },

    /* Balance ledger line - the signature element */
    ledgerBlock: { marginBottom:'2.5rem' },
    ledgerRow:   { display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'2rem', marginBottom:14 },
    balCol:      { },
    balLabel:    { fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--ink-soft)', marginBottom:6 },
    balValue:    { fontFamily:'var(--display)', fontSize:'3.4rem', fontWeight:600, color:'var(--ink)', letterSpacing:'-0.02em', lineHeight:1 },
    miniCols:    { display:'flex', gap:'2.5rem' },
    miniCol:     {},
    miniLabel:   { fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:5 },
    miniValue:   { fontFamily:'var(--mono)', fontSize:'1.3rem', fontWeight:700 },
    rule:        { height:2, background:'var(--ink)', marginBottom:4 },
    ruleSub:     { height:1, background:'var(--rule)', marginBottom:'1.5rem' },

    addBtn:   { background:'var(--ink)', border:'none', borderRadius:3, padding:'11px 22px',
                fontFamily:'var(--body)', fontSize:13.5, fontWeight:600, color:'var(--paper)', cursor:'pointer',
                display:'flex', alignItems:'center', gap:8, transition:'opacity .15s' },

    /* Charts row */
    chartCard: { background:'var(--paper-card)', border:'1px solid var(--rule)', borderRadius:4, padding:'1.5rem', boxShadow:'var(--shadow)' },
    chartTitle:{ fontFamily:'var(--display)', fontSize:'1.1rem', fontWeight:600, color:'var(--ink)', marginBottom:'1.25rem' },
    empty:     { textAlign:'center', padding:'2.5rem 1rem', color:'var(--ink-faint)', fontSize:13 },

    catList:   {},
    catRow:    { display:'flex', alignItems:'center', gap:10, marginBottom:12 },
    catDot:    (c) => ({ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }),
    catName:   { fontSize:13, color:'var(--ink)', flex:1 },
    catAmt:    { fontFamily:'var(--mono)', fontSize:13, fontWeight:700, color:'var(--ink)' },
    catBarTrack: { height:5, background:'var(--rule)', borderRadius:100, marginTop:5, overflow:'hidden' },
    catBarFill:  (c,pct) => ({ height:'100%', width:`${pct}%`, background:c, borderRadius:100 }),

    /* Transactions table */
    tableSection: { background:'var(--paper-card)', border:'1px solid var(--rule)', borderRadius:4, boxShadow:'var(--shadow)', overflow:'hidden' },
    tableHeader:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem',
                    borderBottom:'1px solid var(--rule)', flexWrap:'wrap', gap:10 },
    tableTitle:   { fontFamily:'var(--display)', fontSize:'1.15rem', fontWeight:600, color:'var(--ink)' },
    filterTabs:   { display:'flex', gap:4, background:'var(--paper)', borderRadius:4, padding:3, border:'1px solid var(--rule)' },
    filterTab:    (active) => ({ padding:'6px 14px', border:'none', borderRadius:3, fontSize:12, fontWeight:600,
                  cursor:'pointer', background: active?'var(--ink)':'transparent', color: active?'var(--paper)':'var(--ink-soft)', transition:'all .15s' }),

    row:      { display:'flex', alignItems:'center', gap:14, padding:'14px 1.5rem', borderBottom:'1px solid var(--paper-line)', transition:'background .15s' },
    typeIcon: (type) => ({ width:34, height:34, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:15, background: type==='income' ? 'var(--income-bg)' : 'var(--expense-bg)', color: type==='income' ? 'var(--income)' : 'var(--expense)' }),
    rowMain:  { flex:1, minWidth:0 },
    rowCat:   { fontSize:14, fontWeight:600, color:'var(--ink)' },
    rowNote:  { fontSize:12.5, color:'var(--ink-soft)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
    rowDate:  { fontFamily:'var(--mono)', fontSize:11.5, color:'var(--ink-faint)', flexShrink:0, width:80 },
    rowAmt:   (type) => ({ fontFamily:'var(--mono)', fontSize:15, fontWeight:700, color: type==='income'?'var(--income)':'var(--expense)', flexShrink:0, minWidth:100, textAlign:'right' }),
    rowActions: { display:'flex', gap:4, flexShrink:0 },
    actBtn:   { background:'transparent', border:'none', cursor:'pointer', fontSize:14, color:'var(--ink-faint)', padding:5, borderRadius:3, transition:'color .15s' },
  }

  if (loading) return <div style={{textAlign:'center', padding:'5rem', color:'var(--ink-faint)', fontSize:13}}>Opening ledger…</div>

  const maxCat = Math.max(...(summary?.byCategory||[]).map(c=>c.amount), 1)

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topbar}>
        <div style={s.brand}>
          <span style={s.brandTitle}>The Ledger</span>
          <span style={s.brandTag}>NEXSOFT · TASK 09</span>
        </div>
        <div style={s.userArea}>
          <span style={s.userName}>{user?.name}</span>
          <button style={s.logoutBtn} onClick={logout}>Sign Out</button>
        </div>
      </div>

      <div style={s.container}>
        {/* Balance ledger line - signature element */}
        <div style={s.ledgerBlock}>
          <div style={s.ledgerRow}>
            <div style={s.balCol}>
              <div style={s.balLabel}>Running Balance</div>
              <div style={{...s.balValue, color: (summary?.balance||0)>=0 ? 'var(--ink)' : 'var(--expense)'}}>{fmt(summary?.balance)}</div>
            </div>
            <div style={s.miniCols}>
              <div style={s.miniCol}>
                <div style={{...s.miniLabel, color:'var(--income)'}}>Income</div>
                <div style={{...s.miniValue, color:'var(--income)'}}>+{fmt(summary?.income)}</div>
              </div>
              <div style={s.miniCol}>
                <div style={{...s.miniLabel, color:'var(--expense)'}}>Expense</div>
                <div style={{...s.miniValue, color:'var(--expense)'}}>−{fmt(summary?.expense)}</div>
              </div>
            </div>
            <button style={s.addBtn} onClick={openAdd}
              onMouseEnter={e=>e.currentTarget.style.opacity=.85} onMouseLeave={e=>e.currentTarget.style.opacity=1}>
              + New Entry
            </button>
          </div>
          <div style={s.rule}></div>
          <div style={s.ruleSub}></div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div style={s.chartCard}>
            <div style={s.chartTitle}>Cash Flow by Month</div>
            {(!summary?.byMonth || summary.byMonth.length===0) ? <div style={s.empty}>No entries yet — add your first transaction</div> : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={summary.byMonth} margin={{top:5,right:10,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2f6e4f" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2f6e4f" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a13d2b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#a13d2b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:11, fill:'var(--ink-soft)', fontFamily:'var(--mono)'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11, fill:'var(--ink-soft)', fontFamily:'var(--mono)'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:'var(--paper-card)', border:'1px solid var(--rule)', borderRadius:4, fontSize:12, fontFamily:'var(--body)'}}/>
                  <Area type="monotone" dataKey="income"  stroke="#2f6e4f" strokeWidth={2} fill="url(#incG)" name="Income"/>
                  <Area type="monotone" dataKey="expense" stroke="#a13d2b" strokeWidth={2} fill="url(#expG)" name="Expense"/>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={s.chartCard}>
            <div style={s.chartTitle}>Spending by Category</div>
            {(!summary?.byCategory || summary.byCategory.length===0) ? <div style={s.empty}>No expenses recorded</div> : (
              <div style={s.catList}>
                {summary.byCategory.sort((a,b)=>b.amount-a.amount).slice(0,6).map(c => (
                  <div key={c.category} style={s.catRow}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={s.catName}>
                          <span style={{...s.catDot(CAT_COLORS[c.category]||'#8a8374'), display:'inline-block', marginRight:8}}></span>
                          {c.category}
                        </span>
                        <span style={s.catAmt}>{fmt(c.amount)}</span>
                      </div>
                      <div style={s.catBarTrack}>
                        <div style={s.catBarFill(CAT_COLORS[c.category]||'#8a8374', (c.amount/maxCat)*100)}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div style={s.tableSection}>
          <div style={s.tableHeader}>
            <div style={s.tableTitle}>All Entries</div>
            <div style={s.filterTabs}>
              {['all','income','expense'].map(f => (
                <button key={f} style={s.filterTab(filterType===f)} onClick={()=>setFilterType(f)}>
                  {f==='all'?'All':f==='income'?'Income':'Expense'}
                </button>
              ))}
            </div>
          </div>

          {filteredTxns.length===0 ? (
            <div style={s.empty}>No entries to show. Click "+ New Entry" to add one.</div>
          ) : filteredTxns.map(t => (
            <div key={t._id} style={s.row}
              onMouseEnter={e=>e.currentTarget.style.background='var(--paper)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={s.typeIcon(t.type)}>{t.type==='income'?'↑':'↓'}</div>
              <div style={s.rowMain}>
                <div style={s.rowCat}>{t.category}</div>
                {t.note && <div style={s.rowNote}>{t.note}</div>}
              </div>
              <div style={s.rowDate}>{new Date(t.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
              <div style={s.rowAmt(t.type)}>{t.type==='income'?'+':'−'}{fmt(t.amount)}</div>
              <div style={s.rowActions}>
                <button style={s.actBtn} onClick={()=>openEdit(t)} title="Edit"
                  onMouseEnter={e=>e.currentTarget.style.color='var(--ink)'} onMouseLeave={e=>e.currentTarget.style.color='var(--ink-faint)'}>✎</button>
                <button style={s.actBtn} onClick={()=>deleteTxn(t._id)} title="Delete"
                  onMouseEnter={e=>e.currentTarget.style.color='var(--expense)'} onMouseLeave={e=>e.currentTarget.style.color='var(--ink-faint)'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <EntryModal form={form} setForm={setForm} onClose={()=>setModalOpen(false)} onSave={submitForm} isEdit={!!editTxn}/>}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'var(--ink)', color:'var(--paper)',
          padding:'12px 20px', borderRadius:3, fontSize:13, fontWeight:500, boxShadow:'var(--shadow-lift)', zIndex:100 }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function EntryModal({ form, setForm, onClose, onSave, isEdit }) {
  const cats = form.type==='expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME

  const s = {
    overlay: { position:'fixed', inset:0, background:'rgba(43,38,32,.45)', backdropFilter:'blur(2px)',
               display:'flex', alignItems:'center', justifyContent:'center', zIndex:90, padding:'1rem' },
    modal:   { background:'var(--paper-card)', border:'1px solid var(--rule)', borderRadius:5, width:'100%', maxWidth:440,
               padding:'2rem', boxShadow:'var(--shadow-lift)' },
    title:   { fontFamily:'var(--display)', fontSize:'1.4rem', fontWeight:600, color:'var(--ink)', marginBottom:'1.5rem' },
    typeToggle: { display:'flex', gap:8, marginBottom:'1.5rem' },
    typeBtn: (active, type) => ({ flex:1, padding:'10px', border:'1.5px solid ' + (active ? (type==='income'?'var(--income)':'var(--expense)') : 'var(--rule)'),
               borderRadius:4, background: active ? (type==='income'?'var(--income-bg)':'var(--expense-bg)') : 'transparent',
               color: active ? (type==='income'?'var(--income)':'var(--expense)') : 'var(--ink-soft)',
               fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .15s' }),
    grp: { marginBottom:16 },
    lbl: { display:'block', fontFamily:'var(--mono)', fontSize:10.5, fontWeight:700, letterSpacing:'.1em',
           textTransform:'uppercase', color:'var(--ink-soft)', marginBottom:7 },
    inp: { width:'100%', background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3,
           padding:'10px 12px', fontSize:14, color:'var(--ink)', outline:'none', fontFamily:'var(--body)' },
    amtInp: { width:'100%', background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3,
           padding:'10px 12px', fontSize:18, fontFamily:'var(--mono)', fontWeight:700, color:'var(--ink)', outline:'none' },
    select: { width:'100%', background:'var(--paper)', border:'1px solid var(--rule)', borderRadius:3,
           padding:'10px 12px', fontSize:14, color:'var(--ink)', outline:'none', cursor:'pointer' },
    actions: { display:'flex', gap:10, marginTop:'1.75rem' },
    cancelBtn: { flex:1, background:'transparent', border:'1px solid var(--rule)', borderRadius:3, padding:11,
           fontSize:13.5, fontWeight:600, color:'var(--ink-soft)', cursor:'pointer' },
    saveBtn: { flex:1, background:'var(--ink)', border:'none', borderRadius:3, padding:11,
           fontSize:13.5, fontWeight:600, color:'var(--paper)', cursor:'pointer' },
  }

  return (
    <div style={s.overlay} onClick={e=>e.target===e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.title}>{isEdit ? 'Edit Entry' : 'New Entry'}</div>

        <div style={s.typeToggle}>
          <button style={s.typeBtn(form.type==='income','income')} onClick={()=>setForm(f=>({...f,type:'income',category:'Salary'}))}>↑ Income</button>
          <button style={s.typeBtn(form.type==='expense','expense')} onClick={()=>setForm(f=>({...f,type:'expense',category:'Food'}))}>↓ Expense</button>
        </div>

        <div style={s.grp}>
          <label style={s.lbl}>Amount (Rs)</label>
          <input style={s.amtInp} type="number" placeholder="0.00" value={form.amount}
            onChange={e=>setForm(f=>({...f,amount:e.target.value}))} autoFocus/>
        </div>

        <div style={s.grp}>
          <label style={s.lbl}>Category</label>
          <select style={s.select} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={s.grp}>
          <label style={s.lbl}>Date</label>
          <input style={s.inp} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
        </div>

        <div style={s.grp}>
          <label style={s.lbl}>Note (optional)</label>
          <input style={s.inp} placeholder="What was this for?" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
        </div>

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.saveBtn} onClick={onSave}>{isEdit ? 'Update Entry' : 'Record Entry'}</button>
        </div>
      </div>
    </div>
  )
}
