const state = {
  entries: [],
  categories: [],
  activeCategory: "all",
  query: "",
  sort: "date_desc",
  starFilter: 0,
  mythOnly: false,
  tagFilter: null,
  level: "general",
};

async function init() {
  state.level = localStorage.getItem("evidentia_level") || "general";

  const [entries, categories] = await Promise.all([
    fetch("../data/entries.json").then((r) => r.json()),
    fetch("../data/categories.json").then((r) => r.json()),
  ]);
  state.entries = entries;
  state.categories = categories;

  const params = new URLSearchParams(window.location.search);
  const tagParam = params.get("tag");
  if (tagParam) state.tagFilter = tagParam;
  const categoryParam = params.get("category");
  if (categoryParam && state.categories.some((c) => c.id === categoryParam)) {
    state.activeCategory = categoryParam;
  }

  renderChips();
  setupLevelToggle();
  syncLevelButtons();
  renderNewStrip();

  if (window.location.hash) {
    scrollToHashEntry();
  } else {
    render();
  }
  window.addEventListener("hashchange", scrollToHashEntry);

  document.getElementById("search").addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });
  document.getElementById("star-filter").addEventListener("change", (e) => {
    state.starFilter = Number(e.target.value);
    render();
  });
  document.getElementById("myth-toggle").addEventListener("click", (e) => {
    state.mythOnly = !state.mythOnly;
    e.currentTarget.setAttribute("aria-pressed", String(state.mythOnly));
    render();
  });
  document.getElementById("cards").addEventListener("click", (e) => {
    const tagBtn = e.target.closest(".tag-pill");
    if (tagBtn) {
      const tag = tagBtn.dataset.tag;
      state.tagFilter = state.tagFilter === tag ? null : tag;
      render();
    }
  });
}

function setupLevelToggle() {
  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.level = btn.dataset.level;
      localStorage.setItem("evidentia_level", state.level);
      syncLevelButtons();
      render();
    });
  });
}

function syncLevelButtons() {
  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.setAttribute("aria-checked", String(btn.dataset.level === state.level));
  });
}

function renderChips() {
  const container = document.getElementById("category-chips");
  const all = document.createElement("button");
  all.type = "button";
  all.className = "chip" + (state.activeCategory === "all" ? " active" : "");
  all.textContent = `すべて (${state.entries.length})`;
  all.dataset.id = "all";
  container.appendChild(all);

  for (const cat of state.categories) {
    const count = state.entries.filter((e) => e.category === cat.id).length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (state.activeCategory === cat.id ? " active" : "");
    btn.textContent = `${cat.label} (${count})`;
    btn.dataset.id = cat.id;
    container.appendChild(btn);
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state.activeCategory = btn.dataset.id;
    [...container.children].forEach((c) => c.classList.toggle("active", c === btn));
    updateCategoryQueryParam(state.activeCategory);
    render();
  });
}

function updateCategoryQueryParam(catId) {
  const url = new URL(window.location.href);
  if (catId === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", catId);
  }
  history.replaceState(null, "", url.pathname + url.search + url.hash);
}

function syncControlsUI() {
  document.getElementById("search").value = state.query;
  document.getElementById("star-filter").value = String(state.starFilter);
  document.getElementById("myth-toggle").setAttribute("aria-pressed", String(state.mythOnly));
  const chipsContainer = document.getElementById("category-chips");
  [...chipsContainer.children].forEach((c) => c.classList.toggle("active", c.dataset.id === state.activeCategory));
}

function resetFiltersForEntry() {
  state.activeCategory = "all";
  state.query = "";
  state.starFilter = 0;
  state.mythOnly = false;
  state.tagFilter = null;
}

function scrollToHashEntry() {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!id) return;
  const entry = state.entries.find((e) => e.id === id);
  if (!entry) return;
  resetFiltersForEntry();
  syncControlsUI();
  history.replaceState(null, "", `${window.location.pathname}#${id}`);
  render();
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("highlight");
    setTimeout(() => el.classList.remove("highlight"), 1600);
  });
}

function renderNewStrip() {
  const container = document.getElementById("new-strip-row");
  if (!container) return;
  const top = [...state.entries]
    .sort((a, b) => b.date_added.localeCompare(a.date_added))
    .slice(0, 5);
  container.innerHTML = "";
  for (const entry of top) {
    const cat = categoryById(entry.category) || { label: entry.category };
    const a = document.createElement("a");
    a.href = `#${entry.id}`;
    a.className = "new-strip-item";
    const catSpan = document.createElement("span");
    catSpan.className = "cat";
    catSpan.textContent = cat.label;
    const ttl = document.createElement("div");
    ttl.className = "ttl";
    ttl.textContent = entry.title;
    const stars = document.createElement("span");
    stars.className = "stars";
    stars.textContent = starString(entry.stars);
    a.append(catSpan, ttl, stars);
    container.appendChild(a);
  }
}

function copyTextFallback(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch (e) {
    /* no-op: clipboard unavailable */
  }
  document.body.removeChild(ta);
}

function flashCopied(btn) {
  const original = btn.textContent;
  btn.textContent = "✓";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("copied");
  }, 1300);
}

function copyEntryLink(id, btn) {
  const url = `${window.location.origin}${window.location.pathname}#${id}`;
  history.replaceState(null, "", `${window.location.pathname}#${id}`);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(url)
      .then(() => flashCopied(btn))
      .catch(() => {
        copyTextFallback(url);
        flashCopied(btn);
      });
  } else {
    copyTextFallback(url);
    flashCopied(btn);
  }
}

function categoryById(id) {
  return state.categories.find((c) => c.id === id);
}

function isNew(entry) {
  if (!entry.date_added) return false;
  const added = new Date(entry.date_added);
  if (Number.isNaN(added.getTime())) return false;
  const days = (Date.now() - added.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 14;
}

function isStale(entry) {
  if (!entry.last_reviewed) return false;
  const reviewed = new Date(entry.last_reviewed);
  if (Number.isNaN(reviewed.getTime())) return false;
  const days = (Date.now() - reviewed.getTime()) / (1000 * 60 * 60 * 24);
  return days > 365;
}

function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function summaryFor(entry) {
  if (!entry.summary) return "";
  if (typeof entry.summary === "string") return entry.summary;
  return entry.summary[state.level] || entry.summary.general || "";
}

function matchesQuery(entry, q) {
  if (!q) return true;
  const summaryText = entry.summary && typeof entry.summary === "object"
    ? Object.values(entry.summary).join(" ")
    : entry.summary || "";
  const haystack = [entry.title, summaryText, entry.practical_takeaway, ...(entry.tags || [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function sortEntries(entries) {
  const sorted = [...entries];
  switch (state.sort) {
    case "stars_desc":
      sorted.sort((a, b) => b.stars - a.stars || b.date_added.localeCompare(a.date_added));
      break;
    case "stars_asc":
      sorted.sort((a, b) => a.stars - b.stars || b.date_added.localeCompare(a.date_added));
      break;
    case "date_desc":
      sorted.sort((a, b) => b.date_added.localeCompare(a.date_added));
      break;
  }
  return sorted;
}

function render() {
  const filtered = state.entries.filter((e) => {
    const catOk = state.activeCategory === "all" || e.category === state.activeCategory;
    const starOk = state.starFilter === 0 || e.stars >= state.starFilter;
    const mythOk = !state.mythOnly || e.status === "myth_revised";
    const tagOk = !state.tagFilter || (e.tags || []).includes(state.tagFilter);
    return catOk && starOk && mythOk && tagOk && matchesQuery(e, state.query);
  });
  const sorted = sortEntries(filtered);

  const grid = document.getElementById("cards");
  grid.innerHTML = "";

  const meta = document.getElementById("results-meta");
  meta.innerHTML = "";
  const countSpan = document.createElement("span");
  countSpan.textContent = `${sorted.length}件の情報`;
  meta.appendChild(countSpan);
  if (state.tagFilter) {
    const tagChip = document.createElement("button");
    tagChip.type = "button";
    tagChip.className = "active-tag-chip";
    tagChip.textContent = `タグ: ${state.tagFilter} ✕`;
    tagChip.addEventListener("click", () => {
      state.tagFilter = null;
      render();
    });
    meta.appendChild(tagChip);
  }

  document.getElementById("empty-state").hidden = sorted.length > 0;

  for (const entry of sorted) {
    grid.appendChild(renderCard(entry));
  }

  setupClampedSummaries();
}

function setupClampedSummaries() {
  document.querySelectorAll("#cards .summary.clamped").forEach((el) => {
    if (el.scrollHeight > el.clientHeight + 2) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "expand-btn";
      btn.textContent = "続きを読む";
      btn.addEventListener("click", () => {
        el.classList.toggle("clamped");
        btn.textContent = el.classList.contains("clamped") ? "続きを読む" : "閉じる";
      });
      el.insertAdjacentElement("afterend", btn);
    }
  });
}

function renderCard(entry) {
  const cat = categoryById(entry.category) || { label: entry.category, color: "#888" };
  const card = document.createElement("article");
  card.className = "card";
  card.id = entry.id;

  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "category-tag";
  tag.style.background = cat.color;
  tag.textContent = cat.label;
  const topRight = document.createElement("div");
  topRight.className = "card-top-right";
  const stars = document.createElement("span");
  stars.className = "stars";
  stars.title = entry.evidence_level;
  stars.setAttribute("role", "img");
  stars.setAttribute("aria-label", `信頼度 5段階中${entry.stars}`);
  stars.textContent = starString(entry.stars);
  const linkBtn = document.createElement("button");
  linkBtn.type = "button";
  linkBtn.className = "link-btn";
  linkBtn.setAttribute("aria-label", "この記事のリンクをコピー");
  linkBtn.textContent = "🔗";
  linkBtn.addEventListener("click", () => copyEntryLink(entry.id, linkBtn));
  topRight.append(stars, linkBtn);
  top.append(tag, topRight);
  card.appendChild(top);

  const badges = [];
  if (isNew(entry)) {
    const badge = document.createElement("span");
    badge.className = "new-badge";
    badge.textContent = "🆕 新着";
    badges.push(badge);
  }
  if (entry.status === "myth_revised") {
    const badge = document.createElement("span");
    badge.className = "myth-badge";
    badge.textContent = "⚠️ 定説の見直し";
    badges.push(badge);
  } else if (entry.status === "under_debate") {
    const badge = document.createElement("span");
    badge.className = "debate-badge";
    badge.textContent = "🔀 評価が分かれている";
    badges.push(badge);
  }
  if (isStale(entry)) {
    const badge = document.createElement("span");
    badge.className = "stale-badge";
    badge.textContent = "🕓 更新確認から1年以上経過";
    badges.push(badge);
  }
  if (badges.length) {
    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";
    badges.forEach((b) => badgeRow.appendChild(b));
    card.appendChild(badgeRow);
  }

  const h2 = document.createElement("h2");
  h2.textContent = entry.title;
  card.appendChild(h2);

  const level = document.createElement("div");
  level.className = "evidence-level";
  level.textContent = entry.evidence_level;
  card.appendChild(level);

  const summary = document.createElement("p");
  summary.className = "summary clamped";
  summary.textContent = summaryFor(entry);
  card.appendChild(summary);

  if (entry.practical_takeaway) {
    const takeaway = document.createElement("div");
    takeaway.className = "takeaway";
    takeaway.innerHTML = `<strong>実践のヒント：</strong>${escapeHtml(entry.practical_takeaway)}`;
    card.appendChild(takeaway);
  }

  if (entry.caution) {
    const caution = document.createElement("div");
    caution.className = "caution";
    caution.textContent = `注意点：${entry.caution}`;
    card.appendChild(caution);
  }

  if (entry.sources && entry.sources.length) {
    const sources = document.createElement("div");
    sources.className = "sources";
    for (const s of entry.sources) {
      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = `↗ ${s.name}`;
      sources.appendChild(a);
    }
    card.appendChild(sources);
  }

  const tagsRow = document.createElement("div");
  tagsRow.className = "tags";
  for (const t of entry.tags || []) {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "tag-pill" + (state.tagFilter === t ? " active" : "");
    pill.dataset.tag = t;
    pill.textContent = t;
    tagsRow.appendChild(pill);
  }
  card.appendChild(tagsRow);

  const footer = document.createElement("div");
  footer.className = "card-footer";
  footer.innerHTML = `<span>追加: ${entry.date_added}</span><span>最終確認: ${entry.last_reviewed}</span>`;
  card.appendChild(footer);

  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();
