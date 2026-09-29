/**
 * Backend del cumple de Hiram Ezequiel — Google Apps Script + Google Sheets.
 * 1) Cambiá CLAVE_ORGANIZADOR.
 * 2) Implementar > Nueva implementación > Aplicación web
 *    Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario.
 * 3) Copiá la URL /exec en config.js (API_URL).
 */
const CLAVE_ORGANIZADOR = "CAMBIAR-ESTA-CLAVE";
const HOJA = "Invitados";
const COLS = ["id", "nombre", "telefono", "acompanantes", "asistiran", "estado", "mensaje", "actualizado"];

function doGet(e) {
  const p = e.parameter || {};
  try {
    switch (p.action) {
      case "buscar": return out({ ok: true, flex: !!p.flex, invitados: buscar(p.nombre, p.flex) });
      case "confirmar": return out(confirmar(p.id, p.asistiran, p.mensaje));
      case "listar": auth(p); return out({ ok: true, invitados: leer().map(r => r.obj) });
      case "guardar": auth(p); return out(guardar(p));
      case "borrar": auth(p); return out(borrar(p.id));
      case "reiniciar": auth(p); return out(reiniciar(p.id));
      default: return out({ ok: false, error: "Acción inválida" });
    }
  } catch (err) {
    return out({ ok: false, error: String(err.message || err) });
  }
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function auth(p) { if (p.clave !== CLAVE_ORGANIZADOR) throw new Error("Clave incorrecta"); }

function hoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(["ID", "Nombre y apellido", "Teléfono", "Acompañantes", "Asistirán", "Estado", "Mensaje", "Actualizado"]);
    sh.setFrozenRows(1);
    sh.getRange("A:A").setNumberFormat("@"); sh.getRange("C:C").setNumberFormat("@");
  }
  return sh;
}

function leer() {
  const sh = hoja(), v = sh.getDataRange().getValues();
  return v.slice(1).map((r, i) => {
    const o = {}; COLS.forEach((c, k) => o[c] = r[k]);
    o.id = String(o.id); o.acompanantes = +o.acompanantes || 0; o.asistiran = +o.asistiran || 0;
    o.estado = o.estado || "PENDIENTE"; o.telefono = String(o.telefono || "");
    o.actualizado = o.actualizado instanceof Date ? o.actualizado.toISOString() : String(o.actualizado || "");
    return { fila: i + 2, obj: o };
  }).filter(r => r.obj.id && r.obj.nombre);
}

function norm(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();
}

function buscar(nombre, flex) {
  const todos = leer();
  if (flex) {
    // búsqueda tolerante: errores de tipeo, acentos, "Giulianna" = "Juliana", solo el nombre, etc.
    const r = bqBuscar(nombre, todos.map(x => x.obj.nombre));
    if (!bqNorm(nombre)) throw new Error("Escribí tu nombre");
    return r.slice(0, 8).map(m => {
      const o = todos[m.i].obj;
      return { id: o.id, nombre: o.nombre, acompanantes: o.acompanantes, asistiran: o.asistiran, estado: o.estado, exacto: m.exacto };
    });
  }
  const b = norm(nombre).split(" ").filter(Boolean);
  if (b.length < 2) throw new Error("Escribí nombre y apellido");
  return todos.filter(r => { const a = norm(r.obj.nombre).split(" "); return b.every(x => a.indexOf(x) >= 0); })
    .slice(0, 5)
    .map(r => ({ id: r.obj.id, nombre: r.obj.nombre, acompanantes: r.obj.acompanantes, asistiran: r.obj.asistiran, estado: r.obj.estado }));
}

// ==== BUSQUEDA APROXIMADA (identica en api.js y Code.gs) ====
function bqNorm(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();
}
// clave fonetica del castellano: "Giulianna" y "Juliana" dan la misma clave
function bqFon(w, alt) {
  w = bqNorm(w).replace(/ñ/g, "n").replace(/[^a-z]/g, "");
  w = w.replace(/ph/g, "f").replace(/ch/g, "x").replace(/sh/g, "x").replace(/ll/g, alt ? "l" : "j")
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
  // segunda lectura: "ll" como "l" ("Gulliana" ~ "Giuliana")
  var aq = bqFon(q, true), ap = bqFon(p, true);
  if (aq !== fq || ap !== fp) {
    var d2 = bqDist(aq, ap), mx2 = Math.max(aq.length, ap.length);
    if (d2 / mx2 < d / mx) { d = d2; mx = mx2; }
  }
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

function conLock(fn) {
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function confirmar(id, asistiran, mensaje) {
  return conLock(() => {
    const r = leer().find(x => x.obj.id === String(id));
    if (!r) throw new Error("Invitado no encontrado");
    const n = Math.max(0, Math.min(parseInt(asistiran, 10) || 0, r.obj.acompanantes + 1));
    hoja().getRange(r.fila, 5, 1, 4).setValues([[n, n > 0 ? "CONFIRMADO" : "NO ASISTE", String(mensaje || "").slice(0, 200), new Date()]]);
    return { ok: true, asistiran: n };
  });
}

function guardar(p) {
  const nombre = String(p.nombre || "").trim().replace(/\s+/g, " ");
  if (!nombre) throw new Error("Falta el nombre");
  const acomp = Math.max(0, parseInt(p.acompanantes, 10) || 0);
  return conLock(() => {
    const sh = hoja();
    if (p.id) {
      const r = leer().find(x => x.obj.id === String(p.id));
      if (!r) throw new Error("Invitado no encontrado");
      sh.getRange(r.fila, 2, 1, 3).setValues([[nombre, String(p.telefono || ""), acomp]]);
      if (r.obj.asistiran > acomp + 1) sh.getRange(r.fila, 5).setValue(acomp + 1);
    } else {
      sh.appendRow([Utilities.getUuid().slice(0, 8), nombre, String(p.telefono || ""), acomp, 0, "PENDIENTE", "", ""]);
    }
    return { ok: true };
  });
}

function borrar(id) {
  return conLock(() => {
    const r = leer().find(x => x.obj.id === String(id));
    if (r) hoja().deleteRow(r.fila);
    return { ok: true };
  });
}

function reiniciar(id) {
  return conLock(() => {
    const r = leer().find(x => x.obj.id === String(id));
    if (r) hoja().getRange(r.fila, 5, 1, 4).setValues([[0, "PENDIENTE", "", ""]]);
    return { ok: true };
  });
}
