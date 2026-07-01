/* Profil görünümü: kişisel bilgiler, hedefler, hesaplanan değerler, veri yönetimi */
window.ProfileView = (function () {
  function render(container, dateKey) {
    const p = Store.state.profile;
    const targets = Utils.macroTargets(p);
    const bmrVal = Utils.bmr(p);
    const tdeeVal = Utils.tdee(p);
    const bmiVal = Utils.bmi(p);

    container.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <div class="card-title">Kişisel Bilgiler</div>
          <div class="form-group">
            <label class="form-label">İsim</label>
            <input type="text" class="form-input" id="pName" value="${Utils.esc(p.name)}" placeholder="Adın">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Yaş</label>
              <input type="number" class="form-input" id="pAge" value="${p.age}" min="10" max="100">
            </div>
            <div class="form-group">
              <label class="form-label">Cinsiyet</label>
              <select class="form-select" id="pGender">
                <option value="male" ${p.gender === "male" ? "selected" : ""}>Erkek</option>
                <option value="female" ${p.gender === "female" ? "selected" : ""}>Kadın</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Boy (cm)</label>
              <input type="number" class="form-input" id="pHeight" value="${p.height}" min="100" max="250">
            </div>
            <div class="form-group">
              <label class="form-label">Kilo (kg)</label>
              <input type="number" class="form-input" id="pWeight" value="${p.weight}" min="20" max="400" step="0.1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Aktivite düzeyi</label>
            <select class="form-select" id="pActivity">
              <option value="sedentary" ${p.activityLevel === "sedentary" ? "selected" : ""}>Hareketsiz (masa başı)</option>
              <option value="light" ${p.activityLevel === "light" ? "selected" : ""}>Az hareketli (haftada 1-3 gün)</option>
              <option value="moderate" ${p.activityLevel === "moderate" ? "selected" : ""}>Orta (haftada 3-5 gün)</option>
              <option value="active" ${p.activityLevel === "active" ? "selected" : ""}>Aktif (haftada 6-7 gün)</option>
              <option value="very_active" ${p.activityLevel === "very_active" ? "selected" : ""}>Çok aktif (günde 2 antrenman)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Hedef</label>
            <select class="form-select" id="pGoal">
              <option value="lose" ${p.goal === "lose" ? "selected" : ""}>Kilo vermek (−500 kcal/gün)</option>
              <option value="maintain" ${p.goal === "maintain" ? "selected" : ""}>Kiloyu korumak</option>
              <option value="gain" ${p.goal === "gain" ? "selected" : ""}>Kas / kilo almak (+400 kcal/gün)</option>
            </select>
          </div>
          <button class="btn btn-primary btn-block" id="pSave">Profili Kaydet</button>
        </div>

        <div>
          <div class="card">
            <div class="card-title">Hesaplanan Değerler</div>
            <table class="data-table">
              <tbody>
                <tr><td>Bazal Metabolizma (BMR)</td><td><b>${Utils.fmt(bmrVal)} kcal</b></td></tr>
                <tr><td>Günlük Enerji Harcaması (TDEE)</td><td><b>${Utils.fmt(tdeeVal)} kcal</b></td></tr>
                <tr><td>Günlük Kalori Hedefi</td><td><b>${Utils.fmt(targets.kcal)} kcal</b></td></tr>
                <tr><td>Vücut Kitle İndeksi (BMI)</td><td><b>${Utils.fmt(bmiVal, 1)}</b> · ${Utils.bmiLabel(bmiVal)}</td></tr>
              </tbody>
            </table>
            <p class="item-detail" style="margin-top:10px">
              BMR, Mifflin-St Jeor formülüyle hesaplanır. Hedef kalori, aktivite düzeyine ve hedefe göre uyarlanır.
            </p>
          </div>

          <div class="card">
            <div class="card-title">Günlük Makro Hedefleri</div>
            <div class="macro-row">
              <div class="macro-head"><span>🥩 Protein</span><span class="muted">${Utils.fmt(targets.protein)} g (1.8 g/kg)</span></div>
              <div class="macro-head"><span>🍞 Karbonhidrat</span><span class="muted">${Utils.fmt(targets.carb)} g</span></div>
              <div class="macro-head"><span>🥑 Yağ</span><span class="muted">${Utils.fmt(targets.fat)} g (%27)</span></div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Veri Yönetimi</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap">
              <button class="btn btn-ghost" id="exportBtn">⬇️ Verileri Dışa Aktar</button>
              <button class="btn btn-ghost" id="importBtn">⬆️ İçe Aktar</button>
              <button class="btn btn-danger" id="resetBtn">Tüm Verileri Sıfırla</button>
            </div>
            <input type="file" id="importFile" accept="application/json" class="hidden">
            <p class="item-detail" style="margin-top:10px">
              Verilerin yalnızca bu tarayıcıda (localStorage) saklanır. Yedek almak için dışa aktarabilirsin.
            </p>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#pSave").addEventListener("click", () => {
      const patch = {
        name: container.querySelector("#pName").value.trim(),
        age: Number(container.querySelector("#pAge").value) || 25,
        gender: container.querySelector("#pGender").value,
        height: Number(container.querySelector("#pHeight").value) || 175,
        weight: Number(container.querySelector("#pWeight").value) || 75,
        activityLevel: container.querySelector("#pActivity").value,
        goal: container.querySelector("#pGoal").value,
      };
      Store.updateProfile(patch);
      App.toast("Profil kaydedildi ✅");
      render(container, dateKey);
    });

    container.querySelector("#exportBtn").addEventListener("click", () => {
      const blob = new Blob([Store.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `fitlife-yedek-${Utils.todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      App.toast("Yedek indirildi 📦");
    });

    const importFile = container.querySelector("#importFile");
    container.querySelector("#importBtn").addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", () => {
      const file = importFile.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          Store.importJSON(reader.result);
          App.toast("Veriler içe aktarıldı ✅");
          App.refresh();
        } catch (e) {
          App.toast("Dosya okunamadı: geçersiz format");
        }
      };
      reader.readAsText(file);
    });

    container.querySelector("#resetBtn").addEventListener("click", () => {
      if (confirm("Tüm veriler silinecek. Emin misin? Bu işlem geri alınamaz.")) {
        Store.resetAll();
        App.toast("Tüm veriler sıfırlandı");
        App.refresh();
      }
    });
  }

  return { render };
})();
