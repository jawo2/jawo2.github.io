// ── Equalize card heights ──────────────────────────────────────
function equalizeCardHeights() {
  const cards = document.querySelectorAll('.project-card');
  // Reset so we can measure natural heights (CSS min-height still applies)
  cards.forEach(c => c.style.height = 'auto');
  let max = 0;
  cards.forEach(c => { max = Math.max(max, c.offsetHeight); });
  cards.forEach(c => { c.style.height = max + 'px'; });
}

// ── Carousel auto-scroll ───────────────────────────────────────
function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = track.querySelectorAll('.carousel-slide');
    if (slides.length <= 1) return;

    let current = 0;

    // Pause on hover
    let paused = false;
    carousel.addEventListener('mouseenter', () => { paused = true; });
    carousel.addEventListener('mouseleave', () => { paused = false; });

    setInterval(() => {
      if (paused) return;
      current = (current + 1) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
    }, 3500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  equalizeCardHeights();
  initCarousels();
});

window.addEventListener('resize', equalizeCardHeights);
