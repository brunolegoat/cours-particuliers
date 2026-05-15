/* ── FEATURE 1 : Canvas floating lines ── */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

const lines = Array.from({ length: 10 }, () => ({
  x:       Math.random() * window.innerWidth,
  y:       Math.random() * window.innerHeight,
  angle:   Math.random() * Math.PI * 2,
  length:  200 + Math.random() * 200,
  speed:   0.1 + Math.random() * 0.2,
  opacity: 0.02 + Math.random() * 0.03,
  width:   0.5 + Math.random() * 0.5,
}));

function drawLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;

  lines.forEach(l => {
    l.x += Math.cos(l.angle) * l.speed;
    l.y += Math.sin(l.angle) * l.speed;

    if (l.x < -l.length)    l.x = W + l.length;
    if (l.x > W + l.length) l.x = -l.length;
    if (l.y < -l.length)    l.y = H + l.length;
    if (l.y > H + l.length) l.y = -l.length;

    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x + Math.cos(l.angle) * l.length,
               l.y + Math.sin(l.angle) * l.length);
    ctx.strokeStyle = `rgba(30,58,138,${l.opacity})`;
    ctx.lineWidth   = l.width;
    ctx.stroke();
  });

  requestAnimationFrame(drawLines);
}
drawLines();

/* ── FEATURE 2 : Parallax grid ── */
let rafPending = false;
window.addEventListener('scroll', () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    document.body.style.backgroundPositionY = `-${window.scrollY * 0.4}px`;
    rafPending = false;
  });
});

/* ── FEATURE 3 : Scroll reveals avec stagger ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('revealed'), delay);
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ── FEATURE 4 : SVG hero path draw ── */
const heroPaths = document.querySelectorAll('.hero-sketch path');
heroPaths.forEach(path => {
  const len = path.getTotalLength();
  path.style.strokeDasharray  = len;
  path.style.strokeDashoffset = len;
});

const heroObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      heroPaths.forEach((path, i) => {
        setTimeout(() => path.classList.add('drawn'), i * 400);
      });
      heroObserver.disconnect();
    });
  },
  { threshold: 0.2 }
);
const heroSection = document.querySelector('.hero');
if (heroSection) heroObserver.observe(heroSection);

/* ── FEATURE 5 : Cursor trail (desktop only) ── */
if (window.matchMedia('(pointer: fine)').matches) {
  const dot = document.createElement('div');
  dot.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:9999',
    'width:5px',
    'height:5px',
    'border-radius:50%',
    'background:rgba(37,99,235,0.18)',
    'transform:translate(-50%,-50%)',
    'transition:left 0.08s linear,top 0.08s linear',
  ].join(';');
  document.body.appendChild(dot);

  window.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });
}

/* ── FEATURE 6 : Booking modal ── */
const modal       = document.getElementById('booking-modal');
const bookingForm = document.getElementById('booking-form');
const formSuccess = document.getElementById('form-success');
const formWrap    = document.getElementById('modal-form-wrap');

function openModal() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-booking]').forEach(btn =>
  btn.addEventListener('click', e => { e.preventDefault(); openModal(); })
);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.querySelector('.modal-close').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* Form submission via fetch → Formspree */
bookingForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = bookingForm.querySelector('.form-submit');
  btn.textContent = 'Envoi en cours…';
  btn.disabled = true;

  try {
    const res = await fetch(bookingForm.action, {
      method: 'POST',
      body: new FormData(bookingForm),
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      formWrap.style.display = 'none';
      document.querySelector('.modal-box').classList.add('modal-box--wide');
      formSuccess.classList.add('visible');
    } else {
      btn.textContent = 'Erreur — réessayer';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Erreur — réessayer';
    btn.disabled = false;
  }
});
