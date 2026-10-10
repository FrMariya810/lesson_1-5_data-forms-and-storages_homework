// В стартовом проекте нет готовой логики домашней работы.
// Спроектируйте модель данных и переходы между состояниями самостоятельно.

console.log("Стартовый проект подключен")
const STORAGE_KEY = "hw-5_music";
const SESSION_KEY = "hw-5-music_temp";

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

cards = loadCards();
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
      cards[index] = { ...cards[index], ...data };
      viewingId = editingId;
    }
    editingId = null;
  } else {
    const newCard = { id: makeId(), ...data };
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