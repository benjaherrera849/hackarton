/* ============================================================
   TANDIL TECH WEEK 2026 — MOTOR DE SCROLLYTELLING
   Lenis (smooth scroll) + GSAP + ScrollTrigger
   Sin build. Todo degrada gracefully si algo falta.
   ============================================================ */
(() => {
  "use strict";

  const html = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  const hasGsap = typeof window.gsap !== "undefined";
  const hasST = typeof window.ScrollTrigger !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined";

  /* Agenda: independiente de GSAP, funciona aunque falte la librería */
  initEvents();
  initProposalForm();

  if (!hasGsap || !hasST) {
    // Sin GSAP el contenido ya es visible por CSS (.js + data-reveal se resuelven abajo)
    html.classList.remove("js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 1. SMOOTH SCROLL (Lenis) ---------- */
  let lenis = null;
  if (hasLenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anclas internas → scroll suave con offset por header sticky
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -80 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- 2. BARRA DE PROGRESO GLOBAL ---------- */
  const progressBar = document.querySelector(".scroll-progress span");
  if (progressBar) {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.set(progressBar, { scaleX: self.progress });
      },
    });
  }

  /* ---------- 3. HEADER QUE SE COMPRIME ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    ScrollTrigger.create({
      start: 120,
      onToggle: (self) => header.classList.toggle("is-compact", self.isActive),
    });
  }

  const mm = gsap.matchMedia();

  /* ============================================================
     4. HERO — póster que cobra vida
     ============================================================ */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Intro de entrada (una sola vez)
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".poster-kicker", { y: 24, opacity: 0, duration: 0.6 })
      .from(".date-number", { y: 60, opacity: 0, duration: 0.8 }, "-=0.3")
      .from(".date-month", { y: 40, opacity: 0, duration: 0.7 }, "-=0.55")
      .from(".poster-info > div", { y: 24, opacity: 0, stagger: 0.12, duration: 0.6 }, "-=0.4")
      .from(".poster-title", { y: 24, opacity: 0, duration: 0.6 }, "-=0.35")
      .from(".poster-foot", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".stone-top-box", { y: 40, opacity: 0, rotate: -3, duration: 0.7 }, 0.2)
      .from(".stone-bottom-box", { y: 50, opacity: 0, rotate: 2, duration: 0.7 }, 0.35)
      .from(".hero-sparkle", { scale: 0, opacity: 0, stagger: 0.2, duration: 0.5 }, 0.8);

    // Parallax de blobs mientras el hero está en pantalla
    gsap.to(".blob", {
      yPercent: -18,
      rotate: 6,
      ease: "none",
      scrollTrigger: {
        trigger: ".poster-hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    });
    gsap.to(".poster-art-content", {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: ".poster-hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    });

    // Título del hero: leve escala al salir
    gsap.to(".poster-title", {
      yPercent: -30,
      opacity: 0.25,
      ease: "none",
      scrollTrigger: {
        trigger: ".poster-hero",
        start: "center top",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  /* ============================================================
     5. MARQUEES REACTIVOS (velocidad ligada al scroll)
     ============================================================ */
  const makeReactiveMarquee = (track, duration) => {
    if (!track || reduceMotion) return;
    // Pausa la animación CSS y la maneja GSAP para poder reaccionar al scroll
    track.style.animation = "none";
    const tween = gsap.to(track, { xPercent: -50, repeat: -1, duration, ease: "none" });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Scroll rápido → el marquee acelera; scroll inverso → frena/invierte suave
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 3);
        const timeScale = self.direction === -1 ? -boost * 0.4 : boost;
        gsap.to(tween, { timeScale, duration: 0.4, overwrite: true });
      },
    });
  };
  makeReactiveMarquee(document.querySelector(".marquee-track"), 22);
  makeReactiveMarquee(document.querySelector(".thanks-marquee__track"), 26);

  /* ============================================================
     6. AGENDA — historia en dos actos (panel sticky)
     ============================================================ */
  const story = document.querySelector(".story");
  if (story) {
    const steps = gsap.utils.toArray(".story-step");
    const panels = gsap.utils.toArray(".stage-panel");
    const stageProgress = document.querySelector(".stage-progress span");

    const activate = (index) => {
      steps.forEach((s, i) => s.classList.toggle("is-active", i === index));
      panels.forEach((p, i) => p.classList.toggle("is-active", i === index));
    };
    activate(0);

    steps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) activate(i);
        },
      });

      if (!reduceMotion) {
        // Contenido del paso entra con stagger
        gsap.from(step.querySelectorAll(".story-step__inner > *"), {
          y: 28,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: step, start: "top 75%" },
        });
      }
    });

    // Progreso del acto actual
    if (stageProgress) {
      ScrollTrigger.create({
        trigger: ".story",
        start: "top 60%",
        end: "bottom bottom",
        onUpdate: (self) => gsap.set(stageProgress, { scaleX: self.progress }),
      });
    }
  }

  /* ============================================================
     7. ORGANIZAN — scroll horizontal con pin (solo desktop)
     ============================================================ */
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const wrap = document.querySelector(".hscroll");
    const track = document.querySelector(".hscroll-track");
    if (!wrap || !track) return;

    const getDistance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);

    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start: "center center",
        end: () => "+=" + getDistance(),
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  });

  /* ============================================================
     8b. EVENTOS — board + calendario (sin dependencia de GSAP)
     ============================================================ */
  function initEvents() {
    const EVENTS = [
      { date: "2026-09-28", time: "18:30", title: "Pre-Week Kickoff", venue: "Casa de la Cultura · Tandil", tag: "Comunidad", color: "yellow" },
      { date: "2026-10-05", time: "19:00", title: "Taller: Intro a Ciberseguridad", venue: "UNICEN · Campus", tag: "Taller", color: "magenta" },
      { date: "2026-10-08", time: "18:00", title: "Founders & Coffee", venue: "Distrito Avellaneda", tag: "Networking", color: "yellow" },
      { date: "2026-10-14", time: "09:00", title: "Hacking Day", venue: "UNICEN · Campus Universitario", tag: "Día 01", color: "magenta" },
      { date: "2026-10-15", time: "10:00", title: "Startup Day", venue: "Distrito Avellaneda", tag: "Día 02", color: "yellow" },
      { date: "2026-10-22", time: "19:00", title: "Demo Night & Cierre", venue: "Polo Científico · Tandil", tag: "Comunidad", color: "magenta" },
    ];

    const board = document.getElementById("events-board");
    const daysGrid = document.getElementById("calendar-days");
    const weekdaysGrid = document.getElementById("calendar-weekdays");
    const monthLabel = document.getElementById("calendar-month");
    const prevBtn = document.getElementById("calendar-prev");
    const nextBtn = document.getElementById("calendar-next");
    if (!board || !daysGrid || !weekdaysGrid || !monthLabel || !prevBtn || !nextBtn) return;

    const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const MONTH_FMT = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const iso = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const events = EVENTS.map((e) => ({ ...e, _d: new Date(`${e.date}T12:00:00`) })).sort((a, b) => a._d - b._d);
    const upcoming = events.filter((e) => e._d >= today);
    const byDate = {};
    events.forEach((e) => (byDate[e.date] ||= []).push(e));

    /* ---- Board de próximos eventos ---- */
    if (!upcoming.length) {
      board.innerHTML =
        '<p class="events-empty">No hay eventos próximos por ahora. Escribinos desde el formulario si querés proponer uno.</p>';
    } else {
      board.innerHTML = upcoming
        .map((e) => {
          const tagClass = e.color === "yellow" ? " event-tag--yellow" : "";
          return `<article class="event-card" data-date="${e.date}">
            <p class="event-date"><strong>${e._d.getDate()}</strong><span>${e._d.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")}</span></p>
            <div class="event-info">
              <h3>${e.title}</h3>
              <p>${e.time} · ${e.venue}</p>
            </div>
            <span class="event-tag${tagClass}">${e.tag}</span>
          </article>`;
        })
        .join("");
    }

    /* ---- Calendario estilo Google ---- */
    weekdaysGrid.innerHTML = WEEKDAYS.map((d) => `<span>${d}</span>`).join("");

    let view = upcoming.length ? new Date(upcoming[0]._d) : new Date();
    let selected = null;

    const render = () => {
      const y = view.getFullYear();
      const m = view.getMonth();
      monthLabel.textContent = MONTH_FMT.format(view).replace(/^./, (c) => c.toUpperCase());

      const firstOffset = (new Date(y, m, 1).getDay() + 6) % 7; // semana empieza lunes
      const daysInMonth = new Date(y, m + 1, 0).getDate();

      let html = "";
      for (let i = 0; i < firstOffset; i++) html += '<span class="calendar-day is-empty" aria-hidden="true"></span>';
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(y, m, d);
        const key = iso(date);
        const evs = byDate[key] || [];
        const classes = ["calendar-day"];
        if (date.getTime() === today.getTime()) classes.push("is-today");
        if (evs.length) classes.push("has-events");
        if (evs.length && evs.every((e) => e.color === "yellow")) classes.push("has-events--yellow");
        if (selected === key) classes.push("is-selected");
        html += `<button type="button" class="${classes.join(" ")}" data-date="${key}" ${evs.length ? "" : "disabled"} aria-label="${date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}${evs.length ? ` · ${evs.map((e) => e.title).join(", ")}` : ""}">${d}</button>`;
      }
      daysGrid.innerHTML = html;
    };

    // Click en un día con eventos → lo resalta en el board
    daysGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("button.calendar-day");
      if (!btn || btn.disabled) return;
      selected = selected === btn.dataset.date ? null : btn.dataset.date;
      render();
      document.querySelectorAll(".event-card").forEach((card) => {
        card.classList.toggle("is-highlighted", selected !== null && card.dataset.date === selected);
      });
    });

    prevBtn.addEventListener("click", () => {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      render();
    });

    nextBtn.addEventListener("click", () => {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      render();
    });

    render();
  }

  /* ============================================================
     8c. FORMULARIO DE PROPUESTAS — envío simulado con animación
     ============================================================ */
  function initProposalForm() {
    const form = document.querySelector(".proposal-form");
    const btn = form?.querySelector(".proposal-submit");
    if (!form || !btn) return;

    const originalLabel = btn.textContent;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (btn.classList.contains("is-loading") || btn.classList.contains("is-success")) return;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Fase 1: "Enviando…"
      btn.classList.add("is-loading");
      btn.textContent = "Enviando…";

      // Fase 2: éxito con pop + check, y reset del formulario
      setTimeout(() => {
        btn.classList.remove("is-loading");
        btn.classList.add("is-success");
        btn.innerHTML = '<span class="check-mark" aria-hidden="true">✓</span> ¡Enviado!';

        setTimeout(() => {
          btn.classList.remove("is-success");
          btn.textContent = originalLabel;
          form.reset();
        }, 3200);
      }, 900);
    });
  }

  /* ============================================================
     8. REVEALS GENÉRICOS (secciones, cards, speakers, CTA)
     ============================================================ */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const revealGroups = [
      ".section-head > *",
      ".event-card, .events-board-title",
      ".calendar-card, .proposal-form",
      ".card-grid--six .card, .hscroll-track .card",
      ".thanks-band__head > *",
      ".cta > *",
    ];
    revealGroups.forEach((selector) => {
      const els = gsap.utils.toArray(selector);
      if (!els.length) return;
      gsap.from(els, {
        y: 30,
        opacity: 0,
        stagger: 0.07,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: els[0], start: "top 85%" },
      });
    });

    // Avatares de speakers: de apagado a color
    gsap.utils.toArray(".avatar").forEach((av) => {
      gsap.fromTo(
        av,
        { filter: "grayscale(1) contrast(0.8)", scale: 0.85 },
        {
          filter: "grayscale(0) contrast(1)",
          scale: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: av, start: "top 88%" },
        }
      );
    });

    // Sponsors: entrada tipo sticker (hijos con stagger, sin pisar el tilt del CSS)
    // + wordmark que pasa de grayscale a color
    gsap.utils.toArray(".sponsor-card").forEach((card) => {
      gsap.from(card.children, {
        y: 26,
        opacity: 0,
        stagger: 0.06,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 88%" },
      });
      gsap.fromTo(
        card.querySelector(".sponsor-card__wordmark"),
        { filter: "grayscale(1) contrast(0.85)" },
        {
          filter: "grayscale(0) contrast(1)",
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        }
      );
    });

    // CTA final: entra con snap de la sombra dura
    const cta = document.querySelector(".cta");
    if (cta) {
      gsap.from(cta, {
        y: 50,
        opacity: 0,
        boxShadow: "0px 0px 0 0 var(--magenta)",
        duration: 0.9,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: cta, start: "top 85%" },
      });
    }
  });

  /* ============================================================
     9. MICRO-UX — botones magnéticos (solo desktop con mouse)
     ============================================================ */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll(".btn").forEach((btn) => {
      const strength = 0.25;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- Refrescar triggers tras cargar fuentes/imágenes ---------- */
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
