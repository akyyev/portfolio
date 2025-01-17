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
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "uil-sun";

// Determine the default theme based on time
const hour = new Date().getHours();
const defaultTheme = hour >= 6 && hour < 18 ? "light" : "dark";

// Retrieve previously selected theme
const selectedTheme = localStorage.getItem("selected-theme") || defaultTheme;
const selectedIcon = localStorage.getItem("selected-icon") || (defaultTheme === "dark" ? "uil-moon" : "uil-sun");

// Apply the theme
document.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
themeButton.classList[selectedIcon === "uil-moon" ? "add" : "remove"](iconTheme);

// Toggle theme on button click
themeButton.addEventListener("click", () => {
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);

  localStorage.setItem(
    "selected-theme",
    document.body.classList.contains(darkTheme) ? "dark" : "light",
  );
  localStorage.setItem(
    "selected-icon",
    themeButton.classList.contains(iconTheme) ? "uil-moon" : "uil-sun",
  );
});

/*==================== CURRENT YEAR ====================*/
document.getElementById("year").textContent = new Date().getFullYear();

/*==================== EMAIL FUNCTIONALITY ====================*/
const sendEmailBtn = document.getElementById("sendEmail");
const message = document.getElementById("message");
const userName = document.getElementById("userName");
const email = document.getElementById("email");

sendEmailBtn.addEventListener("click", async () => {
    if(!userName.value || !email.value || !message.value) {
      alert("Please fill in all fields!");
      return;
    }
    const response = await fetch('https://formspree.io/f/xyzzawnd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        subject: "Portfolio Contact Form, Email: " + email.value,
        name: userName.value,
        email: email.value,
        message: message.value
      }),
    });

    if(response.ok) {
      alert("Message delivered successfully!");
      message.value = "";
      email.value = "";
      userName.value = "";
    } else {
      const result = await response.json();
      alert("Failed to send message, Error: " + result.errors[0].message);
    }
    
});
