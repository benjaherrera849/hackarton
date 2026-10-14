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
      .from(".stone-bottom-box", { y: 50, opacity: 0, rotate: 2, duration: 0.7 }, 0.35);

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
     5. MARQUEE REACTIVO (velocidad ligada al scroll)
     ============================================================ */
  const marqueeTrack = document.querySelector(".marquee-track");
  if (marqueeTrack && !reduceMotion) {
    // Pausa la animación CSS y la maneja GSAP para poder reaccionar al scroll
    marqueeTrack.style.animation = "none";
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      repeat: -1,
      duration: 22,
      ease: "none",
    });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Scroll rápido → el marquee acelera; scroll inverso → frena/invierte suave
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 3);
        gsap.to(marqueeTween, { timeScale: boost, duration: 0.4, overwrite: true });
        if (self.direction === -1) {
          gsap.to(marqueeTween, { timeScale: -1 * boost * 0.4, duration: 0.4, overwrite: true });
        }
      },
    });
  }

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
     8. REVEALS GENÉRICOS (secciones, cards, speakers, CTA)
     ============================================================ */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const revealGroups = [
      ".section-head > *",
      ".card-grid--six .card, .hscroll-track .card",
      ".speaker-card",
      ".sponsor-row a",
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
