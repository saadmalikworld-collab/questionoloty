import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRoles, getClients, getInsurance, getCountryConfig, calculate, exportPDF, exportExcel } from '../services/api';
import toast from 'react-hot-toast';

const COUNTRIES   = ['Saudi Arabia','India','Australia'];
const FREQUENCIES = ['Per Hour','Per Day','Per Week','Per Month','Per Year'];
const AUS_STATES  = ['New South Wales','Victoria','Australian Capital Territory','Queensland','South Australia','Northern Territory','Western Australia'];
const VISA_TYPES  = ['None','AP Iqama','China Harbour Iqama','Work Permit'];

const fmt = (v, d=2) => v == null ? '—' : parseFloat(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtP = v => v == null ? '' : (parseFloat(v)*100).toFixed(2)+'%';

function BRow({ label, rate, value, currency, isSubtotal, isTotal, indent }) {
  const bg    = isTotal ? '#1e3a5f' : isSubtotal ? '#dbeafe' : 'transparent';
  const color = isTotal ? '#fff' : '#1a2b3c';
  const fw    = isTotal || isSubtotal ? 600 : 400;
  const fs    = isTotal ? 14 : isSubtotal ? 13.5 : 13;
  const negColor = !isTotal && !isSubtotal && value < 0 ? '#ef4444' : color;
  return (
    <tr style={{ background: bg }}>
      <td style={{ padding:'8px 16px', paddingLeft: indent ? 30 : 16, fontSize:fs, fontWeight:fw, color, width:'54%' }}>{label}</td>
      <td style={{ padding:'8px 16px', fontSize:12, color: isTotal ? 'rgba(255,255,255,.75)' : '#64748b', textAlign:'right', width:'18%' }}>{rate != null ? fmtP(rate) : ''}</td>
      <td style={{ padding:'8px 16px', fontSize:fs, fontWeight:fw, color: negColor, textAlign:'right', width:'28%' }}>
        {value != null ? `${currency} ${fmt(value)}` : ''}
      </td>
    </tr>
  );
}

export default function CalculatorPage() {
  const [sp] = useSearchParams();
  const [country, setCountry]   = useState(sp.get('country') || 'Saudi Arabia');
  const [roles,   setRoles]     = useState([]);
  const [clients, setClients]   = useState([]);
  const [ins,     setIns]       = useState([]);
  const [result,  setResult]    = useState(null);
  const [loading, setLoading]   = useState(false);
  const [exporting, setExporting] = useState(null);

  const [f, setF] = useState({
    clientId:'', clientName:'', roleId:'', roleName:'',
    billRate:'', payFrequency:'Per Day',
    contractorType:'Expat', outputCurrency:'USD',
    medicalInsuranceName:'',
    includeEOSB:true, includeMOL:false, includeVisa:false,
    visaType:'None', includeMob:false, invoiceFromKSA:true,
    stateTerritory:'Western Australia',
  });

  const set = (k,v) => setF(p => ({...p,[k]:v}));

  // Load dropdowns once
  useEffect(() => {
    Promise.all([getRoles(),getClients(),getInsurance()]).then(([r,c,i]) => {
      setRoles(r.data); setClients(c.data); setIns(i.data);
    }).catch(()=>{});
  },[]);

  // Load country defaults when country changes
  useEffect(() => {
    setResult(null);
    getCountryConfig(country).then(({data}) => {
      const cfg = {};
      data.forEach(d => { cfg[d.param_key] = d.param_value; });
      const def = cfg.default_medical_insurance || '';
      setF(p => ({...p, medicalInsuranceName: def}));
    }).catch(()=>{});
  },[country]);

  const handleRole = id => {
    const r = roles.find(r => r.id === parseInt(id));
    setF(p => ({...p, roleId:id, roleName:r?.name||'', billRate: r ? r.rate : p.billRate}));
  };

  const handleClient = id => {
    const c = clients.find(c => c.id === parseInt(id));
    setF(p => ({...p, clientId:id, clientName:c?.name||''}));
  };

  const handleCalc = async () => {
    if (!f.billRate) return toast.error('Enter a bill rate');
    setLoading(true);
    try {
      const { data } = await calculate({
        country,
        inputs: {
          billRate: parseFloat(f.billRate), payFrequency: f.payFrequency,
          contractorType: f.contractorType, outputCurrency: f.outputCurrency,
          medicalInsuranceName: f.medicalInsuranceName,
          includeEOSB: f.includeEOSB, includeMOL: f.includeMOL,
          includeVisa: f.includeVisa, visaType: f.visaType,
          includeMob: f.includeMob, invoiceFromKSA: f.invoiceFromKSA,
          stateTerritory: f.stateTerritory,
        },
      });
      setResult(data);
      toast.success('Calculation complete!');
    } catch(err) { toast.error(err.response?.data?.message || 'Calculation failed'); }
    finally { setLoading(false); }
  };

  const doExport = async type => {
    if (!result) return;
    setExporting(type);
    try {
      const body = {
        country,
        inputs: {
          billRate:parseFloat(f.billRate), payFrequency:f.payFrequency,
          contractorType:f.contractorType, outputCurrency:f.outputCurrency,
          medicalInsuranceName:f.medicalInsuranceName,
          includeEOSB:f.includeEOSB, includeMOL:f.includeMOL,
          includeVisa:f.includeVisa, visaType:f.visaType,
          includeMob:f.includeMob, invoiceFromKSA:f.invoiceFromKSA,
          stateTerritory:f.stateTerritory,
        },
        clientName: f.clientName,
        roleName:   f.roleName,
      };
      if (type==='pdf') await exportPDF(body); else await exportExcel(body);
      toast.success(`${type.toUpperCase()} downloaded`);
    } catch { toast.error('Export failed'); }
    finally { setExporting(null); }
  };

  const bd = result?.breakdown;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 className="page-title">🧮 Cost Calculator</h1>
        <p className="page-sub">Calculate contractor placement costs with full breakdown</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:22, alignItems:'start' }}>
        {/* ── LEFT PANEL ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Country picker */}
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:600, color:'var(--primary)', fontSize:13.5 }}>🌍 Select Country</span></div>
            <div style={{ padding:14, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => setCountry(c)} className="btn"
                  style={{ flexDirection:'column', justifyContent:'center', padding:'11px 6px', gap:4,
                    background: country===c ? 'var(--primary)' : 'var(--surface2)',
                    color: country===c ? '#fff' : 'var(--text)',
                    border: country===c ? 'none' : '1.5px solid var(--border)',
                  }}>
                  <span style={{ fontSize:20 }}>{c==='Saudi Arabia'?'🇸🇦':c==='India'?'🇮🇳':'🇦🇺'}</span>
                  <span style={{ fontSize:10.5, textAlign:'center', lineHeight:1.3 }}>{c==='Saudi Arabia'?'Saudi Arabia':c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contract details */}
          <div className="card">
            <div className="card-header"><span style={{ fontWeight:600, color:'var(--primary)', fontSize:13.5 }}>📋 Contract Details</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Client</label>
                <select className="form-control" value={f.clientId} onChange={e => handleClient(e.target.value)}>
                  <option value="">— Select Client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Role / Scenario</label>
                <select className="form-control" value={f.roleId} onChange={e => handleRole(e.target.value)}>
                  <option value="">— Select Role —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name} ({r.currency_code} {fmt(r.rate)})</option>)}
                </select>
              </div>
              <div className="grid2">
                <div className="form-group">
                  <label className="form-label">Bill Rate</label>
                  <input className="form-control" type="number" placeholder="0.00" value={f.billRate} onChange={e => set('billRate',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-control" value={f.payFrequency} onChange={e => set('payFrequency',e.target.value)}>
                    {FREQUENCIES.map(x => <option key={x}>{x}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid2">
                <div className="form-group">
                  <label className="form-label">Contractor Type</label>
                  <select className="form-control" value={f.contractorType} onChange={e => set('contractorType',e.target.value)}>
                    <option>Expat</option>
                    <option>Local</option>
                    {country==='Saudi Arabia' && <option>Other</option>}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Output Currency</label>
                  <select className="form-control" value={f.outputCurrency} onChange={e => set('outputCurrency',e.target.value)}>
                    {['USD','GBP','EUR','SAR','INR','AUD','AED','QAR'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Country-specific settings */}
          <div className="card">
            <div className="card-header">
              <span style={{ fontWeight:600, color:'var(--primary)', fontSize:13.5 }}>
                {country==='Saudi Arabia'?'🇸🇦':country==='India'?'🇮🇳':'🇦🇺'} {country} Settings
              </span>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Medical Insurance</label>
                <select className="form-control" value={f.medicalInsuranceName} onChange={e => set('medicalInsuranceName',e.target.value)}>
                  <option value="None">None</option>
                  <option value="Percentage">Percentage of Rate</option>
                  {ins.map(p => <option key={p.id} value={p.name}>{p.name} ({p.currency_code} {fmt(p.amount)} /{p.frequency.replace('Per ','')})</option>)}
                </select>
              </div>

              {country==='Saudi Arabia' && <>
                <div className="form-group">
                  <label className="form-label">Invoice from Quoteology KSA?</label>
                  <select className="form-control" value={f.invoiceFromKSA?'yes':'no'} onChange={e => set('invoiceFromKSA',e.target.value==='yes')}>
                    <option value="yes">Yes — VAT 5%</option>
                    <option value="no">No — WHT 15%</option>
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                  {[['includeEOSB','EOSB'],['includeMOL','MOL'],['includeMob','Mob Costs'],['includeVisa','Visa']].map(([k,lbl]) => (
                    <label key={k} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                      <input type="checkbox" checked={f[k]} onChange={e => set(k,e.target.checked)} style={{ accentColor:'var(--primary)', cursor:'pointer' }} />
                      {lbl}
                    </label>
                  ))}
                </div>
                {f.includeVisa && (
                  <div className="form-group">
                    <label className="form-label">Visa Type</label>
                    <select className="form-control" value={f.visaType} onChange={e => set('visaType',e.target.value)}>
                      {VISA_TYPES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                )}
              </>}

              {country==='Australia' && (
                <div className="form-group">
                  <label className="form-label">State / Territory</label>
                  <select className="form-control" value={f.stateTerritory} onChange={e => set('stateTerritory',e.target.value)}>
                    {AUS_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <div style={{ fontSize:11.5, color:'var(--muted)', marginTop:4 }}>Determines payroll tax rate</div>
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleCalc} disabled={loading}
            style={{ justifyContent:'center' }}>
            {loading ? <><div className="spinner"/>Calculating...</> : '⚡ Calculate Cost'}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div>
          {!result ? (
            <div className="card" style={{ textAlign:'center', padding:'80px 40px' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🧮</div>
              <div style={{ fontSize:17, fontWeight:600, color:'var(--primary)', marginBottom:8 }}>Ready to Calculate</div>
              <div style={{ fontSize:13.5, color:'var(--text2)' }}>Fill in the form and click Calculate Cost</div>
            </div>
          ) : <>
            {/* Summary row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
              <div className="card" style={{ textAlign:'center', padding:'18px' }}>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:4 }}>Bill Rate / Day</div>
                <div style={{ fontSize:18, fontWeight:700, color:'var(--primary)' }}>{result.currency} {fmt(result.billRatePerDay)}</div>
              </div>
              <div style={{ background:'var(--primary)', borderRadius:'var(--r)', textAlign:'center', padding:'18px' }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.7)', marginBottom:4 }}>Invoice / Day (Post Tax)</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>{result.currency} {fmt(bd.invoicePostTax.value)}</div>
              </div>
              <div className="card" style={{ textAlign:'center', padding:'18px' }}>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:4 }}>Multiplier</div>
                <div style={{ fontSize:20, fontWeight:700, color:'var(--accent)' }}>{result.multiplierPostTax}x</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>Pre-tax: {result.multiplierPreTax}x</div>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ fontWeight:700, color:'var(--primary)', fontSize:14.5 }}>
                    Quoteology Billing Breakdown — {result.payFrequency} Basis
                  </div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>
                    {result.country} · {result.contractorType} · {result.currency}
                    {result.stateTerritory ? ` · ${result.stateTerritory}` : ''}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => doExport('pdf')} disabled={!!exporting}>
                    {exporting==='pdf' ? '...' : '📄 PDF'}
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={() => doExport('excel')} disabled={!!exporting}>
                    {exporting==='excel' ? '...' : '📊 Excel'}
                  </button>
                </div>
              </div>

              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#1e3a5f' }}>
                      <th style={{ padding:'10px 16px', textAlign:'left', color:'#fff', fontSize:12, fontWeight:600 }}>Description</th>
                      <th style={{ padding:'10px 16px', textAlign:'right', color:'rgba(255,255,255,.75)', fontSize:12, fontWeight:600, width:120 }}>Rate %</th>
                      <th style={{ padding:'10px 16px', textAlign:'right', color:'rgba(255,255,255,.75)', fontSize:12, fontWeight:600, width:180 }}>Amount/Day ({result.currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    <BRow label="Net Rate to Man"           rate={null}                value={bd.netRateToMan.value}    currency={result.currency} />
                    {bd.ssEmployee?.value!==0 && bd.ssEmployee && <BRow label={bd.ssEmployee.label} rate={bd.ssEmployee.rate} value={bd.ssEmployee.value} currency={result.currency} indent />}
                    {bd.pitTopRate  && <BRow label={bd.pitTopRate.label}  rate={bd.pitTopRate.rate}  value={bd.pitTopRate.value}  currency={result.currency} indent />}
                    {bd.surcharge   && <BRow label={bd.surcharge.label}   rate={bd.surcharge.rate}   value={bd.surcharge.value}   currency={result.currency} indent />}
                    {bd.edCess      && <BRow label={bd.edCess.label}      rate={bd.edCess.rate}      value={bd.edCess.value}      currency={result.currency} indent />}
                    {bd.topRateTax  && <BRow label={bd.topRateTax.label}  rate={bd.topRateTax.rate}  value={bd.topRateTax.value}  currency={result.currency} indent />}
                    <BRow label="Gross Rate to Man" rate={null} value={bd.grossRateToMan.value} currency={result.currency} isSubtotal />

                    {bd.salarySplit?.map((s,i) => <BRow key={i} label={s.label} rate={s.rate} value={s.value} currency={result.currency} indent />)}

                    <tr style={{ background:'#f0f7ff' }}>
                      <td style={{ padding:'8px 16px', fontWeight:600, fontSize:13, color:'var(--primary)' }}>In-Country Burdens</td>
                      <td></td>
                      <td style={{ padding:'8px 16px', textAlign:'right', fontWeight:600, fontSize:13, color:'var(--primary)' }}>{result.currency} {fmt(bd.burdens.total)}</td>
                    </tr>
                    {bd.burdens.items.filter(x=>x.value!==0).map((x,i) => <BRow key={i} label={x.label} rate={x.rate} value={x.value} currency={result.currency} indent />)}

                    <BRow label="Gross Rate Post Employer Burdens" rate={null} value={bd.grossRatePostBurdens.value} currency={result.currency} isSubtotal />
                    <BRow label="Quoteology Fee" rate={bd.quoteologyFee.rate} value={bd.quoteologyFee.value} currency={result.currency} indent />
                    <BRow label="Invoice Value Pre Tax"  rate={null} value={bd.invoicePreTax.value}  currency={result.currency} isSubtotal />
                    <BRow label={bd.tax.label}           rate={bd.tax.rate}   value={bd.tax.value}             currency={result.currency} indent />
                    <BRow label="Invoice Value Post Tax" rate={null} value={bd.invoicePostTax.value} currency={result.currency} isTotal />
                  </tbody>
                </table>
              </div>

              {/* Multiplier footer */}
              <div style={{ padding:'14px 20px', background:'var(--surface2)', borderTop:'1px solid var(--border)', display:'flex', gap:28, flexWrap:'wrap' }}>
                {[
                  ['Multiplier (Pre-Tax)',  `${result.multiplierPreTax}x`,  'var(--primary)'],
                  ['Multiplier (Post-Tax)', `${result.multiplierPostTax}x`, 'var(--accent)'],
                  ['Bill Rate / Day',       `${result.currency} ${fmt(result.billRatePerDay)}`, 'var(--text)'],
                ].map(([lbl,val,color]) => (
                  <div key={lbl}>
                    <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.05em' }}>{lbl}</div>
                    <div style={{ fontSize:17, fontWeight:700, color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
