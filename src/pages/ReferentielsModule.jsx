import { useState } from "react";

// ─────────────────────────────────────────────────────────
// DONNÉES INITIALES
// ─────────────────────────────────────────────────────────
const INIT = {
  agences: [
    { code:"AG-CAS-01", label:"Casablanca Centre",    ville:"Casablanca", actif:true  },
    { code:"AG-CAS-02", label:"Casablanca Ain Sebaâ", ville:"Casablanca", actif:true  },
    { code:"AG-RBA-01", label:"Rabat Hassan",          ville:"Rabat",      actif:true  },
    { code:"AG-RBA-02", label:"Rabat Agdal",           ville:"Rabat",      actif:true  },
    { code:"AG-FES-01", label:"Fès Médina",            ville:"Fès",        actif:false },
    { code:"AG-MRK-01", label:"Marrakech Guéliz",      ville:"Marrakech",  actif:true  },
  ],
  clients: [
    { ref:"CLI-001", nom:"MAROC TELECOM SA",   agence:"AG-CAS-01", type:"CORPORATE",  actif:true  },
    { ref:"CLI-002", nom:"OCP SA",             agence:"AG-CAS-01", type:"CORPORATE",  actif:true  },
    { ref:"CLI-003", nom:"CIMENTS DU MAROC",   agence:"AG-RBA-01", type:"CORPORATE",  actif:true  },
    { ref:"CLI-004", nom:"DELTA HOLDING SA",   agence:"AG-RBA-02", type:"CORPORATE",  actif:false },
    { ref:"CLI-005", nom:"SIEMENS MAROC SARL", agence:"AG-CAS-02", type:"SUBSIDIARY", actif:true  },
  ],
  comptes: [
    { num:"MA64011000010010001", client:"CLI-001", agence:"AG-CAS-01", devise:"MAD", plafond:5000000,  actif:true  },
    { num:"MA64011000010010002", client:"CLI-001", agence:"AG-CAS-01", devise:"EUR", plafond:500000,   actif:true  },
    { num:"MA64011000020020001", client:"CLI-002", agence:"AG-CAS-01", devise:"MAD", plafond:10000000, actif:true  },
    { num:"MA64011000030030001", client:"CLI-003", agence:"AG-RBA-01", devise:"MAD", plafond:2000000,  actif:false },
    { num:"MA64011000050050001", client:"CLI-005", agence:"AG-CAS-02", devise:"EUR", plafond:4000000,  actif:true  },
  ],
  devises: [
    { code:"EUR", label:"Euro",            zone:"Zone Euro",    actif:true  },
    { code:"USD", label:"Dollar US",       zone:"Amerique",     actif:true  },
    { code:"GBP", label:"Livre Sterling",  zone:"Royaume-Uni",  actif:true  },
    { code:"MAD", label:"Dirham Marocain", zone:"Maroc",        actif:true  },
    { code:"CAD", label:"Dollar Canadien", zone:"Amerique",     actif:true  },
    { code:"CHF", label:"Franc Suisse",    zone:"Europe",       actif:false },
    { code:"AED", label:"Dirham Emirien",  zone:"Moyen-Orient", actif:true  },
  ],
  pays: [
    { code:"MA", label:"Maroc",          region:"Maghreb",       fatf:"BLANC", iban:true,  actif:true  },
    { code:"FR", label:"France",         region:"Europe",        fatf:"BLANC", iban:true,  actif:true  },
    { code:"DE", label:"Allemagne",      region:"Europe",        fatf:"BLANC", iban:true,  actif:true  },
    { code:"GB", label:"Royaume-Uni",    region:"Europe",        fatf:"BLANC", iban:true,  actif:true  },
    { code:"US", label:"Etats-Unis",     region:"Amerique",      fatf:"BLANC", iban:false, actif:true  },
    { code:"AE", label:"Emirats Arabes", region:"Moyen-Orient",  fatf:"BLANC", iban:true,  actif:true  },
    { code:"DZ", label:"Algerie",        region:"Maghreb",       fatf:"GRIS",  iban:true,  actif:true  },
    { code:"IR", label:"Iran",           region:"Moyen-Orient",  fatf:"NOIR",  iban:false, actif:false },
    { code:"TN", label:"Tunisie",        region:"Maghreb",       fatf:"BLANC", iban:true,  actif:true  },
    { code:"SN", label:"Senegal",        region:"Afrique Ouest", fatf:"BLANC", iban:false, actif:true  },
  ],
  benebanks: [
    { bic:"BNPAFRPPXXX", nom:"BNP Paribas SA",       pays:"FR", ville:"Paris",      actif:true  },
    { bic:"DEUTDEFFXXX", nom:"Deutsche Bank AG",      pays:"DE", ville:"Frankfurt",  actif:true  },
    { bic:"ATTMMAMC",    nom:"Attijariwafa Bank",     pays:"MA", ville:"Casablanca", actif:true  },
    { bic:"BCDMMAMC",    nom:"BMCE Bank",             pays:"MA", ville:"Casablanca", actif:true  },
    { bic:"CITIUS33XXX", nom:"Citibank N.A.",         pays:"US", ville:"New York",   actif:false },
    { bic:"BARCGB22XXX", nom:"Barclays Bank PLC",     pays:"GB", ville:"London",     actif:true  },
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
    { code:"CFR", label:"Cost & Freight",           transport:"Mer",  actif:true  },
    { code:"EXW", label:"Ex Works",                 transport:"Tous", actif:true  },
    { code:"DDP", label:"Delivered Duty Paid",      transport:"Tous", actif:true  },
    { code:"DAP", label:"Delivered at Place",       transport:"Tous", actif:false },
    { code:"FCA", label:"Free Carrier",             transport:"Tous", actif:true  },
  ],
  codesMotifs: [
    { code:"101", label:"Importation de marchandises",          categorie:"COMMERCIAL", actif:true  },
    { code:"102", label:"Importation de services",              categorie:"COMMERCIAL", actif:true  },
    { code:"201", label:"Investissement direct etranger",       categorie:"FINANCIER",  actif:true  },
    { code:"202", label:"Dividendes et benefices",              categorie:"FINANCIER",  actif:true  },
    { code:"203", label:"Remboursement de pret",                categorie:"FINANCIER",  actif:true  },
    { code:"301", label:"Frais de scolarite",                   categorie:"FINANCIER",  actif:true  },
    { code:"302", label:"Frais medicaux a l'etranger",          categorie:"FINANCIER",  actif:false },
    { code:"401", label:"Honoraires et prestations",            categorie:"COMMERCIAL", actif:true  },
  ],
  coursChange: [
    { devise:"USD", taux:10.0138, date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
    { devise:"EUR", taux:10.9200, date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
    { devise:"GBP", taux:12.7540, date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
    { devise:"CAD", taux:7.4320,  date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
    { devise:"CHF", taux:11.3560, date:"2026-04-24", source:"Bank Al-Maghrib", actif:true },
    { devise:"AED", taux:2.7280,  date:"2026-04-25", source:"Bank Al-Maghrib", actif:true },
  ],
  categories: [
    { code:"FINANCIER",  label:"Financier",  actif:true  },
    { code:"COMMERCIAL", label:"Commercial", actif:true  },
  ],
  typesTransfert: [
    { code:"ORDINAIRE", label:"Transfert ordinaire",    categories:["FINANCIER","COMMERCIAL"], actif:true  },
    { code:"SCOLARITE", label:"Transfert de scolarite", categories:["FINANCIER"],              actif:true  },
    { code:"MEDICAL",   label:"Transfert medical",      categories:["FINANCIER"],              actif:false },
  ],
  backOffices: [
    { code:"AMPLITUDE", label:"Amplitude", url:"", actif:true  },
    { code:"FTI",       label:"FTI",       url:"", actif:true  },
    { code:"MUREX",     label:"MUREX",     url:"", actif:false },
    { code:"FLEXCUBE",  label:"FLEXCUBE",  url:"", actif:false },
  ],
};

// ─────────────────────────────────────────────────────────
// CONFIG TUILES (R10)
// ─────────────────────────────────────────────────────────
const TILES = [
  { id:"agences",       label:"Agences",              icon:"🏛",  color:"#0EA5E9", desc:"Reseau d'agences de la banque",              key:"agences"       },
  { id:"clients",       label:"Clients",              icon:"🏢",  color:"#10B981", desc:"Donneurs d'ordre — portefeuille clients",    key:"clients"       },
  { id:"comptes",       label:"Comptes",              icon:"💳",  color:"#06B6D4", desc:"Comptes bancaires rattaches aux clients",    key:"comptes"       },
  { id:"devises",       label:"Devises",              icon:"💱",  color:"#8B5CF6", desc:"Devises autorisees — ISO 4217",              key:"devises"       },
  { id:"pays",          label:"Pays",                 icon:"🌍",  color:"#F59E0B", desc:"Pays et classification GAFI — ISO 3166",    key:"pays"          },
  { id:"benebanks",     label:"Banques beneficiaires",icon:"🏦",  color:"#EC4899", desc:"Banques des beneficiaires — BIC/SWIFT",     key:"benebanks"     },
  { id:"correspondants",label:"Banques correspondantes",icon:"🔗",color:"#14B8A6", desc:"Reseau de correspondants de la banque",     key:"correspondants"},
  { id:"incoterms",     label:"Incoterms",            icon:"📦",  color:"#F97316", desc:"Conditions commerciales ICC 2020",          key:"incoterms"     },
  { id:"codesMotifs",   label:"Codes motifs",         icon:"📋",  color:"#6366F1", desc:"Codes motifs Office des Changes",           key:"codesMotifs"   },
  { id:"coursChange",   label:"Cours de change",      icon:"📈",  color:"#22C55E", desc:"Taux de change — Bank Al-Maghrib",          key:"coursChange"   },
  { id:"categories",    label:"Categories transfert", icon:"🔄",  color:"#A855F7", desc:"Categories de transfert (extensible)",      key:"categories"    },
  { id:"typesTransfert",label:"Types de transfert",   icon:"🏷",  color:"#84CC16", desc:"Types de transfert (extensible)",           key:"typesTransfert"},
  { id:"backOffices",   label:"Back Offices",         icon:"⚙",  color:"#64748B", desc:"Systemes back office connectes",            key:"backOffices"   },
];

// ─────────────────────────────────────────────────────────
// TOGGLE ACTIF
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

// ─────────────────────────────────────────────────────────
// ECRAN GENERIQUE D'UN REFERENTIEL
// ─────────────────────────────────────────────────────────
function RefScreen({ tile, data, setData, onBack }) {
  const [search, setSearch] = useState("");
  const [filterActif, setFilterActif] = useState("ALL");

  const items = data[tile.key] || [];
  const filtered = items.filter(item => {
    const txt = Object.values(item).join(" ").toLowerCase();
    const matchSearch = !search || txt.includes(search.toLowerCase());
    const matchActif = filterActif === "ALL" || (filterActif === "ACTIF" ? item.actif : !item.actif);
    return matchSearch && matchActif;
  });

  const toggleActif = (idx) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], actif: !updated[idx].actif };
    setData(p => ({ ...p, [tile.key]: updated }));
  };

  const actifCount   = items.filter(i => i.actif).length;
  const inactifCount = items.length - actifCount;

  // Colonnes selon le referentiel
  const getColumns = () => {
    switch (tile.id) {
      case "agences":       return [["Code","code"],["Libelle","label"],["Ville","ville"]];
      case "clients":       return [["Reference","ref"],["Raison sociale","nom"],["Agence","agence"],["Type","type"]];
      case "comptes":       return [["Numero de compte","num"],["Client","client"],["Agence","agence"],["Devise","devise"],["Plafond","plafond"]];
      case "devises":       return [["Code","code"],["Libelle","label"],["Zone","zone"]];
      case "pays":          return [["Code","code"],["Libelle","label"],["Region","region"],["GAFI","fatf"],["IBAN","iban"]];
      case "benebanks":     return [["BIC","bic"],["Nom","nom"],["Pays","pays"],["Ville","ville"]];
      case "correspondants":return [["BIC","bic"],["Nom","nom"],["Pays","pays"],["Devises","devises"],["Plafond","plafond"]];
      case "incoterms":     return [["Code","code"],["Libelle","label"],["Transport","transport"]];
      case "codesMotifs":   return [["Code","code"],["Libelle","label"],["Categorie","categorie"]];
      case "coursChange":   return [["Devise","devise"],["Taux","taux"],["Date","date"],["Source","source"]];
      case "categories":    return [["Code","code"],["Libelle","label"]];
      case "typesTransfert":return [["Code","code"],["Libelle","label"],["Categories","categories"]];
      case "backOffices":   return [["Code","code"],["Libelle","label"],["URL","url"]];
      default:              return [["Valeur","label"]];
    }
  };

  const formatCell = (item, field) => {
    const v = item[field];
    if (v === undefined || v === null || v === "") return "—";
    if (typeof v === "boolean") return v ? "Oui" : "Non";
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "number") return v.toLocaleString("fr-FR");
    return String(v);
  };

  const cols = getColumns();

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace", color:"#C8D8EA", minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050C1A}::-webkit-scrollbar-thumb{background:#1D3250;border-radius:2px}select option{background:#0C1628}`}</style>

      {/* HEADER */}
      <div style={{ background:"rgba(5,12,26,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 28px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={onBack} style={{ background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.25)", borderRadius:8, padding:"6px 12px", color:"#06b6d4", fontSize:12, cursor:"pointer", fontFamily:"monospace" }}>
            ← Referentiels
          </button>
          <div style={{ width:1, height:20, background:"rgba(255,255,255,.08)" }} />
          <div style={{ width:28, height:28, borderRadius:8, background:tile.color+"20", border:"1px solid "+tile.color+"40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{tile.icon}</div>
          <span style={{ fontSize:13, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>{tile.label}</span>
          <span style={{ fontSize:11, color:tile.color, padding:"2px 8px", borderRadius:20, background:tile.color+"15", border:"1px solid "+tile.color+"30" }}>{actifCount} actifs</span>
        </div>
        <button style={{ padding:"7px 16px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>
          + Ajouter
        </button>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"22px 28px" }}>

        {/* Indicateurs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
          {[
            ["Total",    items.length,   "#7A8BA0"],
            ["Actifs",   actifCount,     "#10b981"],
            ["Inactifs", inactifCount,   "#475569"],
          ].map(([l,v,c]) => (
            <div key={l} style={{ padding:"12px 16px", background:"rgba(8,15,28,.7)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, borderLeft:"3px solid "+c }}>
              <div style={{ fontSize:10, color:"#3E5470", textTransform:"uppercase", letterSpacing:".12em", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:"'Space Grotesk',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display:"flex", gap:10, marginBottom:16, alignItems:"center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ flex:1, background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"8px 14px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
          {["ALL","ACTIF","INACTIF"].map(f => (
            <button key={f} onClick={() => setFilterActif(f)} style={{
              padding:"7px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
              background: filterActif===f ? "rgba(6,182,212,.15)" : "rgba(15,23,42,.6)",
              color: filterActif===f ? "#06b6d4" : "#3E5470",
              borderBottom: filterActif===f ? "2px solid #06b6d4" : "2px solid transparent",
            }}>{f==="ALL"?"Tous":f==="ACTIF"?"Actifs":"Inactifs"}</button>
          ))}
          <span style={{ fontSize:11, color:"#2A4060", marginLeft:4 }}>{filtered.length} ligne(s)</span>
        </div>

        {/* Tableau */}
        <div style={{ background:"rgba(8,15,28,.7)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(6,182,212,.05)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                {cols.map(([lbl]) => (
                  <th key={lbl} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700 }}>{lbl}</th>
                ))}
                <th style={{ padding:"10px 14px", textAlign:"center", fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700, width:80 }}>Statut</th>
                <th style={{ padding:"10px 14px", textAlign:"center", fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700, width:60 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={cols.length+2} style={{ padding:"32px", textAlign:"center", color:"#2A4060", fontSize:12 }}>Aucun element</td></tr>
              )}
              {filtered.map((item, i) => {
                const realIdx = items.indexOf(item);
                return (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,.03)", background:i%2===0?"transparent":"rgba(255,255,255,.015)", opacity:item.actif?1:.55 }}>
                    {cols.map(([, field]) => (
                      <td key={field} style={{ padding:"10px 14px", fontSize:12, color: field==="fatf" ? (item[field]==="BLANC"?"#10b981":item[field]==="GRIS"?"#f59e0b":"#ef4444") : field==="iban" ? (item[field]?"#10b981":"#475569") : "#C8D8EA", fontFamily:"monospace" }}>
                        {formatCell(item, field)}
                      </td>
                    ))}
                    <td style={{ padding:"10px 14px", textAlign:"center" }}>
                      <Toggle checked={item.actif} onChange={() => toggleActif(realIdx)} />
                    </td>
                    <td style={{ padding:"10px 14px", textAlign:"center" }}>
                      <button style={{ padding:"4px 10px", borderRadius:7, fontSize:11, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
                        ✏
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PAGE D'ACCUEIL — TUILES (R10)
// ─────────────────────────────────────────────────────────
export default function ReferentielsModule() {
  const [data, setData] = useState(INIT);
  const [activeRef, setActiveRef] = useState(null);
  const [search, setSearch] = useState("");

  if (activeRef) {
    const tile = TILES.find(t => t.id === activeRef);
    return <RefScreen tile={tile} data={data} setData={setData} onBack={() => setActiveRef(null)} />;
  }

  const filteredTiles = TILES.filter(t =>
    !search || t.label.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace", color:"#C8D8EA", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050C1A}::-webkit-scrollbar-thumb{background:#1D3250;border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .tile-card:hover{transform:translateY(-3px)!important;border-color:var(--accent)!important;}
      `}</style>

      {/* HEADER */}
      <div style={{ background:"rgba(5,12,26,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 28px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>📋</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Referentiels</span>
          <span style={{ fontSize:11, color:"#3E5470" }}>{TILES.length} referentiels disponibles</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un referentiel..."
          style={{ background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"7px 14px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none", width:240 }} />
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 28px 60px", animation:"fadeUp .4s ease forwards" }}>

        {/* Stats globales */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:28 }}>
          {[
            ["Referentiels", TILES.length,                                          "#06b6d4"],
            ["Clients actifs", INIT.clients.filter(c=>c.actif).length,              "#10b981"],
            ["Devises actives", INIT.devises.filter(d=>d.actif).length,             "#8B5CF6"],
            ["Correspondants actifs", INIT.correspondants.filter(c=>c.actif).length,"#F59E0B"],
          ].map(([l,v,c]) => (
            <div key={l} style={{ padding:"14px 18px", background:"rgba(8,15,28,.7)", border:"1px solid rgba(255,255,255,.06)", borderRadius:12, borderLeft:"3px solid "+c }}>
              <div style={{ fontSize:10, color:"#3E5470", textTransform:"uppercase", letterSpacing:".12em", marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:26, fontWeight:800, color:c, fontFamily:"'Space Grotesk',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Grille de tuiles */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
          {filteredTiles.map(tile => {
            const items = data[tile.key] || [];
            const actifs = items.filter(i => i.actif).length;
            return (
              <div key={tile.id}
                className="tile-card"
                onClick={() => setActiveRef(tile.id)}
                style={{
                  padding:"20px", background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)",
                  borderRadius:14, cursor:"pointer", transition:"all .22s ease",
                  "--accent": tile.color,
                  position:"relative", overflow:"hidden",
                }}>
                {/* Accent top */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,"+tile.color+","+tile.color+"44)" }} />

                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:tile.color+"18", border:"1px solid "+tile.color+"35", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                    {tile.icon}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:tile.color, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{actifs}</div>
                    <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em" }}>actifs / {items.length}</div>
                  </div>
                </div>

                <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2", marginBottom:5 }}>{tile.label}</div>
                <div style={{ fontSize:10, color:"#3E5470", lineHeight:1.4 }}>{tile.desc}</div>

                <div style={{ marginTop:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ height:3, flex:1, borderRadius:2, background:"rgba(255,255,255,.06)", overflow:"hidden", marginRight:8 }}>
                    <div style={{ height:"100%", width:items.length>0?(actifs/items.length*100)+"%":"0%", background:"linear-gradient(90deg,"+tile.color+","+tile.color+"88)", borderRadius:2, transition:"width .3s" }} />
                  </div>
                  <span style={{ fontSize:10, color:tile.color, fontWeight:700 }}>Ouvrir →</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTiles.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#2A4060", fontSize:13 }}>
            Aucun referentiel pour "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
