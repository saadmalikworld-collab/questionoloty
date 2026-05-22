import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { path:'/',                    label:'Dashboard',         icon:'🏠', admin:false },
  { path:'/calculator',          label:'Calculator',        icon:'🧮', admin:false },
  { divider:true, label:'Admin',                                        admin:true  },
  { path:'/admin/users',         label:'Users',             icon:'👥', admin:true  },
  { path:'/admin/roles',         label:'Roles & Rates',     icon:'💼', admin:true  },
  { path:'/admin/clients',       label:'Clients',           icon:'🏢', admin:true  },
  { path:'/admin/currencies',    label:'Currencies',        icon:'💱', admin:true  },
  { path:'/admin/insurance',     label:'Medical Insurance', icon:'🏥', admin:true  },
  { path:'/admin/country-config',label:'Country Config',    icon:'⚙️', admin:true  },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };
  const items = NAV.filter(n => !n.admin || isAdmin);
  const W = collapsed ? 64 : 228;

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <aside style={{ width:W, background:'var(--primary)', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0, zIndex:100, transition:'width .2s ease', overflow:'hidden' }}>
        <div style={{ padding: collapsed ? '18px 0' : '18px', borderBottom:'1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, margin: collapsed ? '0 auto' : 0 }}>
            <span style={{ fontSize:18 }}>📊</span>
          </div>
          {!collapsed && <span style={{ color:'#fff', fontWeight:700, fontSize:16 }}>Quoteology</span>}
        </div>
        <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
          {items.map((item, i) => {
            if (item.divider) return !collapsed
              ? <div key={i} style={{ padding:'14px 18px 4px', fontSize:10, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.1em' }}>{item.label}</div>
              : <div key={i} style={{ height:1, background:'rgba(255,255,255,.1)', margin:'8px 10px' }} />;
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:10,
                  padding: collapsed ? '10px 0' : '9px 18px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255,255,255,.62)',
                  textDecoration:'none', fontSize:13.5, fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  transition:'all .15s',
                })}>
                <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </NavLink>
            );
          })}
        </nav>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.1)', padding: collapsed ? '12px 0' : '12px 14px' }}>
          {!collapsed && <div style={{ marginBottom:8 }}><div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{user?.name}</div><div style={{ fontSize:11, color:'rgba(255,255,255,.5)', textTransform:'capitalize' }}>{user?.role}</div></div>}
          <div style={{ display:'flex', gap:6, justifyContent: collapsed ? 'center' : 'space-between' }}>
            <button onClick={() => setCollapsed(c => !c)} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'#fff', borderRadius:6, padding:'6px 10px', cursor:'pointer', fontSize:13 }}>{collapsed ? '→' : '←'}</button>
            {!collapsed && <button onClick={handleLogout} className="btn btn-sm" style={{ background:'rgba(239,68,68,.2)', color:'#fca5a5', border:'none', fontSize:12 }}>Sign Out</button>}
          </div>
        </div>
      </aside>
      <main style={{ marginLeft:W, flex:1, transition:'margin-left .2s ease', minWidth:0 }}>
        <div style={{ padding:'28px 30px', maxWidth:1400 }}>{children}</div>
      </main>
    </div>
  );
}
