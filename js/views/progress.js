/* İlerleme görünümü: kilo grafiği, kalori/antrenman trendleri, kişisel rekorlar */
window.ProgressView = (function () {
  function render(container, dateKey) {
    const weights = Store.state.weights;
    const profile = Store.state.profile;
    const targets = Utils.macroTargets(profile);

    const rangeKeys = Utils.lastNDays(14, dateKey);
    const kcalData = rangeKeys.map((k) => ({
      label: Utils.keyToDate(k).getDate() + "",
      value: Math.round(Store.nutritionTotals(k).kcal),
    }));
    const burnData = rangeKeys.map((k) => ({
      label: Utils.keyToDate(k).getDate() + "",
      value: Store.workoutCalories(k),
    }));

    const weightData = weights.slice(-14).map((w) => ({
      label: Utils.keyToDate(w.date).getDate() + "",
      value: w.kg,
    }));

    const prs = Store.personalRecords();
    const prList = Object.entries(prs).sort((a, b) => b[1].weight - a[1].weight);

    // Seri (streak): bugünden geriye kesintisiz kayıtlı gün sayısı
    let streak = 0;
    let cursor = Utils.todayKey();
    while (hasActivity(cursor)) { streak++; cursor = Utils.shiftKey(cursor, -1); }

    const totalWorkouts = Object.values(Store.state.logs)
      .reduce((s, d) => s + (d.workouts ? d.workouts.length : 0), 0);

    container.innerHTML = `
      <div class="grid-3">
        <div class="stat-tile">
          <div class="stat-label">Seri</div>
          <div class="stat-value">${streak} gün</div>
          <div class="stat-sub">kesintisiz kayıt</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Toplam Antrenman</div>
          <div class="stat-value">${totalWorkouts}</div>
          <div class="stat-sub">tüm zamanlar</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Güncel Kilo</div>
          <div class="stat-value">${Utils.fmt(profile.weight, 1)} kg</div>
          <div class="stat-sub">BMI ${Utils.fmt(Utils.bmi(profile), 1)} · ${Utils.bmiLabel(Utils.bmi(profile))}</div>
        </div>
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-title">
          <span>Kilo Takibi</span>
          <button class="btn btn-primary btn-sm" id="addWeightBtn">+ Kilo Kaydet</button>
        </div>
        <div class="chart-wrap">${Charts.lineChart({ data: weightData, unit: " kg", color: "var(--success)" })}</div>
        ${weights.length > 1 ? weightSummary(weights) : ""}
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">Son 14 Gün — Alınan Kalori</div>
          <div class="chart-wrap">${Charts.barChart({ data: kcalData, target: targets.kcal, height: 180 })}</div>
        </div>
        <div class="card">
          <div class="card-title">Son 14 Gün — Yakılan Kalori</div>
          <div class="chart-wrap">${Charts.barChart({ data: burnData, color: "var(--success)", height: 180 })}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Kişisel Rekorlar 🏆</div>
        ${prList.length === 0
          ? `<div class="empty-note">Ağırlıklı antrenman kaydettikçe rekorların burada görünecek.</div>`
          : `<table class="data-table">
              <thead><tr><th>Egzersiz</th><th>Ağırlık</th><th>Tekrar</th><th>Tarih</th></tr></thead>
              <tbody>${prList.map(([name, pr]) => `
                <tr>
                  <td><b>${Utils.esc(name)}</b></td>
                  <td>${Utils.fmt(pr.weight, 1)} kg</td>
                  <td>${pr.reps}</td>
                  <td>${Utils.formatKey(pr.date)}</td>
                </tr>`).join("")}</tbody>
            </table>`}
      </div>

      <div class="card">
        <div class="card-title">Kilo Kayıtları</div>
        ${weights.length === 0
          ? `<div class="empty-note">Henüz kilo kaydı yok.</div>`
          : `<ul class="item-list">${weights.slice().reverse().slice(0, 10).map((w) => `
              <li class="item-row">
                <div class="item-main">
                  <div class="item-name">${Utils.fmt(w.kg, 1)} kg</div>
                  <div class="item-detail">${Utils.formatKey(w.date)}</div>
                </div>
                <button class="icon-btn" data-del-weight="${w.date}" title="Sil">🗑</button>
              </li>`).join("")}</ul>`}
      </div>
    `;

    container.querySelector("#addWeightBtn").addEventListener("click", () =>
      openWeightModal(dateKey, () => render(container, dateKey))
    );
    container.querySelectorAll("[data-del-weight]").forEach((btn) =>
      btn.addEventListener("click", () => {
        Store.removeWeight(btn.dataset.delWeight);
        render(container, dateKey);
      })
    );
  }

  function hasActivity(dateKey) {
    const day = Store.state.logs[dateKey];
    if (!day) return false;
    const hasFood = day.meals && Object.values(day.meals).some((m) => m.length > 0);
    const hasWorkout = day.workouts && day.workouts.length > 0;
    return hasFood || hasWorkout;
  }

  function weightSummary(weights) {
    const first = weights[0], last = weights[weights.length - 1];
    const diff = last.kg - first.kg;
    const cls = diff <= 0 ? "badge-success" : "badge-warning";
    const sign = diff > 0 ? "+" : "";
    return `<div style="margin-top:10px">
      <span class="badge ${cls}">${sign}${Utils.fmt(diff, 1)} kg</span>
      <span class="item-detail" style="margin-left:8px">${Utils.formatKey(first.date)} → ${Utils.formatKey(last.date)}</span>
    </div>`;
  }

  function openWeightModal(dateKey, onDone) {
    App.openModal("Kilo Kaydet", `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tarih</label>
          <input type="date" class="form-input" id="wgDate" value="${dateKey}">
        </div>
        <div class="form-group">
          <label class="form-label">Kilo (kg)</label>
          <input type="number" class="form-input" id="wgKg" value="${Store.state.profile.weight}" min="20" max="400" step="0.1">
        </div>
      </div>
      <button class="btn btn-primary btn-block" id="wgSave">Kaydet</button>
    `);
    document.getElementById("wgSave").addEventListener("click", () => {
      const date = document.getElementById("wgDate").value;
      const kg = Number(document.getElementById("wgKg").value);
      if (!date || !kg || kg < 20) { App.toast("Geçerli bir tarih ve kilo gir"); return; }
      Store.addWeight(date, kg);
      App.closeModal();
      App.toast("Kilo kaydedildi ⚖️");
      onDone();
    });
  }

  return { render };
})();
