(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
  $('#theme').onclick = () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
  };

  const menu = $('#menu');
  $('#burger').onclick = () => menu.classList.toggle('open');
  $$('#menu a').forEach(a => a.onclick = () => menu.classList.remove('open'));

  const nav = $('#nav'), bar = $('#progress'), top = $('#top');
  const links = $$('#menu a');
  const sections = links.map(a => $(a.getAttribute('href')));
  addEventListener('scroll', () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (y / h * 100) + '%';
    nav.classList.toggle('scrolled', y > 40);
    top.classList.toggle('show', y > 600);
    let cur = -1;
    sections.forEach((s, i) => { if (s && s.offsetTop - 120 <= y) cur = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === cur));
  }, { passive: true });
  top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  const roles = ['Embedded Linux Engineer', 'Yocto & BSP Developer', 'Secure Boot & OTA', 'SBOM / CVE Analyst'];
  const typed = $('#typed');
  if (reduce) typed.textContent = roles[0];
  else {
    let r = 0, i = 0, del = false;
    (function tick() {
      const w = roles[r];
      typed.textContent = w.slice(0, i);
      if (!del && i === w.length) { del = true; return setTimeout(tick, 1400); }
      if (del && i === 0) { del = false; r = (r + 1) % roles.length; }
      i += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 75);
    })();
  }

  const counted = new WeakSet();
  const count = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(c => { if (!counted.has(c)) { counted.add(c); count(c); } });
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

  $$('.filters button').forEach(b => b.onclick = () => {
    $$('.filters button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $$('.cards .card').forEach(c => c.classList.toggle('hide', b.dataset.f !== 'all' && c.dataset.cat !== b.dataset.f));
  });

  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [];
  const mouse = { x: -999, y: -999 };
  const resize = () => {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    const n = Math.min(90, Math.floor(W * H / 16000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 }));
  };
  addEventListener('resize', resize); resize();
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const color = () => getComputedStyle(root).getPropertyValue('--a').trim() || '#38bdf8';
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    const c = color();
    ctx.fillStyle = c; ctx.strokeStyle = c;
    pts.forEach((p, i) => {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.globalAlpha = .6;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) { ctx.globalAlpha = (1 - d / 130) * .25; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 160) { ctx.globalAlpha = (1 - dm / 160) * .5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  })();
})();
