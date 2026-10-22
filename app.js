(() => {
const { ELEMENTS } = window.ElementData;
const { createCanvasView } = window.CanvasView;
const { loadState, saveState } = window.GameState;
const { applyTheme, renderUI, ui } = window.BingoUI;

const state = loadState();
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const canvasView = createCanvasView(ui.canvas);

function activeTheme() {
  return state.theme === "system" ? (mediaQuery.matches ? "dark" : "light") : state.theme;
}

function render() {
  const theme = activeTheme();
  applyTheme(theme);
  renderUI(state, canvasView, theme);
}

function saveAndRender() {
  saveState(state);
  render();
}

function callNext() {
  const remaining = ELEMENTS
    .slice(0, state.elementLimit)
    .filter((element) => !state.calledNumbers.includes(element.number));
  if (remaining.length === 0) return;

  const next = remaining[Math.floor(Math.random() * remaining.length)];
  state.calledNumbers.push(next.number);
  state.selectedNumber = next.number;
  saveAndRender();

  if (typeof window.confetti === "function") {
    window.confetti({
      particleCount: 36,
      spread: 46,
      startVelocity: 24,
      origin: { x: 0.42, y: 0.62 },
      colors: ["#3d7058", "#d7a95b", "#92b49a"],
      disableForReducedMotion: true
    });
  }
}

function resetRound() {
  if (!window.confirm("Reset this round? Your called elements will be cleared.")) return;
  state.calledNumbers = [];
  state.selectedNumber = null;
  saveAndRender();
}

function applyRoundSize(limit, preset) {
  if (limit !== state.elementLimit && state.calledNumbers.length > 0
    && !window.confirm("Changing the game length will clear this round. Continue?")) {
    render();
    return;
  }

  if (limit !== state.elementLimit) {
    state.calledNumbers = [];
    state.selectedNumber = null;
  }
  state.elementLimit = limit;
  state.roundPreset = preset;
  saveAndRender();
}

ui.nextButton.addEventListener("click", callNext);
ui.resetButton.addEventListener("click", resetRound);

ui.themeToggle.addEventListener("click", () => {
  state.theme = activeTheme() === "dark" ? "light" : "dark";
  saveAndRender();
});

ui.displayMenuButton.addEventListener("click", () => {
  const isExpanded = ui.displayMenuButton.getAttribute("aria-expanded") === "true";
  ui.displayMenuButton.setAttribute("aria-expanded", String(!isExpanded));
  ui.displayMenu.hidden = isExpanded;
});

ui.displayMenu.addEventListener("change", (event) => {
  const input = event.target.closest("[data-display]");
  if (!input) return;

  const enabledCount = Object.values(state.display).filter(Boolean).length;
  if (!input.checked && enabledCount === 1) {
    input.checked = true;
    return;
  }

  state.display[input.dataset.display] = input.checked;
  saveAndRender();
});

document.addEventListener("click", (event) => {
  if (!ui.displayMenu.hidden
    && !ui.displayMenu.contains(event.target)
    && !ui.displayMenuButton.contains(event.target)) {
    ui.displayMenu.hidden = true;
    ui.displayMenuButton.setAttribute("aria-expanded", "false");
  }
});

ui.calledList.addEventListener("click", (event) => {
  const item = event.target.closest(".called-item");
  if (!item) return;
  state.selectedNumber = Number(item.dataset.number);
  saveAndRender();
});

ui.compactMode.addEventListener("change", () => {
  state.compactMode = ui.compactMode.value === "number" ? "number" : "symbol";
  saveAndRender();
});

ui.listSort.addEventListener("change", () => {
  state.sortMode = ui.listSort.value;
  saveAndRender();
});

ui.calledTextSize.addEventListener("input", () => {
  state.calledTextSize = Number(ui.calledTextSize.value);
  ui.calledList.style.setProperty("--entry-size", `${state.calledTextSize}px`);
  ui.calledTextSizeValue.value = `${state.calledTextSize} px`;
  saveState(state);
});

ui.roundSize.addEventListener("change", () => {
  if (ui.roundSize.value === "custom") {
    ui.customRoundLimit.value = String(state.elementLimit);
    ui.customRoundForm.hidden = false;
    ui.customRoundLimit.focus();
    return;
  }
  applyRoundSize(Number(ui.roundSize.value), ui.roundSize.value);
});

ui.customRoundForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ui.customRoundLimit.reportValidity()) return;
  applyRoundSize(Number(ui.customRoundLimit.value), "custom");
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement
    && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName));

  if (event.code === "Space" && !isTyping && !event.repeat && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    callNext();
  }

  if (event.key === "Escape" && !ui.displayMenu.hidden) {
    ui.displayMenu.hidden = true;
    ui.displayMenuButton.setAttribute("aria-expanded", "false");
    ui.displayMenuButton.focus();
  }
});

mediaQuery.addEventListener?.("change", () => {
  if (state.theme === "system") render();
});

render();
})();
