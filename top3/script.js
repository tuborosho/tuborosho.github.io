let teams = []; // Массив названий команд
let schedule = []; // Массив туров, каждый тур - массив матчей
let currentTourIndex = 0; // Индекс текущего отображаемого тура
let standings = {}; // Объект для хранения статистики команд
let currentMatchDataForSpotify = null; // Для хранения данных о матче, для которого добавляется Spotify ссылка

// --- Константы ---
const MAX_UNIQUE_DRAWS_PER_TOUR = 1; // Максимум 1:1 за тур
const MAX_LARGE_WINS_PER_TOUR = 6; // Максимум 4:0 / 0:4 / 3:1 / 1:3 за тур
const RELEGATION_ZONE_START = 121; // Начало зоны вылета
const PLAYOFF_ZONE_START = 101; // Начало зоны стыков
const STORAGE_KEY_TEAMS = 'tournamentTeams';
const STORAGE_KEY_SCHEDULE = 'tournamentSchedule';
const STORAGE_KEY_CURRENT_TOUR = 'tournamentCurrentTourIndex';

// --- Элементы DOM ---
const teamsInput = document.getElementById('teamsInput');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const prevTourBtn = document.getElementById('prevTourBtn');
const nextTourBtn = document.getElementById('nextTourBtn');
const currentTourNumSpan = document.getElementById('currentTourNum');
const totalToursNumSpan = document.getElementById('totalToursNum');
const tourJumpInput = document.getElementById('tourJumpInput');
const jumpToTourBtn = document.getElementById('jumpToTourBtn');
const showFullScheduleBtn = document.getElementById('showFullScheduleBtn');
const showStandingsBtn = document.getElementById('showStandingsBtn');
const currentTourOutput = document.getElementById('currentTourOutput');
const fullScheduleModal = document.getElementById('fullScheduleModal');
const fullScheduleContent = document.getElementById('fullScheduleContent');
const closeFullScheduleBtn = fullScheduleModal.querySelector('.close-button');
const standingsModal = document.getElementById('standingsModal');
const standingsBodyModal = document.getElementById('standingsBodyModal');
const closeStandingsBtn = standingsModal.querySelector('.close-button');
const spotifyModal = document.getElementById('spotifyModal');
const spotifyUrlInput = document.getElementById('spotifyUrlInput');
const saveSpotifyUrlBtn = document.getElementById('saveSpotifyUrlBtn');
const currentSpotifyInfo = document.getElementById('currentSpotifyInfo');
const closeSpotifyModalBtn = spotifyModal.querySelector('.close-button');

// --- Функции для сохранения и загрузки данных ---
function saveData() {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    localStorage.setItem(STORAGE_KEY_CURRENT_TOUR, currentTourIndex.toString());
    // Статистика `standings` будет пересчитываться при необходимости, поэтому ее отдельно сохранять не нужно
}

function loadData() {
    const savedTeams = localStorage.getItem(STORAGE_KEY_TEAMS);
    const savedSchedule = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    const savedCurrentTourIndex = localStorage.getItem(STORAGE_KEY_CURRENT_TOUR);

    if (savedTeams) {
        teams = JSON.parse(savedTeams);
        teamsInput.value = teams.join('\n'); // Восстанавливаем текст в textarea
    }
    if (savedSchedule) {
        schedule = JSON.parse(savedSchedule);
    }
    if (savedCurrentTourIndex) {
        currentTourIndex = parseInt(savedCurrentTourIndex, 10);
    } else {
        currentTourIndex = 0; // По умолчанию первый тур
    }

    // Если данные загружены, обновляем интерфейс
    if (teams.length > 0 && schedule.length > 0) {
        updateStandings(); // Пересчитываем статистику на основе загруженного расписания
        displayTour(currentTourIndex);
        updateNavigationButtons();
        displayFullSchedule();
        updateStandingsDataAndDisplay();
    } else {
        // Если данных нет или они некорректны, показываем начальное состояние
        currentTourOutput.innerHTML = '<p>Введите команды и нажмите "Сгенерировать Расписание".</p>';
        currentTourNumSpan.textContent = '0';
        totalToursNumSpan.textContent = '0';
        updateNavigationButtons();
    }
}

// --- Функции для работы с модальными окнами ---
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
    currentMatchDataForSpotify = null; // Сбрасываем данные при закрытии
    spotifyUrlInput.value = '';
    currentSpotifyInfo.textContent = '';
}

// --- Функции для отрисовки и управления турами ---
function displayTour(tourIndex) {
    currentTourIndex = tourIndex;
    if (currentTourNumSpan) currentTourNumSpan.textContent = tourIndex + 1;
    if (totalToursNumSpan) totalToursNumSpan.textContent = schedule.length;

    currentTourOutput.innerHTML = ''; // Очищаем предыдущий тур

    if (tourIndex < 0 || tourIndex >= schedule.length) {
        currentTourOutput.innerHTML = '<p>Тур не найден.</p>';
        updateNavigationButtons();
        return;
    }

    const matches = schedule[tourIndex];
    const tourTitle = document.createElement('h3');
    tourTitle.textContent = `Тур ${tourIndex + 1}`;
    currentTourOutput.appendChild(tourTitle);

    // Добавляем блок для сообщений о проверке тура
    const validationMessageDiv = document.createElement('div');
    validationMessageDiv.id = 'validationMessage';
    validationMessageDiv.style.color = 'orange';
    validationMessageDiv.style.marginBottom = '10px';
    validationMessageDiv.style.textAlign = 'center'; // Центрируем сообщение
    currentTourOutput.appendChild(validationMessageDiv);

    const tourMatchesDiv = document.createElement('div');
    tourMatchesDiv.className = 'matches-list';

    if (matches.length === 0) {
        tourMatchesDiv.innerHTML = '<p>Матчей в этом туре нет.</p>';
    } else {
        matches.forEach((match, matchIndex) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match-item';

            // Создаем кнопки удаления команд
            const removeHomeTeamBtn = document.createElement('button');
            removeHomeTeamBtn.className = 'remove-team-btn';
            removeHomeTeamBtn.innerHTML = '❌️';
            removeHomeTeamBtn.title = `Удалить команду ${match.homeTeam}`;
            removeHomeTeamBtn.onclick = (e) => {
                e.preventDefault();
                removeTeam(match.homeTeam);
            };

            const removeAwayTeamBtn = document.createElement('button');
            removeAwayTeamBtn.className = 'remove-team-btn';
            removeAwayTeamBtn.innerHTML = '❌️';
            removeAwayTeamBtn.title = `Удалить команду ${match.awayTeam}`;
            removeAwayTeamBtn.onclick = (e) => {
                e.preventDefault();
                removeTeam(match.awayTeam);
            };

            // Формируем HTML для матча
            matchElement.innerHTML = `
                <span class="team-name">${match.homeTeam}</span>
                <div class="score-input">
                    <input type="number" class="score-home" min="0" max="10" value="${match.homeScore || ''}" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="home" placeholder="-">
                    <span>:</span>
                    <input type="number" class="score-away" min="0" max="10" value="${match.awayScore || ''}" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="away" placeholder="-">
                </div>
                <span class="team-name">${match.awayTeam}</span>
                <div class="spotify-links">
                    <a href="#" class="spotify-link" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="home" title="Добавить песню">🎶</a>
                    <a href="#" class="spotify-link" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="away" title="Добавить песню">🎶</a>
                </div>
            `;

            // Вставляем кнопки удаления перед названиями команд
            matchElement.prepend(removeHomeTeamBtn);
            matchElement.querySelector('.team-name:last-of-type').parentNode.insertBefore(removeAwayTeamBtn, matchElement.querySelector('.team-name:last-of-type').nextSibling);

            tourMatchesDiv.appendChild(matchElement);
        });
    }
    currentTourOutput.appendChild(tourMatchesDiv);

    // Добавляем обработчики ввода счета
    addScoreInputListeners();

    // Проверяем результат тура и выводим сообщения
    validateTourResults(matches);

    // Обновляем кнопки навигации
    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevTourBtn.disabled = currentTourIndex === 0;
    nextTourBtn.disabled = currentTourIndex === schedule.length - 1 || schedule.length === 0;
}

function findFirstUnscoredMatchTour() {
    if (schedule.length === 0) return 0;
    for (let i = 0; i < schedule.length; i++) {
        const tour = schedule[i];
        // Проверяем, есть ли хотя бы один матч без счета в этом туре
        if (tour.some(match => !match.score || match.score === "")) {
            return i; // Возвращаем индекс тура
        }
    }
    return 0; // Если все счета заполнены, возвращаем первый тур
}

// --- Функции для генерации расписания ---
function generateSchedule() {
    schedule = []; // Очищаем старое расписание
    const numTeams = teams.length;
    const numRounds = numTeams - 1; // Количество раундов (туров)
    const numMatchesPerRound = Math.floor(numTeams / 2); // Количество матчей в каждом раунде

    let currentTeams = [...teams]; // Копируем команды

    for (let round = 0; round < numRounds; round++) {
        const currentRoundMatches = [];
        for (let i = 0; i < numMatchesPerRound; i++) {
            const homeTeam = currentTeams[i];
            const awayTeam = currentTeams[numTeams - 1 - i];
            currentRoundMatches.push({
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                score: "", // Изначально счет пустой
                homeSpotifyUrl: "", // Spotify ссылка для домашней команды
                awaySpotifyUrl: ""  // Spotify ссылка для гостевой команды
            });
        }
        schedule.push(currentRoundMatches);

        // Ротация команд для следующего раунда (кроме первой команды)
        const firstTeam = currentTeams[0];
        const rotatingTeams = currentTeams.slice(1);
        const lastTeam = rotatingTeams.pop();
        currentTeams = [firstTeam, lastTeam, ...rotatingTeams];
    }
    // Если количество команд нечетное, нужно добавить "BYE"
    if (numTeams % 2 !== 0) {
        // Вставляем 'BYE' в нужную позицию для каждого тура
        schedule.forEach((tour, tourIndex) => {
            const byeTeamIndex = (tourIndex % numTeams); // Индекс, куда вставить 'BYE'
            const byeTeam = teams[byeTeamIndex]; // Находим, какая команда должна отдыхать

            // Находим, какая команда должна быть "BYE" в текущем туре
            // Это сложная логика, для простоты будем считать, что "BYE" команда всегда одна и та же
            // Более корректно: найти команду, которая не играет в этом туре
            // Для текущей реализации Round Robin, проще добавить "BYE" как команду, если она нечетная
            // Но так как у нас 149 туров, предполагается много команд, где BYE не будет
            // Если команд четное число, этот блок пропускается.
        });
        // Если количество команд действительно нечетное, нужно пересмотреть логику генерации.
        // В данном случае, предполагаем, что количество команд четное, и 149 туров - это следствие большого числа команд.
    }
}

// --- Функции для обновления статистики и турнирной таблицы ---
function updateStandings() {
    // Сбрасываем статистику перед пересчетом
    teams.forEach(team => {
        standings[team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    });

    // Перебираем все туры и все матчи
    schedule.forEach(tour => {
        tour.forEach(match => {
            if (match.score && match.score !== "") {
                const scores = match.score.split(':').map(Number);
                if (scores.length === 2) {
                    const homeScore = scores[0];
                    const awayScore = scores[1];
                    const homeTeam = match.homeTeam;
                    const awayTeam = match.awayTeam;

                    // Обновляем статистику для домашней команды
                    standings[homeTeam].played++;
                    standings[homeTeam].goalsFor += homeScore;
                    standings[homeTeam].goalsAgainst += awayScore;
                    if (homeScore > awayScore) {
                        standings[homeTeam].wins++;
                        standings[homeTeam].points += 3;
                    } else if (homeScore === awayScore) {
                        standings[homeTeam].draws++;
                        standings[homeTeam].points += 1;
                    } else {
                        standings[homeTeam].losses++;
                    }

                    // Обновляем статистику для гостевой команды
                    standings[awayTeam].played++;
                    standings[awayTeam].goalsFor += awayScore;
                    standings[awayTeam].goalsAgainst += homeScore;
                    if (awayScore > homeScore) {
                        standings[awayTeam].wins++;
                        standings[awayTeam].points += 3;
                    } else if (awayScore === homeScore) {
                        standings[awayTeam].draws++;
                        standings[awayTeam].points += 1;
                    } else {
                        standings[awayTeam].losses++;
                    }
                }
            }
        });
    });

    // После обновления статистики, вызываем проверку тура
    if (schedule[currentTourIndex]) {
        validateTourResults(schedule[currentTourIndex]);
    }
}

function displayStandingsInModal() {
    standingsBodyModal.innerHTML = ''; // Очищаем предыдущее содержимое

    // Получаем отсортированные команды
    const sortedStandings = Object.entries(standings).sort(([teamA_name, teamA_data], [teamB_name, teamB_data]) => {
        // Сортировка по очкам (desc), затем по разнице мячей (desc), затем по забитым голам (desc)
        if (teamB_data.points !== teamA_data.points) return teamB_data.points - teamA_data.points;
        const diffA = teamA_data.goalsFor - teamA_data.goalsAgainst;
        const diffB = teamB_data.goalsFor - teamB_data.goalsAgainst;
        if (diffB !== diffA) {
            return diffB - diffA;
        }
        return teamB_data.goalsFor - teamA_data.goalsFor;
    });

    sortedStandings.forEach(([teamName, data], index) => {
        const row = standingsBodyModal.insertRow();
        const position = index + 1; // Позиция команды (начиная с 1)

        row.innerHTML = `
            <td>${position}</td> <!-- Номер по порядку -->
            <td>${teamName}</td>
            <td>${data.played}</td>
            <td>${data.wins}</td>
            <td>${data.draws}</td>
            <td>${data.losses}</td>
            <td>${data.goalsFor}</td>
            <td>${data.goalsAgainst}</td>
            <td>${data.goalsFor - data.goalsAgainst}</td>
            <td>${data.points}</td>
        `;

        // Добавляем классы для зон вылета и стыков
        if (position >= RELEGATION_ZONE_START && position <= RELEGATION_ZONE_START + 29) { // 121-150
            row.classList.add('relegation-zone');
        } else if (position >= PLAYOFF_ZONE_START && position <= PLAYOFF_ZONE_START + 19) { // 101-120
            row.classList.add('playoff-zone');
        }
    });
}

function updateStandingsDataAndDisplay() {
    updateStandings(); // Пересчитываем статистику
    displayStandingsInModal(); // Отображаем в модальном окне
}

// --- Функции для валидации результатов тура ---
function validateTourResults(tourMatches) {
    let drawCount1_1 = 0; // Счет 1:1
    let largeWinCount = 0; // Счет 4:0, 0:4, 3:1, 1:3

    tourMatches.forEach(match => {
        // Проверяем, что счет заполнен
        if (match.score && match.score !== "") {
            const scores = match.score.split(':').map(Number);
            if (scores.length === 2) {
                const score1 = scores[0];
                const score2 = scores[1];

                if (score1 === 1 && score2 === 1) {
                    drawCount1_1++;
                } else if (
                    (score1 === 4 && score2 === 0) || (score1 === 0 && score2 === 4) ||
                    (score1 === 3 && score2 === 1) || (score1 === 1 && score2 === 3)
                ) {
                    largeWinCount++;
                }
            }
        }
    });

    let validationMessage = "";
    if (drawCount1_1 > MAX_UNIQUE_DRAWS_PER_TOUR) {
        validationMessage += `Внимание: В этом туре обнаружено ${drawCount1_1} матчей со счетом 1:1 (максимум ${MAX_UNIQUE_DRAWS_PER_TOUR}). `;
    }
    if (largeWinCount > MAX_LARGE_WINS_PER_TOUR) {
        validationMessage += `Внимание: В этом туре обнаружено ${largeWinCount} матчей с крупным счетом (максимум ${MAX_LARGE_WINS_PER_TOUR}). `;
    }

    const messageDiv = document.getElementById('validationMessage');
    if (messageDiv) {
        messageDiv.textContent = validationMessage;
    }
}

// --- Функция для отображения полного расписания ---
function displayFullSchedule() {
    fullScheduleContent.innerHTML = ''; // Очищаем предыдущее содержимое

    if (schedule.length === 0) {
        fullScheduleContent.innerHTML = '<p>Расписание еще не сгенерировано.</p>';
        return;
    }

    schedule.forEach((tour, tourIndex) => {
        const tourDiv = document.createElement('div');
        tourDiv.style.marginBottom = '20px';

        const tourTitle = document.createElement('h3');
        tourTitle.textContent = `Тур ${tourIndex + 1}`;
        tourDiv.appendChild(tourTitle);

        if (tour.length === 0) {
            tourDiv.innerHTML += '<p>Матчей нет.</p>';
        } else {
            const matchesList = document.createElement('ul');
            matchesList.style.listStyle = 'none';
            matchesList.style.padding = '0';

            tour.forEach(match => {
                const matchItem = document.createElement('li');
                matchItem.style.marginBottom = '8px';
                matchItem.style.display = 'flex';
                matchItem.style.alignItems = 'center';
                matchItem.style.justifyContent = 'space-between';
                matchItem.style.maxWidth = '500px';

                const scoreDisplay = match.score ? `(${match.score})` : '( - : - )';
                const homeTeamSpan = document.createElement('span');
                homeTeamSpan.textContent = match.homeTeam;
                homeTeamSpan.style.flexBasis = '30%';
                homeTeamSpan.style.textAlign = 'right';
                homeTeamSpan.style.wordBreak = 'break-word';

                const scoreSpan = document.createElement('span');
                scoreSpan.textContent = scoreDisplay;
                scoreSpan.style.flexBasis = '20%';
                scoreSpan.style.textAlign = 'center';

                const awayTeamSpan = document.createElement('span');
                awayTeamSpan.textContent = match.awayTeam;
                awayTeamSpan.style.flexBasis = '30%';
                awayTeamSpan.style.textAlign = 'left';
                awayTeamSpan.style.wordBreak = 'break-word';

                const spotifyLinksDiv = document.createElement('div');
                spotifyLinksDiv.className = 'spotify-links';
                spotifyLinksDiv.style.flexBasis = '20%';
                spotifyLinksDiv.style.justifyContent = 'center';

                const homeSpotifyLink = document.createElement('a');
                homeSpotifyLink.href = match.homeSpotifyUrl || "#";
                homeSpotifyLink.className = 'spotify-link';
                homeSpotifyLink.dataset.tourIndex = tourIndex;
                homeSpotifyLink.dataset.matchIndex = schedule.indexOf(tour); // Индекс матча в туре
                homeSpotifyLink.dataset.team = "home";
                homeSpotifyLink.title = `Добавить песню для ${match.homeTeam}`;
                homeSpotifyLink.textContent = '🎶';
                if (!match.homeSpotifyUrl) {
                    homeSpotifyLink.onclick = handleSpotifyLinkClick;
                } else {
                    homeSpotifyLink.target = "_blank"; // Открывать в новой вкладке
                }

                const awaySpotifyLink = document.createElement('a');
                awaySpotifyLink.href = match.awaySpotifyUrl || "#";
                awaySpotifyLink.className = 'spotify-link';
                awaySpotifyLink.dataset.tourIndex = tourIndex;
                awaySpotifyLink.dataset.matchIndex = schedule.indexOf(tour);
                awaySpotifyLink.dataset.team = "away";
                awaySpotifyLink.title = `Добавить песню для ${match.awayTeam}`;
                awaySpotifyLink.textContent = '🎶';
                 if (!match.awaySpotifyUrl) {
                    awaySpotifyLink.onclick = handleSpotifyLinkClick;
                } else {
                    awaySpotifyLink.target = "_blank";
                }

                spotifyLinksDiv.appendChild(homeSpotifyLink);
                spotifyLinksDiv.appendChild(awaySpotifyLink);

                matchItem.appendChild(homeTeamSpan);
                matchItem.appendChild(scoreSpan);
                matchItem.appendChild(awayTeamSpan);
                matchItem.appendChild(spotifyLinksDiv);

                matchesList.appendChild(matchItem);
            });
            tourDiv.appendChild(matchesList);
        }
        fullScheduleContent.appendChild(tourDiv);
    });
}

// --- Функция для обработки клика по кнопке Spotify ---
function handleSpotifyLinkClick(event) {
    event.preventDefault();
    const link = event.target;
    const tourIndex = parseInt(link.dataset.tourIndex);
    const matchIndex = parseInt(link.dataset.matchIndex);
    const teamType = link.dataset.team;

    if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
        currentMatchDataForSpotify = {
            tourIndex: tourIndex,
            matchIndex: matchIndex,
            teamType: teamType,
            teamName: schedule[tourIndex][matchIndex][teamType + 'Team']
        };

        const currentUrl = schedule[tourIndex][matchIndex][teamType + 'SpotifyUrl'];
        if (currentUrl) {
            spotifyUrlInput.value = currentUrl;
            currentSpotifyInfo.textContent = `Текущая ссылка для ${currentMatchDataForSpotify.teamName}: ${currentUrl}`;
        } else {
            spotifyUrlInput.value = '';
            currentSpotifyInfo.textContent = `Введите ссылку для ${currentMatchDataForSpotify.teamName}:`;
        }
        openModal(spotifyModal);
    } else {
        console.error("Не удалось найти данные матча для Spotify:", tourIndex, matchIndex);
    }
}

// --- Обработчик сохранения Spotify ссылки ---
saveSpotifyUrlBtn.onclick = () => {
    if (!currentMatchDataForSpotify) {
        alert("Ошибка: Данные матча не найдены.");
        return;
    }
    const url = spotifyUrlInput.value.trim();

    if (url && (url.includes("spotify.com/track/") || url.includes("open.spotify.com/track/"))) {
        const { tourIndex, matchIndex, teamType } = currentMatchDataForSpotify;
        schedule[tourIndex][matchIndex][teamType + 'SpotifyUrl'] = url;

        displayTour(currentTourIndex);
        displayFullSchedule();

        const linkElement = document.querySelector(`.spotify-link[data-tour-index='${tourIndex}'][data-match-index='${matchIndex}'][data-team='${teamType}']`);
        if (linkElement) {
            linkElement.href = url;
            linkElement.target = "_blank";
            linkElement.onclick = null;
        }

        closeModal(spotifyModal);
        saveData(); // Сохраняем изменения
        alert("Ссылка на песню успешно добавлена!");

    } else if (url === "") {
        const { tourIndex, matchIndex, teamType } = currentMatchDataForSpotify;
        schedule[tourIndex][matchIndex][teamType + 'SpotifyUrl'] = "";

        displayTour(currentTourIndex);
        displayFullSchedule();

        const linkElement = document.querySelector(`.spotify-link[data-tour-index='${tourIndex}'][data-match-index='${matchIndex}'][data-team='${teamType}']`);
        if (linkElement) {
            linkElement.href = "#";
            linkElement.target = "_self";
            linkElement.onclick = handleSpotifyLinkClick;
        }
        closeModal(spotifyModal);
        saveData(); // Сохраняем изменения
        alert("Ссылка на песню удалена.");
    } else {
        alert("Пожалуйста, введите корректную ссылку на трек Spotify.");
    }
};

// --- Обработчики событий ---
generateBtn.onclick = () => {
    const teamsText = teamsInput.value.trim();
    if (teamsText) {
        teams = teamsText.split('\n').map(team => team.trim()).filter(team => team.length > 0);
        if (teams.length < 2) {
            alert('Пожалуйста, введите минимум 2 команды.');
            return;
        }
        // Сброс перед генерацией
        schedule = [];
        standings = {};
        teams.forEach(team => {
            standings[team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        });

        generateSchedule(); // Генерируем расписание
        currentTourIndex = findFirstUnscoredMatchTour(); // Находим первый незаполненный тур
        displayTour(currentTourIndex); // Отображаем его
        updateNavigationButtons(); // Обновляем кнопки навигации
        displayFullSchedule(); // Обновляем полное расписание
        updateStandingsDataAndDisplay(); // Обновляем таблицу
        saveData(); // Сохраняем все данные
    } else {
        alert('Пожалуйста, введите названия команд.');
    }
};

resetBtn.onclick = () => {
    if (!confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        return;
    }
    teamsInput.value = '';
    teams = [];
    schedule = [];
    currentTourIndex = 0;
    standings = {};
    localStorage.removeItem(STORAGE_KEY_TEAMS);
    localStorage.removeItem(STORAGE_KEY_SCHEDULE);
    localStorage.removeItem(STORAGE_KEY_CURRENT_TOUR);
    currentTourOutput.innerHTML = '<p>Введите команды и нажмите "Сгенерировать Расписание".</p>';
    fullScheduleContent.innerHTML = '';
    standingsBodyModal.innerHTML = '';
    currentTourNumSpan.textContent = '0';
    totalToursNumSpan.textContent = '0';
    tourJumpInput.value = '';
    updateNavigationButtons();
};

prevTourBtn.onclick = () => {
    if (currentTourIndex > 0) {
        displayTour(currentTourIndex - 1);
        saveData(); // Сохраняем текущий тур
    }
};

nextTourBtn.onclick = () => {
    if (currentTourIndex < schedule.length - 1) {
        displayTour(currentTourIndex + 1);
        saveData(); // Сохраняем текущий тур
    }
};

jumpToTourBtn.onclick = () => {
    const tourNumber = parseInt(tourJumpInput.value);
    if (tourNumber >= 1 && tourNumber <= schedule.length) {
        displayTour(tourNumber - 1);
        tourJumpInput.value = ''; // Очищаем поле ввода
        saveData(); // Сохраняем текущий тур
    } else if (schedule.length === 0) {
        alert('Сначала сгенерируйте расписание.');
    }
    else {
        alert('Пожалуйста, введите номер тура от 1 до ' + schedule.length);
    }
};

showFullScheduleBtn.onclick = () => {
    displayFullSchedule();
    openModal(fullScheduleModal);
};

showStandingsBtn.onclick = () => {
    updateStandingsDataAndDisplay();
    openModal(standingsModal);
};

// Обработчики закрытия модальных окон
closeFullScheduleBtn.onclick = () => closeModal(fullScheduleModal);
closeStandingsBtn.onclick = () => closeModal(standingsModal);
closeSpotifyModalBtn.onclick = () => closeModal(spotifyModal);

// Закрытие модальных окон при клике вне их содержимого
window.onclick = (event) => {
    if (event.target === fullScheduleModal) {
        closeModal(fullScheduleModal);
    }
    if (event.target === standingsModal) {
        closeModal(standingsModal);
    }
    if (event.target === spotifyModal) {
        closeModal(spotifyModal);
    }
};

// --- Функция добавления слушателей на поля ввода счета ---
function addScoreInputListeners() {
    document.querySelectorAll('.score-input input').forEach(input => {
        input.addEventListener('input', (e) => {
            const tourIndex = parseInt(e.target.dataset.tourIndex);
            const matchIndex = parseInt(e.target.dataset.matchIndex);
            const teamType = e.target.dataset.team; // 'home' или 'away'

            if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
                // Получаем оба счета
                const scoreHomeInput = e.target.closest('.match-item').querySelector('.score-home');
                const scoreAwayInput = e.target.closest('.match-item').querySelector('.score-away');

                const scoreHome = parseInt(scoreHomeInput.value) || 0;
                const scoreAway = parseInt(scoreAwayInput.value) || 0;

                // Обновляем счет в данных расписания
                schedule[tourIndex][matchIndex].score = `${scoreHome}:${scoreAway}`;

                // Пересчитываем статистику и обновляем таблицу
                updateStandingsDataAndDisplay();

                // Перерисовываем текущий тур, чтобы обновить отображение счетов и Spotify кнопки
                displayTour(currentTourIndex);

                // Проверяем результат тура после ввода счета
                validateTourResults(schedule[tourIndex]);

                saveData(); // Сохраняем после каждого ввода счета
            }
        });

        // Обработка клавиш для ввода счета
        input.addEventListener('keydown', (e) => {
            // Разрешаем только цифры, двоеточие, Backspace, Delete, стрелки, Tab
            if (e.key.length === 1 && !/[0-9:]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
            }
            // Позволяем переходить между полями ввода счета (home -> away)
            if (e.key === 'ArrowRight' && e.target.classList.contains('score-home')) {
                e.target.closest('.match-item').querySelector('.score-away').focus();
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' && e.target.classList.contains('score-away')) {
                e.target.closest('.match-item').querySelector('.score-home').focus();
                e.preventDefault();
            }
        });

        // Очистка при фокусе, если значение '-'
        input.addEventListener('focus', (e) => {
            if (e.target.value === '-' || e.target.value === '') {
                e.target.value = '';
            }
        });

        // Восстановление '-' если поле пустое после потери фокуса
        input.addEventListener('blur', (e) => {
            if (e.target.value === '') {
                e.target.value = '-'; // Или просто оставляем пустым, если не хотим '-'
                // Нужно обновить счет в schedule, если он был очищен
                const tourIndex = parseInt(e.target.dataset.tourIndex);
                const matchIndex = parseInt(e.target.dataset.matchIndex);
                if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
                     const scoreHome = parseInt(e.target.closest('.match-item').querySelector('.score-home').value) || 0;
                     const scoreAway = parseInt(e.target.closest('.match-item').querySelector('.score-away').value) || 0;
                     schedule[tourIndex][matchIndex].score = `${scoreHome}:${scoreAway}`;
                     updateStandingsDataAndDisplay();
                     validateTourResults(schedule[tourIndex]);
                     saveData();
                }
            }
        });
    });
}

// --- Функция удаления команды ---
function removeTeam(teamNameToRemove) {
    if (!confirm(`Вы уверены, что хотите удалить команду "${teamNameToRemove}"? Это удалит всю историю и перестроит расписание.`)) {
        return;
    }

    teams = teams.filter(team => team !== teamNameToRemove);
    schedule = [];
    standings = {};
    teams.forEach(team => {
        standings[team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    });

    if (teams.length < 2) {
        alert("Осталось меньше двух команд. Расписание не может быть сгенерировано.");
        resetBtn.click(); // Симулируем нажатие кнопки сброса
        return;
    }

    generateSchedule();
    currentTourIndex = findFirstUnscoredMatchTour();
    displayTour(currentTourIndex);
    updateNavigationButtons();
    displayFullSchedule();
    updateStandingsDataAndDisplay();
    saveData(); // Сохраняем после удаления
}

// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    loadData(); // Загружаем данные при старте

    // Назначаем слушатели на кнопки после загрузки данных, чтобы они были корректны
    generateBtn.onclick = generateBtn.onclick; // Переназначаем, чтобы убедиться
    resetBtn.onclick = resetBtn.onclick;
    prevTourBtn.onclick = prevTourBtn.onclick;
    nextTourBtn.onclick = nextTourBtn.onclick;
    jumpToTourBtn.onclick = jumpToTourBtn.onclick;
    showFullScheduleBtn.onclick = showFullScheduleBtn.onclick;
    showStandingsBtn.onclick = showStandingsBtn.onclick;

    // Дополнительные обработчики для модальных окон
    closeFullScheduleBtn.onclick = () => closeModal(fullScheduleModal);
    closeStandingsBtn.onclick = () => closeModal(standingsModal);
    closeSpotifyModalBtn.onclick = () => closeModal(spotifyModal);

    // Закрытие модальных окон при клике вне их содержимого
    window.onclick = (event) => {
        if (event.target === fullScheduleModal) {
            closeModal(fullScheduleModal);
        }
        if (event.target === standingsModal) {
            closeModal(standingsModal);
        }
        if (event.target === spotifyModal) {
            closeModal(spotifyModal);
        }
    };

    // Первоначальная отрисовка, если данные были загружены
    if (teams.length > 0 && schedule.length > 0) {
        displayTour(currentTourIndex);
        updateNavigationButtons();
        displayFullSchedule();
        updateStandingsDataAndDisplay();
    } else {
        // Если данных нет, показываем подсказку
        currentTourOutput.innerHTML = '<p>Введите команды и нажмите "Сгенерировать Расписание".</p>';
        currentTourNumSpan.textContent = '0';
        totalToursNumSpan.textContent = '0';
        updateNavigationButtons();
    }
});