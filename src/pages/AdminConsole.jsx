import { useState, useEffect, useRef } from "react";
import { API_URL, getToken } from "../config.js";
import VisibiliteModule from "./VisibiliteModule.jsx";

// ─────────────────────────────────────────────────────────
// DONNÉES INITIALES
// ─────────────────────────────────────────────────────────
const INIT_BANK = {
  nom: "Banque Exemple Maroc",
  bic: "BEXMMAMC",
  codeBanque: "007",
  deviseRef: "MAD",
  logo: null,
  couleurs: {
    primaire:   "#0891b2",
    secondaire: "#0e7490",
    accent:     "#06b6d4",
    fond:       "#050C1A",
    texte:      "#E2EAF2",
  },
  applied: {
    primaire:   "#0891b2",
    secondaire: "#0e7490",
    accent:     "#06b6d4",
    fond:       "#050C1A",
    texte:      "#E2EAF2",
  },
};

const INIT_REFS = {
  clients: [
    { ref:"CLI-001", nom:"MAROC TELECOM SA",   agence:"AG-CAS-01", type:"CORPORATE",  actif:true  },
    { ref:"CLI-002", nom:"OCP SA",             agence:"AG-CAS-01", type:"CORPORATE",  actif:true  },
    { ref:"CLI-003", nom:"CIMENTS DU MAROC",   agence:"AG-RBA-01", type:"CORPORATE",  actif:true  },
    { ref:"CLI-004", nom:"DELTA HOLDING SA",   agence:"AG-RBA-02", type:"CORPORATE",  actif:false },
  ],
  comptes: [
    { num:"MA64011000010010001", client:"CLI-001", agence:"AG-CAS-01", devise:"MAD", plafond:5000000,  actif:true  },
    { num:"MA64011000010010002", client:"CLI-001", agence:"AG-CAS-01", devise:"EUR", plafond:500000,   actif:true  },
    { num:"MA64011000020020001", client:"CLI-002", agence:"AG-CAS-01", devise:"MAD", plafond:10000000, actif:true  },
    { num:"MA64011000030030001", client:"CLI-003", agence:"AG-RBA-01", devise:"MAD", plafond:2000000,  actif:false },
  ],
  agences: [
    { code:"AG-CAS-01", label:"Casablanca Centre",    ville:"Casablanca", actif:true  },
    { code:"AG-CAS-02", label:"Casablanca Ain Sebaâ", ville:"Casablanca", actif:true  },
    { code:"AG-RBA-01", label:"Rabat Hassan",          ville:"Rabat",      actif:true  },
    { code:"AG-RBA-02", label:"Rabat Agdal",           ville:"Rabat",      actif:true  },
    { code:"AG-FES-01", label:"Fès Médina",            ville:"Fès",        actif:false },
  ],
  devises: [
    { code:"EUR", label:"Euro",            zone:"Zone Euro",    actif:true  },
    { code:"USD", label:"Dollar US",       zone:"Amerique",     actif:true  },
    { code:"GBP", label:"Livre Sterling",  zone:"Royaume-Uni",  actif:true  },
    { code:"MAD", label:"Dirham Marocain", zone:"Maroc",        actif:true  },
    { code:"CAD", label:"Dollar Canadien", zone:"Amerique",     actif:true  },
    { code:"CHF", label:"Franc Suisse",    zone:"Europe",       actif:false },
  ],
  pays: [
    { code:"MA", label:"Maroc",       region:"Maghreb", fatf:"BLANC", iban:true,  actif:true  },
    { code:"FR", label:"France",      region:"Europe",  fatf:"BLANC", iban:true,  actif:true  },
    { code:"DE", label:"Allemagne",   region:"Europe",  fatf:"BLANC", iban:true,  actif:true  },
    { code:"GB", label:"Royaume-Uni", region:"Europe",  fatf:"BLANC", iban:true,  actif:true  },
    { code:"US", label:"Etats-Unis",  region:"Amerique",fatf:"BLANC", iban:false, actif:true  },
    { code:"DZ", label:"Algerie",     region:"Maghreb", fatf:"GRIS",  iban:true,  actif:true  },
    { code:"IR", label:"Iran",        region:"M-Orient",fatf:"NOIR",  iban:false, actif:false },
  ],
  correspondants: [
    { bic:"DEUTDEFFXXX", nom:"Deutsche Bank AG",  pays:"DE", devises:["EUR","USD","GBP"], plafond:10000000, actif:true  },
    { bic:"BNPAFRPPXXX", nom:"BNP Paribas SA",    pays:"FR", devises:["EUR","USD","MAD"], plafond:5000000,  actif:true  },
    { bic:"CITIUS33XXX", nom:"Citibank N.A.",      pays:"US", devises:["USD","EUR"],       plafond:20000000, actif:true  },
    { bic:"BARCGB22XXX", nom:"Barclays Bank PLC", pays:"GB", devises:["GBP","EUR","USD"], plafond:8000000,  actif:false },
  ],
  incoterms: [
    { code:"FOB", label:"Free On Board",            transport:"Mer",  actif:true  },
    { code:"CIF", label:"Cost Insurance & Freight", transport:"Mer",  actif:true  },
    { code:"EXW", label:"Ex Works",                 transport:"Tous", actif:true  },
    { code:"DDP", label:"Delivered Duty Paid",      transport:"Tous", actif:true  },
    { code:"DAP", label:"Delivered at Place",       transport:"Tous", actif:false },
  ],
  codesMotifs: [
    { code:"101", label:"Importation marchandises",   categorie:"COMMERCIAL", actif:true  },
    { code:"102", label:"Importation services",       categorie:"COMMERCIAL", actif:true  },
    { code:"201", label:"Investissement direct",      categorie:"FINANCIER",  actif:true  },
    { code:"202", label:"Dividendes et benefices",    categorie:"FINANCIER",  actif:true  },
    { code:"301", label:"Frais de scolarite",         categorie:"FINANCIER",  actif:true  },
    { code:"401", label:"Honoraires prestations",     categorie:"COMMERCIAL", actif:false },
  ],
  coursChange: [
    { devise:"USD", taux:10.0138, date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
    { devise:"EUR", taux:10.9200, date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
    { devise:"GBP", taux:12.7540, date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
    { devise:"CAD", taux:7.4320,  date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
  ],
  backOffices: [
    { code:"AMPLITUDE", label:"Amplitude", url:"",  actif:true  },
    { code:"FTI",       label:"FTI",       url:"",  actif:true  },
    { code:"MUREX",     label:"MUREX",     url:"",  actif:false },
    { code:"FLEXCUBE",  label:"FLEXCUBE",  url:"",  actif:false },
  ],
};

const INIT_WORKFLOW = [
  { id:"s1", ordre:1, nom:"Controle Provision",     type:"AUTO",   systemeTiers:"PROVISION", actif:true,  conditions:{toujours:true}, routing:{POSITIF:"NEXT",NEGATIF:"BLOCK",ALERTE:"MANUAL"} },
  { id:"s2", ordre:2, nom:"Validation Conformite",  type:"MANUEL", role:"Compliance Officer", actif:true,  conditions:{toujours:true}, routing:{POSITIF:"NEXT",NEGATIF:"PREVIOUS",ALERTE:"ESCALADE"} },
  { id:"s3", ordre:3, nom:"Validation Hierarchique",type:"MANUEL", role:"Directeur Operations",actif:true, conditions:{montantMin:500000}, routing:{POSITIF:"NEXT",NEGATIF:"PREVIOUS",ALERTE:"ESCALADE"} },
];

const INIT_PARAMS = {
  references: [
    { operation:"Transfert",              code:"TRF", prefixe:"TRF", annee:"YYYY", separateur:"-", longueur:6, parAgence:false, remiseZero:"ANNUELLE", exemple:"TRF-2026-000001" },
    { operation:"Credit documentaire",    code:"LCD", prefixe:"LCD", annee:"YYYY", separateur:"-", longueur:6, parAgence:false, remiseZero:"ANNUELLE", exemple:"LCD-2026-000001" },
    { operation:"Remise documentaire",    code:"REM", prefixe:"REM", annee:"YYYY", separateur:"-", longueur:6, parAgence:false, remiseZero:"ANNUELLE", exemple:"REM-2026-000001" },
    { operation:"Garantie bancaire",      code:"GAR", prefixe:"GAR", annee:"YYYY", separateur:"-", longueur:6, parAgence:false, remiseZero:"ANNUELLE", exemple:"GAR-2026-000001" },
  ],
  calendriers: [
    { pays:"MA", label:"Maroc",       joursOuv:"LUN-SAM", joursFeries:[
        { date:"2026-01-01", label:"Nouvel an" },
        { date:"2026-01-11", label:"Manifeste de l'Independance" },
        { date:"2026-05-01", label:"Fete du Travail" },
        { date:"2026-07-30", label:"Fete du Trone" },
        { date:"2026-08-14", label:"Oued Ed-Dahab" },
        { date:"2026-08-20", label:"Revolution du Roi et du Peuple" },
        { date:"2026-08-21", label:"Fete de la Jeunesse" },
        { date:"2026-11-06", label:"Marche Verte" },
        { date:"2026-11-18", label:"Fete de l'Independance" },
      ], reportFerie:"SUIVANT", actif:true },
    { pays:"FR", label:"France",      joursOuv:"LUN-VEN", joursFeries:[
        { date:"2026-01-01", label:"Jour de l'an" },
        { date:"2026-05-01", label:"Fete du Travail" },
        { date:"2026-05-08", label:"Victoire 1945" },
        { date:"2026-07-14", label:"Fete Nationale" },
        { date:"2026-08-15", label:"Assomption" },
        { date:"2026-11-01", label:"Toussaint" },
        { date:"2026-11-11", label:"Armistice" },
        { date:"2026-12-25", label:"Noel" },
      ], reportFerie:"SUIVANT", actif:true },
  ],
};

// ─────────────────────────────────────────────────────────
// MENUS NAVIGATION
// ─────────────────────────────────────────────────────────
const MENUS = [
  { id:"identite",    label:"Identite de la banque",  icon:"🏦", color:"#0EA5E9" },
  { id:"referentiels",label:"Referentiels",            icon:"📋", color:"#10B981" },
  { id:"workflow",    label:"Moteur Workflow",          icon:"🔀", color:"#8B5CF6" },
  { id:"parametrage", label:"Parametrage general",     icon:"⚙",  color:"#F59E0B" },
  { id:"champs",      label:"Parametrage des champs",  icon:"👁",  color:"#EC4899" },
];

const REF_TILES = [
  { id:"clients",       label:"Clients",               icon:"🏢", key:"clients"       },
  { id:"comptes",       label:"Comptes",               icon:"💳", key:"comptes"       },
  { id:"agences",       label:"Agences",               icon:"🏛",  key:"agences"       },
  { id:"devises",       label:"Devises",               icon:"💱", key:"devises"       },
  { id:"pays",          label:"Pays",                  icon:"🌍", key:"pays"          },
  { id:"correspondants",label:"Correspondants",        icon:"🔗", key:"correspondants"},
  { id:"incoterms",     label:"Incoterms",             icon:"📦", key:"incoterms"     },
  { id:"codesMotifs",   label:"Codes motifs",          icon:"📄", key:"codesMotifs"   },
  { id:"coursChange",   label:"Cours de change",       icon:"📈", key:"coursChange"   },
  { id:"backOffices",   label:"Back Offices",          icon:"🖥",  key:"backOffices"   },
];

// ─────────────────────────────────────────────────────────
// COMPOSANTS UI
// ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(!checked); }}
      style={{ width:36, height:20, borderRadius:10, cursor:"pointer", position:"relative", flexShrink:0,
        background:checked?"#0891b2":"#1e293b", border:"1px solid "+(checked?"#06b6d4":"#334155"), transition:"all .25s" }}>
      <div style={{ position:"absolute", top:3, left:checked?18:3, width:12, height:12, borderRadius:"50%",
        background:checked?"#fff":"#475569", transition:"left .25s" }} />
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:20, ...style }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7A8BA0", marginBottom:14, paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,.06)" }}>{children}</div>;
}

function Field({ label, children, required }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#7A8BA0" }}>
        {label}{required && <span style={{ color:"#F5A623", marginLeft:3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = (extra={}) => ({
  width:"100%", background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250",
  borderRadius:8, padding:"8px 12px", fontSize:12, color:"#C8D8EA",
  fontFamily:"monospace", outline:"none", ...extra
});

function SaveBtn({ onClick, saved }) {
  return (
    <button onClick={onClick} style={{
      padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
      background: saved ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#0891b2,#0e7490)",
      border:"none", color:"#fff", transition:"all .3s",
    }}>{saved ? "✓ Sauvegarde" : "Enregistrer"}</button>
  );
}

// ─────────────────────────────────────────────────────────
// 1. IDENTITÉ DE LA BANQUE
// ─────────────────────────────────────────────────────────
function IdentiteBank({ bank, setBank }) {
  const [local, setLocal] = useState(bank);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef();
const handleLogo = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => set("logo", ev.target.result);
  reader.readAsDataURL(file);
};

  const COLORS = [
  { key:"primaire",   label:"Couleur primaire",   hint:"Boutons, liens actifs"       },
  { key:"secondaire", label:"Couleur secondaire",  hint:"Hover, elements secondaires" },
  { key:"accent",     label:"Couleur accent",      hint:"Badges, indicateurs"         },
  { key:"fond",       label:"Couleur de fond",     hint:"Arriere-plan general"        },
  { key:"texte",      label:"Couleur du texte",    hint:"Texte principal"             },
];

  const set = (f, v) => setLocal(p => ({ ...p, [f]: v }));
const setColor = (f, v) => setLocal(p => ({ ...p, couleurs: { ...p.couleurs, [f]: v } }));
  // Charger depuis l'API au montage
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/bank-config`, {
          headers: { 'Authorization': 'Bearer ' + getToken() },
        });
        if (res.ok) {
          const data = await res.json();
          const config = {
            nom:       data.nom || '',
            bic:       data.bic || '',
            codeBanque:data.codeBanque || '',
            deviseRef: data.deviseRef || 'MAD',
            logo:      data.logo || null,
            couleurs:  data.couleurs || bank.couleurs,
            applied:   data.couleurs || bank.applied,
          };
          setLocal(config);
          setBank(config);
        }
      } catch(e) {
        console.error('Erreur chargement bank config:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/bank-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken(),
        },
        body: JSON.stringify({
          nom:       local.nom,
          bic:       local.bic,
          codeBanque:local.codeBanque,
          deviseRef: local.deviseRef,
          logo:      local.logo,
          couleurs:  local.couleurs,
        }),
      });
      if (res.ok) {
        setBank({ ...local, applied: { ...local.couleurs } });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch(e) {
      alert('Erreur de connexion');
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Identite de la banque</h2>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setPreview(v=>!v)} style={{ padding:"7px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:preview?"rgba(6,182,212,.15)":"rgba(30,41,59,.5)", border:"1px solid "+(preview?"rgba(6,182,212,.4)":"#1D3250"), color:preview?"#06b6d4":"#7A8BA0" }}>
            {preview ? "Masquer apercu" : "Apercu"}
          </button>
          <SaveBtn onClick={handleSave} saved={saved} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: preview ? "1fr 1fr" : "1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Informations générales */}
          <Card>
            <SectionTitle>Informations generales</SectionTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Nom de la banque" required>
                <input value={local.nom} onChange={e=>set("nom",e.target.value)} style={inp()} />
              </Field>
              <Field label="Code BIC/SWIFT" required>
                <input value={local.bic} onChange={e=>set("bic",e.target.value.toUpperCase())} placeholder="XXXXMAMC" style={inp({ fontFamily:"monospace" })} />
              </Field>
              <Field label="Code banque">
                <input value={local.codeBanque} onChange={e=>set("codeBanque",e.target.value)} placeholder="007" style={inp()} />
              </Field>
              <Field label="Devise de reference">
                <select value={local.deviseRef} onChange={e=>set("deviseRef",e.target.value)} style={inp()}>
                  {["MAD","EUR","USD","GBP","CAD"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          {/* Logo */}
          <Card>
            <SectionTitle>Logo de la banque</SectionTitle>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:80, height:80, borderRadius:12, background:"rgba(6,182,212,.08)", border:"2px dashed rgba(6,182,212,.25)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                {local.logo ? <img src={local.logo} alt="logo" style={{ width:"100%", height:"100%", objectFit:"contain" }} /> : <span style={{ fontSize:28 }}>🏦</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display:"none" }} />
                <button onClick={() => fileRef.current?.click()} style={{ padding:"8px 16px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4", marginBottom:8, display:"block" }}>
                  Charger un logo
                </button>
                {local.logo && <button onClick={()=>set("logo",null)} style={{ padding:"6px 14px", borderRadius:8, fontSize:11, cursor:"pointer", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444" }}>Supprimer</button>}
                <p style={{ fontSize:10, color:"#3E5470", marginTop:6 }}>PNG ou SVG recommande — fond transparent</p>
              </div>
            </div>
          </Card>

          {/* Charte graphique */}
          <Card>
            <SectionTitle>Charte graphique — Impact en temps reel sur l'interface</SectionTitle>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {COLORS.map(c => (
                <div key={c.key} style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:10, alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:"#C8D8EA" }}>{c.label}</div>
                    <div style={{ fontSize:10, color:"#3E5470" }}>{c.hint}</div>
                  </div>
                  <input type="color" value={local.couleurs[c.key]} onChange={e=>setColor(c.key,e.target.value)}
                    style={{ width:44, height:36, borderRadius:8, border:"1.5px solid #1D3250", cursor:"pointer", background:"transparent", padding:2 }} />
                  <input value={local.couleurs[c.key]} onChange={e=>setColor(c.key,e.target.value)}
                    style={{ ...inp({ width:100, fontSize:11 }) }} placeholder="#000000" />
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, padding:"8px 12px", background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.2)", borderRadius:8, fontSize:11, color:"#f59e0b" }}>
              L'apercu montre l'impact des couleurs — cliquer sur "Enregistrer" pour appliquer a tous les utilisateurs.
            </div>
          </Card>
        </div>

        {/* Aperçu */}
        {preview && (
          <div>
            <Card style={{ position:"sticky", top:20 }}>
              <SectionTitle>Apercu de l'interface</SectionTitle>
              <div style={{ background:local.couleurs.fond, borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,.1)" }}>
                {/* Mini header */}
                <div style={{ background:local.couleurs.fond, borderBottom:"1px solid rgba(255,255,255,.08)", padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
                  {local.logo ? <img src={local.logo} style={{ height:24, objectFit:"contain" }} alt="logo" /> : <div style={{ width:24, height:24, borderRadius:6, background:local.couleurs.primaire, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>⚡</div>}
                  <span style={{ fontSize:13, fontWeight:700, color:local.couleurs.texte }}>{local.nom || "Nom de la banque"}</span>
                </div>
                {/* Mini nav */}
                <div style={{ display:"flex", gap:4, padding:"8px 14px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                  {["Saisie","Validation","Workflow"].map((m,i) => (
                    <div key={m} style={{ padding:"4px 10px", borderRadius:6, fontSize:10, fontWeight:700,
                      background:i===0?local.couleurs.primaire+"22":"transparent",
                      color:i===0?local.couleurs.primaire:local.couleurs.texte+"88",
                      borderBottom:i===0?"2px solid "+local.couleurs.primaire:"2px solid transparent" }}>{m}</div>
                  ))}
                </div>
                {/* Mini content */}
                <div style={{ padding:14 }}>
                  <div style={{ marginBottom:10, padding:"10px 12px", background:"rgba(255,255,255,.04)", borderRadius:8, borderLeft:"3px solid "+local.couleurs.accent }}>
                    <div style={{ fontSize:11, fontWeight:700, color:local.couleurs.texte, marginBottom:4 }}>TRF-2026-000001</div>
                    <div style={{ fontSize:10, color:local.couleurs.texte+"66" }}>OCP SA — 150 000 EUR</div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <div style={{ padding:"6px 12px", borderRadius:6, fontSize:10, fontWeight:700, background:local.couleurs.primaire, color:"#fff" }}>Soumettre</div>
                    <div style={{ padding:"6px 12px", borderRadius:6, fontSize:10, fontWeight:700, background:"rgba(255,255,255,.06)", color:local.couleurs.texte+"88" }}>Annuler</div>
                  </div>
                  <div style={{ marginTop:10, display:"flex", gap:6 }}>
                    {["AML","IBAN","GAFI"].map(b => (
                      <span key={b} style={{ fontSize:9, padding:"2px 7px", borderRadius:20, background:local.couleurs.accent+"20", border:"1px solid "+local.couleurs.accent+"44", color:local.couleurs.accent, fontWeight:700 }}>{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 2. RÉFÉRENTIELS — ÉCRAN GÉNÉRIQUE
// ─────────────────────────────────────────────────────────
function RefDetail({ tile, refs, setRefs, onBack }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const items = refs[tile.key] || [];

  const filtered = items.filter(item => {
    const txt = Object.values(item).join(" ").toLowerCase();
    const ms = !search || txt.includes(search.toLowerCase());
    const ma = filter==="ALL" || (filter==="ACTIF"?item.actif:!item.actif);
    return ms && ma;
  });

  const toggleActif = idx => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], actif:!updated[idx].actif };
    setRefs(p => ({ ...p, [tile.key]:updated }));
  };

  const getCols = () => {
    switch(tile.id) {
      case "clients":       return [["Reference","ref"],["Nom","nom"],["Agence","agence"],["Type","type"]];
      case "comptes":       return [["Numero","num"],["Client","client"],["Agence","agence"],["Devise","devise"],["Plafond","plafond"]];
      case "agences":       return [["Code","code"],["Libelle","label"],["Ville","ville"]];
      case "devises":       return [["Code","code"],["Libelle","label"],["Zone","zone"]];
      case "pays":          return [["Code","code"],["Libelle","label"],["Region","region"],["GAFI","fatf"],["IBAN","iban"]];
      case "correspondants":return [["BIC","bic"],["Nom","nom"],["Pays","pays"],["Devises","devises"],["Plafond","plafond"]];
      case "incoterms":     return [["Code","code"],["Libelle","label"],["Transport","transport"]];
      case "codesMotifs":   return [["Code","code"],["Libelle","label"],["Categorie","categorie"]];
      case "coursChange":   return [["Devise","devise"],["Taux","taux"],["Date","date"],["Source","source"]];
      case "backOffices":   return [["Code","code"],["Libelle","label"],["URL","url"]];
      default:              return [["Valeur","label"]];
    }
  };

  const fmt = (item, field) => {
    const v = item[field];
    if (v===undefined||v===null||v==="") return "—";
    if (typeof v==="boolean") return v?"Oui":"Non";
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v==="number") return v.toLocaleString("fr-FR");
    return String(v);
  };

  const cols = getCols();
  const actifs = items.filter(i=>i.actif).length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{ padding:"6px 12px", borderRadius:8, fontSize:11, cursor:"pointer", background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4", fontFamily:"monospace" }}>← Referentiels</button>
          <span style={{ fontSize:18 }}>{tile.icon}</span>
          <h2 style={{ fontSize:15, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>{tile.label}</h2>
          <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.25)", color:"#10b981" }}>{actifs} actifs / {items.length}</span>
        </div>
        <button style={{ padding:"7px 16px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>+ Ajouter</button>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
          style={{ flex:1, ...inp() }} />
        {["ALL","ACTIF","INACTIF"].map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"7px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", border:"none", background:filter===f?"rgba(6,182,212,.15)":"rgba(15,23,42,.6)", color:filter===f?"#06b6d4":"#3E5470", borderBottom:filter===f?"2px solid #06b6d4":"2px solid transparent" }}>
            {f==="ALL"?"Tous":f==="ACTIF"?"Actifs":"Inactifs"}
          </button>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"rgba(6,182,212,.05)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
              {cols.map(([l]) => <th key={l} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".1em", fontWeight:700 }}>{l}</th>)}
              <th style={{ padding:"10px 14px", textAlign:"center", fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".1em", fontWeight:700, width:80 }}>Statut</th>
              <th style={{ padding:"10px 14px", width:60 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && <tr><td colSpan={cols.length+2} style={{ padding:"32px", textAlign:"center", color:"#2A4060", fontSize:12 }}>Aucun element</td></tr>}
            {filtered.map((item,i) => {
              const realIdx = items.indexOf(item);
              return (
                <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,.03)", background:i%2===0?"transparent":"rgba(255,255,255,.015)", opacity:item.actif?1:.5 }}>
                  {cols.map(([,field]) => (
                    <td key={field} style={{ padding:"10px 14px", fontSize:12, fontFamily:"monospace",
                      color: field==="fatf"?(item[field]==="BLANC"?"#10b981":item[field]==="GRIS"?"#f59e0b":"#ef4444"):field==="iban"?(item[field]?"#10b981":"#475569"):"#C8D8EA" }}>
                      {fmt(item, field)}
                    </td>
                  ))}
                  <td style={{ padding:"10px 14px", textAlign:"center" }}><Toggle checked={item.actif} onChange={()=>toggleActif(realIdx)} /></td>
                  <td style={{ padding:"10px 14px", textAlign:"center" }}>
                    <button style={{ padding:"4px 10px", borderRadius:7, fontSize:11, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>✏</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 2. RÉFÉRENTIELS — PAGE D'ACCUEIL TUILES
// ─────────────────────────────────────────────────────────
function Referentiels({ refs, setRefs }) {
  const [activeRef, setActiveRef] = useState(null);
  const [modeAPI, setModeAPI] = useState({});
  const [apiUrls, setApiUrls] = useState({});

  if (activeRef) {
    const tile = REF_TILES.find(t=>t.id===activeRef);
    return <RefDetail tile={tile} refs={refs} setRefs={setRefs} onBack={()=>setActiveRef(null)} />;
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Referentiels</h2>
        <span style={{ fontSize:11, color:"#3E5470" }}>{REF_TILES.length} referentiels — cliquer pour acceder</span>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {[
          ["Clients",       refs.clients?.filter(i=>i.actif).length,       "#10B981"],
          ["Comptes",       refs.comptes?.filter(i=>i.actif).length,        "#0EA5E9"],
          ["Correspondants",refs.correspondants?.filter(i=>i.actif).length, "#F59E0B"],
          ["Devises",       refs.devises?.filter(i=>i.actif).length,        "#8B5CF6"],
        ].map(([l,v,c]) => (
          <div key={l} style={{ padding:"12px 14px", background:"rgba(8,15,28,.7)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, borderLeft:"3px solid "+c }}>
            <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>{l} actifs</div>
            <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:"'Space Grotesk',sans-serif" }}>{v||0}</div>
          </div>
        ))}
      </div>

      {/* Tuiles */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
        {REF_TILES.map((tile,i) => {
          const items = refs[tile.key]||[];
          const actifs = items.filter(i=>i.actif).length;
          const colors = ["#0EA5E9","#10B981","#06B6D4","#8B5CF6","#F59E0B","#EC4899","#14B8A6","#F97316","#6366F1","#22C55E"];
          const c = colors[i % colors.length];
          return (
            <div key={tile.id} onClick={()=>setActiveRef(tile.id)}
              style={{ padding:"18px", background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, cursor:"pointer", transition:"all .2s", position:"relative", overflow:"hidden" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=c+"55";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="rgba(255,255,255,.06)";}}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,"+c+","+c+"44)" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ width:36, height:36, borderRadius:9, background:c+"18", border:"1px solid "+c+"35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{tile.icon}</div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:c, lineHeight:1 }}>{actifs}</div>
                  <div style={{ fontSize:9, color:"#3E5470" }}>/ {items.length}</div>
                </div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:"#E2EAF2", marginBottom:4 }}>{tile.label}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
                <div style={{ height:2, flex:1, borderRadius:1, background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:items.length>0?(actifs/items.length*100)+"%":"0%", background:c, borderRadius:1 }} />
                </div>
                <span style={{ fontSize:10, color:c, fontWeight:700 }}>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Config API */}
      <div style={{ marginTop:24 }}>
        <Card>
          <SectionTitle>Configuration des sources de donnees</SectionTitle>
          <p style={{ fontSize:11, color:"#3E5470", marginBottom:14 }}>Pour chaque referentiel, choisissez entre donnees locales ou connexion API externe (Core Banking, SWIFT, Bank Al-Maghrib...)</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { key:"clients",    label:"Clients et Comptes",   icon:"🏢" },
              { key:"cours",      label:"Cours de change",      icon:"📈" },
              { key:"bic",        label:"BIC/SWIFT (banques)",  icon:"🔗" },
            ].map(item => (
              <div key={item.key} style={{ display:"grid", gridTemplateColumns:"auto 1fr auto 1fr auto", gap:10, alignItems:"center", padding:"10px 14px", background:"rgba(15,23,42,.5)", borderRadius:9, border:"1px solid rgba(30,41,59,.5)" }}>
                <span style={{ fontSize:16 }}>{item.icon}</span>
                <span style={{ fontSize:12, color:"#C8D8EA" }}>{item.label}</span>
                <div style={{ display:"flex", gap:4 }}>
                  {["Local","API"].map(m => (
                    <button key={m} onClick={()=>setModeAPI(p=>({...p,[item.key]:m}))} style={{ padding:"4px 10px", borderRadius:6, fontSize:10, fontWeight:700, cursor:"pointer", background:(modeAPI[item.key]||"Local")===m?"rgba(6,182,212,.15)":"transparent", border:"1px solid "+((modeAPI[item.key]||"Local")===m?"rgba(6,182,212,.4)":"#1D3250"), color:(modeAPI[item.key]||"Local")===m?"#06b6d4":"#475569" }}>{m}</button>
                  ))}
                </div>
                {(modeAPI[item.key]||"Local")==="API"
                  ? <input value={apiUrls[item.key]||""} onChange={e=>setApiUrls(p=>({...p,[item.key]:e.target.value}))} placeholder="https://api.exemple.com/..." style={inp({ fontSize:11 })} />
                  : <span style={{ fontSize:11, color:"#2A4060" }}>Donnees gerees localement</span>
                }
                {(modeAPI[item.key]||"Local")==="API"
                  ? <button style={{ padding:"5px 10px", borderRadius:7, fontSize:10, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>Tester</button>
                  : <div />
                }
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 3. MOTEUR WORKFLOW
// ─────────────────────────────────────────────────────────
function MoteurWorkflow({ steps, setSteps }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les étapes depuis l'API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/workflow/steps`, {
          headers: { 'Authorization': 'Bearer ' + getToken() },
        });
        if (res.ok) {
          const data = await res.json();
          setSteps(data);
        }
      } catch(e) {
        console.error('Erreur chargement workflow:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Sauvegarder une étape
  const saveStep = async (step) => {
    try {
      const res = await fetch(`${API_URL}/workflow/steps/${step.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken(),
        },
        body: JSON.stringify({
          isActive:       step.isActive,
          routingPositif: step.routingPositif,
          routingNegatif: step.routingNegatif,
          routingAlerte:  step.routingAlerte,
          condAlways:     step.condAlways,
          condAmountMin:  step.condAmountMin,
          condAmountMax:  step.condAmountMax,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch(e) {
      alert('Erreur de connexion');
    }
  };
  const TYPES = { AUTO:"🤖 Auto", MANUEL:"👤 Manuel", SEMI_AUTO:"⚡ Semi-auto" };
  const ROUTING_OPTS = ["NEXT","PREVIOUS","BLOCK","ESCALADE","MANUAL"];

const toggleStep = async (idx) => {
  const u=[...steps];
  u[idx]={...u[idx], isActive:!u[idx].isActive, actif:!u[idx].isActive};
  setSteps(u);
  await saveStep(u[idx]);
};
  const setRouting = (idx,res,val) => {
    const u=[...steps]; u[idx]={...u[idx],routing:{...u[idx].routing,[res]:val}}; setSteps(u);
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Moteur Workflow</h2>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ padding:"7px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4" }}>+ Ajouter etape</button>
          <SaveBtn onClick={async () => {
  for (const step of steps) {
    await saveStep(step);
  }
}} saved={saved} />
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:0, padding:"10px 14px", background:"rgba(8,15,28,.7)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, marginBottom:16 }}>
        <span style={{ fontSize:10, color:"#3E5470", marginRight:8 }}>FLUX :</span>
        <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.25)", color:"#10b981", fontWeight:700 }}>SAISIE</span>
        {steps.filter(s=>s.actif).map((s,i) => (
          <span key={s.id} style={{ display:"flex", alignItems:"center" }}>
            <span style={{ width:16, height:1, background:"rgba(30,58,138,.4)", display:"inline-block" }} />
            <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4", fontWeight:700 }}>{s.nom}</span>
          </span>
        ))}
        <span style={{ display:"flex", alignItems:"center" }}>
          <span style={{ width:16, height:1, background:"rgba(30,58,138,.4)", display:"inline-block" }} />
          <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4", fontWeight:700 }}>INJECTION BO</span>
        </span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {steps.map((step, idx) => (
          <Card key={step.id} style={{ opacity:step.actif?1:.55, borderLeft:"3px solid "+(step.actif?"#06b6d4":"#1D3250") }}>
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:14, alignItems:"start" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(6,182,212,.15)", border:"1.5px solid rgba(6,182,212,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#06b6d4", flexShrink:0 }}>{step.ordre}</div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>{step.nom}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>{TYPES[step.type]}</span>
                  {step.role && <span style={{ fontSize:10, color:"#3E5470" }}>👤 {step.role}</span>}
                  {step.conditions?.montantMin && <span style={{ fontSize:10, color:"#f59e0b" }}>Min : {step.conditions.montantMin.toLocaleString("fr-FR")}</span>}
                </div>
                {/* Routage */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {["POSITIF","NEGATIF","ALERTE"].map(res => (
                    <div key={res} style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:res==="POSITIF"?"#10b981":res==="NEGATIF"?"#ef4444":"#f59e0b" }}>{res}</span>
                      <span style={{ fontSize:10, color:"#3E5470" }}>→</span>
                      <select value={step.routing?.[res]||"NEXT"} onChange={e=>setRouting(idx,res,e.target.value)}
                        style={{ background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:6, padding:"3px 8px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                        {ROUTING_OPTS.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <Toggle checked={step.isActive} onChange={()=>toggleStep(idx)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 4. PARAMÉTRAGE GÉNÉRAL
// ─────────────────────────────────────────────────────────
function ParamGeneral({ params, setParams }) {
  const [tab, setTab] = useState("references");
  const [saved, setSaved] = useState(false);
  const [newFerie, setNewFerie] = useState({ pays:"", date:"", label:"" });

  const refs = params.references;
  const cals = params.calendriers;

  const setRef = (idx,field,val) => {
    const u=[...refs];
    u[idx]={...u[idx],[field]:val};
    // Régénérer exemple
    const r=u[idx];
    const agPart = r.parAgence ? "AG01"+r.separateur : "";
    u[idx].exemple = r.prefixe+r.separateur+agPart+(r.annee==="YYYY"?"2026":"26")+r.separateur+"0".repeat(Math.max(1,r.longueur-1))+"1";
    setParams(p=>({...p,references:u}));
  };

  const addFerie = () => {
    if (!newFerie.pays || !newFerie.date || !newFerie.label) return;
    const u=cals.map(c => c.pays===newFerie.pays ? {...c,joursFeries:[...c.joursFeries,{date:newFerie.date,label:newFerie.label}].sort((a,b)=>a.date.localeCompare(b.date))} : c);
    setParams(p=>({...p,calendriers:u}));
    setNewFerie({pays:"",date:"",label:""});
  };

  const removeFerie = (paysCode, dateVal) => {
    const u=cals.map(c => c.pays===paysCode ? {...c,joursFeries:c.joursFeries.filter(f=>f.date!==dateVal)} : c);
    setParams(p=>({...p,calendriers:u}));
  };

  const tabStyle = t => ({
    padding:"7px 16px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
    background:tab===t?"rgba(6,182,212,.15)":"transparent", color:tab===t?"#06b6d4":"#3E5470",
    borderBottom:tab===t?"2px solid #06b6d4":"2px solid transparent",
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Parametrage general</h2>
        <SaveBtn onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} saved={saved} />
      </div>

      <div style={{ display:"flex", gap:4, marginBottom:16, borderBottom:"1px solid rgba(255,255,255,.06)", paddingBottom:0 }}>
        <button style={tabStyle("references")} onClick={()=>setTab("references")}>Structure des references</button>
        <button style={tabStyle("calendriers")} onClick={()=>setTab("calendriers")}>Calendriers</button>
      </div>

      {/* Structure des références */}
      {tab==="references" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <p style={{ fontSize:11, color:"#3E5470", marginBottom:4 }}>Configurez le format des references pour chaque type d'operation. L'exemple se met a jour en temps reel.</p>
          {refs.map((ref,idx) => (
            <Card key={ref.code}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>{ref.operation}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4", fontFamily:"monospace" }}>{ref.code}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:"#10b981", fontFamily:"monospace", padding:"4px 12px", background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", borderRadius:8 }}>
                  Ex : {ref.exemple}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
                <Field label="Prefixe">
                  <input value={ref.prefixe} onChange={e=>setRef(idx,"prefixe",e.target.value.toUpperCase())} style={inp({ fontFamily:"monospace", textTransform:"uppercase" })} />
                </Field>
                <Field label="Format annee">
                  <select value={ref.annee} onChange={e=>setRef(idx,"annee",e.target.value)} style={inp()}>
                    <option value="YYYY">YYYY (2026)</option>
                    <option value="YY">YY (26)</option>
                    <option value="">Sans annee</option>
                  </select>
                </Field>
                <Field label="Separateur">
                  <select value={ref.separateur} onChange={e=>setRef(idx,"separateur",e.target.value)} style={inp()}>
                    <option value="-">Tiret ( - )</option>
                    <option value="/">Slash ( / )</option>
                    <option value="">Aucun</option>
                  </select>
                </Field>
                <Field label="Long. increment">
                  <input type="number" min={4} max={10} value={ref.longueur} onChange={e=>setRef(idx,"longueur",+e.target.value)} style={inp()} />
                </Field>
                <Field label="Remise a zero">
                  <select value={ref.remiseZero} onChange={e=>setRef(idx,"remiseZero",e.target.value)} style={inp()}>
                    <option value="ANNUELLE">Annuelle</option>
                    <option value="CONTINUE">Continue</option>
                  </select>
                </Field>
                <Field label="Par agence">
                  <div style={{ paddingTop:4 }}><Toggle checked={ref.parAgence} onChange={v=>setRef(idx,"parAgence",v)} /></div>
                </Field>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Calendriers */}
      {tab==="calendriers" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ fontSize:11, color:"#3E5470" }}>Gerez les jours feries et jours ouvrables par pays. Impact direct sur les dates de valeur dans l'ecran de saisie.</p>
            <button style={{ padding:"7px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4" }}>+ Ajouter un pays</button>
          </div>

          {/* Ajout jour férié */}
          <Card>
            <SectionTitle>Ajouter un jour ferie</SectionTitle>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr auto", gap:10, alignItems:"end" }}>
              <Field label="Pays">
                <select value={newFerie.pays} onChange={e=>setNewFerie(p=>({...p,pays:e.target.value}))} style={inp()}>
                  <option value="">Selectionner...</option>
                  {cals.map(c=><option key={c.pays} value={c.pays}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Date">
                <input type="date" value={newFerie.date} onChange={e=>setNewFerie(p=>({...p,date:e.target.value}))} style={{ ...inp(), colorScheme:"dark" }} />
              </Field>
              <Field label="Libelle">
                <input value={newFerie.label} onChange={e=>setNewFerie(p=>({...p,label:e.target.value}))} placeholder="Ex: Fete du Trone" style={inp()} />
              </Field>
              <button onClick={addFerie} style={{ padding:"8px 16px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>Ajouter</button>
            </div>
          </Card>

          {/* Calendriers par pays */}
          {cals.map(cal => (
            <Card key={cal.pays}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>{cal.label}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>{cal.pays}</span>
                  <span style={{ fontSize:10, color:"#3E5470" }}>Jours ouv : {cal.joursOuv}</span>
                  <span style={{ fontSize:10, color:"#3E5470" }}>Report : {cal.reportFerie}</span>
                </div>
                <span style={{ fontSize:11, color:"#10b981" }}>{cal.joursFeries.length} jours feries</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:6 }}>
                {cal.joursFeries.sort((a,b)=>a.date.localeCompare(b.date)).map(f => (
                  <div key={f.date} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px", background:"rgba(15,23,42,.5)", borderRadius:7, border:"1px solid rgba(30,41,59,.5)" }}>
                    <div>
                      <div style={{ fontSize:11, color:"#C8D8EA" }}>{f.label}</div>
                      <div style={{ fontSize:10, color:"#3E5470", fontFamily:"monospace" }}>{f.date}</div>
                    </div>
                    <button onClick={()=>removeFerie(cal.pays,f.date)} style={{ background:"none", border:"none", color:"#3E5470", cursor:"pointer", fontSize:14, padding:"2px 4px" }} onMouseEnter={e=>e.target.style.color="#ef4444"} onMouseLeave={e=>e.target.style.color="#3E5470"}>x</button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APP PRINCIPALE — CONSOLE ADMIN
// ─────────────────────────────────────────────────────────
export default function AdminConsole({ onExit }) {
  const [activeMenu, setActiveMenu] = useState("identite");
  const [bank, setBank] = useState(INIT_BANK);
  const [refs, setRefs] = useState(INIT_REFS);
  const [steps, setSteps] = useState(INIT_WORKFLOW);
  const [params, setParams] = useState(INIT_PARAMS);

  const activeM = MENUS.find(m=>m.id===activeMenu);

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'JetBrains Mono','Courier New',monospace", background:"#050C1A", color:"#C8D8EA", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        *{box-sizing:border-box;}
        select option{background:#0C1628;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050C1A}::-webkit-scrollbar-thumb{background:#1D3250;border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width:220, flexShrink:0, background:"rgba(6,10,20,.98)", borderRight:"1px solid rgba(255,255,255,.06)", display:"flex", flexDirection:"column" }}>
        {/* Logo admin */}
        <div style={{ padding:"18px 16px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#0891b2,#0e7490)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>SwiftFlow</div>
              <div style={{ fontSize:9, color:"#2A4060", letterSpacing:"0.15em", textTransform:"uppercase" }}>Console Admin</div>
            </div>
          </div>
          <div style={{ marginTop:8, padding:"4px 8px", borderRadius:6, background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", fontSize:9, color:"#f59e0b", textAlign:"center", letterSpacing:"0.1em" }}>
            ACCES ADMINISTRATEUR
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:3 }}>
          {MENUS.map(m => (
            <button key={m.id} onClick={()=>setActiveMenu(m.id)} style={{
              display:"flex", alignItems:"center", gap:8, padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer", width:"100%", textAlign:"left",
              background: activeMenu===m.id ? m.color+"18" : "transparent",
              borderLeft: activeMenu===m.id ? "3px solid "+m.color : "3px solid transparent",
              transition:"all .15s",
            }}
            onMouseEnter={e=>activeMenu!==m.id&&(e.currentTarget.style.background="rgba(255,255,255,.03)")}
            onMouseLeave={e=>activeMenu!==m.id&&(e.currentTarget.style.background="transparent")}
            >
              <span style={{ fontSize:15 }}>{m.icon}</span>
              <span style={{ fontSize:11, fontWeight:700, color:activeMenu===m.id?m.color:"#7A8BA0" }}>{m.label}</span>
            </button>
          ))}
        </nav>

        {/* Bouton retour app */}
        <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <button onClick={onExit} style={{ width:"100%", padding:"8px 10px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444", display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
            ← Quitter la console
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {/* Header */}
        <div style={{ background:"rgba(5,12,26,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 28px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>{activeM?.icon}</span>
            <span style={{ fontSize:13, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>{activeM?.label}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }} />
            <span style={{ fontSize:10, color:"#10b981", letterSpacing:"0.12em" }}>Admin connecte</span>
          </div>
        </div>

        <div style={{ padding:"24px 28px 60px", animation:"fadeUp .35s ease forwards" }}>
          {activeMenu==="identite"    && <IdentiteBank bank={bank} setBank={setBank} />}
          {activeMenu==="referentiels"&& <Referentiels refs={refs} setRefs={setRefs} />}
          {activeMenu==="workflow"    && <MoteurWorkflow steps={steps} setSteps={setSteps} />}
          {activeMenu==="parametrage" && <ParamGeneral params={params} setParams={setParams} />}
          {activeMenu==="champs"      && <VisibiliteModule />}
        </div>
      </div>
    </div>
  );
}
