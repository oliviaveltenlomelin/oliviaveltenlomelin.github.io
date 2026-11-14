// Portfolio interactions: reveal-on-scroll, back-to-top, lightbox.
// Shared by all pages; every block checks its elements exist first.

// ----- Reveal on scroll -----
const revealTargets = document.querySelectorAll(".project, .about, .contact");
if (revealTargets.length) {
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// ----- Back to top -----
const toTop = document.querySelector(".to-top");
if (toTop) {
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("show", window.scrollY > 600);
  });
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
}

// ----- Lightbox -----
const lightbox = document.querySelector(".lightbox");
const zoomables = Array.from(
  document.querySelectorAll(".gallery img, .photo-grid img")
);
if (lightbox && zoomables.length) {
  const lbImg = lightbox.querySelector("img");
  let lbIndex = 0;

  const openLightbox = (i) => {
    lbIndex = (i + zoomables.length) % zoomables.length;
    lbImg.src = zoomables[lbIndex].src;
    lbImg.alt = zoomables[lbIndex].alt;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  };

  zoomables.forEach((img, i) =>
    img.addEventListener("click", () => openLightbox(i))
  );

  lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lb-prev").addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox(lbIndex - 1);
  });
  lightbox.querySelector(".lb-next").addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox(lbIndex + 1);
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") openLightbox(lbIndex + 1);
  });
}

// ================= Experimental features =================

// ----- Scroll progress bar -----
const progress = document.querySelector(".scroll-progress");
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? (window.scrollY / max) * 100 + "%" : "0";
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

// ----- Dark mode toggle -----
const themeBtn = document.querySelector(".theme-toggle");
if (themeBtn) {
  const apply = (dark) => {
    document.body.classList.toggle("dark", dark);
    themeBtn.textContent = dark ? "\u2600" : "\u263e";
  };
  apply(localStorage.getItem("theme") === "dark");
  themeBtn.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
    apply(dark);
  });
}

// ----- Year filter chips (Engineering page) -----
const filterBar = document.querySelector(".filter-bar");
if (filterBar) {
  const chips = Array.from(filterBar.querySelectorAll(".chip"));
  const projects = Array.from(document.querySelectorAll(".project"));
  filterBar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    chips.forEach((c) => c.classList.toggle("active", c === chip));
    const year = chip.dataset.year;
    projects.forEach((p) => {
      const y = p.querySelector(".year");
      const match = year === "All" || (y && y.textContent.trim() === year);
      p.classList.toggle("filtered-out", !match);
      if (match) p.classList.add("visible"); // ensure reveal animation doesn't hide it
    });
  });
}

// ----- Transparent nav over the hero/banner: solidify after scrolling past it -----
if (document.body.classList.contains("home")) {
  const nav = document.querySelector(".nav");
  const overlayRef = document.querySelector(".hero") || document.querySelector(".banner");
  const onScroll = () => {
    const limit = overlayRef ? overlayRef.offsetHeight - 80 : 60;
    nav.classList.toggle("scrolled", window.scrollY > limit);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ----- Row-ordered masonry for the art gallery -----
const photoGrid = document.querySelector(".photo-grid");
if (photoGrid) {
  const imgs = Array.from(photoGrid.querySelectorAll("img"));
  const layout = () => {
    const n = Math.min(4, Math.max(2, Math.floor(photoGrid.clientWidth / 250)));
    photoGrid.classList.add("js-masonry");
    photoGrid.querySelectorAll(".pg-col").forEach((c) => c.remove());
    const cols = Array.from({ length: n }, () => {
      const d = document.createElement("div");
      d.className = "pg-col";
      photoGrid.appendChild(d);
      return { el: d, h: 0 };
    });
    imgs.forEach((img) => {
      const aspect = img.getAttribute("height") / img.getAttribute("width");
      const shortest = cols.reduce((a, b) => (a.h <= b.h ? a : b));
      shortest.el.appendChild(img);
      shortest.h += aspect;
    });
  };
  layout();
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(layout, 150); });
}
