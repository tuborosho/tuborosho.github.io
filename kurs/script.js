document.addEventListener("DOMContentLoaded", function () {
  const tables = document.querySelectorAll(".sortable");

  function recalculateTableData() {
    tables.forEach(function (table) {
      const rows = Array.from(table.querySelectorAll("tbody tr"));

      if (rows.length === 0 || rows[0].querySelectorAll("td").length < 10) {
        return;
      }

      rows.forEach(function (row) {
        const cells = row.querySelectorAll("td");

        if (cells.length >= 10) {
          const wins = parseInt(cells[3].textContent, 10);
          const draws = parseInt(cells[4].textContent, 10);
          const losses = parseInt(cells[5].textContent, 10);
          const goalsFor = parseInt(cells[6].textContent, 10);
          const goalsAgainst = parseInt(cells[7].textContent, 10);
          cells[2].textContent = wins + draws + losses;
          cells[8].textContent = goalsFor - goalsAgainst;
          cells[9].textContent = wins * 3 + draws;
        }
      });

		rows.sort(function (a, b) {
        function getStats(row) {
          const cells = row.querySelectorAll("td");
          return {
            points: parseInt(cells[9].textContent, 10),
            goalDiff: parseInt(cells[8].textContent, 10),
            goalsFor: parseInt(cells[6].textContent, 10),
            name: cells[1].textContent.trim()
          };
        }

        const aStats = getStats(a);
        const bStats = getStats(b);

        if (aStats.points !== bStats.points) {
          return bStats.points - aStats.points;
        }
        if (aStats.goalDiff !== bStats.goalDiff) {
          return bStats.goalDiff - aStats.goalDiff;
        }
        if (aStats.goalsFor !== bStats.goalsFor) {
          return bStats.goalsFor - aStats.goalsFor;
        }
        return aStats.name.localeCompare(bStats.name, 'ru');
      });

      const tbody = table.querySelector("tbody");
      tbody.innerHTML = "";
      rows.forEach(function (row, index) {
        const position = index + 1;
        const cells = row.querySelectorAll("td");
        cells[0].textContent = position;

        row.classList.remove("green-row");
        row.classList.remove("red-row");

        if (position === 1) {
          row.classList.add("green-row");
        } else if (position >= rows.length - 2) {
          row.classList.add("red-row");
        }

        tbody.appendChild(row);
      });
    });
  }

  recalculateTableData();

  tables.forEach(function (table) {
    const headers = table.querySelectorAll("th");
    const sortState = Array(headers.length).fill(null);

    headers.forEach(function (header, i) {
      header.addEventListener("click", function () {
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        const isNumeric = !isNaN(rows[0].children[i].innerText);
        const current = sortState[i];

        let next;
        if (current === "asc") {
          next = "desc";
        } else {
          next = "asc";
        }

        sortState.fill(null);
        sortState[i] = next;

        rows.sort(function (a, b) {
          let aVal = a.children[i].innerText.trim();
          let bVal = b.children[i].innerText.trim();

          if (isNumeric) {
            aVal = parseInt(aVal, 10);
            bVal = parseInt(bVal, 10);
            if (next === "asc") {
              return aVal - bVal;
            } else {
              return bVal - aVal;
            }
          } else {
            if (next === "asc") {
              return aVal.localeCompare(bVal, "ru");
            } else {
              return bVal.localeCompare(aVal, "ru");
            }
          }
        });

        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        rows.forEach(function (row) {
          tbody.appendChild(row);
        });

        headers.forEach(function (th) {
          th.classList.remove("sorted-column");
          th.textContent = th.textContent.replace("^", "");
          th.textContent = th.textContent.replace("v", "");
        });

        header.classList.add("sorted-column");
        if (next === "asc") {
          header.textContent += " ^";
        } else {
          header.textContent += " v";
        }
      });
    });
  });

  const leagueSelector = document.getElementById("league");

  if (leagueSelector) {
    leagueSelector.addEventListener("change", function () {
      const id = leagueSelector.value;
      showLeagueSection(id);
      updateURL(id);
    });

    const params = new URLSearchParams(window.location.search);
    const leagueFromUrl = params.get("league");
    if (leagueFromUrl) {
      leagueSelector.value = leagueFromUrl;
      showLeagueSection(leagueFromUrl);
    }

    const hash = window.location.hash.slice(1);
    if (hash) {
      showLeagueSection(hash);
      leagueSelector.value = hash;
    }
  }

  function showLeagueSection(id) {
    const sections = document.querySelectorAll(".league-section");
    sections.forEach(function (section) {
      section.classList.add("hidden");
    });

    const current = document.getElementById(id);
    if (current) {
      current.classList.remove("hidden");
    }
  }

  function updateURL(id) {
    const newUrl = window.location.pathname + "?league=" + id;
    window.history.pushState({}, "", newUrl);
  }

  const randomLink = document.getElementById("random-link");
  if (randomLink) {
    const options = [
      "tables.html?league=england",
      "tables.html?league=spain",
      "tables.html?league=germany",
      "stats.html?league=england-stats",
      "stats.html?league=spain-stats",
      "stats.html?league=germany-stats"
    ];

    const random = options[Math.floor(Math.random() * options.length)];
    randomLink.href = random;
  }

  window.enableEditing = function (button) {
    const table = button.closest("section").querySelector("table");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(function (row) {
      const cells = row.querySelectorAll("td");
      cells[1].contentEditable = true;
      for (let i = 3; i <= 7; i++) {
        cells[i].contentEditable = true;
      }
    });

    table.classList.add("editing");
  };

  window.saveTableData = function (button) {
    const table = button.closest("section").querySelector("table");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(function (row) {
      const cells = row.querySelectorAll("td");
      cells[1].contentEditable = false;
      for (let i = 3; i <= 7; i++) {
        cells[i].contentEditable = false;
      }
    });

    table.classList.remove("editing");

    recalculateTableData();
  };
});

