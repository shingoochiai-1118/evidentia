async function init() {
  const [entries, items] = await Promise.all([
    fetch("../data/entries.json").then((r) => r.json()),
    fetch("../data/items.json").then((r) => r.json()),
  ]);

  const exerciseGrid = document.getElementById("exercise-grid");
  const foodGrid = document.getElementById("food-grid");

  for (const item of items) {
    const grid = item.type === "exercise" ? exerciseGrid : foodGrid;
    grid.appendChild(renderItemCard(item, entries));
  }
}

function findMatch(item, entries) {
  for (const tag of item.matchTags) {
    const matches = entries.filter((e) => (e.tags || []).includes(tag));
    if (matches.length) {
      matches.sort((a, b) => b.stars - a.stars);
      return { entry: matches[0], tag };
    }
  }
  return null;
}

function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function renderItemCard(item, entries) {
  const match = findMatch(item, entries);

  if (!match) {
    const div = document.createElement("div");
    div.className = "item-card empty";
    div.innerHTML = `
      <div class="item-icon">${item.icon}</div>
      <div class="item-label">${item.label}</div>
      <div class="item-empty-label">まだ調べていません</div>
    `;
    return div;
  }

  const { entry, tag } = match;
  const a = document.createElement("a");
  a.className = "item-card has-evidence";
  a.href = `index.html?tag=${encodeURIComponent(tag)}`;

  const badge = entry.status === "myth_revised"
    ? `<span class="item-debate-badge">⚠️ 定説の見直し</span>`
    : entry.status === "under_debate"
      ? `<span class="item-debate-badge">🔀 評価が分かれている</span>`
      : "";

  const snippet = entry.summary && entry.summary.general
    ? entry.summary.general.slice(0, 40) + "…"
    : "";

  a.innerHTML = `
    <div class="item-icon">${item.icon}</div>
    <div class="item-label">${item.label}</div>
    <div class="item-stars">${starString(entry.stars)}</div>
    <div class="item-snippet">${snippet}</div>
    ${badge}
  `;
  return a;
}

init();
