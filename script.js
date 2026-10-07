// 1. HTML-Elemente auswählen und gespeicherte Daten laden.
const storageKey = "nba-hub-schule-v1";
const teamList = document.querySelector("#teams");
const searchInput = document.querySelector("#search");
const favoritesOnly = document.querySelector("#favorites-only");
const count = document.querySelector("#count");
const message = document.querySelector("#message");
let savedTeams = loadData();

function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Ungültige Daten");
    }
    // Nur bekannte Teams und die erwarteten Datentypen übernehmen.
    const validData = {};
    for (const team of teams) {
      const entry = data[team.id];
      if (entry && typeof entry.favorite === "boolean" && typeof entry.note === "string") {
        validData[team.id] = { favorite: entry.favorite, note: entry.note.slice(0, 500) };
      }
    }
    return validData;
  } catch {
    message.textContent = "Gespeicherte Daten konnten nicht geladen werden. Du kannst die Anwendung trotzdem verwenden.";
    return {};
  }
}

function saveData() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(savedTeams));
    message.textContent = "Im Browser gespeichert.";
  } catch {
    message.textContent = "Speichern ist nicht möglich. Deine Änderungen bleiben nur bis zum Neuladen erhalten.";
  }
}

// 2. Eine Teamkarte aus normalen HTML-Elementen erstellen.
function createTeamCard(team) {
  const card = document.createElement("article");
  card.className = "team-card";
  // Diese Vorlage enthält nur festen HTML-Code. Texte setzen wir mit textContent.
  card.innerHTML = `
    <span class="team-code"></span>
    <h3></h3>
    <p class="location"></p>
    <button class="favorite" type="button"></button>
    <form>
      <label>Meine Notiz<textarea maxlength="500" rows="3" placeholder="Was möchtest du dir zu diesem Team merken?"></textarea></label>
      <div class="actions">
        <button type="submit">Notiz speichern</button>
        <button class="delete" type="button">Notiz löschen</button>
      </div>
    </form>`;
  card.querySelector(".team-code").textContent = team.id;
  card.querySelector("h3").textContent = team.name;
  card.querySelector(".location").textContent = team.city + " · " + team.stadium;
  const favoriteButton = card.querySelector(".favorite");
  const noteInput = card.querySelector("textarea");
  const entry = savedTeams[team.id] || { favorite: false, note: "" };
  favoriteButton.textContent = entry.favorite ? "★ Favorit entfernen" : "☆ Als Favorit merken";
  favoriteButton.setAttribute("aria-pressed", String(entry.favorite));
  favoriteButton.setAttribute("aria-label", favoriteButton.textContent + ": " + team.name);
  noteInput.value = entry.note;

  favoriteButton.addEventListener("click", function () {
    const current = savedTeams[team.id] || { favorite: false, note: "" };
    savedTeams[team.id] = { favorite: !current.favorite, note: current.note };
    saveData();
    // Nur diesen Knopf aktualisieren, damit ungespeicherte Notizen erhalten bleiben.
    const active = savedTeams[team.id].favorite;
    favoriteButton.textContent = active ? "★ Favorit entfernen" : "☆ Als Favorit merken";
    favoriteButton.setAttribute("aria-pressed", String(active));
    favoriteButton.setAttribute("aria-label", favoriteButton.textContent + ": " + team.name);
    filterTeams();
    if (card.hidden) favoritesOnly.focus();
  });

  card.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    const current = savedTeams[team.id] || { favorite: false, note: "" };
    savedTeams[team.id] = { favorite: current.favorite, note: noteInput.value.trim() };
    noteInput.value = savedTeams[team.id].note;
    saveData();
  });

  card.querySelector(".delete").addEventListener("click", function () {
    const current = savedTeams[team.id] || { favorite: false, note: "" };
    savedTeams[team.id] = { favorite: current.favorite, note: "" };
    noteInput.value = "";
    saveData();
    noteInput.focus();
  });
  return card;
}

// 3. Karten einmal aufbauen. Beim Filtern bleiben Eingaben erhalten.
const cards = teams.map(function (team) {
  const element = createTeamCard(team);
  teamList.append(element);
  return { team: team, element: element };
});

function filterTeams() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const searchText = (card.team.name + " " + card.team.city + " " + card.team.id).toLowerCase();
    const matchesSearch = searchText.includes(query);
    const matchesFavorite = !favoritesOnly.checked || savedTeams[card.team.id]?.favorite === true;
    card.element.hidden = !(matchesSearch && matchesFavorite);
    if (!card.element.hidden) visible++;
  }
  count.textContent = visible === 0
    ? "Keine Teams gefunden. Ändere die Suche oder den Favoritenfilter."
    : visible + " von " + teams.length + " Teams angezeigt";
}

searchInput.addEventListener("input", filterTeams);
favoritesOnly.addEventListener("change", filterTeams);
filterTeams();
