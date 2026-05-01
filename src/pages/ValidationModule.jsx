import { useState, useEffect } from "react";

import { API_URL, getToken } from '../config.js';
// ─────────────────────────────────────────



// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const STATUS_MAP = {
  EN_ATTENTE_N1:       { label: "Attente N1",      color: "#f59e0b", bg: "rgba(245,158,11,.1)",  border: "rgba(245,158,11,.25)",  icon: "⏳" },
  EN_ATTENTE_N2:       { label: "Attente N2",       color: "#06b6d4", bg: "rgba(6,182,212,.1)",   border: "rgba(6,182,212,.25)",   icon: "🔄" },
  APPROUVÉ:            { label: "Approuvé",         color: "#10b981", bg: "rgba(16,185,129,.1)",  border: "rgba(16,185,129,.25)",  icon: "✅" },
  REJETÉ:              { label: "Rejeté",           color: "#ef4444", bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.25)",   icon: "✕" },
  RETOURNÉ:            { label: "Retourné",         color: "#a78bfa", bg: "rgba(167,139,250,.1)", border: "rgba(167,139,250,.25)", icon: "↩" },
  INJECTÉ:             { label: "Injecté BO",       color: "#34d399", bg: "rgba(52,211,153,.1)",  border: "rgba(52,211,153,.25)",  icon: "🚀" },
  PENDING_CONFORMITE:  { label: "Attente Conformité",color: "#f59e0b", bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.25)",  icon: "⏳" },
  PENDING_VALIDEUR_N1: { label: "Attente Valideur N1",color:"#f59e0b", bg:"rgba(245,158,11,.1)",  border:"rgba(245,158,11,.25)",   icon: "⏳" },
  PENDING_VALIDEUR_N2: { label: "Attente Valideur N2",color:"#06b6d4", bg:"rgba(6,182,212,.1)",   border:"rgba(6,182,212,.25)",    icon: "🔄" },
  PENDING_VALIDATION:  { label: "En validation",    color: "#f59e0b", bg: "rgba(245,158,11,.1)",  border: "rgba(245,158,11,.25)",  icon: "⏳" },
  PENDING_REGLEMENTAIRE:{ label: "Attente Réglementaire",color:"#8b5cf6",bg:"rgba(139,92,246,.1)",border:"rgba(139,92,246,.25)",  icon: "📋" },
  APPROVED:            { label: "Approuvé",         color: "#10b981", bg: "rgba(16,185,129,.1)",  border: "rgba(16,185,129,.25)",  icon: "✅" },
  REJECTED:            { label: "Rejeté",           color: "#ef4444", bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.25)",   icon: "✕" },
  RETURNED:            { label: "Retourné",         color: "#a78bfa", bg: "rgba(167,139,250,.1)", border: "rgba(167,139,250,.25)", icon: "↩" },
  BLOCKED:             { label: "Bloqué AML",       color: "#ef4444", bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.25)",   icon: "🚫" },
  DRAFT:               { label: "Brouillon",        color: "#64748b", bg: "rgba(100,116,139,.1)", border: "rgba(100,116,139,.25)", icon: "📝" },
};
const ACTION_MAP = {
  CRÉÉ:          { color: "#64748b", icon: "✍" },
  AML_OK:        { color: "#10b981", icon: "🛡" },
  AML_ALERTE:    { color: "#f59e0b", icon: "⚠" },
  APPROUVÉ_N1:   { color: "#10b981", icon: "✓" },
  APPROUVÉ_N2:   { color: "#34d399", icon: "✓✓" },
  REJETÉ:        { color: "#ef4444", icon: "✕" },
  RETOURNÉ:      { color: "#a78bfa", icon: "↩" },
  DÉLÉGUÉ:       { color: "#06b6d4", icon: "👤" },
};
const fmt = (n, cur) => `${parseFloat(n).toLocaleString("fr-FR")} ${cur}`;
const canAct = (o) => [
  "EN_ATTENTE_N1", "EN_ATTENTE_N2",
  "PENDING_CONFORMITE", "PENDING_VALIDEUR_N1", "PENDING_VALIDEUR_N2",
  "PENDING_VALIDATION", "PENDING_REGLEMENTAIRE",
].includes(o.status);

// ─────────────────────────────────────────
// COMPOSANTS UI
// ─────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.EN_ATTENTE_N1;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      letterSpacing: ".04em",
    }}>{s.icon} {s.label}</span>
  );
}

function AmlBadge({ status }) {
  const ok = status === "VALIDÉ";
  const warn = status === "ALERTE";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: ok ? "rgba(16,185,129,.08)" : warn ? "rgba(245,158,11,.08)" : "rgba(239,68,68,.08)",
      border: `1px solid ${ok ? "rgba(16,185,129,.25)" : warn ? "rgba(245,158,11,.25)" : "rgba(239,68,68,.25)"}`,
      color: ok ? "#10b981" : warn ? "#f59e0b" : "#ef4444",
    }}>{ok ? "✓" : warn ? "⚠" : "✕"} {status}</span>
  );
}

function Avatar({ name, size = 32 }) {
  const safeName = name || 'NA';
  const initials = safeName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#0891b2","#7c3aed","#059669","#d97706","#dc2626"];
  const color = colors[safeName.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}22`, border: `1.5px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color,
    }}>{initials}</div>
  );
}

// ─────────────────────────────────────────
// MODALE DÉTAIL / ACTION
// ─────────────────────────────────────────
function OrderModal({ order, onClose, onAction }) {
  const [action, setAction] = useState(null); // "APPROUVER"|"REJETER"|"RETOURNER"|"DÉLÉGUER"
  const [comment, setComment] = useState("");
  const [delegate, setDelegate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!comment.trim() && action !== "APPROUVER") return;
    setSubmitted(true);
    setTimeout(() => {
      onAction(order.id, action, comment, delegate);
      onClose();
    }, 800);
  };

  const actionBtns = [
    { key: "APPROUVER", label: "Approuver",  icon: "✓", color: "#10b981", bg: "rgba(16,185,129,.12)", border: "rgba(16,185,129,.3)" },
    { key: "RETOURNER", label: "Retourner",  icon: "↩", color: "#a78bfa", bg: "rgba(167,139,250,.1)", border: "rgba(167,139,250,.3)" },
    { key: "REJETER",   label: "Rejeter",    icon: "✕", color: "#ef4444", bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.3)" },
    { key: "DÉLÉGUER",  label: "Déléguer",   icon: "👤", color: "#06b6d4", bg: "rgba(6,182,212,.1)",  border: "rgba(6,182,212,.3)" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(4,8,18,.88)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "24px 16px", overflowY: "auto",
    }}>
      <div style={{
        width: "100%", maxWidth: 760,
        background: "linear-gradient(160deg,#0d1b2e,#091422)",
        border: "1px solid rgba(6,182,212,.18)", borderRadius: 18,
        boxShadow: "0 40px 80px rgba(0,0,0,.7)",
        overflow: "hidden",
      }}>
        {/* Header modal */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid rgba(30,58,138,.3)",
          background: "rgba(6,182,212,.03)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StatusBadge status={order.status} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#06b6d4", letterSpacing: 1, fontFamily: "monospace" }}>{order.id}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 22 }}>✕</button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Résumé ordre */}
          <div style={{
            background: "rgba(11,20,37,.8)", border: "1px solid rgba(30,58,138,.25)",
            borderRadius: 12, padding: 18,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" }}>
                  {order.symbol}{fmt(order.amount, order.currency)}
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Date valeur : <span style={{ color: "#94a3b8" }}>{order.valueDate}</span>
                  &nbsp;·&nbsp;{order.paymentType}
                  &nbsp;·&nbsp;Frais {order.charges}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Niveau de validation</div>
                <div style={{ fontSize: 13, color: "#06b6d4", fontWeight: 700 }}>
                 {order.status} — étape {order.currentStep || 1}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                ["Bénéficiaire", order.beneName],
                ["Pays", order.beneCountry],
                ["IBAN", order.beneIBAN],
                ["BIC", order.beneBIC],
                ["Référence", order.reference],
                ["Motif", order.motif],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>{lbl}</div>
                  <div style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "monospace" }}>{val || "—"}</div>
                </div>
              ))}
            </div>

            {order.madTransferType && (
              <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(245,158,11,.04)", border: "1px solid rgba(245,158,11,.15)", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>🇲🇦 Réglementation Changes Maroc</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    ["Nature", order.madTransferType],
                    ["N° Domiciliation", order.domiciliationRef],
                    ["Banque domiciliataire", order.domiciliationBank],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <div style={{ fontSize: 10, color: "#78716c", marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "#334155" }}>Contrôles :</div>
              <AmlBadge status={order.aml} />
              <AmlBadge status={order.sanctions} />
              <div style={{ fontSize: 11, color: "#475569", marginLeft: 4 }}>
         Saisi par <span style={{ color: "#94a3b8" }}>{order.createdBy?.nom || order.clientNom || 'N/A'}</span> · {order.createdAt}
              </div>
            </div>
          </div>

          {/* Historique */}
          <div>
            <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 12 }}>Historique & Piste d'audit</div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 1, background: "rgba(30,58,138,.3)" }} />
              {(order.auditLogs || []).map((h, i) => {
                const am = ACTION_MAP[h.action] || { color: "#64748b", icon: "·" };
                return (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, paddingLeft: 4 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: `${am.color}18`, border: `1.5px solid ${am.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: am.color, zIndex: 1,
                    }}>{am.icon}</div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                   <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{h.actorName || 'Système'}</span>
                   <span style={{ fontSize: 10, color: "#334155" }}>{h.createdAt ? new Date(h.createdAt).toLocaleString('fr-FR') : ''}</span>
                        <span style={{ fontSize: 10, color: am.color, fontWeight: 700, letterSpacing: ".05em" }}>{h.action}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>{h.comment ? `"${h.comment}"` : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zone d'action */}
          {canAct(order) && !submitted && (
            <div style={{ background: "rgba(6,182,212,.03)", border: "1px solid rgba(6,182,212,.1)", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 14 }}>Votre décision</div>

              {/* Boutons action */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
                {actionBtns.map(btn => (
                  <button key={btn.key} onClick={() => setAction(btn.key)} style={{
                    padding: "10px 0", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: action === btn.key ? btn.bg : "rgba(15,23,42,.7)",
                    border: `2px solid ${action === btn.key ? btn.border : "#1e3a5f"}`,
                    color: action === btn.key ? btn.color : "#475569",
                    transition: "all .2s",
                  }}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{btn.icon}</div>
                    {btn.label}
                  </button>
                ))}
              </div>

              {action === "DÉLÉGUER" && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>Déléguer à</div>
                  <select value={delegate} onChange={e => setDelegate(e.target.value)} style={{
                    width: "100%", background: "#0b1425", border: "1px solid #1e3a5f", borderRadius: 8,
                    padding: "9px 12px", fontSize: 13, color: "#e2e8f0", fontFamily: "monospace", outline: "none",
                  }}>
                    <option value="">Sélectionner un valideur...</option>
                    <option value="Fatima Zahra El Fassi">Fatima Zahra El Fassi — Valideur N1</option>
                    <option value="Mehdi Alaoui">Mehdi Alaoui — Valideur N2</option>
                    <option value="Leila Bensouda">Leila Bensouda — Directrice Opérations</option>
                  </select>
                </div>
              )}

              {action && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                    Commentaire {action !== "APPROUVER" ? <span style={{ color: "#f59e0b" }}>*</span> : "(optionnel)"}
                  </div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder={
                      action === "APPROUVER" ? "Commentaire de validation (optionnel)..." :
                      action === "REJETER" ? "Motif du rejet (obligatoire)..." :
                      action === "RETOURNER" ? "Préciser les corrections requises..." :
                      "Instructions pour le délégataire..."
                    }
                    rows={3}
                    style={{
                      width: "100%", background: "#0b1425", border: "1px solid #1e3a5f", borderRadius: 8,
                      padding: "10px 12px", fontSize: 12, color: "#e2e8f0", fontFamily: "monospace",
                      outline: "none", resize: "vertical",
                    }}
                  />
                </div>
              )}

              {action && (
                <button
                  onClick={handleSubmit}
                  disabled={action !== "APPROUVER" && !comment.trim()}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    background: action === "APPROUVER" ? "linear-gradient(135deg,#059669,#047857)"
                      : action === "REJETER" ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                      : action === "RETOURNER" ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                      : "linear-gradient(135deg,#0891b2,#0e7490)",
                    border: "none", color: "#fff", letterSpacing: ".5px",
                    opacity: (action !== "APPROUVER" && !comment.trim()) ? .4 : 1,
                    transition: "all .2s",
                  }}
                >
                  {action === "APPROUVER" ? "✓ Confirmer l'approbation"
                    : action === "REJETER" ? "✕ Confirmer le rejet"
                    : action === "RETOURNER" ? "↩ Retourner au saisisseur"
                    : `👤 Déléguer à ${delegate || "..."}`}
                </button>
              )}
            </div>
          )}

          {submitted && (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {action === "APPROUVER" ? "✅" : action === "REJETER" ? "❌" : action === "RETOURNER" ? "↩️" : "👤"}
              </div>
              <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 700 }}>Décision enregistrée...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// COMPOSANT PRINCIPAL — TABLEAU DE BORD VALIDEUR
// ─────────────────────────────────────────
export default function ValidationDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("EN_ATTENTE");
  const [search, setSearch] = useState("");

 const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sf_token');
      const res = await fetch('https://swiftflow-backend.onrender.com/payments/pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.map(p => ({
          id:          p.reference || p.id,
          realId:      p.id,
          createdAt:   p.createdAt ? new Date(p.createdAt).toLocaleString('fr-FR') : '',
          valueDate:   p.valueDate ? new Date(p.valueDate).toLocaleDateString('fr-FR') : '',
          amount:      p.amount || 0,
          currency:    p.currency || 'MAD',
          symbol:      p.currency === 'EUR' ? '€' : p.currency === 'USD' ? '$' : 'MAD',
          beneName:    p.beneName || '',
          beneBIC:     p.beneBIC || '',
          beneIBAN:    p.beneIBAN || '',
          beneCountry: p.beneCountry || '',
          charges:     p.charges || 'SHA',
          motif:       p.motif || '',
          reference:   p.referenceClient || '',
          details:     p.details || '',
          status:      p.status || 'PENDING',
          amlStatus:   p.amlStatus || 'PENDING',
          clientNom:   p.clientNom || '',
          agenceCode:  p.agenceCode || '',
          categorie:   p.categorie || '',
          typeTransfert: p.typeTransfert || '',
          createdBy:   p.createdBy?.nom || '',
          auditLogs:   (p.auditLogs || []).map(a => ({
            date:    new Date(a.createdAt).toLocaleString('fr-FR'),
            actor:   a.actorName || '',
            action:  a.action || '',
            comment: a.comment || '',
            status:  a.newStatus || '',
          })),
        })));
      }
    } catch(e) {
      console.error('Erreur chargement ordres:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleAction = async (id, action, comment) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const realId = order.realId || id;
    const token = localStorage.getItem('sf_token');
    const endpoint = action === 'APPROUVER' ? 'approve' : action === 'REJETER' ? 'reject' : 'return';
    try {
      const res = await fetch(`https://swiftflow-backend.onrender.com/payments/${realId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment }),
      });
      if (res.ok) {
        await loadOrders();
        setSelected(null);
      } else {
        const data = await res.json();
        alert('Erreur : ' + (data.message || 'Action impossible'));
      }
    } catch(e) {
      alert('Erreur de connexion au serveur');
    }
  };

  const PENDING_STATUSES = ["EN_ATTENTE_N1", "EN_ATTENTE_N2", "PENDING_CONFORMITE", "PENDING_VALIDEUR_N1", "PENDING_VALIDEUR_N2", "PENDING_VALIDATION", "PENDING_REGLEMENTAIRE"];
const TREATED_STATUSES = ["APPROUVÉ", "REJETÉ", "RETOURNÉ", "APPROVED", "REJECTED", "RETURNED"];

const filteredOrders = orders.filter(o => {
  const matchFilter =
    filter === "EN_ATTENTE" ? PENDING_STATUSES.includes(o.status)
    : filter === "TRAITÉS"  ? TREATED_STATUSES.includes(o.status)
    : true;
  const matchSearch = !search || o.id.includes(search.toUpperCase()) || o.beneName.toUpperCase().includes(search.toUpperCase());
  return matchFilter && matchSearch;
});

const pending  = orders.filter(o => PENDING_STATUSES.includes(o.status)).length;
const approved = orders.filter(o => o.status === "APPROUVÉ" || o.status === "APPROVED").length;
const rejected = orders.filter(o => o.status === "REJETÉ" || o.status === "RETOURNÉ" || o.status === "REJECTED" || o.status === "RETURNED").length;
const alertAml = orders.filter(o => o.amlStatus === "ALERT").length;
const totalPending = orders.filter(o => PENDING_STATUSES.includes(o.status)).reduce((s, o) => s + o.amount, 0);
  const statCards = [
    { label: "En attente",    value: pending,  color: "#f59e0b", icon: "⏳", sub: `${totalPending.toLocaleString("fr-FR")} en volume` },
    { label: "Approuvés",     value: approved, color: "#10b981", icon: "✅", sub: "Aujourd'hui" },
    { label: "Rejetés/Ret.", value: rejected, color: "#ef4444", icon: "✕",  sub: "Aujourd'hui" },
    { label: "Alertes AML",   value: alertAml, color: "#f59e0b", icon: "⚠",  sub: "Contrôle renforcé" },
  ];

  return (
    <div style={{
      fontFamily: "'IBM Plex Mono','Courier New',monospace",
      background: "linear-gradient(140deg,#050d1a 0%,#0a1628 60%,#071220 100%)",
      minHeight: "100vh", color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea{font-family:inherit}
        select option{background:#0b1425}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050d1a}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:2px}
        .fade{animation:fade .3s ease forwards}
        @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .row-hover:hover{background:rgba(6,182,212,.04)!important;cursor:pointer}
        .pulse{animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} onAction={handleAction} />}

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid rgba(6,182,212,.1)", background: "rgba(6,182,212,.025)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#0891b2,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 18px rgba(8,145,178,.3)" }}>⚡</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#e2e8f0", letterSpacing: 1 }}>SWIFT<span style={{ color: "#06b6d4" }}>FLOW</span></div>
              <div style={{ fontSize: 9, color: "#334155", letterSpacing: 3, textTransform: "uppercase" }}>Circuit de Validation</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="pulse" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 2 }}>{pending} EN ATTENTE</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, background: "rgba(6,182,212,.06)", border: "1px solid rgba(6,182,212,.12)" }}>
           <Avatar name={JSON.parse(localStorage.getItem('sf_user') || '{}').nom || 'User'} size={26} />
              <div>
                <div style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>{JSON.parse(localStorage.getItem('sf_user') || '{}').nom || 'User'}</div>
                <div style={{ fontSize: 9, color: "#475569" }}>{JSON.parse(localStorage.getItem('sf_user') || '{}').role || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }} className="fade">
          {statCards.map((s, i) => (
            <div key={i} style={{
              background: "rgba(11,20,37,.85)", border: `1px solid ${s.color}22`,
              borderRadius: 13, padding: "16px 18px",
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: ".12em" }}>{s.label}</div>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* FILTRES & RECHERCHE */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[["EN_ATTENTE","⏳ En attente"], ["TRAITÉS","✓ Traités"], ["TOUS","Tous"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                background: filter === k ? "rgba(6,182,212,.12)" : "rgba(15,23,42,.7)",
                color: filter === k ? "#06b6d4" : "#475569",
                borderBottom: filter === k ? "2px solid #06b6d4" : "2px solid transparent",
                transition: "all .2s",
              }}>{l}</button>
            ))}
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Rechercher par ID ou bénéficiaire..."
            style={{
              background: "#0b1425", border: "1px solid #1e3a5f", borderRadius: 8,
              padding: "7px 14px", fontSize: 12, color: "#e2e8f0", outline: "none", width: 280,
            }}
          />
        </div>

        {/* TABLEAU */}
        <div style={{ background: "rgba(11,20,37,.85)", border: "1px solid rgba(30,58,138,.25)", borderRadius: 14, overflow: "hidden" }}>
          {/* En-tête tableau */}
          <div style={{
            display: "grid", gridTemplateColumns: "140px 1fr 130px 110px 90px 110px 80px",
            padding: "10px 18px", borderBottom: "1px solid rgba(30,58,138,.25)",
            background: "rgba(6,182,212,.03)",
          }}>
            {["Référence","Bénéficiaire","Montant","Devise","AML","Statut",""].map((h, i) => (
              <div key={i} style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700 }}>{h}</div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#334155", fontSize: 13 }}>
              Aucun ordre correspondant aux filtres
            </div>
          )}

   {filteredOrders.map((o, i) => (
  <div key={o.id} style={{
    padding: "13px 18px",
    borderBottom: i < filteredOrders.length - 1 ? "1px solid rgba(30,58,138,.15)" : "none",
    background: o.amlStatus === "ALERT" ? "rgba(245,158,11,.025)" : "transparent",
    transition: "background .15s",
  }}>
    {/* Ligne principale */}
    <div style={{ display:"grid", gridTemplateColumns:"140px 1fr 130px 110px 110px", alignItems:"center", gap:8 }}>
      <div style={{ fontSize:11, color:"#06b6d4", fontWeight:700, fontFamily:"monospace" }}>{o.id}</div>
      <div>
        <div style={{ fontSize:12, color:"#e2e8f0", fontWeight:600 }}>{o.beneName}</div>
        <div style={{ fontSize:10, color:"#334155", marginTop:2 }}>{o.reference} · {o.createdBy?.nom || o.clientNom || 'N/A'}</div>
      </div>
      <div style={{ fontSize:13, color:"#e2e8f0", fontWeight:700 }}>{o.symbol}{parseFloat(o.amount||0).toLocaleString("fr-FR")} {o.currency}</div>
      <div><StatusBadge status={o.status} /></div>
      {/* Bouton détail */}
      <button onClick={() => setSelected(o)} style={{
        padding:"5px 10px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer",
        background:"rgba(6,182,212,.08)", border:"1px solid rgba(6,182,212,.2)", color:"#06b6d4",
      }}>👁 Détail</button>
    </div>

    {/* Boutons d'action */}
    {canAct(o) && (
      <div style={{ display:"flex", gap:8, marginTop:10, paddingTop:10, borderTop:"1px solid rgba(30,58,138,.1)" }}>
        <button onClick={() => handleAction(o.id, 'APPROUVER', 'Approuvé')} style={{
          padding:"6px 16px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
          background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.3)", color:"#10b981",
        }}>✓ Approuver</button>
        <button onClick={() => {
          const comment = prompt('Motif du rejet :');
          if (comment) handleAction(o.id, 'REJETER', comment);
        }} style={{
          padding:"6px 16px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
          background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", color:"#ef4444",
        }}>✕ Rejeter</button>
        <button onClick={() => {
          const comment = prompt('Motif du retour :');
          if (comment) handleAction(o.id, 'RETOURNER', comment);
        }} style={{
          padding:"6px 16px", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer",
          background:"rgba(167,139,250,.08)", border:"1px solid rgba(167,139,250,.25)", color:"#a78bfa",
        }}>↩ Retourner</button>
      </div>
    )}
  </div>
))}
        </div>

        <div style={{ marginTop: 12, fontSize: 10, color: "#1e3a5f", textAlign: "right" }}>
          {filteredOrders.length} ordre{filteredOrders.length > 1 ? "s" : ""} affiché{filteredOrders.length > 1 ? "s" : ""}
          &nbsp;·&nbsp;Piste d'audit horodatée et immuable activée
        </div>
      </div>
    </div>
  );
}
