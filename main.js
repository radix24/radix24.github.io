(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 별 배경: 적고 흐린 별, 스크롤할 때만 천천히 움직인다 ---------- */
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, stars = [], scrollY = window.scrollY;

  const LAYERS = [
    { density: 0.00007, speed: 0.02, size: [0.4, 0.8], alpha: [0.15, 0.35] },
    { density: 0.00002, speed: 0.05, size: [0.7, 1.1], alpha: [0.3, 0.55] },
  ];
  const rand = (a, b) => a + Math.random() * (b - a);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    LAYERS.forEach(L => {
      const n = Math.round(W * H * L.density);
      for (let i = 0; i < n; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, speed: L.speed, r: rand(...L.size), a: rand(...L.alpha) });
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    for (const st of stars) {
      let y = (st.y - scrollY * (reduceMotion ? 0 : st.speed)) % H; if (y < 0) y += H;
      ctx.globalAlpha = st.a;
      ctx.beginPath(); ctx.arc(st.x, y, st.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let queued = false;
  const requestDraw = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; draw(); }); } };
  resize(); draw();
  window.addEventListener('resize', () => { resize(); draw(); });

  /* ---------- 고도 HUD ---------- */
  const sections = [...document.querySelectorAll('[data-alt]')];
  const altEl = document.getElementById('alt');
  const zoneEl = document.getElementById('zone');
  const barEl = document.getElementById('altbar');
  const navLinks = [...document.querySelectorAll('.nav a')];
  const lg = v => Math.log10(v + 1);
  const maxAlt = lg(+sections[sections.length - 1].dataset.alt);

  function fmtAlt(km) {
    if (km < 10) return km.toFixed(1) + ' km';
    return Math.round(km).toLocaleString('en-US') + ' km';
  }

  function onScroll() {
    scrollY = window.scrollY;
    const probe = scrollY + H * 0.5;
    const tops = sections.map(s => s.offsetTop);
    tops[0] = H * 0.5; // 맨 위에서는 고도 0
    let i = 0;
    while (i < tops.length - 1 && probe >= tops[i + 1]) i++;
    const a0 = +sections[i].dataset.alt;
    const next = sections[i + 1];
    let alt = a0;
    if (next) {
      const p = Math.min(1, Math.max(0, (probe - tops[i]) / (tops[i + 1] - tops[i])));
      alt = Math.pow(10, lg(a0) + (lg(+next.dataset.alt) - lg(a0)) * p) - 1;
    }
    // 마지막 섹션 끝에 닿으면 정확히 마지막 고도로
    const atBottom = window.innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) { i = sections.length - 1; alt = +sections[i].dataset.alt; }

    const ascent = lg(alt) / maxAlt;
    altEl.textContent = fmtAlt(alt);
    zoneEl.textContent = sections[i].dataset.zone;
    barEl.style.width = (ascent * 100).toFixed(1) + '%';

    const id = sections[i].id;
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    requestDraw();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 등장 효과 ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  }
})();
