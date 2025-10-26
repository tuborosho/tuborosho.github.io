/* style.css */
body {
    font-family: Arial, sans-serif;
    background-color: #1a1a1a;
    margin: 0;
    padding: 20px;
    color: #ffffff;
    line-height: 1.6;
}

.container {
    background-color: #2a2a2a;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    max-width: 960px;
    margin: 20px auto;
}

h1, h2, h3 {
    color: #ff9933;
    text-align: center;
    margin-bottom: 20px;
}

h2 {
    margin-top: 30px;
}

button {
    background-color: #ff9933;
    color: #1a1a1a;
    border: none;
    padding: 10px 15px;
    margin: 5px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: bold;
}

button:hover {
    background-color: #e68a00;
}

button:disabled {
    background-color: #666;
    cursor: not-allowed;
}

.reset-button {
    background-color: #cc0000;
    color: white;
}

.reset-button:hover {
    background-color: #a30000;
}

textarea, input[type="number"], input[type="text"] {
    width: calc(100% - 20px);
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #555;
    border-radius: 5px;
    background-color: #333;
    color: #eee;
    box-sizing: border-box;
}

input[type="number"] {
    width: 50px;
    text-align: center;
    padding: 5px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

th, td {
    border: 1px solid #555;
    padding: 10px;
    text-align: center;
}

th {
    background-color: #444;
    color: #ff9933;
    font-weight: bold;
}

td {
    background-color: #3a3a3a;
}

.input-section, .schedule-control {
    background-color: #333;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 25px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.4);
}

.input-section label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
}

.input-section textarea {
    min-height: 100px;
}

.input-section button, .schedule-control button {
    display: inline-block;
    margin-right: 10px;
}

.schedule-control h2 {
    margin-top: 0;
}

.tour-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
}

.tour-navigation span {
    margin: 0 5px;
    font-weight: bold;
}

.tour-navigation input[type="number"] {
    width: 70px;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.7);
}

.modal-content {
    background-color: #2a2a2a;
    margin: 5% auto;
    padding: 25px;
    border: 1px solid #888;
    width: 80%;
    max-width: 700px;
    border-radius: 8px;
    position: relative;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.close-button {
    color: #aaa;
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.3s ease;
}

.close-button:hover,
.close-button:focus {
    color: #fff;
    text-decoration: none;
}

.relegation-zone {
    background-color: #8B0000 !important;
    color: white !important;
}

.playoff-zone {
    background-color: #FFD700 !important;
    color: #1a1a1a !important;
}

/* Стили для Spotify ссылок */
.spotify-link-home {
    color: #1db954;
    text-decoration: none;
    font-weight: bold;
    font-size: 18px;
    margin: 0 5px;
    transition: color 0.3s ease;
    order: 1;
}

.spotify-link-away {
    color: #1db954;
    text-decoration: none;
    font-weight: bold;
    font-size: 18px;
    margin: 0 5px;
    transition: color 0.3s ease;
    order: 4;
}

.spotify-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 50px;
}

.schedule-section .matches-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.schedule-section .match-item {
    background-color: #3a3a3a;
    padding: 15px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.match-item .team-name {
    flex-basis: 30%;
    text-align: center;
    font-weight: bold;
    word-break: break-word;
}

.match-item .score-input {
    flex-basis: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

.match-item .score-input input[type="number"] {
    width: 45px;
    padding: 5px;
    margin: 0;
    text-align: center;
    background-color: #444;
    border: 1px solid #666;
}

.match-item .score-input span {
    font-size: 1.2em;
}

.remove-team-btn {
    background-color: transparent;
    border: none;
    color: #ff6666;
    font-size: 1.2em;
    cursor: pointer;
    margin-right: 5px;
    padding: 0;
    transition: transform 0.2s ease;
    flex-shrink: 0;
}

.remove-team-btn:hover {
    transform: scale(1.2);
    color: #ff3333;
}

#spotifyModal .modal-content p {
    margin-bottom: 15px;
    font-size: 0.95em;
    color: #ccc;
}

#spotifyModal .modal-content h2 {
    margin-top: 0;
    margin-bottom: 20px;
}

#spotifyModal #saveSpotifyUrlBtn {
    width: 100%;
    margin-top: 15px;
}

#showStandingsBtn {
    background-color: #007bff;
    color: white;
}

#showStandingsBtn:hover {
    background-color: #0056b3;
}

.hidden {
    display: none !important;
}
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

            // Формируем HTML для матча с измененным расположением Spotify иконок
            matchElement.innerHTML = `
                <a href="#" class="spotify-link-home" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="home" title="Добавить песню">🎶</a>
                <span class="team-name">${match.homeTeam}</span>
                <div class="score-input">
                    <input type="number" class="score-home" min="0" max="10" value="${match.homeScore || ''}" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="home" placeholder="-">
                    <span>:</span>
                    <input type="number" class="score-away" min="0" max="10" value="${match.awayScore || ''}" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="away" placeholder="-">
                </div>
                <span class="team-name">${match.awayTeam}</span>
                <a href="#" class="spotify-link-away" data-tour-index="${tourIndex}" data-match-index="${matchIndex}" data-team="away" title="Добавить песню">🎶</a>
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
                homeSpotifyLink.className = 'spotify-link-home'; // Используем новый класс
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
                awaySpotifyLink.className = 'spotify-link-away'; // Используем новый класс
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

                tourDiv.appendChild(matchItem); // Вставляем matchItem в tourDiv
            });
            fullScheduleContent.appendChild(tourDiv); // Добавляем tourDiv в fullScheduleContent
        }
        fullScheduleContent.appendChild(tourDiv); // Добавляем tourDiv в fullScheduleContent
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

        // Находим правильный элемент ссылки
        const linkElement = document.querySelector(`.spotify-link-${teamType}[data-tour-index='${tourIndex}'][data-match-index='${matchIndex}']`);
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

        const linkElement = document.querySelector(`.spotify-link-${teamType}[data-tour-index='${tourIndex}'][data-match-index='${matchIndex}']`);
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

// --- Функция добавления слушателей на поля ввода счета ---
function addScoreInputListeners() {
    document.querySelectorAll('.score-input input').forEach(input => {
        // Обработчик ввода счета
        input.addEventListener('input', (e) => {
            const tourIndex = parseInt(e.target.dataset.tourIndex);
            const matchIndex = parseInt(e.target.dataset.matchIndex);
            const teamType = e.target.dataset.team; // 'home' или 'away'

            if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
                // Получаем оба счета, преобразуя в числа, или 0 если ввод некорректен/пуст
                const scoreHomeInput = e.target.closest('.match-item').querySelector('.score-home');
                const scoreAwayInput = e.target.closest('.match-item').querySelector('.score-away');

                // Проверяем, что значение является числом, иначе ставим 0
                const scoreHome = parseInt(scoreHomeInput.value) >= 0 ? parseInt(scoreHomeInput.value) : 0;
                const scoreAway = parseInt(scoreAwayInput.value) >= 0 ? parseInt(scoreAwayInput.value) : 0;

                // Обновляем счет в данных расписания
                schedule[tourIndex][matchIndex].score = `${scoreHome}:${scoreAway}`;

                // Перерисовываем текущий тур, чтобы обновить отображение счетов и Spotify кнопки
                displayTour(currentTourIndex);

                // Проверяем результат тура после ввода счета
                validateTourResults(schedule[tourIndex]);

                // Пересчитываем статистику и обновляем таблицу
                updateStandingsDataAndDisplay();

                saveData(); // Сохраняем после каждого ввода счета
            }
        });

        // Обработка клавиш для ввода счета (разрешаем только цифры)
        input.addEventListener('keydown', (e) => {
            if (e.key.length === 1 && !/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
            }
            // Позволяем переходить между полями ввода счета (home -> away)
            if (e.key === 'ArrowRight' && e.target.classList.contains('score-home')) {
                e.target.closest('.match-item').querySelector('.score-away').focus();
                e.preventDefault();
            }
            // Позволяем переходить между полями ввода счета (away -> home)
            if (e.key === 'ArrowLeft' && e.target.classList.contains('score-away')) {
                e.target.closest('.match-item').querySelector('.score-home').focus();
                e.preventDefault();
            }
        });

        // Очистка поля при фокусе, если значение '-'
        input.addEventListener('focus', (e) => {
            if (e.target.value === '-') {
                e.target.value = '';
            }
        });

        // Установка '-' или 0, если поле пустое после потери фокуса
        input.addEventListener('blur', (e) => {
            const tourIndex = parseInt(e.target.dataset.tourIndex);
            const matchIndex = parseInt(e.target.dataset.matchIndex);
            const teamType = e.target.dataset.team;

            if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
                const scoreHomeInput = e.target.closest('.match-item').querySelector('.score-home');
                const scoreAwayInput = e.target.closest('.match-item').querySelector('.score-away');

                // Получаем актуальные значения счетов, преобразуя их в числа (или 0, если пусто)
                const scoreHome = parseInt(scoreHomeInput.value) >= 0 ? parseInt(scoreHomeInput.value) : 0;
                const scoreAway = parseInt(scoreAwayInput.value) >= 0 ? parseInt(scoreAwayInput.value) : 0;

                // Обновляем счет в schedule
                schedule[tourIndex][matchIndex].score = `${scoreHome}:${scoreAway}`;

                // Если оба поля были пустыми, устанавливаем '-'
                if (scoreHomeInput.value === '' && scoreAwayInput.value === '') {
                    scoreHomeInput.value = '-';
                    scoreAwayInput.value = '-';
                    schedule[tourIndex][matchIndex].score = ""; // Сбрасываем счет, если оба поля пустые
                } else {
                    // Если одно из полей было пустым, устанавливаем '0'
                    if (scoreHomeInput.value === '') scoreHomeInput.value = '0';
                    if (scoreAwayInput.value === '') scoreAwayInput.value = '0';
                }

                // Обновляем статистику и таблицу
                updateStandingsDataAndDisplay();
                validateTourResults(schedule[tourIndex]);
                saveData();
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

