# Tandil Tech Week 2026

Landing del evento: **14 & 15 de octubre de 2026, Tandil (Buenos Aires)**. Dos jornadas para conectar el ecosistema
tech regional — Hacking Day en el campus de la UNICEN y Startup Day en Distrito Avellaneda.

## Stack

- **HTML + CSS + JS vanilla**, sin build ni dependencias locales.
- **GSAP + ScrollTrigger** para el scrollytelling y **Lenis** para el smooth scroll (vía CDN, degradan gracefully).
- Fuentes: Space Mono (cuerpo) y Archivo Black (títulos), vía Google Fonts.

## Cómo correr

Abrí `index.html` directo en el navegador, o serví la carpeta:

```bash
npx serve .
```

## Estructura

| Archivo      | Qué hay adentro                                                        |
| ------------ | ---------------------------------------------------------------------- |
| `index.html` | Estructura de la página (hero, agenda, eventos, organizan, sponsors)   |
| `styles.css` | Estilos + responsive (paleta magenta/amarillo, estética neobrutalista) |
| `main.js`    | Scrollytelling, board de eventos, calendario y formulario              |

## Editar la agenda

Los eventos del **board** y del **calendario** se cargan desde el array `EVENTS` dentro de `initEvents()` en
`main.js`. Cada evento tiene `date` (`YYYY-MM-DD`), `time`, `title`, `venue`, `tag` y `color` (`magenta` | `yellow`).

## Pendientes

- El formulario de propuestas es una **demo**: simula el envío con una animación, pero no está conectado a un backend.
- El link "Ver en Google Calendar" apunta a un placeholder — reemplazarlo por el calendario real del evento.
