window.CanvasView = (() => {
function getCanvasColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    surface: styles.getPropertyValue("--surface").trim(),
    ink: styles.getPropertyValue("--ink").trim(),
    inkSoft: styles.getPropertyValue("--ink-soft").trim(),
    muted: styles.getPropertyValue("--muted").trim(),
    accent: styles.getPropertyValue("--accent").trim()
  };
}

function drawWelcome(context, colors, elementLimit) {
  context.textAlign = "center";
  context.fillStyle = colors.muted;
  context.font = "500 11px 'DM Mono', monospace";
  context.fillText("CHEMISTRY BINGO", 450, 176);
  context.fillStyle = colors.ink;
  context.font = "600 48px 'Space Grotesk', sans-serif";
  context.fillText("Ready when you are", 450, 270);
  context.fillStyle = colors.inkSoft;
  context.font = "400 16px 'DM Sans', sans-serif";
  context.fillText("Call the first element to get your round started.", 450, 316);
  context.fillStyle = colors.accent;
  context.font = "500 10px 'DM Mono', monospace";
  context.fillText(`ATOMIC NUMBERS 1–${elementLimit}  ·  RANDOM ORDER`, 450, 384);
}

function drawElement(context, element, colors, display) {
  const showSymbol = display.symbol;
  const showName = display.name;
  context.textAlign = "center";

  if (display.number) {
    context.fillStyle = colors.ink;
    context.font = "600 76px 'Space Grotesk', sans-serif";
    context.fillText(String(element.number), 450, 207);
  }

  if (display.mass) {
    context.fillStyle = colors.inkSoft;
    context.font = "500 11px 'DM Mono', monospace";
    context.fillText(element.mass, 450, display.number ? 475 : 117);
  }

  if (showSymbol) {
    context.fillStyle = colors.ink;
    const symbolSize = display.number
      ? element.symbol.length === 1 ? 176 : 152
      : element.symbol.length === 1 ? 224 : 192;
    context.font = `600 ${symbolSize}px 'Space Grotesk', sans-serif`;
    context.fillText(element.symbol, 450, display.number ? showName ? 365 : 405 : showName ? 330 : 365);
  }

  if (showName) {
    context.fillStyle = colors.inkSoft;
    context.font = `500 ${element.name.length > 12 ? 30 : 36}px 'Space Grotesk', sans-serif`;
    context.fillText(element.name, 450, showSymbol ? display.number ? 414 : 389 : display.number ? 340 : 290);
  }

  if (!showSymbol && !showName && !display.number && !display.mass) {
    context.fillStyle = colors.ink;
    context.font = "500 20px 'DM Sans', sans-serif";
    context.fillText("Choose details in Display", 450, 290);
  }
}

function drawCanvas(canvas, context, config) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = rect.width;
  const height = width * 570 / 900;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const colors = getCanvasColors();
  context.clearRect(0, 0, width, height);
  context.fillStyle = colors.surface;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.5, height * 0.46, 5, width * 0.5, height * 0.46, width * 0.62);
  glow.addColorStop(0, config.theme === "dark" ? "rgb(91 137 105 / 10%)" : "rgb(105 157 113 / 7%)");
  glow.addColorStop(1, "transparent");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.save();
  context.scale(width / 900, width / 900);
  if (config.element) {
    drawElement(context, config.element, colors, config.display);
  } else {
    drawWelcome(context, colors, config.elementLimit);
  }
  context.restore();
}

function createCanvasView(canvas) {
  const context = canvas.getContext("2d");
  let currentConfig;

  const render = (config) => {
    currentConfig = config;
    canvas.setAttribute("aria-label", config.element
      ? `${config.element.name}, symbol ${config.element.symbol}, atomic number ${config.element.number}`
      : "No element called yet");
    drawCanvas(canvas, context, config);
  };

  const resizeObserver = "ResizeObserver" in window
    ? new ResizeObserver(() => {
      if (currentConfig) drawCanvas(canvas, context, currentConfig);
    })
    : null;

  if (resizeObserver) {
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", () => {
      if (currentConfig) drawCanvas(canvas, context, currentConfig);
    });
  }

  return { render };
}

return { createCanvasView };
})();
