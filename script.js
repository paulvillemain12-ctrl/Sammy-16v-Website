/* ============================================================
   SAMMY 16 SOUPAPES — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---------- NAV : scrolled state + burger ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  /* ---------- SCROLL REVEAL ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- DYNO GRAPH (retiré) ---------- */

  /* ---------- MARQUEE : duplicate for seamless loop ---------- */
  const marquee = document.getElementById('marquee');
  if (marquee) marquee.innerHTML += marquee.innerHTML;

  /* ---------- HERO STATS (retiré) ---------- */

  /* ---------- CARROUSEL ---------- */
  const track = document.getElementById('carouselTrack');
  const wrap = document.getElementById('trackWrap');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const GAP = 16;

  let visibleCards = [];
  let currentIndex = 0;
  let isDragging = false, moved = false, startX = 0, startScroll = 0;

  function cardStep() {
    const card = document.querySelector('.real-card');
    return (card ? card.offsetWidth : 252) + GAP;
  }
  function getVisible() {
    const filter = document.querySelector('.filter-btn.active').dataset.filter;
    return [...document.querySelectorAll('.real-card')].filter(c =>
      filter === 'all' || c.dataset.cat === filter);
  }
  function getPerPage() {
    return Math.max(1, Math.floor((wrap.offsetWidth + GAP) / cardStep()));
  }
  function buildDots() {
    dotsContainer.innerHTML = '';
    const pages = Math.ceil(visibleCards.length / getPerPage());
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i * getPerPage()));
      dotsContainer.appendChild(d);
    }
  }
  function updateDots() {
    const page = Math.floor(currentIndex / getPerPage());
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === page));
  }
  function goTo(idx) {
    const max = Math.max(0, visibleCards.length - getPerPage());
    currentIndex = Math.max(0, Math.min(idx, max));
    const offset = visibleCards[currentIndex]
      ? visibleCards[currentIndex].offsetLeft - track.offsetLeft - 4 : 0;
    track.style.transform = `translateX(-${offset}px)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= max;
    updateDots();
  }
  function applyFilter() {
    const filter = document.querySelector('.filter-btn.active').dataset.filter;
    document.querySelectorAll('.real-card').forEach(c => {
      c.style.display = (filter === 'all' || c.dataset.cat === filter) ? '' : 'none';
    });
    visibleCards = getVisible();
    currentIndex = 0;
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    requestAnimationFrame(() => { track.style.transition = ''; });
    buildDots();
    goTo(0);
  }
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
  });
  prevBtn.addEventListener('click', () => goTo(currentIndex - getPerPage()));
  nextBtn.addEventListener('click', () => goTo(currentIndex + getPerPage()));

  // drag (mouse)
  wrap.addEventListener('mousedown', e => {
    isDragging = true; moved = false; startX = e.clientX;
    const m = track.style.transform.match(/-?([\d.]+)px/);
    startScroll = m ? parseFloat(m[1]) : 0;
    track.style.transition = 'none';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    track.style.transform = `translateX(${-startScroll + dx}px)`;
  });
  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false; track.style.transition = '';
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) (dx < 0 ? goTo(currentIndex + getPerPage()) : goTo(currentIndex - getPerPage()));
    else goTo(currentIndex);
  });
  // prevent ghost-click after drag
  wrap.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  // touch
  wrap.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    const m = track.style.transform.match(/-?([\d.]+)px/);
    startScroll = m ? parseFloat(m[1]) : 0;
    track.style.transition = 'none';
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - startX;
    track.style.transform = `translateX(${-startScroll + dx}px)`;
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    track.style.transition = '';
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) (dx < 0 ? goTo(currentIndex + getPerPage()) : goTo(currentIndex - getPerPage()));
    else goTo(currentIndex);
  });

  applyFilter();
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { buildDots(); goTo(currentIndex); }, 150);
  });

  /* ---------- FORMULAIRE ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      this.style.display = 'none';
      document.getElementById('formSuccess').classList.add('show');
    });
  }
})();
