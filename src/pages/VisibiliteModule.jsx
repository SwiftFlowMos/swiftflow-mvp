import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────
// DÉFINITION DE TOUS LES CHAMPS DU FORMULAIRE
// ─────────────────────────────────────────────────────────
const ALL_FIELDS = [
  // ── PARAMÈTRES ORDRE ──
  { id: "valueDate",         label: "Date de valeur",             section: "ORDRE",          sensitive: false },
  { id: "charges",           label: "Frais (OUR/SHA/BEN)",        section: "ORDRE",          sensitive: false },
  { id: "correspondentBank", label: "Banque correspondante",      section: "ORDRE",          sensitive: true  },
  { id: "correspondentBIC",  label: "BIC Banque correspondante",  section: "ORDRE",          sensitive: true  },
  // ── MONTANT ──
  { id: "amount",            label: "Montant",                    section: "MONTANT",        sensitive: false },
  { id: "currency",          label: "Devise",                     section: "MONTANT",        sensitive: false },
  { id: "fxRateDetail",      label: "Détail taux de change",      section: "MONTANT",        sensitive: true  },
  // ── BÉNÉFICIAIRE ──
  { id: "beneName",          label: "Nom bénéficiaire",           section: "BENEFICIAIRE",   sensitive: false },
  { id: "beneAddress",       label: "Adresse bénéficiaire",       section: "BENEFICIAIRE",   sensitive: false },
  { id: "beneCountry",       label: "Pays bénéficiaire",          section: "BENEFICIAIRE",   sensitive: false },
  { id: "beneIBAN",          label: "IBAN bénéficiaire",          section: "BENEFICIAIRE",   sensitive: false },
  { id: "beneBIC",           label: "BIC/SWIFT bénéficiaire",     section: "BENEFICIAIRE",   sensitive: false },
  { id: "beneBankName",      label: "Nom banque bénéficiaire",    section: "BENEFICIAIRE",   sensitive: false },
  // ── AML / CONFORMITÉ (données sensibles) ──
  { id: "amlScore",          label: "Score risque AML",           section: "CONFORMITE",     sensitive: true  },
  { id: "amlDetails",        label: "Détail contrôle AML",        section: "CONFORMITE",     sensitive: true  },
  { id: "sanctionsDetail",   label: "Détail filtrage sanctions",  section: "CONFORMITE",     sensitive: true  },
  { id: "riskCountry",       label: "Pays à risque (GAFI)",       section: "CONFORMITE",     sensitive: true  },
  // ── RÉGLEMENTAIRE MAD ──
  { id: "madType",           label: "Nature transfert MAD",       section: "REGLEMENTAIRE",  sensitive: false },
  { id: "domiciliationRef",  label: "N° Titre d'importation",     section: "REGLEMENTAIRE",  sensitive: true  },
  { id: "domiciliationBank", label: "Banque domiciliataire",      section: "REGLEMENTAIRE",  sensitive: true  },
  { id: "domiciliationDate", label: "Date domiciliation",         section: "REGLEMENTAIRE",  sensitive: true  },
  { id: "officeChangesRef",  label: "Référence Office des Changes",section: "REGLEMENTAIRE", sensitive: true  },
  // ── PAIEMENT ──
  { id: "reference",         label: "Référence client",           section: "PAIEMENT",       sensitive: false },
  { id: "motif",             label: "Motif économique",           section: "PAIEMENT",       sensitive: false },
  { id: "details",           label: "Libellé SWIFT",              section: "PAIEMENT",       sensitive: false },
];

// ─────────────────────────────────────────────────────────
// RÔLES DISPONIBLES
// ─────────────────────────────────────────────────────────
const ROLES = [
  { id: "SAISISSEUR",      label: "Saisisseur",             icon: "✍", color: "#06b6d4" },
  { id: "VALIDEUR_N1",     label: "Valideur N1",            icon: "✓", color: "#10b981" },
  { id: "VALIDEUR_N2",     label: "Valideur N2",            icon: "✓✓",color: "#059669" },
  { id: "CONFORMITE",      label: "Conformité / AML",       icon: "🛡", color: "#f59e0b" },
  { id: "REGLEMENTAIRE",   label: "Responsable Réglementaire",icon:"📋",color: "#a78bfa" },
  { id: "DIRECTION",       label: "Direction",              icon: "⭐", color: "#ec4899" },
  { id: "ADMIN",           label: "Administrateur",         icon: "⚙", color: "#64748b" },
  { id: "AUDITEUR",        label: "Auditeur",               icon: "🔍", color: "#94a3b8" },
];

// Niveaux de visibilité
const LEVELS = [
  { id: "HIDDEN",   label: "Masqué",     icon: "🚫", color: "#334155", bg: "rgba(51,65,85,.15)"  },
  { id: "READONLY", label: "Lecture",    icon: "👁",  color: "#06b6d4", bg: "rgba(6,182,212,.1)"  },
  { id: "EDITABLE", label: "Modifiable", icon: "✏",  color: "#10b981", bg: "rgba(16,185,129,.1)" },
];

// ─────────────────────────────────────────────────────────
// MATRICE DE VISIBILITÉ PAR DÉFAUT
// ─────────────────────────────────────────────────────────
function buildDefaultMatrix() {
  const matrix = {};
  ALL_FIELDS.forEach(field => {
    matrix[field.id] = {};
    ROLES.forEach(role => {
      if (role.id === "ADMIN" || role.id === "AUDITEUR") {
        matrix[field.id][role.id] = "READONLY";
      } else if (role.id === "SAISISSEUR") {
        if (field.sensitive) matrix[field.id][role.id] = "HIDDEN";
        else matrix[field.id][role.id] = "EDITABLE";
      } else if (role.id === "CONFORMITE") {
        matrix[field.id][role.id] = field.section === "CONFORMITE" ? "READONLY" : "READONLY";
      } else if (role.id === "REGLEMENTAIRE") {
        matrix[field.id][role.id] = field.section === "REGLEMENTAIRE" ? "READONLY" : "READONLY";
        if (field.section === "CONFORMITE") matrix[field.id][role.id] = "HIDDEN";
      } else if (role.id === "DIRECTION") {
        matrix[field.id][role.id] = "READONLY";
      } else {
        // Valideurs N1, N2
        if (field.section === "CONFORMITE") matrix[field.id][role.id] = "HIDDEN";
        else if (["correspondentBank","correspondentBIC","officeChangesRef"].includes(field.id)) matrix[field.id][role.id] = "HIDDEN";
        else matrix[field.id][role.id] = "READONLY";
      }
    });
  });
  // Cas spéciaux
  ["domiciliationRef","domiciliationBank","domiciliationDate"].forEach(f => {
    matrix[f]["SAISISSEUR"] = "EDITABLE";
    matrix[f]["REGLEMENTAIRE"] = "READONLY";
    matrix[f]["CONFORMITE"] = "READONLY";
  });
  matrix["correspondentBank"]["CONFORMITE"] = "READONLY";
  matrix["correspondentBIC"]["CONFORMITE"] = "READONLY";
  return matrix;
}

const SECTIONS = {
  ORDRE:         { label: "Paramètres ordre",      icon: "⚙" },
  MONTANT:       { label: "Montant & Devise",       icon: "💱" },
  BENEFICIAIRE:  { label: "Bénéficiaire",           icon: "👤" },
  CONFORMITE:    { label: "Conformité / AML",       icon: "🛡" },
  REGLEMENTAIRE: { label: "Réglementaire MAD",      icon: "🇲🇦" },
  PAIEMENT:      { label: "Détails paiement",       icon: "📋" },
};

// ─────────────────────────────────────────────────────────
// COMPOSANTS
// ─────────────────────────────────────────────────────────
function LevelPill({ level, onClick, small = false }) {
  const L = LEVELS.find(l => l.id === level) || LEVELS[0];
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "2px 8px" : "5px 12px",
      borderRadius: 20, fontSize: small ? 10 : 11, fontWeight: 700,
      background: L.bg, border: `1px solid ${L.color}44`, color: L.color,
      cursor: onClick ? "pointer" : "default",
      transition: "all .2s", whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: small ? 9 : 11 }}>{L.icon}</span>
      {L.label}
    </button>
  );
}

function SectionBadge({ section }) {
  const s = SECTIONS[section];
  return (
    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: "rgba(30,58,95,.5)", border: "1px solid #1e3a5f", color: "#475569" }}>
      {s?.icon} {s?.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// VUE ADMIN — MATRICE DE VISIBILITÉ
// ─────────────────────────────────────────────────────────
function AdminMatrix({ matrix, onUpdate }) {
  const [filterSection, setFilterSection] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [search, setSearch] = useState("");

  const cycleLevel = (fieldId, roleId) => {
    const current = matrix[fieldId][roleId];
    const idx = LEVELS.findIndex(l => l.id === current);
    const next = LEVELS[(idx + 1) % LEVELS.length].id;
    onUpdate(fieldId, roleId, next);
  };

  const setColumnLevel = (roleId, level) => {
    ALL_FIELDS.forEach(f => onUpdate(f.id, roleId, level));
  };

  const filteredFields = ALL_FIELDS.filter(f => {
    if (filterSection !== "ALL" && f.section !== filterSection) return false;
    if (search && !f.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const visibleRoles = filterRole === "ALL" ? ROLES : ROLES.filter(r => r.id === filterRole);

  const inp = { background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"7px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" };

  return (
    <div>
      {/* Filtres */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un champ..."
          style={{ ...inp, width:200 }} />
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={inp}>
          <option value="ALL">Toutes les sections</option>
          {Object.entries(SECTIONS).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={inp}>
          <option value="ALL">Tous les rôles</option>
          {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
        </select>
        <div style={{ fontSize:11, color:"#334155", marginLeft:"auto" }}>
          Cliquez sur un niveau pour le changer · {filteredFields.length} champ(s)
        </div>
      </div>

      {/* Légende */}
      <div style={{ display:"flex", gap:10, marginBottom:14 }}>
        {LEVELS.map(l => (
          <div key={l.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:l.bg, border:`1px solid ${l.color}44` }}>
            <span style={{ fontSize:13 }}>{l.icon}</span>
            <span style={{ fontSize:11, fontWeight:700, color:l.color }}>{l.label}</span>
          </div>
        ))}
        <div style={{ fontSize:11, color:"#334155", alignSelf:"center" }}>— Cliquer pour cycler : Masqué → Lecture → Modifiable</div>
      </div>

      {/* Table matrice */}
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr>
              <th style={{ textAlign:"left", padding:"10px 12px", background:"rgba(6,182,212,.05)", borderBottom:"1px solid rgba(30,58,138,.3)", fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", width:220 }}>Champ</th>
              <th style={{ padding:"10px 8px", background:"rgba(6,182,212,.05)", borderBottom:"1px solid rgba(30,58,138,.3)", fontSize:10, color:"#475569", width:70 }}>Sensible</th>
              {visibleRoles.map(role => (
                <th key={role.id} style={{ padding:"10px 6px", background:"rgba(6,182,212,.05)", borderBottom:"1px solid rgba(30,58,138,.3)", textAlign:"center", minWidth:110 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:role.color }}>{role.icon} {role.label}</div>
                  <div style={{ display:"flex", gap:4, justifyContent:"center", marginTop:6 }}>
                    {LEVELS.map(l => (
                      <button key={l.id} onClick={() => setColumnLevel(role.id, l.id)} title={`Tout mettre en ${l.label}`}
                        style={{ padding:"2px 6px", borderRadius:6, fontSize:9, fontWeight:700, cursor:"pointer", background:l.bg, border:`1px solid ${l.color}33`, color:l.color }}>
                        {l.icon}
                      </button>
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFields.map((field, i) => (
              <tr key={field.id} style={{ borderBottom:"1px solid rgba(30,58,138,.15)", background: i%2===0 ? "rgba(11,20,37,.6)" : "rgba(15,23,42,.4)" }}>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ fontSize:12, color:"#e2e8f0", fontWeight:600, marginBottom:3 }}>{field.label}</div>
                  <SectionBadge section={field.section} />
                </td>
                <td style={{ padding:"10px 8px", textAlign:"center" }}>
                  {field.sensitive
                    ? <span style={{ fontSize:14, title:"Donnée sensible" }}>🔒</span>
                    : <span style={{ fontSize:12, color:"#1e3a5f" }}>—</span>}
                </td>
                {visibleRoles.map(role => (
                  <td key={role.id} style={{ padding:"8px 6px", textAlign:"center" }}>
                    <LevelPill level={matrix[field.id][role.id]} small onClick={() => cycleLevel(field.id, role.id)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FORMULAIRE ADAPTATIF — s'adapte au rôle connecté
// ─────────────────────────────────────────────────────────
function AdaptiveForm({ role, matrix }) {
  const [form, setForm] = useState({
    valueDate: "2026-04-22", charges: "SHA", amount: "1250000", currency: "MAD",
    beneName: "SIEMENS MAROC SARL", beneAddress: "Bd Zerktouni, Casablanca",
    beneCountry: "MA", beneIBAN: "MA64 0110 0001 0010 0100 1000 1200",
    beneBIC: "BCDMMAMC", beneBankName: "BMCE Bank",
    correspondentBank: "Deutsche Bank Frankfurt", correspondentBIC: "DEUTDEFFXXX",
    amlScore: "12 / 100 — Risque faible", amlDetails: "Aucun match OFAC/UE — Fircosoft v3",
    sanctionsDetail: "Conforme listes OFAC, UE, ONU", riskCountry: "Non listé GAFI",
    fxRateDetail: "1 EUR = 10.92 MAD (cours BCE 2026-04-22)",
    madType: "COMMERCIAL", domiciliationRef: "DOM-2026-003341",
    domiciliationBank: "Attijariwafa Bank", domiciliationDate: "2026-03-15",
    officeChangesRef: "OC-2026-44821", reference: "PO-2026-7712",
    motif: "TRADE", details: "Règlement importation matériel électrique",
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const getLevel = (fieldId) => matrix[fieldId]?.[role.id] || "HIDDEN";

  const visible = (fieldId) => getLevel(fieldId) !== "HIDDEN";
  const editable = (fieldId) => getLevel(fieldId) === "EDITABLE";

  const fieldStyle = (fieldId) => {
    const lvl = getLevel(fieldId);
    return {
      width: "100%", fontFamily: "monospace", outline: "none",
      background: lvl === "EDITABLE" ? "#0b1425" : "rgba(15,23,42,.4)",
      border: `1px solid ${lvl === "EDITABLE" ? "#1e3a5f" : "rgba(30,58,138,.2)"}`,
      borderRadius: 8, padding: "9px 12px", fontSize: 12,
      color: lvl === "EDITABLE" ? "#e2e8f0" : "#64748b",
      cursor: lvl === "READONLY" ? "default" : "text",
    };
  };

  const Field = ({ id, label, type = "text", children, placeholder = "" }) => {
    if (!visible(id)) return null;
    const lvl = getLevel(id);
    const L = LEVELS.find(l => l.id === lvl);
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <label style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#64748b" }}>{label}</label>
          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:L.bg, border:`1px solid ${L.color}33`, color:L.color, fontWeight:700 }}>
            {L.icon} {L.label}
          </span>
        </div>
        {children || (
          <input type={type} value={form[id] || ""} onChange={e => editable(id) && set(id, e.target.value)}
            readOnly={!editable(id)} placeholder={placeholder}
            style={fieldStyle(id)} />
        )}
      </div>
    );
  };

  // Sections visibles
  const sectionHasContent = (section) =>
    ALL_FIELDS.filter(f => f.section === section).some(f => visible(f.id));

  const SectionWrapper = ({ id, children }) => {
    const s = SECTIONS[id];
    if (!sectionHasContent(id)) return null;
    return (
      <div style={{ background:"rgba(11,20,37,.85)", border:"1px solid rgba(30,58,138,.25)", borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{s.icon}</div>
          <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{s.label}</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>{children}</div>
      </div>
    );
  };

  const visibleCount = ALL_FIELDS.filter(f => visible(f.id)).length;
  const hiddenCount = ALL_FIELDS.length - visibleCount;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Indicateur de visibilité */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"rgba(6,182,212,.04)", border:"1px solid rgba(6,182,212,.1)", borderRadius:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:role.color }} />
          <span style={{ fontSize:12, fontWeight:700, color:role.color }}>{role.icon} {role.label}</span>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <span style={{ fontSize:11, color:"#10b981" }}>✓ {ALL_FIELDS.filter(f=>getLevel(f.id)==="EDITABLE").length} modifiables</span>
          <span style={{ fontSize:11, color:"#06b6d4" }}>👁 {ALL_FIELDS.filter(f=>getLevel(f.id)==="READONLY").length} en lecture</span>
          <span style={{ fontSize:11, color:"#334155" }}>🚫 {hiddenCount} masqués</span>
        </div>
      </div>

      {/* Référence ordre */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px", background:"rgba(11,20,37,.6)", border:"1px solid rgba(30,58,138,.2)", borderRadius:9 }}>
        <span style={{ fontSize:10, color:"#334155", letterSpacing:2, textTransform:"uppercase" }}>Référence</span>
        <span style={{ fontSize:13, color:"#06b6d4", fontWeight:700, fontFamily:"monospace" }}>TRF-84729301</span>
        <span style={{ fontSize:11, color:"#475569" }}>Ordre soumis le 2026-04-22</span>
      </div>

      {/* Paramètres ordre */}
      <SectionWrapper id="ORDRE">
        <Field id="valueDate" label="Date de valeur" type="date" />
        <Field id="charges" label="Frais bancaires">
          {visible("charges") && (
            <div style={{ display:"flex", gap:6 }}>
              {["OUR","SHA","BEN"].map(c => (
                <button key={c} onClick={() => editable("charges") && set("charges", c)}
                  disabled={!editable("charges")} style={{
                  flex:1, padding:"8px 0", borderRadius:8, fontSize:12, fontWeight:700,
                  background: form.charges===c ? "rgba(6,182,212,.1)" : "rgba(15,23,42,.5)",
                  border:`1px solid ${form.charges===c ? "rgba(6,182,212,.4)" : "#1e3a5f"}`,
                  color: form.charges===c ? "#06b6d4" : "#475569",
                  cursor: editable("charges") ? "pointer" : "default", opacity: editable("charges") ? 1 : .6,
                }}>{c}</button>
              ))}
              <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, alignSelf:"center", background:LEVELS.find(l=>l.id===getLevel("charges")).bg, color:LEVELS.find(l=>l.id===getLevel("charges")).color, fontWeight:700, border:`1px solid ${LEVELS.find(l=>l.id===getLevel("charges")).color}33` }}>
                {LEVELS.find(l=>l.id===getLevel("charges")).icon} {LEVELS.find(l=>l.id===getLevel("charges")).label}
              </span>
            </div>
          )}
        </Field>
        <Field id="correspondentBank" label="Banque correspondante" placeholder="Deutsche Bank Frankfurt" />
        <Field id="correspondentBIC" label="BIC Banque correspondante" placeholder="DEUTDEFFXXX" />
      </SectionWrapper>

      {/* Montant */}
      <SectionWrapper id="MONTANT">
        <Field id="amount" label="Montant" />
        <Field id="currency" label="Devise">
          {visible("currency") && (
            <div style={{ display:"flex", gap:6 }}>
              {[["EUR","🇪🇺"],["USD","🇺🇸"],["GBP","🇬🇧"],["MAD","🇲🇦"],["CAD","🇨🇦"]].map(([c,f]) => (
                <button key={c} onClick={() => editable("currency") && set("currency", c)}
                  disabled={!editable("currency")} style={{
                  flex:1, padding:"7px 0", borderRadius:7, fontSize:10, fontWeight:700,
                  background: form.currency===c ? "rgba(6,182,212,.1)" : "rgba(15,23,42,.5)",
                  border:`1px solid ${form.currency===c ? "rgba(6,182,212,.4)" : "#1e3a5f"}`,
                  color: form.currency===c ? "#06b6d4" : "#475569",
                  cursor: editable("currency") ? "pointer" : "default", opacity: editable("currency") ? 1 : .6,
                }}>{f} {c}</button>
              ))}
            </div>
          )}
        </Field>
        <Field id="fxRateDetail" label="Détail taux de change" />
      </SectionWrapper>

      {/* Bénéficiaire */}
      <SectionWrapper id="BENEFICIAIRE">
        <Field id="beneName" label="Nom bénéficiaire" />
        <Field id="beneCountry" label="Pays" />
        <Field id="beneIBAN" label="IBAN" />
        <Field id="beneBIC" label="BIC / SWIFT" />
        <Field id="beneAddress" label="Adresse" />
        <Field id="beneBankName" label="Banque bénéficiaire" />
      </SectionWrapper>

      {/* Conformité */}
      <SectionWrapper id="CONFORMITE">
        <Field id="amlScore" label="Score risque AML" />
        <Field id="riskCountry" label="Pays à risque (GAFI)" />
        <div style={{ gridColumn:"span 2" }}><Field id="amlDetails" label="Détail contrôle AML" /></div>
        <div style={{ gridColumn:"span 2" }}><Field id="sanctionsDetail" label="Détail filtrage sanctions" /></div>
      </SectionWrapper>

      {/* Réglementaire MAD */}
      {form.currency === "MAD" && (
        <SectionWrapper id="REGLEMENTAIRE">
          <Field id="madType" label="Nature du transfert">
            {visible("madType") && (
              <div style={{ display:"flex", gap:8 }}>
                {[["FINANCIER","💰 Financier"],["COMMERCIAL","🏭 Commercial"]].map(([v,l]) => (
                  <button key={v} onClick={() => editable("madType") && set("madType", v)}
                    disabled={!editable("madType")} style={{
                    flex:1, padding:"9px 8px", borderRadius:9, fontSize:11, fontWeight:700,
                    background: form.madType===v ? "rgba(245,158,11,.1)" : "rgba(15,23,42,.6)",
                    border:`2px solid ${form.madType===v ? "rgba(245,158,11,.4)" : "#1e3a5f"}`,
                    color: form.madType===v ? "#f59e0b" : "#475569",
                    cursor: editable("madType") ? "pointer" : "default", opacity: editable("madType") ? 1 : .7,
                  }}>{l}</button>
                ))}
              </div>
            )}
          </Field>
          <Field id="officeChangesRef" label="Réf. Office des Changes" />
          <Field id="domiciliationRef" label="N° Titre d'importation" placeholder="DOM-YYYY-XXXXXX" />
          <Field id="domiciliationBank" label="Banque domiciliataire" placeholder="Attijariwafa Bank..." />
          <Field id="domiciliationDate" label="Date domiciliation" type="date" />
        </SectionWrapper>
      )}

      {/* Paiement */}
      <SectionWrapper id="PAIEMENT">
        <Field id="reference" label="Référence client" />
        <Field id="motif" label="Motif économique">
          {visible("motif") && (
            <select value={form.motif} onChange={e => editable("motif") && set("motif", e.target.value)}
              disabled={!editable("motif")} style={{ ...fieldStyle("motif") }}>
              {[["TRADE","Import/Export"],["SERVICE","Services"],["DIVIDEND","Dividendes"],["SALARY","Salaires"],["LOAN","Prêt/Remb."],["INVEST","Investissement"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          )}
        </Field>
        <div style={{ gridColumn:"span 2" }}>
          <Field id="details" label="Libellé SWIFT">
            {visible("details") && (
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <textarea value={form.details} onChange={e => editable("details") && set("details", e.target.value)}
                  readOnly={!editable("details")} rows={2}
                  style={{ ...fieldStyle("details"), resize:"vertical" }} />
                <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, alignSelf:"flex-end", background:LEVELS.find(l=>l.id===getLevel("details")).bg, color:LEVELS.find(l=>l.id===getLevel("details")).color, fontWeight:700 }}>
                  {LEVELS.find(l=>l.id===getLevel("details")).icon} {LEVELS.find(l=>l.id===getLevel("details")).label}
                </span>
              </div>
            )}
          </Field>
        </div>
      </SectionWrapper>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APPLICATION PRINCIPALE
// ─────────────────────────────────────────────────────────
export default function FieldVisibilityManager() {
  const [matrix, setMatrix] = useState(buildDefaultMatrix);
  const [view, setView] = useState("ADMIN"); // ADMIN | PREVIEW
  const [previewRole, setPreviewRole] = useState(ROLES[0]);
  const [saved, setSaved] = useState(false);

  const updateMatrix = (fieldId, roleId, level) => {
    setMatrix(m => ({ ...m, [fieldId]: { ...m[fieldId], [roleId]: level } }));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const currentRole = view === "PREVIEW" ? previewRole : null;

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
        table{border-collapse:collapse} th,td{vertical-align:middle}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom:"1px solid rgba(6,182,212,.1)", background:"rgba(6,182,212,.025)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#0891b2,#0e7490)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 0 18px rgba(8,145,178,.3)" }}>⚡</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#e2e8f0", letterSpacing:1 }}>SWIFT<span style={{ color:"#06b6d4" }}>FLOW</span></div>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, textTransform:"uppercase" }}>Visibilité des champs par rôle</div>
            </div>
          </div>

          <div style={{ display:"flex", gap:4, background:"rgba(11,20,37,.8)", border:"1px solid rgba(30,58,138,.3)", borderRadius:10, padding:4 }}>
            {[["ADMIN","⚙ Matrice admin"],["PREVIEW","👁 Aperçu par rôle"]].map(([k,l]) => (
              <button key={k} onClick={() => setView(k)} style={tabStyle(k)}>{l}</button>
            ))}
          </div>

          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {view === "PREVIEW" && (
              <select value={previewRole.id} onChange={e => setPreviewRole(ROLES.find(r => r.id === e.target.value))}
                style={{ background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none" }}>
                {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
              </select>
            )}
            <button onClick={handleSave} style={{
              padding:"8px 18px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
              background: saved ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#0891b2,#0e7490)",
              border:"none", color:"#fff", transition:"all .3s",
            }}>{saved ? "✓ Sauvegardé" : "Enregistrer"}</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>

        {view === "ADMIN" && (
          <div className="fade">
            <div style={{ marginBottom:16 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>Matrice de visibilité</h2>
              <p style={{ fontSize:12, color:"#475569" }}>Définissez pour chaque champ et chaque rôle le niveau d'accès. Cliquez sur un niveau pour le modifier.</p>
            </div>
            <div style={{ background:"rgba(11,20,37,.85)", border:"1px solid rgba(30,58,138,.25)", borderRadius:14, padding:20 }}>
              <AdminMatrix matrix={matrix} onUpdate={updateMatrix} />
            </div>
          </div>
        )}

        {view === "PREVIEW" && (
          <div className="fade">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Gauche : formulaire adaptatif */}
              <div>
                <div style={{ marginBottom:14 }}>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>
                    Formulaire — vue {previewRole.icon} {previewRole.label}
                  </h2>
                  <p style={{ fontSize:12, color:"#475569" }}>Tel qu'affiché à un utilisateur avec ce rôle</p>
                </div>
                <AdaptiveForm role={previewRole} matrix={matrix} />
              </div>

              {/* Droite : comparatif des rôles */}
              <div>
                <div style={{ marginBottom:14 }}>
                  <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>Accès par rôle</h2>
                  <p style={{ fontSize:12, color:"#475569" }}>Résumé pour tous les rôles sur ce champ</p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {ROLES.map(role => {
                    const counts = {
                      EDITABLE: ALL_FIELDS.filter(f => matrix[f.id][role.id] === "EDITABLE").length,
                      READONLY: ALL_FIELDS.filter(f => matrix[f.id][role.id] === "READONLY").length,
                      HIDDEN:   ALL_FIELDS.filter(f => matrix[f.id][role.id] === "HIDDEN").length,
                    };
                    const isSelected = role.id === previewRole.id;
                    return (
                      <div key={role.id} onClick={() => setPreviewRole(role)} style={{
                        padding:"12px 16px", background: isSelected ? `${role.color}10` : "rgba(11,20,37,.7)",
                        border:`1px solid ${isSelected ? role.color+"55" : "rgba(30,58,138,.25)"}`,
                        borderRadius:10, cursor:"pointer", transition:"all .2s",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:16 }}>{role.icon}</span>
                            <span style={{ fontSize:13, fontWeight:700, color: isSelected ? role.color : "#e2e8f0" }}>{role.label}</span>
                          </div>
                          {isSelected && <span style={{ fontSize:10, color:role.color, fontWeight:700 }}>● Affiché</span>}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
                          {[["EDITABLE","#10b981"],["READONLY","#06b6d4"],["HIDDEN","#334155"]].map(([lvl,c]) => (
                            <div key={lvl} style={{ padding:"5px 8px", borderRadius:7, background:`${c}10`, border:`1px solid ${c}25`, textAlign:"center" }}>
                              <div style={{ fontSize:16, marginBottom:2 }}>{LEVELS.find(l=>l.id===lvl).icon}</div>
                              <div style={{ fontSize:11, fontWeight:700, color:c }}>{counts[lvl]}</div>
                              <div style={{ fontSize:9, color:"#334155" }}>{LEVELS.find(l=>l.id===lvl).label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
