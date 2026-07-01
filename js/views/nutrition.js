/* Beslenme görünümü: öğün günlüğü, besin arama, özel besin ekleme */
window.NutritionView = (function () {
  const MEALS = [
    { key: "kahvalti", name: "Kahvaltı", icon: "🌅" },
    { key: "ogle", name: "Öğle Yemeği", icon: "☀️" },
    { key: "aksam", name: "Akşam Yemeği", icon: "🌙" },
    { key: "ara", name: "Ara Öğün", icon: "🍿" },
  ];

  function render(container, dateKey) {
    const totals = Store.nutritionTotals(dateKey);
    const targets = Utils.macroTargets(Store.state.profile);
    const day = Store.getDay(dateKey);

    container.innerHTML = `
      <div class="card">
        <div class="card-title">
          <span>Günlük Toplam</span>
          <span class="meal-kcal">${Utils.fmt(totals.kcal)} / ${Utils.fmt(targets.kcal)} kcal</span>
        </div>
        <div class="progress-bar" style="height:12px">
          <div class="progress-fill ${totals.kcal > targets.kcal ? "fill-over" : "fill-kcal"}"
            style="width:${Math.min((totals.kcal / targets.kcal) * 100, 100)}%"></div>
        </div>
        <div class="chart-legend" style="margin-top:10px">
          <span>Protein: <b>${Utils.fmt(totals.p, 1)} g</b></span>
          <span>Karbonhidrat: <b>${Utils.fmt(totals.c, 1)} g</b></span>
          <span>Yağ: <b>${Utils.fmt(totals.f, 1)} g</b></span>
        </div>
      </div>

      ${MEALS.map((meal) => renderMeal(meal, day, dateKey)).join("")}

      <div class="card">
        <div class="card-title">Özel Besin Oluştur</div>
        <p class="item-detail" style="margin-bottom:12px">
          Veritabanında olmayan bir besini 100 g başına değerleriyle ekle; aramalarda görünecektir.
        </p>
        <button class="btn btn-ghost" id="customFoodBtn">+ Özel besin ekle</button>
      </div>
    `;

    MEALS.forEach((meal) => {
      container.querySelector(`[data-add="${meal.key}"]`).addEventListener("click", () =>
        openAddFoodModal(dateKey, meal, () => render(container, dateKey))
      );
      container.querySelectorAll(`[data-del-meal="${meal.key}"]`).forEach((btn) =>
        btn.addEventListener("click", () => {
          Store.removeFoodEntry(dateKey, meal.key, btn.dataset.entry);
          render(container, dateKey);
        })
      );
    });

    container.querySelector("#customFoodBtn").addEventListener("click", () =>
      openCustomFoodModal(() => render(container, dateKey))
    );
  }

  function renderMeal(meal, day, dateKey) {
    const entries = day.meals[meal.key];
    const kcal = entries.reduce((s, e) => s + e.kcal, 0);
    return `
      <div class="card meal-section">
        <div class="meal-header">
          <div class="meal-title">${meal.icon} ${meal.name}</div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="meal-kcal">${Utils.fmt(kcal)} kcal</span>
            <button class="btn btn-primary btn-sm" data-add="${meal.key}">+ Ekle</button>
          </div>
        </div>
        ${entries.length === 0
          ? `<div class="empty-note">Henüz bir şey eklenmedi</div>`
          : `<ul class="item-list">${entries.map((e) => `
              <li class="item-row">
                <div class="item-main">
                  <div class="item-name">${Utils.esc(e.name)}</div>
                  <div class="item-detail">${Utils.fmt(e.grams)} g · P ${Utils.fmt(e.p, 1)} · K ${Utils.fmt(e.c, 1)} · Y ${Utils.fmt(e.f, 1)}</div>
                </div>
                <span class="item-kcal">${Utils.fmt(e.kcal)} kcal</span>
                <button class="icon-btn" data-del-meal="${meal.key}" data-entry="${e.id}" title="Sil">🗑</button>
              </li>`).join("")}</ul>`}
      </div>`;
  }

  function openAddFoodModal(dateKey, meal, onDone) {
    App.openModal(`${meal.icon} ${meal.name} — Besin Ekle`, `
      <div class="form-group">
        <label class="form-label">Besin ara</label>
        <input type="text" class="form-input" id="foodSearch" placeholder="örn. tavuk, yulaf, elma..." autocomplete="off">
        <div class="search-results" id="foodResults"></div>
      </div>
      <div id="foodDetail" class="hidden">
        <div class="form-group">
          <label class="form-label">Miktar (gram)</label>
          <input type="number" class="form-input" id="foodGrams" value="100" min="1">
        </div>
        <div class="item-detail" id="foodPreview" style="margin-bottom:12px"></div>
        <button class="btn btn-primary btn-block" id="foodConfirm">Öğüne Ekle</button>
      </div>
    `);

    const search = document.getElementById("foodSearch");
    const results = document.getElementById("foodResults");
    const detail = document.getElementById("foodDetail");
    const gramsInput = document.getElementById("foodGrams");
    const preview = document.getElementById("foodPreview");
    let selected = null;

    function renderResults(q) {
      const foods = Store.allFoods().filter((f) =>
        f.name.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr"))
      ).slice(0, 30);
      results.innerHTML = foods.length === 0
        ? `<div class="empty-note">Sonuç bulunamadı</div>`
        : foods.map((f) => `
            <button class="search-result" data-food="${f.id}">
              <span>${Utils.esc(f.name)} <span class="sr-macros">· ${Utils.esc(f.cat)}</span></span>
              <span class="sr-macros">${f.kcal} kcal/100g</span>
            </button>`).join("");
      results.querySelectorAll("[data-food]").forEach((btn) =>
        btn.addEventListener("click", () => {
          selected = Store.allFoods().find((f) => f.id === btn.dataset.food);
          detail.classList.remove("hidden");
          updatePreview();
          gramsInput.focus();
          gramsInput.select();
        })
      );
    }

    function updatePreview() {
      if (!selected) return;
      const g = Number(gramsInput.value) || 0;
      const k = g / 100;
      preview.innerHTML = `<b>${Utils.esc(selected.name)}</b> — ${Utils.fmt(selected.kcal * k)} kcal ·
        P ${Utils.fmt(selected.p * k, 1)} g · K ${Utils.fmt(selected.c * k, 1)} g · Y ${Utils.fmt(selected.f * k, 1)} g`;
    }

    search.addEventListener("input", () => renderResults(search.value));
    gramsInput.addEventListener("input", updatePreview);
    renderResults("");

    document.getElementById("foodConfirm").addEventListener("click", () => {
      if (!selected) return;
      const g = Number(gramsInput.value);
      if (!g || g <= 0) { App.toast("Geçerli bir gram değeri gir"); return; }
      const k = g / 100;
      Store.addFoodEntry(dateKey, meal.key, {
        name: selected.name,
        grams: g,
        kcal: Utils.round(selected.kcal * k),
        p: Utils.round(selected.p * k, 1),
        c: Utils.round(selected.c * k, 1),
        f: Utils.round(selected.f * k, 1),
      });
      App.closeModal();
      App.toast(`${selected.name} eklendi ✅`);
      onDone();
    });

    search.focus();
  }

  function openCustomFoodModal(onDone) {
    App.openModal("Özel Besin Oluştur", `
      <div class="form-group">
        <label class="form-label">Besin adı</label>
        <input type="text" class="form-input" id="cfName" placeholder="örn. Ev yapımı granola">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Kalori (kcal / 100 g)</label>
          <input type="number" class="form-input" id="cfKcal" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Protein (g / 100 g)</label>
          <input type="number" class="form-input" id="cfP" min="0" step="0.1">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Karbonhidrat (g / 100 g)</label>
          <input type="number" class="form-input" id="cfC" min="0" step="0.1">
        </div>
        <div class="form-group">
          <label class="form-label">Yağ (g / 100 g)</label>
          <input type="number" class="form-input" id="cfF" min="0" step="0.1">
        </div>
      </div>
      <button class="btn btn-primary btn-block" id="cfSave">Kaydet</button>
    `);

    document.getElementById("cfSave").addEventListener("click", () => {
      const name = document.getElementById("cfName").value.trim();
      const kcal = Number(document.getElementById("cfKcal").value);
      if (!name || !kcal) { App.toast("Ad ve kalori alanları zorunlu"); return; }
      Store.addCustomFood({
        name,
        kcal,
        p: Number(document.getElementById("cfP").value) || 0,
        c: Number(document.getElementById("cfC").value) || 0,
        f: Number(document.getElementById("cfF").value) || 0,
      });
      App.closeModal();
      App.toast(`"${name}" veritabanına eklendi ✅`);
      onDone();
    });
  }

  return { render };
})();
