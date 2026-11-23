(() => {
  const nav = document.getElementById("navlinks");
  if (!nav) return;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  fetch("modules.json").then(r => { if (!r.ok) throw new Error("modules.json unavailable"); return r.json(); }).then(modules => {
    const groups = [
      { key: "mosque", title: "মসজিদ", label: "মসজিদ বিভাগ · ১৬টি মডিউল" },
      { key: "foundation", title: "ফাউন্ডেশন", label: "ফাউন্ডেশন · ৯টি মডিউল" }
    ];
    const groupMarkup = groups.map(group => {
      const items = modules.filter(m => m.group === group.key);
      return '<details class="nav-dropdown"><summary>' + group.title + ' <span aria-hidden="true">▾</span></summary><div class="submenu"><p class="submenu-title">' + group.label + '</p>' +
        items.map(m => '<a class="submenu-link" href="module.html?id=' + encodeURIComponent(m.id) + '"><span class="submenu-number">' + String(m.id).padStart(2,"0") + '</span><span>' + esc(m.title) + '</span><span class="submenu-arrow">↗</span></a>').join("") +
        '</div></details>';
    }).join("");
    nav.innerHTML = '<a href="index.html">হোম</a>' + groupMarkup + '<a href="#notices">নোটিশ</a><a href="#contact">যোগাযোগ</a>';
    nav.querySelectorAll('a').forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      const button = document.getElementById("menubtn");
      if (button) { button.setAttribute("aria-expanded", "false"); button.textContent = "মেনু ☰"; }
    }));
  }).catch(error => console.error("Navigation menu could not load:", error));
})();