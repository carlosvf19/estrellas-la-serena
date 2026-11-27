# Estrellas de La Serena · web de reservas

Caso práctico de *IA aplicada a la empresa* (IES Donoso Cortés, Don Benito). Negocio ficticio.

- `index.html`: web en español (portada, experiencias, calendario lunar y reserva, política de nubes, grupos, cómo llegar, dudas).
- `en/`: versión en inglés.
- `privacidad.html` / `en/privacy.html`: aviso de privacidad.
- `panel.html`: panel de demostración para Elena (ver reservas, anular, cancelar una noche por nubes, exportar CSV).
- `assets/app.js`: calendario lunar calculado en el navegador, reservas, grupos y asistente de dudas por reglas.

Las reservas se guardan en el `localStorage` del navegador (versión de demostración, sin servidor).

Publicar: GitHub Pages desde la rama `main`, carpeta raíz. Si el repositorio no se llama `estrellas-la-serena`, cambia las URL de `canonical` y `hreflang` en `index.html` y `en/index.html`.
