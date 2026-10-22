window.GameState = (() => {
const { ELEMENTS } = window.ElementData;

const STORAGE_KEY = "element-bingo-state-v1";
const MIN_CALLED_TEXT_SIZE = 12;
const MAX_CALLED_TEXT_SIZE = 20;
const DEFAULT_CALLED_TEXT_SIZE = 14;
const DEFAULT_DISPLAY = { number: true, symbol: true, name: true, mass: false };

function getInitialState() {
  return {
    elementLimit: ELEMENTS.length,
    roundPreset: String(ELEMENTS.length),
    calledNumbers: [],
    selectedNumber: null,
    display: { ...DEFAULT_DISPLAY },
    compactMode: "symbol",
    sortMode: "called",
    calledTextSize: DEFAULT_CALLED_TEXT_SIZE,
    theme: "system"
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const elementLimit = Number.isInteger(saved.elementLimit) && saved.elementLimit >= 1 && saved.elementLimit <= ELEMENTS.length
      ? saved.elementLimit
      : ELEMENTS.length;
    const roundPreset = ["75", "90", "118", "custom"].includes(saved.roundPreset)
      ? saved.roundPreset
      : ["75", "90", "118"].includes(String(elementLimit)) ? String(elementLimit) : "custom";
    const calledNumbers = Array.isArray(saved.calledNumbers)
      ? [...new Set(saved.calledNumbers.filter((number) => Number.isInteger(number) && number >= 1 && number <= elementLimit))]
      : [];
    const display = { ...DEFAULT_DISPLAY };

    if (saved.display && typeof saved.display === "object") {
      for (const key of Object.keys(display)) {
        if (typeof saved.display[key] === "boolean") display[key] = saved.display[key];
      }
    }

    if (!Object.values(display).some(Boolean)) {
      Object.assign(display, DEFAULT_DISPLAY);
    }

    const calledTextSize = Number.isInteger(saved.calledTextSize)
      && saved.calledTextSize >= MIN_CALLED_TEXT_SIZE
      && saved.calledTextSize <= MAX_CALLED_TEXT_SIZE
      ? saved.calledTextSize
      : DEFAULT_CALLED_TEXT_SIZE;

    return {
      elementLimit,
      roundPreset,
      calledNumbers,
      selectedNumber: calledNumbers.includes(saved.selectedNumber)
        ? saved.selectedNumber
        : calledNumbers.at(-1) ?? null,
      display,
      compactMode: saved.compactMode === "number" ? "number" : "symbol",
      sortMode: ["called", "name", "symbol", "number"].includes(saved.sortMode) ? saved.sortMode : "called",
      calledTextSize,
      theme: ["light", "dark", "system"].includes(saved.theme) ? saved.theme : "system"
    };
  } catch (error) {
    console.warn("Could not load the saved bingo round; starting a fresh round.", error);
    return getInitialState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save the bingo round in this browser.", error);
  }
}

return { DEFAULT_CALLED_TEXT_SIZE, DEFAULT_DISPLAY, loadState, saveState };
})();
