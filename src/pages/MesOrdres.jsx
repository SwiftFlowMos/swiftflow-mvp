import { useState, useEffect } from "react";
import { API_URL, getToken } from "../config.js";

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const ONGLETS = [
  { id:"TOUS",     label:"Tous",        icon:"📋", color:"#06b6d4", statuses:["DRAFT","RETURNED","APPROVED","REJECTED","BLOCKED","PENDING_CONFORMITE","PENDING_VALIDEUR_N1","PENDING_VALIDEUR_N2","PENDING_VALIDATION","PENDING_REGLEMENTAIRE"] },
  { id:"DRAFT",    label:"Brouillons",  icon:"📝", color:"#64748b", statuses:["DRAFT"] },
  { id:"RETURNED", label:"Retournes",   icon:"↩",  color:"#a78bfa", statuses:["RETURNED"] },
  { id:"APPROVED", label:"Approuves",   icon:"✅", color:"#10b981", statuses:["APPROVED"] },
  { id:"REJECTED", label:"Rejetes",     icon:"✕",  color:"#ef4444", statuses:["REJECTED","BLOCKED"] },
];

const STATUS_LABELS = {
  DRAFT:"Brouillon", RETURNED:"Retourne", APPROVED:"Approuve",
  REJECTED:"Rejete", BLOCKED:"Bloque AML",
  PENDING_CONFORMITE:"Attente Conformite",
  PENDING_VALIDEUR_N1:"Attente Valideur N1",
  PENDING_VALIDEUR_N2:"Attente Valideur N2",
  PENDING_VALIDATION:"En validation",
};

function fmt(amount, currency) {
  return parseFloat(amount||0).toLocaleString("fr-FR") + " " + (currency||"");
}

// ─────────────────────────────────────────────────────────
// BADGE STATUT
// ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    DRAFT:    { c:"#64748b", bg:"rgba(100,116,139,.1)", b:"rgba(100,116,139,.25)" },
    RETURNED: { c:"#a78bfa", bg:"rgba(167,139,250,.1)", b:"rgba(167,139,250,.25)" },
    APPROVED: { c:"#10b981", bg:"rgba(16,185,129,.1)",  b:"rgba(16,185,129,.25)"  },
    REJECTED: { c:"#ef4444", bg:"rgba(239,68,68,.1)",   b:"rgba(239,68,68,.25)"   },
    BLOCKED:  { c:"#ef4444", bg:"rgba(239,68,68,.1)",   b:"rgba(239,68,68,.25)"   },
  };
  const s = colors[status] || { c:"#06b6d4", bg:"rgba(6,182,212,.1)", b:"rgba(6,182,212,.25)" };
  return (
    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700, background:s.bg, border:"1px solid "+s.b, color:s.c }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// DETAIL EN LECTURE SEULE
// ─────────────────────────────────────────────────────────
function OrderDetail({ order, onClose }) {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:10, color:"#06b6d4", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8, paddingBottom:4, borderBottom:"1px solid rgba(6,182,212,.15)" }}>{title}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>{children}</div>
    </div>
  );
  const Field = ({ label, value }) => (
    <div>
      <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:12, color:"#C8D8EA", fontFamily:"monospace" }}>{value || "—"}</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(4,8,18,.9)", backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px", overflowY:"auto" }}>
      <div style={{ width:"100%", maxWidth:760, background:"#0C1628", border:"1px solid rgba(6,182,212,.2)", borderRadius:16, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,.7)" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 22px", borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(6,182,212,.03)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <StatusBadge status={order.status} />
            <span style={{ fontSize:14, fontWeight:700, color:"#06b6d4", fontFamily:"monospace" }}>{order.reference}</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>✕</button>
        </div>

        <div style={{ padding:22, display:"flex", flexDirection:"column", gap:4 }}>
          <Section title="Nature du transfert">
            <Field label="Categorie" value={order.categorie} />
            <Field label="Type" value={order.typeTransfert} />
            {order.domRef && <Field label="Domiciliation" value={order.domRef} />}
            {order.domBanque && <Field label="Banque domiciliataire" value={order.domBanque} />}
          </Section>
          <Section title="Donneur d ordre">
            <Field label="Agence" value={order.agenceCode} />
            <Field label="Reference client" value={order.clientRef} />
            <Field label="Nom client" value={order.clientNom} />
            <Field label="Numero de compte" value={order.compteNum} />
            <Field label="Devise compte" value={order.compteDevise} />
            <Field label="Plafond" value={order.plafond ? parseFloat(order.plafond).toLocaleString("fr-FR") : null} />
          </Section>
          <Section title="Montant & Devise">
            <Field label="Montant" value={fmt(order.amount, order.currency)} />
            <Field label="Date de valeur" value={order.valueDate ? new Date(order.valueDate).toLocaleDateString("fr-FR") : null} />
            <Field label="Type de cours" value={order.typeCours} />
            <Field label="Cours de change" value={order.coursChange} />
            <Field label="Motif" value={order.motif} />
            <Field label="Code motif" value={order.codeMotif} />
          </Section>
          <Section title="Beneficiaire">
            <Field label="Nom" value={order.beneName} />
            <Field label="Pays" value={order.beneCountry} />
            <Field label="IBAN / Compte" value={order.beneIBAN} />
            <Field label="BIC banque" value={order.beneBIC} />
            <Field label="Nom banque" value={order.beneBankName} />
          </Section>
          <Section title="Details paiement">
            <Field label="Reference client" value={order.referenceClient} />
            <Field label="Frais" value={order.charges} />
            <Field label="Correspondant" value={order.correspondentBIC} />
            <Field label="Incoterm" value={order.incoterm} />
            <Field label="Libelle SWIFT" value={order.details} />
          </Section>

          {/* Piste d'audit */}
          {order.auditLogs && order.auditLogs.length > 0 && (
            <div>
              <div style={{ fontSize:10, color:"#06b6d4", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8, paddingBottom:4, borderBottom:"1px solid rgba(6,182,212,.15)" }}>Historique & Piste d'audit</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {order.auditLogs.map((a, i) => (
                  <div key={i} style={{ display:"flex", gap:10, padding:"8px 12px", background:"rgba(255,255,255,.03)", borderRadius:8, borderLeft:"2px solid rgba(6,182,212,.3)" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:2 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#C8D8EA" }}>{a.actorName || "Systeme"}</span>
                        <span style={{ fontSize:10, color:"#3E5470" }}>{a.createdAt ? new Date(a.createdAt).toLocaleString("fr-FR") : ""}</span>
                        <span style={{ fontSize:10, color:"#06b6d4", fontWeight:700 }}>{a.action}</span>
                      </div>
                      {a.comment && <div style={{ fontSize:11, color:"#64748b", fontStyle:"italic" }}>"{a.comment}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commentaire retour valideur */}
          {order.status === "RETURNED" && order.auditLogs && (
            <div style={{ padding:"12px 14px", background:"rgba(167,139,250,.07)", border:"1px solid rgba(167,139,250,.25)", borderRadius:8 }}>
              <div style={{ fontSize:10, color:"#a78bfa", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Motif du retour</div>
              <div style={{ fontSize:12, color:"#C8D8EA" }}>
                {order.auditLogs.filter(a => a.action === "RETURNED" || a.action?.includes("RETURN")).slice(-1)[0]?.comment || "Voir piste d'audit"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MODALE CONFIRMATION SUPPRESSION
// ─────────────────────────────────────────────────────────
function ConfirmDelete({ order, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(4,8,18,.9)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420, background:"#0C1628", border:"1px solid rgba(239,68,68,.3)", borderRadius:14, padding:24, boxShadow:"0 40px 80px rgba(0,0,0,.7)" }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#E2EAF2", marginBottom:8 }}>Supprimer l'ordre ?</div>
        <div style={{ fontSize:12, color:"#7A8BA0", marginBottom:20 }}>
          L'ordre <span style={{ color:"#06b6d4", fontFamily:"monospace" }}>{order.reference}</span> sera supprime definitivement. Cette action est irreversible.
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, cursor:"pointer", background:"rgba(30,41,59,.5)", border:"1px solid #1D3250", color:"#7A8BA0" }}>Annuler</button>
          <button onClick={onConfirm} style={{ padding:"8px 18px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#dc2626,#b91c1c)", border:"none", color:"#fff" }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MODULE PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function MesOrdres({ onEditOrder }) {
const [onglet, setOnglet] = useState("TOUS");
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [selected, setSelected] = useState(null);
const [toDelete, setToDelete] = useState(null);
const [search, setSearch] = useState("");
const [msg, setMsg] = useState(null);

// Critères de recherche multi
const [criteres, setCriteres] = useState({
  dateDebut:   "",
  dateFin:     "",
  valeurDebut: "",
  valeurFin:   "",
  reference:   "",
  donneur:     "",
  beneficiaire:"",
  devise:      "",
});
const setCrit = (k, v) => setCriteres(p => ({ ...p, [k]: v }));
const [showCriteres, setShowCriteres] = useState(false);

  const currentOnglet = ONGLETS.find(o => o.id === onglet);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const statuses = currentOnglet?.statuses.join(",") || "DRAFT";
      const res = await fetch(`${API_URL}/payments/mine?status=${statuses}`, {
        headers: { "Authorization": `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch(e) {
      console.error("Erreur chargement:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [onglet]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/payments/${toDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setMsg({ type:"success", text:"Ordre supprime avec succes" });
        setToDelete(null);
        loadOrders();
        setTimeout(() => setMsg(null), 3000);
      } else {
        const d = await res.json();
        setMsg({ type:"error", text: d.message || "Erreur lors de la suppression" });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch(e) {
      setMsg({ type:"error", text:"Erreur de connexion" });
      setTimeout(() => setMsg(null), 3000);
    }
    setToDelete(null);
  };

  const handleSubmit = async (order) => {
    try {
      const res = await fetch(`${API_URL}/payments/${order.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,
        },
      });
      if (res.ok) {
        setMsg({ type:"success", text:"Ordre soumis au circuit de validation !" });
        loadOrders();
        setTimeout(() => setMsg(null), 3000);
      } else {
        const d = await res.json();
        setMsg({ type:"error", text: d.message || "Erreur lors de la soumission" });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch(e) {
      setMsg({ type:"error", text:"Erreur de connexion" });
      setTimeout(() => setMsg(null), 3000);
    }
  };

const filtered = orders.filter(o => {
  // Recherche simple
  if (search && !(
    (o.reference||"").toLowerCase().includes(search.toLowerCase()) ||
    (o.beneName||"").toLowerCase().includes(search.toLowerCase()) ||
    (o.clientNom||"").toLowerCase().includes(search.toLowerCase())
  )) return false;

  // Critères avancés
  if (criteres.reference    && !(o.reference||"").toLowerCase().includes(criteres.reference.toLowerCase())) return false;
  if (criteres.donneur      && !(o.clientNom||"").toLowerCase().includes(criteres.donneur.toLowerCase())) return false;
  if (criteres.beneficiaire && !(o.beneName||"").toLowerCase().includes(criteres.beneficiaire.toLowerCase())) return false;
  if (criteres.devise       && (o.currency||"").toUpperCase() !== criteres.devise.toUpperCase()) return false;
  if (criteres.dateDebut    && new Date(o.createdAt) < new Date(criteres.dateDebut)) return false;
  if (criteres.dateFin      && new Date(o.createdAt) > new Date(criteres.dateFin+"T23:59:59")) return false;
  if (criteres.valeurDebut  && o.valueDate && new Date(o.valueDate) < new Date(criteres.valeurDebut)) return false;
  if (criteres.valeurFin    && o.valueDate && new Date(o.valueDate) > new Date(criteres.valeurFin+"T23:59:59")) return false;

  return true;
});

const hasCriteres = Object.values(criteres).some(v => v !== "");
const resetCriteres = () => setCriteres({ dateDebut:"", dateFin:"", valeurDebut:"", valeurFin:"", reference:"", donneur:"", beneficiaire:"", devise:"" });

  const canEdit   = (o) => o.status === "DRAFT" || o.status === "RETURNED";
  const canSubmit = (o) => o.status === "DRAFT" || o.status === "RETURNED";
  const canDelete = (o) => o.status === "DRAFT";

  return (
    <div style={{ fontFamily:"'JetBrains Mono','Courier New',monospace", color:"#C8D8EA", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050C1A}::-webkit-scrollbar-thumb{background:#1D3250;border-radius:2px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Message flash */}
      {msg && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:99999, padding:"12px 20px", borderRadius:10, fontSize:12, fontWeight:700,
          background: msg.type==="success" ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)",
          border: `1px solid ${msg.type==="success" ? "rgba(16,185,129,.4)" : "rgba(239,68,68,.4)"}`,
          color: msg.type==="success" ? "#10b981" : "#ef4444",
          boxShadow:"0 10px 30px rgba(0,0,0,.5)" }}>
          {msg.type==="success" ? "✓" : "✕"} {msg.text}
        </div>
      )}

      {/* Modales */}
      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
      {toDelete && <ConfirmDelete order={toDelete} onConfirm={handleDelete} onCancel={() => setToDelete(null)} />}

{/* Header */}
<div style={{ background:"rgba(5,12,26,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"12px 28px", position:"sticky", top:0, zIndex:100 }}>
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: showCriteres ? 12 : 0 }}>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontSize:16 }}>📂</span>
      <span style={{ fontSize:14, fontWeight:700, color:"#E2EAF2", fontFamily:"'Space Grotesk',sans-serif" }}>Mes Ordres</span>
    </div>
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Recherche rapide..."
        style={{ background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"6px 14px", fontSize:12, color:"#C8D8EA", fontFamily:"monospace", outline:"none", width:220 }} />
      <button onClick={() => setShowCriteres(v => !v)} style={{
        padding:"6px 14px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
        background: showCriteres || hasCriteres ? "rgba(6,182,212,.15)" : "rgba(30,41,59,.5)",
        border: "1px solid " + (showCriteres || hasCriteres ? "rgba(6,182,212,.4)" : "#1D3250"),
        color: showCriteres || hasCriteres ? "#06b6d4" : "#7A8BA0",
      }}>
        ⚙ Filtres {hasCriteres ? "●" : ""}
      </button>
      {hasCriteres && (
        <button onClick={resetCriteres} style={{ padding:"6px 12px", borderRadius:8, fontSize:11, cursor:"pointer", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444" }}>
          ✕ Reinitialiser
        </button>
      )}
    </div>
  </div>

  {/* Bloc critères avancés */}
  {showCriteres && (
    <div style={{ background:"rgba(8,15,28,.9)", border:"1px solid rgba(6,182,212,.15)", borderRadius:10, padding:"14px 16px", marginTop:4 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Date saisie — Du</div>
          <input type="date" value={criteres.dateDebut} onChange={e => setCrit("dateDebut", e.target.value)}
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none", colorScheme:"dark" }} />
        </div>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Date saisie — Au</div>
          <input type="date" value={criteres.dateFin} onChange={e => setCrit("dateFin", e.target.value)}
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none", colorScheme:"dark" }} />
        </div>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Date valeur — Du</div>
          <input type="date" value={criteres.valeurDebut} onChange={e => setCrit("valeurDebut", e.target.value)}
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none", colorScheme:"dark" }} />
        </div>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Date valeur — Au</div>
          <input type="date" value={criteres.valeurFin} onChange={e => setCrit("valeurFin", e.target.value)}
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none", colorScheme:"dark" }} />
        </div>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Reference</div>
          <input value={criteres.reference} onChange={e => setCrit("reference", e.target.value)} placeholder="TRF-2026-..."
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
        </div>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Donneur d ordre</div>
          <input value={criteres.donneur} onChange={e => setCrit("donneur", e.target.value)} placeholder="Nom du client..."
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
        </div>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Beneficiaire</div>
          <input value={criteres.beneficiaire} onChange={e => setCrit("beneficiaire", e.target.value)} placeholder="Nom beneficiaire..."
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
        </div>
        <div>
          <div style={{ fontSize:9, color:"#3E5470", textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Devise</div>
          <select value={criteres.devise} onChange={e => setCrit("devise", e.target.value)}
            style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1px solid #1D3250", borderRadius:7, padding:"6px 10px", fontSize:11, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }}>
            <option value="">Toutes</option>
            {["MAD","EUR","USD","GBP","CAD","CHF","AED"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginTop:8, fontSize:10, color:"#3E5470", textAlign:"right" }}>{filtered.length} ordre(s) correspondent aux criteres</div>
    </div>
  )}
</div>

        {/* Contenu */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#3E5470", fontSize:13 }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#3E5470" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>{currentOnglet?.icon}</div>
            <div style={{ fontSize:13 }}>Aucun ordre {currentOnglet?.label.toLowerCase()}</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map((order, i) => (
              <div key={order.id} style={{
                background:"rgba(8,15,28,.8)", border:"1px solid rgba(255,255,255,.06)",
                borderRadius:12, padding:"14px 18px",
                borderLeft:"3px solid "+(currentOnglet?.color||"#06b6d4"),
                transition:"all .15s",
              }}>
                {/* Ligne principale */}
                <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 160px auto", gap:12, alignItems:"center", marginBottom: canEdit(order) ? 10 : 0 }}>
                  <div style={{ fontSize:12, color:"#06b6d4", fontWeight:700, fontFamily:"monospace" }}>{order.reference}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#E2EAF2" }}>{order.beneName || "—"}</div>
                    <div style={{ fontSize:10, color:"#3E5470", marginTop:2 }}>
                      {order.clientNom || ""} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : ""}
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#E2EAF2" }}>{fmt(order.amount, order.currency)}</div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Commentaire retour valideur */}
                {order.status === "RETURNED" && order.auditLogs && (
                  <div style={{ marginBottom:10, padding:"8px 12px", background:"rgba(167,139,250,.07)", border:"1px solid rgba(167,139,250,.2)", borderRadius:7, fontSize:11, color:"#a78bfa" }}>
                    ↩ Motif du retour : {order.auditLogs.filter(a => a.action?.includes("RETURN")).slice(-1)[0]?.comment || "Voir historique"}
                  </div>
                )}

                {/* Boutons d'action */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button onClick={() => setSelected(order)} style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4" }}>
                    👁 Detail
                  </button>
                  {canEdit(order) && (
                    <button onClick={() => onEditOrder && onEditOrder(order)} style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", color:"#f59e0b" }}>
                      ✏ Modifier
                    </button>
                  )}
                  {canSubmit(order) && (
                    <button onClick={() => handleSubmit(order)} style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.2)", color:"#10b981" }}>
                      ▶ Soumettre
                    </button>
                  )}
                  {canDelete(order) && (
                    <button onClick={() => setToDelete(order)} style={{ padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", color:"#ef4444" }}>
                      🗑 Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
