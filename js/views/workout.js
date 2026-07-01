/* Antrenman görünümü: antrenman kaydı, hazır programlar, egzersiz kütüphanesi */
window.WorkoutView = (function () {
  function render(container, dateKey) {
    const day = Store.getDay(dateKey);
    const burned = Store.workoutCalories(dateKey);

    container.innerHTML = `
      <div class="grid-3">
        <div class="stat-tile">
          <div class="stat-label">Antrenman</div>
          <div class="stat-value">${day.workouts.length}</div>
          <div class="stat-sub">bugün tamamlanan</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Süre</div>
          <div class="stat-value">${Utils.fmt(day.workouts.reduce((s, w) => s + (w.duration || 0), 0))}</div>
          <div class="stat-sub">dakika</div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">Yakılan</div>
          <div class="stat-value positive">${Utils.fmt(burned)}</div>
          <div class="stat-sub">kcal</div>
        </div>
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-title">
          <span>Bugünün Antrenmanları</span>
          <button class="btn btn-primary btn-sm" id="newWorkoutBtn">+ Yeni Antrenman</button>
        </div>
        ${day.workouts.length === 0
          ? `<div class="empty-note">Bu tarihte antrenman kaydı yok. Boş bir antrenman başlat veya hazır bir program seç. 💪</div>`
          : `<ul class="item-list">${day.workouts.map((w) => `
              <li class="item-row">
                <div class="item-main">
                  <div class="item-name">${Utils.esc(w.name)}</div>
                  <div class="item-detail">${w.exercises.map((e) => Utils.esc(e.name)).join(", ")}</div>
                  <div class="item-detail">${w.duration} dk · ${w.exercises.reduce((s, e) => s + (e.sets ? e.sets.length : 0), 0)} set</div>
                </div>
                <span class="item-kcal">🔥 ${Utils.fmt(w.kcal)} kcal</span>
                <button class="icon-btn" data-del-workout="${w.id}" title="Sil">🗑</button>
              </li>`).join("")}</ul>`}
      </div>

      <div class="card">
        <div class="card-title">Hazır Programlar</div>
        <div class="grid-2">
          ${PROGRAM_TEMPLATES.map((t) => `
            <div class="exercise-block">
              <div class="exercise-block-header">
                <span class="exercise-block-title">${Utils.esc(t.name)}</span>
                <button class="btn btn-ghost btn-sm" data-template="${t.id}">Başlat</button>
              </div>
              <div class="item-detail">${Utils.esc(t.desc)}</div>
              <div class="item-detail" style="margin-top:6px">
                ${t.exercises.map((e) => {
                  const ex = EXERCISE_DB.find((x) => x.id === e.exerciseId);
                  return ex ? Utils.esc(ex.name) : "";
                }).filter(Boolean).join(" · ")}
              </div>
            </div>`).join("")}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Egzersiz Kütüphanesi</div>
        <div class="tabs" id="exTabs"></div>
        <div id="exList"></div>
      </div>
    `;

    container.querySelector("#newWorkoutBtn").addEventListener("click", () =>
      openWorkoutModal(dateKey, null, () => render(container, dateKey))
    );

    container.querySelectorAll("[data-template]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const template = PROGRAM_TEMPLATES.find((t) => t.id === btn.dataset.template);
        openWorkoutModal(dateKey, template, () => render(container, dateKey));
      })
    );

    container.querySelectorAll("[data-del-workout]").forEach((btn) =>
      btn.addEventListener("click", () => {
        Store.removeWorkout(dateKey, btn.dataset.delWorkout);
        App.toast("Antrenman silindi");
        render(container, dateKey);
      })
    );

    renderExerciseLibrary(container);
  }

  function renderExerciseLibrary(container) {
    const tabsEl = container.querySelector("#exTabs");
    const listEl = container.querySelector("#exList");
    const cats = ["Tümü", ...new Set(EXERCISE_DB.map((e) => e.cat))];
    let active = "Tümü";

    function draw() {
      tabsEl.innerHTML = cats.map((c) =>
        `<button class="tab ${c === active ? "active" : ""}" data-cat="${c}">${c}</button>`
      ).join("");
      const items = active === "Tümü" ? EXERCISE_DB : EXERCISE_DB.filter((e) => e.cat === active);
      listEl.innerHTML = `<ul class="item-list">${items.map((e) => `
        <li class="item-row">
          <div class="item-main">
            <div class="item-name">${Utils.esc(e.name)}</div>
            <div class="item-detail">${Utils.esc(e.cat)} · ${e.type === "cardio" ? "Kardiyo" : "Kuvvet"} · MET ${e.met}</div>
          </div>
        </li>`).join("")}</ul>`;
      tabsEl.querySelectorAll(".tab").forEach((t) =>
        t.addEventListener("click", () => { active = t.dataset.cat; draw(); })
      );
    }
    draw();
  }

  /* Antrenman kayıt modalı — şablonla veya boş başlar */
  function openWorkoutModal(dateKey, template, onDone) {
    /* Geçici antrenman durumu */
    const workout = {
      name: template ? template.name : "Serbest Antrenman",
      duration: 45,
      exercises: (template ? template.exercises : []).map((te) => {
        const ex = EXERCISE_DB.find((x) => x.id === te.exerciseId);
        return makeExercise(ex, te.sets, te.reps, te.duration);
      }),
    };

    App.openModal("Antrenman Kaydet", `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Antrenman adı</label>
          <input type="text" class="form-input" id="wName" value="${Utils.esc(workout.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">Toplam süre (dk)</label>
          <input type="number" class="form-input" id="wDuration" value="${workout.duration}" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Egzersiz ekle</label>
        <select class="form-select" id="wExSelect">
          <option value="">— Egzersiz seç —</option>
          ${[...new Set(EXERCISE_DB.map((e) => e.cat))].map((cat) => `
            <optgroup label="${cat}">
              ${EXERCISE_DB.filter((e) => e.cat === cat).map((e) =>
                `<option value="${e.id}">${Utils.esc(e.name)}</option>`).join("")}
            </optgroup>`).join("")}
        </select>
      </div>
      <div id="wExercises"></div>
      <div class="item-detail" id="wEstimate" style="margin:10px 0"></div>
      <button class="btn btn-success btn-block" id="wSave">Antrenmanı Kaydet</button>
    `);

    const exContainer = document.getElementById("wExercises");
    const select = document.getElementById("wExSelect");
    const durationInput = document.getElementById("wDuration");
    const estimateEl = document.getElementById("wEstimate");

    function makeExercise(ex, sets = 3, reps = 10, duration) {
      return {
        exerciseId: ex.id,
        name: ex.name,
        type: ex.type,
        met: ex.met,
        duration: duration || 10, // kardiyo için dk
        sets: ex.type === "strength"
          ? Array.from({ length: sets }, () => ({ reps, weight: 0 }))
          : [],
      };
    }

    function estimate() {
      const mins = Number(durationInput.value) || 0;
      if (workout.exercises.length === 0 || mins === 0) {
        estimateEl.textContent = "";
        return 0;
      }
      // Süreyi egzersizlere eşit dağıtıp MET ortalamasıyla hesapla
      const avgMet = workout.exercises.reduce((s, e) => s + e.met, 0) / workout.exercises.length;
      const kcal = Utils.burnedCalories(avgMet, Store.state.profile.weight, mins);
      estimateEl.innerHTML = `Tahmini yakım: <b>🔥 ${Utils.fmt(kcal)} kcal</b> (ortalama MET ${Utils.fmt(avgMet, 1)}, ${Utils.fmt(Store.state.profile.weight)} kg)`;
      return kcal;
    }

    function drawExercises() {
      exContainer.innerHTML = workout.exercises.map((e, ei) => `
        <div class="exercise-block">
          <div class="exercise-block-header">
            <span class="exercise-block-title">${Utils.esc(e.name)}</span>
            <button class="icon-btn" data-rm-ex="${ei}" title="Kaldır">🗑</button>
          </div>
          ${e.type === "strength" ? `
            <div class="set-grid" style="margin-bottom:4px">
              <span class="item-detail">Set</span>
              <span class="item-detail">Tekrar</span>
              <span class="item-detail">Ağırlık (kg)</span>
              <span></span>
            </div>
            ${e.sets.map((s, si) => `
              <div class="set-grid">
                <span class="set-num">${si + 1}</span>
                <input type="number" class="form-input" data-reps="${ei}-${si}" value="${s.reps}" min="0">
                <input type="number" class="form-input" data-weight="${ei}-${si}" value="${s.weight}" min="0" step="0.5">
                <button class="icon-btn" data-rm-set="${ei}-${si}" title="Seti sil">✕</button>
              </div>`).join("")}
            <button class="btn btn-ghost btn-sm" data-add-set="${ei}">+ Set ekle</button>
          ` : `
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Süre (dk)</label>
              <input type="number" class="form-input" data-cardio-dur="${ei}" value="${e.duration}" min="1">
            </div>
          `}
        </div>`).join("");

      exContainer.querySelectorAll("[data-rm-ex]").forEach((b) =>
        b.addEventListener("click", () => {
          workout.exercises.splice(Number(b.dataset.rmEx), 1);
          drawExercises();
        })
      );
      exContainer.querySelectorAll("[data-add-set]").forEach((b) =>
        b.addEventListener("click", () => {
          const ex = workout.exercises[Number(b.dataset.addSet)];
          const last = ex.sets[ex.sets.length - 1];
          ex.sets.push({ reps: last ? last.reps : 10, weight: last ? last.weight : 0 });
          drawExercises();
        })
      );
      exContainer.querySelectorAll("[data-rm-set]").forEach((b) =>
        b.addEventListener("click", () => {
          const [ei, si] = b.dataset.rmSet.split("-").map(Number);
          workout.exercises[ei].sets.splice(si, 1);
          drawExercises();
        })
      );
      exContainer.querySelectorAll("[data-reps]").forEach((inp) =>
        inp.addEventListener("input", () => {
          const [ei, si] = inp.dataset.reps.split("-").map(Number);
          workout.exercises[ei].sets[si].reps = Number(inp.value) || 0;
        })
      );
      exContainer.querySelectorAll("[data-weight]").forEach((inp) =>
        inp.addEventListener("input", () => {
          const [ei, si] = inp.dataset.weight.split("-").map(Number);
          workout.exercises[ei].sets[si].weight = Number(inp.value) || 0;
        })
      );
      exContainer.querySelectorAll("[data-cardio-dur]").forEach((inp) =>
        inp.addEventListener("input", () => {
          workout.exercises[Number(inp.dataset.cardioDur)].duration = Number(inp.value) || 0;
        })
      );
      estimate();
    }

    select.addEventListener("change", () => {
      const ex = EXERCISE_DB.find((x) => x.id === select.value);
      if (ex) {
        workout.exercises.push(makeExercise(ex));
        select.value = "";
        drawExercises();
      }
    });
    durationInput.addEventListener("input", estimate);

    document.getElementById("wSave").addEventListener("click", () => {
      const name = document.getElementById("wName").value.trim() || "Antrenman";
      const duration = Number(durationInput.value) || 0;
      if (workout.exercises.length === 0) { App.toast("En az bir egzersiz ekle"); return; }
      if (duration <= 0) { App.toast("Geçerli bir süre gir"); return; }
      Store.addWorkout(dateKey, {
        name,
        duration,
        exercises: workout.exercises,
        kcal: estimate(),
      });
      App.closeModal();
      App.toast("Antrenman kaydedildi 💪");
      onDone();
    });

    drawExercises();
  }

  return { render };
})();
