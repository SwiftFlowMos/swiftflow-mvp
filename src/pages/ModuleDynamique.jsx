import { useState } from "react";
import { API_URL, getToken } from "../config.js";

// ─────────────────────────────────────────────────────────
// MAPPING ÉVÉNEMENTS → COMPOSANTS
// Clé : MODULECODE_TYPECODE_EVENTCODE
// ─────────────────────────────────────────────────────────
const COMPOSANTS_EVENEMENTS = {
  // VIREMENTS
  'VIREMENTS_EMIS_SAISIE':              null, // injecté depuis App.jsx
  'VIREMENTS_EMIS_MODIFICATION':        null, // à implémenter
  'VIREMENTS_EMIS_ANNULATION':          null, // à implémenter
  'VIREMENTS_RECUS_RAPATRIEMENT':       null, // à implémenter
  // CREDOC
  'CREDOC_IMPORT_OUVERTURE':            null, // à implémenter
  'CREDOC_EXPORT_OUVERTURE':            null, // à implémenter
  // REMDOC
  'REMDOC_IMPORT_OUVERTURE':            null, // à implémenter
  'REMDOC_EXPORT_OUVERTURE':            null, // à implémenter
  // FINANCEMENT
  'FINANCEMENT_FIN_IMP_MAD_MISE_EN_PLACE': null, // à implémenter
  // GARANTIES
  'GARANTIES_EMISES_CREATION':          null, // à implémenter
  'GARANTIES_RECUES_CREATION':          null, // à implémenter
  'VIREMENTS_EMIS_MES_ORDRES': null, // injecté depuis App.jsx
};

const STATUS_EVENEMENT = {
  'SAISIE':           { icon:"✍",  color:"#0891b2", desc:"Saisir un nouvel ordre" },
  'MODIFICATION':     { icon:"✏",  color:"#f59e0b", desc:"Modifier un ordre existant" },
  'ANNULATION':       { icon:"✕",  color:"#ef4444", desc:"Annuler un ordre" },
  'RAPATRIEMENT':     { icon:"↩",  color:"#10b981", desc:"Rapatrier des fonds" },
  'OUVERTURE':        { icon:"📂", color:"#7c3aed", desc:"Ouvrir un nouveau dossier" },
  'REALISATION':      { icon:"✅", color:"#10b981", desc:"Realiser le dossier" },
  'PAIEMENT':         { icon:"💳", color:"#0891b2", desc:"Effectuer un paiement" },
  'MISE_EN_PLACE':    { icon:"🏦", color:"#d97706", desc:"Mettre en place le financement" },
  'REMBOURSEMENT':    { icon:"↩",  color:"#10b981", desc:"Rembourser le financement" },
  'CREATION':         { icon:"➕", color:"#7c3aed", desc:"Creer une garantie" },
  'MISE_EN_JEU':      { icon:"⚡", color:"#ef4444", desc:"Mettre en jeu la garantie" },
  'MAIN_LEVEE':       { icon:"🔓", color:"#10b981", desc:"Lever la garantie" },
  'MES_ORDRES': { icon:"📂", color:"#F59E0B", desc:"Consulter et gerer mes ordres" },
};

export default function ModuleDynamique({ module, composants = {}, onEditOrder, onSaved }) {
  const [activeType, setActiveType] = useState(module?.types?.[0]?.code || null);
  const [activeEvent, setActiveEvent] = useState(null);

  if (!module) return null;

  const currentType = module.types?.find(t => t.code === activeType);
  const eventKey = activeEvent ? `${module.code}_${activeType}_${activeEvent.code}` : null;
  console.log('eventKey:', eventKey, 'composants keys:', Object.keys(composants||{}));
const EventComposant = eventKey ? (composants[eventKey] || COMPOSANTS_EVENEMENTS[eventKey]) : null;

  // Si un événement est sélectionné et a un composant
  if (activeEvent && EventComposant) {
    return (
      <div>
        {/* Breadcrumb */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", background:"rgba(6,182,212,.03)", borderBottom:"1px solid rgba(255,255,255,.06)", fontSize:11, color:"#3E5470" }}>
          <span style={{ cursor:"pointer", color:"#06b6d4" }} onClick={() => setActiveEvent(null)}>
            {module.icone} {module.nom}
          </span>
          <span>›</span>
          <span style={{ cursor:"pointer", color:"#06b6d4" }} onClick={() => setActiveEvent(null)}>
            {currentType?.nom}
          </span>
          <span>›</span>
          <span style={{ color:"#E2EAF2", fontWeight:700 }}>{activeEvent.nom}</span>
          <button onClick={() => setActiveEvent(null)} style={{ marginLeft:"auto", padding:"4px 10px", borderRadius:6, fontSize:10, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>
            ← Retour
          </button>
        </div>
        <EventComposant onEditOrder={onEditOrder} onSaved={() => { setActiveEvent(null); if(onSaved) onSaved(); }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace", color:"#C8D8EA", minHeight:"100vh" }}>

      {/* Header module */}
      <div style={{ background:"rgba(5,12,26,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"14px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>{module.icone}</span>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>{module.nom}</div>
            <div style={{ fontSize:10, color:"#3E5470" }}>{module.types?.length} type(s) · {module.types?.reduce((acc, t) => acc + (t.evenements?.length || 0), 0)} evenement(s)</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px" }}>

        {/* Onglets types */}
        <div style={{ display:"flex", gap:8, marginBottom:24, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          {module.types?.map(t => (
            <button key={t.code} onClick={() => { setActiveType(t.code); setActiveEvent(null); }}
              style={{ padding:"8px 18px", borderRadius:"8px 8px 0 0", fontSize:12, fontWeight:700, cursor:"pointer", border:"none",
                background: activeType===t.code ? "rgba(8,15,28,.9)" : "transparent",
                color: activeType===t.code ? (module.couleur || "#06b6d4") : "#3E5470",
                borderBottom: activeType===t.code ? `2px solid ${module.couleur || "#06b6d4"}` : "2px solid transparent" }}>
              {t.nom}
              <span style={{ marginLeft:6, fontSize:10, padding:"1px 6px", borderRadius:10,
                background: activeType===t.code ? (module.couleur || "#06b6d4") + "20" : "transparent",
                color: activeType===t.code ? (module.couleur || "#06b6d4") : "#3E5470" }}>
                {t.evenements?.length}
              </span>
            </button>
          ))}
        </div>

        {/* Événements du type actif */}
        {currentType && (
          <div>
            <div style={{ fontSize:11, color:"#3E5470", marginBottom:16 }}>
              Selectionnez un evenement pour commencer
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {currentType.evenements?.map(e => {
                const key = `${module.code}_${activeType}_${e.code}`;
                const comp = composants[key] || COMPOSANTS_EVENEMENTS[key];
                const meta = STATUS_EVENEMENT[e.code] || { icon:"📋", color:"#64748b", desc:"" };
                const disponible = !!comp;

                return (
                  <div key={e.code}
                    onClick={() => disponible ? setActiveEvent(e) : null}
                    style={{
                      background: disponible ? "rgba(8,15,28,.8)" : "rgba(8,15,28,.4)",
                      border: `1px solid ${disponible ? meta.color + "40" : "rgba(255,255,255,.04)"}`,
                      borderRadius:12, padding:"18px 20px",
                      cursor: disponible ? "pointer" : "not-allowed",
                      borderLeft: `3px solid ${disponible ? meta.color : "#1D3250"}`,
                      opacity: disponible ? 1 : 0.5,
                      transition:"all .15s",
                    }}
                    onMouseEnter={e => disponible && (e.currentTarget.style.background = "rgba(6,182,212,.05)")}
                    onMouseLeave={e => disponible && (e.currentTarget.style.background = "rgba(8,15,28,.8)")}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:22 }}>{meta.icon}</span>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color: disponible ? "#E2EAF2" : "#475569" }}>{e.nom}</div>
                        <div style={{ fontSize:10, color: disponible ? meta.color : "#334155" }}>{meta.desc}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {e.peutInitier  && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(16,185,129,.1)", color:"#10b981", border:"1px solid rgba(16,185,129,.2)" }}>Initier</span>}
                      {e.peutValider  && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(6,182,212,.1)", color:"#06b6d4", border:"1px solid rgba(6,182,212,.2)" }}>Valider</span>}
                      {e.peutModifier && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(245,158,11,.1)", color:"#f59e0b", border:"1px solid rgba(245,158,11,.2)" }}>Modifier</span>}
                      {e.peutAnnuler  && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(239,68,68,.1)", color:"#ef4444", border:"1px solid rgba(239,68,68,.2)" }}>Annuler</span>}
                      {!disponible && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"rgba(100,116,139,.1)", color:"#64748b", border:"1px solid rgba(100,116,139,.2)" }}>En developpement</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
