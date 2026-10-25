(function () {
  const T = window.TEMPLATES;
  const shot = (t, kind) => `shots/${t.id}-${kind}.webp`;
  const demo = (t) => `${window.DEMO_BASE}${t.repo}/`;
  const code = (t) => `https://github.com/${window.DEMO_BASE.match(/\/\/([^.]+)/)[1]}/${t.repo}`;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const swatches = (t) => t.colors.map((c) => `<i style="background:${c}" title="${c}"></i>`).join("");

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("countAll").textContent = T.length;

  // WhatsApp (optional)
  if (window.CONTACT_WHATSAPP) {
    const wa = document.getElementById("ctaWa");
    wa.href = `https://wa.me/${window.CONTACT_WHATSAPP}?text=${encodeURIComponent("Hi, I saw your website templates and want to know more.")}`;
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.hidden = false;
  }

  // hero stack: rotate through templates
  const stack = document.getElementById("heroStack");
  let h = 0;
  function renderStack() {
    const pick = [T[h % T.length], T[(h + 4) % T.length], T[(h + 8) % T.length]];
    stack.innerHTML =
      pick.map((t, i) => `<div class="hs-card c${i}"><img src="${shot(t, "desktop")}" alt="" ${i ? 'loading="lazy"' : ""}></div>`).join("") +
      `<div class="hs-phone"><img src="${shot(T[(h + 10) % T.length], "phone")}" alt=""></div>`;
  }
  renderStack();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => {
      h = (h + 1) % T.length;
      stack.querySelectorAll(".hs-card, .hs-phone").forEach((el) => (el.style.opacity = "0"));
      setTimeout(renderStack, 450);
    }, 4000);
  }

  // marquee of names
  const items = T.map((t) => `<span><i style="background:${t.colors[t.colors.length > 2 ? 2 : 1]}"></i>${esc(t.name)}</span>`).join("");
  document.getElementById("marquee").innerHTML = items + items;

  // gallery
  const grid = document.getElementById("grid");
  grid.innerHTML = T.map(
    (t, i) => `
    <article class="card" data-tags="${t.tags.join(" ")}" style="animation-delay:${i * 40}ms">
      <button class="frame" data-i="${i}" aria-label="Preview ${esc(t.name)}">
        <div class="frame-bar"><i></i><i></i><i></i><span>${t.repo}</span></div>
        <span class="badge">${t.no}</span>
        <div class="screen"><img src="${shot(t, "full")}" alt="${esc(t.name)} home page" loading="lazy"></div>
        <span class="peek">Preview desktop &amp; phone</span>
      </button>
      <div class="card-body">
        <div class="card-top"><h3>${esc(t.name)}</h3><span class="swatches">${swatches(t)}</span></div>
        <p class="mood">${esc(t.mood)}</p>
        <p class="blurb">${esc(t.blurb)}</p>
        <div class="card-actions">
          <a class="text-link" href="${demo(t)}" target="_blank" rel="noopener">Open live demo ↗</a>
          <button class="link-btn" data-i="${i}">Preview</button>
        </div>
      </div>
    </article>`
  ).join("");

  // hover scroll distance = full image height - visible frame
  function setShift(frame) {
    const img = frame.querySelector(".screen img");
    const box = frame.querySelector(".screen");
    const extra = img.offsetHeight - box.offsetHeight;
    frame.style.setProperty("--shift", `-${Math.max(0, extra)}px`);
    frame.style.setProperty("--dur", `${Math.min(14, Math.max(4, extra / 380))}s`);
  }
  grid.querySelectorAll(".frame").forEach((f) => {
    const img = f.querySelector("img");
    if (img.complete) setShift(f);
    img.addEventListener("load", () => setShift(f));
    f.addEventListener("mouseenter", () => setShift(f));
  });
  addEventListener("resize", () => grid.querySelectorAll(".frame").forEach(setShift));

  // filters
  document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("is-on", c === chip);
        c.setAttribute("aria-selected", c === chip);
      });
      const f = chip.dataset.filter;
      grid.querySelectorAll(".card").forEach((card) => {
        card.hidden = f !== "all" && !card.dataset.tags.split(" ").includes(f);
      });
    })
  );

  // preview dialog
  const dlg = document.getElementById("preview");
  const $ = (id) => document.getElementById(id);
  let cur = 0;
  let device = "desktop";
  function show(i) {
    cur = (i + T.length) % T.length;
    const t = T[cur];
    $("pvNo").textContent = t.no;
    $("pvName").textContent = t.name;
    $("pvMood").textContent = t.mood;
    $("pvBlurb").textContent = t.blurb;
    $("pvSig").innerHTML = t.signature.map((s) => `<li>${esc(s)}</li>`).join("");
    $("pvColors").innerHTML = swatches(t);
    $("pvFont").textContent = t.font;
    $("pvLive").href = demo(t);
    $("pvCode").href = code(t);
    setDevice(device);
    $("pvStage").scrollTop = 0;
  }
  function setDevice(d) {
    device = d;
    const t = T[cur];
    $("pvDevice").className = `pv-device ${d}`;
    $("pvImg").src = d === "phone" ? shot(t, "phone") : shot(t, "full");
    $("pvImg").alt = `${t.name} — ${d} view`;
    document.querySelectorAll(".seg button").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.device === d);
      b.setAttribute("aria-selected", b.dataset.device === d);
    });
  }
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-i]");
    if (!btn) return;
    show(+btn.dataset.i);
    dlg.showModal();
  });
  document.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => setDevice(b.dataset.device)));
  $("pvPrev").addEventListener("click", () => show(cur - 1));
  $("pvNext").addEventListener("click", () => show(cur + 1));
  $("pvClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(cur + 1);
    if (e.key === "ArrowLeft") show(cur - 1);
  });
})();
