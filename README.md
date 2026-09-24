# Invitación · 1 añito de Hiram Ezequiel 🌈

- Invitados: https://doldanedison.github.io/cumple-hiram/
- Organizador: https://doldanedison.github.io/cumple-hiram/organizador.html

| Archivo | Para qué |
|---|---|
| `index.html` | Lo que ven los invitados |
| `organizador.html` | Panel para cargar invitados y ver quién confirmó (pide clave) |
| `config.js` | Datos del cumple y URL de la planilla |
| `musica.mp3` | Música de fondo (arranca al abrir la invitación, en bucle) |
| `portada.jpg` | Imagen de la vista previa al compartir el enlace (WhatsApp, etc.) |
| `portada.html` | Plantilla con la que se genera `portada.jpg` (1200x630) |
| `Code.gs` | Backend gratis en Google Sheets |

## Conectar la planilla de Google

GitHub Pages solo sirve archivos, no guarda datos, así que la lista vive en una planilla de Google.

1. Creá una planilla nueva en Google Sheets (ej. "Invitados Hiram").
2. Menú **Extensiones → Apps Script**. Borrá lo que haya y pegá el contenido de `Code.gs`.
3. Cambiá `CLAVE_ORGANIZADOR` por una clave tuya. Guardá.
4. **Implementar → Nueva implementación → tipo Aplicación web**. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier usuario**.
5. Autorizá los permisos y copiá la URL que termina en `/exec`.
6. En este repositorio editá `config.js` y pegala en `API_URL`.

Sin `API_URL` la página anda en **modo demo** (los datos quedan solo en ese navegador).

## Uso

- **Organizador**: cargá cada invitación con su cantidad de acompañantes (el invitado cuenta aparte: "Familia Rojas, 3" = 4 lugares).
- **Invitados**: tocan *Confirmar asistencia*, escriben su nombre (alcanza el nombre solo; si hay varios parecidos la página los deja elegir) y eligen cuántos van.
- `index.html#info` abre directo la invitación, sin la presentación.
