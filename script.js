const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const slides = Array.from(document.querySelectorAll("[data-slide]"));
const dots = Array.from(document.querySelectorAll("[data-dot]"));
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");
const productGallery = document.querySelector("[data-product-gallery]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeSlide = 0;
let slideTimer = null;

function updateHeader() {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  }
}

function showSlide(index) {
  if (!slides.length) {
    return;
  }

  activeSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeSlide);
  });
}

function queueNextSlide() {
  if (prefersReducedMotion || !slides.length) {
    return;
  }

  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(activeSlide + 1), 6500);
}

function toggleMenu() {
  const isOpen = mainNav.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

function initProductGallery() {
  if (!productGallery) {
    return;
  }

  const mainImage = productGallery.querySelector("[data-gallery-main]");
  const thumbs = Array.from(productGallery.querySelectorAll("[data-gallery-thumb]"));
  const galleryDots = Array.from(productGallery.querySelectorAll("[data-gallery-dot]"));
  const galleryNext = productGallery.querySelector("[data-gallery-next]");

  if (!mainImage || !thumbs.length) {
    return;
  }

  let activeGalleryImage = 0;

  function showGalleryImage(index) {
    activeGalleryImage = (index + thumbs.length) % thumbs.length;
    const activeThumb = thumbs[activeGalleryImage];
    const src = activeThumb.dataset.src;
    const alt = activeThumb.dataset.alt;

    if (src) {
      mainImage.src = src;
    }

    if (alt) {
      mainImage.alt = alt;
    }

    thumbs.forEach((thumb, thumbIndex) => {
      const isActive = thumbIndex === activeGalleryImage;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-current", isActive ? "true" : "false");
    });

    galleryDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeGalleryImage);
    });
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("mouseenter", () => showGalleryImage(index));
    thumb.addEventListener("focus", () => showGalleryImage(index));
    thumb.addEventListener("click", () => showGalleryImage(index));
  });

  galleryDots.forEach((dot, index) => {
    dot.addEventListener("click", () => showGalleryImage(index));
  });

  if (galleryNext) {
    galleryNext.addEventListener("click", () => showGalleryImage(activeGalleryImage + 1));
  }
}

window.addEventListener("scroll", updateHeader, { passive: true });

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", toggleMenu);

  mainNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement && mainNav.classList.contains("is-open")) {
      toggleMenu();
    }
  });
}

if (prevButton) {
  prevButton.addEventListener("click", () => {
    showSlide(activeSlide - 1);
    queueNextSlide();
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    showSlide(activeSlide + 1);
    queueNextSlide();
  });
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    queueNextSlide();
  });
});

updateHeader();
queueNextSlide();
initProductGallery();
