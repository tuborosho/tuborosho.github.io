// Функция сортировки таблиц + автоподсчет РМ и О + логика stats.html
document.addEventListener("DOMContentLoaded", () => {
  const tables = document.querySelectorAll(".sortable");

  // ===== АВТОПОДСЧЁТ РМ И О =====
  function recalculateTableData() {
    tables.forEach(table => {
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");

        // Проверяем, что таблица — это турнирная таблица (а не статистика игроков)
        if (cells.length >= 10) {
          const wins = parseInt(cells[3].textContent);
          const draws = parseInt(cells[4].textContent);
          const goalsFor = parseInt(cells[6].textContent);
          const goalsAgainst = parseInt(cells[7].textContent);

          const goalDiff = goalsFor - goalsAgainst;
          const points = wins * 3 + draws;

          cells[8].textContent = goalDiff /*>= 0 ? goalDiff : goalDiff.toString()*/; // РМ
          cells[9].textContent = points; // О
        }
      });
    });
  }

  recalculateTableData(); // Вызываем при загрузке

  // ===== СОРТИРОВКА =====
  tables.forEach((table) => {
    const headers = table.querySelectorAll("th");
    let sortState = Array(headers.length).fill(null); // null | "asc" | "desc"

    headers.forEach((header, columnIndex) => {
      header.addEventListener("click", () => {
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        const isNumeric = !isNaN(rows[0].children[columnIndex].innerText.replace(',', '.'));
        const currentSort = sortState[columnIndex];
        const newSort = currentSort === "asc" ? "desc" : "asc";

        sortState.fill(null);
        sortState[columnIndex] = newSort;

        const sortedRows = rows.sort((a, b) => {
          const aText = a.children[columnIndex].innerText;
          const bText = b.children[columnIndex].innerText;
          const aVal = isNumeric ? parseFloat(aText.replace(',', '.')) : aText;
          const bVal = isNumeric ? parseFloat(bText.replace(',', '.')) : bText;

          if (aVal < bVal) return newSort === "asc" ? -1 : 1;
          if (aVal > bVal) return newSort === "asc" ? 1 : -1;
          return 0;
        });

        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        sortedRows.forEach((row) => tbody.appendChild(row));

        headers.forEach((th, i) => {
          th.classList.remove("sorted-column");
          th.textContent = th.textContent.replace(/[\u25B2\u25BC]/g, "");
        });

        header.classList.add("sorted-column");
        header.textContent += newSort === "asc" ? " ▲" : " ▼";
      });
    });
  });

  // ===== СЕЛЕКТОР ЛИГ (stats.html) =====
  const leagueSelector = document.getElementById("league");
  if (leagueSelector) {
    leagueSelector.addEventListener("change", () => {
      const selectedLeague = leagueSelector.value;
      showLeagueSection(selectedLeague);
      updateURL(selectedLeague);
    });

    const params = new URLSearchParams(window.location.search);
    const leagueFromUrl = params.get("league");
    if (leagueFromUrl) {
      leagueSelector.value = leagueFromUrl;
      showLeagueSection(leagueFromUrl);
    }

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      showLeagueSection(hash);
      leagueSelector.value = hash;
    }
  }

  function showLeagueSection(leagueId) {
    document.querySelectorAll(".league-section").forEach((section) => {
      section.classList.add("hidden");
    });
    if (leagueId) {
      const section = document.getElementById(leagueId);
      if (section) section.classList.remove("hidden");
    }
  }

  function updateURL(leagueId) {
    const newUrl = `${window.location.pathname}?league=${leagueId}`;
    window.history.pushState({}, "", newUrl);
  }
});
