// --- Переменные ---
let teams = []; // Массив названий команд
let schedule = []; // Массив всех туров, каждый тур - массив матчей. Пример: [[{team1, team2, score1, score2, spotify1, spotify2}, ...], ...]
let currentTourIndex = 0; // Индекс текущего отображаемого тура (начинается с 0)
let totalTours = 0; // Общее количество туров

// --- Элементы DOM (получаем ссылки на HTML-элементы) ---
const teamsInput = document.getElementById('teamsInput');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const standingsOutput = document.getElementById('standingsOutput');
const standingsBody = document.getElementById('standingsBody');
const currentTourNumSpan = document.getElementById('currentTourNum');
const totalToursNumSpan = document.getElementById('totalToursNum');
const tourStatsMessageSpan = document.getElementById('tourStatsMessage');
const prevTourBtn = document.getElementById('prevTourBtn');
const nextTourBtn = document.getElementById('nextTourBtn');
const tourJumpInput = document.getElementById('tourJumpInput');
const jumpToTourBtn = document.getElementById('jumpToTourBtn');
const showFullScheduleBtn = document.getElementById('showFullScheduleBtn');
const currentTourOutput = document.getElementById('currentTourOutput');
const fullScheduleModal = document.getElementById('fullScheduleModal');
const fullScheduleContent = document.getElementById('fullScheduleContent');
const closeButton = document.querySelector('.modal-content .close-button');

// --- Основная логика ---

// Инициализация: загрузка данных при старте страницы
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Привязка событий
    generateBtn.addEventListener('click', generateRoundRobinSchedule);
    resetBtn.addEventListener('click', resetData);
    prevTourBtn.addEventListener('click', () => navigateTour(-1));
    nextTourBtn.addEventListener('click', () => navigateTour(1));
    jumpToTourBtn.addEventListener('click', jumpToTour);
    showFullScheduleBtn.addEventListener('click', showFullSchedule);
    closeButton.addEventListener('click', () => fullScheduleModal.style.display = 'none');
    // Закрытие модального окна по клику вне содержимого
    window.addEventListener('click', (event) => {
        if (event.target === fullScheduleModal) {
            fullScheduleModal.style.display = 'none';
        }
    });
});

// Инициализация: загрузка данных из localStorage
function init() {
    const savedTeams = localStorage.getItem('tournamentTeams');
    const savedSchedule = localStorage.getItem('tournamentSchedule');
    const savedCurrentTour = localStorage.getItem('tournamentCurrentTourIndex');

    if (savedTeams) {
        teams = JSON.parse(savedTeams);
        teamsInput.value = teams.join('\n');
    }

    if (savedSchedule) {
        schedule = JSON.parse(savedSchedule);
        if (schedule.length > 0) {
            totalTours = schedule.length;
            // Если есть сохраненный индекс тура, используем его, иначе 0
            currentTourIndex = savedCurrentTour ? parseInt(savedCurrentTour) : 0;
            // Убеждаемся, что currentTourIndex в допустимых пределах
            if (currentTourIndex >= totalTours) currentTourIndex = 0;
            updateUI(); // Обновляем кнопки и номера туров
            loadTour(currentTourIndex); // Загружаем матчи текущего тура
        } else {
            // Если есть сохраненные команды, но расписание пустое (например, после сброса)
            if (teams.length > 0) {
                generateBtn.disabled = false; // Разрешаем генерацию
            }
        }
    } else {
        // Если ничего не сохранено, проверяем ввод команд
        if (teams.length > 0) {
             generateBtn.disabled = false;
        } else {
             generateBtn.disabled = true; // Кнопка генерации отключена, если нет команд
        }
    }
    // Если команд нет, кнопка генерации должна быть неактивна
    if (teams.length === 0) {
        generateBtn.disabled = true;
    }
}

// Генерация расписания Round Robin
function generateRoundRobinSchedule() {
    const inputText = teamsInput.value.trim();
    if (!inputText) {
        alert("Пожалуйста, введите названия команд.");
        return;
    }
    teams = inputText.split('\n').map(team => team.trim()).filter(team => team);
    if (teams.length < 2) {
        alert("Для турнира нужно минимум 2 команды.");
        return;
    }

    // Сохраняем введенные команды в localStorage
    localStorage.setItem('tournamentTeams', JSON.stringify(teams));

    schedule = []; // Очищаем предыдущее расписание
    totalTours = teams.length - 1; // Количество туров равно N-1 для N команд
    const numTeams = teams.length;

    // Если количество команд нечетное, добавляем "виртуальную" команду для баланса
    const tempTeams = [...teams];
    if (numTeams % 2 !== 0) {
        tempTeams.push("BYE"); // "BYE" означает, что команда пропускает тур
    }

    const numTeamsForSchedule = tempTeams.length; // Общее количество команд для алгоритма (может быть N+1)
    const half = numTeamsForSchedule / 2;

    // Создаем массив индексов команд для алгоритма
    const teamIndices = Array.from({ length: numTeamsForSchedule }, (_, i) => i);

    // Основной цикл генерации туров
    for (let tour = 0; tour < totalTours; tour++) {
        const currentTourMatches = [];
        const round = []; // Для внутренней логики алгоритма

        // Алгоритм Round Robin: фиксируем первую команду, остальные циклически сдвигаются
        // В каждом туре первая команда (индекс 0) остается на месте,
        // остальные команды (индексы 1..N-1) циклически сдвигаются.
        // Для нечетного числа команд "BYE" команда также участвует в сдвиге.
        const firstTeamIndex = teamIndices[0]; // Индекс первой команды (фиксируется)
        const rotatingTeamIndices = teamIndices.slice(1); // Остальные команды

        // Сдвиг команд: последние 'half - 1' команды перемещаются в начало,
        // а первые 'half - 1' команды перемещаются в конец.
        // Это гарантирует, что каждая команда сыграет с каждой другой командой.
        const rotatedIndices = [
            firstTeamIndex, // Фиксированная команда
            ...rotatingTeamIndices.slice(-half + 1), // Команды, перешедшие из конца
            ...rotatingTeamIndices.slice(0, -half + 1) // Команды, перешедшие из начала
        ];
        teamIndices.splice(0, numTeamsForSchedule, ...rotatedIndices); // Обновляем teamIndices для следующего тура

        // Формируем пары матчей для текущего тура
        for (let i = 0; i < half; i++) {
            const team1Index = teamIndices[i];
            const team2Index = teamIndices[numTeamsForSchedule - 1 - i]; // Противоположная команда

            // Пропускаем матчи, если одна из команд "BYE"
            if (tempTeams[team1Index] !== "BYE" && tempTeams[team2Index] !== "BYE") {
                currentTourMatches.push({
                    team1: tempTeams[team1Index],
                    team2: tempTeams[team2Index],
                    score1: null, // Изначально счет пустой
                    score2: null,
                    spotify1: "", // Поле для Spotify ссылки команды 1 (пусто по умолчанию)
                    spotify2: ""  // Поле для Spotify ссылки команды 2 (пусто по умолчанию)
                });
            }
        }
        schedule.push(currentTourMatches); // Добавляем сформированный тур в общее расписание
    }

    // Сохраняем сгенерированное расписание в localStorage
    localStorage.setItem('tournamentSchedule', JSON.stringify(schedule));

    currentTourIndex = 0; // Сбрасываем на первый тур после генерации
    updateUI(); // Обновляем интерфейс (кнопки, номера туров)
    loadTour(currentTourIndex); // Загружаем матчи первого тура
}

// Обновление UI: кнопки навигации, номера туров, статус кнопки генерации
function updateUI() {
    currentTourNumSpan.textContent = totalTours > 0 ? currentTourIndex + 1 : 0;
    totalToursNumSpan.textContent = totalTours;

    // Управление кнопками навигации по турам
    prevTourBtn.disabled = currentTourIndex === 0;
    nextTourBtn.disabled = currentTourIndex === totalTours - 1;

    // Управление кнопкой генерации: активна, если есть команды, но нет расписания
    generateBtn.disabled = teams.length === 0 || schedule.length > 0;

    // Показываем/скрываем секцию турнирной таблицы
    if (teams.length > 0 && schedule.length > 0) {
        standingsOutput.style.display = 'block';
        generateStandingsTable(); // Генерируем и отображаем таблицу
    } else {
        standingsOutput.style.display = 'none'; // Скрываем, если нет данных
    }
}

// Загрузка матчей текущего тура на страницу
function loadTour(tourIndex) {
    // Проверка на корректность индекса тура и наличие расписания
    if (tourIndex < 0 || tourIndex >= totalTours || !schedule || schedule.length === 0) {
        currentTourOutput.innerHTML = '<p>Расписание еще не сгенерировано или не найдено.</p>';
        return;
    }

    currentTourIndex = tourIndex; // Устанавливаем текущий индекс тура
    currentTourNumSpan.textContent = currentTourIndex + 1; // Обновляем номер тура в UI
    // Обновляем статус кнопок навигации
    prevTourBtn.disabled = currentTourIndex === 0;
    nextTourBtn.disabled = currentTourIndex === totalTours - 1;
    tourJumpInput.value = ''; // Очищаем поле ввода номера тура

    const matches = schedule[currentTourIndex]; // Получаем матчи текущего тура
    currentTourOutput.innerHTML = ''; // Очищаем предыдущее расписание

    let firstUnscoredMatchElement = null; // Ссылка на DOM-элемент первого матча без счета

    // Перебираем матчи текущего тура для их отображения
    matches.forEach((match, matchIndex) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';

        const matchInfoDiv = document.createElement('div');
        matchInfoDiv.className = 'match-info';

        // Создание Spotify ссылки слева
        const spotifyLeft = document.createElement('a');
        spotifyLeft.href = match.spotify1 || '#'; // Используем сохраненную ссылку или '#' как запасной вариант
        spotifyLeft.className = 'team-spotify-link left';
        spotifyLeft.textContent = '♪'; // Символ для обозначения ссылки
        spotifyLeft.target = '_blank'; // Открывать в новой вкладке
        // Прикрепляем атрибуты для идентификации матча и команды (для будущей обработки)
        spotifyLeft.setAttribute('data-match-index', matchIndex);
        spotifyLeft.setAttribute('data-team', '1');
        if (!match.spotify1) spotifyLeft.style.display = 'none'; // Скрываем, если ссылки нет

        // Элемент для названия первой команды
        const team1NameSpan = document.createElement('span');
        team1NameSpan.className = 'team-name';
        team1NameSpan.textContent = match.team1;
        team1NameSpan.title = match.team1; // Всплывающая подсказка с полным названием

        // Контейнер для ввода счетов
        const scoreInputContainer = document.createElement('div');
        scoreInputContainer.className = 'score-input-container';

        // Поле ввода для счета первой команды
        const score1Input = document.createElement('input');
        score1Input.type = 'number'; // Тип для ввода чисел
        score1Input.className = 'score-input';
        score1Input.min = '0'; // Минимальное значение счета
        score1Input.value = match.score1 !== null ? match.score1 : ''; // Устанавливаем значение, если есть
        score1Input.placeholder = '0'; // Placeholder для пустого поля
        // Атрибуты для идентификации
        score1Input.setAttribute('data-match-index', matchIndex);
        score1Input.setAttribute('data-team', '1');
        score1Input.addEventListener('change', handleScoreChange); // Обработчик на изменение значения
        // Если счет уже введен, убедимся, что min=0
        if (match.score1 !== null) score1Input.min = '0';

        const scoreSeparator = document.createElement('span'); // Разделитель между счетами
        scoreSeparator.textContent = ':';
        scoreSeparator.style.fontSize = '1.2rem';

        // Поле ввода для счета второй команды
        const score2Input = document.createElement('input');
        score2Input.type = 'number';
        score2Input.className = 'score-input';
        score2Input.min = '0';
        score2Input.value = match.score2 !== null ? match.score2 : '';
        score2Input.placeholder = '0';
        score2Input.setAttribute('data-match-index', matchIndex);
        score2Input.setAttribute('data-team', '2');
        score2Input.addEventListener('change', handleScoreChange);
        if (match.score2 !== null) score2Input.min = '0';

        // Создание Spotify ссылки справа
        const spotifyRight = document.createElement('a');
        spotifyRight.href = match.spotify2 || '#';
        spotifyRight.className = 'team-spotify-link right';
        spotifyRight.textContent = '♪';
        spotifyRight.target = '_blank';
        spotifyRight.setAttribute('data-match-index', matchIndex);
        spotifyRight.setAttribute('data-team', '2');
        if (!match.spotify2) spotifyRight.style.display = 'none';

        // Элемент для названия второй команды
        const team2NameSpan = document.createElement('span');
        team2NameSpan.className = 'team-name';
        team2NameSpan.textContent = match.team2;
        team2NameSpan.title = match.team2;

        // --- Сборка блока с информацией о матче ---
        matchInfoDiv.appendChild(spotifyLeft);
        matchInfoDiv.appendChild(team1NameSpan);
        matchInfoDiv.appendChild(scoreInputContainer);
        scoreInputContainer.appendChild(score1Input);
        scoreInputContainer.appendChild(scoreSeparator);
        scoreInputContainer.appendChild(score2Input);
        matchInfoDiv.appendChild(spotifyRight);
        matchInfoDiv.appendChild(team2NameSpan);

        matchDiv.appendChild(matchInfoDiv); // Добавляем блок информации о матче в div матча

        // --- Определение первого незаполненного матча для автоматической прокрутки ---
        if ((match.score1 === null || match.score2 === null) && firstUnscoredMatchElement === null) {
            // Если счет не введен, сохраняем ссылку на этот матч
            // Не создаем DOM-элемент сразу, а сохраняем сам matchDiv, чтобы потом его прокрутить
            firstUnscoredMatchElement = matchDiv;
        }

        currentTourOutput.appendChild(matchDiv); // Добавляем div матча на страницу
    });

    // --- Статистические проверки для текущего тура ---
    checkTourStatistics();

    // --- Автоматическая прокрутка к первому незаполненному матчу ---
    if (firstUnscoredMatchElement) {
        // Используем setTimeout для гарантии, что элемент отрисован
        setTimeout(() => {
            firstUnscoredMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100); // Небольшая задержка в 100ms
    } else if (matches.length > 0) {
        // Если все счета заполнены, прокручиваем к первому матчу тура
        const firstMatchElement = currentTourOutput.children[0];
        if (firstMatchElement) {
            setTimeout(() => {
                firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    // Сохраняем текущий тур в localStorage после загрузки
    localStorage.setItem('tournamentCurrentTourIndex', currentTourIndex);
}

// Обработчик изменения счета в полях ввода
function handleScoreChange(event) {
    const matchIndex = parseInt(event.target.dataset.matchIndex);
    const teamIdentifier = event.target.dataset.team; // '1' или '2'
    const newScoreValue = parseInt(event.target.value);

    // Проверка корректности введенного значения
    if (isNaN(newScoreValue) || newScoreValue < 0) {
        // Сбрасываем поле, если ввод некорректен
        event.target.value = '';
        // Обновляем соответствующий счет в данных, установив null
        const match = schedule[currentTourIndex][matchIndex];
        if (teamIdentifier === '1') {
            match.score1 = null;
        } else {
            match.score2 = null;
        }
    } else {
        // Обновляем счет в массиве schedule
        const match = schedule[currentTourIndex][matchIndex];
        if (teamIdentifier === '1') {
            match.score1 = newScoreValue;
        } else {
            match.score2 = newScoreValue;
        }
    }

    // Проверяем, если счет введен для обоих команд, то обновляем турнирную таблицу
    const currentMatch = schedule[currentTourIndex][matchIndex];
    if (currentMatch.score1 !== null && currentMatch.score2 !== null) {
        generateStandingsTable(); // Обновляем таблицу результатов
        checkTourStatistics();   // Перепроверяем статистику тура после ввода счета
    }

    // Сохраняем обновленное расписание в localStorage
    localStorage.setItem('tournamentSchedule', JSON.stringify(schedule));
}

// --- Статистические проверки для тура ---
function checkTourStatistics() {
    const messageElement = document.getElementById('tourStatsMessage');
    // Если элемента для сообщений нет, выходим
    if (!messageElement) return;

    // Если нет матчей или расписания, очищаем сообщение
    if (!schedule || schedule.length === 0 || !schedule[currentTourIndex]) {
        messageElement.textContent = '';
        return;
    }

    const matches = schedule[currentTourIndex];
    let drawCount = 0; // Счетчик ничьих
    let fourGoalMatches = 0; // Счетчик матчей с ровно 4 голами
    let hasUnscored = false; // Флаг наличия незаполненных матчей

    // Перебираем матчи текущего тура для подсчета статистики
    matches.forEach(match => {
        // Проверяем, только если счет введен для обоих команд
        if (match.score1 !== null && match.score2 !== null) {
            // Проверка на ничью
            if (match.score1 === match.score2) {
                drawCount++;
            }
            // Проверка на общее количество голов равное 4
            if (match.score1 + match.score2 === 4) {
                fourGoalMatches++;
            }
        } else {
            hasUnscored = true; // Найден матч без счета
        }
    });

    let messages = []; // Массив для сообщений об ошибках статистики
    // Правило: не более одной ничьей за тур
    if (drawCount > 1) {
        messages.push(`Внимание: обнаружено ${drawCount} ничьих (допустимо 1).`);
    }
    // Правило: не более шести матчей с 4 голами
    if (fourGoalMatches > 6) {
        messages.push(`Внимание: обнаружено ${fourGoalMatches} матчей с 4 голами (допустимо 6).`);
    }

    // Отображаем соответствующее сообщение
    if (messages.length > 0) {
        // Если есть нарушения правил
        messageElement.textContent = messages.join(' ');
        messageElement.style.color = '#ffcc00'; // Желтый цвет для предупреждений
    } else if (hasUnscored) {
        // Если нет нарушений, но есть незаполненные матчи
        messageElement.textContent = "Некоторые счета не введены.";
        messageElement.style.color = '#888'; // Серый цвет
    } else {
        // Если все в порядке и все счета введены
        messageElement.textContent = "Статистика в норме.";
        messageElement.style.color = '#4CAF50'; // Зеленый цвет
    }
}


// Генерация и отображение турнирной таблицы
function generateStandingsTable() {
    // Проверяем наличие команд
    if (!teams || teams.length === 0) return;

    const standings = {}; // Объект для хранения статистики всех команд

    // Инициализация статистики для каждой команды
    teams.forEach(team => {
        standings[team] = {
            name: team,
            played: 0, // Сыграно матчей
            wins: 0,   // Победы
            draws: 0,  // Ничьи
            losses: 0, // Поражения
            goalsFor: 0, // Забитые голы
            goalsAgainst: 0, // Пропущенные голы
            goalDifference: 0, // Разница мячей
            points: 0 // Очки
        };
    });

    // Обработка всех матчей из всего расписания для подсчета статистики
    schedule.forEach(tour => {
        tour.forEach(match => {
            // Проверяем, если счет введен для обоих команд
            if (match.score1 !== null && match.score2 !== null) {
                const team1 = standings[match.team1];
                const team2 = standings[match.team2];

                // Обновляем количество сыгранных матчей
                team1.played++;
                team2.played++;

                // Обновляем забитые и пропущенные голы
                team1.goalsFor += match.score1;
                team1.goalsAgainst += match.score2;
                team2.goalsFor += match.score2;
                team2.goalsAgainst += match.score1;

                // Определение результата матча и начисление очков
                if (match.score1 > match.score2) { // Победа команды 1
                    team1.wins++;
                    team2.losses++;
                    team1.points += 3;
                } else if (match.score1 < match.score2) { // Победа команды 2
                    team2.wins++;
                    team1.losses++;
                    team2.points += 3;
                } else { // Ничья
                    team1.draws++;
                    team2.draws++;
                    team1.points += 1;
                    team2.points += 1;
                }
            }
        });
    });

    // Расчет разницы мячей и подготовка к сортировке
    const sortedStandings = Object.values(standings).map(team => {
        team.goalDifference = team.goalsFor - team.goalsAgainst;
        return team;
    }).sort((a, b) => { // Сортировка по основным показателям
        if (b.points !== a.points) {
            return b.points - a.points; // 1. По очкам (убывание)
        }
        if (b.goalDifference !== a.goalDifference) {
            return b.goalDifference - a.goalDifference; // 2. По разнице мячей (убывание)
        }
        return b.goalsFor - a.goalsFor; // 3. По забитым мячам (убывание)
    });

    // Очищаем тело таблицы перед заполнением
    standingsBody.innerHTML = '';

    // Заполняем тело таблицы отсортированными данными
    sortedStandings.forEach((team, index) => {
        const row = standingsBody.insertRow(); // Создаем новую строку
        row.setAttribute('data-team-name', team.name); // Атрибут для идентификации команды

        // Определение позиции для зон вылета/стыков
        const position = index + 1;
        if (position >= 101 && position <= 120) {
            row.classList.add('playoff-zone'); // Добавляем класс для зоны стыков
        } else if (position >= 121 && position <= 150) {
            row.classList.add('relegation-zone'); // Добавляем класс для зоны вылета
        }

        // Заполняем ячейки строки
        row.insertCell().textContent = index + 1; // № (позиция)
        row.insertCell().textContent = team.name;
        row.insertCell().textContent = team.played;
        row.insertCell().textContent = team.wins;
        row.insertCell().textContent = team.draws;
        row.insertCell().textContent = team.losses;
        row.insertCell().textContent = team.goalsFor;
        row.insertCell().textContent = team.goalsAgainst;
        row.insertCell().textContent = team.goalDifference;
        row.insertCell().textContent = team.points;
    });
}

// Навигация по турам (prevTourBtn, nextTourBtn)
function navigateTour(direction) {
    const newIndex = currentTourIndex + direction;
    if (newIndex >= 0 && newIndex < totalTours) {
        loadTour(newIndex); // Загружаем новый тур
    }
}

// Переход к конкретному туру по номеру
function jumpToTour() {
    const tourNumber = parseInt(tourJumpInput.value); // Получаем номер тура из поля ввода
    // Проверяем, что введенное значение является числом и в допустимых пределах
    if (!isNaN(tourNumber) && tourNumber >= 1 && tourNumber <= totalTours) {
        loadTour(tourNumber - 1); // Загружаем тур (индексация с 0)
    } else if (tourNumber === 0 && totalTours === 0) { // Специальный случай, если нет туров
        alert("Турнир еще не сгенерирован.");
    }
    else {
        alert(`Пожалуйста, введите номер тура от 1 до ${totalTours}.`);
    }
}

// Отображение полного расписания в модальном окне
function showFullSchedule() {
    if (!schedule || schedule.length === 0) {
        fullScheduleContent.innerHTML = '<p>Полное расписание еще не сгенерировано.</p>';
        fullScheduleModal.style.display = 'block';
        return;
    }

    fullScheduleContent.innerHTML = ''; // Очищаем содержимое модального окна

    // Группируем туры для более удобного отображения
    const tourGroups = [];
    const toursPerGroup = 10; // Количество туров в одной группе
    for (let i = 0; i < schedule.length; i += toursPerGroup) {
        tourGroups.push(schedule.slice(i, i + toursPerGroup));
    }

    tourGroups.forEach((group, groupIndex) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'tour-group'; // Класс для группы туров

        group.forEach((tourMatches, tourIndexInGroup) => {
            const tourOffset = groupIndex * toursPerGroup + tourIndexInGroup; // Общий индекс тура
            const tourSection = document.createElement('div');
            tourSection.className = 'tour-section';

            const tourTitle = document.createElement('h3');
            tourTitle.textContent = `Тур ${tourOffset + 1}`;
            tourSection.appendChild(tourTitle);

            tourMatches.forEach(match => {
                const matchFullDiv = document.createElement('div');
                matchFullDiv.className = 'match-full';

                // Placeholder для Spotify ссылки слева
                const spotifyLeftPlaceholder = document.createElement('span');
                spotifyLeftPlaceholder.className = 'spotify-placeholder';
                if (match.spotify1) { // Если есть ссылка, делаем ее кликабельной
                    const spotifyLeftLink = document.createElement('a');
                    spotifyLeftLink.href = match.spotify1;
                    spotifyLeftLink.target = '_blank';
                    spotifyLeftLink.appendChild(spotifyLeftPlaceholder);
                    matchFullDiv.appendChild(spotifyLeftLink);
                } else {
                    matchFullDiv.appendChild(spotifyLeftPlaceholder); // Просто placeholder, если нет ссылки
                }

                // Названия команд и счет
                const team1Name = document.createElement('span');
                team1Name.className = 'team-name';
                team1Name.textContent = match.team1;
                team1Name.title = match.team1;

                const scoreSpan = document.createElement('span');
                scoreSpan.className = 'score';
                scoreSpan.textContent = match.score1 !== null && match.score2 !== null ? `${match.score1}:${match.score2}` : '-:-';

                const team2Name = document.createElement('span');
                team2Name.className = 'team-name';
                team2Name.textContent = match.team2;
                team2Name.title = match.team2;

                // Placeholder для Spotify ссылки справа
                const spotifyRightPlaceholder = document.createElement('span');
                spotifyRightPlaceholder.className = 'spotify-placeholder';
                if (match.spotify2) {
                    const spotifyRightLink = document.createElement('a');
                    spotifyRightLink.href = match.spotify2;
                    spotifyRightLink.target = '_blank';
                    spotifyRightLink.appendChild(spotifyRightPlaceholder);
                    matchFullDiv.appendChild(spotifyRightLink);
                } else {
                    matchFullDiv.appendChild(spotifyRightPlaceholder);
                }


                matchFullDiv.appendChild(team1Name);
                matchFullDiv.appendChild(scoreSpan);
                matchFullDiv.appendChild(team2Name);

                tourSection.appendChild(matchFullDiv);
            });
            groupDiv.appendChild(tourSection);
        });
        fullScheduleContent.appendChild(groupDiv);
    });


    fullScheduleModal.style.display = 'block'; // Показываем модальное окно
}

// Сброс всех данных (команд, расписания, настроек)
function resetData() {
    if (confirm("Вы уверены, что хотите сбросить все данные турнира? Это действие нельзя отменить.")) {
        // Очищаем localStorage
        localStorage.removeItem('tournamentTeams');
        localStorage.removeItem('tournamentSchedule');
        localStorage.removeItem('tournamentCurrentTourIndex');

        // Сбрасываем переменные в памяти
        teams = [];
        schedule = [];
        currentTourIndex = 0;
        totalTours = 0;

        // Очищаем поля ввода и вывода
        teamsInput.value = '';
        currentTourOutput.innerHTML = '';
        standingsBody.innerHTML = '';
        currentTourNumSpan.textContent = '0';
        totalToursNumSpan.textContent = '0';
        tourStatsMessageSpan.textContent = '';

        // Сбрасываем кнопки и отключаем их, если нужно
        generateBtn.disabled = true;
        prevTourBtn.disabled = true;
        nextTourBtn.disabled = true;
        tourJumpInput.value = '';
        standingsOutput.style.display = 'none'; // Скрываем таблицу

        alert("Данные турнира сброшены.");
    }
}

// --- Вспомогательные функции (могут понадобиться в будущем) ---

// Функция для добавления/редактирования Spotify ссылок (если понадобится)
function editSpotifyLinks() {
    // Эта функция может быть реализована для интерактивного добавления ссылок
    // Например, при клике на '♪' открывалось бы модальное окно для ввода URL.
    // Сейчас ссылки можно только ввести при первоначальном формировании или если они уже есть в localStorage.
}

// --- Исполнение скрипта ---
// init() вызывается после DOMContentLoaded, чтобы гарантировать доступность всех элементов.

// В данный момент скрипт функционально закончен в рамках поставленных задач.
// Если потребуются дополнительные функции, они могут быть добавлены после этой строки.
