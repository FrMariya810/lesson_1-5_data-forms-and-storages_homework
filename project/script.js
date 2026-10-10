// В стартовом проекте нет готовой логики домашней работы.
// Спроектируйте модель данных и переходы между состояниями самостоятельно.

console.log("Стартовый проект подключен")
const STORAGE_KEY = "hw-5_music";
const SESSION_KEY = "hw-5-music_temp";

const form = document.querySelector(".card-form");
const panels = {
  empty: document.querySelector('[data-state-panel="empty"]'),
  editor: document.querySelector('[data-state-panel="editor"]'),
  viewer: document.querySelector('[data-state-panel="viewer"]'),
};
const createButton = document.querySelector('[data-action="create"]');
const cancelButton = document.querySelector('[data-action="cancel"]');
const editButton = document.querySelector('[data-action="edit"]');
const deleteButton = document.querySelector('[data-action="delete"]');

const cardTitle = document.querySelector(".saved-card__title");
const viewArtist = document.querySelector('[data-view="artist"]');
const viewYear = document.querySelector('[data-view="year"]');
const viewRating = document.querySelector('[data-view="rating"]');

let currentCard = null;

function showState(name) {
  Object.entries(panels).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
  saveMode(name);
}

function renderCard(card) {
  cardTitle.textContent = card.title;
  viewArtist.textContent = card.artist;
  viewYear.textContent = card.year;
  viewRating.textContent = card.rating;
}

function fillForm(card) {
  form.elements.title.value = card.title;
  form.elements.artist.value = card.artist;
  form.elements.year.value = card.year;
  form.elements.rating.value = card.rating;
}

function saveToStorage(card) {
  const cardJson = JSON.stringify(card);
  localStorage.setItem(STORAGE_KEY, cardJson);
}

function loadFromStorage() {
  const cardJson = localStorage.getItem(STORAGE_KEY);
  if (!cardJson) return null;
  return JSON.parse(cardJson);
}

function removeFromStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

function saveMode(name) {
  sessionStorage.setItem(SESSION_KEY, name);
}

function loadMode() {
  return sessionStorage.getItem(SESSION_KEY);
}

function clearMode() {
  sessionStorage.removeItem(SESSION_KEY);
}

const savedCard = loadFromStorage();
const savedMode = loadMode();
if (savedMode === "editor") {
  if (savedCard) {
    currentCard = savedCard;
    fillForm(savedCard);
  }
  showState("editor");
} else if (savedCard) {
  currentCard = savedCard;
  renderCard(savedCard);
  showState("viewer");
} else {
  showState("empty");
}

createButton.addEventListener("click", () => {
  form.reset();
  showState("editor");
  form.elements.title.focus();
});

cancelButton.addEventListener("click", () => {
  if (currentCard) {
    showState("viewer");
  } else {
    showState("empty");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const card = {
    title: formData.get("title"),
    artist: formData.get("artist"),
    year: formData.get("year"),
    rating: formData.get("rating"),
  };
  currentCard = card;
  saveToStorage(card);
  renderCard(currentCard);
  showState("viewer");
});

editButton.addEventListener("click", () => {
  if (currentCard) {
    fillForm(currentCard);
  }
  showState("editor");
});

deleteButton.addEventListener("click", () => {
  currentCard = null;
  removeFromStorage();
  clearMode();  
  form.reset();
  showState("empty");
});