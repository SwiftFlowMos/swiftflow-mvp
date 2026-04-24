import { useState, useEffect, useRef } from "react";

// ── RÉFÉRENTIELS ──
const CLIENTS = [
  { id:"CLI-001", name:"MAROC TELECOM SA",     account:"MA64 0110 0001 0010 0100 1000 1", rating:"A",  kycDate:"2025-11-15", limit:5000000  },
  { id:"CLI-002", name:"OCP SA",               account:"MA64 0110 0002 0020 0200 2000 2", rating:"A+", kycDate:"2025-09-20", limit:10000000 },
  { id:"CLI-003", name:"CIMENTS DU MAROC",     account:"MA64 0110 0003 0030 0300 3000 3", rating:"B",  kycDate:"2025-08-10", limit:2000000  },
  { id:"CLI-004", name:"DELTA HOLDING SA",     account:"MA64 0110 0004 0040 0400 4000 4", rating:"B+", kycDate:"2025-12-01", limit:3000000  },
  { id:"CLI-005", name:"SIEMENS MAROC SARL",   account:"MA64 0110 0005 0050 0500 5000 5", rating:"A",  kycDate:"2026-01-15", limit:4000000  },
  { id:"CLI-006", name:"TOTAL MAROC SA",       account:"MA64 0110 0006 0060 0600 6000 6", rating:"A",  kycDate:"2025-10-30", limit:6000000  },
];
const CURRENCIES = [
  { code:"EUR", label:"Euro",             flag:"🇪🇺", rate:1     },
  { code:"USD", label:"Dollar US",        flag:"🇺🇸", rate:1.085 },
  { code:"GBP", label:"Livre Sterling",   flag:"🇬🇧", rate:0.856 },
  { code:"MAD", label:"Dirham Marocain",  flag:"🇲🇦", rate:10.92 },
  { code:"CAD", label:"Dollar Canadien",  flag:"🇨🇦", rate:1.47  },
  { code:"CHF", label:"Franc Suisse",     flag:"🇨🇭", rate:0.962 },
  { code:"AED", label:"Dirham Émirien",   flag:"🇦🇪", rate:3.985 },
];
const COUNTRIES = [
  { code:"MA", label:"Maroc",          flag:"🇲🇦", fatf:"BLANC" },
  { code:"FR", label:"France",         flag:"🇫🇷", fatf:"BLANC" },
  { code:"DE", label:"Allemagne",      flag:"🇩🇪", fatf:"BLANC" },
  { code:"GB", label:"Royaume-Uni",    flag:"🇬🇧", fatf:"BLANC" },
  { code:"US", label:"États-Unis",     flag:"🇺🇸", fatf:"BLANC" },
  { code:"AE", label:"Émirats Arabes", flag:"🇦🇪", fatf:"BLANC" },
  { code:"TN", label:"Tunisie",        flag:"🇹🇳", fatf:"BLANC" },
  { code:"DZ", label:"Algérie",        flag:"🇩🇿", fatf:"GRIS"  },
  { code:"SN", label:"Sénégal",        flag:"🇸🇳", fatf:"BLANC" },
  { code:"IR", label:"Iran",           flag:"🇮🇷", fatf:"NOIR"  },
];
const CORRESPONDENTS = [
  { bic:"DEUTDEFFXXX", name:"Deutsche Bank AG",   country:"DE", currencies:["EUR","USD","GBP"] },
  { bic:"BNPAFRPPXXX", name:"BNP Paribas SA",     country:"FR", currencies:["EUR","USD","MAD"] },
  { bic:"CITIUS33XXX", name:"Citibank N.A.",       country:"US", currencies:["USD","EUR"]       },
  { bic:"BARCGB22XXX", name:"Barclays Bank PLC",  country:"GB", currencies:["GBP","EUR","USD"] },
  { bic:"SOCGFRP1XXX", name:"Société Générale",   country:"FR", currencies:["EUR","USD","MAD"] },
  { bic:"HSBCGB2LXXX", name:"HSBC Bank PLC",      country:"GB", currencies:["GBP","USD","EUR"] },
];
const BENE_BANKS = [
  { bic:"BNPAFRPPXXX", name:"BNP Paribas SA",        country:"FR", city:"Paris"       },
  { bic:"DEUTDEFFXXX", name:"Deutsche Bank AG",       country:"DE", city:"Frankfurt"   },
  { bic:"ATTMMAMC",    name:"Attijariwafa Bank",      country:"MA", city:"Casablanca"  },
  { bic:"BCDMMAMC",    name:"BMCE Bank",              country:"MA", city:"Casablanca"  },
  { bic:"CITIUS33XXX", name:"Citibank N.A.",          country:"US", city:"New York"    },
  { bic:"BARCGB22XXX", name:"Barclays Bank PLC",      country:"GB", city:"London"      },
  { bic:"HSBCGB2LXXX", name:"HSBC Bank PLC",         country:"GB", city:"London"      },
];
const INCOTERMS = [
  { code:"FOB", label:"Free On Board",              desc:"Risque transféré à bord du navire",         transport:"Mer"  },
  { code:"CIF", label:"Cost Insurance & Freight",   desc:"Vendeur paie fret et assurance maritime",   transport:"Mer"  },
  { code:"CFR", label:"Cost & Freight",             desc:"Vendeur paie le fret maritime",             transport:"Mer"  },
  { code:"EXW", label:"Ex Works",                   desc:"Risque transféré dès mise à disposition",   transport:"Tous" },
  { code:"DDP", label:"Delivered Duty Paid",        desc:"Risque maximum vendeur — livré dédouané",   transport:"Tous" },
  { code:"DAP", label:"Delivered at Place",         desc:"Livré à destination, non dédouané",         transport:"Tous" },
  { code:"FCA", label:"Free Carrier",               desc:"Risque transféré au transporteur désigné",  transport:"Tous" },
  { code:"CPT", label:"Carriage Paid To",           desc:"Vendeur paie le fret jusqu'à destination",  transport:"Tous" },
];

// ── HELPERS ──
function validateIBAN(iban) {
  const c = iban.replace(/\s/g,"").toUpperCase();
  if (c.length < 15 || c.length > 34) return false;
  const r = c.slice(4)+c.slice(0,4);
  const n = r.replace(/[A-Z]/g, ch => ch.charCodeAt(0)-55);
  let rem = 0;
  for (const d of n) rem = (rem*10+parseInt(d))%97;
  return rem===1;
}
function validateBIC(bic) {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.replace(/\s/g,"").toUpperCase());
}
function fmtAmount(v) {
  if (!v) return "";
  return parseFloat(v).toLocaleString("fr-FR", {minimumFractionDigits:2,maximumFractionDigits:2});
}
const genRef = () => `TRF-${Date.now().toString().slice(-8)}`;

// ── SEARCH DROPDOWN ──
function SearchDrop({ items, value, onChange, placeholder, renderItem, renderValue, filterFn, label, required, badge }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const results = q.length>0 ? items.filter(i => filterFn(i, q)).slice(0,7) : items.slice(0,7);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <label style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"#7A8BA0"}}>
          {label}{required&&<span style={{color:"#F5A623",marginLeft:3}}>*</span>}
        </label>
        {badge&&<span style={{fontSize:9,padding:"1px 7px",borderRadius:20,background:"rgba(6,182,212,.12)",border:"1px solid rgba(6,182,212,.25)",color:"#06b6d4",fontWeight:700}}>{badge}</span>}
      </div>
      {value ? (
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",background:"rgba(6,182,212,.07)",border:"1.5px solid rgba(6,182,212,.35)",borderRadius:9,cursor:"pointer"}}
          onClick={()=>{onChange(null);setQ("");}}>
          <div style={{flex:1,fontSize:12,color:"#E2EAF2",fontFamily:"'JetBrains Mono',monospace"}}>{renderValue(value)}</div>
          <span style={{color:"#3E5470",fontSize:13,lineHeight:1}}>✕</span>
        </div>
      ) : (
        <div style={{position:"relative"}}>
          <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)}
            placeholder={placeholder}
            style={{width:"100%",background:"rgba(10,18,32,0.8)",border:"1.5px solid #1D3250",borderRadius:9,padding:"9px 36px 9px 12px",fontSize:12,color:"#C8D8EA",fontFamily:"'JetBrains Mono',monospace",outline:"none",transition:"border-color .2s"}}
            onMouseEnter={e=>e.target.style.borderColor="#2A4A6E"}
            onMouseLeave={e=>e.target.style.borderColor="#1D3250"}
          />
          <span style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#2A4060"}}>⌕</span>
        </div>
      )}
      {open && !value && results.length>0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:300,marginTop:4,background:"#0C1628",border:"1.5px solid rgba(6,182,212,.3)",borderRadius:10,boxShadow:"0 20px 50px rgba(0,0,0,.7)",overflow:"hidden"}}>
          {results.map((item,i)=>(
            <div key={i} onClick={()=>{onChange(item);setOpen(false);setQ("");}}
              style={{padding:"11px 14px",borderBottom:i<results.length-1?"1px solid rgba(255,255,255,.04)":"none",cursor:"pointer",transition:"background .12s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(6,182,212,.07)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
      {open && !value && q.length>1 && results.length===0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:300,marginTop:4,background:"#0C1628",border:"1.5px solid #1D3250",borderRadius:10,padding:"14px",textAlign:"center",color:"#2A4060",fontSize:12}}>
          Aucun résultat pour « {q} »
        </div>
      )}
    </div>
  );
}

// ── CONTROL BADGE ──
function Ctrl({status,label}) {
  const cfg = {
    valid:   {c:"#10b981",bg:"rgba(16,185,129,.1)", b:"rgba(16,185,129,.25)", icon:"✓"},
    error:   {c:"#ef4444",bg:"rgba(239,68,68,.1)",  b:"rgba(239,68,68,.25)",  icon:"✕"},
    warning: {c:"#f59e0b",bg:"rgba(245,158,11,.1)", b:"rgba(245,158,11,.25)", icon:"⚠"},
    checking:{c:"#06b6d4",bg:"rgba(6,182,212,.1)",  b:"rgba(6,182,212,.25)",  icon:"◌"},
    pending: {c:"#3E5470",bg:"rgba(62,84,112,.1)",  b:"rgba(62,84,112,.25)",  icon:"○"},
  }[status]||{c:"#3E5470",bg:"rgba(62,84,112,.1)",b:"rgba(62,84,112,.25)",icon:"○"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:cfg.bg,border:`1px solid ${cfg.b}`,color:cfg.c,fontFamily:"monospace"}}>
      <span style={status==="checking"?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{cfg.icon}</span> {label}
    </span>
  );
}

// ── FIELD WRAPPER ──
function F({label,required,controls,hint,children,span=1}) {
  return (
    <div style={{gridColumn:`span ${span}`,display:"flex",flexDirection:"column",gap:5}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <label style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"#7A8BA0"}}>
          {label}{required&&<span style={{color:"#F5A623",marginLeft:3}}>*</span>}
        </label>
        {controls&&<div style={{display:"flex",gap:4}}>{controls}</div>}
      </div>
      {children}
      {hint&&<p style={{fontSize:10,color:"#2A4060",marginTop:1}}>{hint}</p>}
    </div>
  );
}

// ── TEXT INPUT ──
function TI({value,onChange,placeholder,type="text",readOnly=false,borderColor,style={}}) {
  return (
    <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      style={{width:"100%",background:readOnly?"rgba(10,18,32,.5)":"rgba(10,18,32,.8)",border:`1.5px solid ${borderColor||"#1D3250"}`,borderRadius:9,padding:"9px 12px",fontSize:12,color:readOnly?"#4A6080":"#C8D8EA",fontFamily:"'JetBrains Mono',monospace",outline:"none",transition:"border-color .2s",...style}}
      onFocus={e=>!readOnly&&(e.target.style.borderColor="#2A6090")}
      onBlur={e=>e.target.style.borderColor=borderColor||"#1D3250"}
    />
  );
}

// ── SECTION ──
function Section({icon,title,sub,children,accent="#06b6d4"}) {
  return (
    <div style={{background:"rgba(8,15,28,.7)",border:`1px solid rgba(255,255,255,.06)`,borderRadius:14,overflow:"hidden",backdropFilter:"blur(8px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.04)",background:`linear-gradient(90deg, ${accent}08, transparent)`}}>
        <div style={{width:32,height:32,borderRadius:9,background:`${accent}15`,border:`1px solid ${accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{icon}</div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#C8D8EA",letterSpacing:.3}}>{title}</div>
          {sub&&<div style={{fontSize:10,color:"#3E5470",marginTop:1}}>{sub}</div>}
        </div>
      </div>
      <div style={{padding:"18px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {children}
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function PaymentEntry() {
  const [orderId] = useState(genRef);
  const [step, setStep] = useState(1); // 1=form, 2=recap, 3=done
  // Référentiels
  const [client, setClient] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [country, setCountry] = useState(null);
  const [beneBank, setBeneBank] = useState(null);
  const [correspondent, setCorrespondent] = useState(null);
  const [incoterm, setIncoterm] = useState(null);
  // Champs libres
  const [amount, setAmount] = useState("");
  const [valueDate, setValueDate] = useState(new Date(Date.now()+86400000).toISOString().split("T")[0]);
  const [charges, setCharges] = useState("SHA");
  const [beneName, setBeneName] = useState("");
  const [beneAddress, setBeneAddress] = useState("");
  const [beneIBAN, setBeneIBAN] = useState("");
  const [reference, setReference] = useState("");
  const [details, setDetails] = useState("");
  // MAD
  const [madType, setMadType] = useState("");
  const [domRef, setDomRef] = useState("");
  const [domBank, setDomBank] = useState("");
  const [domDate, setDomDate] = useState("");
  // Contrôles
  const [ibanCtrl, setIbanCtrl] = useState("pending");
  const [bicCtrl, setBicCtrl] = useState("pending");
  const [amlCtrl, setAmlCtrl] = useState("pending");
  const [amlMsg, setAmlMsg] = useState(null);
  const amlTimer = useRef();

  const isMAD = currency?.code === "MAD";
  const needsDom = isMAD && madType === "COMMERCIAL";
  const eurEquiv = amount && currency && currency.code !== "EUR"
    ? (parseFloat(amount)/currency.rate).toFixed(2) : null;
  const overLimit = client && amount && parseFloat(amount) > client.limit;
  const fatfIssue = country && country.fatf !== "BLANC";

  // IBAN validation
  useEffect(() => {
    if (!beneIBAN || beneIBAN.length < 5) { setIbanCtrl("pending"); return; }
    setIbanCtrl("checking");
    const t = setTimeout(() => setIbanCtrl(validateIBAN(beneIBAN) ? "valid" : "error"), 600);
    return () => clearTimeout(t);
  }, [beneIBAN]);

  // BIC auto-fill quand banque sélectionnée — validé implicitement
  useEffect(() => {
    if (beneBank) setBicCtrl("valid");
    else setBicCtrl("pending");
  }, [beneBank]);

  // AML
  useEffect(() => {
    if (!beneName || beneName.length < 3) { setAmlCtrl("pending"); setAmlMsg(null); return; }
    setAmlCtrl("checking"); setAmlMsg(null);
    clearTimeout(amlTimer.current);
    amlTimer.current = setTimeout(() => {
      const blocked = ["IRAN","SYRIE","CUBA","CORÉE"].some(s=>beneName.toUpperCase().includes(s));
      const alert   = beneName.toUpperCase().includes("TEST") || beneName.toUpperCase().includes("RISK");
      if (blocked) { setAmlCtrl("error");   setAmlMsg("Match liste sanctions OFAC/UE — ordre bloqué"); }
      else if (alert) { setAmlCtrl("warning"); setAmlMsg("Score risque élevé — contrôle renforcé requis"); }
      else { setAmlCtrl("valid");   setAmlMsg("Conforme — aucun match détecté"); }
    }, 1600);
  }, [beneName, country]);

  const canSubmit = () =>
    client && currency && country && beneName && beneIBAN && beneBank &&
    amount && !overLimit && ibanCtrl==="valid" && amlCtrl!=="error" && amlCtrl!=="pending" &&
    (!isMAD || madType) && (!needsDom || (domRef && domBank));

  const formatIBAN = v => { const c=v.replace(/\s/g,"").toUpperCase(); return c.match(/.{1,4}/g)?.join(" ")||c; };

  if (step===3) return (
    <div style={{fontFamily:"'JetBrains Mono','Courier New',monospace",background:"linear-gradient(135deg,#050C1A 0%,#091525 100%)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#C8D8EA"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{textAlign:"center",animation:"fadeUp .5s ease forwards"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(16,185,129,.12)",border:"2px solid rgba(16,185,129,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px",boxShadow:"0 0 40px rgba(16,185,129,.15)"}}>✓</div>
        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:"#E2EAF2",marginBottom:8}}>Ordre soumis avec succès</div>
        <div style={{fontSize:13,color:"#06b6d4",marginBottom:6}}>{orderId}</div>
        <div style={{fontSize:12,color:"#3E5470",marginBottom:32}}>Transmis au circuit de validation · {new Date().toLocaleTimeString("fr-FR")}</div>
        <button onClick={()=>window.location.reload()} style={{padding:"11px 28px",borderRadius:10,background:"linear-gradient(135deg,#0891b2,#0e7490)",border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Nouvel ordre</button>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:"'JetBrains Mono','Courier New',monospace",background:"linear-gradient(135deg,#050C1A 0%,#091525 100%)",minHeight:"100vh",color:"#C8D8EA"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} input,select,textarea{font-family:inherit} select option{background:#0C1628}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#050C1A}::-webkit-scrollbar-thumb{background:#1D3250;border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .field-in:focus{border-color:#2A6090!important;box-shadow:0 0 0 3px rgba(6,182,212,.08)!important}
        .row-hover:hover{background:rgba(6,182,212,.04)!important}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(5,12,26,.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{maxWidth:920,margin:"0 auto",padding:"0 28px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#0E6494,#094D72)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 0 20px rgba(14,100,148,.4)"}}>⚡</div>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:17,color:"#E2EAF2",letterSpacing:".5px"}}>
                SWIFT<span style={{color:"#0EA5E9"}}>FLOW</span>
              </div>
              <div style={{fontSize:9,color:"#2A4060",letterSpacing:"0.2em",textTransform:"uppercase"}}>International Payments</div>
            </div>
          </div>

          {/* Steps */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {["Saisie","Vérification","Validation"].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,background:step>i+1?"#0891b2":step===i+1?"transparent":"transparent",border:step===i+1?"1.5px solid #0891b2":step>i+1?"1.5px solid #0891b2":"1.5px solid #1D3250",color:step>=i+1?"#0891b2":"#2A4060"}}>
                    {step>i+1?"✓":i+1}
                  </div>
                  <span style={{fontSize:11,color:step===i+1?"#0891b2":"#2A4060"}}>{s}</span>
                </div>
                {i<2&&<div style={{width:20,height:1,background:step>i+1?"rgba(8,145,178,.5)":"#1D3250"}}/>}
              </div>
            ))}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#10b981",animation:"pulse 2s ease-in-out infinite"}}/>
            <span style={{fontSize:10,color:"#10b981",letterSpacing:"0.15em"}}>EN LIGNE</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:920,margin:"0 auto",padding:"28px 28px 60px"}}>

        {/* ── ORDRE REF BANNER ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 18px",background:"rgba(8,15,30,.6)",border:"1px solid rgba(255,255,255,.05)",borderRadius:10,marginBottom:22,backdropFilter:"blur(8px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:10,color:"#2A4060",letterSpacing:"0.15em",textTransform:"uppercase"}}>Référence ordre</span>
            <span style={{fontSize:14,color:"#0EA5E9",fontWeight:700,letterSpacing:"0.1em"}}>{orderId}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontSize:11,color:"#3E5470"}}>Saisisseur : <span style={{color:"#7A8BA0"}}>Khalid Benali</span></span>
            <span style={{fontSize:11,color:"#3E5470"}}>Date valeur :</span>
            <input type="date" value={valueDate} onChange={e=>setValueDate(e.target.value)}
              style={{background:"transparent",border:"1px solid #1D3250",borderRadius:7,padding:"3px 8px",fontSize:11,color:"#7A8BA0",fontFamily:"inherit",outline:"none",colorScheme:"dark"}}/>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16,animation:"fadeUp .4s ease forwards"}}>

          {/* ── 1. DONNEUR D'ORDRE ── */}
          <Section icon="🏢" title="Donneur d'ordre" sub="Sélection depuis le référentiel clients (Core Banking)" accent="#0EA5E9">
            <div style={{gridColumn:"span 2"}}>
              <SearchDrop items={CLIENTS} value={client} onChange={setClient} label="Client donneur d'ordre" required
                placeholder="Rechercher par raison sociale ou code client…"
                badge="📋 Référentiel local"
                filterFn={(c,q)=>c.name.toLowerCase().includes(q.toLowerCase())||c.id.toLowerCase().includes(q.toLowerCase())}
                renderValue={c=>`${c.name}  ·  ${c.id}`}
                renderItem={c=>(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#C8D8EA"}}>{c.name}</div>
                      <div style={{fontSize:10,color:"#3E5470",marginTop:2}}>{c.id} · Compte : {c.account.slice(0,20)}…</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.25)",color:"#10b981"}}>Rating {c.rating}</span>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:"rgba(6,182,212,.08)",border:"1px solid rgba(6,182,212,.2)",color:"#06b6d4"}}>KYC {c.kycDate}</span>
                    </div>
                  </div>
                )}
              />
              {client && (
                <div style={{marginTop:10,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[["Compte",client.account.slice(0,22)+"…"],["Rating",client.rating],["Plafond",client.limit.toLocaleString("fr-FR")+" MAD"],["KYC",client.kycDate]].map(([l,v])=>(
                    <div key={l} style={{padding:"7px 10px",background:"rgba(6,182,212,.05)",border:"1px solid rgba(6,182,212,.12)",borderRadius:7}}>
                      <div style={{fontSize:9,color:"#2A4060",textTransform:"uppercase",letterSpacing:".1em",marginBottom:2}}>{l}</div>
                      <div style={{fontSize:11,color:"#7A8BA0",fontWeight:600}}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* ── 2. MONTANT & DEVISE ── */}
          <Section icon="💱" title="Montant & Devise" sub="Contrôle plafond client et équivalent EUR en temps réel" accent="#8B5CF6">
            <F label="Montant" required span={1}>
              <div style={{position:"relative"}}>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"
                  style={{width:"100%",background:"rgba(10,18,32,.8)",border:`1.5px solid ${overLimit?"rgba(239,68,68,.6)":amount?"#2A4A6E":"#1D3250"}`,borderRadius:9,padding:"9px 52px 9px 12px",fontSize:20,fontWeight:700,color:overLimit?"#fca5a5":"#E2EAF2",fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
                <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#0EA5E9",fontWeight:700,fontSize:14}}>{currency?.code||"—"}</span>
              </div>
              {overLimit&&<p style={{fontSize:10,color:"#ef4444",marginTop:3}}>✕ Dépasse le plafond client ({client.limit.toLocaleString("fr-FR")})</p>}
              {eurEquiv&&!overLimit&&<div style={{fontSize:10,color:"#3E6080",marginTop:3}}>≈ {parseFloat(eurEquiv).toLocaleString("fr-FR")} EUR · taux {(1/currency.rate).toFixed(4)}</div>}
            </F>
            <SearchDrop items={CURRENCIES} value={currency} onChange={setCurrency} label="Devise" required
              placeholder="EUR, USD, MAD, GBP…" badge="ISO 4217"
              filterFn={(c,q)=>c.code.toLowerCase().includes(q.toLowerCase())||c.label.toLowerCase().includes(q.toLowerCase())}
              renderValue={c=>`${c.flag}  ${c.code}  —  ${c.label}`}
              renderItem={c=>(
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{c.flag}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#C8D8EA"}}>{c.code} <span style={{color:"#3E5470",fontWeight:400}}>— {c.label}</span></div>
                    <div style={{fontSize:10,color:"#2A4060"}}>1 EUR = {c.rate} {c.code}</div>
                  </div>
                </div>
              )}
            />
            <F label="Frais bancaires" required span={1}>
              <div style={{display:"flex",gap:6}}>
                {["OUR","SHA","BEN"].map(c=>(
                  <button key={c} onClick={()=>setCharges(c)} style={{flex:1,padding:"9px 0",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",background:charges===c?"rgba(14,165,233,.12)":"rgba(10,18,32,.6)",border:`1.5px solid ${charges===c?"rgba(14,165,233,.45)":"#1D3250"}`,color:charges===c?"#0EA5E9":"#3E5470",transition:"all .2s"}}>{c}</button>
                ))}
              </div>
            </F>
          </Section>

          {/* ── 3. BÉNÉFICIAIRE ── */}
          <Section icon="👤" title="Bénéficiaire" sub="Contrôles AML & sanctions Fircosoft en temps réel" accent="#F59E0B">
            <F label="Nom / Raison sociale" required controls={[<Ctrl key="aml" status={amlCtrl} label="AML"/>,<Ctrl key="sanc" status={amlCtrl==="pending"?"pending":amlCtrl==="checking"?"checking":"valid"} label="Sanctions"/>]}>
              <TI value={beneName} onChange={e=>setBeneName(e.target.value)} placeholder="Dénomination complète du bénéficiaire…" borderColor={amlCtrl==="error"?"rgba(239,68,68,.5)":amlCtrl==="valid"?"rgba(16,185,129,.3)":"#1D3250"} />
              {amlMsg&&<p style={{fontSize:10,marginTop:3,color:amlCtrl==="error"?"#ef4444":amlCtrl==="warning"?"#f59e0b":"#10b981"}}>{amlCtrl==="error"?"✕":amlCtrl==="warning"?"⚠":"✓"} {amlMsg}</p>}
            </F>
            <SearchDrop items={COUNTRIES} value={country} onChange={setCountry} label="Pays" required
              placeholder="Rechercher par code ou pays…" badge="ISO 3166"
              filterFn={(c,q)=>c.code.toLowerCase().includes(q.toLowerCase())||c.label.toLowerCase().includes(q.toLowerCase())}
              renderValue={c=>`${c.flag}  ${c.code}  —  ${c.label}`}
              renderItem={c=>(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{c.flag}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#C8D8EA"}}>{c.label}</div>
                      <div style={{fontSize:10,color:"#3E5470"}}>{c.code}</div>
                    </div>
                  </div>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:c.fatf==="BLANC"?"rgba(16,185,129,.1)":c.fatf==="GRIS"?"rgba(245,158,11,.1)":"rgba(239,68,68,.1)",border:`1px solid ${c.fatf==="BLANC"?"rgba(16,185,129,.25)":c.fatf==="GRIS"?"rgba(245,158,11,.25)":"rgba(239,68,68,.25)"}`,color:c.fatf==="BLANC"?"#10b981":c.fatf==="GRIS"?"#f59e0b":"#ef4444",fontWeight:700}}>GAFI {c.fatf}</span>
                </div>
              )}
            />
            {fatfIssue&&(
              <div style={{gridColumn:"span 2",padding:"8px 14px",background:`${country.fatf==="GRIS"?"rgba(245,158,11,.07)":"rgba(239,68,68,.07)"}`,border:`1px solid ${country.fatf==="GRIS"?"rgba(245,158,11,.25)":"rgba(239,68,68,.25)"}`,borderRadius:8,fontSize:11,color:country.fatf==="GRIS"?"#f59e0b":"#ef4444"}}>
                {country.fatf==="GRIS"?"⚠ Pays GAFI liste grise — contrôle renforcé obligatoire":"✕ Pays GAFI liste noire — transfert bloqué réglementairement"}
              </div>
            )}
            <F label="IBAN" required controls={[<Ctrl key="iban" status={ibanCtrl} label="IBAN"/>]}>
              <TI value={beneIBAN} onChange={e=>setBeneIBAN(formatIBAN(e.target.value))} placeholder="FR76 3000 6000 0112 3456 7890 189" borderColor={ibanCtrl==="error"?"rgba(239,68,68,.5)":ibanCtrl==="valid"?"rgba(16,185,129,.3)":"#1D3250"} />
              {ibanCtrl==="error"&&<p style={{fontSize:10,color:"#ef4444",marginTop:3}}>✕ IBAN invalide — vérifier format et clé de contrôle</p>}
            </F>
            <SearchDrop items={BENE_BANKS} value={beneBank} onChange={setBeneBank} label="Banque bénéficiaire" required
              placeholder="Rechercher BIC ou nom banque…" badge="🔗 API SWIFT"
              filterFn={(b,q)=>b.bic.toLowerCase().includes(q.toLowerCase())||b.name.toLowerCase().includes(q.toLowerCase())||b.city.toLowerCase().includes(q.toLowerCase())}
              renderValue={b=>`${b.bic}  —  ${b.name}`}
              renderItem={b=>(
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>🏛</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#C8D8EA"}}>{b.name}</div>
                    <div style={{fontSize:10,color:"#3E5470"}}>{b.bic} · {b.city}, {b.country}</div>
                  </div>
                </div>
              )}
            />
            <F label="Adresse bénéficiaire">
              <TI value={beneAddress} onChange={e=>setBeneAddress(e.target.value)} placeholder="Adresse complète…"/>
            </F>
          </Section>

          {/* ── 4. BANQUE CORRESPONDANTE ── */}
          <Section icon="🏦" title="Banque correspondante & Incoterms" sub="Réseau de correspondants et conditions commerciales" accent="#10B981">
            <SearchDrop items={CORRESPONDENTS} value={correspondent} onChange={setCorrespondent} label="Banque correspondante"
              placeholder="BIC ou nom…" badge="📋 Réseau correspondants"
              filterFn={(b,q)=>b.bic.toLowerCase().includes(q.toLowerCase())||b.name.toLowerCase().includes(q.toLowerCase())}
              renderValue={b=>`${b.bic}  —  ${b.name}`}
              renderItem={b=>(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span>🏦</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#C8D8EA"}}>{b.name}</div>
                      <div style={{fontSize:10,color:"#3E5470"}}>{b.bic} · {b.country}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    {b.currencies.map(c=><span key={c} style={{fontSize:9,padding:"1px 5px",borderRadius:8,background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.2)",color:"#10b981"}}>{c}</span>)}
                  </div>
                </div>
              )}
            />
            <SearchDrop items={INCOTERMS} value={incoterm} onChange={setIncoterm} label="Incoterm (si commercial)"
              placeholder="FOB, CIF, DDP…" badge="ICC 2020"
              filterFn={(t,q)=>t.code.toLowerCase().includes(q.toLowerCase())||t.label.toLowerCase().includes(q.toLowerCase())}
              renderValue={t=>`${t.code}  —  ${t.label}`}
              renderItem={t=>(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:12,fontWeight:800,color:"#0EA5E9",minWidth:30}}>{t.code}</span>
                    <span style={{fontSize:12,color:"#C8D8EA"}}>{t.label}</span>
                    <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.2)",color:"#06b6d4"}}>{t.transport}</span>
                  </div>
                  <div style={{fontSize:10,color:"#3E5470"}}>{t.desc}</div>
                </div>
              )}
            />
          </Section>

          {/* ── 5. MAD SPÉCIFIQUE ── */}
          {isMAD&&(
            <Section icon="🇲🇦" title="Réglementation des changes — Maroc" sub="Champs obligatoires selon la circulaire Office des Changes" accent="#F59E0B">
              <F label="Nature du transfert" required span={2}>
                <div style={{display:"flex",gap:10}}>
                  {[["FINANCIER","💰 Transfert Financier","Flux de capital, dividendes, investissement…"],["COMMERCIAL","🏭 Transfert Commercial","Import/export de marchandises ou services"]].map(([v,l,d])=>(
                    <button key={v} onClick={()=>setMadType(v)} style={{flex:1,padding:"12px 14px",borderRadius:10,cursor:"pointer",textAlign:"left",background:madType===v?"rgba(245,158,11,.1)":"rgba(10,18,32,.6)",border:`2px solid ${madType===v?"rgba(245,158,11,.5)":"#1D3250"}`,color:madType===v?"#f59e0b":"#3E5470",transition:"all .2s"}}>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{l}</div>
                      <div style={{fontSize:10,opacity:.7,lineHeight:1.4}}>{d}</div>
                    </button>
                  ))}
                </div>
              </F>
              {needsDom&&(
                <>
                  <F label="N° Titre d'importation (domiciliation)" required>
                    <TI value={domRef} onChange={e=>setDomRef(e.target.value)} placeholder="DOM-YYYY-XXXXXX" borderColor={domRef?"rgba(245,158,11,.4)":"#1D3250"}/>
                  </F>
                  <F label="Banque domiciliataire" required>
                    <TI value={domBank} onChange={e=>setDomBank(e.target.value)} placeholder="Ex: Attijariwafa Bank" borderColor={domBank?"rgba(245,158,11,.4)":"#1D3250"}/>
                  </F>
                  <F label="Date de domiciliation">
                    <TI type="date" value={domDate} onChange={e=>setDomDate(e.target.value)} style={{colorScheme:"dark"}}/>
                  </F>
                  <div style={{padding:"8px 12px",background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.15)",borderRadius:8,fontSize:10,color:"#78716c",display:"flex",alignItems:"center",gap:6}}>
                    ℹ Ces informations seront incluses dans le message ISO 20022 (pain.001) transmis au back office.
                  </div>
                </>
              )}
            </Section>
          )}

          {/* ── 6. DÉTAILS PAIEMENT ── */}
          <Section icon="📋" title="Détails du paiement" sub="Référence et libellé SWIFT" accent="#6366F1">
            <F label="Référence client" required>
              <TI value={reference} onChange={e=>setReference(e.target.value)} placeholder="N° contrat, facture, PO…"/>
            </F>
            <F label="Libellé SWIFT (140 car. max)" span={1}>
              <div style={{position:"relative"}}>
                <textarea value={details} onChange={e=>setDetails(e.target.value.slice(0,140))} rows={2} placeholder="Information pour le bénéficiaire…"
                  style={{width:"100%",background:"rgba(10,18,32,.8)",border:"1.5px solid #1D3250",borderRadius:9,padding:"9px 12px",fontSize:12,color:"#C8D8EA",fontFamily:"'JetBrains Mono',monospace",outline:"none",resize:"vertical"}}/>
                <span style={{position:"absolute",right:10,bottom:8,fontSize:9,color:"#2A4060"}}>{details.length}/140</span>
              </div>
            </F>
          </Section>

          {/* ── BARRE DE CONTRÔLES & SOUMISSION ── */}
          <div style={{background:"rgba(8,15,28,.8)",border:"1px solid rgba(255,255,255,.06)",borderRadius:13,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14,backdropFilter:"blur(8px)"}}>
            <div>
              <div style={{fontSize:9,color:"#2A4060",textTransform:"uppercase",letterSpacing:".15em",marginBottom:8}}>Statut des contrôles</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Ctrl status={ibanCtrl} label="IBAN"/>
                <Ctrl status={beneBank?"valid":"pending"} label="BIC"/>
                <Ctrl status={amlCtrl} label="AML"/>
                <Ctrl status={country?.fatf==="NOIR"?"error":country?.fatf==="GRIS"?"warning":country?"valid":"pending"} label="GAFI"/>
                <Ctrl status={client&&amount&&!overLimit?"valid":overLimit?"error":client||amount?"checking":"pending"} label="Plafond"/>
                {isMAD&&<Ctrl status={madType?"valid":"pending"} label="Régl. MAD"/>}
                {needsDom&&<Ctrl status={domRef&&domBank?"valid":"pending"} label="Domiciliation"/>}
              </div>
            </div>
            <button onClick={()=>canSubmit()&&setStep(2)} disabled={!canSubmit()} style={{padding:"12px 32px",borderRadius:10,fontSize:13,fontWeight:700,cursor:canSubmit()?"pointer":"not-allowed",background:canSubmit()?"linear-gradient(135deg,#0E6494,#0891b2)":"rgba(20,35,55,.6)",border:`1px solid ${canSubmit()?"rgba(14,165,233,.4)":"rgba(30,50,80,.4)"}`,color:canSubmit()?"#fff":"#2A4060",letterSpacing:".3px",boxShadow:canSubmit()?"0 0 28px rgba(14,165,233,.25)":"none",transition:"all .25s"}}>
              {canSubmit()?"Soumettre à validation →":"Compléter les champs requis"}
            </button>
          </div>
        </div>

        {/* ── RÉCAP (step 2) ── */}
        {step===2&&(
          <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(4,8,18,.88)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{width:"100%",maxWidth:560,background:"#0C1628",border:"1.5px solid rgba(14,165,233,.25)",borderRadius:16,overflow:"hidden",boxShadow:"0 40px 80px rgba(0,0,0,.7)"}}>
              <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16,fontWeight:700,color:"#E2EAF2",fontFamily:"'Space Grotesk',sans-serif"}}>Confirmation de l'ordre</span>
                <span style={{marginLeft:"auto",fontSize:12,color:"#0EA5E9",fontFamily:"monospace"}}>{orderId}</span>
              </div>
              <div style={{padding:"20px 24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[
                  ["Donneur d'ordre",client?.name],
                  ["Montant",`${parseFloat(amount).toLocaleString("fr-FR")} ${currency?.code}`],
                  ["Bénéficiaire",beneName],
                  ["Pays",`${country?.flag} ${country?.label}`],
                  ["IBAN",beneIBAN],
                  ["Banque",`${beneBank?.bic} — ${beneBank?.name}`],
                  ["Référence",reference],
                  ["Frais",charges],
                  ...(isMAD?[["Nature MAD",madType]]:[] ),
                  ...(needsDom?[["Domiciliation",domRef]]:[] ),
                ].map(([l,v])=>(
                  <div key={l} style={{padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:8}}>
                    <div style={{fontSize:9,color:"#2A4060",textTransform:"uppercase",letterSpacing:".1em",marginBottom:3}}>{l}</div>
                    <div style={{fontSize:11,color:"#94A3B8",fontWeight:600,fontFamily:"monospace"}}>{v||"—"}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>setStep(1)} style={{padding:"9px 20px",borderRadius:9,fontSize:12,cursor:"pointer",background:"rgba(20,35,55,.8)",border:"1px solid #1D3250",color:"#7A8BA0"}}>← Modifier</button>
                <button onClick={()=>setStep(3)} style={{padding:"9px 24px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#0E6494,#0891b2)",border:"none",color:"#fff",boxShadow:"0 0 20px rgba(14,165,233,.25)"}}>Confirmer & Envoyer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
