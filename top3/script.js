document.addEventListener('DOMContentLoaded', () => {
    // --- Константы для Local Storage ---
    const TEAMS_STORAGE_KEY = 'tournamentTeams';
    const SCHEDULE_STORAGE_KEY = 'tournamentSchedule';
    const RESULTS_STORAGE_KEY = 'tournamentResults';
    const CURRENT_TOUR_STORAGE_KEY = 'currentTourIndex';
    const TEAM_COUNT_FOR_STATS_KEY = 'teamCountForStats'; // Для статистики тура

    // --- Константы турнира ---
    const TEAM_COUNT_INITIAL = 150; // Изначальное количество команд
    const TECHNICAL_LOSS_SCORE = '0:3'; // Техническое поражение (для команды, которая должна быть справа)
    const TECHNICAL_WIN_SCORE = '3:0'; // Техническая победа (для команды, которая должна быть слева)
    const MAX_SCORE_INPUTS_PER_MATCH = 2; // Максимум полей для ввода счета в одном матче
    const MIN_TEAMS_FOR_TOURNAMENT = 2; // Минимум команд для генерации расписания

    // --- Элементы DOM ---
    const teamsInput = document.getElementById('teamsInput');
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const scheduleContainer = document.getElementById('scheduleContainer');
    const standingsTableBody = document.getElementById('standingsTableBody');
    const prevTourBtn = document.getElementById('prevTourBtn');
    const nextTourBtn = document.getElementById('nextTourBtn');
    const currentTourDisplay = document.getElementById('currentTourDisplay');
    const currentTourInput = document.getElementById('currentTourInput');
    const teamManagementList = document.getElementById('teamList'); // UL для списка команд
    const addTeamInput = document.getElementById('addTeamInput');
    const addTeamBtn = document.getElementById('addTeamBtn');

    // --- Глобальные переменные ---
    let teams = []; // Массив названий команд
    let schedule = []; // Массив туров, каждый тур - массив матчей { team1: 'Name', team2: 'Name' }
    let results = {}; // Объект для хранения результатов матчей { 'tourIndex-matchIndex': 'score1:score2' }
    let currentTourIndex = 0; // Индекс текущего тура (начинается с 0)
    let totalTeamsForStats = 0; // Общее количество команд для статистики тура (фиксируется при генерации)

    // --- Цветовые константы (для легкой смены темы) ---
    const COLORS = {
        primaryBg: '#1a1a1a',
        secondaryBg: '#2c2c2c',
        sectionBg: '#383838',
        inputBg: '#333',
        textColor: '#e0e0e0',
        accent: '#7CFC00', // Салатовый
        accentHover: '#32CD32',
        buttonBg: '#7CFC00',
        buttonHover: '#32CD32',
        danger: '#DC143C',
        dangerHover: '#C00000',
        tableHeader: '#4CAF50', // Зеленый
        tableEvenRow: '#333',
        inputBorderFocus: '#7CFC00',
        scoreInputBg: '#222',
        scoreInputBorder: '#666',
        techLossColor: '#FF6347', // Ярко-красный
        warningBg: '#444',
        warningColor: '#FFD700', // Золотистый
        navButtonBg: '#555',
        navButtonHover: '#7CFC00',
        teamListItemBg: '#333',
        teamListItemBorder: '#444',
        teamNameDisplay: '#e0e0e0',
        teamNameFontWeight: 500,
    };

    // --- Инициализация ---
    function initialize() {
        loadData();
        renderTeamList(); // Отрисовываем список команд
        generateFullSchedule(); // Генерируем расписание при первой загрузке, если нет сохраненного
        updateUI(); // Обновляем весь UI
        setupEventListeners(); // Настраиваем обработчики событий
    }

    // --- Функции управления данными (Local Storage) ---

    function loadData() {
        const savedTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
        const savedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
        const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY);
        const savedCurrentTour = localStorage.getItem(CURRENT_TOUR_STORAGE_KEY);
        const savedTeamCountForStats = localStorage.getItem(TEAM_COUNT_FOR_STATS_KEY);

        if (savedTeams) {
            teams = JSON.parse(savedTeams);
        } else {
            // Если нет сохраненных команд, заполняем начальное количество
            teams = Array.from({ length: TEAM_COUNT_INITIAL }, (_, i) => `Песня/Команда ${i + 1}`);
        }

        if (savedSchedule) {
            schedule = JSON.parse(savedSchedule);
        }

        if (savedResults) {
            results = JSON.parse(savedResults);
        }

        if (savedCurrentTour !== null) {
            currentTourIndex = parseInt(savedCurrentTour, 10);
        }

        if (savedTeamCountForStats !== null) {
            totalTeamsForStats = parseInt(savedTeamCountForStats, 10);
        } else {
            totalTeamsForStats = teams.length; // Инициализация
        }
    }

    function saveData() {
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
        localStorage.setItem(CURRENT_TOUR_STORAGE_KEY, currentTourIndex.toString());
        localStorage.setItem(TEAM_COUNT_FOR_STATS_KEY, totalTeamsForStats.toString());
    }

    // --- Функции генерации расписания (Round Robin) ---

    // Алгоритм генерации расписания Round Robin (по Бёрнсайду)
    function generateRoundRobinSchedule(teamList) {
        const numTeams = teamList.length;
        if (numTeams < MIN_TEAMS_FOR_TOURNAMENT) return [];

        const isEven = numTeams % 2 === 0;
        const teams = [...teamList];
        if (!isEven) {
            teams.push(null); // 'null' представляет "призрака" для нечетного числа команд
        }

        const numTeamsAdjusted = teams.length;
        const numRounds = numTeamsAdjusted - 1;
        const matchesPerRound = numTeamsAdjusted / 2;
        const generatedSchedule = [];

        const firstTeam = teams[0]; // Первая команда остается на месте
        const rotatingTeams = teams.slice(1); // Остальные команды вращаются

        for (let round = 0; round < numRounds; round++) {
            const currentRoundMatches = [];
            const rotatingIndex = round % rotatingTeams.length; // Индекс вращения для второй команды

            // Определяем пары
            const teamA = firstTeam;
            const teamB = rotatingTeams[rotatingIndex];

            if (teamA !== null && teamB !== null) {
                currentRoundMatches.push({ team1: teamA, team2: teamB });
            }

            for (let i = 1; i < matchesPerRound; i++) {
                const teamC = rotatingTeams[(rotatingIndex + i) % rotatingTeams.length];
                const teamD = rotatingTeams[(rotatingIndex - i + rotatingTeams.length) % rotatingTeams.length];

                if (teamC !== null && teamD !== null) {
                    currentRoundMatches.push({ team1: teamC, team2: teamD });
                }
            }
            generatedSchedule.push(currentRoundMatches);
        }
        return generatedSchedule;
    }

    // Полная генерация расписания и обновление всех данных
    function generateFullSchedule() {
        // Валидация: нужно как минимум 2 команды
        if (teams.length < MIN_TEAMS_FOR_TOURNAMENT) {
            schedule = [];
            results = {};
            currentTourIndex = 0;
            totalTeamsForStats = teams.length;
            updateUI();
            alert(`Для проведения турнира необходимо как минимум ${MIN_TEAMS_FOR_TOURNAMENT} команды.`);
            return;
        }

        schedule = generateRoundRobinSchedule(teams);
        results = {}; // Очищаем результаты при полной перегенерации
        currentTourIndex = 0; // Сбрасываем на первый тур
        totalTeamsForStats = teams.length; // Сохраняем количество команд для статистики тура

        // Применяем технические поражения ко всем матчам, где участвует удаленная команда
        applyTechnicalLossesToSchedule();

        saveData();
        updateUI();
    }

    // Применение технических поражений ко всем матчам в расписании
    function applyTechnicalLossesToSchedule() {
        const newResults = {};
        schedule.forEach((roundMatches, tourIndex) => {
            roundMatches.forEach((match, matchIndex) => {
                const tourId = `${tourIndex}-${matchIndex}`;
                const team1Name = match.team1;
                const team2Name = match.team2;

                const isTeam1Valid = teams.includes(team1Name);
                const isTeam2Valid = teams.includes(team2Name);

                if (!isTeam1Valid || !isTeam2Valid) {
                    // Если одна из команд удалена (не присутствует в текущем списке `teams`)
                    if (team1Name && team2Name) { // Убедимся, что это не 'BYE' или null
                        if (!isTeam1Valid) { // Команда 1 удалена
                            newResults[tourId] = TECHNICAL_LOSS_SCORE; // 0:3
                        } else { // Команда 2 удалена
                            newResults[tourId] = TECHNICAL_WIN_SCORE; // 3:0
                        }
                    }
                } else {
                    // Если обе команды валидны, берем сохраненный результат, если он есть
                    if (results[tourId]) {
                        newResults[tourId] = results[tourId];
                    }
                    // Иначе, результат остается пустым (матч не сыгран)
                }
            });
        });
        results = newResults; // Обновляем объект результатов
        saveData();
    }


    // --- Функции обновления UI ---

    // Обновление отображения списка команд
    function renderTeamList() {
        teamManagementList.innerHTML = ''; // Очищаем текущий список
        teams.forEach((team, index) => {
            const li = document.createElement('li');

            const teamInfo = document.createElement('div');
            teamInfo.classList.add('team-info');

            const teamNameSpan = document.createElement('span');
            teamNameSpan.classList.add('team-name-display');
            teamNameSpan.textContent = team;
            teamInfo.appendChild(teamNameSpan);

            // Кнопка удаления команды
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-team-btn');
            removeBtn.textContent = '❌';
            removeBtn.addEventListener('click', () => {
                if (confirm(`Вы уверены, что хотите удалить команду "${team}"? Все связанные матчи будут пересчитаны.`)) {
                    removeTeam(index);
                }
            });
            teamInfo.appendChild(removeBtn);

            li.appendChild(teamInfo);
            teamManagementList.appendChild(li);
        });
        totalTeamsForStats = teams.length; // Обновляем общее количество команд для статистики
        saveData(); // Сохраняем изменения
    }

    // Добавление новой команды
    function addTeam() {
        const teamName = addTeamInput.value.trim();
        if (teamName) {
            if (teams.some(t => t.toLowerCase() === teamName.toLowerCase())) { // Проверка на дубликаты без учета регистра
                alert(`Команда "${teamName}" уже существует.`);
                return;
            }
            teams.push(teamName);
            addTeamInput.value = ''; // Очищаем поле ввода
            renderTeamList();
            generateFullSchedule(); // Перегенерация расписания после добавления
        } else {
            alert('Введите название команды.');
        }
    }

    // Удаление команды
    function removeTeam(index) {
        if (index >= 0 && index < teams.length) {
            teams.splice(index, 1);
            renderTeamList();
            generateFullSchedule(); // Перегенерация расписания после удаления
        }
    }

    // Сброс всех данных
    function resetAllData() {
        if (confirm("Вы уверены, что хотите сбросить все данные турнира (расписание, результаты, команды)? Это действие необратимо.")) {
            localStorage.clear(); // Очищаем весь Local Storage
            // Перезагружаем страницу, чтобы все инициализировалось заново
            window.location.reload();
        }
    }

    // Обработка ввода счета матча
    function handleScoreInput(event, tourIndex, matchIndex) {
        const input = event.target;
        const value = input.value;

        // Проверяем, что введено число и оно не отрицательное
        if (!/^\d+$/.test(value)) {
            input.value = ''; // Очищаем, если не число
            return;
        }

        const tourId = `${tourIndex}-${matchIndex}`;
        const matchElement = input.closest('.match');
        const scoreInputs = matchElement.querySelectorAll('.score-input');
        const team1Input = scoreInputs[0];
        const team2Input = scoreInputs[1];

        // Обновляем объект результатов
        results[tourId] = `${team1Input.value || ''}:${team2Input.value || ''}`; // Сохраняем пустые строки, если поле пустое

        // Проверяем, заполнены ли оба поля
        if (team1Input.value && team2Input.value) {
            input.classList.add('filled'); // Добавляем класс для стилизации
            updateStandings(); // Обновляем таблицу сразу после заполнения обоих полей
            checkTourCompletionAndStats(tourIndex); // Проверяем статистику тура
        } else {
            input.classList.remove('filled');
            updateStandings(); // Обновляем таблицу, даже если одно поле пустое (чтобы учесть изменения)
        }

        saveData();
    }

    // Проверка, является ли матч сыгранным (оба счета введены)
    function isMatchPlayed(tourIndex, matchIndex) {
        const tourId = `${tourIndex}-${matchIndex}`;
        const score = results[tourId];
        if (!score) return false;
        const scores = score.split(':');
        return scores.length === 2 && scores[0] !== '' && scores[1] !== '';
    }

    // Получение результата матча (с учетом тех. поражений и сохраненных результатов)
    function getMatchResult(tourIndex, matchIndex) {
        const tourId = `${tourIndex}-${matchIndex}`;

        // 1. Проверяем сохраненный результат
        if (results[tourId]) {
            return results[tourId];
        }

        // 2. Если нет сохраненного результата, проверяем, есть ли техническое поражение
        if (!schedule[tourIndex] || !schedule[tourIndex][matchIndex]) return null; // Нет такого матча

        const match = schedule[tourIndex][matchIndex];
        const team1Name = match.team1;
        const team2Name = match.team2;

        // Если команды 'null' или 'BYE', или одна из них отсутствует в текущем списке `teams`
        const isTeam1Valid = teams.includes(team1Name);
        const isTeam2Valid = teams.includes(team2Name);

        if (!isTeam1Valid && team1Name !== null) { // Команда 1 удалена
            return TECHNICAL_LOSS_SCORE; // 0:3
        }
        if (!isTeam2Valid && team2Name !== null) { // Команда 2 удалена
            return TECHNICAL_WIN_SCORE; // 3:0
        }

        // Если матч не сыгран и нет тех. поражения
        return null;
    }


    // --- Функции отрисовки UI ---

    // Отрисовка расписания
    function renderSchedule() {
        scheduleContainer.innerHTML = ''; // Очищаем контейнер
        if (!schedule || schedule.length === 0) {
            scheduleContainer.innerHTML = '<p>Расписание еще не сгенерировано или нет команд.</p>';
            return;
        }

        // Проходим по всем турам
        schedule.forEach((roundMatches, tourIndex) => {
            const tourDiv = document.createElement('div');
            tourDiv.classList.add('tour-display');
            tourDiv.id = `tour-${tourIndex}`; // ID для навигации

            const tourTitle = document.createElement('h3');
            tourTitle.textContent = `Тур ${tourIndex + 1}`;

            // --- Статистическое уведомление тура ---
            const statsWarningDiv = document.createElement('div');
            statsWarningDiv.classList.add('tour-stats-warning');
            // Проверяем, нужно ли показать уведомление
            const tourStats = calculateTourStats(tourIndex);
            if (tourStats) {
                statsWarningDiv.textContent = tourStats;
                statsWarningDiv.style.display = 'inline-block';
            } else {
                statsWarningDiv.style.display = 'none';
            }
            tourDiv.appendChild(statsWarningDiv);
            tourDiv.prepend(tourTitle); // Добавляем заголовок перед уведомлением

            // Создаем контейнер для матчей, чтобы его можно было прокрутить
            const matchesWrapper = document.createElement('div');
            matchesWrapper.style.maxHeight = '0'; // Скрыто по умолчанию
            matchesWrapper.style.overflow = 'hidden';
            matchesWrapper.style.transition = 'max-height 0.5s ease-out';
            tourDiv.appendChild(matchesWrapper);

            // Рендерим матчи тура
            roundMatches.forEach((match, matchIndex) => {
                const matchElement = document.createElement('div');
                matchElement.classList.add('match');

                const team1Name = match.team1;
                const team2Name = match.team2;

                const isTeam1Valid = teams.includes(team1Name);
                const isTeam2Valid = teams.includes(team2Name);

                // Spotify ссылки (иконки)
                const spotifyLink1 = document.createElement('a');
                spotifyLink1.classList.add('spotify-link');
                spotifyLink1.href = '#';
                spotifyLink1.textContent = '🎵';
                spotifyLink1.dataset.teamName = team1Name;
                spotifyLink1.style.visibility = (team1Name !== null && isTeam1Valid) ? 'visible' : 'hidden';
                matchElement.appendChild(spotifyLink1);

                // Название команды 1
                const teamName1Span = document.createElement('span');
                teamName1Span.classList.add('team-name');
                teamName1Span.textContent = team1Name !== null ? team1Name : 'BYE';
                matchElement.appendChild(teamName1Span);

                // Поля ввода счета или отображение результата
                const scoreResult = getMatchResult(tourIndex, matchIndex);
                let scoreDisplayHTML = '';

                if (scoreResult) {
                    // Если есть результат (сыгран или тех. поражение)
                    const scores = scoreResult.split(':');
                    const score1 = scores[0];
                    const score2 = scores[1];
                    // Проверяем, является ли это тех. поражением
                    const isTechLoss = !isTeam1Valid || !isTeam2Valid;
                    scoreDisplayHTML = `
                        <span class="technical-loss" style="color: ${isTechLoss ? COLORS.techLossColor : COLORS.textColor};">
                            ${score1}:${score2}
                        </span>
                    `;
                } else if (isTeam1Valid && isTeam2Valid) {
                    // Если матч не сыгран и обе команды валидны, показываем поля ввода
                    const scoreInput1 = document.createElement('input');
                    scoreInput1.type = 'number';
                    scoreInput1.classList.add('score-input');
                    scoreInput1.dataset.tourIndex = tourIndex;
                    scoreInput1.dataset.matchIndex = matchIndex;
                    scoreInput1.dataset.team = '1';
                    scoreInput1.placeholder = '-';
                    scoreInput1.addEventListener('input', (e) => handleScoreInput(e, tourIndex, matchIndex));
                    matchElement.appendChild(scoreInput1);

                    matchElement.insertAdjacentHTML('beforeend', ' : '); // Разделитель

                    const scoreInput2 = document.createElement('input');
                    scoreInput2.type = 'number';
                    scoreInput2.classList.add('score-input');
                    scoreInput2.dataset.tourIndex = tourIndex;
                    scoreInput2.dataset.matchIndex = matchIndex;
                    scoreInput2.dataset.team = '2';
                    scoreInput2.placeholder = '-';
                    scoreInput2.addEventListener('input', (e) => handleScoreInput(e, tourIndex, matchIndex));
                    matchElement.appendChild(scoreInput2);
                } else {
                    // Одна из команд удалена, но результат еще не проставлен (крайний случай)
                    scoreDisplayHTML = `<span>- : -</span>`;
                }

                if (scoreDisplayHTML) {
                    matchElement.insertAdjacentHTML('beforeend', scoreDisplayHTML);
                }

                // Название команды 2
                const teamName2Span = document.createElement('span');
                teamName2Span.classList.add('team-name');
                teamName2Span.textContent = team2Name !== null ? team2Name : 'BYE';
                matchElement.appendChild(teamName2Span);

                // Spotify ссылка 2
                const spotifyLink2 = document.createElement('a');
                spotifyLink2.classList.add('spotify-link');
                spotifyLink2.href = '#';
                spotifyLink2.textContent = '🎵';
                spotifyLink2.dataset.teamName = team2Name;
                spotifyLink2.style.visibility = (team2Name !== null && isTeam2Valid) ? 'visible' : 'hidden';
                matchElement.appendChild(spotifyLink2);

                // Добавляем созданный матч в контейнер тура
                matchesWrapper.appendChild(matchElement);
            });

            scheduleContainer.appendChild(tourDiv);
        });

        applyStandingsHighlighting(); // Применяем стили для зон
        updateNavigation(); // Обновляем навигацию
        scrollToCurrentTour(); // Прокрутка к текущему туру
        attachSpotifyLinkHandlers(); // Прикрепляем обработчики для Spotify ссылок
        updateStandings(); // Обновляем таблицу после отрисовки расписания
    }

    // Применение стилей зон вылета/стыков к таблице
    function applyStandingsHighlighting() {
        const rows = standingsTableBody.querySelectorAll('tr');
        const numTeamsInTable = totalTeamsForStats; // Используем сохраненное количество команд для статистики

        rows.forEach((row, index) => {
            const teamPosition = index + 1; // Позиция команды (1-based)

            row.classList.remove('relegation-zone', 'relegation-playoff'); // Сбрасываем предыдущие классы

            // Применяем классы, только если позиция в пределах текущего числа команд И находится в зонах
            if (teamPosition <= numTeamsInTable) {
                if (teamPosition >= 121 && teamPosition <= 150) {
                    row.classList.add('relegation-zone');
                } else if (teamPosition >= 101 && teamPosition <= 120) {
                    row.classList.add('relegation-playoff');
                }
            }
        });
    }


    // Отрисовка турнирной таблицы
    function updateStandings() {
        if (!standingsTableBody) return;
        standingsTableBody.innerHTML = ''; // Очищаем тело таблицы

        const teamStats = {}; // { teamName: { wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, points: 0 } }

        // Инициализация статистики для всех команд
        teams.forEach(team => {
            teamStats[team] = {
                wins: 0, draws: 0, losses: 0,
                goalsScored: 0, goalsConceded: 0, points: 0,
                teamName: team // Сохраняем имя для сортировки
            };
        });

        // Обрабатываем все матчи в расписании
        schedule.forEach((roundMatches, tourIndex) => {
            roundMatches.forEach((match, matchIndex) => {
                const team1Name = match.team1;
                const team2Name = match.team2;

                // Проверяем, существуют ли команды в текущем списке `teams`
                const isTeam1Valid = teams.includes(team1Name);
                const isTeam2Valid = teams.includes(team2Name);

                // Если обе команды недействительны (маловероятно, но возможно), пропускаем
                if (!isTeam1Valid && !isTeam2Valid) return;

                const result = getMatchResult(tourIndex, matchIndex);
                if (!result) return; // Матч не сыгран и не тех. поражение

                const scores = result.split(':');
                const score1 = parseInt(scores[0], 10);
                const score2 = parseInt(scores[1], 10);

                // Если команды недействительны, их статистики не обновляем (они не участвуют)
                if (isTeam1Valid && team1Name !== null) {
                    teamStats[team1Name].goalsScored += score1;
                    teamStats[team1Name].goalsConceded += score2;
                }
                if (isTeam2Valid && team2Name !== null) {
                    teamStats[team2Name].goalsScored += score2;
                    teamStats[team2Name].goalsConceded += score1;
                }

                // Расчет очков и статистики только для валидных команд
                if (isTeam1Valid && team1Name !== null && isTeam2Valid && team2Name !== null) {
                    if (score1 > score2) { // Победа команды 1
                        teamStats[team1Name].wins++;
                        teamStats[team1Name].points += 3;
                        teamStats[team2Name].losses++;
                    } else if (score1 < score2) { // Победа команды 2
                        teamStats[team2Name].wins++;
                        teamStats[team2Name].points += 3;
                        teamStats[team1Name].losses++;
                    } else { // Ничья
                        teamStats[team1Name].draws++;
                        teamStats[team1Name].points += 1;
                        teamStats[team2Name].draws++;
                        teamStats[team2Name].points += 1;
                    }
                } else if (isTeam1Valid && team1Name !== null && !isTeam2Valid) { // Команда 2 удалена (тех. поражение 0:3)
                    // У команды 1 победа (3:0)
                    teamStats[team1Name].wins++;
                    teamStats[team1Name].points += 3;
                    teamStats[team1Name].goalsScored += 3; // Засчитываем 3 гола
                    teamStats[team1Name].goalsConceded += 0; // 0 пропущенных
                } else if (!isTeam1Valid && isTeam2Valid && team2Name !== null) { // Команда 1 удалена (тех. поражение 0:3)
                    // У команды 2 победа (3:0)
                    teamStats[team2Name].wins++;
                    teamStats[team2Name].points += 3;
                    teamStats[team2Name].goalsScored += 3; // Засчитываем 3 гола
                    teamStats[team2Name].goalsConceded += 0; // 0 пропущенных
                }
            });
        });

        // Преобразование объекта статистики в массив для сортировки
        const sortedTeams = Object.values(teamStats);

        // Сортировка таблицы
        sortedTeams.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points; // Сначала по очкам
            }
            const diffA = a.goalsScored - a.goalsConceded;
            const diffB = b.goalsScored - b.goalsConceded;
            if (diffB !== diffA) {
                return diffB - diffA; // Затем по разнице мячей
            }
            return b.goalsScored - a.goalsScored; // Затем по забитым мячам
        });

        // Отрисовка строк таблицы
        // Заполняем таблицу до 150 строк, даже если команд меньше
        const maxTableRows = 150;
        for (let i = 0; i < maxTableRows; i++) {
            const tr = document.createElement('tr');
            const position = i + 1;

            if (i < sortedTeams.length) {
                // Если есть команда на этой позиции
                const teamData = sortedTeams[i];
                const goalDifference = teamData.goalsScored - teamData.goalsConceded;

                tr.innerHTML = `
                    <td>${position}</td>
                    <td>${teamData.teamName}</td>
                    <td>${teamData.wins + teamData.draws + teamData.losses}</td>
                    <td>${teamData.wins}</td>
                    <td>${teamData.draws}</td>
                    <td>${teamData.losses}</td>
                    <td>${teamData.goalsScored}</td>
                    <td>${teamData.goalsConceded}</td>
                    <td>${goalDifference >= 0 ? '+' : ''}${goalDifference}</td>
                    <td>${teamData.points}</td>
                `;
            } else {
                // Пустая строка, если команд меньше 150
                tr.innerHTML = `
                    <td>${position}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                `;
            }
            standingsTableBody.appendChild(tr);
        }

        applyStandingsHighlighting(); // Применяем стили зон после отрисовки
    }


    // --- Функции навигации по турам ---

    function updateNavigation() {
        const totalTours = schedule.length;
        if (totalTours === 0) {
            currentTourDisplay.textContent = 'Тур: -';
            currentTourInput.value = '';
            currentTourInput.disabled = true;
            prevTourBtn.disabled = true;
            nextTourBtn.disabled = true;
            return;
        }

        currentTourDisplay.textContent = `Тур: ${currentTourIndex + 1}`;
        currentTourInput.value = currentTourIndex + 1;
        currentTourInput.min = 1;
        currentTourInput.max = totalTours;
        prevTourBtn.disabled = currentTourIndex === 0;
        nextTourBtn.disabled = currentTourIndex === totalTours - 1;
    }

    function goToTour(tourIndex) {
        if (tourIndex >= 0 && tourIndex < schedule.length) {
            currentTourIndex = tourIndex;
            saveData();
            updateNavigation();
            scrollToCurrentTour();
        }
    }

    function scrollToCurrentTour() {
        if (schedule.length === 0) return;
        const tourElement = document.getElementById(`tour-${currentTourIndex}`);
        if (tourElement) {
            tourElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Раскрываем матчи текущего тура
            const matchesWrapper = tourElement.querySelector('.schedule-section > div'); // Ищем обертку матчей
            if (matchesWrapper) {
                matchesWrapper.style.maxHeight = matchesWrapper.scrollHeight + 'px';
            }
        }
    }

    // --- Статистические проверки тура ---

    // Подсчет статистики для конкретного тура
    function calculateTourStats(tourIndex) {
        if (!schedule[tourIndex]) return null;

        let drawsCount = 0;
        let total4GoalsCount = 0;
        let hasInvalidTeamsInMatch = false; // Флаг, есть ли матчи с удаленными командами

        schedule[tourIndex].forEach((match, matchIndex) => {
            const result = getMatchResult(tourIndex, matchIndex);
            if (!result) return; // Пропускаем, если матч не сыгран

            const scores = result.split(':');
            const score1 = parseInt(scores[0], 10);
            const score2 = parseInt(scores[1], 10);

            // Проверка на ничью
            if (score1 === score2) {
                drawsCount++;
            }

            // Проверка на тотал голов = 4
            if (score1 + score2 === 4) {
                total4GoalsCount++;
            }

            // Проверка на участие удаленных команд
            const team1Name = match.team1;
            const team2Name = match.team2;
            const isTeam1Valid = teams.includes(team1Name);
            const isTeam2Valid = teams.includes(team2Name);
            if (!isTeam1Valid || !isTeam2Valid) {
                hasInvalidTeamsInMatch = true;
            }
        });

        // Определяем, нужно ли выводить уведомление
        const expectedDraws = 1;
        const expectedTotal4 = 6;

        // Учитываем, что если есть матчи с удаленными командами, то статистика может быть нерелевантна
        // В таком случае, по заданию, лучше выводить ❌ ❌
        if (hasInvalidTeamsInMatch) {
            return '❌ ❌'; // Показываем, что статистика не может быть корректно оценена
        }

        let warningString = '';
        if (drawsCount !== expectedDraws) {
            warningString += '❌ ';
        } else {
            warningString += '✅️ ';
        }

        if (total4GoalsCount !== expectedTotal4) {
            warningString += '❌';
        } else {
            warningString += '✅️';
        }

        // Возвращаем строку уведомления, только если она отличается от "идеальной" или если есть тех. поражения
        if (warningString === '✅️ ✅️' && !hasInvalidTeamsInMatch) {
            return null; // Идеальная ситуация, уведомление не нужно
        } else {
            return warningString; // Возвращаем уведомление
        }
    }

    // Проверка и обновление уведомления тура при изменении счета
    function checkTourCompletionAndStats(tourIndex) {
        const tourElement = document.getElementById(`tour-${tourIndex}`);
        if (!tourElement) return;

        const tourStatsWarning = tourElement.querySelector('.tour-stats-warning');
        const tourStats = calculateTourStats(tourIndex);

        if (tourStats) {
            tourStatsWarning.textContent = tourStats;
            tourStatsWarning.style.display = 'inline-block';
        } else {
            tourStatsWarning.style.display = 'none';
        }
    }

    // --- Обработчики событий ---
    function setupEventListeners() {
        // Генерация расписания (из текстового поля)
        generateBtn.addEventListener('click', () => {
            const teamsString = teamsInput.value.trim();
            if (teamsString) {
                // Разделяем команды, удаляем пустые строки и дубликаты
                teams = teamsString.split(',')
                                   .map(t => t.trim())
                                   .filter(t => t) // Убираем пустые строки
                                   .filter((t, i, arr) => arr.indexOf(t) === i); // Убираем дубликаты
                renderTeamList(); // Обновляем список команд в секции управления
                generateFullSchedule();
            } else {
                alert('Пожалуйста, введите названия команд через запятую.');
            }
        });

        // Сброс всех данных
        resetBtn.addEventListener('click', resetAllData);

        // Добавление команды через секцию управления
        addTeamBtn.addEventListener('click', addTeam);
        addTeamInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTeam();
            }
        });

        // Навигация по турам
        prevTourBtn.addEventListener('click', () => goToTour(currentTourIndex - 1));
        nextTourBtn.addEventListener('click', () => goToTour(currentTourIndex + 1));
        currentTourInput.addEventListener('change', () => {
            const newTour = parseInt(currentTourInput.value, 10) - 1;
            goToTour(newTour);
        });

        // Обработка ввода счета (прикрепляется динамически в renderSchedule)

        // Обработка ввода в текстовое поле для команд при генерации
        teamsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Предотвращаем отправку формы, если она есть
                generateBtn.click(); // Эмулируем клик по кнопке генерации
            }
        });
    }

    // Прикрепление обработчиков для Spotify ссылок (нужно делать после отрисовки)
    function attachSpotifyLinkHandlers() {
        document.querySelectorAll('.match .spotify-link').forEach(link => {
            // Проверяем, есть ли уже обработчик, чтобы не добавлять многократно
            if (!link.dataset.hasListener) {
                link.addEventListener('click', (e) => {
                    e.preventDefault(); // Предотвращаем переход по ссылке #
                    const teamName = link.dataset.teamName;
                    if (teamName && teamName !== 'BYE' && teams.includes(teamName)) {
                        // Здесь может быть логика открытия Spotify или перехода на страницу команды
                        alert(`Открытие Spotify для команды: "${teamName}"`);
                        // Пример: window.open(`https://open.spotify.com/search/${encodeURIComponent(teamName)}`);
                    } else if (teamName === 'BYE') {
                        alert("У этого матча нет команды (BYE).");
                    } else {
                        alert(`Команда "${teamName}" не найдена или удалена.`);
                    }
                });
                link.dataset.hasListener = 'true'; // Отмечаем, что обработчик добавлен
            }
        });
    }


    // Обновление всего UI: расписание, таблицу, навигацию
    function updateUI() {
        renderSchedule();
        updateStandings();
        updateNavigation();
    }

    // --- Запуск инициализации ---
    initialize();

    // --- Конец скрипта ---
    // Если бы потребовалось больше места, я бы указал это здесь.
    // Но, надеюсь, всё уместилось.
});
