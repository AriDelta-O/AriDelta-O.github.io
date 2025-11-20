/* ==========================================================================
   script.js — Optimized Version
   All original functionality preserved.
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
  };
  applyTheme();

  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeToggle.textContent = isLight ? "☀️" : "🌙";
  });

  /* ----------------------------------------------------
     DOM References
  ---------------------------------------------------- */
  const container = document.getElementById("projectsContainer");
  const skeletons = document.getElementById("skeletons");
  const searchInput = document.getElementById("projectSearch");

  const filterAllBtn = document.getElementById("filterAll");
  const filterWIPBtn = document.getElementById("filterWIP");
  const sortAlphaBtn = document.getElementById("sortAlpha");

  /* ----------------------------------------------------
     Lightbox Setup
  ---------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const img1 = document.getElementById("lightboxImg1");
  const img2 = document.getElementById("lightboxImg2");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");

  let CURRENT = { list: [], index: 0 };
  let activeImg = img1;
  let nextImg = img2;
  let sliding = false;

  function showLightbox(list, index) {
    CURRENT = { list: [...list], index };

    activeImg.src = list[index];
    activeImg.style.display = "block";
    activeImg.style.opacity = "0";
    activeImg.style.transform = "scale(.8)";

    nextImg.style.display = "none";
    lightbox.classList.add("show");

    // fade-in
    requestAnimationFrame(() => {
      activeImg.style.opacity = "1";
      activeImg.style.transform = "scale(1)";
    });
  }

  function closeLightbox() {
    activeImg.style.opacity = "0";
    activeImg.style.transform = "scale(.8)";
    setTimeout(() => {
      lightbox.classList.remove("show");
      activeImg.src = "";
      nextImg.src = "";
      activeImg.style.display = "none";
      nextImg.style.display = "none";
    }, 250);
  }

  function slide(direction) {
    if (sliding) return;
    sliding = true;

    const list = CURRENT.list;
    const len = list.length;

    const newIndex = (CURRENT.index + direction + len) % len;

    nextImg.src = list[newIndex];
    nextImg.style.display = "block";

    // Slide in from left or right
    const startOffset = direction > 0 ? "100%" : "-100%";
    const endOffset = direction > 0 ? "-100%" : "100%";

    nextImg.style.transform = `translateX(${startOffset})`;
    nextImg.style.opacity = "1";

    requestAnimationFrame(() => {
      activeImg.style.transform = `translateX(${endOffset})`;
      activeImg.style.opacity = "0";
      nextImg.style.transform = "translateX(0)";
    });

    setTimeout(() => {
      activeImg.style.display = "none";
      activeImg.style.transform = "scale(.8)";
      activeImg.style.opacity = "0";

      [activeImg, nextImg] = [nextImg, activeImg];
      CURRENT.index = newIndex;
      sliding = false;
    }, 400);
  }

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  lbPrev.addEventListener("click", e => { e.stopPropagation(); slide(-1); });
  lbNext.addEventListener("click", e => { e.stopPropagation(); slide(1); });

  /* ----------------------------------------------------
     Build Project Cards
  ---------------------------------------------------- */
  function buildCard(project) {
    const card = document.createElement("article");
    card.className = "card";

    /* Preload images on hover once */
    card.addEventListener("mouseenter", () => {
      if (!card.dataset.loaded) {
        project.images.forEach(src => new Image().src = src);
        card.dataset.loaded = "1";
      }
    });

    /* Tilt effect */
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / rect.height) * 6;
      const rotY = (x / rect.width) * 6;

      card.style.transform =
        `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    });

    /* Thumbnail */
    const thumb = document.createElement("img");
    thumb.className = "thumb";
    thumb.src = project.images[0] || "";
    thumb.alt = project.title;
    thumb.loading = "lazy";
    thumb.addEventListener("click", () => showLightbox(project.images, 0));

    /* Title / Meta / Summary */
    const title = document.createElement("h3");
    title.textContent = project.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = project.id;

    const summary = document.createElement("div");
    summary.className = "summary";
    summary.textContent = project.summary || "No summary available.";

    /* Actions */
    const actions = document.createElement("div");
    actions.className = "actions";

    const openBtn = document.createElement("button");
    openBtn.className = "btn";
    openBtn.textContent = "Open";

    const imgBtn = document.createElement("button");
    imgBtn.className = "btn ghost";
    imgBtn.textContent = "View / Download Images";
    imgBtn.addEventListener("click", () => showLightbox(project.images, 0));

    actions.append(openBtn, imgBtn);

    /* Details Panel */
    const details = document.createElement("div");
    details.className = "details";

    const textBlock = document.createElement("div");
    textBlock.className = "text";
    textBlock.style.display = "none";

    const strip = document.createElement("div");
    strip.className = "thumb-row";

    project.images.forEach((src, i) => {
      const t = document.createElement("img");
      t.src = src;
      t.loading = "lazy";
      t.addEventListener("click", () => showLightbox(project.images, i));
      if (i === 0) t.classList.add("selected");
      strip.appendChild(t);
    });

    openBtn.addEventListener("click", () => {
      details.classList.toggle("open");
    });

    details.append(textBlock, strip);

    /* Assemble */
    card.append(thumb, title, meta, summary, actions, details);
    return card;
  }

  /* ----------------------------------------------------
     Filtering, Sorting, Search
  ---------------------------------------------------- */
  let projects = [];
  let currentFilter = "all";
  let sortAlpha = false;
  let searchTerm = "";

  function applyFilters() {
    let list = [...projects];

    if (currentFilter === "wip")
      list = list.filter(p => p.tags.includes("wip"));

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

    renderProjects(list);
  }

  function renderProjects(list) {
    skeletons.style.display = "none";
    container.style.display = "grid";
    container.innerHTML = "";

    const frag = document.createDocumentFragment();
    list.forEach(p => frag.appendChild(buildCard(p)));
    container.appendChild(frag);
  }

  /* ----------------------------------------------------
     UI Controls
  ---------------------------------------------------- */
  filterAllBtn.addEventListener("click", () => {
    currentFilter = "all";
    filterAllBtn.classList.add("active");
    filterWIPBtn.classList.remove("active");
    applyFilters();
  });

  filterWIPBtn.addEventListener("click", () => {
    currentFilter = "wip";
    filterWIPBtn.classList.add("active");
    filterAllBtn.classList.remove("active");
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
      const res = await fetch("Media/manifest.json");
      const data = await res.json();

      projects = data;
      applyFilters();
    } catch (err) {
      console.error("Failed to load manifest.json:", err);
    }
  }

  loadProjects();
});
