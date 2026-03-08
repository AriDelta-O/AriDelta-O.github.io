/* ==========================================================================
   script.js — Improved Version
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------------
     Theme Toggle
  ---------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');

  const applyTheme = () => {
    const light = localStorage.getItem("theme") === "light";
    document.body.classList.toggle("light", light);
    themeToggle.textContent = light ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  };
  applyTheme();

  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeToggle.textContent = isLight ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  });

  /* ----------------------------------------------------
     Scroll-to-top
  ---------------------------------------------------- */
  const scrollTopBtn = document.getElementById("scrollTop");
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ----------------------------------------------------
     Active nav link via IntersectionObserver
  ---------------------------------------------------- */
  const navLinks = document.querySelectorAll("nav a[href^='#']");
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function updateActiveNav() {
    // If scrolled to (or very near) the bottom, always highlight the last section
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 8;

    let activeSection = sections[0];

    if (atBottom) {
      activeSection = sections[sections.length - 1];
    } else {
      const mid = window.scrollY + window.innerHeight * 0.4;
      for (const section of sections) {
        if (section.offsetTop <= mid) activeSection = section;
      }
    }

    navLinks.forEach(a => {
      a.classList.toggle(
        "nav-active",
        a.getAttribute("href") === `#${activeSection.id}`
      );
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  /* ----------------------------------------------------
     DOM References
  ---------------------------------------------------- */
  const container        = document.getElementById("projectsContainer");
  const skeletons        = document.getElementById("skeletons");
  const searchInput      = document.getElementById("projectSearch");
  const filterAllBtn     = document.getElementById("filterAll");
  const filterWIPBtn     = document.getElementById("filterWIP");
  const sortAlphaBtn     = document.getElementById("sortAlpha");
  const projectCount     = document.getElementById("projectCount");
  const categoryFilters  = document.getElementById("categoryFilters");

  /* ----------------------------------------------------
     Lightbox Setup
  ---------------------------------------------------- */
  const lightbox  = document.getElementById("lightbox");
  const img1      = document.getElementById("lightboxImg1");
  const img2      = document.getElementById("lightboxImg2");
  const lbClose   = document.getElementById("lbClose");
  const lbPrev    = document.getElementById("lbPrev");
  const lbNext    = document.getElementById("lbNext");
  const lbCounter = document.getElementById("lbCounter");

  let lightboxTrigger = null;
  let CURRENT = { list: [], index: 0 };
  let activeImg = img1;
  let nextImg   = img2;
  let sliding   = false;

  const LIGHTBOX_FOCUSABLE = [lbClose, lbPrev, lbNext];

  function updateCounter() {
    lbCounter.textContent = `${CURRENT.index + 1} / ${CURRENT.list.length}`;
  }

  function showLightbox(list, index, triggerEl) {
    if (!list || list.length === 0) return;
    lightboxTrigger = triggerEl || null;
    CURRENT = { list: [...list], index };

    activeImg.src = list[index];
    activeImg.style.display = "block";
    activeImg.style.opacity = "0";
    activeImg.style.transform = "scale(.8)";
    nextImg.style.display = "none";

    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateCounter();

    requestAnimationFrame(() => {
      activeImg.style.opacity = "1";
      activeImg.style.transform = "scale(1)";
    });
    lbClose.focus();
  }

  function closeLightbox() {
    activeImg.style.opacity = "0";
    activeImg.style.transform = "scale(.8)";
    document.body.style.overflow = "";
    setTimeout(() => {
      lightbox.classList.remove("show");
      lightbox.setAttribute("aria-hidden", "true");
      activeImg.src = "";
      nextImg.src = "";
      activeImg.style.display = "none";
      nextImg.style.display = "none";
      if (lightboxTrigger) lightboxTrigger.focus();
    }, 250);
  }

  function slide(direction) {
    if (sliding) return;
    sliding = true;
    const list = CURRENT.list;
    const newIndex = (CURRENT.index + direction + list.length) % list.length;

    nextImg.src = list[newIndex];
    nextImg.style.display = "block";

    const startOffset = direction > 0 ? "100%" : "-100%";
    const endOffset   = direction > 0 ? "-100%" : "100%";

    nextImg.style.transform = `translateX(${startOffset})`;
    nextImg.style.opacity   = "1";

    requestAnimationFrame(() => {
      activeImg.style.transform = `translateX(${endOffset})`;
      activeImg.style.opacity   = "0";
      nextImg.style.transform   = "translateX(0)";
    });

    setTimeout(() => {
      activeImg.style.display   = "none";
      activeImg.style.transform = "scale(.8)";
      activeImg.style.opacity   = "0";
      [activeImg, nextImg] = [nextImg, activeImg];
      CURRENT.index = newIndex;
      updateCounter();
      sliding = false;
    }, 400);
  }

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  lbPrev.addEventListener("click", e => { e.stopPropagation(); slide(-1); });
  lbNext.addEventListener("click", e => { e.stopPropagation(); slide(1); });

  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("show")) return;
    if (e.key === "Escape")      { closeLightbox(); return; }
    if (e.key === "ArrowLeft")   { slide(-1); return; }
    if (e.key === "ArrowRight")  { slide(1);  return; }
    if (e.key === "Tab") {
      const first = LIGHTBOX_FOCUSABLE[0];
      const last  = LIGHTBOX_FOCUSABLE[LIGHTBOX_FOCUSABLE.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
  });

  /* ----------------------------------------------------
     Breakdown Button Handler
  ---------------------------------------------------- */
  function attachBreakdownHandlers() {
    document.querySelectorAll(".breakdown-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const projectName   = btn.getAttribute("data-project");
        const breakdownPath = `Media/${projectName}/Breakdown/Text.html`;
        fetch(breakdownPath, { method: "HEAD" })
          .then(res => {
            if (res.ok) window.location.href = breakdownPath;
            else alert("This breakdown is still under construction.");
          })
          .catch(() => alert("This breakdown is still under construction."));
      });
    });
  }

  /* ----------------------------------------------------
     Build Project Cards
  ---------------------------------------------------- */
  function buildCard(project, staggerIndex) {
    const isWIP     = project.tags.includes("wip");
    const hasImages = project.images && project.images.length > 0;

    const card = document.createElement("article");
    card.className = "card card-entering";
    card.setAttribute("role", "listitem");
    card.style.setProperty("--i", staggerIndex);
    // Remove the entrance class once animation finishes so JS tilt can take over
    const animDuration = 420 + staggerIndex * 55;
    setTimeout(() => card.classList.remove("card-entering"), animDuration + 50);

    if (!isWIP) {
      card.addEventListener("mouseenter", () => {
        if (!card.dataset.loaded) {
          project.images.forEach(src => new Image().src = src);
          card.dataset.loaded = "1";
        }
      });
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width  / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        card.style.transform =
          `perspective(800px) rotateX(${-(y / rect.height) * 6}deg) rotateY(${(x / rect.width) * 6}deg) scale(1.03)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
      });
    }

    /* Thumbnail / WIP placeholder */
    if (hasImages) {
      const thumb = document.createElement("img");
      thumb.className  = "thumb";
      thumb.src        = project.images[0];
      thumb.alt        = `${project.title} — thumbnail`;
      thumb.loading    = "lazy";
      thumb.tabIndex   = 0;
      thumb.setAttribute("role", "button");
      thumb.setAttribute("aria-label", `Open image gallery for ${project.title}`);
      const openThumb = () => showLightbox(project.images, 0, thumb);
      thumb.addEventListener("click", openThumb);
      thumb.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openThumb(); }
      });
      card.appendChild(thumb);
    } else if (isWIP) {
      const placeholder = document.createElement("div");
      placeholder.className = "thumb-placeholder";
      placeholder.setAttribute("aria-label", "Work in progress — no preview yet");
      placeholder.innerHTML = `
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/>
          <path d="M24 16v8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Coming soon</span>`;
      card.appendChild(placeholder);
    }

    const title = document.createElement("h3");
    title.textContent = project.title;
    card.appendChild(title);

    if (project.category) {
      const badge = document.createElement("span");
      badge.className   = "badge";
      badge.textContent = project.category;
      card.appendChild(badge);
    }

    const summary = document.createElement("div");
    summary.className   = "summary";
    summary.textContent = project.summary || "No summary available.";
    card.appendChild(summary);

    const actions = document.createElement("div");
    actions.className = "actions";

    const openBtn = document.createElement("button");
    openBtn.className = "btn";
    openBtn.textContent = "Open";
    openBtn.setAttribute("aria-expanded", "false");
    openBtn.setAttribute("aria-controls", `details-${project.id}`);
    actions.appendChild(openBtn);

    if (project.hasBreakdown) {
      const breakdownBtn = document.createElement("button");
      breakdownBtn.className = "btn ghost breakdown-btn";
      breakdownBtn.textContent = "Breakdown";
      breakdownBtn.setAttribute("data-project", project.id);
      actions.appendChild(breakdownBtn);
    }

    card.appendChild(actions);

    const details   = document.createElement("div");
    details.className = "details";
    details.id        = `details-${project.id}`;

    const textBlock = document.createElement("div");
    textBlock.className    = "text";
    textBlock.style.display = "none";

    const strip = document.createElement("div");
    strip.className = "thumb-row";

    if (hasImages) {
      project.images.forEach((src, i) => {
        const t   = document.createElement("img");
        t.src     = src;
        t.loading = "lazy";
        t.alt     = `${project.title} image ${i + 1}`;
        t.tabIndex = 0;
        t.setAttribute("role", "button");
        t.setAttribute("aria-label", `View image ${i + 1} of ${project.images.length} for ${project.title}`);
        const openStrip = () => showLightbox(project.images, i, t);
        t.addEventListener("click", openStrip);
        t.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStrip(); }
        });
        if (i === 0) t.classList.add("selected");
        strip.appendChild(t);
      });
    }

    openBtn.addEventListener("click", () => {
      const isOpen = details.classList.toggle("open");
      openBtn.setAttribute("aria-expanded", String(isOpen));
      openBtn.textContent = isOpen ? "Close" : "Open";
    });

    details.append(textBlock, strip);
    card.appendChild(details);
    return card;
  }

  /* ----------------------------------------------------
     Category chips
  ---------------------------------------------------- */
  let activeCategory = null;

  function buildCategoryChips(allProjects) {
    const categories = [...new Set(
      allProjects
        .map(p => p.category)
        .filter(Boolean)
        .filter(c => c !== "Work in Progress")
    )].sort();

    categoryFilters.innerHTML = "";

    // "All" chip always first
    const allChip = document.createElement("button");
    allChip.className   = "chip chip-all active";
    allChip.textContent = "All";
    allChip.setAttribute("aria-pressed", "true");
    allChip.addEventListener("click", () => {
      activeCategory = null;
      categoryFilters.querySelectorAll(".chip").forEach(c => {
        c.classList.remove("active");
        c.setAttribute("aria-pressed", "false");
      });
      allChip.classList.add("active");
      allChip.setAttribute("aria-pressed", "true");
      applyFilters();
    });
    categoryFilters.appendChild(allChip);

    categories.forEach(cat => {
      const chip = document.createElement("button");
      chip.className   = "chip";
      chip.textContent = cat;
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", () => {
        activeCategory = cat;
        categoryFilters.querySelectorAll(".chip").forEach(c => {
          c.classList.remove("active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
        applyFilters();
      });
      categoryFilters.appendChild(chip);
    });
  }

  /* ----------------------------------------------------
     Filtering, Sorting, Search
  ---------------------------------------------------- */
  let projects      = [];
  let currentFilter = "all";
  let sortAlpha     = false;
  let searchTerm    = "";

  function applyFilters() {
    let list = [...projects];

    if (currentFilter === "wip")
      list = list.filter(p => p.tags.includes("wip"));

    if (activeCategory)
      list = list.filter(p => p.category === activeCategory);

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(s) ||
        (p.summary && p.summary.toLowerCase().includes(s)) ||
        p.id.toLowerCase().includes(s) ||
        p.tags.some(t => t.toLowerCase().includes(s))
      );
    }

    if (sortAlpha)
      list.sort((a, b) => a.title.localeCompare(b.title));
    else
      list.sort((a, b) => a.id === "WIP" ? -1 : b.id === "WIP" ? 1 : 0);

    // Update count — exclude WIP from visible count
    const countable = list.filter(p => !p.tags.includes("wip"));
    projectCount.textContent = `${countable.length} project${countable.length !== 1 ? "s" : ""}`;

    renderProjects(list);
  }

  function renderProjects(list) {
    skeletons.style.display  = "none";
    container.style.display  = "grid";
    container.innerHTML      = "";

    if (list.length === 0) {
      container.innerHTML = `
        <div class="no-results" style="grid-column:1/-1">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/>
            <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" transform="rotate(45 24 24)"/>
          </svg>
          <p>No projects match your search.</p>
          <button class="btn ghost" id="clearSearch">Clear filters</button>
        </div>`;
      document.getElementById("clearSearch").addEventListener("click", () => {
        searchInput.value = "";
        searchTerm = "";
        activeCategory = null;
        currentFilter = "all";
        filterAllBtn.classList.add("active");
        filterAllBtn.setAttribute("aria-pressed", "true");
        filterWIPBtn.classList.remove("active");
        filterWIPBtn.setAttribute("aria-pressed", "false");
        categoryFilters.querySelectorAll(".chip").forEach(c => {
          c.classList.remove("active");
          c.setAttribute("aria-pressed", "false");
        });
        // Reset "All" chip
        const allChip = categoryFilters.querySelector(".chip-all");
        if (allChip) { allChip.classList.add("active"); allChip.setAttribute("aria-pressed", "true"); }
        applyFilters();
      });
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((p, i) => frag.appendChild(buildCard(p, i)));
    container.appendChild(frag);

    attachBreakdownHandlers();
  }

  /* ----------------------------------------------------
     UI Controls
  ---------------------------------------------------- */
  filterAllBtn.addEventListener("click", () => {
    currentFilter = "all";
    filterAllBtn.classList.add("active");
    filterAllBtn.setAttribute("aria-pressed", "true");
    filterWIPBtn.classList.remove("active");
    filterWIPBtn.setAttribute("aria-pressed", "false");
    applyFilters();
  });

  filterWIPBtn.addEventListener("click", () => {
    currentFilter = "wip";
    filterWIPBtn.classList.add("active");
    filterWIPBtn.setAttribute("aria-pressed", "true");
    filterAllBtn.classList.remove("active");
    filterAllBtn.setAttribute("aria-pressed", "false");
    applyFilters();
  });

  sortAlphaBtn.addEventListener("click", () => {
    sortAlpha = !sortAlpha;
    sortAlphaBtn.textContent = sortAlpha ? "Sort Normal" : "Sort A→Z";
    applyFilters();
  });

  searchInput.addEventListener("input", e => {
    searchTerm = e.target.value.trim();
    applyFilters();
  });

  /* ----------------------------------------------------
     Load manifest.json
  ---------------------------------------------------- */
  async function loadProjects() {
    try {
      const res  = await fetch("Media/manifest.json");
      const data = await res.json();
      projects   = data;
      buildCategoryChips(projects);
      applyFilters();
    } catch (err) {
      console.error("Failed to load manifest.json:", err);
      skeletons.style.display = "none";
      container.style.display = "grid";
      container.innerHTML     = `<p style="color:var(--muted);grid-column:1/-1">Could not load projects. Please try refreshing.</p>`;
    }
  }

  // Footer year
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  loadProjects();
});