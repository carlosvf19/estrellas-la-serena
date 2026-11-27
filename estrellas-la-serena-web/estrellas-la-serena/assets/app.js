/* Estrellas de La Serena · lógica de la web
   - Calendario lunar calculado en el navegador (sin servicios externos).
   - Reservas guardadas en localStorage (versión de demostración: los datos
     se quedan en el navegador de quien reserva; ver cuaderno, decisión D9).
   - Asistente de dudas por reglas: responde solo lo que está escrito aquí
     y, si no lo sabe, pasa la pregunta a Elena. No inventa. */
(function () {
  "use strict";
  var LANG = document.documentElement.lang === "en" ? "en" : "es";
  var AFORO = 15;                 // máximo por salida de observación (no negociable)
  var BLOQUEO_LUNA = 0.93;        // iluminación a partir de la cual no se vende
  var LUNA_BRILLANTE = 0.6;
  var LUNA_OSCURA = 0.35;
  var DIAS_VISTA = 120;           // se puede reservar hasta 4 meses vista

  var PRODUCTOS = {
    obs:  { precio: 35, grupo: "noche" },
    cena: { precio: 60, grupo: "noche" },
    ruta: { precio: 25, grupo: "ruta" }
  };

  var T = {
    es: {
      meses: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
      dows: ["L","M","X","J","V","S","D"],
      dowsC: ["lun","mar","mié","jue","vie","sáb","dom"],
      hoy: "Esta noche", hoyC: "Hoy", manana: "Mañana",
      cal: { oscura: "Cielo oscuro", media: "Luna en cuarto", brillante: "Luna brillante", bloq: "Luna llena", cancelada: "Cancelada por nubes" },
      tags: { rec: "Recomendada", libre: "Libre", no: "No salimos" },
      lunaAl: "Luna al",
      prod: { obs: "Observación de estrellas", cena: "Observación con cena en el campo", ruta: "Ruta guiada al atardecer" },
      bloq: "Noche de luna llena: no salimos. La luz de la Luna tapa casi todo el cielo profundo.",
      pasado: "Esta fecha ya ha pasado.",
      cancelada: "Esta noche se ha cancelado por previsión de nubes.",
      oscura: "Cielo oscuro: la mejor noche para ver la Vía Láctea y cielo profundo.",
      media: "Luna en cuarto: buen cielo y la Luna se ve de cerca por el telescopio.",
      brillante: "Luna brillante: se ven la Luna, planetas y estrellas brillantes; menos Vía Láctea.",
      entre: "Entre semana: grupos más pequeños y tranquilos.",
      ilum: "Luna iluminada al",
      plazas: function (n) { return n === 1 ? "Queda 1 plaza" : "Quedan " + n + " plazas"; },
      sinPlazas: "No quedan plazas esta noche. Prueba otra fecha.",
      elige: "Elige una noche en el calendario.",
      total: "Total",
      porPersona: "por persona",
      pagoNota: "No se paga nada ahora: se paga el día de la salida. Si hay nubes, no pagas.",
      errFecha: "Elige una fecha disponible en el calendario.",
      errNombre: "Escribe tu nombre.",
      errEmail: "Revisa el correo: lo necesitamos para mandarte la confirmación y el aviso de nubes.",
      errPriv: "Necesitamos que aceptes la política de privacidad para guardar tu reserva.",
      errPlazas: function (n) { return "Solo quedan " + n + " plazas esa noche."; },
      okTit: "Reserva hecha",
      okTxt: "Te hemos enviado un resumen a tu correo (en esta versión de demostración, la reserva se guarda en este navegador).",
      okCodigo: "Tu código de reserva",
      okNubes: "El día de la salida, antes de las 17:00, Elena revisa la previsión. Si hay nubes, te avisa y eliges otra noche o no pagas nada.",
      okLlevar: "Trae ropa de abrigo (de noche refresca incluso en verano), calzado cómodo y linterna con luz roja si tienes.",
      okIcs: "Añadir a mi calendario",
      okOtra: "Hacer otra reserva",
      quedada: "Quedada: 1 hora después de anochecer. Te mandamos la ubicación exacta.",
      grupoOk: "Solicitud enviada. Miguel te responde con una propuesta en 48 horas laborables.",
      grupoErr: "Revisa los campos marcados y acepta la política de privacidad.",
      turnos: function (n) {
        if (n <= AFORO) return "Grupo de " + n + ": una sola salida de observación.";
        var t = Math.ceil(n / AFORO);
        return "Grupo de " + n + ": cena todos juntos y observación en " + t + " turnos de " + Math.ceil(n / t) + " personas como máximo.";
      },
      asisHola: "Hola, soy el asistente de Estrellas de La Serena. Te respondo las dudas más frecuentes. Si no sé algo, se lo paso a Elena.",
      asisNoSe: "Eso no lo sé seguro y prefiero no inventármelo. Escríbele a Elena y te contesta ella:",
      asisMail: "Escribir a Elena",
      chips: ["¿Y si está nublado?", "¿Pueden ir niños?", "¿Cómo llego?", "Grupos y empresas", "¿Es en inglés?", "Precios"]
    },
    en: {
      meses: ["January","February","March","April","May","June","July","August","September","October","November","December"],
      dows: ["M","T","W","T","F","S","S"],
      dowsC: ["mon","tue","wed","thu","fri","sat","sun"],
      hoy: "Tonight", hoyC: "Today", manana: "Tmrw",
      cal: { oscura: "Dark sky", media: "Quarter moon", brillante: "Bright moon", bloq: "Full moon", cancelada: "Cancelled (clouds)" },
      tags: { rec: "Best pick", libre: "Available", no: "No session" },
      lunaAl: "Moon at",
      prod: { obs: "Stargazing", cena: "Stargazing with dinner in the countryside", ruta: "Guided sunset walk" },
      bloq: "Full moon night: we don't go out. Moonlight hides most of the deep sky.",
      pasado: "This date has already passed.",
      cancelada: "This night has been cancelled because of a cloudy forecast.",
      oscura: "Dark sky: the best night for the Milky Way and deep sky.",
      media: "Quarter moon: good sky, and the Moon looks great through the telescope.",
      brillante: "Bright moon: you'll see the Moon, planets and bright stars; less Milky Way.",
      entre: "Weekday: smaller, quieter groups.",
      ilum: "Moon illuminated:",
      plazas: function (n) { return n === 1 ? "1 place left" : n + " places left"; },
      sinPlazas: "This night is full. Please try another date.",
      elige: "Pick a night on the calendar.",
      total: "Total",
      porPersona: "per person",
      pagoNota: "Nothing to pay now: you pay on the night. If it's cloudy, you don't pay.",
      errFecha: "Pick an available date on the calendar.",
      errNombre: "Please enter your name.",
      errEmail: "Please check your email: we need it to send your confirmation and the cloud alert.",
      errPriv: "Please accept the privacy policy so we can save your booking.",
      errPlazas: function (n) { return "Only " + n + " places left that night."; },
      okTit: "Booking confirmed",
      okTxt: "We've sent a summary to your email (in this demo version, the booking is saved in this browser).",
      okCodigo: "Your booking code",
      okNubes: "On the day, before 5 pm, Elena checks the forecast. If it's cloudy, she lets you know and you pick another night or pay nothing.",
      okLlevar: "Bring warm clothes (nights are cool even in summer), comfortable shoes and a red-light torch if you have one.",
      okIcs: "Add to my calendar",
      okOtra: "Make another booking",
      quedada: "Meeting time: 1 hour after dark. We'll send you the exact location.",
      grupoOk: "Request sent. Miguel will reply with a proposal within 48 working hours.",
      grupoErr: "Please check the highlighted fields and accept the privacy policy.",
      turnos: function (n) {
        if (n <= AFORO) return "Group of " + n + ": a single stargazing session.";
        var t = Math.ceil(n / AFORO);
        return "Group of " + n + ": dinner all together and stargazing in " + t + " shifts of up to " + Math.ceil(n / t) + " people.";
      },
      asisHola: "Hi, I'm the Estrellas de La Serena assistant. I answer the most common questions. If I don't know something, I'll pass it on to Elena.",
      asisNoSe: "I'm not sure about that and I'd rather not make it up. Write to Elena and she'll answer you:",
      asisMail: "Write to Elena",
      chips: ["What if it's cloudy?", "Can children come?", "How do I get there?", "Groups & companies", "Is it in English?", "Prices"]
    }
  }[LANG];

  /* ---------- Almacenamiento (localStorage con protección) ---------- */
  function leer(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  var K_RES = "els_reservas", K_NOCHES = "els_noches", K_GRUPOS = "els_grupos";

  /* ---------- Fase lunar (fórmulas de baja precisión, error < 2 %) ---------- */
  var RAD = Math.PI / 180;
  function iluminacion(fecha) {
    // Se evalúa a las 23:00 hora peninsular (~22:00 UTC), que es cuando se observa.
    var t = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 22, 0, 0);
    var d = t / 86400000 + 2440587.5 - 2451545.0;
    var L = 218.316 + 13.176396 * d, M = 134.963 + 13.064993 * d;
    var D = 297.850 + 12.190749 * d, g = 357.529 + 0.98560028 * d;
    var lunaLon = L + 6.289 * Math.sin(M * RAD) + 1.274 * Math.sin((2 * D - M) * RAD)
      + 0.658 * Math.sin(2 * D * RAD) - 0.186 * Math.sin(g * RAD) + 0.214 * Math.sin(2 * M * RAD);
    var q = 280.459 + 0.98564736 * d;
    var solLon = q + 1.915 * Math.sin(g * RAD) + 0.020 * Math.sin(2 * g * RAD);
    var elong = ((lunaLon - solLon) % 360 + 360) % 360;
    return { f: (1 - Math.cos(elong * RAD)) / 2, creciente: elong < 180 };
  }
  function iconoLuna(f, creciente) {
    // Dibuja la parte iluminada con una elipse: sirve para leer la fase de un vistazo.
    var r = 8, k = 1 - 2 * f, rx = Math.abs(k) * r;
    var lado = creciente ? 1 : 0;
    var p = "M9 1 A8 8 0 0 " + lado + " 9 17 A" + rx.toFixed(2) + " 8 0 0 " + (k > 0 ? 1 - lado : lado) + " 9 1Z";
    return '<svg class="luna" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8" fill="#232C47"/><path d="' + p + '" fill="#F5F5F4"/></svg>';
  }
  function clave(fecha) { return fecha.getFullYear() + "-" + String(fecha.getMonth() + 1).padStart(2, "0") + "-" + String(fecha.getDate()).padStart(2, "0"); }
  function hoy0() { var h = new Date(); return new Date(h.getFullYear(), h.getMonth(), h.getDate()); }

  function estadoNoche(fecha) {
    var hoy = hoy0(), il = iluminacion(fecha), k = clave(fecha);
    var noches = leer(K_NOCHES, {});
    var o = { clave: k, f: il.f, creciente: il.creciente, dow: (fecha.getDay() + 6) % 7 };
    o.entresemana = o.dow <= 3; // lunes a jueves
    if (fecha < hoy) o.estado = "pasado";
    else if ((fecha - hoy) / 86400000 > DIAS_VISTA) o.estado = "lejos";
    else if (noches[k] && noches[k].estado === "cancelada_nubes") o.estado = "cancelada";
    else if (il.f >= BLOQUEO_LUNA) o.estado = "bloq";
    else o.estado = "libre";
    o.cielo = il.f < LUNA_OSCURA ? "oscura" : (il.f < LUNA_BRILLANTE ? "media" : "brillante");
    return o;
  }
  function ocupadas(k, grupo) {
    return leer(K_RES, []).filter(function (r) {
      return r.fecha === k && r.estado === "activa" && PRODUCTOS[r.producto].grupo === grupo;
    }).reduce(function (s, r) { return s + r.personas; }, 0);
  }

  /* ---------- Calendario ---------- */
  var cal = document.getElementById("cal");
  var selFecha = null, mesVista = new Date(hoy0().getFullYear(), hoy0().getMonth(), 1);
  function productoSel() { var s = document.getElementById("producto"); return s ? s.value : "obs"; }

  function pintarCal() {
    if (!cal) return;
    var tit = document.getElementById("cal-mes");
    tit.textContent = T.meses[mesVista.getMonth()] + " " + mesVista.getFullYear();
    var html = T.dows.map(function (d) { return '<div class="dow" aria-hidden="true">' + d + "</div>"; }).join("");
    var primero = (mesVista.getDay() + 6) % 7;
    for (var i = 0; i < primero; i++) html += '<div class="dia vacio"></div>';
    var diasMes = new Date(mesVista.getFullYear(), mesVista.getMonth() + 1, 0).getDate();
    for (var d = 1; d <= diasMes; d++) {
      var f = new Date(mesVista.getFullYear(), mesVista.getMonth(), d), e = estadoNoche(f);
      var cls = ["dia", e.cielo];
      if (e.entresemana) cls.push("entresemana");
      if (e.estado === "pasado" || e.estado === "lejos") cls.push("pasado");
      if (e.estado === "bloq" || e.estado === "cancelada") cls.push("bloq");
      if (selFecha === e.clave) cls.push("sel");
      var dis = e.estado !== "libre";
      var etiqueta = d + " " + T.meses[f.getMonth()] + ". " + (e.estado === "bloq" ? T.bloq : e.estado === "cancelada" ? T.cancelada : T[e.cielo]);
      html += '<button type="button" class="' + cls.join(" ") + '" data-k="' + e.clave + '"' + (dis ? ' aria-disabled="true"' : "") +
        ' aria-label="' + etiqueta + '"' + (selFecha === e.clave ? ' aria-pressed="true"' : "") + ">" + d + iconoLuna(e.f, e.creciente) + "</button>";
    }
    cal.innerHTML = html;
    var prev = document.getElementById("cal-prev");
    var h = hoy0();
    prev.disabled = mesVista.getFullYear() === h.getFullYear() && mesVista.getMonth() === h.getMonth();
    var lim = new Date(h.getTime() + DIAS_VISTA * 86400000);
    document.getElementById("cal-next").disabled = mesVista.getFullYear() * 12 + mesVista.getMonth() >= lim.getFullYear() * 12 + lim.getMonth();
  }
  function infoDia() {
    var box = document.getElementById("info-dia");
    if (!box) return;
    if (!selFecha) { box.innerHTML = T.elige; return; }
    var p = selFecha.split("-"), f = new Date(+p[0], +p[1] - 1, +p[2]), e = estadoNoche(f);
    var libres = AFORO - ocupadas(selFecha, PRODUCTOS[productoSel()].grupo);
    var txt = "<b>" + f.getDate() + " " + T.meses[f.getMonth()] + "</b> · " + T[e.cielo] + " (" + T.ilum + " " + Math.round(e.f * 100) + " %)";
    if (e.entresemana) txt += "<br>" + T.entre;
    txt += "<br>" + (libres > 0 ? T.plazas(libres) : T.sinPlazas) + "<br>" + T.quedada;
    box.innerHTML = txt;
  }
  if (cal) {
    cal.addEventListener("click", function (ev) {
      var b = ev.target.closest(".dia");
      if (!b || b.getAttribute("aria-disabled") || !b.dataset.k) { if (b && b.dataset.k) { mostrarBloq(b.dataset.k); } return; }
      selFecha = b.dataset.k; pintarCal(); infoDia(); resumen();
      var err = document.getElementById("err-fecha"); if (err) err.textContent = "";
    });
    document.getElementById("cal-prev").addEventListener("click", function () { mesVista.setMonth(mesVista.getMonth() - 1); pintarCal(); });
    document.getElementById("cal-next").addEventListener("click", function () { mesVista.setMonth(mesVista.getMonth() + 1); pintarCal(); });
    pintarCal(); infoDia();
  }

  /* ---------- Portada: próximas 7 noches ---------- */
  function seleccionar(k) {
    var p = k.split("-");
    selFecha = k; mesVista = new Date(+p[0], +p[1] - 1, 1);
    pintarCal(); infoDia(); resumen();
    cal.closest("section").scrollIntoView({ behavior: "smooth" });
  }
  var lista = document.getElementById("noches-lista"), hoyBox = document.getElementById("noches-hoy");
  if (lista && cal) {
    var h0 = hoy0(), html = "";
    for (var i = 0; i < 7; i++) {
      var f = new Date(h0.getFullYear(), h0.getMonth(), h0.getDate() + i), e = estadoNoche(f);
      var no = e.estado === "bloq" || e.estado === "cancelada";
      var calidad = no ? T.cal[e.estado] : T.cal[e.cielo];
      if (i === 0) {
        hoyBox.innerHTML = iconoLuna(e.f, e.creciente) + "<div><small>" + T.hoy + "</small><b>" + calidad + "</b><small>" + T.lunaAl + " " + Math.round(e.f * 100) + " %</small></div>";
      }
      var tag = no ? '<span class="tag">' + T.tags.no + "</span>" : (e.cielo === "oscura" && e.entresemana ? '<span class="tag si">' + T.tags.rec + "</span>" : '<span class="tag">' + T.tags.libre + "</span>");
      var dl = i === 0 ? T.hoyC : i === 1 ? T.manana : T.dowsC[e.dow] + " " + f.getDate();
      html += '<li><button type="button" class="noche" data-k="' + e.clave + '"' + (no ? ' aria-disabled="true"' : "") + '><span class="d">' + dl + "</span>" + iconoLuna(e.f, e.creciente) + '<span class="q">' + calidad + "</span>" + tag + "</button></li>";
    }
    lista.innerHTML = html;
    lista.addEventListener("click", function (ev) {
      var b = ev.target.closest(".noche");
      if (b && !b.getAttribute("aria-disabled")) seleccionar(b.dataset.k);
    });
  }

  function mostrarBloq(k) {
    var p = k.split("-"), e = estadoNoche(new Date(+p[0], +p[1] - 1, +p[2]));
    var box = document.getElementById("info-dia");
    box.innerHTML = e.estado === "bloq" ? T.bloq : e.estado === "cancelada" ? T.cancelada : T.pasado;
  }

  /* ---------- Reserva ---------- */
  var form = document.getElementById("form-reserva");
  function resumen() {
    var box = document.getElementById("resumen");
    if (!box) return;
    var prod = productoSel(), n = +document.getElementById("personas").value || 1, pr = PRODUCTOS[prod].precio;
    box.innerHTML = "<div>" + T.prod[prod] + " · " + pr + " € " + T.porPersona + " × " + n + "</div>" +
      '<div class="total">' + T.total + ": " + (pr * n) + " €</div><div class='ayuda'>" + T.pagoNota + "</div>";
  }
  // Origen de la visita (?utm_campaign=...) para medir qué publicación trae reservas.
  function origen() {
    try { var q = new URLSearchParams(location.search), c = q.get("utm_campaign") || q.get("utm_source");
      if (c) sessionStorage.setItem("els_origen", c); return c || sessionStorage.getItem("els_origen") || "directo"; } catch (e) { return "directo"; }
  }
  origen();
  function codigo() { var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "ELS-"; for (var i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function ics(r) {
    var p = r.fecha.replace(/-/g, "");
    var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Estrellas de La Serena//ES", "BEGIN:VEVENT",
      "UID:" + r.codigo + "@estrellasdelaserena", "DTSTART;VALUE=DATE:" + p, "SUMMARY:" + T.prod[r.producto] + " · Estrellas de La Serena",
      "DESCRIPTION:" + T.quedada + " " + T.okNubes + " Código: " + r.codigo, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(txt);
  }
  if (form) {
    ["producto", "personas"].forEach(function (id) { document.getElementById(id).addEventListener("change", function () { resumen(); infoDia(); }); });
    // Si llegan desde una tarjeta de experiencia, preseleccionamos el producto.
    document.querySelectorAll("[data-prod]").forEach(function (a) {
      a.addEventListener("click", function () { document.getElementById("producto").value = a.dataset.prod; resumen(); infoDia(); });
    });
    resumen();
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true;
      function err(id, msg) { var el = document.getElementById(id); el.textContent = msg || ""; if (msg) ok = false; }
      var nombre = form.nombre.value.trim(), email = form.email.value.trim(), n = +form.personas.value, prod = form.producto.value;
      err("err-fecha", selFecha ? "" : T.errFecha);
      err("err-nombre", nombre ? "" : T.errNombre);
      err("err-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : T.errEmail);
      err("err-priv", form.privacidad.checked ? "" : T.errPriv);
      if (selFecha) {
        var libres = AFORO - ocupadas(selFecha, PRODUCTOS[prod].grupo);
        if (n > libres) err("err-fecha", libres > 0 ? T.errPlazas(libres) : T.sinPlazas);
      }
      if (!ok) { var primero = form.querySelector(".error:not(:empty)"); if (primero) primero.scrollIntoView({ block: "center" }); return; }
      var r = {
        id: Date.now(), codigo: codigo(), fecha: selFecha, producto: prod, personas: n,
        precio: PRODUCTOS[prod].precio * n, nombre: nombre, email: email,
        telefono: form.telefono.value.trim(), idioma: LANG, acepta_privacidad: true,
        estado: "activa", creada: new Date().toISOString(), origen: origen()
      };
      var lista = leer(K_RES, []); lista.push(r); guardar(K_RES, lista);
      var p = selFecha.split("-"), fecha = new Date(+p[0], +p[1] - 1, +p[2]);
      document.getElementById("paso-reserva").hidden = true;
      var okb = document.getElementById("ok-reserva");
      okb.hidden = false;
      okb.innerHTML = '<div class="ok-box" tabindex="-1" id="ok-foco"><h3>' + T.okTit + "</h3><p>" + T.okTxt + "</p><p>" + T.okCodigo +
        ': <span class="codigo">' + r.codigo + "</span></p><p><b>" + T.prod[prod] + "</b> · " + fecha.getDate() + " " + T.meses[fecha.getMonth()] +
        " · " + n + " · " + r.precio + " €</p><p>" + T.quedada + "</p><p>" + T.okNubes + "</p><p>" + T.okLlevar +
        '</p><p><a class="btn peq" download="estrellas-la-serena.ics" href="' + ics(r) + '">' + T.okIcs +
        '</a> <button type="button" class="btn sec peq" id="otra">' + T.okOtra + "</button></p></div>";
      document.getElementById("ok-foco").focus();
      document.getElementById("otra").addEventListener("click", function () {
        okb.hidden = true; document.getElementById("paso-reserva").hidden = false; form.reset(); selFecha = null; pintarCal(); infoDia(); resumen();
      });
    });
  }

  /* ---------- Grupos y empresas ---------- */
  var fg = document.getElementById("form-grupo");
  if (fg) {
    var calcula = function () { var n = +fg.gpersonas.value; document.getElementById("turnos-txt").textContent = n > 0 ? T.turnos(n) : ""; };
    fg.gpersonas.addEventListener("input", calcula); calcula();
    fg.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = document.getElementById("grupo-msg");
      var valido = fg.gempresa.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fg.gemail.value.trim()) && +fg.gpersonas.value > 0 && fg.gprivacidad.checked;
      if (!valido) { msg.className = "error"; msg.textContent = T.grupoErr; return; }
      var l = leer(K_GRUPOS, []);
      l.push({ id: Date.now(), origen: origen(), empresa: fg.gempresa.value.trim(), email: fg.gemail.value.trim(), personas: +fg.gpersonas.value,
        cuando: fg.gcuando.value, cena: fg.gcena.checked, idioma: LANG, acepta_privacidad: true, creada: new Date().toISOString() });
      guardar(K_GRUPOS, l);
      msg.className = "ok-box"; msg.textContent = T.grupoOk; fg.reset(); calcula();
    });
  }

  /* ---------- Asistente de dudas ---------- */
  var BASE = {
    es: [
      { k: ["nub", "lluv", "llue", "llov", "tiempo", "cancel", "meteo", "previsi"], r: "Si hay nubes no salimos: preferimos cancelar a engañarte. Elena revisa la previsión el mismo día antes de las 17:00 y te avisa por correo (y por teléfono si nos lo diste). Eliges otra noche o no pagas nada. Más o menos una de cada seis noches se cancela por nubes." },
      { k: ["niñ", "hij", "menor", "familia", "crío", "peque"], r: "Sí, los niños pueden venir acompañados de un adulto. Como la salida termina tarde y hace fresco, lo recomendamos a partir de unos 6 años. Si tienes dudas con un niño concreto, escríbele a Elena." },
      { k: ["lleg", "dónde", "donde", "ubicac", "punto", "encuentro", "aparc", "coche", "mapa"], r: "Quedamos en el punto de encuentro de La Serena (zona de Castuera, Badajoz). La ubicación exacta te llega en el correo de confirmación con un enlace al mapa, porque cambia según la salida. Se llega en coche; hay sitio para aparcar." },
      { k: ["grupo", "empresa", "equipo", "colegio", "asociaci", "25", "20", "despedida"], r: "Hacemos salidas para grupos y empresas. Para no pasar de 15 personas por telescopio, los grupos grandes cenan todos juntos y observan en turnos. Pide propuesta en la sección Grupos y empresas." },
      { k: ["inglés", "ingles", "english", "idioma", "portugu"], r: "Sí, Elena hace las salidas en español y en inglés. Elige el idioma al reservar." },
      { k: ["precio", "cuesta", "cuánto", "cuanto", "€", "euro", "pagar", "pago"], r: "Observación de estrellas: 35 € por persona. Observación con cena en el campo: 60 €. Ruta guiada: 25 €. No se paga nada al reservar: se paga el día de la salida, y si hay nubes no pagas." },
      { k: ["luna", "llena"], r: "En las noches de luna llena no salimos: la luz de la Luna tapa casi todo el cielo profundo. En el calendario verás la fase de cada noche." },
      { k: ["ropa", "llevar", "frío", "frio", "abrigo"], r: "Trae ropa de abrigo (de noche refresca incluso en verano), calzado cómodo y, si tienes, una linterna con luz roja." },
      { k: ["cena", "comida", "comer", "vegetar", "alerg", "menú", "menu"], r: "La cena la prepara Miguel con productos de productores de la zona. Si tienes alguna alergia o una dieta especial, escríbele antes de la salida para confirmarlo." },
      { k: ["anular", "cambiar", "modificar", "reserva"], r: "Para cambiar o anular una reserva, escribe a Elena con tu código de reserva (empieza por ELS-)." }
    ],
    en: [
      { k: ["cloud", "rain", "weather", "cancel"], r: "If it's cloudy we don't go out: we'd rather cancel than disappoint you. Elena checks the forecast on the day before 5 pm and lets you know by email (and phone if you gave us one). You pick another night or pay nothing. Roughly one night in six is cancelled because of clouds." },
      { k: ["child", "kid", "family", "son", "daughter"], r: "Yes, children are welcome with an adult. As the session ends late and it gets cool, we recommend it from about age 6. If in doubt, write to Elena." },
      { k: ["get there", "where", "location", "meeting", "park", "car", "map", "address"], r: "We meet at our meeting point in La Serena (Castuera area, Badajoz). The exact location comes in your confirmation email with a map link, as it depends on the session. You'll need a car; there's parking." },
      { k: ["group", "company", "team", "school", "corporate"], r: "We run sessions for groups and companies. To keep a maximum of 15 people per telescope, large groups have dinner together and stargaze in shifts. Ask for a proposal in the Groups section." },
      { k: ["english", "language", "spanish", "portuguese"], r: "Yes, Elena guides in Spanish and English. Choose your language when booking." },
      { k: ["price", "cost", "how much", "€", "pay", "payment"], r: "Stargazing: €35 per person. Stargazing with dinner: €60. Guided walk: €25. Nothing to pay when booking: you pay on the night, and if it's cloudy you don't pay." },
      { k: ["moon", "full"], r: "We don't go out on full moon nights: moonlight hides most of the deep sky. The calendar shows the moon phase for every night." },
      { k: ["wear", "bring", "cold", "clothes"], r: "Bring warm clothes (nights are cool even in summer), comfortable shoes and a red-light torch if you have one." },
      { k: ["dinner", "food", "vegetar", "allerg", "menu"], r: "Dinner is prepared by Miguel with produce from local producers. If you have an allergy or special diet, write to us before the session." },
      { k: ["change", "modify", "booking"], r: "To change or cancel a booking, write to Elena with your booking code (starts with ELS-)." }
    ]
  }[LANG];
  var EMAIL = "hola@estrellasdelaserena.es";
  function responder(q) {
    var t = q.toLowerCase(), mejor = null, pts = 0;
    BASE.forEach(function (b) { var p = b.k.filter(function (k) { return t.indexOf(k) !== -1; }).length; if (p > pts) { pts = p; mejor = b; } });
    if (mejor) return mejor.r;
    return T.asisNoSe + ' <a href="mailto:' + EMAIL + "?subject=" + encodeURIComponent(LANG === "es" ? "Duda desde la web" : "Question from the website") +
      "&body=" + encodeURIComponent(q) + '">' + T.asisMail + "</a>";
  }
  var asis = document.getElementById("asis"), log = document.getElementById("asis-log");
  if (asis) {
    function msg(txt, quien) { var d = document.createElement("div"); d.className = "msg " + quien; d.innerHTML = txt; log.appendChild(d); log.scrollTop = log.scrollHeight; }
    function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function preguntar(q) { if (!q.trim()) return; msg(esc(q), "yo"); setTimeout(function () { msg(responder(q), "bot"); }, 250); }
    var chips = document.getElementById("asis-chips");
    chips.innerHTML = T.chips.map(function (c) { return '<button type="button" class="chip">' + c + "</button>"; }).join("");
    chips.addEventListener("click", function (e) { if (e.target.classList.contains("chip")) preguntar(e.target.textContent); });
    msg(T.asisHola, "bot");
    var abrir = document.getElementById("asis-abrir");
    abrir.addEventListener("click", function () { asis.classList.add("abierto"); abrir.setAttribute("aria-expanded", "true"); document.getElementById("asis-q").focus(); });
    document.getElementById("asis-cerrar").addEventListener("click", function () { asis.classList.remove("abierto"); abrir.setAttribute("aria-expanded", "false"); abrir.focus(); });
    document.getElementById("asis-form").addEventListener("submit", function (e) { e.preventDefault(); var i = document.getElementById("asis-q"); preguntar(i.value); i.value = ""; });
  }

  /* ---------- Cielo de estrellas decorativo (sin imágenes: carga más rápida) ---------- */
  var sky = document.querySelector(".hero .stars");
  if (sky) {
    var s = "", seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < 140; i++) s += '<circle cx="' + (rnd() * 1000).toFixed(1) + '" cy="' + (rnd() * 600).toFixed(1) + '" r="' + (rnd() * 1.3 + .2).toFixed(2) + '" fill="#fff" opacity="' + (rnd() * .7 + .2).toFixed(2) + '"/>';
    sky.innerHTML = s;
  }

  // Expuesto para el panel de Elena
  window.ELS = { leer: leer, guardar: guardar, estadoNoche: estadoNoche, iluminacion: iluminacion, K_RES: K_RES, K_NOCHES: K_NOCHES, K_GRUPOS: K_GRUPOS, PRODUCTOS: PRODUCTOS };
})();
