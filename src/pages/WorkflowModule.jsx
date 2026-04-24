import { useState, useRef } from "react";

// ─────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────
const STEP_TYPES = [
  { id: "MANUEL",    label: "Validation manuelle",  icon: "👤", desc: "Décision humaine" },
  { id: "AUTO",      label: "Contrôle automatique", icon: "🤖", desc: "API système tiers" },
  { id: "SEMI_AUTO", label: "Semi-automatique",     icon: "⚡", desc: "Auto + confirmation" },
];

const ROLES_DISPO = [
  "Chargé d'opérations","Valideur N1","Valideur N2","Risk Manager",
  "Compliance Officer","Directeur Opérations","Directeur Général",
  "Responsable Réglementaire","Back Office Manager",
];

const SYSTEMES_TIERS = [
  { id: "none",          label: "Aucun" },
  { id: "PROVISION",     label: "Contrôle provision (Core Banking)" },
  { id: "AML_ENGINE",    label: "Moteur AML (Fircosoft)" },
  { id: "OFFICE_CHANGES",label: "Office des Changes Maroc" },
  { id: "SWIFT_GPI",     label: "SWIFT GPI Tracker" },
  { id: "CUSTOM_API",    label: "API personnalisée" },
];

// Résultats possibles d'une étape
const RESULTATS = [
  { id: "POSITIF", label: "Positif",  color: "#10b981", icon: "✓" },
  { id: "NEGATIF", label: "Négatif",  color: "#ef4444", icon: "✕" },
  { id: "ALERTE",  label: "Alerte",   color: "#f59e0b", icon: "⚠" },
];

// Actions possibles selon résultat
const ACTIONS_RESULTAT = [
  { id: "NEXT",     label: "→ Étape suivante" },
  { id: "PREVIOUS", label: "↩ Étape précédente" },
  { id: "STEP",     label: "⤵ Étape spécifique" },
  { id: "BLOCK",    label: "✕ Bloquer l'ordre" },
  { id: "ESCALADE", label: "⬆ Escalade direction" },
  { id: "MANUAL",   label: "👤 Basculer en manuel" },
];

const TIMEOUT_OPTS = [
  { id: "ALERTE",   label: "Alerte superviseur",  color: "#f59e0b" },
  { id: "ESCALADE", label: "Escalade",             color: "#a78bfa" },
  { id: "BLOCK",    label: "Bloquer l'ordre",      color: "#ef4444" },
];

const TC = {
  MANUEL:    { color: "#06b6d4", bg: "rgba(6,182,212,.1)",  border: "rgba(6,182,212,.25)" },
  AUTO:      { color: "#10b981", bg: "rgba(16,185,129,.1)", border: "rgba(16,185,129,.25)" },
  SEMI_AUTO: { color: "#f59e0b", bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.25)" },
};

const RC = {
  POSITIF: "#10b981",
  NEGATIF: "#ef4444",
  ALERTE:  "#f59e0b",
};

// ─────────────────────────────────────────────────────────
// CIRCUIT PAR DÉFAUT
// ─────────────────────────────────────────────────────────
const DEFAULT_CIRCUIT = [
  {
    id: "s1", ordre: 1, nom: "Contrôle Provision",
    type: "AUTO", role: "", systemeTiers: "PROVISION",
    approbateurs: 0, delaiHeures: 1, actif: true,
    description: "Vérification automatique de la provision via Core Banking",
    conditions: {
      toujours: true, montantMin: 0, montantMax: 0, devises: [],
      surResultatPrecedent: false, resultatsAcceptes: [],
    },
    routing: {
      POSITIF: { action: "NEXT",  stepId: null },
      NEGATIF: { action: "BLOCK", stepId: null },
      ALERTE:  { action: "MANUAL", stepId: null },
    },
    timeoutAction: "ALERTE",
  },
  {
    id: "s2", ordre: 2, nom: "Validation Conformité",
    type: "MANUEL", role: "Compliance Officer", systemeTiers: "none",
    approbateurs: 1, delaiHeures: 24, actif: true,
    description: "Contrôle AML/KYC et réglementation des changes",
    conditions: {
      toujours: false, montantMin: 0, montantMax: 0, devises: [],
      surResultatPrecedent: true, resultatsAcceptes: ["POSITIF"],
    },
    routing: {
      POSITIF: { action: "NEXT",     stepId: null },
      NEGATIF: { action: "PREVIOUS", stepId: null },
      ALERTE:  { action: "ESCALADE", stepId: null },
    },
    timeoutAction: "ESCALADE",
  },
  {
    id: "s3", ordre: 3, nom: "Validation Réglementaire",
    type: "SEMI_AUTO", role: "Responsable Réglementaire", systemeTiers: "OFFICE_CHANGES",
    approbateurs: 1, delaiHeures: 48, actif: true,
    description: "Contrôle Office des Changes — obligatoire pour MAD",
    conditions: {
      toujours: false, montantMin: 0, montantMax: 0, devises: ["MAD"],
      surResultatPrecedent: true, resultatsAcceptes: ["POSITIF", "ALERTE"],
    },
    routing: {
      POSITIF: { action: "NEXT",     stepId: null },
      NEGATIF: { action: "STEP",     stepId: "s2" },
      ALERTE:  { action: "ESCALADE", stepId: null },
    },
    timeoutAction: "BLOCK",
  },
  {
    id: "s4", ordre: 4, nom: "Validation Hiérarchique",
    type: "MANUEL", role: "Directeur Opérations", systemeTiers: "none",
    approbateurs: 1, delaiHeures: 4, actif: true,
    description: "Approbation direction pour montants > 500 000",
    conditions: {
      toujours: false, montantMin: 500000, montantMax: 0, devises: [],
      surResultatPrecedent: true, resultatsAcceptes: ["POSITIF"],
    },
    routing: {
      POSITIF: { action: "NEXT",     stepId: null },
      NEGATIF: { action: "PREVIOUS", stepId: null },
      ALERTE:  { action: "ESCALADE", stepId: null },
    },
    timeoutAction: "ESCALADE",
  },
];

const ORDRE_DEMO = {
  id: "TRF-84729301", amount: 1250000, currency: "MAD", symbol: "DH",
  beneName: "SIEMENS MAROC SARL", reference: "DOM-2026-003341",
  saisisseur: "Khalid Benali", createdAt: "2026-04-20 09:14",
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const uid = () => `s${Date.now().toString(36)}`;

function routingLabel(action, stepId, circuit) {
  if (action === "NEXT")     return "→ Étape suivante";
  if (action === "PREVIOUS") return "↩ Étape précédente";
  if (action === "BLOCK")    return "✕ Bloquer l'ordre";
  if (action === "ESCALADE") return "⬆ Escalade direction";
  if (action === "MANUAL")   return "👤 Basculer en manuel";
  if (action === "STEP" && stepId) {
    const s = circuit.find(x => x.id === stepId);
    return s ? `⤵ → ${s.nom}` : "⤵ Étape spécifique";
  }
  return "—";
}

// ─────────────────────────────────────────────────────────
// MINI COMPOSANTS
// ─────────────────────────────────────────────────────────
function Tag({ color, bg, border, children }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, color, background:bg||`${color}15`, border:`1px solid ${border||color+"33"}` }}>
      {children}
    </span>
  );
}

function Inp({ value, onChange, placeholder, type="text", style={} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"9px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none", ...style }} />
  );
}

function Sel({ value, onChange, children, style={} }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"9px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none", ...style }}>
      {children}
    </select>
  );
}

// ─────────────────────────────────────────────────────────
// ROUTING EDITOR — configurer les 3 résultats d'une étape
// ─────────────────────────────────────────────────────────
function RoutingEditor({ step, circuit, onChange }) {
  const showRouting = step.type === "AUTO" || step.type === "SEMI_AUTO" || step.type === "MANUEL";
  const resultats = step.type === "MANUEL"
    ? [{ id:"POSITIF", label:"Approuvé", icon:"✓", color:"#10b981" }, { id:"NEGATIF", label:"Rejeté", icon:"✕", color:"#ef4444" }, { id:"ALERTE", label:"Retourné", icon:"↩", color:"#a78bfa" }]
    : RESULTATS;

  const setRoute = (res, field, val) => {
    onChange({
      ...step,
      routing: { ...step.routing, [res]: { ...step.routing[res], [field]: val } },
    });
  };

  const otherSteps = circuit.filter(s => s.id !== step.id);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".15em", marginBottom:2 }}>
        Routage conditionnel selon résultat
      </div>
      {resultats.map(res => {
        const route = step.routing?.[res.id] || { action:"NEXT", stepId:null };
        const actionInfo = ACTIONS_RESULTAT.find(a => a.id === route.action);
        return (
          <div key={res.id} style={{
            background:"rgba(15,23,42,.7)", border:`1px solid ${res.color}22`,
            borderRadius:10, padding:"12px 14px", borderLeft:`3px solid ${res.color}55`,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:`${res.color}15`, border:`1.5px solid ${res.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:res.color, fontWeight:700 }}>
                {res.icon}
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:res.color }}>{res.label}</span>
              <span style={{ fontSize:10, color:"#334155" }}>→ si ce résultat</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns: route.action === "STEP" ? "1fr 1fr" : "1fr", gap:8 }}>
              <div>
                <div style={{ fontSize:10, color:"#475569", marginBottom:5 }}>Action</div>
                <Sel value={route.action} onChange={e => setRoute(res.id, "action", e.target.value)}>
                  {ACTIONS_RESULTAT.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </Sel>
              </div>
              {route.action === "STEP" && (
                <div>
                  <div style={{ fontSize:10, color:"#475569", marginBottom:5 }}>Aller à l'étape</div>
                  <Sel value={route.stepId || ""} onChange={e => setRoute(res.id, "stepId", e.target.value || null)}>
                    <option value="">Sélectionner...</option>
                    {otherSteps.map(s => <option key={s.id} value={s.id}>{s.ordre}. {s.nom}</option>)}
                  </Sel>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ÉDITEUR D'ÉTAPE (modale)
// ─────────────────────────────────────────────────────────
function StepModal({ step, circuit, onSave, onDelete, onClose }) {
  const [s, setS] = useState(JSON.parse(JSON.stringify(step)));
  const set = (f, v) => setS(p => ({ ...p, [f]: v }));
  const setCond = (f, v) => setS(p => ({ ...p, conditions: { ...p.conditions, [f]: v } }));
  const toggleDev = (d) => {
    const devs = s.conditions.devises.includes(d) ? s.conditions.devises.filter(x => x!==d) : [...s.conditions.devises, d];
    setCond("devises", devs);
  };
  const toggleResAccepte = (r) => {
    const arr = s.conditions.resultatsAcceptes.includes(r) ? s.conditions.resultatsAcceptes.filter(x=>x!==r) : [...s.conditions.resultatsAcceptes, r];
    setCond("resultatsAcceptes", arr);
  };

  const [tab, setTab] = useState("config");

  const tabStyle = (t) => ({
    padding:"7px 14px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", border:"none",
    background: tab === t ? "rgba(6,182,212,.12)" : "transparent",
    color: tab === t ? "#06b6d4" : "#475569",
    borderBottom: tab === t ? "2px solid #06b6d4" : "2px solid transparent",
  });

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(4,8,18,.9)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:680, background:"linear-gradient(160deg,#0d1b2e,#091422)", border:"1px solid rgba(6,182,212,.2)", borderRadius:18, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,.7)", my:20 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 22px", borderBottom:"1px solid rgba(30,58,138,.3)", background:"rgba(6,182,212,.03)" }}>
          <div style={{ fontSize:14, fontWeight:800, color:"#e2e8f0", fontFamily:"'Syne',sans-serif" }}>
            Étape {s.ordre} — {s.nom || "Configuration"}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, padding:"10px 22px 0", borderBottom:"1px solid rgba(30,58,138,.2)" }}>
          {[["config","⚙ Configuration"],["conditions","📋 Conditions"],["routing","🔀 Routage"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={tabStyle(k)}>{l}</button>
          ))}
        </div>

        <div style={{ padding:22, maxHeight:"65vh", overflowY:"auto", display:"flex", flexDirection:"column", gap:16 }}>

          {/* ── ONGLET CONFIG ── */}
          {tab === "config" && (
            <>
              <div>
                <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:5 }}>Nom de l'étape *</div>
                <Inp value={s.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex: Validation Conformité" />
              </div>
              <div>
                <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:5 }}>Description</div>
                <textarea value={s.description} onChange={e => set("description", e.target.value)} rows={2}
                  style={{ width:"100%", background:"#0b1425", border:"1px solid #1e3a5f", borderRadius:8, padding:"9px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"monospace", outline:"none", resize:"vertical" }} />
              </div>
              <div>
                <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Type de validation</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {STEP_TYPES.map(t => {
                    const tc = TC[t.id];
                    return (
                      <button key={t.id} onClick={() => set("type", t.id)} style={{
                        padding:"10px 8px", borderRadius:9, cursor:"pointer", textAlign:"center",
                        background: s.type === t.id ? tc.bg : "rgba(15,23,42,.7)",
                        border: `2px solid ${s.type === t.id ? tc.border : "#1e3a5f"}`,
                        color: s.type === t.id ? tc.color : "#475569",
                      }}>
                        <div style={{ fontSize:18, marginBottom:3 }}>{t.icon}</div>
                        <div style={{ fontSize:11, fontWeight:700 }}>{t.label}</div>
                        <div style={{ fontSize:10, opacity:.6, marginTop:2 }}>{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {(s.type === "MANUEL" || s.type === "SEMI_AUTO") && (
                  <div>
                    <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:5 }}>Rôle requis</div>
                    <Sel value={s.role} onChange={e => set("role", e.target.value)}>
                      <option value="">Sélectionner...</option>
                      {ROLES_DISPO.map(r => <option key={r} value={r}>{r}</option>)}
                    </Sel>
                  </div>
                )}
                {(s.type === "AUTO" || s.type === "SEMI_AUTO") && (
                  <div>
                    <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:5 }}>Système tiers</div>
                    <Sel value={s.systemeTiers} onChange={e => set("systemeTiers", e.target.value)}>
                      {SYSTEMES_TIERS.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                    </Sel>
                  </div>
                )}
                {(s.type === "MANUEL" || s.type === "SEMI_AUTO") && (
                  <div>
                    <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:5 }}>Nb. approbateurs</div>
                    <div style={{ display:"flex", gap:6 }}>
                      {[1,2,3].map(n => (
                        <button key={n} onClick={() => set("approbateurs", n)} style={{
                          flex:1, padding:"8px 0", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer",
                          background: s.approbateurs === n ? "rgba(6,182,212,.1)" : "rgba(15,23,42,.6)",
                          border: `1px solid ${s.approbateurs === n ? "rgba(6,182,212,.5)" : "#1e3a5f"}`,
                          color: s.approbateurs === n ? "#06b6d4" : "#475569",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:5 }}>Délai max (heures)</div>
                  <Inp type="number" value={s.delaiHeures} onChange={e => set("delaiHeures", +e.target.value)} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Si délai dépassé</div>
                <div style={{ display:"flex", gap:8 }}>
                  {TIMEOUT_OPTS.map(t => (
                    <button key={t.id} onClick={() => set("timeoutAction", t.id)} style={{
                      flex:1, padding:"8px 0", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
                      background: s.timeoutAction === t.id ? `${t.color}15` : "rgba(15,23,42,.6)",
                      border: `1px solid ${s.timeoutAction === t.id ? `${t.color}55` : "#1e3a5f"}`,
                      color: s.timeoutAction === t.id ? t.color : "#475569",
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"rgba(15,23,42,.5)", borderRadius:9, border:"1px solid rgba(30,41,59,.5)" }}>
                <span style={{ fontSize:12, color:"#64748b" }}>Étape active</span>
                <div onClick={() => set("actif", !s.actif)} style={{ width:40, height:22, borderRadius:11, cursor:"pointer", position:"relative", background: s.actif ? "#0891b2" : "#1e293b", border:`1px solid ${s.actif ? "#06b6d4" : "#334155"}`, transition:"all .25s" }}>
                  <div style={{ position:"absolute", top:3, left: s.actif ? 20 : 3, width:14, height:14, borderRadius:"50%", background: s.actif ? "#fff" : "#475569", transition:"left .25s" }} />
                </div>
              </div>
            </>
          )}

          {/* ── ONGLET CONDITIONS ── */}
          {tab === "conditions" && (
            <>
              {/* Condition sur résultat précédent */}
              <div style={{ background:"rgba(6,182,212,.03)", border:"1px solid rgba(6,182,212,.12)", borderRadius:11, padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ fontSize:13 }}>🔗</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>Condition sur l'étape précédente</div>
                    <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>Cette étape ne se déclenche que si l'étape précédente a retourné certains résultats</div>
                  </div>
                  <div onClick={() => setCond("surResultatPrecedent", !s.conditions.surResultatPrecedent)} style={{ width:40, height:22, borderRadius:11, cursor:"pointer", position:"relative", background: s.conditions.surResultatPrecedent ? "#0891b2" : "#1e293b", border:`1px solid ${s.conditions.surResultatPrecedent ? "#06b6d4" : "#334155"}`, transition:"all .25s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left: s.conditions.surResultatPrecedent ? 20 : 3, width:14, height:14, borderRadius:"50%", background: s.conditions.surResultatPrecedent ? "#fff" : "#475569", transition:"left .25s" }} />
                  </div>
                </div>

                {s.conditions.surResultatPrecedent && (
                  <div>
                    <div style={{ fontSize:10, color:"#475569", marginBottom:8 }}>Déclencher cette étape seulement si l'étape précédente a retourné :</div>
                    <div style={{ display:"flex", gap:8 }}>
                      {RESULTATS.map(r => {
                        const checked = s.conditions.resultatsAcceptes.includes(r.id);
                        return (
                          <button key={r.id} onClick={() => toggleResAccepte(r.id)} style={{
                            flex:1, padding:"10px 8px", borderRadius:9, cursor:"pointer", textAlign:"center",
                            background: checked ? `${r.color}12` : "rgba(15,23,42,.6)",
                            border: `2px solid ${checked ? r.color+"55" : "#1e3a5f"}`,
                            color: checked ? r.color : "#475569", transition:"all .2s",
                          }}>
                            <div style={{ fontSize:16, marginBottom:3 }}>{r.icon}</div>
                            <div style={{ fontSize:11, fontWeight:700 }}>{r.label}</div>
                          </button>
                        );
                      })}
                    </div>
                    {s.conditions.resultatsAcceptes.length === 0 && (
                      <div style={{ fontSize:11, color:"#f59e0b", marginTop:8, padding:"6px 10px", background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.2)", borderRadius:7 }}>
                        ⚠ Aucun résultat sélectionné — cette étape ne se déclenchera jamais
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Conditions statiques */}
              <div style={{ background:"rgba(15,23,42,.6)", border:"1px solid rgba(30,58,138,.25)", borderRadius:11, padding:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", marginBottom:12 }}>Conditions sur l'ordre</div>

                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <button onClick={() => setCond("toujours", !s.conditions.toujours)} style={{
                    display:"flex", alignItems:"center", gap:8, padding:"7px 12px", borderRadius:8, cursor:"pointer",
                    background: s.conditions.toujours ? "rgba(6,182,212,.1)" : "rgba(15,23,42,.7)",
                    border: `1px solid ${s.conditions.toujours ? "rgba(6,182,212,.4)" : "#1e3a5f"}`,
                    color: s.conditions.toujours ? "#06b6d4" : "#475569", fontSize:12, fontWeight:600,
                  }}>
                    <div style={{ width:15, height:15, borderRadius:3, background: s.conditions.toujours ? "#06b6d4" : "transparent", border:`2px solid ${s.conditions.toujours ? "#06b6d4" : "#334155"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff" }}>
                      {s.conditions.toujours ? "✓" : ""}
                    </div>
                    Toujours actif (sans condition sur l'ordre)
                  </button>
                </div>

                {!s.conditions.toujours && (
                  <div style={{ display:"grid", gap:10 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>Montant minimum</div>
                        <Inp type="number" value={s.conditions.montantMin} onChange={e => setCond("montantMin", +e.target.value)} placeholder="0 = sans limite" />
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>Montant maximum</div>
                        <Inp type="number" value={s.conditions.montantMax} onChange={e => setCond("montantMax", +e.target.value)} placeholder="0 = sans limite" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:"#475569", marginBottom:6 }}>Devises concernées (vide = toutes)</div>
                      <div style={{ display:"flex", gap:6 }}>
                        {["EUR","USD","GBP","MAD","CAD"].map(d => (
                          <button key={d} onClick={() => toggleDev(d)} style={{
                            padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                            background: s.conditions.devises.includes(d) ? "rgba(245,158,11,.12)" : "rgba(15,23,42,.7)",
                            border: `1px solid ${s.conditions.devises.includes(d) ? "rgba(245,158,11,.4)" : "#1e3a5f"}`,
                            color: s.conditions.devises.includes(d) ? "#f59e0b" : "#475569",
                          }}>{d}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ONGLET ROUTAGE ── */}
          {tab === "routing" && (
            <>
              <div style={{ padding:"10px 14px", background:"rgba(6,182,212,.04)", border:"1px solid rgba(6,182,212,.1)", borderRadius:10, fontSize:11, color:"#64748b", lineHeight:1.6 }}>
                ℹ Définissez ce qui se passe pour chaque résultat possible de cette étape. Ces règles déterminent le chemin emprunté par l'ordre dans le circuit.
              </div>
              <RoutingEditor step={s} circuit={circuit} onChange={setS} />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 22px", borderTop:"1px solid rgba(30,58,138,.25)" }}>
          <button onClick={() => { if(window.confirm("Supprimer cette étape ?")) { onDelete(s.id); onClose(); }}} style={{ padding:"8px 16px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444" }}>🗑 Supprimer</button>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1e3a5f", color:"#64748b" }}>Annuler</button>
            <button onClick={() => { onSave(s); onClose(); }} style={{ padding:"8px 22px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#0891b2,#0e7490)", border:"none", color:"#fff" }}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SIMULATION — exécution du circuit sur un ordre
// ─────────────────────────────────────────────────────────
function SimulationView({ circuit }) {
  const [resultats, setResultats] = useState({}); // stepId → "POSITIF"|"NEGATIF"|"ALERTE"
  const [currentStepId, setCurrentStepId] = useState(circuit[0]?.id || null);
  const [log, setLog] = useState([{ time:"09:14:00", msg:"Ordre TRF-84729301 soumis — lancement du circuit", color:"#06b6d4" }]);
  const [fini, setFini] = useState(false);

  const addLog = (msg, color="#64748b") => setLog(p => [...p, { time:new Date().toLocaleTimeString("fr-FR"), msg, color }]);

  const simuler = (res) => {
    const step = circuit.find(s => s.id === currentStepId);
    if (!step) return;

    const route = step.routing?.[res];
    const couleur = RC[res];
    addLog(`[${step.nom}] Résultat : ${res}`, couleur);

    if (!route) { addLog("Configuration de routage manquante", "#ef4444"); return; }

    if (route.action === "NEXT") {
      const next = circuit.find(s => s.ordre === step.ordre + 1);
      if (next) {
        setResultats(p => ({ ...p, [step.id]: res }));
        setCurrentStepId(next.id);
        addLog(`→ Passage à : ${next.nom}`, "#06b6d4");
      } else {
        setResultats(p => ({ ...p, [step.id]: res }));
        setCurrentStepId(null);
        setFini(true);
        addLog("✓ Circuit complet — Ordre transmis au Back Office", "#10b981");
      }
    } else if (route.action === "PREVIOUS") {
      const prev = circuit.find(s => s.ordre === step.ordre - 1);
      setResultats(p => ({ ...p, [step.id]: res }));
      if (prev) {
        setCurrentStepId(prev.id);
        addLog(`↩ Retour à : ${prev.nom}`, "#a78bfa");
      } else {
        setFini(true);
        addLog("↩ Retour au saisisseur — aucune étape précédente", "#f59e0b");
      }
    } else if (route.action === "STEP" && route.stepId) {
      const target = circuit.find(s => s.id === route.stepId);
      setResultats(p => ({ ...p, [step.id]: res }));
      if (target) {
        setCurrentStepId(target.id);
        addLog(`⤵ Renvoi vers : ${target.nom}`, "#a78bfa");
      }
    } else if (route.action === "BLOCK") {
      setResultats(p => ({ ...p, [step.id]: res }));
      setCurrentStepId(null);
      setFini(true);
      addLog("✕ Ordre BLOQUÉ — notification au saisisseur", "#ef4444");
    } else if (route.action === "ESCALADE") {
      setResultats(p => ({ ...p, [step.id]: res }));
      setCurrentStepId(null);
      setFini(true);
      addLog("⬆ Escalade vers la Direction — ordre suspendu", "#f59e0b");
    } else if (route.action === "MANUAL") {
      setResultats(p => ({ ...p, [step.id]: res }));
      addLog(`👤 Bascule en validation manuelle : ${step.nom}`, "#06b6d4");
    }
  };

  const reset = () => { setResultats({}); setCurrentStepId(circuit[0]?.id||null); setLog([{ time:"--:--:--", msg:"Simulation réinitialisée", color:"#06b6d4" }]); setFini(false); };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
      {/* Circuit */}
      <div>
        <div style={{ fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:".15em", marginBottom:14 }}>Circuit en cours d'exécution</div>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:19, top:20, bottom:20, width:2, background:"rgba(30,58,138,.3)" }} />

          {/* START */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10, position:"relative", zIndex:1 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(16,185,129,.1)", border:"2px solid rgba(16,185,129,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>✍</div>
            <div style={{ padding:"8px 14px", background:"rgba(16,185,129,.05)", border:"1px solid rgba(16,185,129,.12)", borderRadius:9, flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#10b981" }}>Saisie & AML — Complété</div>
              <div style={{ fontSize:11, color:"#475569" }}>TRF-84729301 · 1 250 000 MAD · SIEMENS MAROC</div>
            </div>
          </div>

          {circuit.map((step) => {
            const isActive = step.id === currentStepId;
            const res = resultats[step.id];
            const tc = TC[step.type];
            const typeInfo = STEP_TYPES.find(t => t.id === step.type);
            const sys = SYSTEMES_TIERS.find(s => s.id === step.systemeTiers);
            const borderCol = res === "POSITIF" ? "#10b981" : res === "NEGATIF" ? "#ef4444" : res === "ALERTE" ? "#f59e0b" : isActive ? "#06b6d4" : "#1e3a5f";

            return (
              <div key={step.id} style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:10, position:"relative", zIndex:1 }}>
                {/* Nœud */}
                <div style={{
                  width:40, height:40, borderRadius:"50%", flexShrink:0,
                  background: res === "POSITIF" ? "rgba(16,185,129,.15)" : res === "NEGATIF" ? "rgba(239,68,68,.15)" : res === "ALERTE" ? "rgba(245,158,11,.15)" : isActive ? "rgba(6,182,212,.15)" : "rgba(30,41,59,.5)",
                  border: `2px solid ${borderCol}55`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800,
                  color: res === "POSITIF" ? "#10b981" : res === "NEGATIF" ? "#ef4444" : res === "ALERTE" ? "#f59e0b" : isActive ? "#06b6d4" : "#334155",
                  boxShadow: isActive ? "0 0 16px rgba(6,182,212,.25)" : "none",
                  animation: isActive ? "pulse 1.5s ease-in-out infinite" : "none",
                }}>
                  {res === "POSITIF" ? "✓" : res === "NEGATIF" ? "✕" : res === "ALERTE" ? "⚠" : step.ordre}
                </div>

                {/* Carte étape */}
                <div style={{
                  flex:1, padding:"12px 16px", borderRadius:11,
                  background: isActive ? "rgba(6,182,212,.06)" : "rgba(11,20,37,.8)",
                  border: `1px solid ${borderCol}${isActive ? "66" : "22"}`,
                  transition:"all .3s",
                }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:700, color: isActive ? "#e2e8f0" : res ? "#94a3b8" : "#64748b" }}>{step.nom}</span>
                      <Tag color={tc.color} bg={tc.bg} border={tc.border}>{typeInfo?.icon} {typeInfo?.label}</Tag>
                    </div>
                    {res && <Tag color={RC[res]}>{res === "POSITIF" ? "✓" : res === "NEGATIF" ? "✕" : "⚠"} {res}</Tag>}
                    {isActive && !res && <Tag color="#06b6d4">● EN COURS</Tag>}
                  </div>

                  {step.description && <div style={{ fontSize:11, color:"#475569", marginBottom:8, fontStyle:"italic" }}>{step.description}</div>}

                  {/* Routing affiché */}
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom: isActive ? 10 : 0 }}>
                    {step.role && <div style={{ fontSize:10, color:"#334155" }}>👤 {step.role}</div>}
                    {step.systemeTiers !== "none" && <div style={{ fontSize:10, color:"#334155" }}>🔗 {sys?.label}</div>}
                    {Object.entries(step.routing||{}).map(([r, route]) => (
                      <div key={r} style={{ fontSize:10, color:"#1e3a5f" }}>
                        <span style={{ color:RC[r], fontWeight:700 }}>{r}</span> → {routingLabel(route.action, route.stepId, circuit)}
                      </div>
                    ))}
                  </div>

                  {/* Boutons de simulation */}
                  {isActive && !fini && (
                    <div style={{ display:"flex", gap:8, marginTop:8 }}>
                      <div style={{ fontSize:11, color:"#334155", alignSelf:"center", marginRight:4 }}>Simuler résultat :</div>
                      {RESULTATS.map(r => (
                        <button key={r.id} onClick={() => simuler(r.id)} style={{
                          padding:"6px 14px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
                          background:`${r.color}12`, border:`1px solid ${r.color}44`, color:r.color,
                        }}>{r.icon} {r.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* END */}
          <div style={{ display:"flex", alignItems:"center", gap:14, position:"relative", zIndex:1 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background: fini && log[log.length-1]?.color === "#10b981" ? "rgba(16,185,129,.12)" : "rgba(6,182,212,.06)", border:`2px solid ${fini && log[log.length-1]?.color === "#10b981" ? "rgba(16,185,129,.3)" : "rgba(6,182,212,.15)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, color: fini ? "#10b981" : "#334155" }}>🚀</div>
            <div style={{ padding:"8px 14px", background:"rgba(6,182,212,.03)", border:"1px solid rgba(6,182,212,.08)", borderRadius:9, flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#334155" }}>Injection Back Office</div>
            </div>
          </div>
        </div>

        {fini && (
          <button onClick={reset} style={{ marginTop:14, padding:"9px 18px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
            ↺ Réinitialiser la simulation
          </button>
        )}
      </div>

      {/* Log temps réel */}
      <div style={{ background:"rgba(5,10,20,.95)", border:"1px solid rgba(30,58,138,.25)", borderRadius:12, padding:16, height:"fit-content", position:"sticky", top:20 }}>
        <div style={{ fontSize:10, color:"#334155", textTransform:"uppercase", letterSpacing:".15em", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s ease-in-out infinite" }} />
          Journal temps réel
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:480, overflowY:"auto" }}>
          {log.map((l, i) => (
            <div key={i} style={{ padding:"7px 10px", background:"rgba(15,23,42,.6)", borderRadius:7, borderLeft:`2px solid ${l.color}` }}>
              <div style={{ fontSize:9, color:"#334155", marginBottom:2 }}>{l.time}</div>
              <div style={{ fontSize:11, color:l.color, lineHeight:1.4 }}>{l.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// APP PRINCIPALE
// ─────────────────────────────────────────────────────────
export default function App() {
  const [circuit, setCircuit] = useState(DEFAULT_CIRCUIT);
  const [view, setView]       = useState("ADMIN");
  const [editing, setEditing] = useState(null);
  const [saved, setSaved]     = useState(false);
  const dragIdx = useRef(null);
  const dragOver = useRef(null);

  const saveStep = (updated) => setCircuit(p => p.map(s => s.id === updated.id ? updated : s));
  const delStep  = (id)     => setCircuit(p => p.filter(s => s.id !== id).map((s,i) => ({ ...s, ordre:i+1 })));
  const addStep  = () => {
    const ns = { id:uid(), ordre:circuit.length+1, nom:"Nouvelle étape", type:"MANUEL", role:"", systemeTiers:"none", approbateurs:1, delaiHeures:24, actif:true, description:"", conditions:{ toujours:true, montantMin:0, montantMax:0, devises:[], surResultatPrecedent:false, resultatsAcceptes:[] }, routing:{ POSITIF:{ action:"NEXT", stepId:null }, NEGATIF:{ action:"PREVIOUS", stepId:null }, ALERTE:{ action:"ESCALADE", stepId:null } }, timeoutAction:"ALERTE" };
    setCircuit(p => [...p, ns]);
    setEditing(ns);
  };

  const onDragStart = (i) => { dragIdx.current = i; };
  const onDragOver  = (e, i) => { e.preventDefault(); dragOver.current = i; };
  const onDrop      = () => {
    if (dragIdx.current === null || dragOver.current === null || dragIdx.current === dragOver.current) return;
    const r = [...circuit];
    const [m] = r.splice(dragIdx.current, 1);
    r.splice(dragOver.current, 0, m);
    setCircuit(r.map((s,i) => ({ ...s, ordre:i+1 })));
    dragIdx.current = null; dragOver.current = null;
  };

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
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .card:hover .edit-hint{opacity:1!important}
      `}</style>

      {editing && <StepModal step={editing} circuit={circuit} onSave={saveStep} onDelete={delStep} onClose={() => setEditing(null)} />}

      {/* HEADER */}
      <div style={{ borderBottom:"1px solid rgba(6,182,212,.1)", background:"rgba(6,182,212,.025)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#0891b2,#0e7490)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:"0 0 18px rgba(8,145,178,.3)" }}>⚡</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#e2e8f0", letterSpacing:1 }}>SWIFT<span style={{ color:"#06b6d4" }}>FLOW</span></div>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, textTransform:"uppercase" }}>Moteur Workflow Conditionnel</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:4, background:"rgba(11,20,37,.8)", border:"1px solid rgba(30,58,138,.3)", borderRadius:10, padding:4 }}>
            {[["ADMIN","⚙ Éditeur"],["SIMUL","▶ Simulation"]].map(([k,l]) => (
              <button key={k} onClick={() => setView(k)} style={tabStyle(k)}>{l}</button>
            ))}
          </div>
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{
            padding:"8px 18px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
            background: saved ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#0891b2,#0e7490)",
            border:"none", color:"#fff",
          }}>{saved ? "✓ Sauvegardé" : "Enregistrer"}</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px" }}>

        {/* ── VUE ADMIN ── */}
        {view === "ADMIN" && (
          <div className="fade">
            {/* Pipeline */}
            <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:0, marginBottom:20, padding:"12px 16px", background:"rgba(11,20,37,.6)", border:"1px solid rgba(30,58,138,.2)", borderRadius:11 }}>
              <div style={{ fontSize:10, color:"#334155", marginRight:10 }}>FLUX :</div>
              <Tag color="#10b981">✍ SAISIE</Tag>
              {circuit.filter(s => s.actif).map((s) => {
                const tc = TC[s.type];
                return (
                  <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
                    <div style={{ width:18, height:1, background:"rgba(30,58,138,.4)" }} />
                    <Tag color={tc.color} bg={tc.bg} border={tc.border}>{STEP_TYPES.find(t=>t.id===s.type)?.icon} {s.nom}</Tag>
                  </div>
                );
              })}
              <div style={{ display:"flex", alignItems:"center" }}>
                <div style={{ width:18, height:1, background:"rgba(30,58,138,.4)" }} />
                <Tag color="#06b6d4">🚀 INJECTION BO</Tag>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#475569" }}>Glissez pour réordonner · Cliquez sur une étape pour la configurer</p>
              <button onClick={addStep} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9, background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Ajouter étape</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {circuit.map((step, i) => {
                const tc = TC[step.type];
                const typeInfo = STEP_TYPES.find(t => t.id === step.type);
                const sys = SYSTEMES_TIERS.find(s => s.id === step.systemeTiers);
                return (
                  <div key={step.id} className="card" draggable onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e,i)} onDrop={onDrop}
                    style={{ display:"grid", gridTemplateColumns:"36px 1fr", background: step.actif ? "rgba(11,20,37,.85)" : "rgba(11,20,37,.4)", border:`1px solid ${step.actif ? tc.border : "rgba(30,41,59,.3)"}`, borderLeft:`3px solid ${step.actif ? tc.color : "#1e293b"}`, borderRadius:12, overflow:"hidden", opacity: step.actif ? 1 : .5 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(6,182,212,.03)", borderRight:"1px solid rgba(30,58,138,.15)", color:"#1e3a5f", cursor:"grab", fontSize:16, userSelect:"none" }}>⠿</div>
                    <div style={{ padding:"13px 16px", cursor:"pointer" }} onClick={() => setEditing(step)}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:22, height:22, borderRadius:"50%", background:`${tc.color}20`, border:`1.5px solid ${tc.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:tc.color }}>{step.ordre}</div>
                          <span style={{ fontSize:13, fontWeight:700, color: step.actif ? "#e2e8f0" : "#475569" }}>{step.nom}</span>
                          <Tag color={tc.color} bg={tc.bg} border={tc.border}>{typeInfo?.icon} {typeInfo?.label}</Tag>
                          {step.systemeTiers !== "none" && <Tag color="#64748b">🔗 {sys?.label}</Tag>}
                          {!step.actif && <Tag color="#334155">INACTIF</Tag>}
                        </div>
                        <span className="edit-hint" style={{ fontSize:11, color:"#06b6d4", opacity:0, transition:"opacity .2s", padding:"3px 8px", borderRadius:6, background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.15)" }}>✏ Configurer</span>
                      </div>
                      {step.description && <div style={{ fontSize:11, color:"#475569", fontStyle:"italic", marginBottom:8 }}>{step.description}</div>}

                      {/* Routage résumé */}
                      <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                        {step.conditions.surResultatPrecedent && (
                          <div style={{ fontSize:10, padding:"2px 8px", borderRadius:6, background:"rgba(6,182,212,.06)", border:"1px solid rgba(6,182,212,.12)", color:"#06b6d4" }}>
                            🔗 Si précédent : {step.conditions.resultatsAcceptes.join(" ou ") || "—"}
                          </div>
                        )}
                        {Object.entries(step.routing||{}).map(([r, route]) => (
                          <div key={r} style={{ fontSize:10, color:"#1e3a5f" }}>
                            <span style={{ color:RC[r], fontWeight:700 }}>{r}</span> <span style={{ color:"#334155" }}>→</span> <span style={{ color:"#475569" }}>{routingLabel(route.action, route.stepId, circuit)}</span>
                          </div>
                        ))}
                        <div style={{ fontSize:10, color:"#1e3a5f" }}>⏱ {step.delaiHeures}h</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VUE SIMULATION ── */}
        {view === "SIMUL" && (
          <div className="fade">
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#e2e8f0" }}>Simulation interactive</h2>
              <p style={{ fontSize:12, color:"#475569", marginTop:3 }}>Simulez le résultat de chaque étape et observez le routage conditionnel en temps réel</p>
            </div>
            <SimulationView circuit={circuit.filter(s => s.actif)} />
          </div>
        )}
      </div>
    </div>
  );
}
