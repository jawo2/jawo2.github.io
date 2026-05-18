// ── Prevent scroll restoration on reload ──────────────────────
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
document.addEventListener('DOMContentLoaded', () => window.scrollTo(0, 0));
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

// ── Home nav link: always scroll to very top ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  const homeLink = document.querySelector('a[href="#hero"]');
  if (homeLink) homeLink.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ── Size hero to remaining viewport height ─────────────────────
function setHeroHeight() {
  const nav  = document.querySelector('.nav');
  const hero = document.querySelector('.hero-wrapper');
  if (nav && hero) hero.style.height = (window.innerHeight - nav.offsetHeight - 64) + 'px';
}
setHeroHeight();
window.addEventListener('resize', setHeroHeight);

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

    // Clone first slide so the last→first transition plays forward seamlessly
    track.appendChild(slides[0].cloneNode(true));

    let current = 0;
    let transitioning = false;

    function goTo(index, animate) {
      track.style.transition = animate
        ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        : 'none';
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    // After landing on the clone, snap silently back to the real first slide
    track.addEventListener('transitionend', () => {
      if (current === slides.length) {
        current = 0;
        goTo(0, false);
      }
      transitioning = false;
    });

    let paused = false;
    carousel.addEventListener('mouseenter', () => { paused = true; });
    carousel.addEventListener('mouseleave', () => { paused = false; });

    setInterval(() => {
      if (paused || transitioning) return;
      transitioning = true;
      current += 1;
      goTo(current, true);
    }, 2200);
  });
}

// ── Collaborators Modal ────────────────────────────────────────
function initCollabModal() {
  const overlay  = document.getElementById('collab-overlay');
  const closeBtn = document.getElementById('collab-close');
  const list     = document.getElementById('collab-list');
  if (!overlay) return;

  const collabs = {
    dm: [
      { name: 'Mabel Teo',       url: 'https://www.linkedin.com/in/mabeltjm/' },
      { name: 'Saumya Lohia',    url: 'https://www.linkedin.com/in/saumyalohia/' },
      { name: 'Nseke Ngilbus',   url: 'https://www.linkedin.com/in/nseke-ngilbus/' },
    ],
    ct: [
      { name: 'Gujri Singh',           url: 'https://www.linkedin.com/in/gujrisingh457/' },
      { name: 'Riska Ardilla Putri',   url: 'https://www.linkedin.com/in/rska/' },
      { name: 'Octavia Smith',         url: 'https://www.linkedin.com/in/octavia-smith48/' },
    ],
    no: [
      { name: 'Delvin Marimo',        url: 'https://www.linkedin.com/in/delvin-marimo-csengins/' },
      { name: 'James Ning',           url: 'https://www.linkedin.com/in/james-ning/' },
      { name: 'Monica (Yimiao) Zhao', url: 'https://www.linkedin.com/in/monica-yimiao-zhao-ba5152181/' },
    ],
    ha: [
      { name: 'Stephy Reyes',  url: 'https://www.linkedin.com/in/stephyreyes/' },
      { name: 'Reuben Luera', url: 'https://www.linkedin.com/in/reuben-luera/' },
    ],
  };

  const linkedInIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.985V9h3.105v1.561h.044c.433-.82 1.49-1.684 3.066-1.684 3.279 0 3.883 2.158 3.883 4.964v6.611zM5.337 7.433a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zm1.554 13.019H3.783V9h3.108v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;

  function openModal(card) {
    list.innerHTML = (collabs[card] || []).map(c =>
      `<li><a href="${c.url}" target="_blank" rel="noopener">${linkedInIcon}${c.name}</a></li>`
    ).join('');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.collab-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.card));
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ── Scroll hint visibility ─────────────────────────────────────
function initScrollHint() {
  const hint   = document.getElementById('scroll-hint');
  const spacer = document.getElementById('last-spacer');
  if (!hint || !spacer) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      hint.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0 });

  observer.observe(spacer);
}

equalizeCardHeights();
initCarousels();
initCollabModal();
initScrollHint();

window.addEventListener('resize', equalizeCardHeights);
