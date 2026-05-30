# Google Sheets Dashboard Widget

Dashboard en vivo con Chart.js que se conecta a un Google Sheet vía API v4 y se renderiza en un widget de cualquier CMS de señalización digital (Screentinker, Yodeck, Screenly, etc.).

## Arquitectura (solución final)

```
Google Sheet (tus datos)
       ↓ (API Key, fetch directo desde el navegador)
Google Sheets API v4 (sin caché)
       ↓ (JSON fresco → Chart.js)
HTML autónomo en widget text (1 solo iframe)
       ↓
Pantalla del dispositivo
```

**Por qué funciona:** No hay proxy intermedio, no hay Google CDN cache, no hay doble iframe. El widget text renderiza HTML directamente, y el JavaScript hace `fetch()` directo a la API de Google.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `html/dashboard.html` | **Widget principal** — HTML autónomo con Chart.js + fetch directo a API v4 |
| `apps-script/Code.gs` | Alternativa (Apps Script) — menos fiable por CDN cache de Google |
| `screentinker/dashboard.js` | Ruta proxy server-side para Screentinker (alternativa) |
| `docs/Dashboard_Google_Sheets_CMS.docx` | Documentación en formato Word |

## Instalación rápida (3 pasos)

### 1. Crear API Key de Google
1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto → habilitar **Google Sheets API**
3. Credenciales → Crear **Clave API** → seleccionar Google Sheets API
4. Copiar la key (formato: `AIzaSy...`)

### 2. Crear widget en tu CMS
1. En el CMS: **Widgets** → **Añadir Widget** → tipo **Texto**
2. Abrir `html/dashboard.html`
3. Reemplazar 3 valores:
   - `YOUR_SPREADSHEET_ID` → ID de tu Sheet (de la URL)
   - `YOUR_RANGE` → Rango de celdas (ej: `Hoja 1!A1:C100`)
   - `YOUR_API_KEY` → Tu API Key de Google
4. Pegar el código en el widget → Guardar

### 3. Asignar y probar
1. Asignar el widget a una playlist/dispositivo
2. Cambiar un dato en el Sheet
3. Esperar 10 segundos → el dashboard se actualiza solo

## Formato del Google Sheet

| mes | ventas | meta |
|---|---|---|
| Ene | 12000 | 10000 |
| Feb | 15000 | 10000 |
| Mar | 9000 | 10000 |

- Primera fila: encabezados (texto, no números)
- Columna `mes` → etiquetas del eje X
- Resto de columnas numéricas → barras del gráfico
- El dashboard detecta columnas automáticamente

## Personalización

### Cambiar intervalo de actualización
Cambiar `10000` (milisegundos) en la última línea:
```javascript
loadData();setInterval(loadData,10000);  // 10 segundos
loadData();setInterval(loadData,30000);  // 30 segundos
loadData();setInterval(loadData,60000);  // 1 minuto
```

### Cambiar colores
```javascript
var colors=["rgba(74,124,255,0.5)","rgba(255,107,107,0.5)","rgba(74,255,128,0.5)"];
var bdr=["#4a7cff","#ff6b6b","#4ade80"];
```
Agregar más colores para más columnas.

### Agregar columnas
Simplemente agregar columnas al Sheet. El dashboard las detecta y grafica automáticamente.

## Para Screentinker (servidor Node.js)

Si tienes acceso al servidor, también existe la ruta proxy `screentinker/dashboard.js` que hace el fetch server-side. Copiar a `server/routes/dashboard.js` y registrar en `server.js`:
```javascript
app.use('/api/dashboard', require('./routes/dashboard'));
```
Luego crear un widget tipo **webpage** apuntando a `http://TU_SERVIDOR/api/dashboard`.

## Migrar a otro CMS

1. Crear API Key de Google (Paso 1 arriba)
2. Copiar `html/dashboard.html`
3. Reemplazar los 3 placeholders
4. Pegar en el widget HTML/Text del CMS nuevo
5. Asignar a dispositivo

No depende de ningún CMS específico. Solo necesitas un widget que soporte HTML embebido.

## License

MIT
