
const $ = (s, root=document) => root.querySelector(s);
const app = $("#app");
const DB_KEY = "homecare_connect_data_v1";
let volatileData = {users:[], jobs:[], applications:[]};

function read(){
  try { const raw=localStorage.getItem(DB_KEY); return raw?JSON.parse(raw):volatileData; }
  catch(e){ return volatileData; }
}
function save(data){
  volatileData=data;
  try { localStorage.setItem(DB_KEY,JSON.stringify(data)); }
  catch(e){ /* la app sigue funcionando en memoria durante esta sesión */ }
}
function current(){
  const id=sessionStorage.getItem("hc_session");
  return read().users.find(u=>u.id===id)||null;
}
function go(path){ location.hash=path; }
function esc(v=""){
  return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function nav(){
  const u=current();
  return `<nav class="navbar"><div class="nav-inner">
    <a class="brand" href="#/"><span class="brand-mark">✿</span>HomeCare <span>Connect</span></a>
    <div class="nav-links">
      <a href="#/">Inicio</a><a href="#/empleos">Ofertas de empleo</a>
      ${u ? `<a href="#/perfil">Mi perfil</a>${u.role==="employer"?'<a href="#/mis-ofertas">Mis ofertas</a>':''}<a class="btn outline" href="#/salir">Cerrar sesión</a>` : `<a class="btn" href="#/acceso">Ingresar</a>`}
    </div>
  </div></nav>`;
}
function shell(content){
  app.innerHTML=nav()+content+`<footer class="footer">© ${new Date().getFullYear()} HomeCare Connect · Conectando hogares con talento.</footer>`;
}
function home(){
 shell(`<header class="hero"><div class="hero-content"><div class="eyebrow">Conexiones que cuidan</div>
 <h1>El talento del hogar merece <em>nuevas oportunidades.</em></h1>
 <p>Conectamos a amas de llaves con familias y personas que buscan apoyo confiable para su hogar. Crea tu perfil, descubre empleos y encuentra la conexión ideal.</p>
 <div class="hero-actions"><a class="btn" href="#/acceso">Comenzar ahora</a><a class="btn secondary" href="#/empleos">Explorar empleos</a></div></div></header>
 <main class="container"><h2 class="section-title">Una plataforma, dos caminos</h2><p class="section-intro">Un espacio para que el talento encuentre oportunidades y los hogares encuentren a la persona indicada.</p>
 <div class="grid">
  <article class="card feature"><div class="emoji">🌿</div><h3>Perfiles profesionales</h3><p>Las amas de llaves pueden mostrar experiencia, habilidades, referencias y disponibilidad.</p></article>
  <article class="card feature"><div class="emoji">🤝</div><h3>Conexión directa</h3><p>Contratadores y candidatas pueden conocer sus necesidades y datos de contacto.</p></article>
  <article class="card feature"><div class="emoji">🏡</div><h3>Ofertas de empleo</h3><p>Publica oportunidades con horarios, ubicación, tareas y remuneración.</p></article>
 </div>
 <h2 class="section-title" style="margin-top:48px">Oportunidades recientes</h2>${jobCards(read().jobs.slice().reverse().slice(0,3))}
 </main>`);
}
function access(){
 shell(`<section class="page-head"><h1>¿Cómo quieres participar?</h1><p class="muted">Selecciona el tipo de cuenta que deseas crear.</p></section>
 <main class="container"><div class="grid">
 <article class="card feature"><div class="emoji">🧹</div><h2>Ama de llaves</h2><p>Crea tu perfil profesional, comparte tu experiencia y encuentra oportunidades de trabajo.</p><a class="btn" href="#/registro/worker">Registrarme</a><p class="small">¿Ya tienes cuenta? <a href="#/login/worker">Inicia sesión</a></p></article>
 <article class="card feature"><div class="emoji">🏡</div><h2>Contratador</h2><p>Explora perfiles de amas de llaves y publica propuestas para encontrar apoyo en tu hogar.</p><a class="btn brown" href="#/registro/employer">Registrarme</a><p class="small">¿Ya tienes cuenta? <a href="#/login/employer">Inicia sesión</a></p></article>
 </div></main>`);
}
function register(role){
 const roleName=role==="worker"?"ama de llaves":"contratador";
 shell(`<main class="container"><form class="form-card" id="register">
 <h1>Registro de ${roleName}</h1><p class="muted">Completa tus datos para crear tu cuenta.</p>
 <div class="field"><label>Nombre completo</label><input name="name" required maxlength="90" autocomplete="name"></div>
 <div class="field"><label>Correo electrónico</label><input name="email" type="email" required autocomplete="email"></div>
 <div class="field"><label>Teléfono o WhatsApp</label><input name="phone" type="tel" placeholder="Ej. 7000-0000"></div>
 <div class="field"><label>Contraseña</label><input name="password" type="password" minlength="4" required autocomplete="new-password"></div>
 <button type="submit">Crear cuenta</button><p class="small">¿Ya tienes cuenta? <a href="#/login/${role}">Inicia sesión</a></p><div id="msg"></div>
 <div class="notice">Demostración local: no uses contraseñas reales. Antes de publicar, se debe conectar autenticación segura.</div>
 </form></main>`);
 $("#register").onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.target),d=read(),email=String(f.get("email")).trim().toLowerCase();
  if(d.users.some(u=>u.email===email)){ $("#msg").innerHTML='<p class="notice error">Ese correo ya está registrado.</p>';return; }
  const u={id:"u"+Date.now(),role,name:String(f.get("name")).trim(),email,phone:String(f.get("phone")).trim(),password:String(f.get("password")),profile:{}};
  d.users.push(u);save(d);sessionStorage.setItem("hc_session",u.id);go("#/perfil");
 };
}
function login(role){
 const roleName=role==="worker"?"ama de llaves":"contratador";
 shell(`<main class="container"><form class="form-card" id="login">
 <h1>Iniciar sesión</h1><p class="muted">Accede como ${roleName}.</p>
 <div class="field"><label>Correo electrónico</label><input name="email" type="email" required autocomplete="email"></div>
 <div class="field"><label>Contraseña</label><input name="password" type="password" required autocomplete="current-password"></div>
 <button>Entrar</button><p class="small">¿No tienes cuenta? <a href="#/registro/${role}">Regístrate</a></p><div id="msg"></div>
 </form></main>`);
 $("#login").onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.target),email=String(f.get("email")).trim().toLowerCase();
  const u=read().users.find(x=>x.email===email&&x.password===String(f.get("password"))&&x.role===role);
  if(!u){$("#msg").innerHTML='<p class="notice error">Correo, contraseña o tipo de cuenta incorrectos.</p>';return;}
  sessionStorage.setItem("hc_session",u.id);go("#/perfil");
 };
}
function workerFields(){return [
 ["headline","Presentación profesional","Cuéntanos brevemente sobre ti y tu forma de trabajar."],
 ["location","Ubicación","Ciudad, municipio o zona donde buscas empleo."],
 ["experience","Experiencia laboral","Lugares donde has trabajado, tiempo y responsabilidades."],
 ["skills","Habilidades y servicios","Limpieza, cocina, lavandería, organización, cuidado de ropa…"],
 ["availability","Disponibilidad","Tiempo completo, medio tiempo, por días u horarios."],
 ["references","Referencias (opcional)","Referencias laborales o personas que puedan recomendarte."]
];}
function employerFields(){return [
 ["about","Sobre mí / mi hogar","Información que quieras compartir sobre el hogar o familia."],
 ["location","Ubicación","Ciudad, municipio o zona del trabajo."],
 ["needs","Qué tipo de apoyo necesito","Limpieza, cocina, lavandería, organización u otras tareas."],
 ["schedule","Horario y modalidad","Días, horas, tiempo completo, por días, etc."],
 ["requirements","Requisitos o preferencias","Experiencia, referencias, habilidades u otros detalles."]
];}
function profileFields(u){return u.role==="worker"?workerFields():employerFields();}
function profile(){
 const u=current();if(!u)return go("#/acceso");
 const isWorker=u.role==="worker",p=u.profile||{};
 const fields=profileFields(u);
 shell(`<main class="container"><section class="profile"><div class="avatar">${esc(u.name.charAt(0).toUpperCase())}</div><div><div class="tag">${isWorker?"Ama de llaves":"Contratador"}</div><h1>${esc(u.name)}</h1><p>${esc(u.email)} · ${esc(u.phone||"Teléfono no registrado")}</p><p class="muted">${esc(p.location||"Agrega tu ubicación para completar el perfil.")}</p></div></section>
 <div class="actions"><a class="btn" href="#/editar-perfil">Editar mi perfil</a>${isWorker?'<a class="btn secondary" href="#/empleos">Explorar empleos</a>':'<a class="btn brown" href="#/publicar">Publicar oferta</a>'}</div>
 <h2 class="section-title" style="text-align:left;margin-top:32px">Información del perfil</h2><div class="detail-grid">
 ${fields.map(([k,label])=>`<div class="detail-box"><label>${label}</label><p>${esc(p[k]||"Aún no has agregado esta información.")}</p></div>`).join("")}
 </div></main>`);
}
function editProfile(){
 const u=current();if(!u)return go("#/acceso");const p=u.profile||{},fields=profileFields(u);
 shell(`<main class="container"><form class="form-card" id="edit"><h1>Editar mi perfil</h1><p class="muted">Esta información ayudará a conectar con la persona adecuada.</p>
 <div class="field"><label>Nombre completo</label><input name="name" required value="${esc(u.name)}"></div>
 <div class="field"><label>Teléfono o WhatsApp</label><input name="phone" value="${esc(u.phone||"")}"></div>
 ${fields.map(([k,label,placeholder])=>`<div class="field"><label>${label}</label><textarea name="${k}" placeholder="${esc(placeholder)}">${esc(p[k]||"")}</textarea></div>`).join("")}
 <button>Guardar cambios</button> <a class="btn secondary" href="#/perfil">Cancelar</a></form></main>`);
 $("#edit").onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.target),d=read(),x=d.users.find(a=>a.id===u.id);
  x.name=String(f.get("name")).trim();x.phone=String(f.get("phone")).trim();x.profile=x.profile||{};
  fields.forEach(([k])=>x.profile[k]=String(f.get(k)).trim());save(d);go("#/perfil");
 };
}
function publish(){
 const u=current();if(!u)return go("#/acceso");if(u.role!=="employer")return go("#/perfil");
 shell(`<main class="container"><form class="form-card" id="publish"><h1>Publicar una oferta de trabajo</h1><p class="muted">Describe claramente el puesto y las condiciones.</p>
 <div class="field"><label>Título de la oferta</label><input name="title" required placeholder="Ej. Ama de llaves para hogar familiar"></div>
 <div class="field"><label>Ubicación</label><input name="location" required placeholder="Ciudad o zona"></div>
 <div class="row"><div class="field"><label>Modalidad</label><select name="schedule"><option>Tiempo completo</option><option>Medio tiempo</option><option>Por días</option><option>Por horas</option><option>Temporal</option></select></div>
 <div class="field"><label>Remuneración (opcional)</label><input name="pay" placeholder="Ej. $400 al mes / a convenir"></div></div>
 <div class="field"><label>Responsabilidades y tareas</label><textarea name="description" required placeholder="Describe las tareas principales del puesto."></textarea></div>
 <div class="field"><label>Requisitos y experiencia</label><textarea name="requirements" placeholder="Experiencia, referencias, habilidades, etc."></textarea></div>
 <button>Publicar oferta</button></form></main>`);
 $("#publish").onsubmit=e=>{
  e.preventDefault();const f=new FormData(e.target),d=read();
  d.jobs.push({id:"j"+Date.now(),ownerId:u.id,ownerName:u.name,title:String(f.get("title")).trim(),location:String(f.get("location")).trim(),schedule:f.get("schedule"),pay:String(f.get("pay")).trim(),description:String(f.get("description")).trim(),requirements:String(f.get("requirements")).trim(),created:new Date().toISOString()});
  save(d);go("#/mis-ofertas");
 };
}
function jobCards(items,showApply=false){
 if(!items.length)return '<div class="empty">Todavía no hay ofertas que coincidan. Vuelve pronto para ver nuevas oportunidades.</div>';
 return `<div class="grid">${items.map(j=>{
  const owner=read().users.find(u=>u.id===j.ownerId),already=read().applications.some(a=>a.jobId===j.id&&a.workerId===current()?.id);
  return `<article class="card listing-card"><span class="tag">${esc(j.schedule)}</span><h3>${esc(j.title)}</h3><div class="meta">📍 ${esc(j.location)} · Publicado por ${esc(j.ownerName)}</div><p>${esc(j.description)}</p>${j.requirements?`<p><b>Requisitos:</b> ${esc(j.requirements)}</p>`:""}<p class="price">${esc(j.pay||"Remuneración a convenir")}</p>
  ${showApply?(already?'<span class="tag">Solicitud enviada</span>':`<button onclick="applyJob('${esc(j.id)}')">Enviar solicitud</button>`):""}
  ${owner&&owner.phone?`<a class="btn secondary" href="${contactLink(owner.phone)}">Contactar</a>`:""}
  </article>`;
 }).join("")}</div>`;
}
function contactLink(value){
 const v=String(value||"").trim(),digits=v.replace(/[^0-9+]/g,"");
 if(v.includes("@"))return "mailto:"+encodeURIComponent(v);
 return digits.length>=7?"https://wa.me/"+digits.replace(/\D/g,""):"#";
}
window.applyJob=function(id){
 const u=current();if(!u){go("#/acceso");return;}if(u.role!=="worker"){alert("Solo las amas de llaves pueden enviar solicitudes.");return;}
 const d=read();if(d.applications.some(a=>a.jobId===id&&a.workerId===u.id)){alert("Ya enviaste una solicitud para esta oferta.");return;}
 d.applications.push({id:"a"+Date.now(),jobId:id,workerId:u.id,created:new Date().toISOString(),status:"Recibida"});save(d);go("#/empleos");
};
function jobsPage(){
 const u=current();shell(`<section class="page-head"><h1>Ofertas de empleo</h1><p class="muted">Encuentra oportunidades que se adapten a tu experiencia y disponibilidad.</p></section>
 <main class="container"><div class="searchbar"><input id="q" placeholder="Buscar por puesto, ubicación o tareas"><button onclick="filterJobs()">Buscar</button></div><div id="results">${jobCards(read().jobs.slice().reverse(),u?.role==="worker")}</div></main>`);
}
window.filterJobs=()=>{
 const q=$("#q").value.toLowerCase(),u=current();
 const list=read().jobs.slice().reverse().filter(j=>[j.title,j.location,j.description,j.requirements,j.schedule].join(" ").toLowerCase().includes(q));
 $("#results").innerHTML=jobCards(list,u?.role==="worker");
};
function applicationsPage(){
 const u=current();if(!u)return go("#/acceso");if(u.role!=="employer")return go("#/perfil");
 const d=read(),mine=d.jobs.filter(j=>j.ownerId===u.id);
 const rows=mine.map(j=>{
  const apps=d.applications.filter(a=>a.jobId===j.id);
  return `<article class="card listing-card"><h3>${esc(j.title)}</h3><p class="meta">${apps.length} solicitud(es) recibida(s)</p>
  ${apps.length?`<div class="grid">${apps.map(a=>{const w=d.users.find(x=>x.id===a.workerId);if(!w)return "";return `<div class="detail-box"><b>${esc(w.name)}</b><p>${esc(w.email)} · ${esc(w.phone||"Sin teléfono")}</p><p>${esc(w.profile?.headline||"Presentación pendiente")}</p><span class="tag">${esc(a.status)}</span></div>`}).join("")}</div>`:'<p class="muted">Aún no has recibido solicitudes para esta oferta.</p>'}</article>`;
 }).join("");
 shell(`<section class="page-head"><h1>Solicitudes recibidas</h1><p class="muted">Revisa las personas interesadas en tus ofertas.</p></section><main class="container">${rows||'<div class="empty">Todavía no has publicado ofertas de trabajo.</div>'}</main>`);
}
function myJobs(){
 const u=current();if(!u)return go("#/acceso");if(u.role!=="employer")return go("#/perfil");
 const list=read().jobs.filter(j=>j.ownerId===u.id);
 shell(`<section class="page-head"><h1>Mis ofertas de trabajo</h1><p class="muted">Administra las oportunidades que has publicado.</p></section><main class="container"><div class="actions"><a class="btn" href="#/publicar">+ Publicar oferta</a><a class="btn secondary" href="#/solicitudes">Ver solicitudes</a></div>
 ${list.length?`<div class="grid">${list.map(j=>`<article class="card listing-card"><h3>${esc(j.title)}</h3><p>📍 ${esc(j.location)} · ${esc(j.schedule)}</p><p>${esc(j.description)}</p><div class="actions"><button class="danger" onclick="deleteJob('${esc(j.id)}')">Eliminar oferta</button></div></article>`).join("")}</div>`:'<div class="empty">Todavía no has publicado ofertas.</div>'}</main>`);
}
window.deleteJob=function(id){
 if(!confirm("¿Eliminar esta oferta y sus solicitudes?"))return;
 const d=read();d.jobs=d.jobs.filter(j=>j.id!==id);d.applications=d.applications.filter(a=>a.jobId!==id);save(d);myJobs();
};
function workersPage(){
 const u=current();if(!u)return go("#/acceso");if(u.role!=="employer")return go("#/perfil");
 const list=read().users.filter(x=>x.role==="worker");
 shell(`<section class="page-head"><h1>Encuentra talento para tu hogar</h1><p class="muted">Conoce perfiles, experiencia y disponibilidad de amas de llaves.</p></section>
 <main class="container"><div class="searchbar"><input id="q" placeholder="Buscar por nombre, zona o habilidad"><button onclick="filterWorkers()">Buscar</button></div><div id="results">${workerCards(list)}</div></main>`);
}
function workerCards(items){
 if(!items.length)return '<div class="empty">Todavía no hay perfiles publicados. Vuelve pronto para encontrar candidatas.</div>';
 return `<div class="grid">${items.map(w=>{const p=w.profile||{};return `<article class="card listing-card"><div class="profile"><div class="avatar">${esc(w.name.charAt(0).toUpperCase())}</div><div><h3>${esc(w.name)}</h3><span class="tag">Ama de llaves</span><p class="meta">${esc(p.location||"Ubicación pendiente")}</p></div></div><p>${esc(p.headline||"Presentación profesional pendiente.")}</p><p><b>Experiencia:</b> ${esc(p.experience||"Por completar")}</p><p><b>Habilidades:</b> ${esc(p.skills||"Por completar")}</p><p><b>Disponibilidad:</b> ${esc(p.availability||"Por confirmar")}</p><p><b>Referencias:</b> ${esc(p.references||"No indicadas")}</p>${w.phone?`<a class="btn secondary" href="${contactLink(w.phone)}">Contactar</a>`:""}</article>`}).join("")}</div>`;
}
window.filterWorkers=()=>{
 const q=$("#q").value.toLowerCase(),list=read().users.filter(x=>x.role==="worker");
 $("#results").innerHTML=workerCards(list.filter(w=>[w.name,...Object.values(w.profile||{})].join(" ").toLowerCase().includes(q)));
};
function dashboard(){
 const u=current();if(!u)return go("#/acceso");
 const worker=u.role==="worker",d=read(),mine=d.jobs.filter(j=>j.ownerId===u.id);
 const applications=worker?d.applications.filter(a=>a.workerId===u.id):d.applications.filter(a=>mine.some(j=>j.id===a.jobId));
 shell(`<main class="container"><div class="section-row"><div><div class="tag">${worker?"Ama de llaves":"Contratador"}</div><h1 style="font:500 38px Georgia,serif;color:var(--green-dark);margin:9px 0">¡Hola, ${esc(u.name.split(" ")[0])}!</h1><p class="muted">${worker?"Tu próximo trabajo puede comenzar aquí.":"Encuentra el apoyo que tu hogar necesita."}</p></div><a class="btn secondary" href="#/perfil">Ver mi perfil</a></div>
 <div class="stats"><div class="stat"><strong>${worker?d.jobs.length:read().users.filter(x=>x.role==="worker").length}</strong><span>${worker?"Ofertas disponibles":"Perfiles disponibles"}</span></div><div class="stat"><strong>${worker?applications.length:mine.length}</strong><span>${worker?"Mis solicitudes":"Mis ofertas"}</span></div><div class="stat"><strong>${worker?(u.profile?.headline? "Completo":"Pendiente"):(u.profile?.needs?"Completo":"Pendiente")}</strong><span>Perfil</span></div></div>
 <div class="actions">${worker?'<a class="btn" href="#/empleos">Explorar empleos</a>':'<a class="btn" href="#/publicar">Publicar una oferta</a><a class="btn secondary" href="#/candidatas">Ver amas de llaves</a>'}</div>
 <h2 class="section-title" style="text-align:left;margin-top:30px">${worker?"Ofertas recientes":"Mis ofertas recientes"}</h2>
 ${worker?jobCards(d.jobs.slice().reverse().slice(0,3),true):jobCards(mine.slice().reverse().slice(0,3))}
 </main>`);
}
function about(){
 shell(`<section class="page-head"><h1>Sobre HomeCare Connect</h1><p class="muted">Una comunidad donde el cuidado del hogar y el talento se encuentran.</p></section>
 <main class="container"><div class="grid">
 <article class="card feature"><div class="emoji">🌱</div><h3>Misión</h3><p>Facilitar el encuentro entre amas de llaves que buscan oportunidades laborales y hogares que necesitan apoyo, promoviendo conexiones claras y respetuosas.</p></article>
 <article class="card feature"><div class="emoji">🏡</div><h3>Visión</h3><p>Ser una plataforma de referencia para encontrar y ofrecer oportunidades de trabajo relacionadas con el cuidado y la organización del hogar.</p></article>
 <article class="card feature"><div class="emoji">🤍</div><h3>Valores</h3><p>Respeto, confianza, responsabilidad, empatía y valoración del trabajo doméstico.</p></article>
 </div></main>`);
}
function route(){
 const p=location.hash.slice(1).split("/").filter(Boolean);
 if(!p.length)return home();
 switch(p[0]){
  case "acceso":return access();
  case "registro":return register(p[1]==="employer"?"employer":"worker");
  case "login":return login(p[1]==="employer"?"employer":"worker");
  case "perfil":return profile();
  case "editar-perfil":return editProfile();
  case "panel":return dashboard();
  case "publicar":return publish();
  case "empleos":return jobsPage();
  case "candidatas":return workersPage();
  case "mis-ofertas":return myJobs();
  case "solicitudes":return applicationsPage();
  case "sobre":return about();
  case "salir":sessionStorage.removeItem("hc_session");go("#/");return;
  default:return home();
 }
}
window.addEventListener("hashchange",route);
try{route();window.__homecareLoaded=true;}catch(error){
 console.error("Error al iniciar HomeCare Connect:",error);
 app.innerHTML=`<main class="container"><div class="form-card"><h1>No se pudo cargar HomeCare Connect</h1><p>Comprueba que index.html esté junto a app.js y app.css.</p><p class="small">${esc(error.message||error)}</p><button onclick="location.reload()">Volver a intentar</button></div></main>`;
}
