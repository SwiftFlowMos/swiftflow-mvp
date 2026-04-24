import { useState } from "react";
import SaisieModule      from "./pages/SaisieModule.jsx";
import ValidationModule  from "./pages/ValidationModule.jsx";
import WorkflowModule    from "./pages/WorkflowModule.jsx";
import VisibiliteModule  from "./pages/VisibiliteModule.jsx";
import ReferentielsModule from "./pages/ReferentielsModule.jsx";

const MODULES = [
  { id: "saisie",       label: "Saisie & Contrôles",      icon: "✍",  desc: "Formulaire de virement",        color: "#0EA5E9", component: SaisieModule       },
  { id: "validation",   label: "Circuit de Validation",   icon: "✓",  desc: "Tableau de bord valideur",      color: "#10B981", component: ValidationModule   },
  { id: "workflow",     label: "Moteur Workflow",          icon: "🔀", desc: "Règles de routage conditionnel",color: "#8B5CF6", component: WorkflowModule     },
  { id: "visibilite",   label: "Visibilité par Rôle",     icon: "👁",  desc: "Matrice champs × rôles",        color: "#F59E0B", component: VisibiliteModule   },
  { id: "referentiels", label: "Référentiels",             icon: "📋", desc: "Clients, devises, pays...",     color: "#6366F1", component: ReferentielsModule },
];

const USERS = [
  { name: "Khalid Benali",   role: "SAISISSEUR",    label: "Saisisseur",     icon: "✍" },
  { name: "Hassan Moukrim",  role: "VALIDEUR_N1",   label: "Valideur N1",    icon: "✓" },
  { name: "Samira Ouazzani", role: "CONFORMITE",    label: "Conformité/AML", icon: "🛡" },
  { name: "Leila Bensouda",  role: "REGLEMENTAIRE", label: "Réglementaire",  icon: "📋" },
  { name: "Directeur",       role: "DIRECTION",     label: "Direction",      icon: "⭐" },
  { name: "Admin SwiftFlow", role: "ADMIN",         label: "Administrateur", icon: "⚙" },
];

export default function App() {
  const [activeModule, setActiveModule] = useState("saisie");
  const [currentUser, setCurrentUser]   = useState(USERS[0]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [navOpen, setNavOpen] = useState(true);

  const ActiveComponent = MODULES.find(m => m.id === activeModule)?.component;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'JetBrains Mono','Courier New',monospace", background: "#050C1A", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #050C1A; } ::-webkit-scrollbar-thumb { background: #1D3250; border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width: navOpen ? 240 : 64, flexShrink: 0, background: "rgba(6,12,24,.97)", borderRight: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", transition: "width .25s ease", overflow: "hidden" }}>
        
        {/* Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 10, minHeight: 62 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0E6494,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: "0 0 16px rgba(8,145,178,.35)" }}>⚡</div>
          {navOpen && (
            <div style={{ animation: "fadeIn .2s ease" }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 16, color: "#E2EAF2", letterSpacing: ".5px" }}>SWIFT<span style={{ color: "#0EA5E9" }}>FLOW</span></div>
              <div style={{ fontSize: 9, color: "#2A4060", letterSpacing: "0.18em", textTransform: "uppercase" }}>MVP · Demo</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {MODULES.map(m => {
            const active = activeModule === m.id;
            return (
              <button key={m.id} onClick={() => setActiveModule(m.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: navOpen ? "10px 12px" : "10px 0", justifyContent: navOpen ? "flex-start" : "center",
                borderRadius: 9, border: "none", cursor: "pointer", width: "100%",
                background: active ? `${m.color}18` : "transparent",
                borderLeft: active ? `3px solid ${m.color}` : "3px solid transparent",
                transition: "all .15s",
              }}
              title={!navOpen ? m.label : ""}
              onMouseEnter={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,.04)")}
              onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{m.icon}</span>
                {navOpen && (
                  <div style={{ textAlign: "left", animation: "fadeIn .2s ease" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: active ? m.color : "#7A8BA0" }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: "#2A4060" }}>{m.desc}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Utilisateur connecté */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <div onClick={() => setShowUserPicker(v => !v)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: navOpen ? "10px 12px" : "10px 0",
            justifyContent: navOpen ? "flex-start" : "center",
            borderRadius: 9, cursor: "pointer", transition: "background .15s",
            background: showUserPicker ? "rgba(6,182,212,.1)" : "transparent",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.04)"}
          onMouseLeave={e => e.currentTarget.style.background = showUserPicker ? "rgba(6,182,212,.1)" : "transparent"}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(6,182,212,.15)", border: "1.5px solid rgba(6,182,212,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
              {currentUser.icon}
            </div>
            {navOpen && (
              <div style={{ animation: "fadeIn .2s ease", overflow: "hidden" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C8D8EA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{currentUser.name}</div>
                <div style={{ fontSize: 10, color: "#3E5470" }}>{currentUser.label}</div>
              </div>
            )}
          </div>

          {/* Picker utilisateur */}
          {showUserPicker && (
            <div style={{ marginTop: 6, background: "#0C1628", border: "1px solid rgba(6,182,212,.2)", borderRadius: 10, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>
              {USERS.map(u => (
                <div key={u.role} onClick={() => { setCurrentUser(u); setShowUserPicker(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", transition: "background .12s", borderBottom: "1px solid rgba(255,255,255,.04)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(6,182,212,.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14 }}>{u.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: u.role === currentUser.role ? "#0EA5E9" : "#C8D8EA" }}>{u.name}</div>
                    <div style={{ fontSize: 9, color: "#3E5470" }}>{u.label}</div>
                  </div>
                  {u.role === currentUser.role && <span style={{ marginLeft: "auto", color: "#0EA5E9", fontSize: 12 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toggle nav */}
        <button onClick={() => setNavOpen(v => !v)} style={{
          padding: "10px", background: "rgba(255,255,255,.03)", border: "none", borderTop: "1px solid rgba(255,255,255,.05)",
          color: "#2A4060", cursor: "pointer", fontSize: 14, transition: "color .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#06b6d4"}
        onMouseLeave={e => e.currentTarget.style.color = "#2A4060"}
        >
          {navOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {/* Bandeau utilisateur */}
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(5,12,26,.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.04)", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(6,182,212,.07)", border: "1px solid rgba(6,182,212,.15)" }}>
            <span style={{ fontSize: 12 }}>{currentUser.icon}</span>
            <span style={{ fontSize: 11, color: "#7A8BA0" }}>Connecté en tant que</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0EA5E9" }}>{currentUser.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, color: "#10b981", letterSpacing: "0.12em" }}>DEMO</span>
          </div>
        </div>

        {/* Module actif */}
        {ActiveComponent && <ActiveComponent />}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
