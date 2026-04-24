import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────
// RÉFÉRENTIELS STANDARDS INTÉGRÉS
// ─────────────────────────────────────────────────────────
const REF_CURRENCIES = [
  { code:"EUR", label:"Euro",                    flag:"🇪🇺", zone:"Zone Euro",    decimals:2 },
  { code:"USD", label:"Dollar américain",         flag:"🇺🇸", zone:"Amérique",     decimals:2 },
  { code:"GBP", label:"Livre sterling",           flag:"🇬🇧", zone:"Royaume-Uni",  decimals:2 },
  { code:"MAD", label:"Dirham marocain",          flag:"🇲🇦", zone:"Maroc",        decimals:2 },
  { code:"CAD", label:"Dollar canadien",          flag:"🇨🇦", zone:"Amérique",     decimals:2 },
  { code:"CHF", label:"Franc suisse",             flag:"🇨🇭", zone:"Europe",       decimals:2 },
  { code:"JPY", label:"Yen japonais",             flag:"🇯🇵", zone:"Asie",         decimals:0 },
  { code:"AED", label:"Dirham émirien",           flag:"🇦🇪", zone:"Moyen-Orient", decimals:2 },
  { code:"SAR", label:"Riyal saoudien",           flag:"🇸🇦", zone:"Moyen-Orient", decimals:2 },
  { code:"TND", label:"Dinar tunisien",           flag:"🇹🇳", zone:"Maghreb",      decimals:3 },
  { code:"DZD", label:"Dinar algérien",           flag:"🇩🇿", zone:"Maghreb",      decimals:2 },
  { code:"EGP", label:"Livre égyptienne",         flag:"🇪🇬", zone:"Afrique",      decimals:2 },
  { code:"XOF", label:"Franc CFA BCEAO",          flag:"🌍", zone:"Afrique Ouest", decimals:0 },
  { code:"XAF", label:"Franc CFA BEAC",           flag:"🌍", zone:"Afrique Centre",decimals:0 },
  { code:"ZAR", label:"Rand sud-africain",        flag:"🇿🇦", zone:"Afrique",      decimals:2 },
];

const REF_COUNTRIES = [
  { code:"MA", label:"Maroc",            flag:"🇲🇦", region:"Maghreb",       fatf:"BLANC", swift:"MA" },
  { code:"FR", label:"France",           flag:"🇫🇷", region:"Europe",        fatf:"BLANC", swift:"FR" },
  { code:"DE", label:"Allemagne",        flag:"🇩🇪", region:"Europe",        fatf:"BLANC", swift:"DE" },
  { code:"GB", label:"Royaume-Uni",      flag:"🇬🇧", region:"Europe",        fatf:"BLANC", swift:"GB" },
  { code:"US", label:"États-Unis",       flag:"🇺🇸", region:"Amérique",      fatf:"BLANC", swift:"US" },
  { code:"AE", label:"Émirats Arabes",   flag:"🇦🇪", region:"Moyen-Orient",  fatf:"BLANC", swift:"AE" },
  { code:"SA", label:"Arabie Saoudite",  flag:"🇸🇦", region:"Moyen-Orient",  fatf:"BLANC", swift:"SA" },
  { code:"TN", label:"Tunisie",          flag:"🇹🇳", region:"Maghreb",       fatf:"BLANC", swift:"TN" },
  { code:"DZ", label:"Algérie",          flag:"🇩🇿", region:"Maghreb",       fatf:"GRIS",  swift:"DZ" },
  { code:"EG", label:"Égypte",           flag:"🇪🇬", region:"Afrique",       fatf:"BLANC", swift:"EG" },
  { code:"SN", label:"Sénégal",          flag:"🇸🇳", region:"Afrique Ouest", fatf:"BLANC", swift:"SN" },
  { code:"CI", label:"Côte d'Ivoire",    flag:"🇨🇮", region:"Afrique Ouest", fatf:"BLANC", swift:"CI" },
  { code:"CM", label:"Cameroun",         flag:"🇨🇲", region:"Afrique Cent.", fatf:"GRIS",  swift:"CM" },
  { code:"CN", label:"Chine",            flag:"🇨🇳", region:"Asie",          fatf:"BLANC", swift:"CN" },
  { code:"JP", label:"Japon",            flag:"🇯🇵", region:"Asie",          fatf:"BLANC", swift:"JP" },
  { code:"SY", label:"Syrie",            flag:"🇸🇾", region:"Moyen-Orient",  fatf:"NOIR",  swift:"SY" },
  { code:"IR", label:"Iran",             flag:"🇮🇷", region:"Moyen-Orient",  fatf:"NOIR",  swift:"IR" },
  { code:"KP", label:"Corée du Nord",    flag:"🇰🇵", region:"Asie",          fatf:"NOIR",  swift:"KP" },
];

const REF_INCOTERMS = [
  { code:"EXW", label:"Ex Works",                    group:"E", transport:"Tous", risk:"Vendeur minimal", desc:"Risque transféré dès la mise à disposition en usine" },
  { code:"FCA", label:"Free Carrier",                group:"F", transport:"Tous", risk:"Port de départ",  desc:"Risque transféré au transporteur désigné" },
  { code:"CPT", label:"Carriage Paid To",            group:"C", transport:"Tous", risk:"Port de départ",  desc:"Vendeur paie le fret jusqu'à destination" },
  { code:"CIP", label:"Carriage & Insurance Paid",   group:"C", transport:"Tous", risk:"Port de départ",  desc:"Vendeur paie fret et assurance" },
  { code:"DAP", label:"Delivered at Place",          group:"D", transport:"Tous", risk:"Destination",     desc:"Risque transféré à destination (non dédouané)" },
  { code:"DPU", label:"Delivered at Place Unloaded", group:"D", transport:"Tous", risk:"Destination",     desc:"Vendeur livre et décharge à destination" },
  { code:"DDP", label:"Delivered Duty Paid",         group:"D", transport:"Tous", risk:"Destination",     desc:"Risque maximum vendeur — dédouané, livré" },
  { code:"FAS", label:"Free Alongside Ship",         group:"F", transport:"Mer",  risk:"Port embarquement",desc:"Risque au bord du navire" },
  { code:"FOB", label:"Free On Board",               group:"F", transport:"Mer",  risk:"Bord navire",     desc:"Risque transféré dès embarquement" },
  { code:"CFR", label:"Cost & Freight",              group:"C", transport:"Mer",  risk:"Bord navire",     desc:"Vendeur paie le fret maritime" },
  { code:"CIF", label:"Cost Insurance & Freight",    group:"C", transport:"Mer",  risk:"Bord navire",     desc:"Vendeur paie fret et assurance maritime" },
];

// Référentiel banques correspondantes (géré par la banque cliente)
const REF_CORRESPONDENTS = [
  { bic:"DEUTDEFFXXX", name:"Deutsche Bank AG",          country:"DE", city:"Frankfurt",    currencies:["EUR","USD","GBP"], active:true,  limit:10000000 },
  { bic:"BNPAFRPPXXX", name:"BNP Paribas SA",            country:"FR", city:"Paris",        currencies:["EUR","USD","MAD"], active:true,  limit:5000000  },
  { bic:"CITIUS33XXX", name:"Citibank N.A.",              country:"US", city:"New York",     currencies:["USD","EUR"],       active:true,  limit:20000000 },
  { bic:"BARCGB22XXX", name:"Barclays Bank PLC",         country:"GB", city:"London",       currencies:["GBP","EUR","USD"], active:true,  limit:8000000  },
  { bic:"HSBCGB2LXXX", name:"HSBC Bank PLC",            country:"GB", city:"London",       currencies:["GBP","USD","EUR"], active:true,  limit:15000000 },
  { bic:"UNIBIE2DXXX", name:"UniCredit Bank AG",         country:"DE", city:"Munich",       currencies:["EUR"],             active:true,  limit:6000000  },
  { bic:"SOCGFRP1XXX", name:"Société Générale",          country:"FR", city:"Paris",        currencies:["EUR","USD","MAD"], active:true,  limit:7000000  },
  { bic:"BMCEMAMC",    name:"BMCE Bank International",   country:"MA", city:"Casablanca",   currencies:["MAD","EUR"],       active:false, limit:2000000  },
];

// Référentiel clients donneurs d'ordre (chargé depuis Core Banking)
const REF_CLIENTS = [
  { id:"CLI-001", name:"MAROC TELECOM SA",           account:"MA64 0110 0001 0010 0100 1000 1", type:"CORPORATE", segment:"LARGE",  rating:"A", active:true,  kycDate:"2025-11-15", limits:{ singleTransfer:5000000, daily:10000000 } },
  { id:"CLI-002", name:"OCP SA",                     account:"MA64 0110 0002 0020 0200 2000 2", type:"CORPORATE", segment:"LARGE",  rating:"A+",active:true,  kycDate:"2025-09-20", limits:{ singleTransfer:10000000,daily:20000000 } },
  { id:"CLI-003", name:"CIMENTS DU MAROC",           account:"MA64 0110 0003 0030 0300 3000 3", type:"CORPORATE", segment:"MEDIUM", rating:"B",active:true,  kycDate:"2025-08-10", limits:{ singleTransfer:2000000, daily:5000000  } },
  { id:"CLI-004", name:"DELTA HOLDING SA",           account:"MA64 0110 0004 0040 0400 4000 4", type:"CORPORATE", segment:"MEDIUM", rating:"B+",active:true,  kycDate:"2025-12-01", limits:{ singleTransfer:3000000, daily:6000000  } },
  { id:"CLI-005", name:"SIEMENS MAROC SARL",         account:"MA64 0110 0005 0050 0500 5000 5", type:"SUBSIDIARY",segment:"MEDIUM", rating:"A", active:true,  kycDate:"2026-01-15", limits:{ singleTransfer:4000000, daily:8000000  } },
  { id:"CLI-006", name:"TOTAL MAROC SA",             account:"MA64 0110 0006 0060 0600 6000 6", type:"CORPORATE", segment:"LARGE",  rating:"A", active:true,  kycDate:"2025-10-30", limits:{ singleTransfer:6000000, daily:12000000 } },
  { id:"CLI-007", name:"BMCI (BNP Filiale)",         account:"MA64 0110 0007 0070 0700 7000 7", type:"FINANCIAL", segment:"LARGE",  rating:"A",active:false, kycDate:"2024-05-20", limits:{ singleTransfer:1000000, daily:2000000  } },
  { id:"CLI-008", name:"MEDZ SA",                    account:"MA64 0110 0008 0080 0800 8000 8", type:"CORPORATE", segment:"SMALL",  rating:"C", active:true,  kycDate:"2025-07-12", limits:{ singleTransfer:500000,  daily:1000000  } },
];

// ─────────────────────────────────────────────────────────
// CONFIGURATION DES RÉFÉRENTIELS
// ─────────────────────────────────────────────────────────
const REF_CONFIG_DEFAULT = {
  CLIENTS:      { mode:"LOCAL",  label:"Clients donneurs d'ordre", icon:"🏢", apiUrl:"", apiKey:"", syncInterval:15, lastSync:"2026-04-22 08:00", autoSync:true  },
  CURRENCIES:   { mode:"LOCAL",  label:"Devises (ISO 4217)",        icon:"💱", apiUrl:"", apiKey:"", syncInterval:0,  lastSync:"Intégré",         autoSync:false },
  COUNTRIES:    { mode:"LOCAL",  label:"Pays (ISO 3166)",           icon:"🌍", apiUrl:"", apiKey:"", syncInterval:0,  lastSync:"Intégré",         autoSync:false },
  INCOTERMS:    { mode:"LOCAL",  label:"Incoterms ICC 2020",        icon:"📦", apiUrl:"", apiKey:"", syncInterval:0,  lastSync:"Intégré",         autoSync:false },
  CORRESPONDENTS:{ mode:"LOCAL", label:"Banques correspondantes",   icon:"🏦", apiUrl:"", apiKey:"", syncInterval:60, lastSync:"2026-04-22 07:30",autoSync:false },
  BENE_BANKS:   { mode:"API",    label:"Banques bénéficiaires (BIC)",icon:"🔗",apiUrl:"https://api.swift.com/v1/bic-lookup", apiKey:"", syncInterval:0, lastSync:"Temps réel", autoSync:false },
  FX_RATES:     { mode:"API",    label:"Taux de change (BCE)",      icon:"📈", apiUrl:"https://api.exchangerate.eu/v1/rates", apiKey:"", syncInterval:1, lastSync:"Temps réel", autoSync:true  },
};

// ─────────────────────────────────────────────────────────
// COMPOSANT — CHAMP DE RECHERCHE DANS RÉFÉRENTIEL
// ─────────────────────────────────────────────────────────
function RefSearchField({ refType, value, onChange, placeholder, label, required, mode = "LOCAL" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  // Fermer si clic extérieur
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recherche dans le référentiel
  useEffect(() => {
    if (!query || query.length < 1) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      let data = [];
      const q = query.toLowerCase();

      if (refType === "CURRENCY")
        data = REF_CURRENCIES.filter(c => c.code.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)).slice(0,8);
      else if (refType === "COUNTRY")
        data = REF_COUNTRIES.filter(c => c.code.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)).slice(0,8);
      else if (refType === "INCOTERM")
        data = REF_INCOTERMS.filter(i => i.code.toLowerCase().includes(q) || i.label.toLowerCase().includes(q)).slice(0,8);
      else if (refType === "CORRESPONDENT")
        data = REF_CORRESPONDENTS.filter(b => b.active && (b.bic.toLowerCase().includes(q) || b.name.toLowerCase().includes(q))).slice(0,6);
      else if (refType === "CLIENT")
        data = REF_CLIENTS.filter(c => c.active && (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))).slice(0,6);
      else if (refType === "BENE_BANK") {
        // Simule un appel API BIC lookup temps réel
        data = [
          { bic:"BNPAFRPPXXX", name:"BNP Paribas SA", country:"FR", city:"Paris" },
          { bic:"DEUTDEFFXXX", name:"Deutsche Bank AG", country:"DE", city:"Frankfurt" },
          { bic:"BCDMMAMC",    name:"BMCE Bank (CIH)", country:"MA", city:"Casablanca" },
          { bic:"ATTMMAMC",    name:"Attijariwafa Bank", country:"MA", city:"Casablanca" },
          { bic:"BKAMMAMR",    name:"Bank Al-Maghrib", country:"MA", city:"Rabat" },
        ].filter(b => b.bic.toLowerCase().includes(q) || b.name.toLowerCase().includes(q)).slice(0,6);
      }

      setResults(data);
      setLoading(false);
    }, mode === "API" ? 600 : 200);
    return () => clearTimeout(timer);
  }, [query, refType, mode]);

  const displayValue = () => {
    if (!value) return "";
    if (refType === "CURRENCY") return `${value.flag} ${value.code} — ${value.label}`;
    if (refType === "COUNTRY")  return `${value.flag} ${value.code} — ${value.label}`;
    if (refType === "INCOTERM") return `${value.code} — ${value.label}`;
    if (refType === "CORRESPONDENT") return `${value.bic} — ${value.name}`;
    if (refType === "CLIENT")   return `${value.name} (${value.id})`;
    if (refType === "BENE_BANK") return `${value.bic} — ${value.name}`;
    return "";
  };

  const fatfColor = (rating) => ({
    BLANC:"#10b981", GRIS:"#f59e0b", NOIR:"#ef4444"
  })[rating] || "#64748b";

  const ResultItem = ({ item }) => {
    if (refType === "CURRENCY") return (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18 }}>{item.flag}</span>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{item.code} <span style={{ color:"#64748b", fontWeight:400 }}>— {item.label}</span></div>
          <div style={{ fontSize:10, color:"#475569" }}>{item.zone} · {item.decimals} décimales · ISO 4217</div>
        </div>
      </div>
    );
    if (refType === "COUNTRY") return (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18 }}>{item.flag}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{item.code} <span style={{ color:"#64748b", fontWeight:400 }}>— {item.label}</span></div>
          <div style={{ fontSize:10, color:"#475569" }}>{item.region}</div>
        </div>
        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:`${fatfColor(item.fatf)}15`, border:`1px solid ${fatfColor(item.fatf)}44`, color:fatfColor(item.fatf), fontWeight:700 }}>
          GAFI {item.fatf}
        </span>
      </div>
    );
    if (refType === "INCOTERM") return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
          <span style={{ fontSize:12, fontWeight:800, color:"#06b6d4", fontFamily:"monospace" }}>{item.code}</span>
          <span style={{ fontSize:12, color:"#e2e8f0" }}>{item.label}</span>
          <span style={{ fontSize:10, padding:"1px 6px", borderRadius:10, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>{item.transport}</span>
        </div>
        <div style={{ fontSize:11, color:"#475569" }}>{item.desc}</div>
      </div>
    );
    if (refType === "CORRESPONDENT") return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{item.name}</div>
          <div style={{ fontSize:10, color:"#475569" }}>{item.bic} · {item.city}, {item.country}</div>
          <div style={{ fontSize:10, color:"#334155" }}>Devises : {item.currencies.join(", ")} · Plafond : {item.limit.toLocaleString("fr-FR")}</div>
        </div>
        <span style={{ fontSize:20 }}>🏦</span>
      </div>
    );
    if (refType === "CLIENT") return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{item.name}</div>
          <div style={{ display:"flex", gap:4 }}>
            <span style={{ fontSize:10, padding:"1px 6px", borderRadius:10, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>{item.type}</span>
            <span style={{ fontSize:10, padding:"1px 6px", borderRadius:10, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.2)", color:"#10b981" }}>Rating {item.rating}</span>
          </div>
        </div>
        <div style={{ fontSize:10, color:"#475569", marginTop:2 }}>{item.id} · Compte : {item.account.slice(0,20)}...</div>
        <div style={{ fontSize:10, color:"#334155" }}>
          Plafond unitaire : {item.limits.singleTransfer.toLocaleString("fr-FR")} · KYC : {item.kycDate}
        </div>
      </div>
    );
    if (refType === "BENE_BANK") return (
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18 }}>🏛</span>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{item.name}</div>
          <div style={{ fontSize:10, color:"#475569" }}>{item.bic} · {item.city}, {item.country}</div>
        </div>
      </div>
    );
    return null;
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#64748b", marginBottom:5, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span>{label}{required && <span style={{ color:"#f59e0b", marginLeft:3 }}>*</span>}</span>
        <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background: mode==="API" ? "rgba(16,185,129,.1)" : "rgba(6,182,212,.1)", border: mode==="API" ? "1px solid rgba(16,185,129,.2)" : "1px solid rgba(6,182,212,.2)", color: mode==="API" ? "#10b981" : "#06b6d4" }}>
          {mode==="API" ? "🔗 API temps réel" : "📋 Référentiel local"}
        </span>
      </div>

      {/* Champ de recherche */}
      {value ? (
        // Valeur sélectionnée
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:"rgba(6,182,212,.06)", border:"1px solid rgba(6,182,212,.3)", borderRadius:8 }}>
          <div style={{ flex:1, fontSize:12, color:"#e2e8f0", fontFamily:"monospace" }}>{displayValue()}</div>
          <button onClick={() => { onChange(null); setQuery(""); }} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:14, padding:"0 2px" }}>✕</button>
        </div>
      ) : (
        <div style={{ position:"relative" }}>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"10px 36px 10px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" }}
          />
          {loading
            ? <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:14, animation:"spin 1s linear infinite", display:"inline-block" }}>◌</span>
            : <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#334155" }}>🔍</span>
          }
        </div>
      )}

      {/* Dropdown résultats */}
      {open && !value && results.length > 0 && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, zIndex:200, marginTop:4,
          background:"#0d1b2e", border:"1px solid rgba(6,182,212,.25)", borderRadius:10,
          boxShadow:"0 16px 40px rgba(0,0,0,.6)", overflow:"hidden",
        }}>
          {results.map((item, i) => (
            <div key={i}
              onClick={() => { onChange(item); setOpen(false); setQuery(""); }}
              style={{ padding:"12px 16px", borderBottom: i<results.length-1 ? "1px solid rgba(30,58,138,.2)" : "none", cursor:"pointer", transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(6,182,212,.06)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <ResultItem item={item} />
            </div>
          ))}
        </div>
      )}
      {open && !value && query.length > 0 && results.length === 0 && !loading && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:200, marginTop:4, background:"#0d1b2e", border:"1px solid rgba(30,58,138,.25)", borderRadius:10, padding:"16px", textAlign:"center", color:"#334155", fontSize:12 }}>
          Aucun résultat pour "{query}"
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// VUE ADMIN — GESTION DES RÉFÉRENTIELS
// ─────────────────────────────────────────────────────────
function AdminReferentials({ config, onSave }) {
  const [local, setLocal] = useState({...config});
  const [activeRef, setActiveRef] = useState("CLIENTS");
  const [editingItem, setEditingItem] = useState(null);
  const [clients, setClients] = useState(REF_CLIENTS);
  const [correspondents, setCorrespondents] = useState(REF_CORRESPONDENTS);
  const [testStatus, setTestStatus] = useState({});
  const [saved, setSaved] = useState(false);

  const setMode = (refId, mode) => setLocal(p => ({ ...p, [refId]: { ...p[refId], mode } }));
  const setApiUrl = (refId, url) => setLocal(p => ({ ...p, [refId]: { ...p[refId], apiUrl: url } }));
  const setApiKey = (refId, key) => setLocal(p => ({ ...p, [refId]: { ...p[refId], apiKey: key } }));
  const setSyncInterval = (refId, val) => setLocal(p => ({ ...p, [refId]: { ...p[refId], syncInterval: +val } }));

  const testConnection = (refId) => {
    setTestStatus(s => ({ ...s, [refId]: "TESTING" }));
    setTimeout(() => {
      setTestStatus(s => ({ ...s, [refId]: Math.random() > .3 ? "OK" : "ERROR" }));
    }, 1800);
  };

  const handleSave = () => { onSave(local); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const inp = { width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"9px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" };

  const TABS = [
    { id:"CONFIG",  label:"⚙ Configuration" },
    { id:"CLIENTS", label:"🏢 Clients" },
    { id:"CORRESPONDENTS", label:"🏦 Correspondants" },
    { id:"VIEW",    label:"📋 Référentiels standards" },
  ];
  const [tab, setTab] = useState("CONFIG");

  const tabStyle = (t) => ({
    padding:"7px 14px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
    background: tab === t ? "rgba(6,182,212,.15)" : "transparent",
    color: tab === t ? "#06b6d4" : "#475569",
    borderBottom: tab === t ? "2px solid #06b6d4" : "2px solid transparent",
  });

  return (
    <div style={{ background:"rgba(11,20,37,.9)", border:"1px solid rgba(30,58,138,.25)", borderRadius:14, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(30,58,138,.25)", background:"rgba(6,182,212,.03)" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:"#e2e8f0" }}>Gestion des Référentiels</div>
        <button onClick={handleSave} style={{ padding:"7px 18px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background: saved ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>
          {saved ? "✓ Sauvegardé" : "Enregistrer"}
        </button>
      </div>

      <div style={{ display:"flex", gap:4, padding:"10px 20px 0", borderBottom:"1px solid rgba(30,58,138,.2)" }}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(t.id)}>{t.label}</button>)}
      </div>

      <div style={{ padding:20, maxHeight:"60vh", overflowY:"auto" }}>

        {/* ── CONFIG MODES ── */}
        {tab === "CONFIG" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <p style={{ fontSize:12, color:"#475569", marginBottom:4 }}>Pour chaque référentiel, configurez le mode d'alimentation : données locales gérées dans SwiftFlow, ou connexion temps réel à un système tiers.</p>
            {Object.entries(local).map(([refId, cfg]) => {
              const ts = testStatus[refId];
              return (
                <div key={refId} style={{ background:"rgba(15,23,42,.7)", border:"1px solid rgba(30,58,138,.2)", borderRadius:11, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:18 }}>{cfg.icon}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{cfg.label}</div>
                        <div style={{ fontSize:10, color:"#334155" }}>Dernière sync : {cfg.lastSync}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {["LOCAL","API"].map(m => (
                        <button key={m} onClick={() => setMode(refId, m)} style={{
                          padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                          background: cfg.mode===m ? "rgba(6,182,212,.12)" : "rgba(15,23,42,.5)",
                          border:`1px solid ${cfg.mode===m ? "rgba(6,182,212,.4)" : "#1e293b"}`,
                          color: cfg.mode===m ? "#06b6d4" : "#475569",
                        }}>{m==="LOCAL" ? "📋 Local" : "🔗 API externe"}</button>
                      ))}
                    </div>
                  </div>

                  {cfg.mode === "API" && (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:10, alignItems:"end" }}>
                      <div>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>URL de l'API</div>
                        <input value={cfg.apiUrl} onChange={e => setApiUrl(refId, e.target.value)} placeholder="https://api.exemple.com/v1/..." style={inp} />
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>Clé API / Token</div>
                        <input type="password" value={cfg.apiKey} onChange={e => setApiKey(refId, e.target.value)} placeholder="••••••••••••••••" style={inp} />
                      </div>
                      <button onClick={() => testConnection(refId)} style={{
                        padding:"9px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                        background: ts==="OK" ? "rgba(16,185,129,.1)" : ts==="ERROR" ? "rgba(239,68,68,.1)" : "rgba(6,182,212,.1)",
                        border:`1px solid ${ts==="OK" ? "rgba(16,185,129,.3)" : ts==="ERROR" ? "rgba(239,68,68,.3)" : "rgba(6,182,212,.2)"}`,
                        color: ts==="OK" ? "#10b981" : ts==="ERROR" ? "#ef4444" : "#06b6d4",
                      }}>
                        {ts==="TESTING" ? "⏳ Test..." : ts==="OK" ? "✓ Connecté" : ts==="ERROR" ? "✕ Erreur" : "Tester"}
                      </button>
                    </div>
                  )}
                  {cfg.mode === "API" && (
                    <div style={{ marginTop:10, display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ fontSize:10, color:"#475569" }}>Synchronisation auto (minutes, 0 = désactivé)</div>
                      <input type="number" value={cfg.syncInterval} onChange={e => setSyncInterval(refId, e.target.value)} min={0} style={{ ...inp, width:80, padding:"5px 10px" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── CLIENTS ── */}
        {tab === "CLIENTS" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#475569" }}>{clients.filter(c=>c.active).length} clients actifs · Données chargées depuis Core Banking</p>
              <div style={{ display:"flex", gap:6 }}>
                <button style={{ padding:"6px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>↺ Synchroniser</button>
                <button style={{ padding:"6px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", color:"#10b981" }}>+ Ajouter</button>
              </div>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(30,58,138,.3)", background:"rgba(6,182,212,.04)" }}>
                  {["ID","Raison sociale","Type","Rating","Plafond unitaire","KYC","Statut"].map(h => (
                    <th key={h} style={{ padding:"9px 10px", textAlign:"left", fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom:"1px solid rgba(30,58,138,.15)", background: i%2===0 ? "rgba(11,20,37,.5)" : "transparent" }}>
                    <td style={{ padding:"9px 10px", fontSize:11, color:"#06b6d4", fontFamily:"monospace" }}>{c.id}</td>
                    <td style={{ padding:"9px 10px", fontSize:12, color:"#e2e8f0", fontWeight:600 }}>{c.name}</td>
                    <td style={{ padding:"9px 10px" }}><span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>{c.type}</span></td>
                    <td style={{ padding:"9px 10px" }}>
                      <span style={{ fontSize:11, fontWeight:700, color: c.rating.startsWith("A") ? "#10b981" : c.rating.startsWith("B") ? "#f59e0b" : "#ef4444" }}>{c.rating}</span>
                    </td>
                    <td style={{ padding:"9px 10px", fontSize:11, color:"#64748b", fontFamily:"monospace" }}>{c.limits.singleTransfer.toLocaleString("fr-FR")}</td>
                    <td style={{ padding:"9px 10px", fontSize:11, color:"#475569" }}>{c.kycDate}</td>
                    <td style={{ padding:"9px 10px" }}>
                      <div onClick={() => setClients(prev => prev.map(x => x.id===c.id ? {...x,active:!x.active} : x))}
                        style={{ width:36, height:20, borderRadius:10, cursor:"pointer", position:"relative", background: c.active ? "#0891b2" : "#1e293b", border:`1px solid ${c.active ? "#06b6d4" : "#334155"}`, transition:"all .25s" }}>
                        <div style={{ position:"absolute", top:3, left: c.active ? 18 : 3, width:12, height:12, borderRadius:"50%", background: c.active ? "#fff" : "#475569", transition:"left .25s" }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CORRESPONDANTS ── */}
        {tab === "CORRESPONDENTS" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#475569" }}>{correspondents.filter(c=>c.active).length} correspondants actifs</p>
              <button style={{ padding:"6px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", color:"#10b981" }}>+ Ajouter un correspondant</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {correspondents.map((b, i) => (
                <div key={b.bic} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background: b.active ? "rgba(11,20,37,.7)" : "rgba(11,20,37,.35)", border:`1px solid ${b.active ? "rgba(30,58,138,.25)" : "rgba(30,41,59,.3)"}`, borderRadius:10, opacity: b.active ? 1 : .6 }}>
                  <span style={{ fontSize:22 }}>🏦</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{b.name}</span>
                      <span style={{ fontSize:10, padding:"1px 7px", borderRadius:10, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4", fontFamily:"monospace" }}>{b.bic}</span>
                      <span style={{ fontSize:10, color:"#475569" }}>{b.city}, {b.country}</span>
                    </div>
                    <div style={{ display:"flex", gap:12 }}>
                      <span style={{ fontSize:11, color:"#334155" }}>Devises : <span style={{ color:"#64748b" }}>{b.currencies.join(", ")}</span></span>
                      <span style={{ fontSize:11, color:"#334155" }}>Plafond : <span style={{ color:"#64748b" }}>{b.limit.toLocaleString("fr-FR")}</span></span>
                    </div>
                  </div>
                  <div onClick={() => setCorrespondents(prev => prev.map(x => x.bic===b.bic ? {...x,active:!x.active} : x))}
                    style={{ width:38, height:20, borderRadius:10, cursor:"pointer", position:"relative", background: b.active ? "#0891b2" : "#1e293b", border:`1px solid ${b.active ? "#06b6d4" : "#334155"}`, transition:"all .25s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left: b.active ? 20 : 3, width:12, height:12, borderRadius:"50%", background: b.active ? "#fff" : "#475569", transition:"left .25s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STANDARDS ── */}
        {tab === "VIEW" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              { title:"💱 Devises (ISO 4217)", data:REF_CURRENCIES, key:(c)=>`${c.flag} ${c.code} — ${c.label}`, sub:(c)=>c.zone },
              { title:"📦 Incoterms ICC 2020", data:REF_INCOTERMS,   key:(c)=>`${c.code} — ${c.label}`,        sub:(c)=>c.transport },
            ].map(({ title, data, key, sub }) => (
              <div key={title} style={{ background:"rgba(15,23,42,.6)", border:"1px solid rgba(30,58,138,.2)", borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(30,58,138,.2)", fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{title} <span style={{ fontSize:10, color:"#475569", fontWeight:400 }}>({data.length} entrées)</span></div>
                <div style={{ maxHeight:240, overflowY:"auto" }}>
                  {data.map((item, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 14px", borderBottom: i<data.length-1 ? "1px solid rgba(30,58,138,.1)" : "none", background: i%2===0 ? "transparent" : "rgba(15,23,42,.4)" }}>
                      <span style={{ fontSize:11, color:"#e2e8f0" }}>{key(item)}</span>
                      <span style={{ fontSize:10, color:"#475569" }}>{sub(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ gridColumn:"span 2", background:"rgba(15,23,42,.6)", border:"1px solid rgba(30,58,138,.2)", borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(30,58,138,.2)", fontSize:12, fontWeight:700, color:"#e2e8f0" }}>🌍 Pays (ISO 3166) <span style={{ fontSize:10, color:"#475569", fontWeight:400 }}>({REF_COUNTRIES.length} entrées)</span></div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)" }}>
                {REF_COUNTRIES.map((c, i) => (
                  <div key={c.code} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderBottom: i<REF_COUNTRIES.length-3 ? "1px solid rgba(30,58,138,.1)" : "none", background: Math.floor(i/3)%2===0 ? "transparent" : "rgba(15,23,42,.4)" }}>
                    <span>{c.flag}</span>
                    <span style={{ fontSize:11, color:"#e2e8f0" }}>{c.code}</span>
                    <span style={{ fontSize:11, color:"#475569", flex:1 }}>{c.label}</span>
                    <span style={{ fontSize:9, padding:"1px 5px", borderRadius:8, background:`${c.fatf==="BLANC"?"rgba(16,185,129,.1)":c.fatf==="GRIS"?"rgba(245,158,11,.1)":"rgba(239,68,68,.1)"}`, color:c.fatf==="BLANC"?"#10b981":c.fatf==="GRIS"?"#f59e0b":"#ef4444", border:`1px solid ${c.fatf==="BLANC"?"rgba(16,185,129,.2)":c.fatf==="GRIS"?"rgba(245,158,11,.2)":"rgba(239,68,68,.2)"}` }}>{c.fatf}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FORMULAIRE AVEC CHAMPS RÉFÉRENTIELS
// ─────────────────────────────────────────────────────────
function PaymentFormWithRefs({ refConfig }) {
  const [form, setForm] = useState({ client:null, currency:null, country:null, correspondent:null, beneBank:null, incoterm:null, amount:"", reference:"", details:"" });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const selectedClient = form.client;
  const amountOk = selectedClient && form.amount && parseFloat(form.amount) <= selectedClient.limits.singleTransfer;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Référence */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px", background:"rgba(11,20,37,.6)", border:"1px solid rgba(30,58,138,.2)", borderRadius:9 }}>
        <span style={{ fontSize:10, color:"#334155", letterSpacing:2, textTransform:"uppercase" }}>Référence</span>
        <span style={{ fontSize:13, color:"#06b6d4", fontWeight:700, fontFamily:"monospace" }}>TRF-{Date.now().toString().slice(-8)}</span>
      </div>

      {/* Client donneur d'ordre */}
      <div style={{ background:"rgba(11,20,37,.85)", border:"1px solid rgba(30,58,138,.25)", borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>🏢</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>Donneur d'ordre</div>
        </div>
        <RefSearchField refType="CLIENT" value={form.client} onChange={v => set("client", v)} label="Client donneur d'ordre" required placeholder="Rechercher par nom ou code client..." mode={refConfig.CLIENTS?.mode || "LOCAL"} />
        {selectedClient && (
          <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {[
              ["Compte", selectedClient.account.slice(0,24)+"..."],
              ["Plafond unitaire", selectedClient.limits.singleTransfer.toLocaleString("fr-FR")],
              ["Rating", selectedClient.rating],
              ["Type", selectedClient.type],
              ["KYC validé le", selectedClient.kycDate],
              ["Segment", selectedClient.segment],
            ].map(([l,v]) => (
              <div key={l} style={{ padding:"7px 10px", background:"rgba(6,182,212,.04)", border:"1px solid rgba(6,182,212,.1)", borderRadius:7 }}>
                <div style={{ fontSize:9, color:"#334155", textTransform:"uppercase", letterSpacing:".1em", marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, fontFamily:"monospace" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Montant & Devise */}
      <div style={{ background:"rgba(11,20,37,.85)", border:"1px solid rgba(30,58,138,.25)", borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>💱</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>Montant & Devise</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#64748b", marginBottom:5 }}>Montant *</div>
            <div style={{ position:"relative" }}>
              <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00"
                style={{ width:"100%", background:"#0b1425", border:`1px solid ${form.amount && selectedClient && !amountOk ? "rgba(239,68,68,.5)" : "#1e3a5f"}`, borderRadius:8, padding:"10px 52px 10px 12px", fontSize:18, fontWeight:700, color:"#e2e8f0", fontFamily:"monospace", outline:"none" }} />
              <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#06b6d4", fontWeight:700, fontSize:14 }}>{form.currency?.code || "—"}</span>
            </div>
            {form.amount && selectedClient && !amountOk && (
              <p style={{ fontSize:11, color:"#ef4444", marginTop:4 }}>✕ Dépasse le plafond client ({selectedClient.limits.singleTransfer.toLocaleString("fr-FR")})</p>
            )}
          </div>
          <RefSearchField refType="CURRENCY" value={form.currency} onChange={v => set("currency", v)} label="Devise" required placeholder="EUR, USD, MAD..." mode={refConfig.CURRENCIES?.mode || "LOCAL"} />
        </div>
      </div>

      {/* Bénéficiaire */}
      <div style={{ background:"rgba(11,20,37,.85)", border:"1px solid rgba(30,58,138,.25)", borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>👤</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>Bénéficiaire</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#64748b", marginBottom:5 }}>Nom / Raison sociale *</div>
            <input placeholder="Raison sociale complète..." style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" }} />
          </div>
          <RefSearchField refType="COUNTRY" value={form.country} onChange={v => set("country", v)} label="Pays bénéficiaire" required placeholder="MA, FR, DE..." mode="LOCAL" />
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#64748b", marginBottom:5 }}>IBAN *</div>
            <input placeholder="FR76 3000 6000 0112 3456 7890 189" style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" }} />
          </div>
          <RefSearchField refType="BENE_BANK" value={form.beneBank} onChange={v => set("beneBank", v)} label="Banque bénéficiaire" required placeholder="Rechercher BIC ou nom banque..." mode={refConfig.BENE_BANKS?.mode || "API"} />
          {/* Alerte pays GAFI */}
          {form.country && form.country.fatf !== "BLANC" && (
            <div style={{ gridColumn:"span 2", padding:"8px 12px", background:`${form.country.fatf==="GRIS"?"rgba(245,158,11,.06)":"rgba(239,68,68,.06)"}`, border:`1px solid ${form.country.fatf==="GRIS"?"rgba(245,158,11,.2)":"rgba(239,68,68,.2)"}`, borderRadius:8, fontSize:11, color:form.country.fatf==="GRIS"?"#f59e0b":"#ef4444" }}>
              {form.country.fatf==="GRIS" ? "⚠" : "✕"} Pays classé GAFI {form.country.fatf} — contrôle renforcé {form.country.fatf==="NOIR" ? "et blocage" : "requis"}
            </div>
          )}
        </div>
      </div>

      {/* Banque correspondante & Incoterms */}
      <div style={{ background:"rgba(11,20,37,.85)", border:"1px solid rgba(30,58,138,.25)", borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>🏦</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>Détails du transfert</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <RefSearchField refType="CORRESPONDENT" value={form.correspondent} onChange={v => set("correspondent", v)} label="Banque correspondante" placeholder="Rechercher BIC ou nom..." mode={refConfig.CORRESPONDENTS?.mode || "LOCAL"} />
          <RefSearchField refType="INCOTERM" value={form.incoterm} onChange={v => set("incoterm", v)} label="Incoterm (si commercial)" placeholder="FOB, CIF, DDP..." mode="LOCAL" />
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#64748b", marginBottom:5 }}>Référence client *</div>
            <input value={form.reference} onChange={e => set("reference", e.target.value)} placeholder="N° contrat, facture..." style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" }} />
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#64748b", marginBottom:5 }}>Libellé SWIFT</div>
            <input value={form.details} onChange={e => set("details", e.target.value)} placeholder="Information bénéficiaire (140 car.)" maxLength={140} style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" }} />
          </div>
        </div>
      </div>

      {/* Bouton soumission */}
      <button disabled={!form.client || !form.currency || !form.amount || !amountOk} style={{
        padding:"13px", borderRadius:11, fontSize:13, fontWeight:700,
        background: (form.client && form.currency && form.amount && amountOk) ? "linear-gradient(135deg,#0891b2,#0e7490)" : "rgba(30,41,59,.4)",
        border:"none", color:(form.client && form.currency && form.amount && amountOk) ? "#fff" : "#334155",
        cursor:(form.client && form.currency && form.amount && amountOk) ? "pointer" : "not-allowed",
        boxShadow:(form.client && form.currency && form.amount && amountOk) ? "0 0 24px rgba(8,145,178,.3)" : "none",
      }}>
        Soumettre au circuit de validation →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APPLICATION PRINCIPALE
// ─────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("FORM");
  const [refConfig, setRefConfig] = useState(REF_CONFIG_DEFAULT);

  const tabStyle = (t) => ({
    padding:"7px 16px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
    background: view === t ? "rgba(6,182,212,.15)" : "transparent",
    color: view === t ? "#06b6d4" : "#475569",
    borderBottom: view === t ? "2px solid #06b6d4" : "2px solid transparent",
  });

  return (
    <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", background:"linear-gradient(140deg,#050d1a 0%,#0a1628 60%,#071220 100%)", minHeight:"100vh", color:"#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} input,select,textarea{font-family:inherit} select option{background:#0b1425}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050d1a}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:2px}
        .fade{animation:fade .3s ease forwards} @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom:"1px solid rgba(6,182,212,.1)", background:"rgba(6,182,212,.025)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#0891b2,#0e7490)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 0 18px rgba(8,145,178,.3)" }}>⚡</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#e2e8f0", letterSpacing:1 }}>SWIFT<span style={{ color:"#06b6d4" }}>FLOW</span></div>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, textTransform:"uppercase" }}>Module Référentiels</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:4, background:"rgba(11,20,37,.8)", border:"1px solid rgba(30,58,138,.3)", borderRadius:10, padding:4 }}>
            {[["FORM","✍ Saisie"],["ADMIN","⚙ Admin référentiels"]].map(([k,l]) => (
              <button key={k} onClick={() => setView(k)} style={tabStyle(k)}>{l}</button>
            ))}
          </div>
          <div style={{ fontSize:11, color:"#334155" }}>
            {Object.values(refConfig).filter(r => r.mode==="API").length} référentiel(s) en mode API
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"28px 24px" }}>
        {view === "FORM" && (
          <div className="fade">
            <div style={{ marginBottom:18 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>Saisie d'un ordre de virement</h2>
              <p style={{ fontSize:12, color:"#475569" }}>Tous les champs à liste déroulante sont alimentés par les référentiels — tapez pour rechercher</p>
            </div>
            <PaymentFormWithRefs refConfig={refConfig} />
          </div>
        )}
        {view === "ADMIN" && (
          <div className="fade">
            <div style={{ marginBottom:18 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>Administration des référentiels</h2>
              <p style={{ fontSize:12, color:"#475569" }}>Configurez les sources de données — Local (géré dans SwiftFlow) ou API externe (Core Banking, SWIFT, BCE...)</p>
            </div>
            <AdminReferentials config={refConfig} onSave={setRefConfig} />
          </div>
        )}
      </div>
    </div>
  );
}
