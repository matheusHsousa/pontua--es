import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    getDocs,
    collection,
    increment
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDxb6M9TPfUuql-7Hdcn7U9rzyXKB3l42s",
    authDomain: "pontapp-687f4.firebaseapp.com",
    projectId: "pontapp-687f4",
    storageBucket: "pontapp-687f4.appspot.com",
    messagingSenderId: "180723066236",
    appId: "1:180723066236:web:27887423935780df6030f9"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Usuário padrão (sem senha)
let user = "Sistema";

// Função para normalizar strings (sem acento, minúsculas, sem espaços)
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s/g, "");
}

// Mostra unidade baseada na URL
function showTeamFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get('unit');

    const penaltyButton = document.querySelector("button[onclick='aa()']");
    const redirectButtons = document.getElementById("redirectButtons");

    if (team) {
        const teams = document.querySelectorAll('.team');
        teams.forEach(t => t.classList.add('hidden'));

        const selectedTeam = document.getElementById(`unit${team}`);
        if (selectedTeam) {
            selectedTeam.classList.remove('hidden');
        } else {
            alert("Unidade não encontrada!");
        }

        penaltyButton.style.display = "none";
        redirectButtons.style.display = "none";
    } else {
        penaltyButton.style.display = "block";
        redirectButtons.style.display = "block";
    }
}

// Adiciona histórico de pontuação ou penalização
async function addScoreHistory(team, user, points) {
    try {
        const historyRef = collection(db, "scoreHistory");
        await setDoc(doc(historyRef), {
            team: team,
            user: user,
            points: points,
            timestamp: new Date()
        });
        console.log(`Histórico: ${user} -> ${points} pontos para ${team}`);
    } catch (error) {
        console.error("Erro ao registrar histórico: ", error);
    }
}

// Adiciona pontos a uma unidade
window.addScore = async function (team) {
    const scoreInput = document.getElementById(`inputScore${team}`);
    const score = parseInt(scoreInput.value);

    if (isNaN(score) || score <= 0) {
        alert("Por favor, insira uma pontuação válida!");
        return;
    }

    try {
        const teamRef = doc(db, "teams", `unit${team}`);
        await updateDoc(teamRef, {
            score: increment(score)
        });

        await addScoreHistory(team, user, score);
        scoreInput.value = '';
        updateScoreDisplay();
        displayNotification(team, score);
    } catch (error) {
        console.error("Erro ao adicionar pontuação: ", error);
        alert("Erro ao adicionar pontuação.");
    }
};

// Mostra notificação temporária
function displayNotification(team, score) {
    const notificationElement = document.getElementById("notificacao");
    notificationElement.innerText = score > 0 ? `+${score} pontos!` : `${score} pontos!`;
    notificationElement.style.display = "block";

    setTimeout(() => {
        notificationElement.style.display = "none";
    }, 2000);
}

// Atualiza placar das unidades
async function updateScoreDisplay() {
    try {
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        teamsSnapshot.forEach((docItem) => {
            const teamData = docItem.data();
            const teamId = docItem.id.replace('unit', '');
            const scoreDisplay = document.getElementById(`score${teamId}`);
            if (scoreDisplay) {
                scoreDisplay.textContent = teamData.score || 0;
            }
        });
    } catch (error) {
        console.error("Erro ao atualizar placar: ", error);
    }
}

// Inicializa unidades
async function initializeTeams() {
    const teams = ['Da', 'Aser', 'Man', 'Ben', 'Juda', 'Rub'];
    try {
        for (const team of teams) {
            const teamRef = doc(db, "teams", `unit${team}`);
            const teamDoc = await getDoc(teamRef);

            if (!teamDoc.exists()) {
                await setDoc(teamRef, { score: 0 });
            }
        }
        updateScoreDisplay();
    } catch (error) {
        console.error("Erro ao inicializar unidades: ", error);
    }
}

// Abre modal de penalização
window.aa = function () {
    document.getElementById("penaltyModal").style.display = "block";
};

function closePenaltyModal() {
    document.getElementById("penaltyModal").style.display = "none";
}

// Aplica penalização
document.getElementById("submitPenalty").onclick = async function () {
    const team = document.getElementById("penaltyUnit").value;
    const penaltyPoints = parseInt(document.getElementById("penaltyPoints").value);

    if (isNaN(penaltyPoints) || penaltyPoints <= 0) {
        alert("Por favor, insira uma penalização válida!");
        return;
    }

    try {
        const teamRef = doc(db, "teams", `unit${team}`);
        await updateDoc(teamRef, {
            score: increment(-penaltyPoints)
        });

        await addScoreHistory(team, user, -penaltyPoints);
        updateScoreDisplay();
        closePenaltyModal();
        displayNotification(team, -penaltyPoints);
    } catch (error) {
        console.error("Erro ao aplicar penalização: ", error);
        alert("Erro ao aplicar penalização.");
    }
};

// Ao carregar a página
window.addEventListener('load', () => {
    initializeTeams();
    showTeamFromURL();
});
