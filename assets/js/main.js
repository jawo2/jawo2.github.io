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

// ── Discovery Mode Modal ───────────────────────────────────────
function initDiscoveryModal() {
  const overlay  = document.getElementById('dm-overlay');
  const trigger  = document.getElementById('dm-trigger');
  const closeBtn = document.getElementById('dm-close');
  const form     = document.getElementById('dm-form');
  const input    = document.getElementById('dm-input');
  const submitBtn = document.getElementById('dm-submit');
  const results  = document.getElementById('dm-results');

  if (!overlay || !trigger) return;

  const ENDPOINT = 'https://eoe4s1b6uq107kb.m.pipedream.net';
  let priorRecs = [];
  let lastQuery = '';

  function openModal() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 150);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', e => { e.preventDefault(); openModal(); });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    lastQuery = q;
    priorRecs = [];
    fetchRecs(q);
  });

  async function fetchRecs(query) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Searching…';
    results.hidden = false;
    results.innerHTML = '<div class="dm-loading">Digging through the underground…</div>';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          priorRecommendations: priorRecs,
          listeningProfile: [],
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Unknown error');

      const { summary, recommendations } = data.reply;
      priorRecs = [...priorRecs, ...recommendations];
      renderResults(summary, recommendations);

    } catch (err) {
      results.innerHTML = `<p class="dm-summary">Something went wrong — try again in a moment.</p>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Find music →';
    }
  }

  function renderResults(summary, recs) {
    const recHTML = recs.map(rec => {
      const art = rec.albumArt
        ? `<img src="${rec.albumArt}" alt="${rec.title}" class="dm-rec-art">`
        : `<div class="dm-rec-art-placeholder">♪</div>`;

      const spotifyBtn = rec.spotifyUrl
        ? `<a href="${rec.spotifyUrl}" target="_blank" rel="noopener" class="dm-rec-spotify">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
             Open in Spotify
           </a>`
        : '';

      return `
        <div class="dm-rec">
          ${art}
          <div class="dm-rec-info">
            <div class="dm-rec-song">${rec.title}</div>
            <div class="dm-rec-artist">${rec.artist}</div>
            <div class="dm-rec-why">${rec.why}</div>
            ${spotifyBtn}
          </div>
        </div>`;
    }).join('');

    results.innerHTML = `
      <p class="dm-summary">${summary}</p>
      <div class="dm-rec-list">${recHTML}</div>
      <div class="dm-more">
        <button class="dm-more-btn" id="dm-more-btn">Find more →</button>
      </div>`;

    document.getElementById('dm-more-btn').addEventListener('click', () => fetchRecs(lastQuery));
  }
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

equalizeCardHeights();
initCarousels();
initDiscoveryModal();
initCollabModal();

window.addEventListener('resize', equalizeCardHeights);
