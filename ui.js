window.BingoUI = (() => {
const { ELEMENTS } = window.ElementData;

const ui = {
  canvas: document.querySelector("#element-canvas"),
  calledList: document.querySelector("#called-list"),
  nextButton: document.querySelector("#next-button"),
  displayMenu: document.querySelector("#display-menu"),
  displayMenuButton: document.querySelector("#display-menu-button"),
  compactMode: document.querySelector("#compact-mode"),
  listSort: document.querySelector("#list-sort"),
  listHint: document.querySelector("#list-hint"),
  roundSize: document.querySelector("#round-size"),
  customRoundForm: document.querySelector("#custom-round-form"),
  customRoundLimit: document.querySelector("#custom-round-limit"),
  calledTextSize: document.querySelector("#called-text-size"),
  calledTextSizeValue: document.querySelector("#called-text-size-value"),
  resetButton: document.querySelector("#reset-button"),
  themeToggle: document.querySelector("#theme-toggle"),
  themeIcon: document.querySelector(".theme-icon"),
  progressTrack: document.querySelector("#progress-track"),
  progressFill: document.querySelector("#progress-fill"),
  emptyState: document.querySelector("#empty-state")
};

function renderCalledElements(state) {
  const { calledList, emptyState } = ui;
  emptyState.hidden = state.calledNumbers.length > 0;
  calledList.querySelectorAll(".called-item").forEach((item) => item.remove());

  const callOrder = new Map(state.calledNumbers.map((number, index) => [number, index + 1]));
  const numbers = [...state.calledNumbers];
  if (state.sortMode === "called") {
    numbers.reverse();
  } else {
    numbers.sort((left, right) => {
      const leftElement = ELEMENTS[left - 1];
      const rightElement = ELEMENTS[right - 1];
      if (state.sortMode === "number") return leftElement.number - rightElement.number;
      const leftValue = state.sortMode === "name" ? leftElement.name : leftElement.symbol;
      const rightValue = state.sortMode === "name" ? rightElement.name : rightElement.symbol;
      return leftValue.localeCompare(rightValue);
    });
  }

  ui.listHint.textContent = state.sortMode === "called"
    ? "Most recent first"
    : `Sorted by ${state.sortMode === "number" ? "atomic number" : state.sortMode} · A–Z`;

  for (const number of numbers) {
    const element = ELEMENTS[number - 1];
    const item = document.createElement("button");
    item.type = "button";
    item.className = `called-item${state.compactMode === "number" ? " is-number" : ""}`;
    item.dataset.number = String(number);
    item.setAttribute("aria-current", String(number === state.selectedNumber));
    item.setAttribute("aria-label", `Show ${element.name}, atomic number ${element.number}, symbol ${element.symbol}`);

    const token = document.createElement("span");
    token.className = "called-token";
    token.textContent = state.compactMode === "number" ? String(element.number) : element.symbol;

    const name = document.createElement("span");
    name.className = "called-name";
    name.textContent = element.name;

    const order = document.createElement("span");
    order.className = "called-order";
    order.textContent = String(callOrder.get(number)).padStart(2, "0");

    item.append(token, name, order);
    calledList.append(item);
  }
}

function syncRoundSetup(state) {
  ui.roundSize.value = state.roundPreset;
  ui.customRoundLimit.value = String(state.elementLimit);
  ui.customRoundForm.hidden = state.roundPreset !== "custom";
}

function syncCalledTextSize(state) {
  ui.calledList.style.setProperty("--entry-size", `${state.calledTextSize}px`);
  ui.calledTextSize.value = String(state.calledTextSize);
  ui.calledTextSizeValue.value = `${state.calledTextSize} px`;
}

function renderUI(state, canvasView, theme) {
  const calledCount = state.calledNumbers.length;
  const roundComplete = calledCount === state.elementLimit;
  const element = state.selectedNumber === null ? null : ELEMENTS[state.selectedNumber - 1];

  document.querySelector("#called-count").textContent = String(calledCount);
  document.querySelector("#round-limit").textContent = String(state.elementLimit);
  ui.progressTrack.setAttribute("aria-valuemax", String(state.elementLimit));
  ui.progressTrack.setAttribute("aria-valuenow", String(calledCount));
  ui.progressFill.style.width = `${(calledCount / state.elementLimit) * 100}%`;
  document.querySelector("#pool-summary").textContent = `Atomic numbers 1–${state.elementLimit}`;

  ui.nextButton.disabled = roundComplete;
  ui.nextButton.querySelector("span:first-child").textContent = roundComplete ? "Round complete" : "Call next element";

  document.querySelectorAll("[data-display]").forEach((input) => {
    input.checked = state.display[input.dataset.display];
  });
  ui.compactMode.value = state.compactMode;
  ui.listSort.value = state.sortMode;

  renderCalledElements(state);
  syncCalledTextSize(state);
  syncRoundSetup(state);

  canvasView.render({
    element,
    display: state.display,
    elementLimit: state.elementLimit,
    theme
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  ui.themeIcon.textContent = theme === "dark" ? "☀" : "☾";
  ui.themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  ui.themeToggle.title = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#111815" : "#f5f7f4";
}

return { ui, renderUI, applyTheme };
})();
