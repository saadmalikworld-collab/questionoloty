import React, { useState, useEffect } from 'react';
import {
  getUsers, createUser, updateUser, deleteUser,
  getRoles, createRole, updateRole, deleteRole,
  getClients, createClient, updateClient,
  getCurrencies, updateCurrency, getCurrencyLogs,
  getInsurance, createInsurance, updateInsurance, deleteInsurance,
  getAllConfigs, updateConfig,
} from '../services/api';
import toast from 'react-hot-toast';

const fmt = (v,d=2) => v==null?'—':parseFloat(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});

/* ─── Shared Modal ─────────────────────────────────────────── */
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize:15.5, fontWeight:700, color:'var(--primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'var(--text2)', lineHeight:1 }}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── PAGE HEADER ─────────────────────────────────────────── */
function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22 }}>
      <div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-sub">{subtitle}</p>}</div>
      {action}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   USERS
══════════════════════════════════════════════════════════════ */
export function UsersPage() {
  const [users,  setUsers]  = useState([]);
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({ name:'', email:'', password:'', role:'user' });

  const load = () => getUsers().then(r => setUsers(r.data)).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    try {
      if (modal==='create') await createUser(form);
      else await updateUser(form.id, form);
      toast.success(modal==='create'?'User created':'User updated');
      setModal(null); load();
    } catch(e) { toast.error(e.response?.data?.message||'Error'); }
  };

  const deactivate = async id => {
    if (!window.confirm('Deactivate user?')) return;
    try { await deleteUser(id); toast.success('Deactivated'); load(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <PageHeader title="👥 User Management" subtitle="Create, edit and manage platform users"
        action={<button className="btn btn-primary" onClick={() => { setForm({name:'',email:'',password:'',role:'user'}); setModal('create'); }}>+ Add User</button>} />
      <div className="card">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u.id}>
              <td style={{ fontWeight:500 }}>{u.name}</td>
              <td style={{ color:'var(--text2)' }}>{u.email}</td>
              <td><span className={`badge ${u.role==='admin'?'badge-blue':'badge-green'}`}>{u.role}</span></td>
              <td><span className={`badge ${u.is_active?'badge-green':'badge-red'}`}>{u.is_active?'Active':'Inactive'}</span></td>
              <td><div className="flex gap-2">
                <button className="btn btn-sm btn-outline" onClick={() => { setForm({...u,password:''}); setModal('edit'); }}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={()=>deactivate(u.id)}>Deactivate</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal==='create'?'Add User':'Edit User'} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="grid2">
            <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          </div>
          <div className="grid2">
            <div className="form-group"><label className="form-label">Password {modal==='edit'?'(blank = no change)':''}</label><input className="form-control" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                <option value="user">User</option><option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {modal==='edit' && <div className="form-group"><label className="form-label">Status</label>
            <select className="form-control" value={form.is_active?'1':'0'} onChange={e=>setForm({...form,is_active:e.target.value==='1'})}>
              <option value="1">Active</option><option value="0">Inactive</option>
            </select>
          </div>}
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROLES
══════════════════════════════════════════════════════════════ */
export function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({ name:'', rate:'', currency_code:'USD' });

  const load = () => getRoles().then(r=>setRoles(r.data)).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    try {
      if (modal==='create') await createRole(form); else await updateRole(form.id,form);
      toast.success(modal==='create'?'Role created':'Role updated'); setModal(null); load();
    } catch(e){ toast.error(e.response?.data?.message||'Error'); }
  };

  const remove = async id => {
    if (!window.confirm('Delete role?')) return;
    try { await deleteRole(id); toast.success('Deleted'); load(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <PageHeader title="💼 Roles & Rates" subtitle="Manage contractor roles and default bill rates"
        action={<button className="btn btn-primary" onClick={()=>{ setForm({name:'',rate:'',currency_code:'USD'}); setModal('create'); }}>+ Add Role</button>} />
      <div className="card">
        <table className="table">
          <thead><tr><th>Role Name</th><th>Rate</th><th>Currency</th><th>Actions</th></tr></thead>
          <tbody>{roles.map(r=>(
            <tr key={r.id}>
              <td style={{ fontWeight:500 }}>{r.name}</td>
              <td style={{ fontFamily:'monospace' }}>{fmt(r.rate)}</td>
              <td><span className="badge badge-blue">{r.currency_code}</span></td>
              <td><div className="flex gap-2">
                <button className="btn btn-sm btn-outline" onClick={()=>{ setForm({...r}); setModal('edit'); }}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={()=>remove(r.id)}>Delete</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal==='create'?'Add Role':'Edit Role'} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="form-group"><label className="form-label">Role Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div className="grid2">
            <div className="form-group"><label className="form-label">Rate</label><input className="form-control" type="number" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Currency</label>
              <select className="form-control" value={form.currency_code} onChange={e=>setForm({...form,currency_code:e.target.value})}>
                {['USD','GBP','EUR','SAR','INR','AUD','AED'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CLIENTS
══════════════════════════════════════════════════════════════ */
export function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({ name:'' });

  const load = () => getClients().then(r=>setClients(r.data)).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    try {
      if (modal==='create') await createClient(form); else await updateClient(form.id,form);
      toast.success(modal==='create'?'Client created':'Client updated'); setModal(null); load();
    } catch(e){ toast.error(e.response?.data?.message||'Error'); }
  };

  return (
    <div>
      <PageHeader title="🏢 Clients" subtitle="Manage your client list"
        action={<button className="btn btn-primary" onClick={()=>{ setForm({name:''}); setModal('create'); }}>+ Add Client</button>} />
      <div className="card">
        <table className="table">
          <thead><tr><th>Client Name</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>{clients.map(c=>(
            <tr key={c.id}>
              <td style={{ fontWeight:500 }}>{c.name}</td>
              <td style={{ color:'var(--text2)', fontSize:13 }}>{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
              <td><button className="btn btn-sm btn-outline" onClick={()=>{ setForm({...c}); setModal('edit'); }}>Edit</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal==='create'?'Add Client':'Edit Client'} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="form-group"><label className="form-label">Client Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CURRENCIES
══════════════════════════════════════════════════════════════ */
export function CurrenciesPage() {
  const [currencies, setCurrencies] = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [editId,     setEditId]     = useState(null);
  const [editVals,   setEditVals]   = useState({});
  const [search,     setSearch]     = useState('');
  const [tab,        setTab]        = useState('rates');

  const load = async () => {
    getCurrencies().then(r=>setCurrencies(r.data)).catch(()=>{});
    getCurrencyLogs().then(r=>setLogs(r.data)).catch(()=>{});
  };
  useEffect(()=>{ load(); },[]);

  const startEdit = c => { setEditId(c.id); setEditVals({ units_per_usd:c.units_per_usd, usd_per_unit:c.usd_per_unit }); };

  const saveEdit = async id => {
    try {
      await updateCurrency(id, editVals);
      toast.success('Rate updated'); setEditId(null); load();
    } catch { toast.error('Error'); }
  };

  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="💱 Currency Rates" subtitle="Update exchange rates — all values are units per 1 USD"
        action={<div className="flex gap-2">
          <button className={`btn ${tab==='rates'?'btn-primary':'btn-outline'}`} onClick={()=>setTab('rates')}>Rates</button>
          <button className={`btn ${tab==='logs'?'btn-primary':'btn-outline'}`} onClick={()=>setTab('logs')}>Change Log</button>
        </div>} />

      {tab==='rates' ? <>
        <div style={{ marginBottom:14 }}>
          <input className="form-control" placeholder="Search currency code or name…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:300 }} />
        </div>
        <div className="card">
          <table className="table">
            <thead><tr><th>Code</th><th>Name</th><th>Units / USD</th><th>USD / Unit</th><th>Last Updated</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(c=>(
              <tr key={c.id}>
                <td><span className="badge badge-blue">{c.code}</span></td>
                <td>{c.name}</td>
                <td>
                  {editId===c.id
                    ? <input className="form-control" type="number" step="0.0000001" value={editVals.units_per_usd}
                        onChange={e=>{ const v=parseFloat(e.target.value)||1; setEditVals({units_per_usd:v,usd_per_unit:(1/v)}); }}
                        style={{ width:140 }} />
                    : <span style={{ fontFamily:'monospace' }}>{fmt(c.units_per_usd,6)}</span>}
                </td>
                <td>
                  {editId===c.id
                    ? <span style={{ fontFamily:'monospace', color:'var(--text2)' }}>{fmt(editVals.usd_per_unit,8)}</span>
                    : <span style={{ fontFamily:'monospace' }}>{fmt(c.usd_per_unit,8)}</span>}
                </td>
                <td style={{ fontSize:12, color:'var(--text2)' }}>{new Date(c.updatedAt).toLocaleString('en-GB')}</td>
                <td>
                  {editId===c.id
                    ? <div className="flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={()=>saveEdit(c.id)}>Save</button>
                        <button className="btn btn-sm btn-outline" onClick={()=>setEditId(null)}>Cancel</button>
                      </div>
                    : <button className="btn btn-sm btn-outline" onClick={()=>startEdit(c)}>Edit</button>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </> : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Currency</th><th>Old Rate</th><th>New Rate</th><th>Updated By</th><th>Date</th></tr></thead>
            <tbody>{logs.map(l=>(
              <tr key={l.id}>
                <td><span className="badge badge-blue">{l.currency_code}</span></td>
                <td style={{ fontFamily:'monospace' }}>{fmt(l.old_units_per_usd,6)}</td>
                <td style={{ fontFamily:'monospace' }}>{fmt(l.new_units_per_usd,6)}</td>
                <td>{l.updated_by_name}</td>
                <td style={{ fontSize:12, color:'var(--text2)' }}>{new Date(l.createdAt).toLocaleString('en-GB')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   INSURANCE
══════════════════════════════════════════════════════════════ */
export function InsurancePage() {
  const [plans,  setPlans]  = useState([]);
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({ name:'', amount:'', currency_code:'GBP', frequency:'Per Year' });
  const [search, setSearch] = useState('');

  const load = () => getInsurance().then(r=>setPlans(r.data)).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    try {
      if (modal==='create') await createInsurance(form); else await updateInsurance(form.id,form);
      toast.success(modal==='create'?'Plan created':'Plan updated'); setModal(null); load();
    } catch(e){ toast.error(e.response?.data?.message||'Error'); }
  };

  const remove = async id => {
    if (!window.confirm('Delete this plan?')) return;
    try { await deleteInsurance(id); toast.success('Deleted'); load(); } catch { toast.error('Error'); }
  };

  const filtered = plans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="🏥 Medical Insurance" subtitle="Manage all insurance plans used in calculations"
        action={<button className="btn btn-primary" onClick={()=>{ setForm({name:'',amount:'',currency_code:'GBP',frequency:'Per Year'}); setModal('create'); }}>+ Add Plan</button>} />
      <div style={{ marginBottom:14 }}>
        <input className="form-control" placeholder="Search plans…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:320 }} />
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Plan Name</th><th>Amount</th><th>Currency</th><th>Frequency</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(p=>(
            <tr key={p.id}>
              <td style={{ fontWeight:500 }}>{p.name}</td>
              <td style={{ fontFamily:'monospace' }}>{fmt(p.amount)}</td>
              <td><span className="badge badge-blue">{p.currency_code}</span></td>
              <td><span className="badge badge-gray">{p.frequency}</span></td>
              <td><div className="flex gap-2">
                <button className="btn btn-sm btn-outline" onClick={()=>{ setForm({...p}); setModal('edit'); }}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={()=>remove(p.id)}>Delete</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal && (
        <Modal title={modal==='create'?'Add Plan':'Edit Plan'} onClose={()=>setModal(null)}
          footer={<><button className="btn btn-outline" onClick={()=>setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="form-group"><label className="form-label">Plan Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div className="grid2">
            <div className="form-group"><label className="form-label">Amount</label><input className="form-control" type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Currency</label>
              <select className="form-control" value={form.currency_code} onChange={e=>setForm({...form,currency_code:e.target.value})}>
                {['GBP','USD','SAR','AED','INR','QAR','OMR','EUR'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Frequency</label>
            <select className="form-control" value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}>
              <option>Per Year</option><option>Per Month</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COUNTRY CONFIG
══════════════════════════════════════════════════════════════ */
export function CountryConfigPage() {
  const [configs,        setConfigs]        = useState({});
  const [activeCountry,  setActiveCountry]  = useState('Saudi Arabia');
  const [editId,         setEditId]         = useState(null);
  const [editVal,        setEditVal]        = useState('');

  const load = () => getAllConfigs().then(r=>setConfigs(r.data)).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const saveEdit = async id => {
    try { await updateConfig(id,{param_value:editVal}); toast.success('Saved'); setEditId(null); load(); }
    catch { toast.error('Error'); }
  };

  const countryRows = configs[activeCountry] || [];
  const groups = [...new Set(countryRows.map(c=>c.param_group))].sort();

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 className="page-title">⚙️ Country Configuration</h1>
        <p className="page-sub">Edit tax rates, fees and parameters used in the calculation engine</p>
      </div>

      <div className="flex gap-2 mb-4">
        {['Saudi Arabia','India','Australia'].map(c=>(
          <button key={c} className={`btn ${activeCountry===c?'btn-primary':'btn-outline'}`} onClick={()=>setActiveCountry(c)}>
            {c==='Saudi Arabia'?'🇸🇦':c==='India'?'🇮🇳':'🇦🇺'} {c}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {groups.map(group=>(
          <div className="card" key={group}>
            <div className="card-header"><span style={{ fontWeight:600, color:'var(--primary)' }}>{group}</span></div>
            <table className="table">
              <thead><tr><th>Parameter</th><th>Value</th><th>Type</th><th style={{ width:140 }}>Actions</th></tr></thead>
              <tbody>
                {countryRows.filter(c=>c.param_group===group).map(cfg=>(
                  <tr key={cfg.id}>
                    <td style={{ fontWeight:500 }}>{cfg.param_label}</td>
                    <td>
                      {editId===cfg.id
                        ? <input className="form-control" value={editVal} onChange={e=>setEditVal(e.target.value)} style={{ width:180 }} />
                        : <span style={{ fontFamily:'monospace', fontWeight:500, color:'var(--primary)' }}>
                            {cfg.param_type==='percentage'
                              ? `${(parseFloat(cfg.param_value)*100).toFixed(3)}%`
                              : cfg.param_value}
                          </span>}
                    </td>
                    <td><span className="badge badge-gray">{cfg.param_type}</span></td>
                    <td>
                      {editId===cfg.id
                        ? <div className="flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={()=>saveEdit(cfg.id)}>Save</button>
                            <button className="btn btn-sm btn-outline" onClick={()=>setEditId(null)}>Cancel</button>
                          </div>
                        : <button className="btn btn-sm btn-outline" onClick={()=>{ setEditId(cfg.id); setEditVal(cfg.param_value); }}>Edit</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
