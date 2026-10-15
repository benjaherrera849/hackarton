# Tandil Tech Week 2026 | EQUIPO: HACKARTÓN

Página hecha en ~2hs aprox para el Hacking Day en el campus de la UNICEN potenciada por un mejunje de IAs (GLM 5.3 flash, muse spark 1.3), replicando la estructura original de la página [Tandil Tech Week](https://www.tandiltechweek.com/).

| Nombre | GitHub | Contacto |
| ------------ | ---------------- | ---------------- |
| López Agustín | `@agustin-lopez` | agustin.lopez2991@gmail.com |
| Herrera Benjamín | `@benjaherrera849` | herrerabenjamin091@gmail.com |
| Manzalini Abitante Malena | `@ManzaliniM` | manzamale@gmail.com |

- 2/3 miembros nunca habían utilizado agentes antes.
- 3/3 miembros son estudiantes avanzados de TUDAI.
- 3/3 miembros del equipo abiertos a oportunidades laborales.

## Stack
Definitivamente se puede pulir mucho más utilizando algún framework, pero para el objetivo propuesto **HTML + CSS + JS vanilla**, sin build ni dependencias locales alcanzó bastante bien!

Utilizamos **GSAP + ScrollTrigger** para el scrollytelling y **Lenis** para el smooth scroll (vía CDN, degradan gracefully).

**fonts:** `Space Mono` para el cuerpo y `Archivo Black` para títulos, vía Google Fonts.
```
> se puede ejecutar abriendo index.html directo en el navegador
```

## Estructura
| archivo | contiene |
| ------------ | ---------------- |
|`index.html`| estructura de la página (hero, agenda, eventos, organizan, sponsors). |
|`styles.css`| estilos + responsive (paleta magenta/amarillo, estética neobrutalista).|
|`main.js`| scrollytelling, board de eventos, calendario y formulario.|

### Para editar la agenda...
Los eventos del **board** y del **calendario** se cargan desde el array `EVENTS` dentro de `initEvents()` en
`main.js`. Cada evento tiene `date` (`YYYY-MM-DD`), `time`, `title`, `venue`, `tag` y `color` (`magenta` | `yellow`).