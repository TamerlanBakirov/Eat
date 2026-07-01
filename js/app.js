/* Uygulama kabuğu: görünüm yönlendirme, tarih gezinme, modal ve toast */
window.App = (function () {
  const VIEWS = {
    dashboard: { title: "Özet", render: (c, d) => DashboardView.render(c, d) },
    nutrition: { title: "Beslenme", render: (c, d) => NutritionView.render(c, d) },
    workout: { title: "Antrenman", render: (c, d) => WorkoutView.render(c, d) },
    progress: { title: "İlerleme", render: (c, d) => ProgressView.render(c, d) },
    profile: { title: "Profil", render: (c, d) => ProfileView.render(c, d) },
  };

  let currentView = "dashboard";
  let currentDate = Utils.todayKey();
  let toastTimer = null;

  const container = () => document.getElementById("viewContainer");

  function refresh() {
    document.getElementById("viewTitle").textContent = VIEWS[currentView].title;
    document.getElementById("datePicker").value = currentDate;
    document.querySelectorAll(".nav-item").forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.view === currentView)
    );
    VIEWS[currentView].render(container(), currentDate);
  }

  function setView(view) {
    if (!VIEWS[view]) return;
    currentView = view;
    refresh();
    window.scrollTo({ top: 0 });
  }

  function setDate(dateKey) {
    currentDate = dateKey;
    refresh();
  }

  /* --- Modal --- */
  function openModal(title, bodyHTML) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHTML;
    document.getElementById("modalOverlay").classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("modalOverlay").classList.add("hidden");
    document.getElementById("modalBody").innerHTML = "";
  }

  /* --- Toast --- */
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 2500);
  }

  /* --- Tema --- */
  function applyTheme() {
    const theme = Store.state.settings.theme;
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("themeToggle").textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function init() {
    applyTheme();

    document.querySelectorAll(".nav-item").forEach((btn) =>
      btn.addEventListener("click", () => setView(btn.dataset.view))
    );

    document.getElementById("datePicker").addEventListener("change", (e) => {
      if (e.target.value) setDate(e.target.value);
    });
    document.getElementById("prevDay").addEventListener("click", () =>
      setDate(Utils.shiftKey(currentDate, -1))
    );
    document.getElementById("nextDay").addEventListener("click", () =>
      setDate(Utils.shiftKey(currentDate, 1))
    );
    document.getElementById("todayBtn").addEventListener("click", () =>
      setDate(Utils.todayKey())
    );

    document.getElementById("themeToggle").addEventListener("click", () => {
      Store.setTheme(Store.state.settings.theme === "dark" ? "light" : "dark");
      applyTheme();
      refresh(); // grafikler tema renklerini yeniden okusun
    });

    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "modalOverlay") closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    refresh();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { refresh, setView, setDate, openModal, closeModal, toast };
})();
