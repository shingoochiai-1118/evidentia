const state = {
  entries: [],
  categories: [],
  activeCategory: "all",
  query: "",
  sort: "stars_desc",
};

async function init() {
  const [entries, categories] = await Promise.all([
    fetch("../data/entries.json").then((r) => r.json()),
    fetch("../data/categories.json").then((r) => r.json()),
  ]);
  state.entries = entries;
  state.categories = categories;
  renderChips();
  render();

  document.getElementById("search").addEventListener("input", (e) => {
    state.query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });
}

function renderChips() {
  const container = document.getElementById("category-chips");
  const all = document.createElement("button");
  all.className = "chip active";
  all.textContent = "すべて";
  all.dataset.id = "all";
  container.appendChild(all);

  for (const cat of state.categories) {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = cat.label;
    btn.dataset.id = cat.id;
    container.appendChild(btn);
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state.activeCategory = btn.dataset.id;
    [...container.children].forEach((c) => c.classList.toggle("active", c === btn));
    render();
  });
}

function categoryById(id) {
  return state.categories.find((c) => c.id === id);
}

function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function matchesQuery(entry, q) {
  if (!q) return true;
  const haystack = [entry.title, entry.summary, entry.practical_takeaway, ...(entry.tags || [])]
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
    return catOk && matchesQuery(e, state.query);
  });
  const sorted = sortEntries(filtered);

  const grid = document.getElementById("cards");
  grid.innerHTML = "";
  document.getElementById("results-meta").textContent = `${sorted.length}件の情報`;
  document.getElementById("empty-state").hidden = sorted.length > 0;

  for (const entry of sorted) {
    grid.appendChild(renderCard(entry));
  }
}

function renderCard(entry) {
  const cat = categoryById(entry.category) || { label: entry.category, color: "#888" };
  const card = document.createElement("article");
  card.className = "card";

  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "category-tag";
  tag.style.background = cat.color;
  tag.textContent = cat.label;
  const stars = document.createElement("span");
  stars.className = "stars";
  stars.title = entry.evidence_level;
  stars.textContent = starString(entry.stars);
  top.append(tag, stars);
  card.appendChild(top);

  if (entry.status === "myth_revised") {
    const badge = document.createElement("span");
    badge.className = "myth-badge";
    badge.textContent = "⚠️ 定説の見直し";
    card.appendChild(badge);
  }

  const h2 = document.createElement("h2");
  h2.textContent = entry.title;
  card.appendChild(h2);

  const level = document.createElement("div");
  level.className = "evidence-level";
  level.textContent = entry.evidence_level;
  card.appendChild(level);

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = entry.summary;
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
    const pill = document.createElement("span");
    pill.className = "tag-pill";
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
