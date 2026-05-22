import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login } from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#1e3a5f 0%,#2d5f8a 55%,#0ea5e9 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      {/* decorative circles */}
      {[200,320,460].map((s,i) => (
        <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', border:'1px solid rgba(255,255,255,.07)', top:`${10+i*12}%`, left:`${5+i*10}%`, pointerEvents:'none' }} />
      ))}

      <div style={{ width:'100%', maxWidth:400, position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:60, height:60, borderRadius:14, background:'rgba(255,255,255,.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:28 }}>📊</div>
          <h1 style={{ color:'#fff', fontSize:26, fontWeight:800, letterSpacing:'-.4px' }}>Quoteology</h1>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:13.5, marginTop:5 }}>Global Contractor Cost Platform</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,.97)', borderRadius:18, padding:34, boxShadow:'0 24px 60px rgba(0,0,0,.25)' }}>
          <h2 style={{ fontSize:19, fontWeight:700, color:'var(--primary)', marginBottom:4 }}>Sign in</h2>
          <p style={{ fontSize:13, color:'var(--text2)', marginBottom:24 }}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" placeholder="you@quoteology.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width:'100%', justifyContent:'center', marginTop:6 }}>
              {loading ? <><div className="spinner" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop:20, padding:'12px 14px', background:'#f0f4f8', borderRadius:8, fontSize:12, color:'var(--text2)', lineHeight:1.8 }}>
            <strong>Demo credentials:</strong><br/>
            Admin: admin@quoteology.com / Admin@123<br/>
            User: user@quoteology.com / User@123
          </div>
        </div>
      </div>
    </div>
  );
}
