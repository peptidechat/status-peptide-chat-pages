const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");

function closeMenu() {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menu.classList.remove("open");
  document.body.classList.remove("menu-open");
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menu.classList.toggle("open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details[open]").forEach((other) => {
      if (other !== item) other.removeAttribute("open");
    });
  });
});

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const heroFilm = document.querySelector("[data-hero-film]");
const heroSoundButton = document.querySelector("[data-hero-sound]");
const heroSoundLabel = document.querySelector("[data-hero-sound-label]");
const entryGate = document.querySelector("[data-entry-gate]");
const entryButton = document.querySelector("[data-entry-button]");

if (heroFilm) {
  const updateSoundButton = () => {
    if (!heroSoundButton) return;
    const soundIsOn = !heroFilm.muted && heroFilm.volume > 0;
    heroSoundButton.setAttribute("aria-pressed", String(soundIsOn));
    if (heroSoundLabel) heroSoundLabel.textContent = soundIsOn ? "Mute" : "Sound";
    heroSoundButton.setAttribute("aria-label", soundIsOn ? "Mute hero video" : "Start hero video with sound");
  };

  const startWithSound = async () => {
    heroFilm.muted = false;
    heroFilm.volume = 1;

    try {
      await heroFilm.play();
    } catch {
      heroFilm.muted = true;
      await heroFilm.play().catch(() => {});
    }

    updateSoundButton();
  };

  if (entryGate && entryButton) {
    const pageRegions = document.querySelectorAll(".skip-link, header, main, footer");
    pageRegions.forEach((region) => { region.inert = true; });

    entryButton.addEventListener("click", async () => {
      entryButton.disabled = true;
      await startWithSound();
      entryGate.classList.add("is-leaving");
      document.body.classList.remove("entry-locked");

      window.setTimeout(() => {
        entryGate.hidden = true;
        pageRegions.forEach((region) => { region.inert = false; });
        document.querySelector("#hero-title")?.focus({ preventScroll: true });
      }, 380);
    });
  } else {
    document.body.classList.remove("entry-locked");
  }

  if (heroSoundButton) {
    heroSoundButton.addEventListener("click", async () => {
      if (heroFilm.muted || heroFilm.volume === 0) {
        await startWithSound();
      } else {
        heroFilm.muted = true;
      }
      updateSoundButton();
    });

    heroFilm.addEventListener("volumechange", updateSoundButton);
    updateSoundButton();
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reducedMotion) {
    const playMuted = async () => {
      if (!entryGate?.hidden) heroFilm.muted = true;
      await heroFilm.play().catch(() => {});
      updateSoundButton();
    };

    const filmObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          playMuted();
        } else {
          heroFilm.pause();
        }
      });
    }, { threshold: [0, 0.35, 0.7] });

    filmObserver.observe(heroFilm);
  } else if (reducedMotion) {
    heroFilm.pause();
    heroFilm.removeAttribute("autoplay");
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) heroFilm.pause();
  });
}
