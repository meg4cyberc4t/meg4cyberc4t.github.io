(() => {
  const card = document.querySelector('.portrait-frame');
  const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!card || !canTilt.matches || reduceMotion.matches) return;

  let frame = null;
  let pointerX = 0;
  let pointerY = 0;

  const updateTilt = () => {
    const bounds = card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (pointerX - bounds.left) / bounds.width));
    const y = Math.min(1, Math.max(0, (pointerY - bounds.top) / bounds.height));

    card.style.setProperty('--tilt-x', `${(0.5 - y) * 8}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * 10}deg`);
    card.style.setProperty('--glare-x', `${x * 100}%`);
    card.style.setProperty('--glare-y', `${y * 100}%`);
    frame = null;
  };

  card.addEventListener('pointerenter', () => {
    card.dataset.tilting = 'true';
  });

  card.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (frame === null) frame = window.requestAnimationFrame(updateTilt);
  });

  card.addEventListener('pointerleave', () => {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    card.dataset.tilting = 'false';
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
    card.style.removeProperty('--glare-x');
    card.style.removeProperty('--glare-y');
  });
})();
