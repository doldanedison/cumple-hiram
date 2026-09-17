// Capa de datos: Google Apps Script (Google Sheets) o modo demo (localStorage)
window.API = (function () {
  const url = () => (window.CUMPLE.API_URL || "").trim();
  const demo = () => !url();
  const KEY = "cumple_hiram_demo";

  const norm = s => (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();

  async function call(params) {
    const q = new URLSearchParams(params).toString();
    const r = await fetch(url() + "?" + q, { method: "GET", redirect: "follow" });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Error del servidor");
    return j;
  }

  // ---- modo demo ----
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = l => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { } };
  const coincide = (nombreLista, buscado) => {
    const a = norm(nombreLista).split(" "), b = norm(buscado).split(" ").filter(Boolean);
    return b.length > 0 && b.every(p => a.includes(p));
  };

  return {
    demo, norm,
    async buscar(nombre) {
      if (!demo()) return (await call({ action: "buscar", nombre })).invitados;
      return load().filter(g => coincide(g.nombre, nombre))
        .map(({ id, nombre, acompanantes, asistiran, estado }) => ({ id, nombre, acompanantes, asistiran, estado }));
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
      if (!demo()) return call({ action: "guardar", clave, id: inv.id || "", nombre: inv.nombre, acompanantes: inv.acompanantes, telefono: inv.telefono || "" });
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
