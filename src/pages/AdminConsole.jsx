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
  { id:"adaptateurs", label:"Systemes Tiers", icon:"🔌", color:"#10B981" },
  { id:"utilisateurs", label:"Utilisateurs & Habilitations", icon:"👥", color:"#8B5CF6" },
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

function Card({ children, style={}, ...props }) {
  return <div style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:20, ...style }} {...props}>{children}</div>;
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
function StepModal({ step, onSave, onClose }) {
  const [local, setLocal] = useState({ ...step });
  const [onglet, setOnglet] = useState("config");
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  const ROUTING_OPTS = ["NEXT","PREVIOUS","BLOCK","APPROVED","ESCALADE","MANUAL"];
  const ROLES = ["CONFORMITE","VALIDEUR_N1","VALIDEUR_N2","REGLEMENTAIRE","DIRECTION"];
  const SYSTEMES = ["PROVISION","AML","FIRCOSOFT","SWIFT","MUREX","FLEXCUBE"];
  const TIMEOUT_ACTIONS = ["ALERTE","ESCALADE","BLOCK","NEXT"];

  const inp = (label, field, type="text", opts=null) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:10, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>{label}</div>
      {opts ? (
        <select value={local[field]||""} onChange={e => set(field, e.target.value)}
          style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
          <option value="">-- Selectionner --</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={local[field]||""} onChange={e => set(field, type==="number" ? parseFloat(e.target.value)||0 : e.target.value)}
          style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
      )}
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(4,8,18,.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:600, background:"#0C1628", border:"1px solid rgba(6,182,212,.2)", borderRadius:16, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,.7)" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(6,182,212,.03)" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>
            Configuration — Etape {local.ordre} : {local.nom}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>x</button>
        </div>

        {/* Onglets */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          {[["config","Configuration"],["conditions","Conditions"],["routage","Routage"]].map(([k,l]) => (
            <button key={k} onClick={() => setOnglet(k)} style={{
              padding:"10px 20px", fontSize:12, fontWeight:700, cursor:"pointer", border:"none",
              background: onglet===k ? "rgba(6,182,212,.08)" : "transparent",
              color: onglet===k ? "#06b6d4" : "#3E5470",
              borderBottom: onglet===k ? "2px solid #06b6d4" : "2px solid transparent",
            }}>{l}</button>
          ))}
        </div>

        <div style={{ padding:20, maxHeight:400, overflowY:"auto" }}>

          {/* ONGLET CONFIGURATION */}
          {onglet === "config" && (
            <div>
              {inp("Nom de l etape", "nom")}
              {inp("Type", "type", "text", ["AUTO","MANUEL","SEMI_AUTO"])}
              {(local.type === "MANUEL" || local.type === "SEMI_AUTO") && inp("Role requis", "role", "text", ROLES)}
              {(local.type === "AUTO" || local.type === "SEMI_AUTO") && inp("Systeme tiers", "systemeTiers", "text", SYSTEMES)}
              {local.type === "MANUEL" && inp("Timeout (heures)", "timeoutHeures", "number")}
              {(local.type === "AUTO" || local.type === "SEMI_AUTO") && (
                <>
                  {inp("Timeout (ms)", "timeoutMs", "number")}
                  {inp("Retry max", "retryMax", "number")}
                </>
              )}
              {inp("Action si timeout", "timeoutAction", "text", TIMEOUT_ACTIONS)}
              {inp("Action de repli", "fallbackAction", "text", TIMEOUT_ACTIONS)}
            </div>
          )}

          {/* ONGLET CONDITIONS */}
          {onglet === "conditions" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, padding:"10px 14px", background:"rgba(6,182,212,.05)", borderRadius:8, border:"1px solid rgba(6,182,212,.15)" }}>
                <div style={{ fontSize:12, color:"#C8D8EA", flex:1 }}>Toujours declencher cette etape</div>
                <div onClick={() => set("condAlways", !local.condAlways)}
                  style={{ width:36, height:20, borderRadius:10, cursor:"pointer", position:"relative",
                    background:local.condAlways?"#0891b2":"#1e293b", border:"1px solid "+(local.condAlways?"#06b6d4":"#334155"), transition:"all .25s" }}>
                  <div style={{ position:"absolute", top:3, left:local.condAlways?18:3, width:12, height:12, borderRadius:"50%",
                    background:local.condAlways?"#fff":"#475569", transition:"left .25s" }} />
                </div>
              </div>
              {!local.condAlways && (
                <>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <div style={{ fontSize:10, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Montant minimum</div>
                      <input type="number" value={local.condAmountMin||0} onChange={e => set("condAmountMin", parseFloat(e.target.value)||0)}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Montant maximum (0 = illimite)</div>
                      <input type="number" value={local.condAmountMax||0} onChange={e => set("condAmountMax", parseFloat(e.target.value)||0)}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                    </div>
                  </div>
                  <div style={{ marginTop:12 }}>
                    <div style={{ fontSize:10, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Devises concernees (vide = toutes)</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {["MAD","EUR","USD","GBP","CHF","CAD","AED"].map(d => (
                        <div key={d} onClick={() => {
                          const curr = local.condCurrencies || [];
                          set("condCurrencies", curr.includes(d) ? curr.filter(c=>c!==d) : [...curr, d]);
                        }} style={{
                          padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                          background: (local.condCurrencies||[]).includes(d) ? "rgba(6,182,212,.15)" : "rgba(30,41,59,.5)",
                          border: "1px solid " + ((local.condCurrencies||[]).includes(d) ? "rgba(6,182,212,.4)" : "#1D3250"),
                          color: (local.condCurrencies||[]).includes(d) ? "#06b6d4" : "#475569",
                        }}>{d}</div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ONGLET ROUTAGE */}
          {onglet === "routage" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                ["POSITIF",  "Resultat positif / Approbation", "#10b981", local.routingPositif],
                ["NEGATIF",  "Resultat negatif / Rejet",       "#ef4444", local.routingNegatif],
                ["ALERTE",   "Alerte / Anomalie detectee",     "#f59e0b", local.routingAlerte],
              ].map(([key, label, color, routing]) => (
                <div key={key} style={{ padding:"12px 14px", background:"rgba(8,15,28,.7)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color, marginBottom:8 }}>{key} — {label}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:11, color:"#475569" }}>Action :</span>
                    <select value={routing?.action||"NEXT"} onChange={e => set("routing"+key.charAt(0)+key.slice(1).toLowerCase(), { action: e.target.value })}
                      style={{ background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                      {["NEXT","PREVIOUS","BLOCK","APPROVED","ESCALADE","MANUAL"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
          <button onClick={onClose} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
          <button onClick={() => onSave(local)} style={{ padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────
// 3. MOTEUR WORKFLOW
// ─────────────────────────────────────────────────────────
function MoteurWorkflow({ steps, setSteps, circuits, activeCircuit, setActiveCircuit }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  
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
  const [editing, setEditing] = useState(null);

  const saveEditedStep = async (updatedStep) => {
    try {
      const res = await fetch(`${API_URL}/workflow/steps/${updatedStep.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken(),
        },
        body: JSON.stringify({
          nom:            updatedStep.nom,
          type:           updatedStep.type,
          role:           updatedStep.role,
          systemeTiers:   updatedStep.systemeTiers,
          timeoutHeures:  updatedStep.timeoutHeures,
          timeoutMs:      updatedStep.timeoutMs,
          retryMax:       updatedStep.retryMax,
          timeoutAction:  updatedStep.timeoutAction,
          fallbackAction: updatedStep.fallbackAction,
          isActive:       updatedStep.isActive,
          condAlways:     updatedStep.condAlways,
          condAmountMin:  updatedStep.condAmountMin,
          condAmountMax:  updatedStep.condAmountMax,
          condCurrencies: updatedStep.condCurrencies,
          routingPositif: updatedStep.routingPositif,
          routingNegatif: updatedStep.routingNegatif,
          routingAlerte:  updatedStep.routingAlerte,
        }),
      });
      if (res.ok) {
        const updated = steps.map(s => s.id === updatedStep.id ? updatedStep : s);
        setSteps(updated);
        setEditing(null);
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
    {editing && <StepModal step={editing} onSave={saveEditedStep} onClose={() => setEditing(null)} />}
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Moteur Workflow</h2>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ padding:"7px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.25)", color:"#06b6d4" }}>+ Ajouter etape</button>
          <SaveBtn onClick={async () => { for (const step of steps) { await saveStep(step); } }} saved={saved} />
        </div>
      </div>

      {/* Sélecteur de circuit */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, padding:"12px 16px", background:"rgba(6,182,212,.05)", border:"1px solid rgba(6,182,212,.15)", borderRadius:10 }}>
        <div style={{ fontSize:11, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", flexShrink:0 }}>Circuit :</div>
        <select value={activeCircuit||"global"} onChange={e => setActiveCircuit(e.target.value)}
          style={{ background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 12px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none", flex:1 }}>
          <option value="global">Circuit Global</option>
          {(circuits||[]).map(c => (
            <option key={c.id} value={c.id}>{c.moduleCode} — {c.typeCode} — {c.evenementCode}</option>
          ))}
        </select>
      </div>

      {/* Pipeline */}
      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:0, padding:"10px 14px", background:"rgba(8,15,28,.7)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, marginBottom:16 }}>
        <span style={{ fontSize:10, color:"#3E5470", marginRight:8 }}>FLUX :</span>
        <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.25)", color:"#10b981", fontWeight:700 }}>SAISIE</span>
        {steps.filter(s=>s.isActive||s.actif).map((s,i) => (
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

      {/* Étapes */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {steps.map((step, idx) => (
          <Card key={step.id}
            draggable
            onDragStart={e => e.dataTransfer.setData("idx", idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={async e => {
              e.preventDefault();
              const from = parseInt(e.dataTransfer.getData("idx"));
              const to = idx;
              if (from === to) return;
              const reordered = [...steps];
              const [moved] = reordered.splice(from, 1);
              reordered.splice(to, 0, moved);
              const updated = reordered.map((s, i) => ({ ...s, ordre: i + 1 }));
              setSteps(updated);
              for (const s of updated) {
                await fetch(`${API_URL}/workflow/steps/${s.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
                  body: JSON.stringify({ ordre: s.ordre }),
                });
              }
            }}
            style={{ opacity:(step.isActive||step.actif)?1:.55, borderLeft:"3px solid "+((step.isActive||step.actif)?"#06b6d4":"#1D3250"), cursor:"grab" }}>
            <div style={{ display:"grid", gridTemplateColumns:"auto auto 1fr auto", gap:14, alignItems:"start" }}>
              <div style={{ fontSize:16, color:"#3E5470", cursor:"grab", paddingTop:4 }}>⠿</div>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(6,182,212,.15)", border:"1.5px solid rgba(6,182,212,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#06b6d4", flexShrink:0 }}>{step.ordre}</div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>{step.nom}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>{TYPES[step.type]}</span>
                  {step.role && <span style={{ fontSize:10, color:"#3E5470" }}>👤 {step.role}</span>}
                </div>
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
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button onClick={() => setEditing(step)} style={{ padding:"4px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
                  Configurer
                </button>
                <Toggle checked={step.isActive||step.actif} onChange={()=>toggleStep(idx)} />
              </div>
            </div>
          </Card>
        ))}
      </div>
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

function SystemAdapters() {
  const [adapters, setAdapters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/system-adapters`, {
          headers: { 'Authorization': 'Bearer ' + getToken() },
        });
        if (res.ok) {
          const data = await res.json();
          setAdapters(data);
        }
      } catch(e) {
        console.error('Erreur chargement adaptateurs:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveAdapter = async (adapter) => {
    try {
      const res = await fetch(`${API_URL}/system-adapters/${adapter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken(),
        },
        body: JSON.stringify(adapter),
      });
      if (res.ok) {
        setAdapters(prev => prev.map(a => a.id === adapter.id ? adapter : a));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setSelected(null);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch(e) {
      alert('Erreur de connexion');
    }
  };

  const MODES = ["REST","QUEUE","FILE","DB"];
  const AUTH_TYPES = ["NONE","BEARER","API_KEY","BASIC","MTLS"];
  const RESULTATS = ["POSITIF","NEGATIF","ALERTE"];
  const ICONS = { PROVISION:"🏦", AML:"🛡", FIRCOSOFT:"⚠", SWIFT:"🌐", MUREX:"📊", FLEXCUBE:"🏛", AMPLITUDE:"📈", FTI:"📁" };

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#3E5470" }}>Chargement...</div>;

  return (
    <div style={{ padding:24 }}>
      {saved && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999, padding:"12px 20px", borderRadius:10, fontSize:12, fontWeight:700, background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.4)", color:"#10b981" }}>
          Sauvegarde reussie
        </div>
      )}

      {/* Modale de configuration */}
      {selected && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(4,8,18,.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:640, background:"#0C1628", border:"1px solid rgba(6,182,212,.2)", borderRadius:16, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,.7)" }}>
            
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(6,182,212,.03)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>
                {ICONS[selected.code] || "🔌"} {selected.nom}
              </div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>x</button>
            </div>

            <div style={{ padding:20, maxHeight:500, overflowY:"auto" }}>
              
              {/* Mode bouchon */}
              <div style={{ padding:"12px 14px", background: selected.modeBouchon ? "rgba(245,158,11,.07)" : "rgba(16,185,129,.07)", border:"1px solid "+(selected.modeBouchon ? "rgba(245,158,11,.25)" : "rgba(16,185,129,.25)"), borderRadius:10, marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: selected.modeBouchon ? 12 : 0 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color: selected.modeBouchon ? "#f59e0b" : "#10b981" }}>
                      {selected.modeBouchon ? "Mode Bouchon actif" : "Mode Reel actif"}
                    </div>
                    <div style={{ fontSize:10, color:"#3E5470", marginTop:2 }}>
                      {selected.modeBouchon ? "Simule les appels — aucun vrai appel effectue" : "Appels reels vers le systeme tiers"}
                    </div>
                  </div>
                  <div onClick={() => setSelected(p => ({ ...p, modeBouchon: !p.modeBouchon }))}
                    style={{ width:36, height:20, borderRadius:10, cursor:"pointer", position:"relative", flexShrink:0,
                      background:selected.modeBouchon?"#f59e0b":"#0891b2", border:"1px solid "+(selected.modeBouchon?"#f59e0b":"#06b6d4"), transition:"all .25s" }}>
                    <div style={{ position:"absolute", top:3, left:selected.modeBouchon?18:3, width:12, height:12, borderRadius:"50%", background:"#fff", transition:"left .25s" }} />
                  </div>
                </div>

                {selected.modeBouchon && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Resultat simule</div>
                      <select value={selected.bouchonResultat||"POSITIF"} onChange={e => setSelected(p => ({ ...p, bouchonResultat: e.target.value }))}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                        {RESULTATS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Delai simule (ms)</div>
                      <input type="number" value={selected.bouchonDelaiMs||1000} onChange={e => setSelected(p => ({ ...p, bouchonDelaiMs: parseInt(e.target.value)||1000 }))}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                    </div>
                    <div style={{ gridColumn:"span 2" }}>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Message simule</div>
                      <input value={selected.bouchonMessage||""} onChange={e => setSelected(p => ({ ...p, bouchonMessage: e.target.value }))}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration connexion (mode réel) */}
              {!selected.modeBouchon && (
                <div>
                  <div style={{ fontSize:10, color:"#06b6d4", textTransform:"uppercase", letterSpacing:".12em", marginBottom:12 }}>Configuration connexion</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Mode appel</div>
                      <select value={selected.modeAppel||"REST"} onChange={e => setSelected(p => ({ ...p, modeAppel: e.target.value }))}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                        {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Authentification</div>
                      <select value={selected.authType||"NONE"} onChange={e => setSelected(p => ({ ...p, authType: e.target.value }))}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                        {AUTH_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>URL Endpoint</div>
                    <input value={selected.urlEndpoint||""} onChange={e => setSelected(p => ({ ...p, urlEndpoint: e.target.value }))} placeholder="https://..."
                      style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                  </div>
                  {selected.authType !== "NONE" && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Valeur authentification</div>
                      <input value={selected.authValue||""} onChange={e => setSelected(p => ({ ...p, authValue: e.target.value }))} placeholder="Token, cle API, user:password..."
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Timeout (ms)</div>
                      <input type="number" value={selected.timeoutMs||8000} onChange={e => setSelected(p => ({ ...p, timeoutMs: parseInt(e.target.value)||8000 }))}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                    </div>
                    <div>
                      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Retry max</div>
                      <input type="number" value={selected.retryMax||2} onChange={e => setSelected(p => ({ ...p, retryMax: parseInt(e.target.value)||2 }))}
                        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                    </div>
                  </div>

                  {/* Queue config */}
                  {selected.modeAppel === "QUEUE" && (
                    <div style={{ marginTop:12 }}>
                      <div style={{ fontSize:10, color:"#06b6d4", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Configuration Queue</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        <div>
                          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Type queue</div>
                          <select value={selected.queueType||""} onChange={e => setSelected(p => ({ ...p, queueType: e.target.value }))}
                            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
                            <option value="">-- Selectionner --</option>
                            {["RABBITMQ","KAFKA","ACTIVEMQ","IBM_MQ"].map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                        </div>
                        <div>
                          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>URL Broker</div>
                          <input value={selected.queueUrl||""} onChange={e => setSelected(p => ({ ...p, queueUrl: e.target.value }))} placeholder="amqp://..."
                            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                        </div>
                        <div>
                          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Topic envoi</div>
                          <input value={selected.queueTopicSend||""} onChange={e => setSelected(p => ({ ...p, queueTopicSend: e.target.value }))}
                            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                        </div>
                        <div>
                          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Topic reception</div>
                          <input value={selected.queueTopicReceive||""} onChange={e => setSelected(p => ({ ...p, queueTopicReceive: e.target.value }))}
                            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <button onClick={() => setSelected(null)} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
              <button onClick={() => saveAdapter(selected)} style={{ padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des adaptateurs */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2", marginBottom:4 }}>Systemes Tiers</div>
        <div style={{ fontSize:12, color:"#3E5470" }}>Configurez les adaptateurs vers les systemes externes</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
        {adapters.map(adapter => (
          <div key={adapter.id} onClick={() => setSelected({...adapter})}
            style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, padding:"16px 18px", cursor:"pointer",
              borderLeft:"3px solid "+(adapter.modeBouchon ? "#f59e0b" : "#10b981"),
              transition:"all .15s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(6,182,212,.05)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(8,15,28,.8)"}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:20 }}>{ICONS[adapter.code] || "🔌"}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>{adapter.nom}</div>
                  <div style={{ fontSize:10, color:"#3E5470", fontFamily:"monospace" }}>{adapter.code}</div>
                </div>
              </div>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700,
                background: adapter.modeBouchon ? "rgba(245,158,11,.1)" : "rgba(16,185,129,.1)",
                border: "1px solid " + (adapter.modeBouchon ? "rgba(245,158,11,.3)" : "rgba(16,185,129,.3)"),
                color: adapter.modeBouchon ? "#f59e0b" : "#10b981" }}>
                {adapter.modeBouchon ? "BOUCHON" : "REEL"}
              </span>
            </div>
            <div style={{ fontSize:11, color:"#475569" }}>{adapter.description}</div>
            <div style={{ marginTop:8, display:"flex", gap:8 }}>
              <span style={{ fontSize:10, color:"#3E5470" }}>{adapter.modeAppel}</span>
              {adapter.modeBouchon && (
                <span style={{ fontSize:10, fontWeight:700, color: adapter.bouchonResultat==="POSITIF"?"#10b981":adapter.bouchonResultat==="NEGATIF"?"#ef4444":"#f59e0b" }}>
                  → {adapter.bouchonResultat}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferentielUsers() {
  const [sousMenu, setSousMenu] = useState("utilisateurs");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [habilitations, setHabilitations] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [forceHab, setForceHab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState(null);
  const [modules, setModules] = useState([]);
const [habEvenements, setHabEvenements] = useState([]);
const [selectedRole, setSelectedRole] = useState("");
const [selectedModule, setSelectedModule] = useState("");

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { 'Authorization': 'Bearer ' + token };
      const [u, r, h, d, fh] = await Promise.all([
        fetch(`${API_URL}/referentiel-users/users`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/referentiel-users/roles`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/referentiel-users/habilitations`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/referentiel-users/delegations`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/referentiel-users/force-habilitations`, { headers }).then(r => r.json()),
      ]);
      setUsers(u); setRoles(r); setHabilitations(h);
      setDelegations(d); setForceHab(fh);
    const mod = await fetch(`${API_URL}/modules`, { headers }).then(r => r.json());
      setModules(mod);
    } catch(e) {
      console.error('Erreur chargement:', e);
    } finally {
      setLoading(false);
    }
  };
  const loadHabEvenements = async (roleCode, moduleCode) => {
  if (!roleCode || !moduleCode) return;
  const res = await fetch(`${API_URL}/modules/habilitations?roleCode=${roleCode}&moduleCode=${moduleCode}`, {
    headers: { 'Authorization': 'Bearer ' + getToken() },
  });
  if (res.ok) {
    const data = await res.json();
    setHabEvenements(data);
  }
};
  const SOUS_MENUS = [
    { id:"utilisateurs", label:"Utilisateurs",         icon:"👤" },
    { id:"roles",        label:"Roles & Hierarchie",   icon:"🏛" },
    { id:"habilitations",label:"Matrice Habilitations",icon:"🔐" },
    { id:"delegations",  label:"Delegations",          icon:"🤝" },
    { id:"forcage",      label:"Habilitations Forcage",icon:"⚡" },
    { id:"habilitations_evenements", label:"Habilitations Evenements", icon:"🎯" },
  ];

  const inp = (label, val, onChange, type="text") => (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>{label}</div>
      <input type={type} value={val||""} onChange={e => onChange(e.target.value)}
        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
    </div>
  );

  const sel = (label, val, onChange, opts) => (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>{label}</div>
      <select value={val||""} onChange={e => onChange(e.target.value)}
        style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
        <option value="">-- Selectionner --</option>
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const toggle = (label, val, onChange) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <div style={{ fontSize:12, color:"#C8D8EA" }}>{label}</div>
      <div onClick={() => onChange(!val)}
        style={{ width:36, height:20, borderRadius:10, cursor:"pointer", position:"relative",
          background:val?"#0891b2":"#1e293b", border:"1px solid "+(val?"#06b6d4":"#334155"), transition:"all .25s" }}>
        <div style={{ position:"absolute", top:3, left:val?18:3, width:12, height:12, borderRadius:"50%",
          background:val?"#fff":"#475569", transition:"left .25s" }} />
      </div>
    </div>
  );

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#3E5470" }}>Chargement...</div>;

  return (
    <div style={{ padding:24 }}>
      {msg && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999, padding:"12px 20px", borderRadius:10, fontSize:12, fontWeight:700,
          background: msg.type==="success" ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)",
          border: "1px solid " + (msg.type==="success" ? "rgba(16,185,129,.4)" : "rgba(239,68,68,.4)"),
          color: msg.type==="success" ? "#10b981" : "#ef4444" }}>
          {msg.text}
        </div>
      )}

      {/* Sous-menus */}
      <div style={{ display:"flex", gap:8, marginBottom:24, borderBottom:"1px solid rgba(255,255,255,.06)", paddingBottom:0 }}>
        {SOUS_MENUS.map(m => (
          <button key={m.id} onClick={() => setSousMenu(m.id)}
            style={{ padding:"8px 16px", borderRadius:"8px 8px 0 0", fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
              background: sousMenu===m.id ? "rgba(8,15,28,.9)" : "transparent",
              color: sousMenu===m.id ? "#8B5CF6" : "#3E5470",
              borderBottom: sousMenu===m.id ? "2px solid #8B5CF6" : "2px solid transparent" }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── UTILISATEURS ── */}
      {sousMenu === "utilisateurs" && (
        <div>
         <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
  <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>Utilisateurs ({users.length})</div>
  <button onClick={() => { setSelected({ login:"", nom:"", email:"", telephone:"", roleCode:"", agenceCode:"", password:"" }); setShowModal("user_new"); }}
    style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
      background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
    + Nouvel utilisateur
  </button>
</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {users.map(u => (
              <div key={u.id} style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:"12px 16px",
                display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:12, alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#E2EAF2" }}>{u.nom}</div>
                  <div style={{ fontSize:10, color:"#3E5470", fontFamily:"monospace" }}>{u.login} · {u.email}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:"#06b6d4", fontWeight:700 }}>{u.roleNom || u.role}</div>
                  <div style={{ fontSize:10, color:"#3E5470" }}>{u.agenceCode || "—"}</div>
                </div>
                <div>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700,
                    background: u.isActive ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)",
                    border: "1px solid " + (u.isActive ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.3)"),
                    color: u.isActive ? "#10b981" : "#ef4444" }}>
                    {u.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
                <button onClick={() => { setSelected({...u}); setShowModal("user"); }}
                  style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                    background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
                  Modifier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RÔLES ── */}
      {sousMenu === "roles" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>Roles & Hierarchie ({roles.length})</div>
            <button onClick={() => { setSelected({ code:"", nom:"", niveau:1, peutSaisir:false, peutValider:false, peutForcer:false, peutDeleguer:false, peutAdministrer:false, montantMaxValidation:0, montantMaxForcage:0 }); setShowModal("role_new"); }}
              style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
                background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
              + Nouveau role
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {roles.sort((a,b) => a.niveau - b.niveau).map(r => (
              <div key={r.code} style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:"12px 16px",
                display:"grid", gridTemplateColumns:"auto 1fr 1fr 1fr auto", gap:12, alignItems:"center",
                borderLeft:"3px solid " + (r.isActive ? "#8B5CF6" : "#334155") }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(139,92,246,.15)", border:"1.5px solid rgba(139,92,246,.35)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#8B5CF6" }}>
                  N{r.niveau}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#E2EAF2" }}>{r.nom}</div>
                  <div style={{ fontSize:10, color:"#3E5470", fontFamily:"monospace" }}>{r.code}</div>
                </div>
                <div style={{ fontSize:11, color:"#475569" }}>
                  {r.roleSuperieurNom ? `↑ ${r.roleSuperieurNom}` : "Niveau maximum"}
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {r.peutSaisir    && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(6,182,212,.1)", color:"#06b6d4", border:"1px solid rgba(6,182,212,.2)" }}>Saisie</span>}
                  {r.peutValider   && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(16,185,129,.1)", color:"#10b981", border:"1px solid rgba(16,185,129,.2)" }}>Validation</span>}
                  {r.peutForcer    && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(245,158,11,.1)", color:"#f59e0b", border:"1px solid rgba(245,158,11,.2)" }}>Forcage</span>}
                  {r.peutAdministrer && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(239,68,68,.1)", color:"#ef4444", border:"1px solid rgba(239,68,68,.2)" }}>Admin</span>}
                </div>
                <button onClick={() => { setSelected({...r}); setShowModal("role"); }}
                  style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                    background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
                  Configurer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MATRICE HABILITATIONS ── */}
      {sousMenu === "habilitations" && (
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2", marginBottom:16 }}>Matrice des Habilitations</div>
          {roles.filter(r => r.isActive).map(role => {
            const roleHab = habilitations.filter(h => h.roleCode === role.code);
            const modulesHab = [...new Set(roleHab.map(h => h.module))];
            return (
              <div key={role.code} style={{ marginBottom:16, background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, overflow:"hidden" }}>
                <div style={{ padding:"10px 16px", background:"rgba(139,92,246,.08)", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:"#8B5CF6" }}>N{role.niveau}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#E2EAF2" }}>{role.nom}</span>
                </div>
                <div style={{ padding:"10px 16px" }}>
                  {modules.map(mod => (
                    <div key={mod} style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>{mod}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {roleHab.filter(h => h.module === mod).map(h => (
                          <div key={h.id} onClick={async () => {
                            const res = await fetch(`${API_URL}/referentiel-users/habilitations/${h.id}`, {
                              method:'PATCH', headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                              body: JSON.stringify({ autorise: !h.autorise, montantMax: h.montantMax })
                            });
                            if (res.ok) {
                              setHabilitations(prev => prev.map(p => p.id === h.id ? {...p, autorise:!h.autorise} : p));
                            }
                          }} style={{
                            padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                            background: h.autorise ? "rgba(16,185,129,.1)" : "rgba(30,41,59,.5)",
                            border: "1px solid " + (h.autorise ? "rgba(16,185,129,.3)" : "#1D3250"),
                            color: h.autorise ? "#10b981" : "#475569",
                          }}>{h.action}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DÉLÉGATIONS ── */}
      {sousMenu === "delegations" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>Delegations ({delegations.length})</div>
            <button onClick={() => { setSelected({ delegateurId:"", delegataireId:"", dateDebut:"", dateFin:"", motif:"" }); setShowModal("delegation"); }}
              style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
                background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
              + Nouvelle delegation
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {delegations.map(d => (
              <div key={d.id} style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:"12px 16px",
                display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:12, alignItems:"center",
                borderLeft:"3px solid " + (d.statut==="ACTIVE"?"#10b981":"#334155") }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#E2EAF2" }}>{d.delegateurNom}</div>
                  <div style={{ fontSize:10, color:"#3E5470" }}>Delegateur</div>
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#06b6d4" }}>{d.delegataireNom}</div>
                  <div style={{ fontSize:10, color:"#3E5470" }}>Delegataire</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:"#C8D8EA" }}>
                    {new Date(d.dateDebut).toLocaleDateString("fr-FR")} → {new Date(d.dateFin).toLocaleDateString("fr-FR")}
                  </div>
                  <span style={{ fontSize:10, padding:"1px 6px", borderRadius:10, fontWeight:700,
                    background: d.statut==="ACTIVE" ? "rgba(16,185,129,.1)" : "rgba(100,116,139,.1)",
                    color: d.statut==="ACTIVE" ? "#10b981" : "#64748b" }}>
                    {d.statut}
                  </span>
                </div>
                {d.statut === "ACTIVE" && (
                  <button onClick={async () => {
                    const res = await fetch(`${API_URL}/referentiel-users/delegations/${d.id}/revoquer`, {
                      method:'PATCH', headers:{'Authorization':'Bearer '+getToken()}
                    });
                    if (res.ok) { showMsg("success","Delegation revoquee"); loadAll(); }
                  }} style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                    background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444" }}>
                    Revoquer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HABILITATIONS FORÇAGE ── */}
      {sousMenu === "forcage" && (
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2", marginBottom:16 }}>Habilitations Forcage</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {forceHab.map(fh => (
              <div key={fh.id} style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:"12px 16px",
                display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap:12, alignItems:"center",
                borderLeft:"3px solid rgba(245,158,11,.4)" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#f59e0b" }}>{fh.roleNom}</div>
                  <div style={{ fontSize:10, color:"#3E5470", fontFamily:"monospace" }}>{fh.roleCode}</div>
                </div>
                <div>
                  <div style={{ fontSize:12, color:"#E2EAF2" }}>{fh.systemNom}</div>
                  <div style={{ fontSize:10, color:"#3E5470", fontFamily:"monospace" }}>{fh.systemAdapterCode}</div>
                </div>
                <div style={{ fontSize:11, color:"#C8D8EA" }}>
                  Max: {fh.montantMax > 0 ? parseFloat(fh.montantMax).toLocaleString("fr-FR") : "Illimite"}
                </div>
                <div style={{ fontSize:11, color:"#C8D8EA" }}>
                  Quota: {fh.quotaJournalier}/jour
                  {fh.doubleValidation && <span style={{ marginLeft:6, fontSize:9, color:"#f59e0b" }}>2FA requis</span>}
                </div>
                <button onClick={() => { setSelected({...fh}); setShowModal("forcage"); }}
                  style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                    background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", color:"#f59e0b" }}>
                  Modifier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

 {sousMenu === "habilitations_evenements" && (
  <div>
    <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2", marginBottom:16 }}>
      Habilitations par Evenement
    </div>

    {/* Filtres */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
      <div>
        <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Role</div>
        <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); loadHabEvenements(e.target.value, selectedModule); }}
          style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
          <option value="">-- Selectionner un role --</option>
          {roles.map(r => <option key={r.code} value={r.code}>{r.nom}</option>)}
        </select>
      </div>
      <div>
        <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Module</div>
        <select value={selectedModule} onChange={e => { setSelectedModule(e.target.value); loadHabEvenements(selectedRole, e.target.value); }}
          style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"7px 10px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
          <option value="">-- Selectionner un module --</option>
          {modules.map(m => <option key={m.code} value={m.code}>{m.icone} {m.nom}</option>)}
        </select>
      </div>
    </div>

    {/* Matrice */}
    {habEvenements.length > 0 && (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {habEvenements.map(h => (
          <div key={h.id} style={{ background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:"12px 16px",
            display:"grid", gridTemplateColumns:"1fr 1fr auto auto auto auto", gap:12, alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#E2EAF2" }}>{h.typeNom}</div>
              <div style={{ fontSize:10, color:"#3E5470" }}>{h.evenementNom}</div>
            </div>
            <div style={{ fontSize:10, color:"#3E5470", fontFamily:"monospace" }}>{h.evenementCode}</div>
            {[
              { key:"peutInitier",  label:"Initier",  color:"#10b981" },
              { key:"peutValider",  label:"Valider",  color:"#06b6d4" },
              { key:"peutModifier", label:"Modifier", color:"#f59e0b" },
              { key:"peutAnnuler",  label:"Annuler",  color:"#ef4444" },
            ].map(({ key, label, color }) => (
              <div key={key} onClick={async () => {
                const res = await fetch(`${API_URL}/modules/habilitations/${h.id}`, {
                  method:'PATCH',
                  headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                  body: JSON.stringify({ [key]: !h[key] })
                });
                if (res.ok) {
                  setHabEvenements(prev => prev.map(p => p.id === h.id ? {...p, [key]: !h[key]} : p));
                }
              }} style={{
                padding:"4px 10px", borderRadius:20, fontSize:10, fontWeight:700, cursor:"pointer", textAlign:"center",
                background: h[key] ? `rgba(${color === '#10b981' ? '16,185,129' : color === '#06b6d4' ? '6,182,212' : color === '#f59e0b' ? '245,158,11' : '239,68,68'},.15)` : "rgba(30,41,59,.5)",
                border: `1px solid ${h[key] ? color + "40" : "#1D3250"}`,
                color: h[key] ? color : "#475569",
              }}>{label}</div>
            ))}
          </div>
        ))}
      </div>
    )}

    {selectedRole && selectedModule && habEvenements.length === 0 && (
      <div style={{ textAlign:"center", padding:40, color:"#3E5470" }}>
        <div style={{ fontSize:24, marginBottom:8 }}>🎯</div>
        <div style={{ fontSize:12 }}>Aucune habilitation configuree pour ce role et ce module</div>
        <button onClick={async () => {
          const typesRes = await fetch(`${API_URL}/modules/${selectedModule}/types`, {
            headers: { 'Authorization': 'Bearer ' + getToken() },
          });
          const types = await typesRes.json();
          for (const type of types) {
            const eventsRes = await fetch(`${API_URL}/modules/evenements?moduleCode=${selectedModule}&typeCode=${type.code}`, {
              headers: { 'Authorization': 'Bearer ' + getToken() },
            });
            const events = await eventsRes.json();
            for (const event of events) {
              await fetch(`${API_URL}/modules/habilitations`, {
                method:'POST',
                headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                body: JSON.stringify({
                  roleCode: selectedRole,
                  moduleCode: selectedModule,
                  typeCode: type.code,
                  evenementCode: event.code,
                  peutInitier: false,
                  peutValider: false,
                  peutModifier: false,
                  peutAnnuler: false,
                })
              });
            }
          }
          loadHabEvenements(selectedRole, selectedModule);
          showMsg("success", "Habilitations initialisees");
        }} style={{ marginTop:16, padding:"8px 18px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
          background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
          Initialiser les habilitations
        </button>
      </div>
    )}
  </div>
)}

      {/* ── MODALES ── */}

      {/* Modale Nouvel Utilisateur */}
{showModal === "user_new" && selected && (
  <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(4,8,18,.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
    <div style={{ width:"100%", maxWidth:500, background:"#0C1628", border:"1px solid rgba(6,182,212,.2)", borderRadius:16, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>Nouvel utilisateur</div>
        <button onClick={() => setShowModal(null)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>x</button>
      </div>
      <div style={{ padding:20 }}>
        {inp("Login", selected.login, v => setSelected(p => ({...p, login:v})))}
        {inp("Nom complet", selected.nom, v => setSelected(p => ({...p, nom:v})))}
        {inp("Email", selected.email, v => setSelected(p => ({...p, email:v})))}
        {inp("Telephone", selected.telephone, v => setSelected(p => ({...p, telephone:v})))}
        {inp("Mot de passe", selected.password, v => setSelected(p => ({...p, password:v})), "password")}
        {sel("Role", selected.roleCode, v => setSelected(p => ({...p, roleCode:v, role:v})),
          roles.map(r => ({ value:r.code, label:r.nom })))}
        {sel("Agence", selected.agenceCode, v => setSelected(p => ({...p, agenceCode:v})),
          ["AG-CAS-01","AG-CAS-02","AG-RBA-01","AG-RBA-02","AG-MRK-01"].map(a => ({ value:a, label:a })))}
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
        <button onClick={() => setShowModal(null)} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
        <button onClick={async () => {
          if (!selected.login || !selected.nom || !selected.email || !selected.roleCode) {
            showMsg("error", "Login, nom, email et role sont obligatoires");
            return;
          }
          const res = await fetch(`${API_URL}/referentiel-users/users`, {
            method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
            body: JSON.stringify(selected)
          });
          if (res.ok) { showMsg("success","Utilisateur cree avec succes"); loadAll(); setShowModal(null); }
          else {
            const err = await res.json();
            showMsg("error", err.message || "Erreur lors de la creation");
          }
        }} style={{ padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>Creer</button>
      </div>
    </div>
  </div>
)}

      {/* Modale Utilisateur */}
      {showModal === "user" && selected && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(4,8,18,.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:500, background:"#0C1628", border:"1px solid rgba(6,182,212,.2)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>Modifier utilisateur — {selected.login}</div>
              <button onClick={() => setShowModal(null)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>x</button>
            </div>
            <div style={{ padding:20 }}>
              {inp("Nom complet", selected.nom, v => setSelected(p => ({...p, nom:v})))}
              {inp("Email", selected.email, v => setSelected(p => ({...p, email:v})))}
              {inp("Telephone", selected.telephone, v => setSelected(p => ({...p, telephone:v})))}
              {sel("Role", selected.roleCode, v => setSelected(p => ({...p, roleCode:v, role:v})),
                roles.map(r => ({ value:r.code, label:r.nom })))}
              {sel("Agence", selected.agenceCode, v => setSelected(p => ({...p, agenceCode:v})),
                ["AG-CAS-01","AG-CAS-02","AG-RBA-01","AG-RBA-02","AG-MRK-01"].map(a => ({ value:a, label:a })))}
              {toggle("Compte actif", selected.isActive, v => setSelected(p => ({...p, isActive:v})))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <button onClick={() => setShowModal(null)} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
              <button onClick={async () => {
                const res = await fetch(`${API_URL}/referentiel-users/users/${selected.id}`, {
                  method:'PATCH', headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                  body: JSON.stringify(selected)
                });
                if (res.ok) { showMsg("success","Utilisateur mis a jour"); loadAll(); setShowModal(null); }
                else showMsg("error","Erreur lors de la sauvegarde");
              }} style={{ padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Rôle */}
      {(showModal === "role" || showModal === "role_new") && selected && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(4,8,18,.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:500, background:"#0C1628", border:"1px solid rgba(139,92,246,.2)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>
                {showModal === "role_new" ? "Nouveau role" : `Configurer role — ${selected.code}`}
              </div>
              <button onClick={() => setShowModal(null)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>x</button>
            </div>
            <div style={{ padding:20, maxHeight:450, overflowY:"auto" }}>
              {showModal === "role_new" && inp("Code role", selected.code, v => setSelected(p => ({...p, code:v.toUpperCase()})))}
              {inp("Nom du role", selected.nom, v => setSelected(p => ({...p, nom:v})))}
              {inp("Description", selected.description, v => setSelected(p => ({...p, description:v})))}
              {inp("Niveau hierarchique", selected.niveau, v => setSelected(p => ({...p, niveau:parseInt(v)||1})), "number")}
              {sel("Role superieur (escalade)", selected.roleSuperieurCode, v => setSelected(p => ({...p, roleSuperieurCode:v})),
                roles.filter(r => r.code !== selected.code).map(r => ({ value:r.code, label:`N${r.niveau} — ${r.nom}` })))}
              <div style={{ marginTop:12, marginBottom:8, fontSize:10, color:"#06b6d4", textTransform:"uppercase", letterSpacing:".1em" }}>Permissions</div>
              {toggle("Peut saisir des ordres", selected.peutSaisir, v => setSelected(p => ({...p, peutSaisir:v})))}
              {toggle("Peut valider des ordres", selected.peutValider, v => setSelected(p => ({...p, peutValider:v})))}
              {toggle("Peut forcer des blocages", selected.peutForcer, v => setSelected(p => ({...p, peutForcer:v})))}
              {toggle("Peut deleguer", selected.peutDeleguer, v => setSelected(p => ({...p, peutDeleguer:v})))}
              {toggle("Peut administrer", selected.peutAdministrer, v => setSelected(p => ({...p, peutAdministrer:v})))}
              {toggle("Role actif", selected.isActive !== false, v => setSelected(p => ({...p, isActive:v})))}
              <div style={{ marginTop:12, marginBottom:8, fontSize:10, color:"#06b6d4", textTransform:"uppercase", letterSpacing:".1em" }}>Limites de montant</div>
              {inp("Montant max validation (0 = illimite)", selected.montantMaxValidation, v => setSelected(p => ({...p, montantMaxValidation:parseFloat(v)||0})), "number")}
              {inp("Montant max forcage (0 = illimite)", selected.montantMaxForcage, v => setSelected(p => ({...p, montantMaxForcage:parseFloat(v)||0})), "number")}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <button onClick={() => setShowModal(null)} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
              <button onClick={async () => {
                let res;
                if (showModal === "role_new") {
                  res = await fetch(`${API_URL}/referentiel-users/roles`, {
                    method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                    body: JSON.stringify(selected)
                  });
                } else {
                  res = await fetch(`${API_URL}/referentiel-users/roles/${selected.code}`, {
                    method:'PATCH', headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                    body: JSON.stringify(selected)
                  });
                }
                if (res.ok) { showMsg("success","Role sauvegarde"); loadAll(); setShowModal(null); }
                else showMsg("error","Erreur lors de la sauvegarde");
              }} style={{ padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", color:"#fff" }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Délégation */}
      {showModal === "delegation" && selected && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(4,8,18,.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:480, background:"#0C1628", border:"1px solid rgba(16,185,129,.2)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>Nouvelle delegation</div>
              <button onClick={() => setShowModal(null)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>x</button>
            </div>
            <div style={{ padding:20 }}>
              {sel("Delegateur (qui delegue)", selected.delegateurId, v => setSelected(p => ({...p, delegateurId:v})),
                users.map(u => ({ value:u.id, label:`${u.nom} (${u.roleNom||u.role})` })))}
              {sel("Delegataire (qui recoit)", selected.delegataireId, v => setSelected(p => ({...p, delegataireId:v})),
                users.filter(u => u.id !== selected.delegateurId).map(u => ({ value:u.id, label:`${u.nom} (${u.roleNom||u.role})` })))}
              {inp("Date debut", selected.dateDebut, v => setSelected(p => ({...p, dateDebut:v})), "datetime-local")}
              {inp("Date fin", selected.dateFin, v => setSelected(p => ({...p, dateFin:v})), "datetime-local")}
              {inp("Motif", selected.motif, v => setSelected(p => ({...p, motif:v})))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <button onClick={() => setShowModal(null)} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
              <button onClick={async () => {
                const res = await fetch(`${API_URL}/referentiel-users/delegations`, {
                  method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                  body: JSON.stringify(selected)
                });
                if (res.ok) { showMsg("success","Delegation creee"); loadAll(); setShowModal(null); }
                else showMsg("error","Erreur lors de la creation");
              }} style={{ padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#059669,#047857)", border:"none", color:"#fff" }}>Creer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Forçage */}
      {showModal === "forcage" && selected && (
        <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(4,8,18,.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:420, background:"#0C1628", border:"1px solid rgba(245,158,11,.2)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2" }}>
                Forcage — {selected.roleNom} / {selected.systemNom}
              </div>
              <button onClick={() => setShowModal(null)} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>x</button>
            </div>
            <div style={{ padding:20 }}>
              {inp("Montant max forcable (0 = illimite)", selected.montantMax, v => setSelected(p => ({...p, montantMax:parseFloat(v)||0})), "number")}
              {inp("Quota journalier (nb max forcages/jour)", selected.quotaJournalier, v => setSelected(p => ({...p, quotaJournalier:parseInt(v)||5})), "number")}
              {toggle("Double validation requise (2FA)", selected.doubleValidation, v => setSelected(p => ({...p, doubleValidation:v})))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <button onClick={() => setShowModal(null)} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
              <button onClick={async () => {
                const res = await fetch(`${API_URL}/referentiel-users/force-habilitations/${selected.id}`, {
                  method:'PATCH', headers:{'Content-Type':'application/json','Authorization':'Bearer '+getToken()},
                  body: JSON.stringify({ montantMax:selected.montantMax, quotaJournalier:selected.quotaJournalier, doubleValidation:selected.doubleValidation })
                });
                if (res.ok) { showMsg("success","Habilitation mise a jour"); loadAll(); setShowModal(null); }
                else showMsg("error","Erreur lors de la sauvegarde");
              }} style={{ padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#d97706,#b45309)", border:"none", color:"#fff" }}>Enregistrer</button>
            </div>
          </div>
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
  const [steps, setSteps] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [activeCircuit, setActiveCircuit] = useState("global");
  useEffect(() => {
const loadSteps = async () => {
  try {
    const headers = { 'Authorization': 'Bearer ' + getToken() };
    
    // Charger les circuits
    const circRes = await fetch(`${API_URL}/modules/circuits`, { headers });
    if (circRes.ok) {
      const circData = await circRes.json();
      setCircuits(circData);
    }

    // Charger les étapes selon le circuit actif
    const url = activeCircuit === "global" 
      ? `${API_URL}/workflow/steps`
      : `${API_URL}/workflow/steps?circuitId=${activeCircuit}`;
    
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      setSteps(data);
    }
  } catch(e) {
    console.error('Erreur chargement workflow:', e);
  }
};
  loadSteps();
}, [activeMenu, activeCircuit]);
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
          {activeMenu==="workflow" && <MoteurWorkflow steps={steps} setSteps={setSteps} circuits={circuits} activeCircuit={activeCircuit} setActiveCircuit={setActiveCircuit} />}
          {activeMenu==="parametrage" && <ParamGeneral params={params} setParams={setParams} />}
          {activeMenu==="champs"      && <VisibiliteModule />}
          {activeMenu==="adaptateurs" && <SystemAdapters />}
          {activeMenu==="utilisateurs" && <ReferentielUsers />}
        </div>

      </div>
    </div>

  );
}
