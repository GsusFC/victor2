const settings = {
  gridRows: GRID_ROWS,
  calculatedGridCols: CALCULATED_GRID_COLS,
  vectorSpacing: VECTOR_SPACING,
  vectorLength: VECTOR_LENGTH,
  vectorStrokeWidth: VECTOR_STROKE_WIDTH,
  vectorShape: "VECTOR_SHAPE",
  strokeLinecap: "STROKE_LINECAP",
  vectorColor: "VECTOR_COLOR",
  animationSpeedFactor: ANIMATION_SPEED,
  easingFactor: EASING_FACTOR,
  currentAnimationType: "ANIMATION_TYPE",
};

function getAngle(type, x, y, t, mx, my) {
  switch (type) {
    case 'smoothWaves':
      return Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) * 180;
    case 'mouseInteraction':
      if (mx == null || my == null) return 0;
      return Math.atan2(my - y, mx - x) * 180 / Math.PI;
    default:
      return 0;
  }
}

function animate(elements, timestamp, prevTime, mx, my) {
  // Calcular el tiempo de animación
  const time = timestamp * 0.001 * settings.animationSpeedFactor;

  elements.forEach((el) => {
    // Extraer coordenadas del ID (fila y columna)
    const [/* unused */, row, col] = el.id.split('-');
    const x = col * settings.vectorSpacing + settings.vectorSpacing / 2;
    const y = row * settings.vectorSpacing + settings.vectorSpacing / 2;

    const angle = getAngle(settings.currentAnimationType, x, y, time, mx, my);

    const transform = el.getAttribute('transform') || '';
    const current = parseFloat((transform.match(/rotate\(([^)]+)\)/) || [])[1]) || 0;
    const diff = ((((angle - current) % 360) + 540) % 360) - 180;
    const eased = current + diff * settings.easingFactor;

    el.setAttribute('transform', `translate(${x} ${y}) rotate(${eased})`);
  });

  requestAnimationFrame((t) => animate(elements, t, timestamp, mx, my));
}

function setup() {
  const svg = document.getElementById('vectorSvg');
  const elements = Array.from(svg.querySelectorAll('line, path'));
  let mouseX = null;
  let mouseY = null;

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width * svg.viewBox.baseVal.width;
    mouseY = (e.clientY - rect.top) / rect.height * svg.viewBox.baseVal.height;
  });

  svg.addEventListener('mouseleave', () => {
    mouseX = null;
    mouseY = null;
  });

  requestAnimationFrame((t) => animate(elements, t, performance.now(), mouseX, mouseY));
}

setup();
