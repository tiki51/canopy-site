// Landing page behaviour. Everything here is an enhancement: the markup already shows each
// animated piece in its final state, and `html.motion` (set in <head>) opts in to the replays.

type Step = { t: number; run: () => void };

const motion = () => document.documentElement.classList.contains('motion');

/** Replays [data-at] / [data-out] / [data-press] under `root`, plus extra steps. Times are seconds. */
function player(root: Element, extra: Step[] = [], after?: () => void) {
  const steps: Step[] = [...extra];
  const add = (attr: string, cls: string) =>
    root.querySelectorAll<HTMLElement>(`[${attr}]`).forEach((el) => {
      steps.push({ t: Number(el.getAttribute(attr)), run: () => el.classList.add(cls) });
    });
  add('data-at', 'is-in');
  add('data-out', 'is-out');
  add('data-press', 'is-pressed');
  steps.sort((a, b) => a.t - b.t);

  let next = 0;
  let elapsed = 0;
  let startedAt: number | undefined;
  let timer: number | undefined;

  const tick = () => {
    const now = elapsed + (performance.now() - startedAt!) / 1000;
    while (next < steps.length && steps[next].t <= now) steps[next++].run();
    after?.();
    timer = next < steps.length ? window.setTimeout(tick, (steps[next].t - now) * 1000) : undefined;
  };

  return {
    play() {
      if (startedAt !== undefined || next >= steps.length) return;
      startedAt = performance.now();
      tick();
    },
    pause() {
      if (startedAt === undefined) return;
      elapsed += (performance.now() - startedAt) / 1000;
      startedAt = undefined;
      window.clearTimeout(timer);
    },
  };
}

/** Plays while at least `threshold` of `el` is on screen and the tab is visible. */
function whileVisible(el: Element, p: { play(): void; pause(): void }, threshold = 0.35) {
  let visible = false;
  const sync = () => (visible && !document.hidden ? p.play() : p.pause());
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold },
  ).observe(el);
  document.addEventListener('visibilitychange', sync);
}

/** Counts a `$0.00` readout from one value to another. */
function countTo(el: HTMLElement, from: number, to: number, ms = 700) {
  const start = performance.now();
  const frame = (now: number) => {
    const k = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = `$${(from + (to - from) * eased).toFixed(2)}`;
    if (k < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function heroChannel() {
  const live = document.querySelector<HTMLElement>('[data-live]');
  const stack = live?.querySelector<HTMLElement>('[data-stack]');
  if (!live || !stack) return;

  const spend = live.querySelector<HTMLElement>('[data-spend]')!;
  const tools = live.querySelector<HTMLElement>('[data-tools]')!;
  spend.textContent = '$0.00';
  tools.textContent = '1';

  // Keep the newest visible item on the bottom edge. Only `transform` moves, so nothing reflows.
  const bottomOf = (el: HTMLElement) => {
    let y = el.offsetHeight;
    for (let n: HTMLElement | null = el; n && n !== stack; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    return y;
  };
  const scroll = () => {
    let bottom = 0;
    stack.querySelectorAll<HTMLElement>('[data-at]').forEach((el) => {
      if (el.classList.contains('is-in') && !el.classList.contains('is-out')) bottom = Math.max(bottom, bottomOf(el));
    });
    stack.style.transform = `translateY(${stack.offsetHeight - bottom}px)`;
  };
  scroll();
  requestAnimationFrame(() => live.classList.add('is-playing'));
  window.addEventListener('resize', scroll, { passive: true });

  const p = player(
    live,
    [
      { t: 2.1, run: () => (tools.textContent = '2') },
      { t: 2.6, run: () => (tools.textContent = '3') },
      { t: 6.2, run: () => countTo(spend, 0, 0.21) },
      { t: 13.0, run: () => countTo(spend, 0.21, 0.53) },
    ],
    scroll,
  );
  // On phones the panel starts near the bottom of the first screen; wait until most of it is in view.
  whileVisible(live, p, 0.6);
}

function brakesMeter() {
  const meter = document.querySelector<HTMLElement>('[data-meter]');
  if (!meter) return;
  const spend = meter.querySelector<HTMLElement>('[data-meter-spend]')!;
  meter.dataset.stage = '0';
  spend.textContent = '$0.00';
  const p = player(meter, [
    { t: 0.4, run: () => ((meter.dataset.stage = '1a'), countTo(spend, 0, 3.5, 1000)) },
    { t: 7.0, run: () => ((meter.dataset.stage = '1b'), countTo(spend, 3.5, 5, 700)) },
  ]);
  whileVisible(meter, p, 0.5);
}

function reveals() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

function architecture() {
  const arch = document.querySelector('[data-arch]');
  if (!arch) return;
  new IntersectionObserver(([entry]) => arch.classList.toggle('is-visible', entry.isIntersecting)).observe(arch);
}

// The story swaps the sticky frame as each step crosses the middle of the viewport (not motion: it runs regardless).
function story() {
  const root = document.querySelector<HTMLElement>('[data-story]');
  if (!root) return;
  const steps = [...root.querySelectorAll<HTMLElement>('.story-step')];
  const frames = [...root.querySelectorAll<HTMLElement>('.story-stage [data-frame]')];
  const track = root.querySelector<HTMLElement>('.story-track')!;

  const show = (i: number) => {
    frames.forEach((f) => f.classList.toggle('is-active', f.dataset.frame === String(i)));
    steps.forEach((s, n) => s.classList.toggle('is-current', n === i));
    track.style.setProperty('--progress', String((i + 1) / steps.length));
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) show(Number((entry.target as HTMLElement).dataset.step));
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  steps.forEach((s) => io.observe(s));
}

// Story clips play while on screen; one in the desktop stage also waits for its step, and restarts when it gets there.
function clips() {
  document.querySelectorAll<HTMLVideoElement>('video[data-clip]').forEach((video) => {
    video.muted = true;
    video.addEventListener('playing', () => video.parentElement!.classList.add('is-playing'), { once: true });
    const frame = video.closest('.story-frame');
    let onScreen = false;
    let active = !frame;
    const sync = () => (onScreen && active ? void video.play().catch(() => {}) : video.pause());
    whileVisible(video, {
      play: () => ((onScreen = true), sync()),
      pause: () => ((onScreen = false), sync()),
    });
    if (!frame) return;
    new MutationObserver(() => {
      const now = frame.classList.contains('is-active');
      if (now && !active && video.readyState > 0) video.currentTime = 0;
      active = now;
      sync();
    }).observe(frame, { attributes: true, attributeFilter: ['class'] });
  });
}

// Links with [data-dialog] open that <dialog> as a modal (Esc and the backdrop close it); its video stops on close.
function lightboxes() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-dialog]').forEach((opener) => {
    const dialog = document.getElementById(opener.dataset.dialog!) as HTMLDialogElement | null;
    if (!dialog?.showModal) return;
    const video = dialog.querySelector('video');
    opener.setAttribute('aria-haspopup', 'dialog');
    opener.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // still opens the file in a new tab
      e.preventDefault();
      if (video && !video.poster && video.dataset.poster) video.poster = video.dataset.poster;
      dialog.showModal();
      void video?.play().catch(() => {});
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || (e.target as Element).closest('[data-close]')) dialog.close();
    });
    dialog.addEventListener('close', () => {
      video?.pause();
      opener.focus();
    });
  });
}

function tabs() {
  const list = document.querySelector<HTMLElement>('[role="tablist"]');
  if (!list) return;
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')!)!.toggleAttribute('data-hidden', !on);
    }
  };
  list.addEventListener('click', (e) => {
    const tab = (e.target as Element).closest<HTMLButtonElement>('[role="tab"]');
    if (tab) select(tab);
  });
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const tab = tabs[(to + tabs.length) % tabs.length];
    tab.focus();
    select(tab);
  });
}

function copyButtons() {
  const status = document.getElementById('copy-status');
  const timers = new WeakMap<Element, number>();
  document.addEventListener('click', async (e) => {
    const button = (e.target as Element).closest<HTMLElement>('[data-copy]');
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.copy!);
    } catch {
      return;
    }
    button.classList.add('is-copied');
    if (status) status.textContent = 'Copied';
    window.clearTimeout(timers.get(button));
    timers.set(
      button,
      window.setTimeout(() => {
        button.classList.remove('is-copied');
        if (status) status.textContent = '';
      }, 1500),
    );
  });
}

function header() {
  const bar = document.querySelector('.site-header');
  const sync = () => bar?.toggleAttribute('data-top', window.scrollY <= 24);
  sync();
  window.addEventListener('scroll', sync, { passive: true });

  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const nav = document.querySelector<HTMLElement>('#nav');
  const close = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('open');
  };
  toggle?.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') return close();
    toggle.setAttribute('aria-expanded', 'true');
    nav?.classList.add('open');
    nav?.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
}

// Pointer-following highlight on bento tiles (mouse only).
function tiles() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.tile').forEach((tile) => {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
      tile.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

export function initHome() {
  header();
  copyButtons();
  tabs();
  story();
  tiles();
  lightboxes();
  if (!motion()) return;
  reveals();
  clips();
  heroChannel();
  brakesMeter();
  architecture();
}
