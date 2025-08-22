document.addEventListener('DOMContentLoaded', () => {
    const teamsInput = document.getElementById('teamsInput');
    const generateBtn = document.getElementById('generateBtn');
    const scheduleOutput = document.getElementById('scheduleOutput');
    const standingsBody = document.getElementById('standingsBody');

    let schedule = []; // Будет хранить сгенерированное расписание
    let teams = []; // Список команд

    // Загружаем данные при старте (если есть)
    loadData();
    if (schedule.length > 0) {
        renderSchedule(schedule, teams);
        calculateAndRenderStandings();
    }


    generateBtn.addEventListener('click', () => {
        const rawTeams = teamsInput.value.split('\n').map(team => team.trim()).filter(team => team !== '');
        if (rawTeams.length < 2) {
            alert('Пожалуйста, введите как минимум две команды.');
            return;
        }

        teams = rawTeams; // Сохраняем актуальный список команд
        schedule = generateRoundRobinSchedule(teams);
        renderSchedule(schedule, teams);
        calculateAndRenderStandings();
        saveData(); // Сохраняем сразу после генерации
    });

    // Функция для генерации расписания по методу поворота
    function generateRoundRobinSchedule(teamNames) {
        let currentTeams = [...teamNames]; // Копия для манипуляций
        const n = currentTeams.length;
        const generatedSchedule = [];

        // Добавляем фиктивную команду, если число команд нечетное
        if (n % 2 !== 0) {
            currentTeams.push('BYE');
        }

        const numTeams = currentTeams.length; // Актуальное число команд (четное)
        const numRounds = numTeams - 1;

        for (let round = 0; round < numRounds; round++) {
            const currentRoundMatches = [];
            for (let i = 0; i < numTeams / 2; i++) {
                const team1 = currentTeams[i];
                const team2 = currentTeams[numTeams - 1 - i];

                if (team1 !== 'BYE' && team2 !== 'BYE') {
                    currentRoundMatches.push({
                        home: team1,
                        away: team2,
                        homeScore: null,
                        awayScore: null
                    });
                }
            }
            generatedSchedule.push(currentRoundMatches);

            // Поворот команд (кроме первой)
            const fixedTeam = currentTeams[0];
            const rotatingTeams = currentTeams.slice(1);
            rotatingTeams.unshift(rotatingTeams.pop()); // Перемещаем последний элемент в начало
            currentTeams = [fixedTeam, ...rotatingTeams];
        }
        return generatedSchedule;
    }

    // Функция для отображения расписания на странице
    function renderSchedule(scheduleData, teamNames) {
        scheduleOutput.innerHTML = ''; // Очищаем предыдущее расписание

        if (scheduleData.length === 0) {
            return;
        }

        teamNames.forEach((team, index) => {
            if (teamsInput.value.split('\n').map(t => t.trim()).filter(t => t !== '').indexOf(team) === -1) {
                // Если команда была добавлена как BYE, не отображаем ее в инпуте
            } else {
                // Если команды в инпуте нет, то ее не нужно туда добавлять
            }
        });

        teamsInput.value = teamNames.filter(t => t !== 'BYE').join('\n'); // Обновляем инпут на случай добавления BYE

        scheduleData.forEach((roundMatches, roundIndex) => {
            const tourDiv = document.createElement('div');
            tourDiv.classList.add('tour');
            tourDiv.innerHTML = `<h3>Тур ${roundIndex + 1}</h3>`;

            roundMatches.forEach((match, matchIndex) => {
                const matchDiv = document.createElement('div');
                matchDiv.classList.add('match');
                matchDiv.innerHTML = `
                    <span>${match.home}</span>
                    <input type="number" class="score-input" min="0" data-round="${roundIndex}" data-match="${matchIndex}" data-team="home" value="${match.homeScore !== null ? match.homeScore : ''}">
                    <span>:</span>
                    <input type="number" class="score-input" min="0" data-round="${roundIndex}" data-match="${matchIndex}" data-team="away" value="${match.awayScore !== null ? match.awayScore : ''}">
                    <span>${match.away}</span>
                `;
                tourDiv.appendChild(matchDiv);
            });
            scheduleOutput.appendChild(tourDiv);
        });

        // Добавляем слушателей событий для полей ввода счета
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('input', updateScoreAndStandings);
        });
    }

    // Обновление счета и пересчет таблицы
    function updateScoreAndStandings(event) {
        const input = event.target;
        const roundIndex = parseInt(input.dataset.round);
        const matchIndex = parseInt(input.dataset.match);
        const teamType = input.dataset.team;
        const score = input.value === '' ? null : parseInt(input.value);

        schedule[roundIndex][matchIndex][`${teamType}Score`] = score;
        saveData(); // Сохраняем после каждого изменения
        calculateAndRenderStandings();
    }

    // Функция для расчета и отображения турнирной таблицы
    function calculateAndRenderStandings() {
        const standings = {};
        teams.filter(t => t !== 'BYE').forEach(team => {
            standings[team] = { P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
        });

        schedule.forEach(roundMatches => {
            roundMatches.forEach(match => {
                const homeTeam = match.home;
                const awayTeam = match.away;
                const homeScore = match.homeScore;
                const awayScore = match.awayScore;

                if (homeScore === null || awayScore === null) {
                    return; // Пропускаем матчи без введенных счетов
                }

                standings[homeTeam].P++;
                standings[awayTeam].P++;
                standings[homeTeam].GF += homeScore;
                standings[homeTeam].GA += awayScore;
                standings[awayTeam].GF += awayScore;
                standings[awayTeam].GA += homeScore;

                if (homeScore > awayScore) {
                    standings[homeTeam].W++;
                    standings[homeTeam].Pts += 3;
                    standings[awayTeam].L++;
                } else if (homeScore < awayScore) {
                    standings[awayTeam].W++;
                    standings[awayTeam].Pts += 3;
                    standings[homeTeam].L++;
                } else {
                    standings[homeTeam].D++;
                    standings[homeTeam].Pts += 1;
                    standings[awayTeam].D++;
                    standings[awayTeam].Pts += 1;
                }
            });
        });

        // Рассчитываем разницу мячей
        for (const team in standings) {
            standings[team].GD = standings[team].GF - standings[team].GA;
        }

        // Сортируем команды: сначала по очкам, потом по разнице мячей, потом по забитым голам
        const sortedStandings = Object.entries(standings).sort((a, b) => {
            const teamA = a[1];
            const teamB = b[1];
            if (teamA.Pts !== teamB.Pts) return teamB.Pts - teamA.Pts;
            if (teamA.GD !== teamB.GD) return teamB.GD - teamA.GD;
            return teamB.GF - teamA.GF;
        });

        standingsBody.innerHTML = '';
        sortedStandings.forEach(([teamName, stats]) => {
            const row = standingsBody.insertRow();
            row.innerHTML = `
                <td>${teamName}</td>
                <td>${stats.P}</td>
                <td>${stats.W}</td>
                <td>${stats.D}</td>
                <td>${stats.L}</td>
                <td>${stats.GF}</td>
                <td>${stats.GA}</td>
                <td>${stats.GD}</td>
                <td>${stats.Pts}</td>
            `;
        });
    }

    // Сохранение данных в localStorage
    function saveData() {
        localStorage.setItem('tournamentTeams', JSON.stringify(teams));
        localStorage.setItem('tournamentSchedule', JSON.stringify(schedule));
    }

    // Загрузка данных из localStorage
    function loadData() {
        const savedTeams = localStorage.getItem('tournamentTeams');
        const savedSchedule = localStorage.getItem('tournamentSchedule');
        if (savedTeams) {
            teams = JSON.parse(savedTeams);
            teamsInput.value = teams.filter(t => t !== 'BYE').join('\n');
        }
        if (savedSchedule) {
            schedule = JSON.parse(savedSchedule);
        }
    }
});
