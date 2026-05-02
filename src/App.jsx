import { useState } from "react";
import { API_URL } from './config.js';
import SaisieModule       from "./pages/SaisieModule.jsx";
import ValidationModule   from "./pages/ValidationModule.jsx";
import WorkflowModule     from "./pages/WorkflowModule.jsx";
import ReferentielsModule from "./pages/ReferentielsModule.jsx";
import AdminConsole       from "./pages/AdminConsole.jsx";
import MesOrdres from "./pages/MesOrdres.jsx";

const USERS = [
  { id:1, login:"admin",      password:"Admin@2026", nom:"Administrateur SwiftFlow", role:"ADMIN",         icon:"⚙",  color:"#64748b" },
  { id:2, login:"k.benali",   password:"Test@1234",  nom:"Khalid Benali",            role:"SAISISSEUR",    icon:"✍",  color:"#0EA5E9" },
  { id:3, login:"h.moukrim",  password:"Test@1234",  nom:"Hassan Moukrim",           role:"VALIDEUR_N1",   icon:"✓",  color:"#10B981" },
  { id:4, login:"s.ouazzani", password:"Test@1234",  nom:"Samira Ouazzani",          role:"VALIDEUR_N2",   icon:"✓✓", color:"#059669" },
  { id:5, login:"l.bensouda", password:"Test@1234",  nom:"Leila Bensouda",           role:"CONFORMITE",    icon:"🛡", color:"#F59E0B" },
  { id:6, login:"m.alaoui",   password:"Test@1234",  nom:"Mehdi Alaoui",             role:"REGLEMENTAIRE", icon:"📋", color:"#8B5CF6" },
  { id:7, login:"directeur",  password:"Test@1234",  nom:"Direction Generale",       role:"DIRECTION",     icon:"⭐", color:"#EC4899" },
];

const ROLE_LABELS = {
  ADMIN:"Administrateur", SAISISSEUR:"Saisisseur", VALIDEUR_N1:"Valideur N1",
  VALIDEUR_N2:"Valideur N2", CONFORMITE:"Conformite / AML",
  REGLEMENTAIRE:"Responsable Reglementaire", DIRECTION:"Direction",
};

const MODULES = [
  { id:"saisie",       label:"Saisie & Controles",    icon:"✍",  color:"#0EA5E9", roles:["SAISISSEUR","VALIDEUR_N1","VALIDEUR_N2","CONFORMITE","REGLEMENTAIRE","DIRECTION"], component:SaisieModule       },
  { id:"mesordres", label:"Mes Ordres", icon:"📂", color:"#F59E0B", roles:["SAISISSEUR","VALIDEUR_N1","VALIDEUR_N2","CONFORMITE","REGLEMENTAIRE","DIRECTION"], component:MesOrdres },
  { id:"validation",   label:"Circuit de Validation", icon:"✓",  color:"#10B981", roles:["VALIDEUR_N1","VALIDEUR_N2","CONFORMITE","REGLEMENTAIRE","DIRECTION"],             component:ValidationModule   },
  { id:"workflow",     label:"Moteur Workflow",        icon:"🔀", color:"#8B5CF6", roles:["DIRECTION"],                                                                      component:WorkflowModule     },
  { id:"referentiels", label:"Referentiels",           icon:"📋", color:"#6366F1", roles:["DIRECTION"],                                                                      component:ReferentielsModule },
];

function LoginScreen({ onLogin }) {
  const [login, setLogin]     = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!login || !password) { setError("Veuillez saisir votre identifiant et mot de passe."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('sf_token', data.token);
        localStorage.setItem('sf_user', JSON.stringify(data.user));
        const userObj = USERS.find(u => u.login === data.user.login) || {
          ...data.user, icon:'👤', color:'#06b6d4',
        };
        onLogin({ ...userObj, ...data.user });
      } else {
        setError(data.message || "Identifiant ou mot de passe incorrect.");
        setLoading(false);
      }
    } catch(e) {
      setError("Impossible de contacter le serveur. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#050C1A 0%,#091525 60%,#050C1A 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono','Courier New',monospace", padding:20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp .5s ease forwards" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:"linear-gradient(135deg,#0E6494,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 16px", boxShadow:"0 0 40px rgba(14,100,148,.4)" }}>⚡</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:"#E2EAF2", letterSpacing:1 }}>SWIFT<span style={{ color:"#0EA5E9" }}>FLOW</span></div>
          <div style={{ fontSize:11, color:"#3E5470", letterSpacing:"0.2em", textTransform:"uppercase", marginTop:4 }}>Gestion des Operations Internationales</div>
        </div>
        <div style={{ background:"rgba(8,15,28,.9)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:32, backdropFilter:"blur(12px)", boxShadow:"0 30px 60px rgba(0,0,0,.5)" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#E2EAF2", marginBottom:24, fontFamily:"'Space Grotesk',sans-serif" }}>Connexion</div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7A8BA0", display:"block", marginBottom:6 }}>Identifiant</label>
            <input value={login} onChange={e => setLogin(e.target.value)} onKeyDown={handleKey}
              placeholder="Votre identifiant..." autoComplete="username"
              style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"10px 14px", fontSize:13, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#7A8BA0", display:"block", marginBottom:6 }}>Mot de passe</label>
            <div style={{ position:"relative" }}>
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                type={showPwd ? "text" : "password"} placeholder="Votre mot de passe..." autoComplete="current-password"
                style={{ width:"100%", background:"rgba(10,18,32,.8)", border:"1.5px solid #1D3250", borderRadius:9, padding:"10px 40px 10px 14px", fontSize:13, color:"#C8D8EA", fontFamily:"monospace", outline:"none" }} />
              <button onClick={() => setShowPwd(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#3E5470", cursor:"pointer", fontSize:14 }}>
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ marginBottom:16, padding:"8px 12px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)", borderRadius:8, fontSize:11, color:"#ef4444" }}>
              ✕ {error}
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} style={{
            width:"100%", padding:"12px", borderRadius:10, fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer",
            background:loading?"rgba(20,35,55,.6)":"linear-gradient(135deg,#0E6494,#0891b2)",
            border:"none", color:loading?"#2A4060":"#fff",
            boxShadow:loading?"none":"0 0 28px rgba(14,165,233,.25)",
          }}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
          <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontSize:9, color:"#2A4060", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:10, textAlign:"center" }}>Comptes de demonstration</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {USERS.slice(0,6).map(u => (
                <div key={u.id} onClick={() => { setLogin(u.login); setPassword(u.password); setError(""); }}
                  style={{ padding:"6px 10px", borderRadius:7, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(6,182,212,.08)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.03)"}>
                  <div style={{ fontSize:11, fontWeight:600, color:u.color }}>{u.icon} {u.login}</div>
                  <div style={{ fontSize:9, color:"#3E5470" }}>{ROLE_LABELS[u.role]}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:9, color:"#1e3a5f", textAlign:"center", marginTop:8 }}>
              Mot de passe : Test@1234 (admin : Admin@2026)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
 const [orderToEdit, setOrderToEdit] = useState(null);
  const [user, setUser]           = useState(null);
  const [activeModule, setActive] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [navOpen, setNavOpen]     = useState(true);

  if (!user) return <LoginScreen onLogin={u => { setUser(u); setActive(u.role==="ADMIN" ? null : MODULES.find(m=>m.roles.includes(u.role))?.id); }} />;
  if (user.role === "ADMIN" && showAdmin) return <AdminConsole onExit={() => setShowAdmin(false)} />;

  const accessibles = MODULES.filter(m => m.roles.includes(user.role));
  const ActiveComp  = accessibles.find(m=>m.id===activeModule)?.component;

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'JetBrains Mono','Courier New',monospace", background:"#050C1A", overflow:"hidden", color:"#C8D8EA" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#050C1A}::-webkit-scrollbar-thumb{background:#1D3250;border-radius:2px}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>
      <div style={{ width:navOpen?240:64, flexShrink:0, background:"rgba(6,10,20,.98)", borderRight:"1px solid rgba(255,255,255,.06)", display:"flex", flexDirection:"column", transition:"width .25s ease", overflow:"hidden" }}>
        <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,.05)", display:"flex", alignItems:"center", gap:10, minHeight:62 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0E6494,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⚡</div>
          {navOpen && <div style={{ animation:"fadeIn .2s ease" }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:16, color:"#E2EAF2" }}>SWIFT<span style={{ color:"#0EA5E9" }}>FLOW</span></div>
            <div style={{ fontSize:9, color:"#2A4060", letterSpacing:"0.18em", textTransform:"uppercase" }}>MVP Demo</div>
          </div>}
        </div>
        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:3, overflowY:"auto" }}>
          {accessibles.map(m => {
            const active = activeModule === m.id;
            return (
              <button key={m.id} onClick={() => setActive(m.id)} title={!navOpen?m.label:""}
                style={{ display:"flex", alignItems:"center", gap:10, padding:navOpen?"10px 12px":"10px 0", justifyContent:navOpen?"flex-start":"center", borderRadius:9, border:"none", cursor:"pointer", width:"100%", background:active?m.color+"18":"transparent", borderLeft:active?"3px solid "+m.color:"3px solid transparent", transition:"all .15s" }}
                onMouseEnter={e=>!active&&(e.currentTarget.style.background="rgba(255,255,255,.04)")}
                onMouseLeave={e=>!active&&(e.currentTarget.style.background="transparent")}>
                <span style={{ fontSize:16, flexShrink:0 }}>{m.icon}</span>
                {navOpen && <div style={{ animation:"fadeIn .2s ease" }}><div style={{ fontSize:12, fontWeight:700, color:active?m.color:"#7A8BA0" }}>{m.label}</div></div>}
              </button>
            );
          })}
          {user.role==="ADMIN" && (
            <button onClick={() => setShowAdmin(true)} title={!navOpen?"Console Admin":""}
              style={{ display:"flex", alignItems:"center", gap:10, padding:navOpen?"10px 12px":"10px 0", justifyContent:navOpen?"flex-start":"center", borderRadius:9, border:"none", cursor:"pointer", width:"100%", background:"rgba(245,158,11,.06)", borderLeft:"3px solid rgba(245,158,11,.3)", marginTop:8 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>⚙</span>
              {navOpen && <div style={{ animation:"fadeIn .2s ease" }}><div style={{ fontSize:12, fontWeight:700, color:"#f59e0b" }}>Console Admin</div></div>}
            </button>
          )}
        </nav>
        <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 10px", borderRadius:9, background:"rgba(6,182,212,.06)", border:"1px solid rgba(6,182,212,.12)" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:user.color+"22", border:"1.5px solid "+user.color+"55", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>{user.icon}</div>
            {navOpen && <div style={{ flex:1, minWidth:0, animation:"fadeIn .2s ease" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#C8D8EA", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.nom}</div>
              <div style={{ fontSize:9, color:user.color }}>{ROLE_LABELS[user.role]}</div>
            </div>}
          </div>
          {navOpen && <button onClick={() => { setUser(null); localStorage.clear(); }} style={{ width:"100%", marginTop:6, padding:"6px", borderRadius:8, fontSize:10, fontWeight:700, cursor:"pointer", background:"rgba(239,68,68,.06)", border:"1px solid rgba(239,68,68,.15)", color:"#ef4444" }}>Deconnexion</button>}
        </div>
        <button onClick={()=>setNavOpen(v=>!v)} style={{ padding:"10px", background:"rgba(255,255,255,.02)", border:"none", borderTop:"1px solid rgba(255,255,255,.05)", color:"#2A4060", cursor:"pointer", fontSize:12 }}>
          {navOpen?"◀":"▶"}
        </button>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(5,12,26,.92)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,.04)", padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(6,182,212,.07)", border:"1px solid rgba(6,182,212,.15)" }}>
            <span style={{ fontSize:12 }}>{user.icon}</span>
            <span style={{ fontSize:11, color:"#7A8BA0" }}>Connecte :</span>
            <span style={{ fontSize:11, fontWeight:700, color:user.color }}>{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        {!activeModule && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"calc(100vh - 54px)" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>👋</div>
              <div style={{ fontSize:20, fontWeight:700, color:"#E2EAF2", marginBottom:8, fontFamily:"'Space Grotesk',sans-serif" }}>Bienvenue, {user.nom.split(" ")[0]}</div>
              <div style={{ fontSize:13, color:"#3E5470", marginBottom:24 }}>Selectionnez un module dans la barre de navigation</div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                {accessibles.map(m => (
                  <button key={m.id} onClick={() => setActive(m.id)} style={{ padding:"10px 20px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", background:m.color+"18", border:"1px solid "+m.color+"44", color:m.color }}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {ActiveComp && (
  activeModule === "mesordres"
    ? <ActiveComp onEditOrder={(order) => {
        setOrderToEdit(order);
        setActive("saisie");
      }} />
    : activeModule === "saisie"
    ? <ActiveComp orderToEdit={orderToEdit} onSaved={() => { setOrderToEdit(null); setActive("mesordres"); }} />
    : <ActiveComp />
)}
      </div>
    </div>
  );
}
