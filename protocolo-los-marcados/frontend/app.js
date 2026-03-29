/**
 * CineCritik — Frontend SPA (Vanilla JS)
 * Flujo obligatorio: Login → Dashboard → Póster → Modal de detalles.
 * Login se valida contra backend Java (/api/login).
 * Linterna: CSS vars --mx/--my para máscara radial.
 * Glitch: hover sobre spans .secret (private) dispara micro-parpadeo.
 */
(function(){
  "use strict";

  function $(id){ return document.getElementById(id); }
  function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
  function now(){ return (typeof performance!=="undefined") ? performance.now() : Date.now(); }

  var viewLogin = $("view-login");
  var viewDash = $("view-dashboard");
  var viewRegistro = $("view-registro");
  var viewGaleria = $("view-galeria");
  var viewPoster = $("view-poster");
  var flashlight = $("flashlight");
  var glitch = $("screen-glitch");

  // Audio ambiente (opcional, por ítem)
  var bgAudio = new Audio();
  bgAudio.loop = true;
  bgAudio.volume = 0.25;

  function setBackgroundAudio(dataUrl){
    try{
      if (!dataUrl){
        bgAudio.pause();
        bgAudio.removeAttribute("src");
        bgAudio.load();
        return;
      }
      if (bgAudio.src === dataUrl) return;
      bgAudio.src = dataUrl;
      bgAudio.play().catch(function(){ /* requiere interacción previa */ });
    }catch(_){}
  }

  var session = { token: "" };
  var globalForumData = []; // Array of { id, multimediaId, likes, dislikes, etc }
  var lastView = null; // Para volver a la vista anterior (ej. Foro o Galería)

  function updateGlobalMatchScores() {
    // Si estamos en el Hero del Dashboard, actualizar
    if (viewDash && viewDash.classList.contains("view--active")) {
      loadDashboardHero();
    }
    // Si la galería está activa, refrescar
    if (viewGaleria && viewGaleria.classList.contains("view--active")) {
       renderGallery();
    }
    // Si el poster está abierto, actualizar su match score
    if (viewPoster && viewPoster.classList.contains("view--active") && typeof selectedItem !== "undefined") {
      var infoMatch = $("poster-info-match");
      if (infoMatch) infoMatch.textContent = getMatchScore(selectedItem);
    }
  }

  async function renderTop10() {
    var container = $("top10-container");
    var section = $("top10-section");
    if (!container || !section) return;

    // Usar directamente globalForumData para que todos vean lo mismo
    // Ordenar por porcentaje de aprobación y votos totales
    var ranked = globalForumData.slice().sort(function(a, b) {
        var al = parseInt(a.likes) || 0, ad = parseInt(a.dislikes) || 0;
        var bl = parseInt(b.likes) || 0, bd = parseInt(b.dislikes) || 0;
        
        var at = al + ad, bt = bl + bd;
        var ap = at === 0 ? 0 : (al / at);
        var bp = bt === 0 ? 0 : (bl / bt);
        
        if (bp !== ap) return bp - ap;
        return bt - at;
    }).slice(0, 10);

    if (ranked.length > 0) {
        section.hidden = false;
        container.innerHTML = "";
        ranked.forEach(function(item, index) {
            var card = document.createElement("div");
            card.className = "top10-card";
            var img = item.posterDataUrl ? "background-image:url('" + String(item.posterDataUrl).replace(/'/g, "%27") + "');" : "";
            card.innerHTML = 
                "<div class=\"top10-rank\">" + (index + 1) + "</div>" +
                "<div class=\"top10-img\" style=\"" + img + "\"></div>";
            
            // Al hacer clic, scrollear hasta la publicación en el foro
            card.onclick = function() {
                var el = document.getElementById("forum-post-" + item.id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Glitch visual para resaltar
                    el.classList.add("glitch-highlight");
                    setTimeout(function(){ el.classList.remove("glitch-highlight"); }, 2000);
                }
            };
            container.appendChild(card);
        });
    } else {
        section.hidden = true;
    }
  }

  function authHeaders(){
    return session.token ? { "X-Auth": session.token } : {};
  }

  async function syncForumData() {
    try {
      var res = await fetch("/api/forum/list", { headers: authHeaders() });
      if (res.ok) {
        var data = await res.json();
        globalForumData = data.posts || [];
      }
    } catch(e) { console.error("Sync fail", e); }
  }

  function setView(next){
    // Guardar la vista actual como la anterior (si no es el poster)
    var current = [viewLogin, viewUserRegister, viewDash, viewRegistro, viewGaleria, viewForo].find(function(v){
      return v && v.classList.contains("view--active");
    });
    if (current && next === viewPoster) lastView = current;

    // Incluir TODAS las vistas para evitar overlays residuales (ej. Foro/Registro usuario)
    [viewLogin, viewUserRegister, viewDash, viewRegistro, viewGaleria, viewForo, viewPoster].filter(Boolean).forEach(function(v){
      v.classList.remove("view--active","fade-in","fade-out");
      v.style.display = "none";
    });
    next.style.display = "block";
    next.classList.add("view--active","fade-in");
    if (flashlight){
      if (next === viewPoster) flashlight.classList.add("is-on");
      else flashlight.classList.remove("is-on");
    }

    // Si sales a login/dashboard, cortamos audio
    if (next === viewLogin || next === viewDash){
      setBackgroundAudio("");
    }
    
    if (next === viewDash && typeof loadDashboardHero === "function") {
      loadDashboardHero();
    }
  }

  function flashGlitch(){
    if (!glitch) return;
    glitch.classList.remove("is-on");
    void glitch.offsetWidth;
    glitch.classList.add("is-on");
  }

  function getMatchScore(item) {
    var l = 0, d = 0;
    // Si es un item del foro directamente (cuando hacemos clic desde el foro)
    if (typeof item.likes !== "undefined") {
      l = parseInt(item.likes) || 0;
      d = parseInt(item.dislikes) || 0;
    } else {
      // Es un ítem de la galería, buscar su correspondiente en el foro por multimediaId
      var match = globalForumData.find(function(p){ 
        return Number(p.multimediaId) == Number(item.id); 
      });
      if (match) {
        l = parseInt(match.likes) || 0;
        d = parseInt(match.dislikes) || 0;
      }
    }
    var t = l + d;
    return t === 0 ? "Nuevo" : Math.round((l/t)*100) + "% de coincidencia";
  }

  function openPoster(item) {
    selectedItem = item;
    var pCenter = $("poster-center");
    var pCard = $("poster-card-detail");
    var btnPlayTitle = $("btn-play-title");

    if(pCenter) { 
      pCenter.style.opacity = "1"; 
      pCenter.style.transform = "scale(1)"; 
      pCenter.style.pointerEvents = "auto"; 
      pCenter.style.display = "flex";
    }
    if(pCard) { 
      pCard.style.display = "none";
      pCard.style.opacity = "0"; 
      pCard.style.transform = "translateY(20px)"; 
      pCard.style.pointerEvents = "none"; 
    }
    if(btnPlayTitle) {
      btnPlayTitle.style.display = "block";
      btnPlayTitle.style.opacity = "1";
    }

    var pTitle = $("poster-title");
    if (pTitle) {
      pTitle.textContent = (item.titulo || "CINECRITIK").toUpperCase();
      pTitle.style.display = "block";
      pTitle.style.opacity = "1";
    }
    
    var infoMatch = $("poster-info-match"); if(infoMatch) infoMatch.textContent = getMatchScore(item);
    var infoYear = $("poster-info-year"); if(infoYear) infoYear.textContent = item.anio || "";
    var infoGenre = $("poster-info-genre"); if(infoGenre) infoGenre.textContent = item.genero || "";
    var infoDesc = $("poster-info-desc"); if(infoDesc) infoDesc.textContent = item.descripcion || "Sin descripción.";

    var stage = $("poster-stage");
    if (stage && item.posterDataUrl){
      stage.style.backgroundImage = "linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.8)), url('" + String(item.posterDataUrl).replace(/'/g, "%27") + "')";
      stage.style.backgroundSize = "cover";
      stage.style.backgroundPosition = "center";
    } else if (stage) {
      stage.style.backgroundImage = "";
    }
    setBackgroundAudio(item.audioDataUrl || "");
    setView($("view-poster"));
    
    if (btnPlayTitle) {
       btnPlayTitle.onclick = function() {
          btnPlayTitle.style.opacity = "0";
          if(pTitle) pTitle.style.opacity = "0";
          if(stage) stage.style.backgroundPosition = "center 20%"; // Shift image up (shows top part)
          setTimeout(function(){
            if(pTitle) pTitle.style.display = "none";
            if(btnPlayTitle) btnPlayTitle.style.display = "none";
            if(pCard) { 
              pCard.style.display = "block";
              // Reflow needed for transition
              void pCard.offsetWidth;
              pCard.style.opacity = "1"; 
              pCard.style.transform = "translateY(0)"; 
              pCard.style.pointerEvents = "auto"; 
            }
          }, 400);
       };
    }

    var btnPlayMovie = $("btn-play-movie");
    if (btnPlayMovie) {
      if (item.streamingUrl && item.streamingUrl.startsWith("http")) {
        btnPlayMovie.textContent = "Ir al sitio";
        btnPlayMovie.disabled = false;
        btnPlayMovie.style.opacity = "1";
        btnPlayMovie.onclick = function() {
          window.open(item.streamingUrl, "_blank");
        };
      } else {
        btnPlayMovie.textContent = "No disponible";
        btnPlayMovie.disabled = true;
        btnPlayMovie.style.opacity = "0.5";
        btnPlayMovie.onclick = null;
      }
    }
  }

  async function loadDashboardHero() {
    var heroHeader = $("hero-header");
    if (!heroHeader) return;
    try {
      await syncForumData();
      var data = await apiCatalogo();
      var items = (data && data.items) || [];
      if (items.length > 0) {
        var last = items[items.length - 1];
        
        var titleEl = $("hero-title"); if(titleEl) titleEl.textContent = last.titulo;
        var infoMatch = $("hero-match"); if(infoMatch) infoMatch.textContent = getMatchScore(last);
        var yearEl = $("hero-year"); if(yearEl) yearEl.textContent = last.anio;
        var genreEl = $("hero-genre"); if(genreEl) genreEl.textContent = last.genero;
        var descEl = $("hero-desc"); if(descEl) descEl.textContent = last.descripcion || "Sin descripción.";
        if (last.posterDataUrl) {
          heroHeader.style.backgroundImage = "linear-gradient(to top, var(--bg-main) 0%, transparent 60%), url('" + String(last.posterDataUrl).replace(/'/g, "%27") + "')";
        } else {
          heroHeader.style.backgroundImage = "linear-gradient(to top, var(--bg-main) 0%, transparent 60%), linear-gradient(135deg, #111, #333)";
        }
        
        var clickHandler = function() { openPoster(last); };
        var playBtn = $("hero-play");
        if(playBtn) playBtn.onclick = clickHandler;
        if(titleEl) { titleEl.style.cursor = "pointer"; titleEl.onclick = clickHandler; }
      } else {
        var titleEl = $("hero-title"); if(titleEl) titleEl.innerHTML = "¡Aún no hay<br>contenido!";
        var descEl = $("hero-desc"); if(descEl) descEl.textContent = "Sube tu primera película o serie al catálogo para verla aquí.";
        heroHeader.style.backgroundImage = "linear-gradient(to top, var(--bg-main) 0%, transparent 60%), linear-gradient(135deg, #1f222d, #0b0c10)";
        var playBtn = $("hero-play");
        if(playBtn) { playBtn.onclick = function() { setView($("view-registro")); }; playBtn.textContent = "Subir Contenido"; }
      }
    } catch(e) {}
  }

  /* ================= Login ================= */
  var loginForm = $("login-form");
  var loginUser = $("login-username");
  var loginPass = $("login-password");
  var btnGoRegister = $("btn-go-register");
  var btnFillHint = $("btn-fill-hint");
  var verify = $("verify");
  var fill = $("retro-fill") || document.createElement("div");
  var status = $("verify-status");

  var verifying = false;

  function runRetro(ok, done){
    verifying = true;
    verify.hidden = false;
    status.textContent = "[ estableciendo enlace ]";
    fill.style.width = "0%";
    var t0 = now();
    var dur = 1150;
    function tick(){
      var p = clamp((now()-t0)/dur, 0, 1);
      fill.style.width = Math.round(p*100) + "%";
      if (p < 1){ requestAnimationFrame(tick); return; }
      status.textContent = ok ? "[ acceso concedido ]" : "[ acceso denegado ]";
      verifying = false;
      setTimeout(done, ok ? 320 : 650);
    }
    requestAnimationFrame(tick);
  }

  async function apiLogin(username, password){
    var res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    if (!res.ok){
      return { ok: false };
    }
    return await res.json();
  }

  async function apiRegister(username, password){
    var res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    var data;
    try { data = await res.json(); } catch (_) { data = { ok:false }; }
    if (!res.ok) return data || { ok:false };
    return data;
  }

  // Navegación a registro de usuario
  var viewUserRegister = $("view-user-register");
  var btnBackLogin = $("btn-back-login");
  var btnUseCreated = $("btn-use-created");
  var userRegForm = $("user-register-form");
  var regUser = $("reg-user");
  var regPass = $("reg-pass");
  var regPass2 = $("reg-pass2");
  var userRegisterStatus = $("user-register-status");
  var lastCreated = { username:"", password:"" };

  if (btnGoRegister){
    btnGoRegister.addEventListener("click", function(){
      if (viewUserRegister) setView(viewUserRegister);
    });
  }
  if (btnBackLogin){
    btnBackLogin.addEventListener("click", function(){
      setView(viewLogin);
    });
  }
  if (btnUseCreated){
    btnUseCreated.addEventListener("click", function(){
      if (!lastCreated.username){
        flashGlitch();
        if (userRegisterStatus) userRegisterStatus.textContent = "Primero crea un acceso.";
        return;
      }
      if (loginUser) loginUser.value = lastCreated.username;
      if (loginPass) loginPass.value = lastCreated.password;
      setView(viewLogin);
    });
  }

  if (userRegForm){
    userRegForm.addEventListener("submit", async function(e){
      e.preventDefault();
      var u = (regUser.value || "").trim();
      var p1 = String(regPass.value || "");
      var p2 = String(regPass2.value || "");
      if (u.length < 3){
        flashGlitch();
        userRegisterStatus.textContent = "El usuario debe tener al menos 3 caracteres.";
        return;
      }
      if (p1.length < 4){
        flashGlitch();
        userRegisterStatus.textContent = "La contraseña debe tener al menos 4 caracteres.";
        return;
      }
      if (p1 !== p2){
        flashGlitch();
        userRegisterStatus.textContent = "Las contraseñas no coinciden.";
        return;
      }
      userRegisterStatus.textContent = "Registrando…";
      try{
        var r = await apiRegister(u, p1);
        if (!r || !r.ok){
          flashGlitch();
          userRegisterStatus.textContent = (r && r.error) ? r.error : "No se pudo registrar.";
          return;
        }
        flashGlitch();
        lastCreated.username = u;
        lastCreated.password = p1;
        userRegisterStatus.textContent = "Acceso creado. Puedes usarlo para iniciar sesión.";
      }catch(_){
        flashGlitch();
        userRegisterStatus.textContent = "No se pudo registrar. (¿Servidor Java corriendo?)";
      }
    });
  }

  if (btnFillHint){
    btnFillHint.addEventListener("click", function(){
      loginUser.value = "andres";
      loginPass.value = "cine";
    });
  }

  if (loginForm){
    loginForm.addEventListener("submit", async function(e){
      e.preventDefault();
      if (verifying) return;
      var u = (loginUser.value||"").trim();
      var p = String(loginPass.value||"");
      var ok = false;
      try{
        var r = await apiLogin(u,p);
        ok = !!(r && r.ok);
        if (ok && r.token){
          session.token = r.token;
          session.username = r.username || u;
        }
      }catch(_){
        ok = false;
      }

      runRetro(ok, function(){
        if (!ok){
          flashGlitch();
          status.textContent = "[ credenciales inválidas o servidor apagado ]";
          fill.style.width = "0%";
          return;
        }
        viewLogin.classList.add("fade-out");
        setTimeout(function(){ setView(viewDash); }, 450);
      });
    });
  }

  /* ================= Dashboard ================= */
  var btnRegistro = $("btn-registro");
  var btnGaleria = $("btn-galeria");
  var btnForo = $("btn-foro");
  var btnLogout = $("btn-logout");

  async function apiInfo(){
    var res = await fetch("/api/info", { method:"GET", headers: authHeaders() });
    if (!res.ok) throw new Error("info fail");
    return await res.json();
  }

  async function apiCatalogo(){
    var res = await fetch("/api/catalogo", { method:"GET", headers: authHeaders() });
    if (!res.ok) throw new Error("catalogo fail");
    return await res.json();
  }

  async function apiAgregar(payload){
    var res = await fetch("/api/catalogo/agregar", {
      method:"POST",
      headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("agregar fail");
    return await res.json();
  }

  async function apiForumPublish(id){
    var res = await fetch("/api/forum/publicar", {
      method:"POST",
      headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
      body: JSON.stringify({ id: id })
    });
    var data;
    try { data = await res.json(); } catch (_) { data = { ok:false }; }
    if (!res.ok) throw new Error(data && data.error ? data.error : "publicar fail");
    return data;
  }

  async function apiForumList(){
    var res = await fetch("/api/forum/list", { method:"GET" });
    if (!res.ok) throw new Error("forum list fail");
    return await res.json();
  }

  async function apiForumComments(postId){
    var res = await fetch("/api/forum/comments?postId=" + encodeURIComponent(postId), { method:"GET" });
    if (!res.ok) throw new Error("forum comments fail");
    return await res.json();
  }

  async function apiForumComment(postId, texto){
    var res = await fetch("/api/forum/comment", {
      method:"POST",
      headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
      body: JSON.stringify({ postId: postId, texto: texto })
    });
    if (!res.ok) throw new Error("forum comment fail");
    return res.json();
  }
  async function apiForumVote(postId, isLike){
    var res = await fetch("/api/forum/vote", {
      method:"POST",
      headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
      body: JSON.stringify({ postId: postId, isLike: isLike })
    });
    if (!res.ok) throw new Error("vote fail");
    return res.json();
  }
  async function apiForumDelete(postId){
    var res = await fetch("/api/forum/delete", {
      method:"POST",
      headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
      body: JSON.stringify({ postId: postId })
    });
    if (!res.ok) throw new Error("delete fail");
    return res.json();
  }
  if (btnRegistro){
    btnRegistro.addEventListener("click", function(){
      setView(viewRegistro);
    });
  }
  if (btnGaleria){
    btnGaleria.addEventListener("click", async function(){
      setView(viewGaleria);
      await renderGallery();
    });
  }

  var viewForo = $("view-foro");
  var forum = $("forum");
  var btnForoBack = $("btn-foro-back");

  if (btnForo){
    btnForo.addEventListener("click", async function(){
      if (viewForo) setView(viewForo);
      await renderForum();
    });
  }
  if (btnForoBack){
    btnForoBack.addEventListener("click", function(){
      setView(viewDash);
    });
  }
  if (btnLogout){
    btnLogout.addEventListener("click", function(){
      verify.hidden = true;
      fill.style.width = "0%";
      status.textContent = "[ esperando respuesta ]";
      loginPass.value = "";
      setView(viewLogin);
    });
  }

  /* ================= Registro de archivos ================= */
  var btnRegistroBack = $("btn-registro-back");
  var regForm = $("registro-form");
  var regTipo = $("reg-tipo");
  var regTitulo = $("reg-titulo");
  var regAnio = $("reg-anio");
  var regGenero = $("reg-genero");
  var regDesc = $("reg-descripcion");
  var regDur = $("reg-duracion");
  var regTemps = $("reg-temporadas");
  var regEpis = $("reg-episodios");
  var regStreamUrl = $("reg-streaming-url");
  var lblStreamUrl = $("lbl-streaming-url");
  var wrapDur = $("duracion-wrap");
  var wrapTemps = $("temporadas-wrap");
  var wrapEpis = $("episodios-wrap");
  var regStatus = $("registro-status");
  var btnPosterFile = $("btn-poster-file");
  var btnClearFile = $("btn-clear-file");
  var posterFile = $("poster-file");
  var posterPreview = $("poster-preview");
  var posterFit = $("poster-fit");
  var posterFocus = $("poster-focus");
  var selectedPosterDataUrl = "";
  var btnAudioFile = $("btn-audio-file");
  var btnClearAudio = $("btn-clear-audio");
  var audioFile = $("audio-file");
  var audioHint = $("audio-hint");
  var audioPreview = $("audio-preview");
  var selectedAudioDataUrl = "";

  function fillYearOptions(){
    if (!regAnio) return;
    regAnio.innerHTML = "";
    var current = new Date().getFullYear();
    var start = 1970;
    var end = current + 2;
    for (var y = end; y >= start; y--){
      var opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      if (y === current) opt.selected = true;
      regAnio.appendChild(opt);
    }
  }
  fillYearOptions();

  function syncTipo(){
    var t = (regTipo && regTipo.value) || "Pelicula";
    // Si la opción dice "película" (o con tilde), la normalizamos sacando tildes:
    var tNormal = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    var isSerieOrAnime = (tNormal === "serie" || tNormal === "anime");
    if (wrapTemps) wrapTemps.hidden = !isSerieOrAnime;
    if (wrapEpis) wrapEpis.hidden = !isSerieOrAnime;
    if (wrapDur) wrapDur.hidden = isSerieOrAnime;
    
    // Etiqueta dinámica para el link
    if (lblStreamUrl) {
      if (tNormal === "serie") lblStreamUrl.textContent = "Link de la serie";
      else if (tNormal === "anime") lblStreamUrl.textContent = "Link del anime";
      else lblStreamUrl.textContent = "Link de la película";
    }
  }
  if (regTipo) regTipo.addEventListener("change", syncTipo);
  syncTipo();

  if (btnRegistroBack){
    btnRegistroBack.addEventListener("click", function(){
      setView(viewDash);
    });
  }

  if (regForm){
    regForm.addEventListener("submit", async function(e){
      e.preventDefault();
      try{
        var tNormal = String(regTipo.value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        var isSerieOrAnime = (tNormal === "serie" || tNormal === "anime");
        var payload = {
          id: editMode.id || 0,
          tipo: regTipo.value,
          titulo: (regTitulo.value||"").trim(),
          anio: Number(regAnio.value||2026),
          genero: (regGenero.value||"").trim(),
          descripcion: (regDesc.value||"").trim(),
          streamingUrl: (regStreamUrl ? regStreamUrl.value : "").trim(),
          duracionMin: isSerieOrAnime ? 0 : Number(regDur.value||92),
          temporadas: isSerieOrAnime ? Number(regTemps.value||1) : 0,
          episodios: isSerieOrAnime ? Number(regEpis.value||12) : 0,
          posterDataUrl: selectedPosterDataUrl,
          audioDataUrl: selectedAudioDataUrl
        };
        regStatus.textContent = "Registrando…";
        var r = editMode.id ? await apiEditar(payload) : await apiAgregar(payload);
        flashGlitch();
        regStatus.textContent = r && r.ok ? ((editMode.id ? "Actualizado: " : "Registrado en catálogo: ") + r.item.titulo) : "Error al registrar.";
        if (r && r.ok){
          var fit = (posterFit && posterFit.value) || "cover";
          var focus = (posterFocus && posterFocus.value) || "center";
          var idToSave = editMode.id || (r.item && r.item.id) || 0;
          if (idToSave) saveImagePrefs(idToSave, fit, focus);

          if (!editMode.id){
            clearPoster();
            clearAudio();
            regForm.reset();
            fillYearOptions();
            syncTipo();
          }else{
            editMode.id = 0;
            editMode.original = null;
          }
          setView(viewGaleria);
          renderGallery();
        }
      }catch(_){
        flashGlitch();
        regStatus.textContent = "No se pudo registrar. (¿Servidor Java corriendo?)";
      }
    });
  }

  function clearPoster(){
    selectedPosterDataUrl = "";
    if (posterPreview){
      posterPreview.style.backgroundImage = "";
      posterPreview.style.backgroundSize = "";
      posterPreview.style.backgroundPosition = "";
      posterPreview.style.backgroundRepeat = "";
      posterPreview.style.backgroundColor = "";
    }
    if (posterFile) posterFile.value = "";
  }
  function clearAudio(){
    selectedAudioDataUrl = "";
    if (audioFile) audioFile.value = "";
    if (audioHint) audioHint.textContent = "Sin audio cargado.";
    if (audioPreview) audioPreview.style.backgroundImage = "";
  }

  if (btnPosterFile && posterFile){
    btnPosterFile.addEventListener("click", function(){ posterFile.click(); });
  }
  if (btnClearFile){
    btnClearFile.addEventListener("click", clearPoster);
  }
  if (posterFile){
    posterFile.addEventListener("change", function(){
      var f = posterFile.files && posterFile.files[0];
      if (!f) return;
      if (f.size > 700 * 1024){
        flashGlitch();
        regStatus.textContent = "Imagen demasiado grande. Usa una menor a 700KB.";
        clearPoster();
        return;
      }
      var reader = new FileReader();
      reader.onload = function(){
        selectedPosterDataUrl = String(reader.result || "");
        if (posterPreview){
          posterPreview.style.backgroundImage = "url('" + selectedPosterDataUrl.replace(/'/g, "%27") + "')";
          applyPosterPreviewFit();
        }
      };
      reader.readAsDataURL(f);
    });
  }

  function applyPosterPreviewFit(){
    if (!posterPreview) return;
    var fit = (posterFit && posterFit.value) || "cover";
    var focus = (posterFocus && posterFocus.value) || "center";
    if (fit === "contain"){
      posterPreview.style.backgroundSize = "contain";
      posterPreview.style.backgroundRepeat = "no-repeat";
      posterPreview.style.backgroundColor = "rgba(0,0,0,.35)";
    }else{
      posterPreview.style.backgroundSize = "cover";
      posterPreview.style.backgroundRepeat = "no-repeat";
      posterPreview.style.backgroundColor = "";
    }
    if (focus === "top") posterPreview.style.backgroundPosition = "50% 15%";
    else if (focus === "bottom") posterPreview.style.backgroundPosition = "50% 85%";
    else posterPreview.style.backgroundPosition = "center";
  }
  if (posterFit) posterFit.addEventListener("change", applyPosterPreviewFit);
  if (posterFocus) posterFocus.addEventListener("change", applyPosterPreviewFit);

  if (btnAudioFile && audioFile){
    btnAudioFile.addEventListener("click", function(){ audioFile.click(); });
  }
  if (btnClearAudio){
    btnClearAudio.addEventListener("click", clearAudio);
  }
  if (audioFile){
    audioFile.addEventListener("change", function(){
      var f = audioFile.files && audioFile.files[0];
      if (!f) return;
      if (f.size > 2.2 * 1024 * 1024){
        flashGlitch();
        regStatus.textContent = "Audio demasiado grande. Usa uno menor a 2.2MB.";
        clearAudio();
        return;
      }
      var reader = new FileReader();
      reader.onload = function(){
        selectedAudioDataUrl = String(reader.result || "");
        if (audioHint) audioHint.textContent = "Audio cargado: " + f.name;
        if (audioPreview) audioPreview.style.backgroundImage = "radial-gradient(circle at 30% 40%, rgba(120,255,180,.15), transparent 55%), radial-gradient(circle at 70% 70%, rgba(139,0,0,.14), transparent 62%)";
      };
      reader.readAsDataURL(f);
    });
  }

  var gallery = $("gallery");
  var btnGaleriaBack = $("btn-galeria-back");
  var gallerySize = $("gallery-size");
  var galleryFit = $("gallery-fit");
  var selectedItem = null;
  var posterTitle = $("poster-title");
  var foundFootage = $("found-footage");
  var editMode = { id: 0, original: null };

  function getImagePrefs(id){
    try{
      var raw = localStorage.getItem("lm.img." + id);
      if (!raw) return { fit:"cover", focus:"center" };
      var obj = JSON.parse(raw);
      return {
        fit: (obj.fit === "contain" ? "contain" : "cover"),
        focus: (obj.focus === "top" || obj.focus === "bottom") ? obj.focus : "center"
      };
    }catch(_){
      return { fit:"cover", focus:"center" };
    }
  }
  function saveImagePrefs(id, fit, focus){
    try{
      localStorage.setItem("lm.img." + id, JSON.stringify({
        fit: fit || "cover",
        focus: focus || "center"
      }));
    }catch(_){}
  }

  function applyGalleryPrefs(){
    if (!gallery) return;
    var size = localStorage.getItem("lm.gallery.size") || "m";
    var fit = localStorage.getItem("lm.gallery.fit") || "cover";
    gallery.classList.remove("gallery--s","gallery--m","gallery--l","fit--contain");
    gallery.classList.add("gallery--" + (size === "s" ? "s" : size === "l" ? "l" : "m"));
    if (fit === "contain") gallery.classList.add("fit--contain");
    if (gallerySize) gallerySize.value = size;
    if (galleryFit) galleryFit.value = fit;
  }
  if (gallerySize){
    gallerySize.addEventListener("change", function(){
      localStorage.setItem("lm.gallery.size", gallerySize.value);
      applyGalleryPrefs();
    });
  }
  if (galleryFit){
    galleryFit.addEventListener("change", function(){
      localStorage.setItem("lm.gallery.fit", galleryFit.value);
      applyGalleryPrefs();
    });
  }
  applyGalleryPrefs();

  async function apiEditar(payload){
    var res = await fetch("/api/catalogo/editar", {
      method:"POST",
      headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
      body: JSON.stringify(Object.assign({ id: editMode.id }, payload))
    });
    var data;
    try { data = await res.json(); } catch (_) { data = { ok:false }; }
    if (!res.ok) throw new Error(data && data.error ? data.error : "editar fail");
    return data;
  }
  async function apiEliminar(id){
    var res = await fetch("/api/catalogo/eliminar", {
      method:"POST",
      headers: Object.assign({ "Content-Type":"application/json" }, authHeaders()),
      body: JSON.stringify({ id: id })
    });
    var data;
    try { data = await res.json(); } catch (_) { data = { ok:false }; }
    if (!res.ok) throw new Error(data && data.error ? data.error : "eliminar fail");
    return data;
  }
  if (btnGaleriaBack){
    btnGaleriaBack.addEventListener("click", function(){ setView(viewDash); });
  }

  function escapeHtml(s){
    return String(s||"")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\"/g,"&quot;");
  }
  function cardHtml(item){
    var meta = (item.anio||"") + " • " + (item.genero||"");
    var styleAttr = "";
    if (item.posterDataUrl){
      styleAttr = " style=\"background-image:url('" + String(item.posterDataUrl).replace(/'/g, "%27") + "');\"";
    }
    return (
      "<div class=\"poster-card__thumb\" aria-hidden=\"true\"" + styleAttr + "></div>" +
      "<div class=\"poster-card__overlay\">" +
        "<div class=\"poster-card__title\">" + escapeHtml(item.titulo||"") + "</div>" +
        "<div class=\"poster-card__meta\">" + escapeHtml(item.tipo||"") + " • " + escapeHtml(meta) + "</div>" +
        "<div class=\"poster-card__actions\">" +
          "<button class=\"mini-btn\" data-action=\"publish\" type=\"button\">Compartir</button>" +
          "<button class=\"mini-btn\" data-action=\"edit\" type=\"button\">Editar</button>" +
          "<button class=\"mini-btn mini-btn--danger\" data-action=\"delete\" type=\"button\">Eliminar</button>" +
        "</div>" +
      "</div>"
    );
  }

  async function renderGallery(){
    if (!gallery) return;
    applyGalleryPrefs();
    gallery.innerHTML = "";
    try{
      await syncForumData();
      var data = await apiCatalogo();
      var items = (data && data.items) || [];
      
      if (!items.length){
        gallery.innerHTML = "<p class=\"mono\" style=\"color:rgba(209,209,209,.65)\">No hay pósters todavía. Registra uno.</p>";
        return;
      }
      items.forEach(function(item){
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "poster-card";
        btn.innerHTML = cardHtml(item);
        btn.addEventListener("click", function(e){
          var target = e.target;
          var action = target && target.getAttribute ? target.getAttribute("data-action") : null;
          if (action === "edit"){
            e.preventDefault(); e.stopPropagation();
            startEdit(item); return;
          }
          if (action === "delete"){
            e.preventDefault(); e.stopPropagation();
            confirmDelete(item); return;
          }
          if (action === "publish"){
            e.preventDefault(); e.stopPropagation();
            publishToForum(item); return;
          }
          openPoster(item);
        });
        gallery.appendChild(btn);
      });
    }catch(_){
      gallery.innerHTML = "<p class=\"mono\" style=\"color:rgba(209,209,209,.65)\">No se pudo cargar el catálogo. (¿Servidor Java corriendo?)</p>";
    }
  }

  async function renderForum(){
    if (!forum) return;
    forum.innerHTML = "";
    try{
      // 1. Obtener datos del foro (votos) PRIMERO para que el Top 10 los use
      var data = await apiForumList();
      globalForumData = data.posts || [];

      // 2. Renderizar Top 10 (ahora usa globalForumData directamente)
      await renderTop10();

      var posts = (data && data.posts) || [];
      if (!posts.length){
        forum.innerHTML = "<p class=\"mono\" style=\"color:rgba(209,209,209,.65)\">Aún no hay galerías publicadas en el foro.</p>";
        return;
      }
      posts.slice().reverse().forEach(function(item){
        var post = document.createElement("article");
        post.className = "forum-post";
        post.id = "forum-post-" + item.id; // Asignar ID para scroll
        var img = item.posterDataUrl ? ("background-image:linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.72)), url('" + String(item.posterDataUrl).replace(/'/g, "%27") + "');") : "";
        var isOwner = session.username && (item.usuario || "").toLowerCase() === session.username.toLowerCase();
        var deleteBtn = isOwner ? "<button class=\"mini-btn mini-btn--danger\" type=\"button\" data-action=\"delete-post\" title=\"Eliminar mi publicación\" style=\"margin-left:auto; padding:6px 10px\">Eliminar</button>" : "";

        post.innerHTML =
          "<div class=\"forum-post__media\" style=\"cursor:pointer;" + img + "\" title=\"Clic para ver detalles\"></div>" +
          "<div class=\"forum-post__body\">" +
            "<div style=\"display:flex; align-items:flex-start; justify-content:space-between\">" +
              "<h3 class=\"forum-post__title\">" + escapeHtml(item.titulo || "") + "</h3>" +
              deleteBtn +
            "</div>" +
            "<p class=\"forum-post__meta mono\">" + escapeHtml((item.tipo || "") + " • " + (item.anio || "") + " • " + (item.genero || "")) + " — subido por " + escapeHtml(item.usuario || "") + "</p>" +
            "<p class=\"forum-post__desc\">" + escapeHtml(item.descripcion || "") + "</p>" +
            "<div class=\"forum-post__opinions\">" +
              "<div class=\"forum-post__form\" style=\"align-items:center; gap:8px\">" +
                "<button class=\"mini-btn\" type=\"button\" data-action=\"like\" title=\"Aprobar\" style=\"display:flex; align-items:center; gap:4px; padding:6px 10px\"><span style=\"font-size:1.1em; pointer-events:none\">▲</span> <span class=\"vote-count\" data-likes>" + (item.likes||0) + "</span></button>" +
                "<button class=\"mini-btn\" type=\"button\" data-action=\"dislike\" title=\"Rechazar\" style=\"display:flex; align-items:center; gap:4px; padding:6px 10px\"><span style=\"font-size:1.1em; pointer-events:none\">▼</span> <span class=\"vote-count\" data-dislikes>" + (item.dislikes||0) + "</span></button>" +
                "<textarea class=\"forum-post__input\" rows=\"1\" maxlength=\"240\" placeholder=\"Escribe tu opinión...\" style=\"flex:1; margin-left:10px\"></textarea>" +
                "<button class=\"mini-btn\" type=\"button\" data-action=\"send\">Publicar</button>" +
              "</div>" +
              "<div class=\"forum-post__comments\" data-comments></div>" +
            "</div>" +
          "</div>";
        
        post.onclick = async function(e){
          var target = e.target;
          var action = target && target.getAttribute ? target.getAttribute("data-action") : null;
          
          if (action === "delete-post") {
              if (confirm("¿Seguro que quieres eliminar esta publicación del foro?")) {
                  try {
                      await apiForumDelete(item.id);
                      flashGlitch();
                      await renderForum();
                  } catch(e) { alert("Error al eliminar: " + e.message); }
              }
              return;
          }
          
          if (target.classList.contains("forum-post__media")){
             openPoster(item);
          }
        };
        forum.appendChild(post);

        var btnLike = post.querySelector("[data-action='like']");
        var btnDislike = post.querySelector("[data-action='dislike']");
        var numLikes = post.querySelector("[data-likes]");
        var numDislikes = post.querySelector("[data-dislikes]");
        var localLikes = item.likes || 0;
        var localDislikes = item.dislikes || 0;

        btnLike.addEventListener("click", function(){
           apiForumVote(item.id, 1).then((res) => {
              item.likes = res.likes;
              item.dislikes = res.dislikes;
              numLikes.textContent = res.likes;
              numDislikes.textContent = res.dislikes;
              // Almacenar en caché global y refrescar UI
              syncForumData().then(() => {
                updateGlobalMatchScores();
              });
           }).catch(function(e) {
              console.error(e);
              flashGlitch();
           });
        });
        btnDislike.addEventListener("click", function(){
           apiForumVote(item.id, -1).then((res) => {
              item.likes = res.likes;
              item.dislikes = res.dislikes;
              numLikes.textContent = res.likes;
              numDislikes.textContent = res.dislikes;
              syncForumData().then(() => {
                updateGlobalMatchScores();
              });
           }).catch(function(e) {
              console.error(e);
              flashGlitch();
           });
        });

        var mediaEl = post.querySelector(".forum-post__media");
        if (mediaEl) {
          mediaEl.addEventListener("click", function() {
            openPoster({
              id: item.id,
              titulo: item.titulo,
              tipo: item.tipo,
              anio: item.anio,
              genero: item.genero,
              descripcion: item.descripcion,
              posterDataUrl: item.posterDataUrl,
              audioDataUrl: ""
            });
          });
        }

        var commentsEl = post.querySelector("[data-comments]");
        var input = post.querySelector(".forum-post__input");
        var send = post.querySelector("[data-action='send']");
        var postId = item.id;

        function renderComments(list){
          commentsEl.innerHTML = "";
          if (!list || !list.length){
            commentsEl.innerHTML = "<div class=\"mono\" style=\"color:rgba(209,209,209,.55);font-size:12px\">Sin opiniones todavía.</div>";
            return;
          }
          list.slice().reverse().forEach(function(c){
            var el = document.createElement("div");
            el.className = "forum-comment";
            el.innerHTML =
              "<div class=\"forum-comment__meta mono\">" + escapeHtml(c.usuario || "") + " • " + escapeHtml(c.creadoEn || "") + "</div>" +
              "<div class=\"forum-comment__text\">" + escapeHtml(c.texto || "") + "</div>";
            commentsEl.appendChild(el);
          });
        }

        apiForumComments(postId).then(function(r){
          renderComments((r && r.comments) || []);
        }).catch(function(){
          renderComments([]);
        });

        if (send){
          send.addEventListener("click", function(){
            var txt = (input.value || "").trim();
            if (!txt) return;
            send.disabled = true;
            apiForumComment(postId, txt).then(function(){
              input.value = "";
              return apiForumComments(postId);
            }).then(function(r){
              renderComments((r && r.comments) || []);
            }).catch(function(err){
              flashGlitch();
              alert("No se pudo publicar opinión: " + (err && err.message ? err.message : "error"));
            }).finally(function(){
              send.disabled = false;
            });
          });
        }
      });
    }catch(_){
      forum.innerHTML = "<p class=\"mono\" style=\"color:rgba(209,209,209,.65)\">No se pudo cargar el foro. (¿Servidor Java corriendo?)</p>";
    }
  }

  function startEdit(item){
    editMode.id = Number(item.id || 0);
    editMode.original = item;
    if (regTipo) regTipo.value = item.tipo || "Pelicula";
    if (regTitulo) regTitulo.value = item.titulo || "";
    if (regGenero) regGenero.value = item.genero || "";
    if (regDesc) regDesc.value = item.descripcion || "";
    if (regAnio) regAnio.value = String(item.anio || new Date().getFullYear());
    if (regDur) regDur.value = String(item.duracionMin || 92);
    if (regTemps) regTemps.value = String(item.temporadas || 1);
    if (regEpis) regEpis.value = String(item.episodios || 12);
    if (regStreamUrl) regStreamUrl.value = item.streamingUrl || "";
    selectedPosterDataUrl = item.posterDataUrl || "";
    selectedAudioDataUrl = item.audioDataUrl || "";
    if (posterPreview) {
      posterPreview.style.backgroundImage = selectedPosterDataUrl ? ("url('" + selectedPosterDataUrl.replace(/'/g, "%27") + "')") : "";
      applyPosterPreviewFit();
    }
    var prefs = getImagePrefs(item.id || 0);
    if (posterFit) posterFit.value = prefs.fit;
    if (posterFocus) posterFocus.value = prefs.focus;
    if (audioHint) audioHint.textContent = selectedAudioDataUrl ? "Audio cargado (existente)" : "Sin audio cargado.";
    if (audioPreview) audioPreview.style.backgroundImage = selectedAudioDataUrl ? "radial-gradient(circle at 30% 40%, rgba(120,255,180,.15), transparent 55%), radial-gradient(circle at 70% 70%, rgba(139,0,0,.14), transparent 62%)" : "";
    syncTipo();
    regStatus.textContent = "Editando ID #" + editMode.id + ". Guarda para actualizar.";
    setView(viewRegistro);
  }

  async function confirmDelete(item){
    var ok = confirm("¿Eliminar \"" + (item.titulo || "") + "\" del catálogo?");
    if (!ok) return;
    try{
      await apiEliminar(Number(item.id || 0));
      flashGlitch();
      await renderGallery();
    }catch(err){
      flashGlitch();
      alert("No se pudo eliminar: " + (err && err.message ? err.message : "error"));
    }
  }

  async function publishToForum(item){
    try{
      await apiForumPublish(Number(item.id || 0));
      flashGlitch();
      alert("Publicado en el foro: " + (item.titulo || ""));
    }catch(err){
      flashGlitch();
      alert("No se pudo publicar en el foro: " + (err && err.message ? err.message : "error"));
    }
  }

  function showFoundFootage(item){
    if (!foundFootage) return;
    var msg = item && item.metraje ? item.metraje : "Señal inestable…";
    foundFootage.textContent = "METRAJE ENCONTRADO: " + msg;
    foundFootage.hidden = false;
    setTimeout(function(){ if (foundFootage) foundFootage.hidden = true; }, 3500);
  }

  /* ================= Póster (linterna + nodos) ================= */
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".node"));
  var panel = $("node-panel");
  var panelCode = $("node-panel-code");
  var panelClose = $("node-panel-close");
  var btnBack = $("btn-back");

  function setFlash(x,y){
    document.documentElement.style.setProperty("--mx", x + "px");
    document.documentElement.style.setProperty("--my", y + "px");
  }
  function updateLighting(x,y){
    var radius = 170;
    nodes.forEach(function(n){
      var r = n.getBoundingClientRect();
      var cx = r.left + r.width/2;
      var cy = r.top + r.height/2;
      var dx = x - cx, dy = y - cy;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= radius) n.classList.add("is-lit");
      else n.classList.remove("is-lit");
    });
  }
  document.addEventListener("mousemove", function(e){
    if (!viewPoster.classList.contains("view--active")) return;
    setFlash(e.clientX, e.clientY);
    updateLighting(e.clientX, e.clientY);
  });
  function showPanel(text){
    panelCode.textContent = text;
    panel.hidden = false;
  }
  function hidePanel(){ panel.hidden = true; }
  if (panelClose) panelClose.addEventListener("click", hidePanel);

  nodes.forEach(function(btn){
    btn.addEventListener("click", async function(){
      var key = btn.getAttribute("data-node");
      try{
        var info = await apiInfo();
        var sujeto = (info.sujetos || []).find(function(s){ return (s.nombre||"").toLowerCase().includes(key); });
        var reaccion = sujeto ? sujeto.reaccion : "señal incompleta";
        var estado = sujeto ? sujeto.estadoMarcado : "MARCA_ACTIVA";
        showPanel(
          "// Bloque 7 — Polimorfismo\n" +
          "persona.reaccionarASuceso();\n" +
          "// → \"" + reaccion + "\"\n\n" +
          "// Bloque 9 (protected) — Estado marcado\n" +
          "protected String estadoMarcado;\n" +
          "// → \"" + estado + "\"\n\n" +
          "// Bloque 10 — Investigable\n" +
          "archivo.analizarEvidencia();\n" +
          "// → \"" + info.evidencia + "\"\n\n" +
          "// Bloque 4/11 — Catálogo\n" +
          "CatalogoPeliculas items: List<Multimedia>;\n"
        );
      }catch(_){
        flashGlitch();
        showPanel("// Servidor no responde.\n// Inicia Java y vuelve a intentarlo.");
      }
    });
  });

  if (btnBack){
    btnBack.addEventListener("click", function(){
      hidePanel();
      if (typeof closeModal === "function") closeModal();
      
      // Volver a la vista que nos mandó aquí (Foro o Galería)
      if (lastView) {
        setView(lastView);
        if (lastView === viewGaleria) renderGallery();
        if (lastView === viewForo) renderForum();
      } else {
        setView(viewDash);
      }
    });
  }

  window.addEventListener("load", function(){
    setFlash(window.innerWidth/2, window.innerHeight/2);
  });
  setView(viewLogin);
})();

