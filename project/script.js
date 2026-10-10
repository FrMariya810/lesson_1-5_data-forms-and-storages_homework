// В стартовом проекте нет готовой логики домашней работы.
// Спроектируйте модель данных и переходы между состояниями самостоятельно.

console.log("Стартовый проект подключен")

const form = document.querySelector(".card-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const card = {
    title: formData.get("title"),
    artist: formData.get("artist"),
    year: formData.get("year"),
    rating: formData.get("rating"),
  };

  console.log("Данные карточки:", card);
});