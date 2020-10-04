const form = document.querySelector('form');
const team1 = document.querySelector('#team1');
const team2 = document.querySelector('#team2');
let matches = JSON.parse(localStorage.getItem('matches')) || [];
let endedMatches = JSON.parse(localStorage.getItem('endedMatches')) || [];
let scores = JSON.parse(localStorage.getItem('scores')) || [];
let teams = JSON.parse(localStorage.getItem('teams')) ||[];
if (!teams.length) {
    Array.from(document.querySelector('#team1').options)
        .forEach(option => {
            const team = {
                name: option.value,
                numberOfMatches: 0,
                numberOfVictories: 0,
                numberOfLost: 0,
                numberOfDraws: 0,
                scores: 0
            }
            teams.push(team);
        });
}
localStorage.setItem('teams', JSON.stringify(teams));
let comingMatches = document.querySelector('#coming-matches');
let closedMatches = document.querySelector('#closed-matches');
let timeLeftTab = [];
//create new match
function saveMatch(e) {
    console.log('Saved match');
    const team1 = document.querySelector('#team1').value; 
    const team2 = document.querySelector('#team2').value;
    //prevent adding match when opposite team is same as team1
    if (team1 == team2) {
        alert('Wprowadzno dwa razy tę samą drużynę');
        return;
    }
    const date = document.querySelector('#date').value; 
    const hour = document.querySelector('#hour').value; 
    const id =  '_' + Math.random().toString(36).substr(2, 9);
    let match = {
        id,
        team1,
        team2,
        date,
        hour,
        status:'open'
    }
    matches.push(match);
    matches = sortingByDate(matches, true);
    localStorage.setItem('matches', JSON.stringify(matches));
    form.reset();
    writeMatches();
    e.preventDefault();
}
//display created matches
function writeMatches() {
    comingMatches.innerHTML = '<h2>Nadchodzące mecze</h2>';
    matches.forEach(match => {
        let id = match.id;
        let team1 = match.team1;
        let team2 = match.team2;
        let date = match.date;
        let hour = match.hour;
        comingMatches.innerHTML += `<div class="match">
    <h4>${team1} : ${team2}</h4>
    <span>${date} o ${hour}</span>
    <div class="counting"> </div>
    <button type="reset" value="usun" class="usun" onclick="deleteMatch('${id}')"><i class="fa fa-close"></i> Usuń</button>
 <div style="clear:both"></div>
    </div>`
    })
    teams.forEach(team => displayTableData(team.name, team.numberOfMatches, team.numberOfVictories,
        team.numberOfLost, team.numberOfDraws, team.scores));
    timer();
    const counting = Array.from(document.querySelectorAll('.counting'));
    counting.forEach((el, i) => el.innerHTML = timeLeftTab[i]);
    setInterval(() => {
        timer();
        const counting = Array.from(document.querySelectorAll('.counting'));
        counting.forEach((el, i) => el.innerHTML = timeLeftTab[i]);
    }, 60000);
}
//count time left to match starting
function timer() {
    timeLeftTab = [];
    let now = new Date();
    let resultTxt;
    matches.forEach(match => {
        let dateMatch = new Date(match.date + ' ' + match.hour);
        let result = Math.ceil((dateMatch.getTime() - now.getTime()) / (1000 * 60));
        if (result < - 120) {
            resultTxt = 'Mecz zakończony';
            match.status = 'closed';
            saveAsEndedMatch();
        }
        else if (result < 0) {
            resultTxt = 'Mecz trwa';
        }
        else if (result / (60) < 24) {
            let hr = Math.floor(result / 60);
            let min = result % 60;
            if (hr <= 0) hr = 0;
            if (hr < 10) hr = '0' + hr;
            if (min < 10) min = '0' + min;

            resultTxt = `Mecz rozpocznie się za ${hr}:${min}`;
        }
        else {
            resultTxt = `Mecz rozpocznie się za ${Math.ceil(result / (60 * 24))} dni`;
        }
        timeLeftTab.push(resultTxt);
    })
}
//delete match with button
function deleteMatch(id) {
    let founded = false;
    matches.forEach((match, i) => {
        if (match.id == id) {
            matches.splice(i, 1);
            founded = true;
        }
    })
    localStorage.setItem('matches', JSON.stringify(matches));
    writeMatches();
    if (!founded) {
        let team = [];
        let teamScores = [];
        endedMatches.forEach((match, i) => {
            if (match.id == id) {
                endedMatches.splice(i, 1);
                team = [match.team1, match.team2];
            }
        })
        if (scores) {
            scores.forEach((score, i) => {
                if (score.id == id) {
                    scores.splice(i, 1);
                    teamScores = [score.team1Score, score.team2Score];
                }
            })
            //delete data about matches in team table
            let updatedTeams = updateTeamInfo(team[0], team[1], parseInt(teamScores[0]), parseInt(teamScores[1]), false);
            displayTableData(updatedTeams[0].name, updatedTeams[0].numberOfMatches, updatedTeams[0].numberOfVictories,
                updatedTeams[0].numberOfLost, updatedTeams[0].numberOfDraws, updatedTeams[0].scores);
            displayTableData(updatedTeams[1].name, updatedTeams[1].numberOfMatches, updatedTeams[1].numberOfVictories,
                updatedTeams[1].numberOfLost, updatedTeams[1].numberOfDraws, updatedTeams[1].scores);
        } 
        localStorage.setItem('endedMatches', JSON.stringify(endedMatches));
        localStorage.setItem('scores', JSON.stringify(scores));
        writeEndedMatches();
    }
    getScoresFromLocal();
}
function saveAsEndedMatch() {
    matches.forEach((match,i) => {
        if (match.status == 'closed') {
            endedMatches.push(match);
            matches.splice(i, 1);
        }
    })
    localStorage.setItem('matches', JSON.stringify(matches));
    endedMatches=sortingByDate(endedMatches, false);
    localStorage.setItem('endedMatches', JSON.stringify(endedMatches));
    writeEndedMatches();
    writeMatches();
    getScoresFromLocal();
}
function writeEndedMatches() {
    closedMatches.innerHTML = '<h2>Zakończone mecze</h2>';
    endedMatches.forEach(match => {
        let id = match.id;
        let team1 = match.team1;
        let team2 = match.team2;
        let date = match.date;
        let hour = match.hour;
        closedMatches.innerHTML += `<div class="match" id="${id}">
<h4>${team1} : ${team2}</h4>
 <span>${date} o ${hour}</span>
<div>
<form class="score-form" onsubmit="return false">
<label for="score">Wynik</label>
<input type="number" min="0" class="score" id="score1" required /> :
<input type="number" min="0" class="score" id="score2" required />
<button class="save-score" type="submit" value="Zapisz" onclick="saveScore('${id}')"><i class="fa fa-check"></i> Zapisz</button>
</form>
<button type="reset" value="usun" class="usun"  onclick="deleteMatch('${id}')"><i class="fa fa-close"></i> Usuń</button>
<div style="clear:both"></div>
</div>
    </div>` 
    })
}
function saveScore(id) {
    endedMatches.forEach((match) => {
        if (match.id == id) {
            const team1Score = document.querySelector(`#${match.id}`).querySelector('#score1').value;
            const team2Score = document.querySelector(`#${match.id}`).querySelector('#score2').value;
            if (team1Score < 0 || team2Score < 0) return;
            if (team1Score && team2Score) {
                let score = {
                    id: match.id,
                    team1Score,
                    team2Score
                }
                let updatedTeams = updateTeamInfo(match.team1, match.team2, score.team1Score, score.team2Score);
                console.log(updatedTeams);
                displayTableData(updatedTeams[0].name, updatedTeams[0].numberOfMatches, updatedTeams[0].numberOfVictories,
                    updatedTeams[0].numberOfLost, updatedTeams[0].numberOfDraws, updatedTeams[0].scores);
                displayTableData(updatedTeams[1].name, updatedTeams[1].numberOfMatches, updatedTeams[1].numberOfVictories,
                    updatedTeams[1].numberOfLost, updatedTeams[1].numberOfDraws, updatedTeams[1].scores);
                const scoreForm = document.querySelector(`#${id}`).querySelector('.score-form');
                scoreForm.innerHTML = `<h3>${score.team1Score} : ${score.team2Score}</h3>`;
                scores.push(score);
                localStorage.setItem('scores', JSON.stringify(scores));
            
            }
        }
    })
}
function getScoresFromLocal() {
    if (scores) {
        scores.forEach(score => {
            const scoreForm = document.querySelector(`#${score.id}`).querySelector('.score-form');
            scoreForm.innerHTML = `<h3>${score.team1Score} : ${score.team2Score}</h3>`;
        })
    }
}
function updateTeamInfo(team1, team2, scoreTeam1, scoreTeam2, add = true) {
    let results = [];
    teams.forEach(team => {
        if (add) {
            if (team.name == team1) {
                team.numberOfMatches++;
                if (scoreTeam1 > scoreTeam2) {
                    team.numberOfVictories++;
                    team.scores += 3;
                }
                else if (scoreTeam1 == scoreTeam2) {
                    team.numberOfDraws++;
                    team.scores++;
                }
                else team.numberOfLost++;
                results.push(team);
            }
            else if (team.name == team2) {
                team.numberOfMatches++;
                if (scoreTeam2 > scoreTeam1) {
                    team.numberOfVictories++;
                    team.scores += 3;
                }
                else if (scoreTeam1 == scoreTeam2) {
                    team.numberOfDraws++;
                    team.scores++;
                }
                else team.numberOfLost++;
                results.push(team);
            }
        }
        else {
            if (team.name == team1) {
                team.numberOfMatches--;
                if (scoreTeam1 > scoreTeam2) {
                    team.numberOfVictories--;
                    team.scores -= 3;
                }
                else if (scoreTeam1 == scoreTeam2) {
                    team.numberOfDraws--;
                    team.scores--;
                }
                else team.numberOfLost--;
                results.push(team);
            }
            else if (team.name == team2) {
                team.numberOfMatches--;
                if (scoreTeam2 > scoreTeam1) {
                    team.numberOfVictories--;
                    team.scores -= 3;
                }
                else if (scoreTeam1 == scoreTeam2) {
                    team.numberOfDraws--;
                    team.scores--;
                }
                else team.numberOfLost--;
                results.push(team);
            }
        }
    });
    localStorage.setItem('teams', JSON.stringify(teams));
    return results;
}
function displayTableData(teamName, numberOfMatches, numberOfVictories,
    numberOfLost, numberOfDraws, numberOfScores) {
    const table = document.querySelector('table');
    const rows = Array.from(table.getElementsByTagName('tr'));
    rows.splice(0, 1);
    //find the row with the name of the team after saving scores
    rows.forEach(row => {
        if (row.getElementsByTagName('td')[1].textContent == teamName) {
            row.getElementsByTagName('td')[2].textContent = numberOfMatches;
            row.getElementsByTagName('td')[3].textContent = numberOfVictories;
            row.getElementsByTagName('td')[4].textContent = numberOfLost;
            row.getElementsByTagName('td')[5].textContent = numberOfDraws;
            row.getElementsByTagName('td')[6].textContent = numberOfScores;
        }
    });
    sortTable(table, rows);
    
}
function sortTable(table, rows) {
    return rows
        .sort((rowA, rowB) => parseInt(rowB.getElementsByTagName('td')[6].textContent) - parseInt(rowA.querySelectorAll('td')[6].textContent))
        .forEach((row,i) => {
            table.appendChild(row);
            row.getElementsByTagName('td')[0].textContent = i+1;
            });
        
}
function sortingByDate(m, direction) {
    m = Array.from(m);
    m.sort((a, b) => {
        let aDate = new Date(a.date + ' ' + a.hour);
        let bDate = new Date(b.date + ' ' + b.hour);
        if (direction) return aDate - bDate;
        else return bDate - aDate;
    });
    return m;
   // localStorage.setItem('matches', JSON.stringify(matches));
}
form.addEventListener('submit', saveMatch);
window.onload = writeMatches;
saveAsEndedMatch();
getScoresFromLocal();
//displayTableData();



