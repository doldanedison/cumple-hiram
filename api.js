// Capa de datos: Google Apps Script (Google Sheets) o modo demo (localStorage)
window.API = (function () {
// ==== BUSQUEDA APROXIMADA (identica en api.js y Code.gs) ====
  function bqNorm(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();
  }
  // clave fonetica del castellano: "Giulianna" y "Juliana" dan la misma clave
  function bqFon(w) {
    w = bqNorm(w).replace(/ñ/g, "n").replace(/[^a-z]/g, "");
    w = w.replace(/ph/g, "f").replace(/ch/g, "x").replace(/sh/g, "x").replace(/ll/g, "j")
      .replace(/qu/g, "k").replace(/gu([ei])/g, "G$1").replace(/g([ei])/g, "j$1").replace(/G/g, "g")
      .replace(/c([ei])/g, "s$1").replace(/z/g, "s").replace(/[cq]/g, "k")
      .replace(/v/g, "b").replace(/w/g, "u").replace(/h/g, "")
      .replace(/y(?=[aeiou])/g, "j").replace(/y/g, "i")
      .replace(/j[iy]([aeiou])/g, "j$1")
      .replace(/(.)\1+/g, "$1");
    return w;
  }
  function bqDist(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        var c = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1))
          cur[j] = Math.min(cur[j], prev[j - 2] + 1);
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }
  // parecido entre dos palabras: 1 = igual, 0 = nada que ver
  function bqPalabra(q, p) {
    if (q === p) return 1;
    if (q.length >= 3 && p.length >= 3 && (p.indexOf(q) === 0 || q.indexOf(p) === 0)) return 0.9;
    var fq = bqFon(q), fp = bqFon(p);
    if (fq && fq === fp) return 0.92;
    if (q.length < 4 || p.length < 4) return 0;
    var d = bqDist(fq, fp), mx = Math.max(fq.length, fp.length);
    var s = 1 - d / mx;
    // tolerancia: 1 letra en palabras cortas, 2 en largas
    return (d <= (mx >= 7 ? 2 : 1) && s >= 0.6) ? Math.min(0.85, s) : 0;
  }
  // devuelve [{i, puntos, exacto}] ordenado de mejor a peor
  function bqBuscar(consulta, nombres) {
    var qs = bqNorm(consulta).split(" ").filter(Boolean);
    if (!qs.length) return [];
    var res = [];
    nombres.forEach(function (nom, i) {
      var ps = bqNorm(nom).split(" ").filter(Boolean);
      if (!ps.length) return;
      var total = 0, exactas = 0, hit = 0;
      qs.forEach(function (q) {
        var mejor = 0;
        ps.forEach(function (p) { var s = bqPalabra(q, p); if (s > mejor) mejor = s; });
        if (mejor > 0) { hit++; total += mejor; }
        if (mejor === 1) exactas++;
      });
      if (!hit) return;
      // cobertura del nombre de la lista (para preferir "Hebert" a "Christian Veron" al buscar "Hebert Veron")
      var cob = hit / Math.max(ps.length, 1);
      var puntos = total / qs.length * 0.65 + cob * 0.35;
      // exacto: todo lo que escribió está tal cual en el nombre de la lista
      var exacto = exactas === qs.length;
      res.push({ i: i, puntos: puntos, exacto: exacto });
    });
    res.sort(function (a, b) { return b.puntos - a.puntos; });
    return res;
  }
  // ==== FIN ====

  const url = () => (window.CUMPLE.API_URL || "").trim();
  const demo = () => !url();
  const KEY = "cumple_hiram_demo";

  const norm = bqNorm;

  // La planilla de Google tarda 1-3 segundos en responder; con señal floja el
  // pedido se corta. Reintentamos los pedidos que se pueden repetir sin riesgo.
  const ESPERA = 20000, INTENTOS = 3;
  const errServidor = m => Object.assign(new Error(m), { servidor: true });

  async function call(params, reintentar = true) {
    const q = new URLSearchParams(params).toString();
    for (let i = 1; ; i++) {
      const ctrl = new AbortController();
      const reloj = setTimeout(() => ctrl.abort(), ESPERA);
      try {
        const r = await fetch(url() + "?" + q, { method: "GET", redirect: "follow", signal: ctrl.signal });
        const txt = await r.text();
        let j;
        try { j = JSON.parse(txt); } catch { throw new Error("respuesta no válida"); }
        if (!j.ok) throw errServidor(j.error || "Error del servidor");
        return j;
      } catch (e) {
        if (e.servidor) throw e;                       // clave incorrecta, invitado inexistente…
        if (!reintentar || i >= INTENTOS)
          throw new Error("No pudimos conectar con la lista. Revisá tu conexión a internet y probá de nuevo.");
      } finally { clearTimeout(reloj); }
      await new Promise(r => setTimeout(r, 700 * i));
    }
  }

  // ---- modo demo ----
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = l => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { } };

  return {
    demo, norm,
    // Devuelve [{id, nombre, acompanantes, asistiran, estado, exacto}] del más al menos parecido.
    async buscar(nombre) {
      if (demo()) {
        const l = load();
        return bqBuscar(nombre, l.map(g => g.nombre)).slice(0, 8).map(m => {
          const g = l[m.i]; return { id: g.id, nombre: g.nombre, acompanantes: g.acompanantes, asistiran: g.asistiran, estado: g.estado, exacto: m.exacto };
        });
      }
      const j = await call({ action: "buscar", nombre, flex: 1 });
      if (j.flex) return j.invitados;
      // Servidor viejo (solo palabras exactas, mínimo 2): buscamos palabra por palabra y juntamos.
      const qs = norm(nombre).split(" ").filter(Boolean);
      const largas = qs.filter(t => t.length >= 3);
      const palabras = [...new Set(largas.length ? largas : qs)].slice(0, 4);
      const listas = await Promise.all(palabras.map(t => call({ action: "buscar", nombre: t + " " + t }).then(r => r.invitados).catch(() => [])));
      const pts = new Map();
      listas.forEach(l => l.forEach(g => { const p = pts.get(g.id); if (p) p.n++; else pts.set(g.id, { g, n: 1 }); }));
      return [...pts.values()].sort((a, b) => b.n - a.n || a.g.nombre.localeCompare(b.g.nombre)).slice(0, 8)
        .map(x => ({ ...x.g, exacto: qs.every(t => norm(x.g.nombre).split(" ").includes(t)) }));
    },
    async confirmar(id, asistiran, mensaje) {
      if (!demo()) return call({ action: "confirmar", id, asistiran, mensaje: mensaje || "" });
      const l = load(), g = l.find(x => x.id === id);
      if (!g) throw new Error("Invitado no encontrado");
      g.asistiran = Math.max(0, Math.min(+asistiran, g.acompanantes + 1));
      g.estado = g.asistiran > 0 ? "CONFIRMADO" : "NO ASISTE";
      g.mensaje = mensaje || ""; g.actualizado = new Date().toISOString();
      save(l); return { ok: true };
    },
    async listar(clave) {
      if (!demo()) return (await call({ action: "listar", clave })).invitados;
      return load();
    },
    async guardar(clave, inv) {
      if (!demo()) return call({ action: "guardar", clave, id: inv.id || "", nombre: inv.nombre, acompanantes: inv.acompanantes, telefono: inv.telefono || "" }, !!inv.id);
      const l = load();
      if (inv.id) Object.assign(l.find(x => x.id === inv.id), { nombre: inv.nombre, acompanantes: +inv.acompanantes, telefono: inv.telefono || "" });
      else l.push({ id: Date.now().toString(36), nombre: inv.nombre, acompanantes: +inv.acompanantes, telefono: inv.telefono || "", asistiran: 0, estado: "PENDIENTE", mensaje: "", actualizado: "" });
      save(l); return { ok: true };
    },
    async borrar(clave, id) {
      if (!demo()) return call({ action: "borrar", clave, id });
      save(load().filter(x => x.id !== id)); return { ok: true };
    },
    async reiniciar(clave, id) {
      if (!demo()) return call({ action: "reiniciar", clave, id });
      const l = load(), g = l.find(x => x.id === id);
      Object.assign(g, { asistiran: 0, estado: "PENDIENTE", mensaje: "", actualizado: "" }); save(l); return { ok: true };
    }
  };
})();
