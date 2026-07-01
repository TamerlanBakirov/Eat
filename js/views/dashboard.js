/* Özet görünümü: günün kalori dengesi, makrolar, su, haftalık grafik */
window.DashboardView = (function () {
  function render(container, dateKey) {
    const profile = Store.state.profile;
    const targets = Utils.macroTargets(profile);
    const totals = Store.nutritionTotals(dateKey);
    const burned = Store.workoutCalories(dateKey);
    const net = totals.kcal - burned;
    const remaining = targets.kcal - net;
    const day = Store.getDay(dateKey);
    const workoutCount = day.workouts.length;

    const weekKeys = Utils.lastNDays(7, dateKey);
    const weekData = weekKeys.map((k) => ({
      label: Utils.shortDay(k),
      value: Math.round(Store.nutritionTotals(k).kcal),
    }));
    const weekBurn = weekKeys.map((k) => ({
      label: Utils.shortDay(k),
      value: Store.workoutCalories(k),
    }));

    container.innerHTML = `
      <div class="grid-4">
        <div class="stat-tile">
          <div class="stat-label">Alınan</div>
          <div class="stat-value">${Utils.fmt(totals.kcal)}</div>
          <div class="stat-sub">kcal / hedef ${Utils.fmt(targets.kcal)}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Yakılan</div>
          <div class="stat-value positive">${Utils.fmt(burned)}</div>
          <div class="stat-sub">kcal antrenman ile</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Net</div>
          <div class="stat-value">${Utils.fmt(net)}</div>
          <div class="stat-sub">alınan − yakılan</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Kalan</div>
          <div class="stat-value ${remaining >= 0 ? "positive" : "negative"}">${Utils.fmt(remaining)}</div>
          <div class="stat-sub">${remaining >= 0 ? "kcal hakkın var" : "kcal hedefi aştın"}</div>
        </div>
      </div>

      <div class="grid-2" style="margin-top:20px">
        <div class="card">
          <div class="card-title">Kalori Hedefi</div>
          <div class="ring-wrap">
            <div>${Charts.ring({
              value: net,
              target: targets.kcal,
              label: Utils.fmt(Math.max(net, 0)),
              sublabel: `/ ${Utils.fmt(targets.kcal)} kcal`,
            })}</div>
            <div class="ring-labels">
              <div><span class="legend-dot" style="background:var(--primary)"></span>Net alım: <b>${Utils.fmt(net)} kcal</b></div>
              <div><span class="legend-dot" style="background:var(--surface-2);border:1px solid var(--border)"></span>Hedef: <b>${Utils.fmt(targets.kcal)} kcal</b></div>
              <div>${statusBadge(net, targets.kcal)}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Makro Besinler</div>
          <div class="macro-row">
            ${macroBar("Protein", totals.p, targets.protein, "fill-protein")}
            ${macroBar("Karbonhidrat", totals.c, targets.carb, "fill-carb")}
            ${macroBar("Yağ", totals.f, targets.fat, "fill-fat")}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Su Takibi</span>
          <span class="meal-kcal">${day.water} / 8 bardak</span>
        </div>
        <div class="water-tracker">
          <div class="water-glasses" id="waterGlasses">
            ${Array.from({ length: 8 }, (_, i) => `
              <button class="water-glass ${i < day.water ? "filled" : ""}" data-glass="${i + 1}"
                title="${i + 1}. bardak">💧</button>`).join("")}
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">Son 7 Gün — Alınan Kalori</div>
          <div class="chart-wrap">${Charts.barChart({ data: weekData, target: targets.kcal, color: "var(--primary)" })}</div>
          <div class="chart-legend">
            <span><span class="legend-dot" style="background:var(--primary)"></span>Alınan kcal</span>
            <span><span class="legend-dot" style="background:var(--warning)"></span>Günlük hedef</span>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Son 7 Gün — Yakılan Kalori</div>
          <div class="chart-wrap">${Charts.barChart({ data: weekBurn, color: "var(--success)" })}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Bugünün Antrenmanları</span>
          <span class="badge badge-primary">${workoutCount} antrenman</span>
        </div>
        ${day.workouts.length === 0
          ? `<div class="empty-note">Bu tarihte kayıtlı antrenman yok. "Antrenman" sekmesinden ekleyebilirsin. 💪</div>`
          : `<ul class="item-list">${day.workouts.map((w) => `
              <li class="item-row">
                <div class="item-main">
                  <div class="item-name">${Utils.esc(w.name)}</div>
                  <div class="item-detail">${w.exercises.length} hareket · ${w.duration} dk</div>
                </div>
                <span class="item-kcal">🔥 ${Utils.fmt(w.kcal)} kcal</span>
              </li>`).join("")}</ul>`}
      </div>
    `;

    container.querySelectorAll(".water-glass").forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = Number(btn.dataset.glass);
        // Aynı bardağa tekrar tıklanınca geri al
        Store.setWater(dateKey, day.water === n ? n - 1 : n);
        render(container, dateKey);
      });
    });
  }

  function macroBar(name, value, target, fillClass) {
    const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    const over = value > target;
    return `
      <div class="macro-item">
        <div class="macro-head">
          <span>${name}</span>
          <span class="muted">${Utils.fmt(value, 1)} / ${Utils.fmt(target)} g</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${over ? "fill-over" : fillClass}" style="width:${pct}%"></div>
        </div>
      </div>`;
  }

  function statusBadge(net, target) {
    if (net <= 0) return `<span class="badge badge-primary">Güne başla</span>`;
    const ratio = net / target;
    if (ratio < 0.8) return `<span class="badge badge-primary">Yolunda gidiyor</span>`;
    if (ratio <= 1.05) return `<span class="badge badge-success">Hedefe uygun</span>`;
    return `<span class="badge badge-danger">Hedef aşıldı</span>`;
  }

  return { render };
})();
