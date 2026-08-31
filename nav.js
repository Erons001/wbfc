/* Sidebar drawer toggle — shared by every page. */
(function () {
  var btn = document.getElementById("menuBtn");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("scrim");
  if (!btn || !sidebar || !scrim) return;

  function open() {
    sidebar.classList.add("open");
    scrim.classList.add("show");
    btn.setAttribute("aria-expanded", "true");
  }
  function close() {
    sidebar.classList.remove("open");
    scrim.classList.remove("show");
    btn.setAttribute("aria-expanded", "false");
  }
  function toggle() {
    sidebar.classList.contains("open") ? close() : open();
  }

  btn.addEventListener("click", toggle);
  scrim.addEventListener("click", close);
  sidebar.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", close);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
