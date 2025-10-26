let teams = []; // Массив названий команд
let schedule = []; // Массив туров, каждый тур - массив матчей
let currentTourIndex = 0; // Индекс текущего отображаемого тура
let standings = {}; // Объект для хранения статистики команд (И, В, Н, П, ЗГ, ПГ, Очки)
let currentMatchDataForSpotify = null; // Для хранения данных о матче, для которого добавляется Spotify ссылка

// --- Константы ---
const MAX_UNIQUE_DRAWS_PER_TOUR = 1; // Максимум 1:1 за тур
const MAX_LARGE_WINS_PER_TOUR = 6; // Максимум 4:0 / 0:4 / 3:1 / 1:3 за тур
const RELEGATION_ZONE_START = 121; // Начало зоны вылета
const PLAYOFF_ZONE_START = 101; // Начало зоны стыков

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
        updateNavigationButtons(); // Обновляем кнопки на всякий случай
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
    currentTourOutput.appendChild(validationMessageDiv);

    const tourMatchesDiv = document.createElement('div');
    tourMatchesDiv.className = 'matches-list';

    if (matches.length === 0) {
        tourMatchesDiv.innerHTML = '<p>Матчей в этом туре нет.</p>';
    } else {
        matches.forEach((match, matchIndex) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match-item';

            // Добавляем кнопку удаления команды
            const removeHomeTeamBtn = document.createElement('button');
            removeHomeTeamBtn.className = 'remove-team-btn';
            removeHomeTeamBtn.innerHTML = '❌️';
            removeHomeTeamBtn.title = `Удалить команду ${match.homeTeam}`;
            removeHomeTeamBtn.onclick = (e) => {
                e.preventDefault(); // Предотвращаем стандартное действие кнопки
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
    const numMatchesPerRound = numTeams / 2; // Количество матчей в каждом раунде

    // Создаем копию команд, чтобы не изменять исходный массив
    let currentTeams = [...teams];

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

    // Если количество команд нечетное, добавляем "мертвую" команду (bye)
    if (numTeams % 2 !== 0) {
        teams.push("BYE"); // Добавляем "мертвую" команду
        // Нужно будет перегенерировать расписание с учетом "BYE"
        // Сейчас просто добавим как есть, но это требует более сложной логики
        // Для простоты, пока проигнорируем эту часть, т.к. ваш пример с 149 турами намекает на четное число команд
        console.warn("Нечетное количество команд. Логика добавления 'BYE' команды не полностью реализована.");
    }

    // Если количество команд большое, можем генерировать матчи для всех туров сразу
    // В данном случае, 149 туров предполагает много команд.
    // Для простоты, assumed что `schedule` уже содержит все матчи.
    // Если нужно генерировать динамически, логика будет сложнее.
    // Для демонстрации, используем алгоритм Round Robin.
}

// --- Функции для обновления статистики и турнирной таблицы ---
function updateStandings() {
    // Сбрасываем статистику перед пересчетом
    teams.forEach(team => {
        if (team !== "BYE") { // Игнорируем "BYE" команду, если она есть
            standings[team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        }
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
                    if (homeTeam !== "BYE") {
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
                    }

                    // Обновляем статистику для гостевой команды
                    if (awayTeam !== "BYE") {
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
        if (teamName === "BYE") return; // Пропускаем "BYE" команду

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

                const scoreSpan = document.createElement('span');
                scoreSpan.textContent = scoreDisplay;
                scoreSpan.style.flexBasis = '20%';
                scoreSpan.style.textAlign = 'center';

                const awayTeamSpan = document.createElement('span');
                awayTeamSpan.textContent = match.awayTeam;
                awayTeamSpan.style.flexBasis = '30%';
                awayTeamSpan.style.textAlign = 'left';

                // Создаем div для Spotify ссылок
                const spotifyLinksDiv = document.createElement('div');
                spotifyLinksDiv.className = 'spotify-links';
                spotifyLinksDiv.style.flexBasis = '20%';
                spotifyLinksDiv.style.justifyContent = 'center'; // Центрируем кнопки 🎶

                const homeSpotifyLink = document.createElement('a');
                homeSpotifyLink.href = "#"; // Ссылка будет назначена позже
                homeSpotifyLink.className = 'spotify-link';
                homeSpotifyLink.dataset.tourIndex = tourIndex;
                homeSpotifyLink.dataset.matchIndex = schedule.indexOf(tour); // Индекс матча в туре
                homeSpotifyLink.dataset.team = "home";
                homeSpotifyLink.title = `Добавить песню для ${match.homeTeam}`;
                homeSpotifyLink.textContent = '🎶';
                if (match.homeSpotifyUrl) {
                    homeSpotifyLink.href = match.homeSpotifyUrl;
                    homeSpotifyLink.target = "_blank"; // Открывать в новой вкладке
                } else {
                    homeSpotifyLink.onclick = handleSpotifyLinkClick; // Добавляем обработчик клика
                }

                const awaySpotifyLink = document.createElement('a');
                awaySpotifyLink.href = "#";
                awaySpotifyLink.className = 'spotify-link';
                awaySpotifyLink.dataset.tourIndex = tourIndex;
                awaySpotifyLink.dataset.matchIndex = schedule.indexOf(tour);
                awaySpotifyLink.dataset.team = "away";
                awaySpotifyLink.title = `Добавить песню для ${match.awayTeam}`;
                awaySpotifyLink.textContent = '🎶';
                 if (match.awaySpotifyUrl) {
                    awaySpotifyLink.href = match.awaySpotifyUrl;
                    awaySpotifyLink.target = "_blank";
                } else {
                    awaySpotifyLink.onclick = handleSpotifyLinkClick;
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
    event.preventDefault(); // Предотвращаем переход по ссылке '#'
    const link = event.target;
    const tourIndex = parseInt(link.dataset.tourIndex);
    const matchIndex = parseInt(link.dataset.matchIndex); // Индекс матча в массиве тура
    const teamType = link.dataset.team; // 'home' или 'away'

    // Находим соответствующий матч
    if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
        currentMatchDataForSpotify = {
            tourIndex: tourIndex,
            matchIndex: matchIndex,
            teamType: teamType,
            teamName: schedule[tourIndex][matchIndex][teamType + 'Team']
        };

        // Показываем текущую ссылку, если она есть
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

    // Простая валидация URL (можно сделать строже)
    if (url && (url.includes("spotify.com/track/") || url.includes("open.spotify.com/track/"))) {
        const { tourIndex, matchIndex, teamType } = currentMatchDataForSpotify;
        schedule[tourIndex][matchIndex][teamType + 'SpotifyUrl'] = url;

        // Обновляем отображение в текущем туре и полном расписании
        displayTour(currentTourIndex); // Перерисовываем текущий тур
        displayFullSchedule(); // Перерисовываем полное расписание

        // Делаем ссылку кликабельной, если она добавлена
        const linkElement = document.querySelector(`.spotify-link[data-tour-index='${tourIndex}'][data-match-index='${matchIndex}'][data-team='${teamType}']`);
        if (linkElement) {
            linkElement.href = url;
            linkElement.target = "_blank";
            linkElement.onclick = null; // Убираем обработчик, так как теперь это ссылка
        }

        closeModal(spotifyModal);
        alert("Ссылка на песню успешно добавлена!");

    } else if (url === "") { // Если поле пустое, считаем удалением ссылки
        const { tourIndex, matchIndex, teamType } = currentMatchDataForSpotify;
        schedule[tourIndex][matchIndex][teamType + 'SpotifyUrl'] = "";

        displayTour(currentTourIndex);
        displayFullSchedule();

        const linkElement = document.querySelector(`.spotify-link[data-tour-index='${tourIndex}'][data-match-index='${matchIndex}'][data-team='${teamType}']`);
        if (linkElement) {
            linkElement.href = "#";
            linkElement.target = "_self";
            linkElement.onclick = handleSpotifyLinkClick; // Возвращаем обработчик
        }
        closeModal(spotifyModal);
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
    } else {
        alert('Пожалуйста, введите названия команд.');
    }
};

resetBtn.onclick = () => {
    teamsInput.value = '';
    teams = [];
    schedule = [];
    currentTourIndex = 0;
    standings = {};
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
    }
};

nextTourBtn.onclick = () => {
    if (currentTourIndex < schedule.length - 1) {
        displayTour(currentTourIndex + 1);
    }
};

jumpToTourBtn.onclick = () => {
    const tourNumber = parseInt(tourJumpInput.value);
    if (tourNumber >= 1 && tourNumber <= schedule.length) {
        displayTour(tourNumber - 1);
        tourJumpInput.value = ''; // Очищаем поле ввода
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
                const scoreHome = parseInt(e.target.closest('.match-item').querySelector('.score-home').value) || 0;
                const scoreAway = parseInt(e.target.closest('.match-item').querySelector('.score-away').value) || 0;

                // Обновляем счет в данных расписания
                schedule[tourIndex][matchIndex].score = `${scoreHome}:${scoreAway}`;

                // Пересчитываем статистику и обновляем таблицу
                updateStandingsDataAndDisplay();

                // Перерисовываем текущий тур, чтобы обновить отображение счетов и Spotify кнопки
                displayTour(currentTourIndex);

                // Проверяем результат тура после ввода счета
                validateTourResults(schedule[tourIndex]);

                // Если счет введен, возможно, стоит перейти к следующему незаполненному матчу
                // Это может быть сделано здесь, или при нажатии "Следующий тур"
            }
        });

        // Ограничение ввода только цифр (на всякий случай, хотя type="number" уже это делает)
        input.addEventListener('keydown', (e) => {
            if (e.key.length === 1 && !/[0-9]/.test(e.key) && e.key !== ':' && e.key !== '-' && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                e.preventDefault();
            }
        });
    });
}

// --- Функция удаления команды ---
function removeTeam(teamNameToRemove) {
    if (!confirm(`Вы уверены, что хотите удалить команду "${teamNameToRemove}"? Это удалит всю историю и перестроит расписание.`)) {
        return;
    }

    // 1. Удаляем команду из основного массива `teams`
    teams = teams.filter(team => team !== teamNameToRemove);

    // 2. Очищаем и перегенерируем расписание
    schedule = []; // Очищаем старое расписание
    standings = {}; // Очищаем статистику

    // Пересоздаем объект standings для оставшихся команд
    teams.forEach(team => {
        standings[team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    });

    if (teams.length < 2) {
        alert("Осталось меньше двух команд. Расписание не может быть сгенерировано.");
        // Сбрасываем все поля, так как расписание больше не нужно
        resetBtn.click(); // Симулируем нажатие кнопки сброса
        return;
    }

    generateSchedule(); // Генерируем новое расписание
    currentTourIndex = findFirstUnscoredMatchTour(); // Находим первый незаполненный тур в новом расписании
    displayTour(currentTourIndex); // Отображаем его
    updateNavigationButtons(); // Обновляем кнопки навигации
    displayFullSchedule(); // Обновляем полное расписание
    updateStandingsDataAndDisplay(); // Обновляем таблицу
}

// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    // Начальное состояние кнопок навигации
    updateNavigationButtons();

    // Проверяем, есть ли уже сохраненные команды (например, из LocalStorage)
    // В данном примере, предполагаем, что `teams` пуст и нужно ввести команды
    if (teams.length > 0) {
        // Если команды есть, генерируем и отображаем
        generateSchedule();
        currentTourIndex = findFirstUnscoredMatchTour();
        displayTour(currentTourIndex);
        updateNavigationButtons();
        displayFullSchedule();
        updateStandingsDataAndDisplay();
    } else {
        // Если команд нет, показываем подсказку
        currentTourOutput.innerHTML = '<p>Введите команды и нажмите "Сгенерировать Расписание".</p>';
        currentTourNumSpan.textContent = '0';
        totalToursNumSpan.textContent = '0';
    }
});