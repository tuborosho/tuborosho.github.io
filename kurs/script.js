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


	function isNonNegativeInteger(value) {
    return /^\d+$/.test(value) && parseInt(value, 10) >= 0;
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

    const lastCell = cells[cells.length - 1];

    if (!lastCell.querySelector(".delete-button")) {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "X";
      deleteButton.className = "delete-button";

      deleteButton.addEventListener("click", function () {
        if (confirm("Вы уверены, что хотите удалить эту строку?")) {
          row.remove();
        }
      });

      lastCell.appendChild(deleteButton);
    }
  });

  table.classList.add("editing");
};



  window.saveTableData = function (button) {
  const table = button.closest("section").querySelector("table");
  const rows = table.querySelectorAll("tbody tr");
  let isValid = true;

  rows.forEach(function (row) {
    const cells = row.querySelectorAll("td");
    const wins = cells[3].textContent.trim();
    const draws = cells[4].textContent.trim();
    const losses = cells[5].textContent.trim();
    const goalsFor = cells[6].textContent.trim();
    const goalsAgainst = cells[7].textContent.trim();

    if (![wins, draws, losses, goalsFor, goalsAgainst].every(isNonNegativeInteger)) {
      alert("Вводимые числовые значения должны быть неотрицательными.");
      isValid = false;
    }
  });

  if (!isValid) return;

  rows.forEach(function (row) {
    const cells = row.querySelectorAll("td");
    cells[1].contentEditable = false;
    for (let i = 3; i <= 7; i++) {
      cells[i].contentEditable = false;
    }

    const deleteBtn = row.querySelector(".delete-button");
    if (deleteBtn) {
      deleteBtn.remove();
    }
  });

  table.classList.remove("editing");

  recalculateTableData();

  const sectionId = table.closest("section").id;
  const newRows = table.querySelectorAll("tbody tr");
  const tableData = Array.from(newRows).map(function (row) {
    return Array.from(row.querySelectorAll("td")).map(function (cell) {
      return cell.textContent;
    });
  });

  localStorage.setItem("tableData-" + sectionId, JSON.stringify(tableData));
};

  tables.forEach(function (table) {
  const sectionId = table.closest("section").id;
  const savedData = localStorage.getItem("tableData-" + sectionId);

  if (savedData) {
    const tableData = JSON.parse(savedData);
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    tableData.forEach(function (data) {
      const row = document.createElement("tr");

      data.forEach(function (cellData, i) {
        const cell = document.createElement("td");
        cell.textContent = cellData;

        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });


    recalculateTableData();
  }
});

  window.clearSavedTableData = function (button) {
    if (confirm("Вы уверены, что хотите очистить сохранённые изменения?")) {
      const section = button.closest("section");
      const sectionId = section.id;

      localStorage.removeItem("tableData-" + sectionId);

      location.reload();
    }
  };
  
  window.downloadLeagueTable = function (button) {
  const section = button.closest('section');
  const table = section.querySelector('table');

  if (!table) {
    console.error('тшггле');
    return;
  }

  const rows = table.querySelectorAll('tr');
  const csvContent = [];
  
  const headers = Array.from(rows[0].querySelectorAll('th'))
    .map(function (header) {
      return header.innerText.trim();
    });
  csvContent.push(headers.join(';'));

  rows.forEach(function (row, index) {
    if (index === 0) return;

    const cols = Array.from(row.querySelectorAll('td'));
    const rowData = cols.map(function (col) {
      return col.innerText.trim().replace(/"/g, '""');
    });

    csvContent.push(rowData.join(';'));
  });

  const csvString = csvContent.join('\n');
  downloadCSV("\uFEFF" + csvString, section.id + '.csv');
};

function downloadCSV(csv, filename) {
  const csvFile = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const downloadLink = document.createElement("a");

  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

window.addTableRow = function (button) {
  const table = button.closest("section").querySelector("table");
  const tbody = table.querySelector("tbody");

  const row = document.createElement("tr");

  for (let i = 0; i < 10; i++) {
    const cell = document.createElement("td");

    if (i === 0) {
      cell.textContent = "";
    } else if (i === 2 || i === 8 || i === 9) {
      cell.textContent = "";
    } else {
      cell.contentEditable = true;
      cell.textContent = "";
    }

    row.appendChild(cell);
  }

  const lastCell = row.querySelector("td:last-child");
  if (lastCell) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function () {
      if (confirm("Вы уверены, что хотите удалить эту строку?")) {
        row.remove();
      }
    });

    lastCell.appendChild(deleteButton);
  }

  tbody.appendChild(row);

  table.classList.add("editing");
};
});


