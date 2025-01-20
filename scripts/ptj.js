/*==================== NAV MENU ====================*/
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

if (navToggle) {
  navToggle.addEventListener("click", () => navMenu.classList.add("show-menu"));
}

if (navClose) {
  navClose.addEventListener("click", () =>
    navMenu.classList.remove("show-menu"),
  );
}

// Close menu on nav link click
document.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () =>
    navMenu.classList.remove("show-menu"),
  );
});

/*==================== ACCORDION SKILLS ====================*/
const skillsContent = document.querySelectorAll(".skills__content"),
  skillsHeader = document.querySelectorAll(".skills__header");

skillsHeader.forEach((header) => {
  header.addEventListener("click", () => {
    const itemClass = header.parentNode.className;
    skillsContent.forEach((content) =>
      content.classList.remove("skills__open"),
    );
    if (itemClass === "skills__content skills__close") {
      header.parentNode.classList.add("skills__open");
    }
  });
});

/*==================== SERVICES MODAL ====================*/
const modalViews = document.querySelectorAll(".services__modal"),
  modalBtns = document.querySelectorAll(".services__button"),
  modalCloses = document.querySelectorAll(".services__modal-close");

const openModal = (index) =>
  modalViews[index].classList.add("active-modal");
const closeModal = () =>
  modalViews.forEach((view) => view.classList.remove("active-modal"));

modalBtns.forEach((btn, i) =>
  btn.addEventListener("click", () => openModal(i)),
);
modalCloses.forEach((close) =>
  close.addEventListener("click", closeModal),
);

/*==================== PORTFOLIO SWIPER ====================*/
new Swiper(".portfolio__container", {
  cssMode: true,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});

/*==================== SCROLL FUNCTIONS ====================*/
// Active link based on scroll position
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 50;
    const sectionId = section.getAttribute("id");

    const link = document.querySelector(
      `.nav__menu a[href*=${sectionId}]`,
    );

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      link?.classList.add("active-link");
    } else {
      link?.classList.remove("active-link");
    }
  });
});

// Change header background on scroll
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scroll-header", window.scrollY >= 80);
});

// Show "scroll up" button
const scrollUpBtn = document.getElementById("scroll-up");
window.addEventListener("scroll", () => {
  scrollUpBtn.classList.toggle("show-scroll", window.scrollY >= 560);
});

/*==================== DARK/LIGHT THEME ====================*/
function setItemWithTTL(key, value, ttl) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage
    .setItem(key, JSON.stringify(item));
}

function getItemWithTTL(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  let item;
  try {
    item = JSON.parse(itemStr);
  } catch (e) {
    console.error('Error parsing JSON from localStorage', e);
    localStorage.removeItem(key);
    return null;
  }
  if (new Date().getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "uil-sun";

// Determine the default theme based on time
const hour = new Date().getHours();
const defaultTheme = hour >= 6 && hour < 18 ? "light" : "dark";

// Retrieve previously selected theme
const selectedTheme = getItemWithTTL("selected-theme") || defaultTheme;
const selectedIcon = getItemWithTTL("selected-icon") || (defaultTheme === "dark" ? "uil-moon" : "uil-sun");

// Apply the theme
document.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
themeButton.classList[selectedIcon === "uil-moon" ? "add" : "remove"](iconTheme);

// Wait for the page to load completely
window.addEventListener('load', function () {
  // Remove the 'preload' class from the <body>
  document.body.classList.remove('preload');
});

// Toggle theme on button click
themeButton.addEventListener("click", () => {
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);

  setItemWithTTL(
    "selected-theme",
    document.body.classList.contains(darkTheme) ? "dark" : "light", 24 * 60 * 60 * 1000
  );
  setItemWithTTL(
    "selected-icon",
    themeButton.classList.contains(iconTheme) ? "uil-moon" : "uil-sun", 24 * 60 * 60 * 1000
  );
});

/*==================== CURRENT YEAR ====================*/
document.getElementById("year").textContent = new Date().getFullYear();