const questions = [];
let currentQuestion = 0;
let score = 0;
let difficultyLevel = 'easy';
let playerName = '';
let timer;
const TIME_LIMIT = 30;

const acertoSom = document.getElementById('acertoSom');
const erroSom = document.getElementById('erroSom');

function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

function showLevelSelect() {
    hideElement("menu");
    showElement("level-select");
}

function generateQuestions() {
    questions.length = 0;
    let maxNumber;
    let multiplicationLimit;
    if (difficultyLevel === 'easy') {
        maxNumber = 10;
        multiplicationLimit = 5;
    } else if (difficultyLevel === 'medium') {
        maxNumber = 20;
        multiplicationLimit = 10;
    } else {
        maxNumber = 100;
        multiplicationLimit = 12;
    }

    const operations = ['+', '-', '*'];
    
    for (let i = 0; i < 10; i++) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        let a, b;
        
        if (op === '*') {
            a = Math.floor(Math.random() * multiplicationLimit) + 1;
            b = Math.floor(Math.random() * multiplicationLimit) + 1;
        } else {
            a = Math.floor(Math.random() * maxNumber) + 1;
            b = Math.floor(Math.random() * maxNumber) + 1;
        }

        if (op === '-' && a < b) [a, b] = [b, a];
        
        let correct;
        switch(op) {
            case '+': correct = a + b; break;
            case '-': correct = a - b; break;
            case '*': correct = a * b; break;
        }

        const options = generateOptions(correct);
        const question = {
            text: `${a} ${op} ${b}`,
            correct: correct,
            options: options
        };
        questions.push(question);
    }
}

function generateOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);

    while (options.size < 4) {
        const variation = Math.floor(Math.random() * 20) - 10;
        const newOption = correctAnswer + variation;
        if (newOption >= 0 && !options.has(newOption)) {
            options.add(newOption);
        }
    }

    return shuffle(Array.from(options));
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame(level) {
    playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert("Por favor, digite seu nome para começar!");
        return;
    }

    difficultyLevel = level;
    score = 0;
    currentQuestion = 0;
    generateQuestions();
    hideElement("level-select");
    showElement("game");
    showQuestion();
}

function showInstructions() {
    hideElement("menu");
    showElement("instructions");
}

function goToMenu() {
    hideElement("game");
    hideElement("instructions");
    hideElement("result");
    hideElement("level-select");
    hideElement("ranking");
    showElement("menu");
    clearTimeout(timer);
}

function updateProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    const progress = (currentQuestion / 10) * 100;
    progressBar.style.width = `${progress}%`;
}

function startTimer() {
    let timeLeft = TIME_LIMIT;
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `Tempo: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Tempo: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(null);
        }
    }, 1000);
}

function showQuestion() {
    clearTimeout(timer);
    updateProgressBar();
    startTimer();

    const q = questions[currentQuestion];
    document.getElementById("question").textContent = `❓ Quanto é: ${q.text} ?`;
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";
    q.options.forEach(option => {
        const btn = document.createElement("div");
        btn.className = "option";
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, btn);
        optionsDiv.appendChild(btn);
    });
    document.getElementById("scoreDisplay").textContent = `💯 Pontuação: ${score}`;
}

function checkAnswer(selected, element) {
    clearInterval(timer);

    const correct = questions[currentQuestion].correct;
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => opt.onclick = null);

    if (selected === correct) {
        score += 10;
        acertoSom.play();
        if (element) {
            element.style.backgroundColor = '#81c784';
            element.classList.add('correct-answer');
        }
    } else {
        score = Math.max(0, score - 5);
        erroSom.play();
        if (element) {
            element.style.backgroundColor = '#e57373';
            element.classList.add('wrong-answer');
        }
        allOptions.forEach(opt => {
            if (parseInt(opt.textContent) === correct) {
                opt.style.backgroundColor = '#81c784';
            }
        });
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            endGame();
        }
    }, 1000);
}

function endGame() {
    hideElement("game");
    showElement("result");
    
    const finalScoreElement = document.getElementById("finalScore");
    if (score >= 90) {
        finalScoreElement.textContent = `${score} pontos! 🎉 Perfeito!`;
    } else if (score >= 60) {
        finalScoreElement.textContent = `${score} pontos! 🥳 Ótimo trabalho!`;
    } else {
        finalScoreElement.textContent = `${score} pontos. 😊 Tente de novo!`;
    }

    saveScore();
}

function saveScore() {
    const scores = getRanking();
    scores.push({ name: playerName, score: score, level: difficultyLevel });
    scores.sort((a, b) => b.score - a.score); // Ordena por pontuação (maior para menor)
    localStorage.setItem('matemagicaRanking', JSON.stringify(scores.slice(0, 10))); // Salva apenas os 10 melhores
}

function getRanking() {
    const ranking = localStorage.getItem('matemagicaRanking');
    return ranking ? JSON.parse(ranking) : [];
}

function showRanking() {
    hideElement("menu");
    showElement("ranking");
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';
    
    const scores = getRanking();
    if (scores.length === 0) {
        rankingList.innerHTML = '<li>Nenhum recorde ainda. Seja o primeiro a jogar!</li>';
    } else {
        scores.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${index + 1}. ${item.name}</span> <span>${item.score} pontos (${item.level})</span>`;
            rankingList.appendChild(li);
        });
    }
}

goToMenu();