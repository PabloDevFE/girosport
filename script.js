const header = document.querySelector("[data-header]");
const heroCarousel = document.querySelector("[data-carousel]");
const menuToggle = document.querySelector(".menu-toggle");
const menuLabel = menuToggle?.querySelector(".sr-only");
const mainNav = document.querySelector("#main-nav");
const slides = Array.from(document.querySelectorAll("[data-slide]"));
const dots = Array.from(document.querySelectorAll("[data-dot]"));
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");
const productGallery = document.querySelector("[data-product-gallery]");
const bikeCarousel = document.querySelector("[data-bike-carousel]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeSlide = 0;
let slideTimer = null;
let touchStartX = null;

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
    const isActive = slideIndex === activeSlide;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", isActive ? "false" : "true");
  });

  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeSlide;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", isActive ? "true" : "false");
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

  if (menuLabel) {
    menuLabel.textContent = isOpen ? "Fechar menu" : "Abrir menu";
  }
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
    const label = activeThumb.dataset.galleryLabel || `Foto ${activeGalleryImage + 1} da bicicleta`;

    if (mainImage.tagName === "IMG" && src) {
      mainImage.src = src;
    }

    if (mainImage.tagName === "IMG" && alt) {
      mainImage.alt = alt;
    } else {
      mainImage.setAttribute("aria-label", `${label} pendente`);
      const placeholderTitle = mainImage.querySelector("[data-gallery-placeholder-title]");

      if (placeholderTitle) {
        placeholderTitle.textContent = label;
      }
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

function initBikeCarousel() {
  if (!bikeCarousel) {
    return;
  }

  const cards = Array.from(bikeCarousel.querySelectorAll(".bike-card"));
  const controls = document.querySelector("[data-bike-controls]");
  const prev = controls?.querySelector("[data-bike-prev]");
  const next = controls?.querySelector("[data-bike-next]");
  const carouselDots = Array.from(controls?.querySelectorAll("[data-bike-dot]") ?? []);
  const count = controls?.querySelector("[data-bike-count]");

  if (!cards.length || !controls || !prev || !next) {
    return;
  }

  let activeBike = 0;
  let scrollFrame = null;

  function updateBikeControls(index) {
    activeBike = Math.max(0, Math.min(index, cards.length - 1));
    prev.disabled = activeBike === 0;
    next.disabled = activeBike === cards.length - 1;

    if (count) {
      count.textContent = `${activeBike + 1} / ${cards.length}`;
    }

    carouselDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeBike);
      dot.setAttribute("aria-current", dotIndex === activeBike ? "true" : "false");
    });
  }

  function goToBike(index) {
    const targetIndex = Math.max(0, Math.min(index, cards.length - 1));
    const scrollPadding = Number.parseFloat(getComputedStyle(bikeCarousel).scrollPaddingLeft) || 0;

    bikeCarousel.scrollTo({
      left: cards[targetIndex].offsetLeft - scrollPadding,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    updateBikeControls(targetIndex);
  }

  function findVisibleBike() {
    const scrollPadding = Number.parseFloat(getComputedStyle(bikeCarousel).scrollPaddingLeft) || 0;
    const visibleLeft = bikeCarousel.scrollLeft + scrollPadding;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - visibleLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  prev.addEventListener("click", () => goToBike(activeBike - 1));
  next.addEventListener("click", () => goToBike(activeBike + 1));

  carouselDots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToBike(index));
  });

  bikeCarousel.addEventListener(
    "scroll",
    () => {
      if (scrollFrame !== null) {
        return;
      }

      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        updateBikeControls(findVisibleBike());
      });
    },
    { passive: true },
  );

  updateBikeControls(0);
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

if (heroCarousel) {
  heroCarousel.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
    },
    { passive: true },
  );

  heroCarousel.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) {
        return;
      }

      const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
      const distance = touchEndX - touchStartX;
      touchStartX = null;

      if (Math.abs(distance) < 48) {
        return;
      }

      showSlide(activeSlide + (distance < 0 ? 1 : -1));
      queueNextSlide();
    },
    { passive: true },
  );
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    queueNextSlide();
  });
});

updateHeader();
showSlide(0);
queueNextSlide();
initProductGallery();
initBikeCarousel();
