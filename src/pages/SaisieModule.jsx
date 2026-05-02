import { useState, useEffect, useRef } from "react";
import { API_URL, getToken } from '../config.js';
// ─────────────────────────────────────────────────────────
// RÉFÉRENTIELS
// ─────────────────────────────────────────────────────────
const REF_AGENCES = [
  { code:"AG-CAS-01", label:"Casablanca Centre",    ville:"Casablanca" },
  { code:"AG-CAS-02", label:"Casablanca Ain Sebaâ", ville:"Casablanca" },
  { code:"AG-RBA-01", label:"Rabat Hassan",          ville:"Rabat"      },
  { code:"AG-RBA-02", label:"Rabat Agdal",           ville:"Rabat"      },
  { code:"AG-FES-01", label:"Fès Médina",            ville:"Fès"        },
  { code:"AG-MRK-01", label:"Marrakech Guéliz",      ville:"Marrakech"  },
  { code:"AG-TNG-01", label:"Tanger Ville",          ville:"Tanger"     },
];

const REF_CLIENTS = [
  { ref:"CLI-001", agence:"AG-CAS-01", nom:"MAROC TELECOM SA",   adresse:{rue:"Avenue Annakhil",cp:"10000",ville:"Rabat",pays:"MA"} },
  { ref:"CLI-002", agence:"AG-CAS-01", nom:"OCP SA",             adresse:{rue:"2 Rue Al Abtal",cp:"20000",ville:"Casablanca",pays:"MA"} },
  { ref:"CLI-003", agence:"AG-RBA-01", nom:"CIMENTS DU MAROC",   adresse:{rue:"Route de Bouskoura",cp:"20100",ville:"Casablanca",pays:"MA"} },
  { ref:"CLI-004", agence:"AG-RBA-02", nom:"DELTA HOLDING SA",   adresse:{rue:"Bd Zerktouni",cp:"20050",ville:"Casablanca",pays:"MA"} },
  { ref:"CLI-005", agence:"AG-CAS-02", nom:"SIEMENS MAROC SARL", adresse:{rue:"Rue Ibnou Majid",cp:"20000",ville:"Casablanca",pays:"MA"} },
  { ref:"CLI-006", agence:"AG-MRK-01", nom:"TOTAL MAROC SA",     adresse:{rue:"Rue de Fès",cp:"40000",ville:"Marrakech",pays:"MA"} },
];

const REF_COMPTES = [
  { num:"MA64011000010010001", agence:"AG-CAS-01", client:"CLI-001", devise:"MAD", plafond:5000000  },
  { num:"MA64011000010010002", agence:"AG-CAS-01", client:"CLI-001", devise:"EUR", plafond:500000   },
  { num:"MA64011000020020001", agence:"AG-CAS-01", client:"CLI-002", devise:"MAD", plafond:10000000 },
  { num:"MA64011000030030001", agence:"AG-RBA-01", client:"CLI-003", devise:"MAD", plafond:2000000  },
  { num:"MA64011000040040001", agence:"AG-RBA-02", client:"CLI-004", devise:"MAD", plafond:3000000  },
  { num:"MA64011000050050001", agence:"AG-CAS-02", client:"CLI-005", devise:"EUR", plafond:4000000  },
];

const REF_CURRENCIES = [
  { code:"EUR", label:"Euro",           flag:"EU", rate:1     },
  { code:"USD", label:"Dollar US",      flag:"US", rate:1.085 },
  { code:"GBP", label:"Livre Sterling", flag:"GB", rate:0.856 },
  { code:"MAD", label:"Dirham Marocain",flag:"MA", rate:10.92 },
  { code:"CAD", label:"Dollar Canadien",flag:"CA", rate:1.47  },
  { code:"CHF", label:"Franc Suisse",   flag:"CH", rate:0.962 },
  { code:"AED", label:"Dirham Emirien", flag:"AE", rate:3.985 },
];

const REF_COURS = {
  USD:{ taux:10.0138, date:"2026-04-25" },
  GBP:{ taux:12.7540, date:"2026-04-25" },
  MAD:{ taux:1.0000,  date:"2026-04-25" },
  CAD:{ taux:7.4320,  date:"2026-04-25" },
  CHF:{ taux:11.3560, date:"2026-04-25" },
  AED:{ taux:2.7280,  date:"2026-04-25" },
};

const PAYS_IBAN = new Set([
  "AD","AE","AL","AT","AZ","BA","BE","BG","BH","BR","BY","CH","CY","CZ",
  "DE","DK","EE","ES","FI","FR","GB","GE","GI","GR","HR","HU","IE","IL",
  "IS","IT","JO","KW","KZ","LB","LI","LT","LU","LV","MA","MC","MD","ME",
  "MK","MT","MU","NL","NO","PL","PT","RO","RS","SA","SE","SI","SK","SM",
  "TN","TR","UA","VA",
]);

const REF_COUNTRIES = [
  { code:"MA", label:"Maroc",          fatf:"BLANC" },
  { code:"FR", label:"France",         fatf:"BLANC" },
  { code:"DE", label:"Allemagne",      fatf:"BLANC" },
  { code:"GB", label:"Royaume-Uni",    fatf:"BLANC" },
  { code:"US", label:"Etats-Unis",     fatf:"BLANC" },
  { code:"AE", label:"Emirats Arabes", fatf:"BLANC" },
  { code:"TN", label:"Tunisie",        fatf:"BLANC" },
  { code:"DZ", label:"Algerie",        fatf:"GRIS"  },
  { code:"SN", label:"Senegal",        fatf:"BLANC" },
  { code:"IR", label:"Iran",           fatf:"NOIR"  },
  { code:"CA", label:"Canada",         fatf:"BLANC" },
  { code:"CN", label:"Chine",          fatf:"BLANC" },
];

const REF_BENE_BANKS = [
  { bic:"BNPAFRPPXXX", nom:"BNP Paribas SA",       pays:"FR", ville:"Paris"      },
  { bic:"DEUTDEFFXXX", nom:"Deutsche Bank AG",      pays:"DE", ville:"Frankfurt"  },
  { bic:"ATTMMAMC",    nom:"Attijariwafa Bank",     pays:"MA", ville:"Casablanca" },
  { bic:"BCDMMAMC",    nom:"BMCE Bank",             pays:"MA", ville:"Casablanca" },
  { bic:"CITIUS33XXX", nom:"Citibank N.A.",         pays:"US", ville:"New York"   },
  { bic:"BARCGB22XXX", nom:"Barclays Bank PLC",     pays:"GB", ville:"London"     },
];

const REF_CORRESPONDENTS = [
  { bic:"DEUTDEFFXXX", nom:"Deutsche Bank AG",  pays:"DE", devises:["EUR","USD","GBP"] },
  { bic:"BNPAFRPPXXX", nom:"BNP Paribas SA",    pays:"FR", devises:["EUR","USD","MAD"] },
  { bic:"CITIUS33XXX", nom:"Citibank N.A.",      pays:"US", devises:["USD","EUR"]       },
  { bic:"BARCGB22XXX", nom:"Barclays Bank PLC", pays:"GB", devises:["GBP","EUR","USD"] },
];

const REF_INCOTERMS = [
  { code:"FOB", label:"Free On Board",            transport:"Mer"  },
  { code:"CIF", label:"Cost Insurance & Freight", transport:"Mer"  },
  { code:"CFR", label:"Cost & Freight",           transport:"Mer"  },
  { code:"EXW", label:"Ex Works",                 transport:"Tous" },
  { code:"DDP", label:"Delivered Duty Paid",      transport:"Tous" },
  { code:"DAP", label:"Delivered at Place",       transport:"Tous" },
];

const REF_CODES_MOTIFS = [
  { code:"101", label:"Importation de marchandises" },
  { code:"102", label:"Importation de services" },
  { code:"201", label:"Investissement direct etranger" },
  { code:"202", label:"Dividendes et benefices" },
  { code:"203", label:"Remboursement de pret" },
  { code:"301", label:"Frais de scolarite" },
  { code:"401", label:"Honoraires et prestations" },
];

const REF_CATEGORIES = [
  { code:"FINANCIER",  label:"Financier"  },
  { code:"COMMERCIAL", label:"Commercial" },
];

const REF_TYPES_TRANSFERT = [
  { code:"ORDINAIRE", label:"Transfert ordinaire",    categories:["FINANCIER","COMMERCIAL"] },
  { code:"SCOLARITE", label:"Transfert de scolarite", categories:["FINANCIER"] },
];

const REF_DOM_BANKS = [
  { code:"ATW",  label:"Attijariwafa Bank" },
  { code:"CIH",  label:"CIH Bank"          },
  { code:"BMCE", label:"BMCE Bank"         },
  { code:"BMCI", label:"BMCI"              },
  { code:"CAM",  label:"Credit Agricole Maroc" },
];

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function validateIBAN(iban) {
  const c = iban.replace(/\s/g,"").toUpperCase();
  if (c.length < 15 || c.length > 34) return false;
  const r = c.slice(4)+c.slice(0,4);
  const n = r.replace(/[A-Z]/g, ch => ch.charCodeAt(0)-55);
  let rem=0;
  for (const d of n) rem=(rem*10+parseInt(d))%97;
  return rem===1;
}
function formatIBAN(v) {
  const c=v.replace(/\s/g,"").toUpperCase();
  return c.match(/.{1,4}/g)?.join(" ")||c;
}
const genRef = () => "TRF-"+Date.now().toString().slice(-8);

// ─────────────────────────────────────────────────────────
// DROPDOWN avec portal simulé (z-index fix R1)
// ─────────────────────────────────────────────────────────
function Dropdown({ open, results, onSelect, renderItem, emptyMsg }) {
  if (!open || results.length === 0) return null;
  return (
    <div style={{
      position:"absolute", top:"100%", left:0, right:0, zIndex:99999,
      marginTop:4, background:"#0C1628",
      border:"1.5px solid rgba(6,182,212,.3)", borderRadius:10,
      boxShadow:"0 24px 60px rgba(0,0,0,.9)",
      maxHeight:260, overflowY:"auto",
    }}>
      {results.map((item,i) => (
        <div key={i}
          onMouseDown={e => { e.preventDefault(); onSelect(item); }}
          style={{
            padding:"11px 14px",
            borderBottom: i<results.length-1 ? "1px solid rgba(255,255,255,.04)" : "none",
            cursor:"pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(6,182,212,.09)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CHAMP RECHERCHE (R1 + R2)
// ─────────────────────────────────────────────────────────
function SearchField({ items, value, onChange, label, required, badge, placeholder, filterFn, renderItem, renderValue }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef();

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = q.length > 0
    ? items.filter(i => filterFn(i,q)).slice(0,8)
    : items.slice(0,8);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7A8BA0" }}>
          {label}{required && <span style={{ color:"#F5A623", marginLeft:3 }}>*</span>}
        </label>
        {badge && <span style={{ fontSize:9, padding:"1px 7px", borderRadius:20, background:"rgba(6,182,212,.12)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4", fontWeight:700 }}>{badge}</span>}
      </div>
      <div ref={wrapRef} style={{ position:"relative" }}>
        {value ? (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:"rgba(6,182,212,.07)", border:"1.5px solid rgba(6,182,212,.35)", borderRadius:9, cursor:"pointer" }}
            onClick={() => { onChange(null); setQ(""); }}>
            <div style={{ flex:1, fontSize:12, color:"#E2EAF2", fontFamily:"monospace" }}>{renderValue(value)}</div>
            <span style={{ color:"#3E5470", fontSize:13 }}>x</span>
          </div>
        ) : (
          <div style={{ position:"relative" }}>
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={placeholder}
              style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"9px 36px 9px 12px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}
            />
            {/* R2 — loupe cliquable */}
            <span
              onMouseDown={e => { e.preventDefault(); setOpen(true); }}
              style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"#3E5070", cursor:"pointer", userSelect:"none", padding:"4px" }}
              title="Cliquer pour afficher la liste"
            >&#9906;</span>
            {/* R1 — dropdown avec z-index elevé */}
            <Dropdown open={open} results={results} onSelect={item => { onChange(item); setOpen(false); setQ(""); }} renderItem={renderItem} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MODALE DE RECHERCHE
// ─────────────────────────────────────────────────────────
function SearchModal({ title, fields, items, filterFn, renderRow, onSelect, onClose }) {
  const [criteria, setCriteria] = useState({});
  const set = (k,v) => setCriteria(p => ({ ...p, [k]:v }));
  const filtered = items.filter(i => filterFn(i, criteria));

  return (
    <div style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(4,8,18,.9)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:640, background:"#0C1628", border:"1.5px solid rgba(6,182,212,.25)", borderRadius:16, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,.8)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(6,182,212,.04)" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#E2EAF2", fontFamily:"monospace" }}>Recherche — {title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20, lineHeight:1 }}>x</button>
        </div>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.05)", display:"grid", gridTemplateColumns:`repeat(${Math.min(fields.length,3)},1fr)`, gap:10 }}>
          {fields.map(f => (
            <div key={f.key}>
              <div style={{ fontSize:10, color:"#7A8BA0", textTransform:"uppercase", letterSpacing:".12em", marginBottom:4 }}>{f.label}</div>
              {f.type === "select" ? (
                <select value={criteria[f.key]||""} onChange={e => set(f.key,e.target.value)}
                  style={{ width:"100%", background:"#0b1425", border:"1px solid #1D3250", borderRadius:7, padding:"8px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                  <option value="">Tous</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input value={criteria[f.key]||""} onChange={e => set(f.key,e.target.value)} placeholder={f.placeholder||""}
                  style={{ width:"100%", background:"#0b1425", border:"1px solid #1D3250", borderRadius:7, padding:"8px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ maxHeight:280, overflowY:"auto" }}>
          {filtered.length === 0 && <div style={{ padding:"24px", textAlign:"center", color:"#2A4060", fontSize:12 }}>Aucun resultat</div>}
          {filtered.map((item,i) => (
            <div key={i} onClick={() => { onSelect(item); onClose(); }}
              style={{ padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,.04)", cursor:"pointer" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(6,182,212,.07)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              {renderRow(item)}
            </div>
          ))}
        </div>
        <div style={{ padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#2A4060" }}>{filtered.length} resultat(s)</span>
          <button onClick={onClose} style={{ padding:"7px 16px", borderRadius:8, fontSize:11, background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0", cursor:"pointer" }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ADRESSE ISO 20022 (R5)
// ─────────────────────────────────────────────────────────
function AdresseISO({ value, onChange, readOnly }) {
  const v = value||{};
  const set = (k,val) => onChange && onChange({ ...v, [k]:val });
  const inp = (field, label, span) => (
    <div style={{ gridColumn:"span "+(span||1) }}>
      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:3 }}>{label}</div>
      <input value={v[field]||""} onChange={e=>set(field,e.target.value)} readOnly={readOnly} placeholder={readOnly?"":label}
        style={{ width:"100%", background:readOnly?"rgba(10,18,32,.4)":"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:8, padding:"7px 10px", fontSize:11, color:readOnly?"#4A6080":"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
    </div>
  );
  return (
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 2fr", gap:8 }}>
      {inp("rue","Numero et rue (StrtNm/BldgNb)",3)}
      {inp("complement","Complement (AdrLine)",3)}
      {inp("cp","Code postal")}
      {inp("ville","Ville (TwnNm)")}
      {inp("region","Region (CtrySubDvsn)")}
      <div>
        <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:3 }}>Pays (Ctry)</div>
        <select value={v.pays||""} onChange={e=>set("pays",e.target.value)} disabled={readOnly}
          style={{ width:"100%", background:readOnly?"rgba(10,18,32,.4)":"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:8, padding:"7px 10px", fontSize:11, color:readOnly?"#4A6080":"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
          <option value="">Selectionner...</option>
          {REF_COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.code} — {c.label}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COMPOSANTS UI
// ─────────────────────────────────────────────────────────
function Section({ icon, title, sub, accent, children }) {
  const ac = accent||"#0EA5E9";
  return (
    <div style={{ background:"rgba(8,15,28,.7)", border:"1px solid rgba(255,255,255,.06)", borderRadius:14, overflow:"visible" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 20px", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
        <div style={{ width:32, height:32, borderRadius:9, background:ac+"18", border:"1px solid "+ac+"30", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{icon}</div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#C8D8EA" }}>{title}</div>
          {sub && <div style={{ fontSize:10, color:"#3E5470", marginTop:1 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ padding:"18px 20px" }}>{children}</div>
    </div>
  );
}

function Field({ label, required, children, span, hint }) {
  return (
    <div style={{ gridColumn:"span "+(span||1), display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7A8BA0" }}>
        {label}{required && <span style={{ color:"#F5A623", marginLeft:3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize:10, color:"#2A4060" }}>{hint}</p>}
    </div>
  );
}

function TI({ value, onChange, placeholder, type, readOnly, borderColor, rows }) {
  const s = { width:"100%", background:readOnly?"rgba(10,18,32,.4)":"rgba(10,18,32,.8)", border:"1.5px solid "+(borderColor||"#1D3250"), borderRadius:9, padding:"9px 12px", fontSize:12, color:readOnly?"#4A6080":"#C8D8EA", fontFamily:"monospace", outline:"none" };
  if (rows) return <textarea value={value||""} onChange={onChange} placeholder={readOnly?"":placeholder} readOnly={readOnly} rows={rows} style={{ ...s, resize:"vertical" }} />;
  return <input type={type||"text"} value={value||""} onChange={onChange} placeholder={readOnly?"":placeholder} readOnly={readOnly} style={s} />;
}

function Ctrl({ status, label }) {
  const m = {
    valid:   { c:"#10b981", bg:"rgba(16,185,129,.1)", b:"rgba(16,185,129,.3)", i:"v" },
    error:   { c:"#ef4444", bg:"rgba(239,68,68,.1)",  b:"rgba(239,68,68,.3)",  i:"x" },
    warning: { c:"#f59e0b", bg:"rgba(245,158,11,.1)", b:"rgba(245,158,11,.3)", i:"!" },
    checking:{ c:"#06b6d4", bg:"rgba(6,182,212,.1)",  b:"rgba(6,182,212,.3)",  i:"o" },
    pending: { c:"#3E5470", bg:"rgba(62,84,112,.1)",  b:"rgba(62,84,112,.3)",  i:"-" },
  };
  const s = m[status]||m.pending;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, background:s.bg, border:"1px solid "+s.b, color:s.c, fontFamily:"monospace" }}>{s.i} {label}</span>;
}

// ─────────────────────────────────────────────────────────
// APP PRINCIPALE
// ─────────────────────────────────────────────────────────
export default function SaisieModule({ orderToEdit, onSaved }) {
  const [orderId] = useState(genRef);
  const [step, setStep] = useState(1);
// Pré-remplissage si modification d'un ordre existant
useEffect(() => {
  if (!orderToEdit) return;
  setCategorie(orderToEdit.categorie || "");
  setTypeTransfert(orderToEdit.typeTransfert || "");
  setDomRef(orderToEdit.domRef || "");
  setDomDate(orderToEdit.domDate || "");
  setNomClient(orderToEdit.clientNom || "");
  setAdresseClient(orderToEdit.clientAdresse || {});
  setDeviseCompte(orderToEdit.compteDevise || "");
  setPlafond(orderToEdit.plafond ? orderToEdit.plafond.toLocaleString("fr-FR") : "");
  setAmount(orderToEdit.amount || "");
  setValueDate(orderToEdit.valueDate ? new Date(orderToEdit.valueDate).toISOString().split("T")[0] : "");
  setTypeCours(orderToEdit.typeCours || "");
  setCoursChange(orderToEdit.coursChange || "");
  setMotif(orderToEdit.motif || "");
  setBeneName(orderToEdit.beneName || "");
  setBeneAdresse(orderToEdit.beneAdresse || {});
  setBeneIBAN(orderToEdit.beneIBAN || "");
  setReference(orderToEdit.referenceClient || "");
  setDetails(orderToEdit.details || "");
  setCharges(orderToEdit.charges || "SHA");
  // Champs référentiel — retrouver les objets complets
  if (orderToEdit.agenceCode) {
    const ag = REF_AGENCES.find(a => a.code === orderToEdit.agenceCode);
    if (ag) setAgence(ag);
  }
  if (orderToEdit.clientRef) {
    const cl = REF_CLIENTS.find(c => c.ref === orderToEdit.clientRef);
    if (cl) setRefClient(cl);
  }
  if (orderToEdit.currency) {
    const cu = REF_CURRENCIES.find(c => c.code === orderToEdit.currency);
    if (cu) setCurrency(cu);
  }
  if (orderToEdit.beneCountry) {
    const co = REF_COUNTRIES.find(c => c.code === orderToEdit.beneCountry);
    if (co) setCountry(co);
  }
  if (orderToEdit.beneBIC) {
    const bb = REF_BENE_BANKS.find(b => b.bic === orderToEdit.beneBIC);
    if (bb) setBeneBank(bb);
  }
 if (orderToEdit.compteNum) {
    const cp = REF_COMPTES.find(c => c.num === orderToEdit.compteNum);
    if (cp) {
      setCompte(cp);
      setDeviseCompte(cp.devise);
      setPlafond(cp.plafond.toLocaleString("fr-FR"));
    }
  }
  // Type transfert — après catégorie
  setTimeout(() => {
    if (orderToEdit.typeTransfert) setTypeTransfert(orderToEdit.typeTransfert);
  }, 100);
  if (orderToEdit.codeMotif) {
    const cm = REF_CODES_MOTIFS.find(c => c.code === orderToEdit.codeMotif);
    if (cm) setCodeMotif(cm);
  }
}, [orderToEdit]);
  // Nature du transfert (R9)
  const [categorie, setCategorie] = useState("");
  const [typeTransfert, setTypeTransfert] = useState("");
  const [domRef, setDomRef] = useState("");
  const [domBanque, setDomBanque] = useState(null);
  const [domDate, setDomDate] = useState("");

  // Donneur d'ordre (R4)
  const [agence, setAgence] = useState(null);
  const [refClient, setRefClient] = useState(null);
  const [nomClient, setNomClient] = useState("");
  const [adresseClient, setAdresseClient] = useState({});
  const [compte, setCompte] = useState(null);
  const [deviseCompte, setDeviseCompte] = useState("");
  const [plafond, setPlafond] = useState("");
  const [showModalClient, setShowModalClient] = useState(false);
  const [showModalCompte, setShowModalCompte] = useState(false);

  // Montant & Devise (R3 R7 R8)
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(null);
  const [valueDate, setValueDate] = useState(new Date(Date.now()+86400000).toISOString().split("T")[0]);
  const [typeCours, setTypeCours] = useState("");
  const [coursChange, setCoursChange] = useState("");
  const [motif, setMotif] = useState("");
  const [codeMotif, setCodeMotif] = useState(null);

  // Beneficiaire
  const [beneName, setBeneName] = useState("");
  const [beneAdresse, setBeneAdresse] = useState({});
  const [country, setCountry] = useState(null);
  const [beneIBAN, setBeneIBAN] = useState("");
  const [beneBank, setBeneBank] = useState(null);
  const [correspondent, setCorrespondent] = useState(null);
  const [incoterm, setIncoterm] = useState(null);
  const [reference, setReference] = useState("");
  const [details, setDetails] = useState("");
  const [charges, setCharges] = useState("SHA");

  // Controles
  const [ibanCtrl, setIbanCtrl] = useState("pending");
  const [amlCtrl, setAmlCtrl] = useState("pending");
  const [amlMsg, setAmlMsg] = useState(null);
  const amlTimer = useRef();

  const usesIBAN = country ? PAYS_IBAN.has(country.code) : true;
  const needsDom = categorie === "COMMERCIAL";
  const overLimit = plafond && amount && parseFloat(amount) > parseFloat(plafond.replace(/\s/g,""));
  const fatfIssue = country && country.fatf !== "BLANC";
  const typesDisponibles = REF_TYPES_TRANSFERT.filter(t => !categorie || t.categories.includes(categorie));

  // Reset type si categorie change
  useEffect(() => { setTypeTransfert(""); }, [categorie]);

  // Cours de change (R8)
  useEffect(() => {
    if (typeCours === "FIXING" && currency && REF_COURS[currency.code]) {
      const c = REF_COURS[currency.code];
      setCoursChange(c.taux+" (Fixing du "+c.date+")");
    } else if (typeCours === "COUVERTURE" || typeCours === "") {
      setCoursChange("");
    }
  }, [typeCours, currency]);

  // IBAN (R6)
  useEffect(() => {
    if (!beneIBAN || beneIBAN.length < 5 || !usesIBAN) { setIbanCtrl("pending"); return; }
    setIbanCtrl("checking");
    const t = setTimeout(() => setIbanCtrl(validateIBAN(beneIBAN) ? "valid" : "error"), 600);
    return () => clearTimeout(t);
  }, [beneIBAN, usesIBAN]);

  // AML
  useEffect(() => {
    if (!beneName || beneName.length < 3) { setAmlCtrl("pending"); setAmlMsg(null); return; }
    setAmlCtrl("checking");
    clearTimeout(amlTimer.current);
    amlTimer.current = setTimeout(() => {
      const blocked = ["IRAN","SYRIE","CUBA"].some(s => beneName.toUpperCase().includes(s));
      if (blocked) { setAmlCtrl("error"); setAmlMsg("Match liste sanctions OFAC/UE — ordre bloque"); }
      else { setAmlCtrl("valid"); setAmlMsg("Conforme — aucun match detecte"); }
    }, 1600);
  }, [beneName]);

  const handleClientSelect = c => {
    setRefClient(c);
    setNomClient(c.nom);
    setAdresseClient(c.adresse||{});
  };

  const handleCompteSelect = c => {
    setCompte(c);
    setDeviseCompte(c.devise);
    setPlafond(c.plafond.toLocaleString("fr-FR"));
  };

  const canSubmit = () =>
    categorie && typeTransfert && agence && refClient && nomClient &&
    amount && currency && !overLimit && beneName && country &&
    beneIBAN && beneBank && amlCtrl !== "error" &&
    (!needsDom || (domRef && domBanque)) &&
    (!usesIBAN || ibanCtrl === "valid");

const handleSubmit = async () => {
  const token = getToken();
  const isEdit = !!orderToEdit;
  try {
    const res = await fetch(isEdit ? `${API_URL}/payments/${orderToEdit.id}` : `${API_URL}/payments`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        agenceCode:      agence?.code,
        clientRef:       refClient?.ref,
        clientNom:       nomClient,
        clientAdresse:   adresseClient,
        compteNum:       compte?.num,
        compteDevise:    deviseCompte,
        plafond:         parseFloat(plafond?.replace(/\s/g,'')||0),
        amount:          parseFloat(amount),
        currency:        currency?.code,
        valueDate:       valueDate,
        typeCours:       typeCours,
        coursChange:     coursChange,
        motif:           motif,
        codeMotif:       codeMotif?.code,
        categorie:       categorie,
        typeTransfert:   typeTransfert,
        domRef:          domRef,
        domBanque:       domBanque?.label,
        domDate:         domDate,
        beneName:        beneName,
        beneAdresse:     beneAdresse,
        beneCountry:     country?.code,
        beneIBAN:        beneIBAN,
        beneBIC:         beneBank?.bic,
        beneBankName:    beneBank?.nom,
        correspondentBIC: correspondent?.bic,
        incoterm:        incoterm?.code,
        referenceClient: reference,
        charges:         charges,
        details:         details,
      }),
    });

   const data = await res.json();
if (res.ok) {
  const submitRes = await fetch(`${API_URL}/payments/${data.id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });
 if (submitRes.ok) {
    if (onSaved) onSaved();
    else setStep(3);
  } else {
    const submitData = await submitRes.json();
    alert('Ordre créé mais erreur de soumission : ' + (submitData.message || 'Erreur inconnue'));
    setStep(3);
  }
}
    else {
      alert('Erreur : ' + (data.message || 'Impossible de créer l\'ordre'));
    }
  } catch(e) {
    alert('Erreur de connexion au serveur');
  }
};
  const G = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };

  if (step === 3) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"70vh", fontFamily:"monospace" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>OK</div>
        <div style={{ fontSize:18, fontWeight:700, color:"#E2EAF2", marginBottom:8 }}>Ordre soumis</div>
        <div style={{ fontSize:13, color:"#06b6d4", marginBottom:24 }}>{orderId}</div>
        <button onClick={() => { setStep(1); setCategorie(""); setTypeTransfert(""); setAgence(null); setRefClient(null); setNomClient(""); setAdresseClient({}); setCompte(null); setDeviseCompte(""); setPlafond(""); setAmount(""); setCurrency(null); setBeneName(""); setBeneAdresse({}); setCountry(null); setBeneIBAN(""); setBeneBank(null); }}
          style={{ padding:"10px 24px", borderRadius:9, background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          + Nouvel ordre
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace", color:"#C8D8EA", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;}
        select option{background:#0C1628;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050C1A}::-webkit-scrollbar-thumb{background:#1D3250;border-radius:2px}
      `}</style>

      {/* HEADER */}
      <div style={{ background:"rgba(5,12,26,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 28px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:200 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Saisie ordre de virement</span>
          <span style={{ fontSize:11, color:"#0EA5E9", fontFamily:"monospace" }}>{orderId}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {["Saisie","Verification","Validation"].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, background:step>i+1?"#0891b2":"transparent", border:step===i+1?"1.5px solid #0891b2":"1.5px solid #1D3250", color:step>=i+1?"#0891b2":"#2A4060" }}>{step>i+1?"v":i+1}</div>
              <span style={{ fontSize:10, color:step===i+1?"#0EA5E9":"#2A4060" }}>{s}</span>
              {i<2 && <div style={{ width:14, height:1, background:step>i+1?"rgba(8,145,178,.4)":"#1D3250" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"22px 28px 60px", display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease forwards" }}>

        {/* 1. NATURE DU TRANSFERT — PREMIER BLOC (R9) */}
        <Section icon="R" title="Nature du transfert" sub="Premier bloc — toutes devises" accent="#8B5CF6">
          <div style={G}>
            <Field label="Categorie du transfert" required>
              <select value={categorie} onChange={e => setCategorie(e.target.value)}
                style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"9px 12px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                <option value="">Selectionner...</option>
                {REF_CATEGORIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Type du transfert" required>
              <select value={typeTransfert} onChange={e => setTypeTransfert(e.target.value)} disabled={!categorie}
                style={{ width:"100%", background:!categorie?"rgba(10,18,32,.4)":"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"9px 12px", fontSize:12, color:!categorie?"#2A4060":"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                <option value="">Selectionner...</option>
                {typesDisponibles.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
              </select>
            </Field>

            {needsDom && (
              <>
                <div style={{ gridColumn:"span 2", height:1, background:"rgba(255,255,255,.05)", margin:"4px 0" }} />
                <Field label="N Titre importation (domiciliation)" required>
                  <TI value={domRef} onChange={e => setDomRef(e.target.value)} placeholder="DOM-YYYY-XXXXXX" borderColor={domRef?"rgba(245,158,11,.4)":"#1D3250"} />
                </Field>
                <SearchField items={REF_DOM_BANKS} value={domBanque} onChange={setDomBanque}
                  label="Banque domiciliataire" required placeholder="Rechercher..."
                  filterFn={(b,q) => b.label.toLowerCase().includes(q.toLowerCase())}
                  renderValue={b => b.label}
                  renderItem={b => <div style={{ fontSize:12, color:"#C8D8EA" }}>{b.label}</div>} />
                <Field label="Date de domiciliation">
                  <TI type="date" value={domDate} onChange={e => setDomDate(e.target.value)} style={{ colorScheme:"dark" }} />
                </Field>
              </>
            )}
          </div>
        </Section>

        {/* 2. DONNEUR D'ORDRE (R4) */}
        <Section icon="D" title="Donneur d'ordre" sub="Agence, client et compte — selection depuis referentiels" accent="#0EA5E9">
          <div style={G}>

            <SearchField items={REF_AGENCES} value={agence} onChange={setAgence}
              label="Agence" required placeholder="Rechercher une agence..."
              filterFn={(a,q) => a.label.toLowerCase().includes(q.toLowerCase()) || a.code.toLowerCase().includes(q.toLowerCase())}
              renderValue={a => a.code+" — "+a.label}
              renderItem={a => (
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#C8D8EA" }}>{a.label}</div>
                  <div style={{ fontSize:10, color:"#3E5470" }}>{a.code} — {a.ville}</div>
                </div>
              )} />

            <Field label="Reference client" required>
              <div style={{ display:"flex", gap:8 }}>
                <TI value={refClient?.ref||""} readOnly placeholder="Selectionner via la loupe" borderColor={refClient?"rgba(6,182,212,.35)":"#1D3250"} />
                <button onClick={() => setShowModalClient(true)} title="Rechercher un client"
                  style={{ padding:"0 14px", borderRadius:9, background:"rgba(6,182,212,.1)", border:"1.5px solid rgba(6,182,212,.3)", color:"#06b6d4", fontSize:18, cursor:"pointer", flexShrink:0, lineHeight:1 }}>
                  &#9906;
                </button>
              </div>
            </Field>

            <Field label="Nom du client">
              <TI value={nomClient} onChange={e => !refClient && setNomClient(e.target.value)} placeholder="Auto-renseigne apres selection" readOnly={!!refClient} borderColor={nomClient?"rgba(6,182,212,.25)":"#1D3250"} />
            </Field>

            <Field label="Numero de compte">
              <div style={{ display:"flex", gap:8 }}>
                <TI value={compte?.num||""} readOnly placeholder="Selectionner via la loupe" borderColor={compte?"rgba(6,182,212,.35)":"#1D3250"} />
                <button onClick={() => setShowModalCompte(true)} title="Rechercher un compte"
                  style={{ padding:"0 14px", borderRadius:9, background:"rgba(6,182,212,.1)", border:"1.5px solid rgba(6,182,212,.3)", color:"#06b6d4", fontSize:18, cursor:"pointer", flexShrink:0, lineHeight:1 }}>
                  &#9906;
                </button>
              </div>
            </Field>

            <Field label="Devise du compte">
              <TI value={deviseCompte} readOnly placeholder="Auto-renseigne" borderColor={deviseCompte?"rgba(6,182,212,.25)":"#1D3250"} />
            </Field>

            <Field label="Plafond">
              <TI value={plafond} readOnly placeholder="Auto-renseigne" borderColor={plafond?"rgba(6,182,212,.25)":"#1D3250"} />
            </Field>

            <div style={{ gridColumn:"span 2" }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7A8BA0", marginBottom:8 }}>Adresse client (ISO 20022)</div>
              <AdresseISO value={adresseClient} onChange={setAdresseClient} readOnly={!!refClient} />
            </div>
          </div>
        </Section>

        {/* 3. MONTANT & DEVISE (R3 R7 R8) */}
        <Section icon="M" title="Montant & Devise" sub="Date de valeur, cours de change, motif et code motif" accent="#8B5CF6">
          <div style={G}>
            <Field label="Montant" required>
              <div style={{ position:"relative" }}>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1.5px solid "+(overLimit?"rgba(239,68,68,.6)":amount?"#2A4A6E":"#1D3250"), borderRadius:9, padding:"9px 52px 9px 12px", fontSize:20, fontWeight:700, color:overLimit?"#fca5a5":"#E2EAF2", fontFamily:"monospace", outline:"none" }} />
                <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#0EA5E9", fontWeight:700, fontSize:14 }}>{currency?.code||"—"}</span>
              </div>
              {overLimit && <p style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>Depasse le plafond ({plafond})</p>}
              {currency && currency.code !== "EUR" && amount && <p style={{ fontSize:10, color:"#3E6080", marginTop:3 }}>Equiv. EUR : {(parseFloat(amount)/currency.rate).toFixed(2)}</p>}
            </Field>

            <SearchField items={REF_CURRENCIES} value={currency} onChange={setCurrency}
              label="Devise" required placeholder="EUR, USD, MAD..." badge="ISO 4217"
              filterFn={(c,q) => c.code.toLowerCase().includes(q.toLowerCase()) || c.label.toLowerCase().includes(q.toLowerCase())}
              renderValue={c => c.code+" — "+c.label}
              renderItem={c => (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:28, height:20, borderRadius:4, background:"#1D3250", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#06b6d4" }}>{c.flag}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#C8D8EA" }}>{c.code} — {c.label}</div>
                    <div style={{ fontSize:10, color:"#2A4060" }}>1 EUR = {c.rate} {c.code}</div>
                  </div>
                </div>
              )} />

            <Field label="Date de valeur" required>
              <TI type="date" value={valueDate} onChange={e => setValueDate(e.target.value)} />
            </Field>

            <Field label="Type de cours" required>
              <select value={typeCours} onChange={e => setTypeCours(e.target.value)}
                style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"9px 12px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                <option value="">Selectionner...</option>
                <option value="FIXING">Fixing</option>
                <option value="NEGOCIE">Negocie</option>
                <option value="COUVERTURE">Couverture confrere</option>
              </select>
            </Field>

            <Field label="Cours de change" span={2}>
              {typeCours === "NEGOCIE" ? (
                <div style={{ display:"flex", gap:8 }}>
                  <TI value={coursChange} onChange={e => setCoursChange(e.target.value)} placeholder="Saisir ou rechercher ticket cambiste..." />
                  <button title="Rechercher ticket cambiste via API"
                    style={{ padding:"0 14px", borderRadius:9, background:"rgba(6,182,212,.1)", border:"1.5px solid rgba(6,182,212,.3)", color:"#06b6d4", fontSize:18, cursor:"pointer", flexShrink:0, lineHeight:1 }}>
                    &#9906;
                  </button>
                </div>
              ) : (
                <TI value={coursChange}
                  readOnly={typeCours === "FIXING" || typeCours === "COUVERTURE"}
                  placeholder={
                    typeCours === "COUVERTURE" ? "Non applicable — Couverture confrere" :
                    typeCours === "FIXING"     ? "Auto-renseigne depuis le referentiel cours" :
                    "Selectionner le type de cours"
                  }
                  borderColor={typeCours==="FIXING"&&coursChange?"rgba(16,185,129,.3)":"#1D3250"} />
              )}
              {typeCours==="FIXING"&&coursChange && <p style={{ fontSize:10, color:"#10b981", marginTop:3 }}>Dernier cours disponible — Bank Al-Maghrib</p>}
            </Field>

            <Field label="Motif du transfert" span={2}>
              <TI value={motif} onChange={e => setMotif(e.target.value)} placeholder="Description libre du motif economique..." />
            </Field>

            <SearchField items={REF_CODES_MOTIFS} value={codeMotif} onChange={setCodeMotif}
              label="Code motif (Office des Changes)" placeholder="Rechercher un code..." badge="O.d.C"
              filterFn={(c,q) => c.code.includes(q) || c.label.toLowerCase().includes(q.toLowerCase())}
              renderValue={c => c.code+" — "+c.label}
              renderItem={c => (
                <div style={{ fontSize:12, color:"#C8D8EA" }}>
                  <span style={{ color:"#0EA5E9", fontWeight:700 }}>{c.code}</span> — {c.label}
                </div>
              )} />
          </div>
        </Section>

        {/* 4. BENEFICIAIRE */}
        <Section icon="B" title="Beneficiaire" sub="Controles AML et IBAN conditionnel selon pays (R6)" accent="#F59E0B">
          <div style={G}>
            <Field label="Nom / Raison sociale" required span={2}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <TI value={beneName} onChange={e => setBeneName(e.target.value)} placeholder="Denomination complete..."
                  borderColor={amlCtrl==="error"?"rgba(239,68,68,.5)":amlCtrl==="valid"?"rgba(16,185,129,.3)":"#1D3250"} />
                <Ctrl status={amlCtrl} label="AML" />
                <Ctrl status={amlCtrl==="pending"?"pending":amlCtrl==="checking"?"checking":"valid"} label="Sanctions" />
              </div>
              {amlMsg && <p style={{ fontSize:10, color:amlCtrl==="error"?"#ef4444":"#10b981", marginTop:3 }}>{amlMsg}</p>}
            </Field>

            <div style={{ gridColumn:"span 2" }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7A8BA0", marginBottom:8 }}>Adresse beneficiaire (ISO 20022)</div>
              <AdresseISO value={beneAdresse} onChange={setBeneAdresse} />
            </div>

            <SearchField items={REF_COUNTRIES} value={country} onChange={v => { setCountry(v); setIbanCtrl("pending"); setBeneIBAN(""); }}
              label="Pays" required placeholder="Rechercher..." badge="ISO 3166"
              filterFn={(c,q) => c.code.toLowerCase().includes(q.toLowerCase()) || c.label.toLowerCase().includes(q.toLowerCase())}
              renderValue={c => c.code+" — "+c.label}
              renderItem={c => (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#C8D8EA" }}>{c.code} — {c.label}</div>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700,
                    background:c.fatf==="BLANC"?"rgba(16,185,129,.1)":c.fatf==="GRIS"?"rgba(245,158,11,.1)":"rgba(239,68,68,.1)",
                    border:"1px solid "+(c.fatf==="BLANC"?"rgba(16,185,129,.25)":c.fatf==="GRIS"?"rgba(245,158,11,.25)":"rgba(239,68,68,.25)"),
                    color:c.fatf==="BLANC"?"#10b981":c.fatf==="GRIS"?"#f59e0b":"#ef4444" }}>GAFI {c.fatf}</span>
                </div>
              )} />

            <Field label={usesIBAN ? "IBAN" : "Numero de compte"} required>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <TI
                  value={beneIBAN}
                  onChange={e => setBeneIBAN(usesIBAN ? formatIBAN(e.target.value) : e.target.value)}
                  placeholder={usesIBAN ? "FR76 3000 6000 0112..." : "Numero de compte local..."}
                  borderColor={usesIBAN && ibanCtrl==="error"?"rgba(239,68,68,.5)":usesIBAN && ibanCtrl==="valid"?"rgba(16,185,129,.3)":"#1D3250"} />
                {usesIBAN && <Ctrl status={ibanCtrl} label="IBAN" />}
              </div>
              {usesIBAN && ibanCtrl==="error" && <p style={{ fontSize:10, color:"#ef4444", marginTop:3 }}>IBAN invalide — verifier format et cle de controle</p>}
              {!usesIBAN && country && <p style={{ fontSize:10, color:"#06b6d4", marginTop:3 }}>Pays hors zone IBAN — saisie libre</p>}
            </Field>

            {fatfIssue && (
              <div style={{ gridColumn:"span 2", padding:"8px 14px", borderRadius:8, fontSize:11,
                background:country.fatf==="GRIS"?"rgba(245,158,11,.06)":"rgba(239,68,68,.06)",
                border:"1px solid "+(country.fatf==="GRIS"?"rgba(245,158,11,.25)":"rgba(239,68,68,.25)"),
                color:country.fatf==="GRIS"?"#f59e0b":"#ef4444" }}>
                {country.fatf==="GRIS"?"Pays GAFI liste grise — controle renforce obligatoire":"Pays GAFI liste noire — transfert bloque reglementairement"}
              </div>
            )}

            <SearchField items={REF_BENE_BANKS} value={beneBank} onChange={setBeneBank}
              label="Banque beneficiaire" required placeholder="BIC ou nom banque..." badge="SWIFT"
              filterFn={(b,q) => b.bic.toLowerCase().includes(q.toLowerCase()) || b.nom.toLowerCase().includes(q.toLowerCase())}
              renderValue={b => b.bic+" — "+b.nom}
              renderItem={b => (
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#C8D8EA" }}>{b.nom}</div>
                  <div style={{ fontSize:10, color:"#3E5470" }}>{b.bic} — {b.ville}, {b.pays}</div>
                </div>
              )} />
          </div>
        </Section>

        {/* 5. CORRESPONDANTE & INCOTERMS */}
        <Section icon="C" title="Banque correspondante & Incoterms" sub="Reseau de correspondants et conditions commerciales" accent="#10B981">
          <div style={G}>
            <SearchField items={REF_CORRESPONDENTS} value={correspondent} onChange={setCorrespondent}
              label="Banque correspondante" placeholder="BIC ou nom..." badge="Reseau"
              filterFn={(b,q) => b.bic.toLowerCase().includes(q.toLowerCase()) || b.nom.toLowerCase().includes(q.toLowerCase())}
              renderValue={b => b.bic+" — "+b.nom}
              renderItem={b => (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#C8D8EA" }}>{b.nom}</div>
                    <div style={{ fontSize:10, color:"#3E5470" }}>{b.bic} — {b.pays}</div>
                  </div>
                  <div style={{ display:"flex", gap:3 }}>
                    {b.devises.map(d => <span key={d} style={{ fontSize:9, padding:"1px 5px", borderRadius:8, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.2)", color:"#10b981" }}>{d}</span>)}
                  </div>
                </div>
              )} />

            <SearchField items={REF_INCOTERMS} value={incoterm} onChange={setIncoterm}
              label="Incoterm" placeholder="FOB, CIF, DDP..." badge="ICC 2020"
              filterFn={(t,q) => t.code.toLowerCase().includes(q.toLowerCase()) || t.label.toLowerCase().includes(q.toLowerCase())}
              renderValue={t => t.code+" — "+t.label}
              renderItem={t => (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:"#0EA5E9", minWidth:32 }}>{t.code}</span>
                  <div>
                    <div style={{ fontSize:12, color:"#C8D8EA" }}>{t.label}</div>
                    <div style={{ fontSize:10, color:"#2A4060" }}>{t.transport}</div>
                  </div>
                </div>
              )} />
          </div>
        </Section>

        {/* 6. DETAILS */}
        <Section icon="P" title="Details du paiement" sub="Reference, frais et libelle SWIFT" accent="#6366F1">
          <div style={G}>
            <Field label="Reference client" required>
              <TI value={reference} onChange={e => setReference(e.target.value)} placeholder="N contrat, facture..." />
            </Field>
            <Field label="Frais bancaires" required>
              <div style={{ display:"flex", gap:6 }}>
                {["OUR","SHA","BEN"].map(c => (
                  <button key={c} onClick={() => setCharges(c)}
                    style={{ flex:1, padding:"9px 0", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
                      background:charges===c?"rgba(14,165,233,.12)":"rgba(10,18,32,.6)",
                      border:"1.5px solid "+(charges===c?"rgba(14,165,233,.45)":"#1D3250"),
                      color:charges===c?"#0EA5E9":"#3E5070" }}>{c}</button>
                ))}
              </div>
            </Field>
            <Field label="Libelle SWIFT (140 car. max)" span={2}>
              <div style={{ position:"relative" }}>
                <TI value={details} onChange={e => setDetails(e.target.value.slice(0,140))} placeholder="Information pour le beneficiaire..." rows={2} />
                <span style={{ position:"absolute", right:10, bottom:8, fontSize:9, color:"#2A4060" }}>{details.length}/140</span>
              </div>
            </Field>
          </div>
        </Section>

        {/* BARRE CONTROLES */}
        <div style={{ background:"rgba(8,15,28,.85)", border:"1px solid rgba(255,255,255,.06)", borderRadius:13, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
          <div>
            <div style={{ fontSize:9, color:"#2A4060", textTransform:"uppercase", letterSpacing:".15em", marginBottom:8 }}>Statut des controles</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <Ctrl status={categorie&&typeTransfert?"valid":"pending"} label="Nature" />
              <Ctrl status={agence&&refClient?"valid":"pending"} label="Donneur" />
              <Ctrl status={currency&&amount&&!overLimit?"valid":overLimit?"error":"pending"} label="Montant" />
              <Ctrl status={usesIBAN?ibanCtrl:country?"valid":"pending"} label={usesIBAN?"IBAN":"Compte"} />
              <Ctrl status={amlCtrl} label="AML" />
              <Ctrl status={country?.fatf==="NOIR"?"error":country?.fatf==="GRIS"?"warning":country?"valid":"pending"} label="GAFI" />
              {needsDom && <Ctrl status={domRef&&domBanque?"valid":"pending"} label="Domiciliation" />}
            </div>
          </div>
          <button onClick={() => canSubmit() && setStep(2)} disabled={!canSubmit()} style={{
            padding:"12px 32px", borderRadius:10, fontSize:13, fontWeight:700,
            cursor:canSubmit()?"pointer":"not-allowed",
            background:canSubmit()?"linear-gradient(135deg,#0E6494,#0891b2)":"rgba(20,35,55,.6)",
            border:"1px solid "+(canSubmit()?"rgba(14,165,233,.4)":"rgba(30,50,80,.4)"),
            color:canSubmit()?"#fff":"#2A4060",
            boxShadow:canSubmit()?"0 0 28px rgba(14,165,233,.25)":"none",
          }}>
            {canSubmit() ? "Soumettre a validation →" : "Completer les champs requis"}
          </button>
        </div>
      </div>

      {/* MODALES RECHERCHE (R4) */}
      {showModalClient && (
        <SearchModal
          title="Recherche client donneur d'ordre"
          fields={[
            { key:"agence", label:"Agence", type:"select", options:REF_AGENCES.map(a => ({ value:a.code, label:a.label })) },
            { key:"ref",    label:"Reference client", placeholder:"CLI-XXX" },
            { key:"nom",    label:"Raison sociale", placeholder:"Nom du client..." },
          ]}
          items={REF_CLIENTS}
          filterFn={(c,cr) => {
            if (cr.agence && c.agence !== cr.agence) return false;
            if (cr.ref    && !c.ref.toLowerCase().includes(cr.ref.toLowerCase())) return false;
            if (cr.nom    && !c.nom.toLowerCase().includes(cr.nom.toLowerCase())) return false;
            return true;
          }}
          renderRow={c => (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>{c.nom}</div>
                <div style={{ fontSize:10, color:"#3E5470", marginTop:2 }}>{c.ref} — {REF_AGENCES.find(a=>a.code===c.agence)?.label}</div>
              </div>
              <span style={{ fontSize:11, color:"#06b6d4" }}>→ Selectionner</span>
            </div>
          )}
          onSelect={handleClientSelect}
          onClose={() => setShowModalClient(false)}
        />
      )}

      {showModalCompte && (
        <SearchModal
          title="Recherche numero de compte"
          fields={[
            { key:"agence", label:"Agence", type:"select", options:REF_AGENCES.map(a => ({ value:a.code, label:a.label })) },
            { key:"num",    label:"Numero de compte", placeholder:"MA64..." },
            { key:"devise", label:"Devise du compte", type:"select", options:REF_CURRENCIES.map(c => ({ value:c.code, label:c.code })) },
          ]}
          items={REF_COMPTES}
          filterFn={(c,cr) => {
            if (cr.agence && c.agence !== cr.agence) return false;
            if (cr.num    && !c.num.toLowerCase().includes(cr.num.toLowerCase())) return false;
            if (cr.devise && c.devise !== cr.devise) return false;
            return true;
          }}
          renderRow={c => (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"#E2EAF2", fontFamily:"monospace" }}>{c.num}</div>
                <div style={{ fontSize:10, color:"#3E5470", marginTop:2 }}>
                  {REF_AGENCES.find(a=>a.code===c.agence)?.label} — {c.devise} — Plafond : {c.plafond.toLocaleString("fr-FR")}
                </div>
              </div>
              <span style={{ fontSize:11, color:"#06b6d4" }}>→ Selectionner</span>
            </div>
          )}
          onSelect={handleCompteSelect}
          onClose={() => setShowModalCompte(false)}
        />
      )}

      {/* RECAP STEP 2 */}
      {step === 2 && (
        <div style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(4,8,18,.92)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ width:"100%", maxWidth:560, background:"#0C1628", border:"1.5px solid rgba(6,182,212,.25)", borderRadius:16, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,.8)" }}>
            <div style={{ padding:"18px 22px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>Confirmation de l'ordre</span>
              <span style={{ fontSize:12, color:"#0EA5E9", fontFamily:"monospace" }}>{orderId}</span>
            </div>
            <div style={{ padding:"18px 22px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                ["Categorie", categorie],
                ["Type", typeTransfert],
                ["Agence", agence?.label],
                ["Client", nomClient],
                ["Montant", parseFloat(amount||0).toLocaleString("fr-FR")+" "+(currency?.code||"")],
                ["Beneficiaire", beneName],
                ["Pays", country?.code+" — "+country?.label],
                ["IBAN/Compte", beneIBAN],
                ["Banque", beneBank?.bic+" — "+beneBank?.nom],
                ...(needsDom ? [["Domiciliation", domRef]] : []),
              ].map(([l,v]) => v ? (
                <div key={l} style={{ padding:"7px 10px", background:"rgba(255,255,255,.03)", borderRadius:7 }}>
                  <div style={{ fontSize:9, color:"#2A4060", textTransform:"uppercase", letterSpacing:".1em", marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:11, color:"#94A3B8", fontWeight:600, fontFamily:"monospace" }}>{v}</div>
                </div>
              ) : null)}
            </div>
            <div style={{ padding:"14px 22px", borderTop:"1px solid rgba(255,255,255,.05)", display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setStep(1)} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(20,35,55,.8)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Modifier</button>
              <button onClick={handleSubmit} style={{ padding:"8px 22px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0E6494,#0891b2)", border:"none", color:"#fff" }}>Confirmer et Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
