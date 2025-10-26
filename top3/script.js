// --- Глобальные переменные ---
let teams = [];
let schedule = [];
let currentTourIndex = 0;
let standings = {};
let currentMatchDataForSpotify = null;

// --- Константы ---
const MAX_UNIQUE_DRAWS_PER_TOUR = 1;
const MAX_LARGE_WINS_PER_TOUR = 6;
const RELEGATION_ZONE_START = 121;
const PLAYOFF_ZONE_START = 101;
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
}

function loadData() {
    const savedTeams = localStorage.getItem(STORAGE_KEY_TEAMS);
    const savedSchedule = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    const savedCurrentTourIndex = localStorage.getItem(STORAGE_KEY_CURRENT_TOUR);

    if (savedTeams) {
        teams = JSON.parse(savedTeams);
        teamsInput.value = teams.join('\n');
    }
    if (savedSchedule) {
        schedule = JSON.parse(savedSchedule);
    }
    if (savedCurrentTourIndex) {
        currentTourIndex = parseInt(savedCurrentTourIndex, 10);
    } else {
        currentTourIndex = 0;
    }

    if (teams.length > 0 && schedule.length > 0) {
        updateStandings();
        displayTour(currentTourIndex);
        updateNavigationButtons();
        displayFullSchedule();
        updateStandingsDataAndDisplay();
    } else {
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
    currentMatchDataForSpotify = null;
    spotifyUrlInput.value = '';
    currentSpotifyInfo.textContent = '';
}

// --- Функции для отрисовки и управления турами ---
function displayTour(tourIndex) {
    currentTourIndex = tourIndex;
    if (currentTourNumSpan) currentTourNumSpan.textContent = tourIndex + 1;
    if (totalToursNumSpan) totalToursNumSpan.textContent = schedule.length;

    currentTourOutput.innerHTML = '';

    if (tourIndex < 0 || tourIndex >= schedule.length) {
        currentTourOutput.innerHTML = '<p>Тур не найден.</p>';
        updateNavigationButtons();
        return;
    }

    const matches = schedule[tourIndex];
    const tourTitle = document.createElement('h3');
    tourTitle.textContent = `Тур ${tourIndex + 1}`;
    currentTourOutput.appendChild(tourTitle);

    const validationMessageDiv = document.createElement('div');
    validationMessageDiv.id = 'validationMessage';
    validationMessageDiv.style.color = 'orange';
    validationMessageDiv.style.marginBottom = '10px';
    validationMessageDiv.style.textAlign = 'center';
    currentTourOutput.appendChild(validationMessageDiv);

    const tourMatchesDiv = document.createElement('div');
    tourMatchesDiv.className = 'matches-list';

    if (matches.length === 0) {
        tourMatchesDiv.innerHTML = '<p>Матчей в этом туре нет.</p>';
    } else {
        matches.forEach((match, matchIndex) => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match-item';

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

            matchElement.prepend(removeHomeTeamBtn);
            matchElement.querySelector('.team-name:last-of-type').parentNode.insertBefore(removeAwayTeamBtn, matchElement.querySelector('.team-name:last-of-type').nextSibling);

            tourMatchesDiv.appendChild(matchElement);
        });
    }
    currentTourOutput.appendChild(tourMatchesDiv);

    addScoreInputListeners();
    validateTourResults(matches);
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
        if (tour.some(match => !match.score || match.score === "")) {
            return i;
        }
    }
    return 0;
}

// --- Функции для генерации расписания ---
function generateSchedule() {
    schedule = [];
    const numTeams = teams.length;
    const numRounds = numTeams - 1;
    const numMatchesPerRound = Math.floor(numTeams / 2);

    let currentTeams = [...teams];

    for (let round = 0; round < numRounds; round++) {
        const currentRoundMatches = [];
        for (let i = 0; i < numMatchesPerRound; i++) {
            const homeTeam = currentTeams[i];
            const awayTeam = currentTeams[numTeams - 1 - i];
            currentRoundMatches.push({
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                score: "",
                homeSpotifyUrl: "",
                awaySpotifyUrl: ""
            });
        }
        schedule.push(currentRoundMatches);

        const firstTeam = currentTeams[0];
        const rotatingTeams = currentTeams.slice(1);
        const lastTeam = rotatingTeams.pop();
        currentTeams = [firstTeam, lastTeam, ...rotatingTeams];
    }
}

// --- Функции для обновления статистики и турнирной таблицы ---
function updateStandings() {
    teams.forEach(team => {
        standings[team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    });

    schedule.forEach(tour => {
        tour.forEach(match => {
            if (match.score && match.score !== "") {
                const scores = match.score.split(':').map(Number);
                if (scores.length === 2) {
                    const homeScore = scores[0];
                    const awayScore = scores[1];
                    const homeTeam = match.homeTeam;
                    const awayTeam = match.awayTeam;

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

    if (schedule[currentTourIndex]) {
        validateTourResults(schedule[currentTourIndex]);
    }
}

function displayStandingsInModal() {
    standingsBodyModal.innerHTML = '';

    const sortedStandings = Object.entries(standings).sort(([teamA_name, teamA_data], [teamB_name, teamB_data]) => {
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
        const position = index + 1;

        row.innerHTML = `
            <td>${position}</td>
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

        if (position >= RELEGATION_ZONE_START && position <= RELEGATION_ZONE_START + 29) {
            row.classList.add('relegation-zone');
        } else if (position >= PLAYOFF_ZONE_START && position <= PLAYOFF_ZONE_START + 19) {
            row.classList.add('playoff-zone');
        }
    });
}

function updateStandingsDataAndDisplay() {
    updateStandings();
    displayStandingsInModal();
}

// --- Функции для валидации результатов тура ---
function validateTourResults(tourMatches) {
    let drawCount1_1 = 0;
    let largeWinCount = 0;

    tourMatches.forEach(match => {
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
    fullScheduleContent.innerHTML = '';

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
                homeSpotifyLink.className = 'spotify-link-home';
                homeSpotifyLink.dataset.tourIndex = tourIndex;
                homeSpotifyLink.dataset.matchIndex = schedule.indexOf(tour);
                homeSpotifyLink.dataset.team = "home";
                homeSpotifyLink.title = `Добавить песню для ${match.homeTeam}`;
                homeSpotifyLink.textContent = '🎶';
                if (!match.homeSpotifyUrl) {
                    homeSpotifyLink.onclick = handleSpotifyLinkClick;
                } else {
                    homeSpotifyLink.target = "_blank";
                }

                const awaySpotifyLink = document.createElement('a');
                awaySpotifyLink.href = match.awaySpotifyUrl || "#";
                awaySpotifyLink.className = 'spotify-link-away';
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

                tourDiv.appendChild(matchItem);
            });
            fullScheduleContent.appendChild(tourDiv);
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

        const linkElement = document.querySelector(`.spotify-link-${teamType}[data-tour-index='${tourIndex}'][data-match-index='${matchIndex}']`);
        if (linkElement) {
            linkElement.href = url;
            linkElement.target = "_blank";
            linkElement.onclick = null;
        }

        closeModal(spotifyModal);
        saveData();
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
        saveData();
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
        schedule = [];
        standings = {};
        teams.forEach(team => {
            standings[team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        });

        generateSchedule();
        currentTourIndex = findFirstUnscoredMatchTour();
        displayTour(currentTourIndex);
        updateNavigationButtons();
        displayFullSchedule();
        updateStandingsDataAndDisplay();
        saveData();
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
        saveData();
    }
};

nextTourBtn.onclick = () => {
    if (currentTourIndex < schedule.length - 1) {
        displayTour(currentTourIndex + 1);
        saveData();
    }
};

jumpToTourBtn.onclick = () => {
    const tourNumber = parseInt(tourJumpInput.value);
    if (tourNumber >= 1 && tourNumber <= schedule.length) {
        displayTour(tourNumber - 1);
        tourJumpInput.value = '';
        saveData();
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
        input.addEventListener('input', (e) => {
            const tourIndex = parseInt(e.target.dataset.tourIndex);
            const matchIndex = parseInt(e.target.dataset.matchIndex);
            const teamType = e.target.dataset.team;

            if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
                const scoreHomeInput = e.target.closest('.match-item').querySelector('.score-home');
                const scoreAwayInput = e.target.closest('.match-item').querySelector('.score-away');

                const scoreHome = parseInt(scoreHomeInput.value) >= 0 ? parseInt(scoreHomeInput.value) : 0;
                const scoreAway = parseInt(scoreAwayInput.value) >= 0 ? parseInt(scoreAwayInput.value) : 0;

                schedule[tourIndex][matchIndex].score = `${scoreHome}:${scoreAway}`;

                displayTour(currentTourIndex);
                validateTourResults(schedule[tourIndex]);
                updateStandingsDataAndDisplay();
                saveData();
            }
        });

        // Обработка клавиш для ввода счета (разрешаем только цифры)
        input.addEventListener('keydown', (e) => {
            if (e.key.length === 1 && !/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' && e.target.classList.contains('score-home')) {
                e.target.closest('.match-item').querySelector('.score-away').focus();
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' && e.target.classList.contains('score-away')) {
                e.target.closest('.match-item').querySelector('.score-home').focus();
                e.preventDefault();
            }
        });

        input.addEventListener('focus', (e) => {
            if (e.target.value === '-') {
                e.target.value = '';
            }
        });

        input.addEventListener('blur', (e) => {
            const tourIndex = parseInt(e.target.dataset.tourIndex);
            const matchIndex = parseInt(e.target.dataset.matchIndex);
            const teamType = e.target.dataset.team;

            if (schedule[tourIndex] && schedule[tourIndex][matchIndex]) {
                const scoreHomeInput = e.target.closest('.match-item').querySelector('.score-home');
                const scoreAwayInput = e.target.closest('.match-item').querySelector('.score-away');

                const scoreHome = parseInt(scoreHomeInput.value) >= 0 ? parseInt(scoreHomeInput.value) : 0;
                const scoreAway = parseInt(scoreAwayInput.value) >= 0 ? parseInt(scoreAwayInput.value) : 0;

                schedule[tourIndex][matchIndex].score = `${scoreHome}:${scoreAway}`;

                if (scoreHomeInput.value === '' && scoreAwayInput.value === '') {
                    scoreHomeInput.value = '-';
                    scoreAwayInput.value = '-';
                    schedule[tourIndex][matchIndex].score = "";
                } else {
                    if (scoreHomeInput.value === '') scoreHomeInput.value = '0';
                    if (scoreAwayInput.value === '') scoreAwayInput.value = '0';
                }

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
        resetBtn.click();
        return;
    }

    generateSchedule();
    currentTourIndex = findFirstUnscoredMatchTour();
    displayTour(currentTourIndex);
    updateNavigationButtons();
    displayFullSchedule();
    updateStandingsDataAndDisplay();
    saveData();
}

// --- Инициализация при загрузке страницы ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    generateBtn.onclick = generateBtn.onclick;
    resetBtn.onclick = resetBtn.onclick;
    prevTourBtn.onclick = prevTourBtn.onclick;
    nextTourBtn.onclick = nextTourBtn.onclick;
    jumpToTourBtn.onclick = jumpToTourBtn.onclick;
    showFullScheduleBtn.onclick = showFullScheduleBtn.onclick;
    showStandingsBtn.onclick = showStandingsBtn.onclick;

    closeFullScheduleBtn.onclick = () => closeModal(fullScheduleModal);
    closeStandingsBtn.onclick = () => closeModal(standingsModal);
    closeSpotifyModalBtn.onclick = () => closeModal(spotifyModal);

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

    if (teams.length > 0 && schedule.length > 0) {
        displayTour(currentTourIndex);
        updateNavigationButtons();
        displayFullSchedule();
        updateStandingsDataAndDisplay();
    } else {
        currentTourOutput.innerHTML = '<p>Введите команды и нажмите "Сгенерировать Расписание".</p>';
        currentTourNumSpan.textContent = '0';
        totalToursNumSpan.textContent = '0';
        updateNavigationButtons();
    }
});
