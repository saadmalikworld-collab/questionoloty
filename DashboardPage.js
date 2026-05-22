import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCurrencies, getRoles, getInsurance, getUsers } from '../services/api';

const Stat = ({ label, value, icon, color, onClick }) => (
  <div className="card" onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default', overflow:'hidden', position:'relative', transition:'transform .15s,box-shadow .15s' }}
    onMouseEnter={e => onClick && Object.assign(e.currentTarget.style, { transform:'translateY(-2px)', boxShadow:'0 8px 24px rgba(0,0,0,.12)' })}
    onMouseLeave={e => onClick && Object.assign(e.currentTarget.style, { transform:'none', boxShadow:'' })}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color }} />
    <div className="card-body" style={{ display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:46, height:46, borderRadius:12, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:12.5, color:'var(--text2)', marginBottom:3 }}>{label}</div>
        <div style={{ fontSize:26, fontWeight:700, color:'var(--primary)', lineHeight:1 }}>{value}</div>
      </div>
    </div>
  </div>
);

const CountryCard = ({ flag, name, desc, onClick }) => (
  <div className="card" onClick={onClick}
    style={{ cursor:'pointer', overflow:'hidden', transition:'all .15s' }}
    onMouseEnter={e => Object.assign(e.currentTarget.style, { transform:'translateY(-3px)', boxShadow:'0 12px 30px rgba(30,58,95,.15)' })}
    onMouseLeave={e => Object.assign(e.currentTarget.style, { transform:'none', boxShadow:'' })}>
    <div style={{ background:'linear-gradient(135deg,var(--primary) 0%,#2d5f8a 100%)', padding:'22px 20px', display:'flex', alignItems:'center', gap:14 }}>
      <span style={{ fontSize:32 }}>{flag}</span>
      <div>
        <div style={{ color:'#fff', fontSize:16, fontWeight:700 }}>{name}</div>
        <div style={{ color:'rgba(255,255,255,.65)', fontSize:12, marginTop:2 }}>{desc}</div>
      </div>
    </div>
    <div style={{ padding:'12px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontSize:13, color:'var(--text2)' }}>Click to calculate</span>
      <span style={{ color:'var(--accent)', fontSize:18 }}>→</span>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ currencies:0, roles:0, insurance:0, users:0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [c, r, ins] = await Promise.all([getCurrencies(), getRoles(), getInsurance()]);
        let u = { data:[] };
        if (isAdmin) { try { u = await getUsers(); } catch {} }
        setStats({ currencies:c.data.length, roles:r.data.length, insurance:ins.data.length, users:u.data.length });
      } catch {}
    };
    load();
  }, [isAdmin]);

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12.5, color:'var(--text2)', marginBottom:4 }}>
          {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </div>
        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--primary)', letterSpacing:'-.4px' }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'var(--text2)', marginTop:5, fontSize:13.5 }}>
          Welcome to Quoteology — your global contractor cost calculation platform
        </p>
      </div>

      {/* Hero CTA */}
      <div style={{ background:'linear-gradient(135deg,#1e3a5f 0%,#0ea5e9 100%)', borderRadius:14, padding:'26px 30px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, boxShadow:'0 8px 30px rgba(14,165,233,.28)', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ color:'rgba(255,255,255,.75)', fontSize:12, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:6 }}>Quick Action</div>
          <div style={{ color:'#fff', fontSize:20, fontWeight:700, marginBottom:4 }}>Start a New Calculation</div>
          <div style={{ color:'rgba(255,255,255,.7)', fontSize:13.5 }}>Saudi Arabia · India · Australia</div>
        </div>
        <button className="btn btn-lg" onClick={() => navigate('/calculator')}
          style={{ background:'#fff', color:'var(--primary)', fontWeight:700, boxShadow:'0 4px 14px rgba(0,0,0,.15)', flexShrink:0 }}>
          🧮 Open Calculator
        </button>
      </div>

      {/* Stat widgets */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:18, marginBottom:28 }}>
        <Stat label="Supported Countries" value="3"            icon="🌍" color="#0ea5e9" onClick={() => navigate('/calculator')} />
        <Stat label="Active Roles"         value={stats.roles} icon="💼" color="#10b981" onClick={isAdmin ? () => navigate('/admin/roles') : null} />
        <Stat label="Insurance Plans"      value={stats.insurance} icon="🏥" color="#f59e0b" onClick={isAdmin ? () => navigate('/admin/insurance') : null} />
        <Stat label="Currencies"           value={stats.currencies} icon="💱" color="#8b5cf6" onClick={isAdmin ? () => navigate('/admin/currencies') : null} />
        {isAdmin && <Stat label="Users" value={stats.users} icon="👥" color="#ef4444" onClick={() => navigate('/admin/users')} />}
      </div>

      {/* Country cards */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--primary)', marginBottom:14 }}>Calculate by Country</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:18 }}>
          <CountryCard flag="🇸🇦" name="Saudi Arabia" desc="VAT/WHT · EOSB · Cigna Insurance"      onClick={() => navigate('/calculator?country=Saudi+Arabia')} />
          <CountryCard flag="🇮🇳" name="India"        desc="GST 18% · PF/PIT · AXA Bharti"         onClick={() => navigate('/calculator?country=India')} />
          <CountryCard flag="🇦🇺" name="Australia"    desc="GST 10% · Superannuation · Payroll Tax" onClick={() => navigate('/calculator?country=Australia')} />
        </div>
      </div>

      {/* Admin quick links */}
      {isAdmin && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:600, color:'var(--primary)' }}>⚙️ Admin Quick Links</span></div>
            <div className="card-body" style={{ padding:'8px 0' }}>
              {[
                { label:'Manage Users',            path:'/admin/users',          icon:'👥' },
                { label:'Update Currency Rates',   path:'/admin/currencies',     icon:'💱' },
                { label:'Manage Insurance Plans',  path:'/admin/insurance',      icon:'🏥' },
                { label:'Country Configuration',   path:'/admin/country-config', icon:'⚙️' },
              ].map(lnk => (
                <div key={lnk.path} onClick={() => navigate(lnk.path)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 22px', borderBottom:'1px solid var(--border)', cursor:'pointer', fontSize:13.5 }}
                  onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span>{lnk.icon}</span><span>{lnk.label}</span>
                  <span style={{ marginLeft:'auto', color:'var(--accent)' }}>→</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:600, color:'var(--primary)' }}>📋 About Quoteology</span></div>
            <div className="card-body">
              <p style={{ fontSize:13.5, color:'var(--text2)', lineHeight:1.75 }}>
                <strong>Quoteology</strong> replaces your Excel cost modelling workbook with a fast, accurate web platform.
              </p>
              <p style={{ fontSize:13.5, color:'var(--text2)', lineHeight:1.75, marginTop:10 }}>
                Calculate contractor costs for <strong>Saudi Arabia</strong>, <strong>India</strong>, and <strong>Australia</strong> with full line-item breakdowns. Export quotes as branded <strong>PDF</strong> or <strong>Excel</strong> files in one click.
              </p>
              <p style={{ fontSize:13.5, color:'var(--text2)', lineHeight:1.75, marginTop:10 }}>
                All tax rates, fees, and insurance plans are fully configurable by administrators without touching any code.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
