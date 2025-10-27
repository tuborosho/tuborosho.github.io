document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов DOM ---
    const teamsInput = document.getElementById('teamsInput');
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const standingsBody = document.getElementById('standingsBody');
    const currentTourNumSpan = document.getElementById('currentTourNum');
    const totalToursNumSpan = document.getElementById('totalToursNum');
    const prevTourBtn = document.getElementById('prevTourBtn');
    const nextTourBtn = document.getElementById('nextTourBtn');
    const tourJumpInput = document.getElementById('tourJumpInput');
    const jumpToTourBtn = document.getElementById('jumpToTourBtn');
    const showFullScheduleBtn = document.getElementById('showFullScheduleBtn');
    const fullScheduleModal = document.getElementById('fullScheduleModal');
    const fullScheduleContent = document.getElementById('fullScheduleContent');
    const closeModalBtn = fullScheduleModal.querySelector('.close-button');
    const tourStatsDiv = document.getElementById('tourStats');
    const sortByNameBtn = document.getElementById('sortByNameBtn');
    const sortByPointsBtn = document.getElementById('sortByPointsBtn');

    // --- Глобальная переменная для хранения данных турнира ---
    let tournamentData = {
        teams: [], // Список всех команд
        schedule: [], // Массив всех туров, каждый тур - массив матчей
        standings: {}, // { teamName: { И: 0, В: 0, Н: 0, П: 0, ЗГ: 0, ПГ: 0, РМ: 0, Очки: 0 } }
        currentTourIndex: 0, // Индекс текущего отображаемого тура (0-based)
        roundRobinTeams: [], // Команды для алгоритма Round Robin (с учетом 'BYE')
        numMatchesPerTour: 0, // Количество матчей в одном туре
        totalTours: 0 // Общее количество туров
    };

    // --- Функции для работы с данными и отображением ---

    /**
     * Инициализирует турнир: считывает команды, генерирует расписание,
     * инициализирует таблицу и отображает первый тур.
     */
    function initializeTournament() {
        const teamsText = teamsInput.value.trim();
        if (!teamsText) {
            alert('Пожалуйста, введите названия команд.');
            return;
        }
        tournamentData.teams = teamsText.split('\n').map(team => team.trim()).filter(team => team);

        if (tournamentData.teams.length < 2) {
            alert('Необходимо минимум две команды для проведения турнира.');
            return;
        }

        // Адаптация для Round Robin: если команд нечетное число, добавляем "BYE"
        if (tournamentData.teams.length % 2 !== 0) {
            tournamentData.roundRobinTeams = [...tournamentData.teams, 'BYE'];
        } else {
            tournamentData.roundRobinTeams = [...tournamentData.teams];
        }

        generateSchedule();
        initializeStandings();
        renderStandings();
        updateTourNavigation();
        displayTour(tournamentData.currentTourIndex);
        saveData(); // Сохраняем начальное состояние
        enableButtons();
        scrollToActiveMatch(); // Прокрутка к первому активному матчу
    }

    /**
     * Генерирует полное расписание турнира по алгоритму Round Robin.
     */
    function generateSchedule() {
        tournamentData.schedule = [];
        const n = tournamentData.roundRobinTeams.length;
        const numMatchesPerTour = n / 2;
        // Количество туров: n-1 для четного n, n для нечетного n
        const totalTours = (n % 2 === 0) ? n - 1 : n;

        tournamentData.totalTours = totalTours;
        tournamentData.numMatchesPerTour = numMatchesPerTour;

        // Используем копию массива для генерации, чтобы не изменять исходный
        let currentRoundTeams = [...tournamentData.roundRobinTeams];

        for (let tour = 0; tour < totalTours; tour++) {
            const currentTourMatches = [];
            const teamsForThisTour = [...currentRoundTeams]; // Команды для текущего тура

            // Генерация матчей для текущего тура
            for (let i = 0; i < numMatchesPerTour; i++) {
                const team1 = teamsForThisTour[i];
                const team2 = teamsForThisTour[n - 1 - i]; // n-1 т.к. n - общее число, а нам нужны индексы до последнего

                // Обработка случая с "BYE"
                if (team1 === 'BYE') {
                    currentTourMatches.push({
                        team1: 'BYE',
                        team2: team2,
                        score: 'BYE',
                        score1: null,
                        score2: null,
                        spotify1: '',
                        spotify2: ''
                    });
                    // Автоматически начисляем очки команде, которая играет против BYE
                    if (!tournamentData.standings[team2]) initializeTeamStandings(team2);
                    tournamentData.standings[team2].И++;
                    tournamentData.standings[team2].В++;
                    tournamentData.standings[team2].Очки += 3;
                } else if (team2 === 'BYE') {
                     currentTourMatches.push({
                        team1: team1,
                        team2: 'BYE',
                        score: 'BYE',
                        score1: null,
                        score2: null,
                        spotify1: '',
                        spotify2: ''
                    });
                    if (!tournamentData.standings[team1]) initializeTeamStandings(team1);
                    tournamentData.standings[team1].И++;
                    tournamentData.standings[team1].В++;
                    tournamentData.standings[team1].Очки += 3;
                } else {
                    // Обычный матч
                    currentTourMatches.push({
                        team1: team1,
                        team2: team2,
                        score: '',
                        score1: null,
                        score2: null,
                        spotify1: '',
                        spotify2: ''
                    });
                }
            }
            tournamentData.schedule.push(currentTourMatches);

            // Вращение команд для следующего тура (кроме последнего тура)
            if (tour < totalTours - 1) {
                const pivot = currentRoundTeams.pop(); // Берем последнюю команду
                const firstTeam = currentRoundTeams.shift(); // Берем первую команду
                currentRoundTeams.push(firstTeam); // Добавляем ее в конец
                currentRoundTeams.unshift(pivot); // Возвращаем pivot в начало
            }
        }
    }

    /**
     * Инициализирует таблицу результатов для всех команд.
     */
    function initializeStandings() {
        tournamentData.standings = {};
        tournamentData.teams.forEach(team => {
            tournamentData.standings[team] = {
                И: 0, В: 0, Н: 0, П: 0, ЗГ: 0, ПГ: 0, РМ: 0, Очки: 0
            };
        });
    }

    /**
     * Инициализирует статистику для одной команды, если она еще не существует.
     * @param {string} teamName - Название команды.
     */
    function initializeTeamStandings(teamName) {
         if (!tournamentData.standings[teamName]) {
            tournamentData.standings[teamName] = { И: 0, В: 0, Н: 0, П: 0, ЗГ: 0, ПГ: 0, РМ: 0, Очки: 0 };
        }
    }

    /**
     * Обновляет статистику турнирной таблицы после ввода счета матча.
     * @param {object} match - Объект матча с результатами.
     */
    function updateStandings(match) {
        const { team1, team2, score1, score2 } = match;

        // Не обновляем, если счет не введен полностью или есть BYE
        if (score1 === null || score2 === null || team1 === 'BYE' || team2 === 'BYE') return;

        // Убедимся, что команды существуют в статистике
        initializeTeamStandings(team1);
        initializeTeamStandings(team2);

        const team1Data = tournamentData.standings[team1];
        const team2Data = tournamentData.standings[team2];

        // Обновляем Игры (только если матч не был сыгран ранее)
        // Простая логика: если И был 0, значит, это первый ввод счета для них
        // Более сложная логика потребовала бы хранение сыгранных матчей
        if (team1Data.И === 0 && team2Data.И === 0) { // Грубая проверка, что матч сыгран впервые
             team1Data.И++;
             team2Data.И++;
        }


        // Обновляем Забито/Пропущено
        team1Data.ЗГ += score1;
        team1Data.ПГ += score2;
        team2Data.ЗГ += score2;
        team2Data.ПГ += score1;

        // Определяем результат матча и обновляем победы/поражения/ничьи/очки
        if (score1 > score2) { // Победа team1
            team1Data.В++;
            team2Data.П++;
            team1Data.Очки += 3;
        } else if (score1 < score2) { // Победа team2
            team2Data.В++;
            team1Data.П++;
            team2Data.Очки += 3;
        } else { // Ничья
            team1Data.Н++;
            team2Data.Н++;
            team1Data.Очки += 1;
            team2Data.Очки += 1;
        }

        // Обновляем Разницу Мячей
        team1Data.РМ = team1Data.ЗГ - team1Data.ПГ;
        team2Data.РМ = team2Data.ЗГ - team2Data.ПГ;
    }

    /**
     * Отрисовывает турнирную таблицу в DOM.
     */
    function renderStandings() {
        standingsBody.innerHTML = '';
        // Сортировка: по очкам (убыв), затем по победам (убыв), затем по разнице мячей (убыв)
        const sortedTeams = Object.entries(tournamentData.standings).sort(([nameA, statsA], [nameB, statsB]) => {
            if (statsB.Очки !== statsA.Очки) return statsB.Очки - statsA.Очки;
            if (statsB.В !== statsA.В) return statsB.В - statsA.В;
            if (statsB.РМ !== statsA.РМ) return statsB.РМ - statsA.РМ;
            return nameA.localeCompare(nameB); // По алфавиту, если все остальное равно
        });

        sortedTeams.forEach(([teamName, stats], index) => {
            const row = standingsBody.insertRow();
            row.insertCell(0).textContent = index + 1; // #
            row.insertCell(1).textContent = teamName;
            row.insertCell(2).textContent = stats.И;
            row.insertCell(3).textContent = stats.В;
            row.insertCell(4).textContent = stats.Н;
            row.insertCell(5).textContent = stats.П;
            row.insertCell(6).textContent = stats.ЗГ;
            row.insertCell(7).textContent = stats.ПГ;
            row.insertCell(8).textContent = stats.РМ;
            row.insertCell(9).textContent = stats.Очки;

            // Применение стилей для зон вылета/стыков (1-based index)
            const rowIndex = index + 1;
            if (rowIndex >= 121 && rowIndex <= 150) { // Зона вылета (121-150)
                row.classList.add('relegation');
            } else if (rowIndex >= 101 && rowIndex <= 120) { // Зона стыков (101-120)
                row.classList.add('relegation-playoff');
            }
        });
    }

    /**
     * Отображает матчи текущего тура в DOM.
     * @param {number} tourIndex - Индекс тура для отображения (0-based).
     */
    function displayTour(tourIndex) {
        if (tourIndex < 0 || tourIndex >= tournamentData.schedule.length) {
            console.error("Неверный индекс тура:", tourIndex);
            return;
        }

        tournamentData.currentTourIndex = tourIndex; // Обновляем текущий индекс тура
        currentTourNumSpan.textContent = tourIndex + 1;
        const currentTour = tournamentData.schedule[tourIndex];
        const currentTourOutput = document.getElementById('currentTourOutput');
        currentTourOutput.innerHTML = ''; // Очищаем предыдущий тур

        // Получаем данные для статистической проверки и отображаем их
        const tourStatsMessage = checkTourStats(tourIndex);
        tourStatsDiv.innerHTML = tourStatsMessage;
        if (tourStatsMessage.includes('Ошибка')) {
            tourStatsDiv.classList.add('error');
        } else {
            tourStatsDiv.classList.remove('error');
        }

        if (!currentTour || currentTour.length === 0) {
             currentTourOutput.innerHTML = '<p>В этом туре нет матчей.</p>';
             return;
        }

        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();

        // Заголовок таблицы для текущего тура
        const headerRow = thead.insertRow();
        headerRow.innerHTML = `
            <th>#</th>
            <th>Команда 1 <br> (Spotify URL)</th>
            <th>Счет</th>
            <th>Команда 2 <br> (Spotify URL)</th>
            <th>Счет</th>
            <th>Действия</th>
        `;

        currentTour.forEach((match, matchIndex) => {
            const row = tbody.insertRow();

            // Номер матча
            const matchNumCell = row.insertCell(0);
            matchNumCell.textContent = `${matchIndex + 1}.`;

            // Команда 1 и Spotify URL
            const team1Cell = row.insertCell(1);
            team1Cell.classList.add('match-teams');
            const team1NameSpan = document.createElement('span');
            team1NameSpan.classList.add('team-name');
            team1NameSpan.textContent = match.team1;
            team1Cell.appendChild(team1NameSpan);

            const spotify1Input = document.createElement('input');
            spotify1Input.type = 'url';
            spotify1Input.classList.add('spotify-link-input');
            spotify1Input.placeholder = 'Spotify URL';
            spotify1Input.value = match.spotify1 || '';
            spotify1Input.dataset.team = 'team1';
            spotify1Input.dataset.tourIndex = tourIndex;
            spotify1Input.dataset.matchIndex = matchIndex;
            team1Cell.appendChild(spotify1Input);

            // Счет Команды 1
            const score1Cell = row.insertCell(2);
            const score1Input = document.createElement('input');
            score1Input.type = 'number';
            score1Input.min = '0';
            score1Input.value = match.score1 !== null ? match.score1 : '';
            score1Input.disabled = match.score === 'BYE';
            score1Input.dataset.team = 'team1';
            score1Input.dataset.tourIndex = tourIndex;
            score1Input.dataset.matchIndex = matchIndex;
            score1Input.addEventListener('change', handleScoreInput);
            score1Cell.appendChild(score1Input);

            // Команда 2 и Spotify URL
            const team2Cell = row.insertCell(3);
            team2Cell.classList.add('match-teams');
            const team2NameSpan = document.createElement('span');
            team2NameSpan.classList.add('team-name');
            team2NameSpan.textContent = match.team2;
            team2Cell.appendChild(team2NameSpan);

            const spotify2Input = document.createElement('input');
            spotify2Input.type = 'url';
            spotify2Input.classList.add('spotify-link-input');
            spotify2Input.placeholder = 'Spotify URL';
            spotify2Input.value = match.spotify2 || '';
            spotify2Input.dataset.team = 'team2';
            spotify2Input.dataset.tourIndex = tourIndex;
            spotify2Input.dataset.matchIndex = matchIndex;
            team2Cell.appendChild(spotify2Input);

            // Счет Команды 2
            const score2Cell = row.insertCell(4);
            const score2Input = document.createElement('input');
            score2Input.type = 'number';
            score2Input.min = '0';
            score2Input.value = match.score2 !== null ? match.score2 : '';
            score2Input.disabled = match.score === 'BYE';
            score2Input.dataset.team = 'team2';
            score2Input.dataset.tourIndex = tourIndex;
            score2Input.dataset.matchIndex = matchIndex;
            score2Input.addEventListener('change', handleScoreInput);
            score2Cell.appendChild(score2Input);

            // Кнопка "Сохранить" или "BYE"
            const actionsCell = row.insertCell(5);
            if (match.score === 'BYE') {
                actionsCell.textContent = 'BYE';
            } else {
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Сохранить';
                saveBtn.dataset.tourIndex = tourIndex;
                saveBtn.dataset.matchIndex = matchIndex;
                saveBtn.addEventListener('click', handleSaveScore);
                actionsCell.appendChild(saveBtn);
            }
        });
        currentTourOutput.appendChild(table);
    }

    /**
     * Обновляет элементы навигации по турам (номера туров, кнопки).
     */
    function updateTourNavigation() {
        totalToursNumSpan.textContent = tournamentData.totalTours;
        currentTourNumSpan.textContent = tournamentData.currentTourIndex + 1;
        tourJumpInput.max = tournamentData.totalTours;
        tourJumpInput.value = ''; // Очищаем поле ввода номера тура

        prevTourBtn.disabled = tournamentData.currentTourIndex === 0;
        nextTourBtn.disabled = tournamentData.currentTourIndex >= tournamentData.totalTours - 1;
    }

    /**
     * Проверяет статистические условия для заданного тура.
     * @param {number} tourIndex - Индекс тура для проверки.
     * @returns {string} - Сообщение о результатах проверки.
     */
    function checkTourStats(tourIndex) {
        if (!tournamentData.schedule || !tournamentData.schedule[tourIndex]) {
            return "";
        }

        const matches = tournamentData.schedule[tourIndex];
        let draws = 0; // Количество ничьих
        let totalScore4Matches = 0; // Количество матчей с суммой голов = 4
        let unfilledScores = 0; // Количество матчей с неопределенным счетом

        matches.forEach(match => {
            // Проверяем только для реальных матчей, не BYE
            if (match.score !== 'BYE') {
                const score1 = match.score1;
                const score2 = match.score2;

                if (score1 !== null && score2 !== null) {
                    // Проверка на ничью
                    if (score1 === score2) {
                        draws++;
                        // Проверка на сумму голов = 2 (только для ничьих)
                        if (score1 + score2 === 2) {
                            // Это одна из допустимых ничьих (1:1)
                        }
                    }
                    // Проверка на сумму голов = 4
                    if (score1 + score2 === 4) {
                        totalScore4Matches++;
                    }
                } else {
                    unfilledScores++; // Счет не введен
                }
            }
        });

        let statsMessage = '';
        let isError = false;

        // Проверка на ничьи
        if (unfilledScores > 0) {
            statsMessage += `Есть ${unfilledScores} незаполненных матчей. `;
            isError = true;
        }
        // Проверка на ничью: должна быть ровно 1 ничья
        if (draws !== 1 && unfilledScores === 0) {
            statsMessage += `Ошибка: Ничья (${draws} шт.) `;
            isError = true;
        }
        // Проверка на крупные тоталы (сумма голов = 4): должно быть ровно 6 матчей
        if (totalScore4Matches !== 6 && unfilledScores === 0) {
            statsMessage += `Ошибка: Крупный тотал (4 гола, ${totalScore4Matches} шт.) `;
            isError = true;
        }

        if (statsMessage) {
            return `<span class="${isError ? 'error' : ''}">Статистика тура: ${statsMessage.trim()}</span>`;
        } else {
            return "Статистика тура: OK";
        }
    }

    /**
     * Осуществляет прокрутку к первому незаполненному матчу текущего активного тура.
     */
    function scrollToActiveMatch() {
        let targetTourIndex = tournamentData.currentTourIndex;
        let firstUnfilledMatchIndex = -1;

        // Ищем первый тур с незаполненным матчем
        for (let i = tournamentData.currentTourIndex; i < tournamentData.schedule.length; i++) {
            const tour = tournamentData.schedule[i];
            for (let j = 0; j < tour.length; j++) {
                const match = tour[j];
                if (match.score1 === null || match.score2 === null) {
                    targetTourIndex = i;
                    firstUnfilledMatchIndex = j;
                    break;
                }
            }
            if (firstUnfilledMatchIndex !== -1) break;
        }

        // Если все матчи заполнены, переходим к первому матчу последнего тура
        if (firstUnfilledMatchIndex === -1) {
            targetTourIndex = tournamentData.schedule.length - 1;
            firstUnfilledMatchIndex = 0;
        }

        // Обновляем текущий тур, если он изменился
        if (tournamentData.currentTourIndex !== targetTourIndex) {
            tournamentData.currentTourIndex = targetTourIndex;
            displayTour(tournamentData.currentTourIndex);
            updateTourNavigation();
        }

        // Прокрутка к матчу
        const tourOutputElement = document.getElementById('currentTourOutput');
        if (tourOutputElement && tourOutputElement.children.length > 0) {
            const table = tourOutputElement.querySelector('table');
            if (table) {
                const rows = table.querySelectorAll('tbody tr');
                if (rows.length > firstUnfilledMatchIndex) {
                    rows[firstUnfilledMatchIndex].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center' // Центрируем найденный матч
                    });
                }
            }
        }
    }

    /**
     * Рендерит полное расписание в модальном окне.
     */
    function renderFullScheduleModal() {
        fullScheduleContent.innerHTML = '';
        if (!tournamentData.schedule || tournamentData.schedule.length === 0) {
            fullScheduleContent.innerHTML = '<p>Расписание еще не сгенерировано.</p>';
            return;
        }

        tournamentData.schedule.forEach((tour, tourIndex) => {
            const tourBlock = document.createElement('div');
            tourBlock.classList.add('tour-block');
            tourBlock.innerHTML = `<h3>Тур ${tourIndex + 1}</h3>`;

            if (tour.length === 0) {
                tourBlock.innerHTML += '<p>Нет матчей в этом туре.</p>';
            } else {
                tour.forEach((match, matchIndex) => {
                    const matchDiv = document.createElement('div');
                    matchDiv.classList.add('match');

                    let scoreDisplay = '';
                    if (match.score === 'BYE') {
                        scoreDisplay = 'BYE';
                    } else if (match.score1 !== null && match.score2 !== null) {
                        scoreDisplay = `${match.score1} : ${match.score2}`;
                    } else {
                        scoreDisplay = '- : -';
                    }

                    const team1Display = match.team1 === 'BYE' ? 'BYE' : match.team1;
                    const team2Display = match.team2 === 'BYE' ? 'BYE' : match.team2;

                    matchDiv.innerHTML = `
                        <div class="match-teams">
                            <span class="team-name">${team1Display}</span>
                            ${match.spotify1 ? `<a href="${match.spotify1}" target="_blank" class="spotify-link">🎵</a>` : '<span class="spotify-link"></span>'}
                        </div>
                        <div class="score-display">${scoreDisplay}</div>
                        <div class="match-teams">
                             ${match.spotify2 ? `<a href="${match.spotify2}" target="_blank" class="spotify-link">🎵</a>` : '<span class="spotify-link"></span>'}
                            <span class="team-name">${team2Display}</span>
                        </div>
                    `;
                    tourBlock.appendChild(matchDiv);
                });
            }
            fullScheduleContent.appendChild(tourBlock);
        });
    }

    /**
     * Сбрасывает все данные и возвращает интерфейс в начальное состояние.
     */
    function resetTournament() {
        if (confirm('Вы уверены, что хотите сбросить все данные турнира?')) {
            tournamentData = {
                teams: [],
                schedule: [],
                standings: {},
                currentTourIndex: 0,
                roundRobinTeams: [],
                numMatchesPerTour: 0,
                totalTours: 0
            };
            teamsInput.value = '';
            standingsBody.innerHTML = '';
            currentTourNumSpan.textContent = '1';
            totalToursNumSpan.textContent = '0';
            document.getElementById('currentTourOutput').innerHTML = '';
            tourStatsDiv.textContent = '';
            tourJumpInput.value = '';

            prevTourBtn.disabled = true;
            nextTourBtn.disabled = true;
            generateBtn.disabled = false; // Можно снова генерировать

            // Сбрасываем стили сортировки
            document.getElementById('sortByNameBtn').classList.remove('active');
            document.getElementById('sortByPointsBtn').classList.remove('active');

            // Удаляем сохраненные данные из localStorage
            localStorage.removeItem('tournamentData');
        }
    }

    /**
     * Сохраняет текущее состояние турнира в localStorage.
     */
    function saveData() {
        try {
            localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
        } catch (e) {
            console.error("Ошибка сохранения данных в localStorage:", e);
        }
    }

    /**
     * Загружает данные турнира из localStorage.
     */
    function loadData() {
        const savedData = localStorage.getItem('tournamentData');
        if (savedData) {
            try {
                tournamentData = JSON.parse(savedData);
                // Восстанавливаем DOM элементы
                teamsInput.value = tournamentData.teams.join('\n');
                renderStandings();
                displayTour(tournamentData.currentTourIndex);
                updateTourNavigation();
                enableButtons();
                // Если данные были загружены, значит, турнир уже был сгенерирован
                if (tournamentData.teams.length > 0) {
                     generateBtn.disabled = true; // Отключаем кнопку генерации, если есть сохраненные данные
                }

            } catch (e) {
                console.error("Ошибка загрузки данных из localStorage:", e);
                localStorage.removeItem('tournamentData'); // Удаляем некорректные данные
            }
        } else {
             // Если данных нет, устанавливаем начальные значения
             resetTournament(); // Это также очистит localStorage
             // Но чтобы избежать двойного сброса, можно просто оставить кнопки активными
             generateBtn.disabled = false;
        }
    }

    /**
     * Включает/отключает кнопки в зависимости от состояния турнира.
     */
    function enableButtons() {
        const hasTeams = tournamentData.teams.length > 0;
        const hasSchedule = tournamentData.schedule.length > 0;

        generateBtn.disabled = hasTeams; // Отключаем, если команды уже есть
        resetBtn.disabled = !hasTeams;

        prevTourBtn.disabled = !hasSchedule || tournamentData.currentTourIndex === 0;
        nextTourBtn.disabled = !hasSchedule || tournamentData.currentTourIndex >= tournamentData.totalTours - 1;
        tourJumpInput.disabled = !hasSchedule;
        jumpToTourBtn.disabled = !hasSchedule;
        showFullScheduleBtn.disabled = !hasSchedule;

        // Включаем/отключаем поля ввода счета
        document.querySelectorAll('.schedule-section input[type="number"]').forEach(input => {
             input.disabled = tournamentData.schedule.length === 0 || input.closest('tr').querySelector('.match-teams .team-name').textContent === 'BYE';
        });
        document.querySelectorAll('.spotify-link-input').forEach(input => {
             input.disabled = tournamentData.schedule.length === 0;
        });
    }

    // --- Обработчики событий ---

    generateBtn.addEventListener('click', initializeTournament);
    resetBtn.addEventListener('click', resetTournament);

    prevTourBtn.addEventListener('click', () => {
        if (tournamentData.currentTourIndex > 0) {
            tournamentData.currentTourIndex--;
            displayTour(tournamentData.currentTourIndex);
            updateTourNavigation();
            saveData();
        }
    });

    nextTourBtn.addEventListener('click', () => {
        if (tournamentData.currentTourIndex < tournamentData.totalTours - 1) {
            tournamentData.currentTourIndex++;
            displayTour(tournamentData.currentTourIndex);
            updateTourNavigation();
            saveData();
        }
    });

    jumpToTourBtn.addEventListener('click', () => {
        const tourNum = parseInt(tourJumpInput.value);
        if (!isNaN(tourNum) && tourNum >= 1 && tourNum <= tournamentData.totalTours) {
            tournamentData.currentTourIndex = tourNum - 1;
            displayTour(tournamentData.currentTourIndex);
            updateTourNavigation();
            scrollToActiveMatch(); // Прокрутка к первому активному матчу после перехода
            saveData();
        } else {
            alert(`Пожалуйста, введите номер тура от 1 до ${tournamentData.totalTours}.`);
        }
    });

    showFullScheduleBtn.addEventListener('click', () => {
        renderFullScheduleModal();
        fullScheduleModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        fullScheduleModal.style.display = 'none';
    });

    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener('click', (event) => {
        if (event.target === fullScheduleModal) {
            fullScheduleModal.style.display = 'none';
        }
    });

    // Обработчик ввода счета
    function handleScoreInput(event) {
        const input = event.target;
        const tourIndex = parseInt(input.dataset.tourIndex);
        const matchIndex = parseInt(input.dataset.matchIndex);
        const team = input.dataset.team;
        const value = parseInt(input.value);

        // Очищаем предыдущее значение, если введено некорректное (не число или отрицательное)
        if (isNaN(value) || value < 0) {
            input.value = ''; // Очищаем поле
            // Обновляем данные матча, устанавливая счет в null
            tournamentData.schedule[tourIndex][matchIndex][team === 'team1' ? 'score1' : 'score2'] = null;
            saveData(); // Сохраняем изменения
            return;
        }

        // Обновляем значение в объекте данных
        tournamentData.schedule[tourIndex][matchIndex][team === 'team1' ? 'score1' : 'score2'] = value;

        // Если оба поля счета заполнены, автоматически "сохраняем" (обновляем статистику и рендерим)
        const match = tournamentData.schedule[tourIndex][matchIndex];
        if (match.score1 !== null && match.score2 !== null) {
            handleSaveScore({ target: input.closest('tr').querySelector('button') }); // Имитируем клик по кнопке "Сохранить"
        }

        saveData(); // Сохраняем после каждого ввода
    }

    // Обработчик для полей Spotify URL
    document.body.addEventListener('input', (event) => {
        if (event.target.classList.contains('spotify-link-input')) {
            const input = event.target;
            const tourIndex = parseInt(input.dataset.tourIndex);
            const matchIndex = parseInt(input.dataset.matchIndex);
            const team = input.dataset.team;

            // Обновляем URL в данных матча
            tournamentData.schedule[tourIndex][matchIndex][team === 'team1' ? 'spotify1' : 'spotify2'] = input.value;
            saveData();
        }
    });

    // Обработчик нажатия кнопки "Сохранить"
    function handleSaveScore(event) {
        const button = event.target;
        const tourIndex = parseInt(button.dataset.tourIndex);
        const matchIndex = parseInt(button.dataset.matchIndex);

        const match = tournamentData.schedule[tourIndex][matchIndex];

        // Проверяем, введены ли оба счета
        if (match.score1 === null || match.score2 === null) {
            alert('Пожалуйста, введите счет для обеих команд.');
            return;
        }

        // Обновляем статистику турнира
        updateStandings(match);
        // Перерисовываем таблицу результатов
        renderStandings();
        // Перерисовываем текущий тур (чтобы обновить состояние счетчиков и отключить кнопки)
        displayTour(tournamentData.currentTourIndex);
        // Обновляем навигацию
        updateTourNavigation();
        // Обновляем статистику тура
        const tourStatsMessage = checkTourStats(tournamentData.currentTourIndex);
        tourStatsDiv.innerHTML = tourStatsMessage;
        if (tourStatsMessage.includes('Ошибка')) {
            tourStatsDiv.classList.add('error');
        } else {
            tourStatsDiv.classList.remove('error');
        }

        saveData(); // Сохраняем после сохранения счета

        // Если все матчи в туре заполнены, можем автоматически перейти к следующему туру
        // (Опционально, можно добавить эту логику)
        const currentTour = tournamentData.schedule[tournamentData.currentTourIndex];
        const allScoresFilledInTour = currentTour.every(m => m.score === 'BYE' || (m.score1 !== null && m.score2 !== null));
        if (allScoresFilledInTour && tournamentData.currentTourIndex < tournamentData.totalTours - 1) {
             // Можно автоматически перейти к следующему туру
             // tournamentData.currentTourIndex++;
             // displayTour(tournamentData.currentTourIndex);
             // updateTourNavigation();
             // scrollToActiveMatch(); // Прокрутка к первому матчу нового тура
        }
    }

    // --- Обработчики сортировки таблицы ---
    sortByNameBtn.addEventListener('click', () => {
        sortByColumn(1); // Индекс колонки "Команда"
        sortByNameBtn.classList.add('active');
        sortByPointsBtn.classList.remove('active');
    });

    sortByPointsBtn.addEventListener('click', () => {
        sortByColumn(9); // Индекс колонки "Очки"
        sortByPointsBtn.classList.add('active');
        sortByNameBtn.classList.remove('active');
    });

    // Функция для сортировки таблицы по клику на заголовок
    function sortByColumn(columnIndex) {
        const table = standingsBody.parentElement.querySelector('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // Определяем направление сортировки (по возрастанию или убыванию)
        // Это упрощенная логика, в реальных приложениях нужно хранить направление
        const currentSortOrder = table.dataset.sortOrder === 'asc' ? 'asc' : 'desc';
        const newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        table.dataset.sortOrder = newSortOrder;

        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[columnIndex].textContent;
            const cellB = rowB.cells[columnIndex].textContent;

            // Преобразование в число, если возможно
            const numA = parseFloat(cellA);
            const numB = parseFloat(cellB);

            if (!isNaN(numA) && !isNaN(numB)) {
                return newSortOrder === 'asc' ? numA - numB : numB - numA;
            } else {
                // Сравнение строк
                return newSortOrder === 'asc' ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            }
        });

        // Перезаписываем строки в tbody
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));

        // Обновляем номера строк и зоны вылета/стыков после сортировки
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1; // Обновляем #
            const rowIndex = index + 1;
             row.classList.remove('relegation', 'relegation-playoff'); // Снимаем старые классы
            if (rowIndex >= 121 && rowIndex <= 150) {
                row.classList.add('relegation');
            } else if (rowIndex >= 101 && rowIndex <= 120) {
                row.classList.add('relegation-playoff');
            }
        });
    }

    // --- Инициализация при загрузке страницы ---
    loadData(); // Загружаем сохраненные данные при старте
    if (tournamentData.teams.length === 0) { // Если данных нет, включаем кнопку генерации
        generateBtn.disabled = false;
    }

    // Это конец скрипта. Весь основной функционал реализован.
    // Если будут новые задачи, они могут быть добавлены здесь.
});
