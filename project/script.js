// В стартовом проекте нет готовой логики домашней работы.
// Спроектируйте модель данных и переходы между состояниями самостоятельно.

console.log("Стартовый проект подключен")
const STORAGE_KEY = "hw-5_music";
const SESSION_KEY = "hw-5-music_temp";
const LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const form = document.querySelector(".card-form");
const panels = {
  empty: document.querySelector('[data-state-panel="empty"]'),
  list: document.querySelector('[data-state-panel="list"]'),
  editor: document.querySelector('[data-state-panel="editor"]'),
  viewer: document.querySelector('[data-state-panel="viewer"]'),
};
const listContainer = document.querySelector("[data-list]");
const createButtons = document.querySelectorAll('[data-action="create"]');
const cancelButton = document.querySelector('[data-action="cancel"]');
const editButton = document.querySelector('[data-action="edit"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const backToListButton = document.querySelector('[data-action="back-to-list"]');
const exportButtons = document.querySelectorAll('[data-action="export"]');
const importButtons = document.querySelectorAll('[data-action="import"]');
const importInputs = document.querySelectorAll("[data-import-input]");

const cardTitle = document.querySelector(".saved-card__title");
const viewArtist = document.querySelector('[data-view="artist"]');
const viewYear = document.querySelector('[data-view="year"]');
const viewFounded = document.querySelector('[data-view="founded"]')
const viewRating = document.querySelector('[data-view="rating"]');

const yearInput = form.elements.year;
const foundedInput = form.elements.founded;
const yearError = document.querySelector('[data-error="year"]');

let cards = [];
let editingId = null;
let viewingId = null;

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
function loadCards() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}
function makeId() {
  return String(Date.now());
}


function isExpired(card) {
  if (!card.savedAt) return false;
  return Date.now() - card.savedAt > LIFETIME_MS;
}

function showNotice(text) {
  const el = document.querySelector("[data-notice]");
  if (!el) return;
  if (text) {
    el.textContent = text;
    el.hidden = false;
  } else {
    el.hidden = true;
  }
}

function saveMode(name) {
  const id = name === "viewer" ? viewingId
           : name === "editor" ? editingId
           : null;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ mode: name, id }));
}
function loadMode() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
function clearMode() {
  sessionStorage.removeItem(SESSION_KEY);
}


function showState(name) {
  Object.entries(panels).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
  saveMode(name);
}

function renderCard(card) {
  cardTitle.textContent = card.title;
  viewArtist.textContent = card.artist || "-";
  viewYear.textContent = card.year || "-";
  viewFounded.textContent = card.founded || "-";
  viewRating.textContent = card.rating || "-";
}

function renderList() {
  listContainer.textContent = "";
  cards.forEach((card) => {
    const li = document.createElement("li");
    li.className = "card-list__item";

    const btn = document.createElement("button");
    btn.className = "card-list__open";
    btn.type = "button";
    btn.textContent = `${card.title} - ${card.artist}`;
    btn.addEventListener("click", () => {
      viewingId = card.id;
      renderCard(card);
      showState("viewer");
    });

    li.append(btn);
    listContainer.append(li);
  });
}

function fillForm(card) {
  form.elements.title.value = card.title;
  form.elements.artist.value = card.artist;
  form.elements.year.value = card.year;
  form.elements.founded.value = card.founded ?? "";
  form.elements.rating.value = card.rating;
}

function isValidCard(card) {
  return (
    card &&
    typeof card === "object" &&
    typeof card.id === "string" &&
    typeof card.title === "string" &&
    card.title.trim() !== "" &&
    typeof card.artist === "string"
  );
}

function exportCards() {
  if (cards.length === 0) {
    showNotice("Экспортировать нечего: карточек пока нет");
    return;
  }
  const json = JSON.stringify(cards, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "music-cards.json";
  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  showNotice(`Экспортировано карточек: ${cards.length}`);
}

function importCards(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch {
      showNotice("Не удалось прочитать файл: это не корректный JSON");
      return;
    }

    if (!Array.isArray(parsed)) {
      showNotice("Файл должен содержать массив карточек");
      return;
    }

    const valid = parsed.filter(isValidCard);
    if (valid.length === 0) {
      showNotice("В файле не нашлось ни одной подходящей карточки");
      return;
    }

    cards = valid;
    viewingId = null;
    editingId = null;
    saveCards();
    renderList();
    showState("list");
    showNotice(`Импортировано карточек: ${valid.length}`);
  });

  reader.addEventListener("error", () => {
    showNotice("Не удалось прочитать файл");
  });

  reader.readAsText(file);
}

function validateYears() {
  const year = Number(yearInput.value);
  const founded = Number(foundedInput.value);

  if (!yearInput.value || !foundedInput.value) {
    yearError.hidden = true;
    return true;
  }
  if (year < founded) {
    yearError.textContent =
      `Год выпуска не может быть раньше года основания (${founded})`;
    yearError.hidden = false;
    return false;
  }
  yearError.hidden = true;
  return true;
}

const raw = loadCards();
const expiredCount = raw.filter(isExpired).length;
cards = raw.filter((card) => !isExpired(card));

if (expiredCount > 0) {
  if (cards.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    saveCards();
  }
  showNotice(
    `Устарело и удалено карточек: ${expiredCount}. Срок хранения - 7 дней.`
  );
}
const saved = loadMode();

if (cards.length === 0) {
  showState("empty");
} else {
  renderList();

  if (saved && saved.mode === "viewer") {
    const card = cards.find((c) => c.id === saved.id) || cards[0];
    viewingId = card.id;
    renderCard(card);
    showState("viewer");
  } else if (saved && saved.mode === "editor") {
    const card = saved.id ? cards.find((c) => c.id === saved.id) : null;
    if (card) {
      editingId = card.id;
      fillForm(card);
    } else {
      editingId = null;
    }
    showState("editor");
  } else {
    showState("list");
  }
}

createButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    form.reset();
    editingId = null;
    showState("editor");
    form.elements.title.focus();
  });
});

cancelButton.addEventListener("click", () => {
  form.reset();
  editingId = null;
  if (cards.length === 0) {
    showState("empty");
  } else {
    renderList();
    showState("list");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateYears()) return;

  const formData = new FormData(form);
  const data = {
    title: formData.get("title"),
    artist: formData.get("artist"),
    year: formData.get("year"),
    rating: formData.get("rating"),
  };

  if (editingId) {
  const index = cards.findIndex((c) => c.id === editingId);
  if (index !== -1) {
    cards[index] = { ...cards[index], ...data, savedAt: Date.now() };
    viewingId = editingId;
  }
  editingId = null;
} else {
  const newCard = { id: makeId(), savedAt: Date.now(), ...data };
  cards.push(newCard);
  viewingId = newCard.id;
}

  saveCards();
  renderList();

  const current = cards.find((c) => c.id === viewingId);
  renderCard(current);
  showState("viewer");
});

editButton.addEventListener("click", () => {
  const current = cards.find((c) => c.id === viewingId);
  if (!current) return;
  editingId = current.id;
  fillForm(current);
  showState("editor");
});

deleteButton.addEventListener("click", () => {
  cards = cards.filter((c) => c.id !== viewingId);
  viewingId = null;
  saveCards();

  if (cards.length === 0) {
    showState("empty");
  } else {
    renderList();
    showState("list");
  }
});

if (backToListButton) {
  backToListButton.addEventListener("click", () => {
    viewingId = null;
    renderList();
    showState("list");
  });
}

form.addEventListener("input", () => {
  validateYears();
});

exportButtons.forEach((btn) => {
  btn.addEventListener("click", exportCards);
});

importButtons.forEach((btn, i) => {
  const input = importInputs[i];
  if (!input) return;
  btn.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (file) importCards(file);
    input.value = "";
  });
});