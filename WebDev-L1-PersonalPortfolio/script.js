const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".nav-menu");

toggle.addEventListener("click", () => {
  const expanded = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(expanded));
});

menu.querySelectorAll("a").forEach((item) => {
  item.addEventListener("click", () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});