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
      case "buscar": return out({ ok: true, invitados: buscar(p.nombre) });
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

function buscar(nombre) {
  const b = norm(nombre).split(" ").filter(Boolean);
  if (!b.length) throw new Error("Escribí tu nombre");
  return leer().filter(r => { const a = norm(r.obj.nombre).split(" "); return b.every(x => a.indexOf(x) >= 0); })
    .slice(0, 5)
    .map(r => ({ id: r.obj.id, nombre: r.obj.nombre, acompanantes: r.obj.acompanantes, asistiran: r.obj.asistiran, estado: r.obj.estado }));
}

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
