/* =============================================
   STATE
   ============================================= */
const TOTAL = 6;
let currentQ   = 0;
const answers  = {};
let envelopeOpened = false;
let noAttempts = 0;        // tracks how many times she pressed No

/* =============================================
   PROGRESS
   ============================================= */
function setProgress(q) {
  const pct = q === 0 ? 0 : Math.round((q / TOTAL) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = q + ' / ' + TOTAL;
  document.getElementById('progress-container').classList.toggle('visible', q > 0);
}

/* =============================================
   SCREEN TRANSITIONS
   ============================================= */
function screenId(q) { return q === 0 ? 'screen-intro' : 'screen-q' + q; }

function showScreen(toQ, dir) {
  const fromEl = document.getElementById(screenId(currentQ));
  const toEl   = document.getElementById(screenId(toQ));
  if (!fromEl || !toEl) return;

  fromEl.classList.add(dir === 'forward' ? 'slide-out' : 'slide-out-back');

  setTimeout(() => {
    fromEl.classList.remove('active', 'slide-out', 'slide-out-back');
    toEl.style.animation = 'none';
    toEl.classList.add('active');
    void toEl.offsetWidth;
    toEl.style.animation = '';
    currentQ = toQ;
    setProgress(toQ);
  }, 280);
}

/* =============================================
   START
   ============================================= */
document.getElementById('start-btn').addEventListener('click', () => showScreen(1, 'forward'));

/* =============================================
   OPTION SELECTION  (Q1–Q5 normal questions)
   ============================================= */
document.querySelectorAll('.option-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const q = this.dataset.q;
    document.querySelectorAll(`.option-btn[data-q="${q}"]`).forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    answers[q] = this.dataset.val;
    const next = document.getElementById('next-q' + q);
    if (next) next.disabled = false;
  });
});

/* =============================================
   NAV  (Q1–Q5)
   ============================================= */
function goNext(q) {
  if (!answers[q]) return;
  // Q5 goes to Q6 (the yes/no screen), Q6 is handled by yn buttons
  if (q < TOTAL) { showScreen(q + 1, 'forward'); }
}

function goBack(q) {
  showScreen(q <= 1 ? 0 : q - 1, 'back');
}

/* =============================================
   Q6 — YES handler
   ============================================= */
function handleYes() {
  // Fire confetti first, then show the popup
  launchConfetti();
  setTimeout(() => openPopup('popup-yes'), 200);
}

/* =============================================
   Q6 — NO handler
   ============================================= */
const noHints = [
  'okay but are you sure sure? 🥺',
  'baby please don\'t do this to me 😭',
  'fine... the No button is gone now 🫠',
];

function handleNo() {
  noAttempts++;

  const noBtn  = document.getElementById('yn-no');
  const hint   = document.getElementById('yn-hint');

  // Update hint text
  if (hint && noHints[noAttempts - 1]) {
    hint.style.opacity = '0';
    setTimeout(() => {
      hint.textContent   = noHints[noAttempts - 1];
      hint.style.opacity = '1';
    }, 200);
  }

  if (noAttempts === 1) {
    openNoPopup(1, () => {
      noBtn.classList.add('shrink-1');
    });
  } else if (noAttempts === 2) {
    openNoPopup(2, () => {
      noBtn.classList.add('shrink-2');
    });
  } else {
    openNoPopup(3, () => {
      noBtn.classList.add('gone');
      // Expand Yes button for browsers without :has() support
      const yesBtn = document.getElementById('yn-yes');
      if (yesBtn) {
        yesBtn.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        yesBtn.style.gridColumn = '1 / -1';
      }
    });
  }
}

/* =============================================
   OPEN NO POPUP — auto-dismiss after 3 s
   ============================================= */
function openNoPopup(attempt, onClose) {
  const id  = 'popup-no-' + attempt;
  const el  = document.getElementById(id);
  const cdEl = document.getElementById('countdown-' + attempt);
  if (!el) return;

  // Show overlay
  el.classList.add('show');
  document.body.style.overflow = 'hidden';

  // Countdown display: 3 → 2 → 1
  let remaining = 3;
  if (cdEl) cdEl.textContent = 'closing in ' + remaining + '…';

  const tick = setInterval(() => {
    remaining--;
    if (cdEl) cdEl.textContent = remaining > 0 ? 'closing in ' + remaining + '…' : '';
    if (remaining <= 0) clearInterval(tick);
  }, 1000);

  // Dismiss after 3 s
  setTimeout(() => {
    clearInterval(tick);
    // fade out overlay
    el.style.transition = 'opacity 0.4s ease';
    el.style.opacity    = '0';
    setTimeout(() => {
      el.classList.remove('show');
      el.style.opacity   = '';
      el.style.transition = '';
      document.body.style.overflow = '';
      if (typeof onClose === 'function') onClose();
    }, 400);
  }, 3000);
}

/* =============================================
   CLOSE YES POPUP → go to transition
   ============================================= */
function closeYesPopup() {
  closePopup('popup-yes');
  // small pause then slide to transition screen
  setTimeout(showTransition, 350);
}

/* =============================================
   POPUP HELPERS
   ============================================= */
function openPopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.25s ease';
  setTimeout(() => {
    el.classList.remove('show');
    el.style.opacity = '';
    el.style.transition = '';
    document.body.style.overflow = '';
  }, 250);
}

/* =============================================
   CONFETTI
   ============================================= */
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = [
    '#C084FC', '#A855F7', '#7C3AED', '#DDD6FE',
    '#F0ABFC', '#E879F9', '#D8B4FE', '#FAF5FF',
    '#FDE68A', '#FCA5A5', '#6EE7B7'
  ];
  const shapes = ['square', 'circle', 'ribbon'];

  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const el    = document.createElement('div');
      el.className = 'confetti-piece';

      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size  = 6 + Math.random() * 8;
      const dur   = 2500 + Math.random() * 3000;    // ms
      const delay = Math.random() * 1200;
      const left  = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 180;    // px horizontal
      const spin  = Math.round(Math.random() * 2) * 360 + 180;

      el.style.left        = left + 'vw';
      el.style.width       = (shape === 'ribbon' ? size * 0.4 : size) + 'px';
      el.style.height      = (shape === 'ribbon' ? size * 2.8 : size) + 'px';
      el.style.background  = color;
      el.style.borderRadius = shape === 'circle' ? '50%' : '2px';

      container.appendChild(el);

      // Web Animations API — precise control over translateX per piece
      el.animate([
        { transform: `translateY(0px) translateX(0px) rotate(0deg)`,    opacity: 0.9 },
        { transform: `translateY(55vh) translateX(${drift * 0.5}px) rotate(${spin * 0.5}deg)`, opacity: 0.7, offset: 0.5 },
        { transform: `translateY(110vh) translateX(${drift}px) rotate(${spin}deg)`, opacity: 0 }
      ], {
        duration: dur,
        delay:    delay,
        easing:   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill:     'forwards'
      });

      setTimeout(() => el.remove(), dur + delay + 200);
    }, i * 15);
  }
}

/* =============================================
   TRANSITION SCREEN
   ============================================= */
function showTransition() {
  const survey = document.getElementById('survey-section');
  const trans  = document.getElementById('transition-section');
  survey.style.transition = 'opacity 0.4s ease';
  survey.style.opacity    = '0';
  setTimeout(() => {
    survey.classList.remove('active');
    survey.style.display = 'none';
    trans.classList.add('active');
  }, 380);
}

document.getElementById('surprise-btn').addEventListener('click', () => {
  const trans    = document.getElementById('transition-section');
  const surprise = document.getElementById('surprise-section');
  trans.style.transition = 'opacity 0.4s ease';
  trans.style.opacity    = '0';
  setTimeout(() => {
    trans.classList.remove('active');
    trans.style.display  = 'none';
    surprise.classList.add('active');
    setTimeout(() => {
      const th = document.getElementById('tap-hint');
      if (th) th.classList.add('ready');
    }, 2200);
  }, 380);
});

/* =============================================
   ENVELOPE OPEN
   ============================================= */
function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  const flap     = document.getElementById('envelope-flap');
  const seal     = document.getElementById('envelope-seal');
  const tapHint  = document.getElementById('tap-hint');
  const hintText = document.getElementById('envelope-hint');
  const lWrapper = document.getElementById('letter-wrapper');
  const envelope = document.getElementById('envelope');
  const envCont  = document.getElementById('envelope-container');
  const wrapper  = document.getElementById('surprise-wrapper');

  envCont.style.pointerEvents = 'none';
  if (tapHint) { tapHint.style.opacity = '0'; tapHint.style.transition = 'opacity 0.3s'; }

  flap.classList.add('open');
  seal.classList.add('hidden');

  setTimeout(() => {
    if (hintText) {
      hintText.style.transition = 'opacity 0.4s';
      hintText.style.opacity    = '0';
      setTimeout(() => {
        hintText.textContent   = 'A letter, just for you 💜';
        hintText.style.opacity = '1';
      }, 400);
    }
  }, 250);

  setTimeout(() => {
    lWrapper.classList.add('slide-out');
    setTimeout(() => buildLetterAndBouquet(wrapper, envelope), 1000);
  }, 850);
}

/* =============================================
   BUILD LETTER + BOUQUET
   ============================================= */
function buildLetterAndBouquet(wrapper, envelopeEl) {
  envelopeEl.style.transition = 'opacity 0.5s, transform 0.5s';
  envelopeEl.style.opacity    = '0';
  envelopeEl.style.transform  = 'scale(0.9)';

  setTimeout(() => {
    wrapper.innerHTML = '';

    const h = document.createElement('p');
    h.className = 'envelope-hint';
    h.style.cssText = 'opacity:1; animation:none;';
    h.textContent = 'A letter, just for you 💜';
    wrapper.appendChild(h);

    // ── Letter ────────────────────────────────
    const cardOuter = document.createElement('div');
    cardOuter.className = 'letter-card-outer';
    cardOuter.innerHTML = `
      <div class="letter">
        <div class="letter-rule"></div>
        <p class="letter-salutation">Baby,</p>
        <div class="letter-body">
          <p>I'm really sorry if I ever made you feel like I'm just using you as a distraction or that you're only here to help me forget something. I hope you stop thinking that way because that's never how I see you.</p>
          <p>I'm not here because I'm bored, lonely, or because I need someone to fill an empty space. I'm here because I genuinely want you in my life. I want to know you more, spend time with you, and make more memories with you.</p>
          <p>I know words aren't always enough to prove that, but I hope you let me show you through my actions. I don't want you to ever feel like you're just an option or a temporary person in my life.</p>
          <p>Your feelings matter to me, Baby, and I want you to feel assured that my intentions with you are genuine.</p>
          <p>I'm sorry for making you doubt that. I hope you know that I want you for who you are, not because I'm trying to forget someone or something. You're someone I genuinely want to be with, Baby. Please don't think otherwise.</p>
          <p>I want to make you feel loved, appreciated, and secure. 💜</p>
        </div>
        <div class="letter-closing">
          <p>With love,</p>
          <p class="letter-signature">Your Baby Wobby 💜</p>
        </div>
        <div class="letter-gif-wrap">
          <img src="kiss.gif" alt="" class="letter-gif"/>
        </div>
      </div>`;
    wrapper.appendChild(cardOuter);

    // ── Flower gif ────────────────────────────
    const flowerWrap = document.createElement('div');
    flowerWrap.className = 'flower-gif-wrap';
    flowerWrap.innerHTML = `
      <img src="image3.gif" alt="flowers for you" class="flower-gif"/>
      <p class="flower-gif-caption">for you 💜</p>
    `;
    wrapper.appendChild(flowerWrap);

    setTimeout(startPetals, 800);
  }, 500);
}

/* =============================================
   BOUQUET SVG
   ============================================= */
function buildBouquetSVG() {
  function flower(cx, cy, petalR, petalColor, centerColor, centerR, count) {
    const step = (Math.PI * 2) / count;
    let petals = '';
    for (let i = 0; i < count; i++) {
      const angle = step * i;
      const tx = cx + Math.sin(angle) * petalR;
      const ty = cy - Math.cos(angle) * petalR;
      const lx = cx + Math.sin(angle - 0.5) * (petalR * 0.55);
      const ly = cy - Math.cos(angle - 0.5) * (petalR * 0.55);
      const rx = cx + Math.sin(angle + 0.5) * (petalR * 0.55);
      const ry = cy - Math.cos(angle + 0.5) * (petalR * 0.55);
      petals += `<path d="M${cx},${cy} Q${lx},${ly} ${tx},${ty} Q${rx},${ry} ${cx},${cy} Z" fill="${petalColor}" opacity="0.92"/>`;
    }
    return petals + `<circle cx="${cx}" cy="${cy}" r="${centerR}" fill="${centerColor}"/>`;
  }

  return `
  <svg viewBox="0 0 260 290" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Purple flower bouquet">
    <g class="stem-group">
      <path d="M130 252 C130 220 130 190 130 158" stroke="#9B7EC8" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M125 252 C120 218 108 192  96 165" stroke="#9B7EC8" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M135 252 C140 218 152 192 164 165" stroke="#9B7EC8" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M122 252 C114 212  98 188  84 178" stroke="#9B7EC8" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M138 252 C146 212 162 188 176 178" stroke="#9B7EC8" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M120 252 C110 220  90 205  76 198" stroke="#9B7EC8" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M140 252 C150 220 170 205 184 198" stroke="#9B7EC8" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M113 218 Q104 210 108 200 Q114 212 118 220 Z" fill="#B09FD0" opacity="0.5"/>
      <path d="M147 218 Q156 210 152 200 Q146 212 142 220 Z" fill="#B09FD0" opacity="0.5"/>
      <path d="M 98 190 Q  88 180  92 170 Q  99 182 103 192 Z" fill="#B09FD0" opacity="0.4"/>
      <path d="M162 190 Q172 180 168 170 Q161 182 157 192 Z" fill="#B09FD0" opacity="0.4"/>
    </g>
    <path d="M104 252 Q130 244 156 252 L152 272 Q130 265 108 272 Z" fill="#C8A8EE" opacity="0.75"/>
    <path d="M112 263 Q130 258 148 263" stroke="#A278CC" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M118 252 Q102 238 110 222 Q120 236 124 250 Z" fill="#B790E0" opacity="0.8"/>
    <path d="M142 252 Q158 238 150 222 Q140 236 136 250 Z" fill="#B790E0" opacity="0.8"/>
    <circle cx="130" cy="250" r="5" fill="#9B72D0"/>
    <g class="f1">${flower(130, 150, 20, '#D8BCFF', '#9B72D0', 7, 5)}</g>
    <g class="f2">${flower( 96, 157, 16, '#C8A8EE', '#7651A8', 6, 6)}</g>
    <g class="f3">${flower(164, 157, 16, '#DDD0FF', '#8B5CF6', 6, 6)}</g>
    <g class="f4">${flower( 84, 172, 13, '#EDE5FF', '#B794F4', 5, 5)}</g>
    <g class="f5">${flower(176, 172, 13, '#EDE5FF', '#B794F4', 5, 5)}</g>
    <g class="f6">${flower( 76, 192, 10, '#D8C4F8', '#9B72D0', 4, 4)}</g>
    <g class="f7">${flower(184, 192, 10, '#D8C4F8', '#9B72D0', 4, 4)}</g>
  </svg>`;
}

/* =============================================
   FALLING PETALS
   ============================================= */
function startPetals() {
  const container = document.getElementById('petals-container');
  for (let i = 0; i < 8; i++) setTimeout(() => spawnPetal(container), i * 900);
  setInterval(() => spawnPetal(container), 1800);
}

function spawnPetal(container) {
  const el = document.createElement('div');
  el.className = 'petal';
  el.style.left   = Math.random() * 100 + 'vw';
  el.style.width  = (5 + Math.random() * 5) + 'px';
  el.style.height = (5 + Math.random() * 5) + 'px';
  el.style.borderRadius = Math.random() > 0.5 ? '50% 0 50% 0' : '0 50% 0 50%';
  el.style.background   = `hsl(${270 + Math.random() * 30}, 60%, ${75 + Math.random() * 15}%)`;
  const dur = 7 + Math.random() * 7;
  el.style.animationDuration = dur + 's';
  container.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 200);
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => setProgress(0));
