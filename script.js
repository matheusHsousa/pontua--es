import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, getDocs, collection, increment } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";




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

let currentTeam = ''; // Variável para armazenar o time atual
let user = ''

function normalizeString(str) {
    return str
        .normalize("NFD") // Separa os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
        .toLowerCase() // Converte para minúsculas
        .replace(/\s/g, ""); // Remove espaços
}

// Função para mostrar o time correspondente ao parâmetro da URL
// Função para mostrar o time correspondente ao parâmetro da URL
function showTeamFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get('team');

    // Elemento do botão de penalização e redirecionamento
    const penaltyButton = document.querySelector("button[onclick='aa()']");
    const redirectButtons = document.getElementById("redirectButtons");

    if (team) {
        // Esconde todos os times
        const teams = document.querySelectorAll('.team');
        teams.forEach(t => t.classList.add('hidden'));

        // Mostra apenas o time selecionado
        const selectedTeam = document.getElementById(`team${team}`);
        if (selectedTeam) {
            selectedTeam.classList.remove('hidden');
        } else {
            alert("Time não encontrado!");
        }

        // Esconde o botão de penalização e exibe os botões de redirecionamento
        penaltyButton.style.display = "none";
        redirectButtons.style.display = "none"; // Certifique-se de esconder se o time estiver selecionado
    } else {
        // Mostra o botão de penalização
        penaltyButton.style.display = "block";
        redirectButtons.style.display = "block"; // Mostra os botões de redirecionamento
    }
}


async function addScoreHistory(team, user, points) {
    try {
        const historyRef = collection(db, "scoreHistory");
        await setDoc(doc(historyRef), {
            team: team,
            user: user,
            points: points,
            timestamp: new Date() // A data e hora atuais
        });
        console.log(`Histórico registrado: ${user} adicionou ${points} pontos ao Time ${team}`);
    } catch (error) {
        console.error("Erro ao registrar histórico de pontuação: ", error);
    }
}

// Modificação da função addScore para incluir histórico
window.addScore = async function (team) {
    const scoreInput = document.getElementById(`inputScore${team}`);
    const score = parseInt(scoreInput.value);

    if (isNaN(score) || score <= 0) {
        alert("Por favor, insira uma pontuação válida!");
        return;
    }

    console.log(`Adicionando ${score} pontos ao Time ${team}`); // Log para verificar a chamada

    try {
        const teamRef = doc(db, "teams", `team${team}`);
        await updateDoc(teamRef, {
            score: increment(score)
        });

        // Adicionar ao histórico de pontuação
        await addScoreHistory(team, user, score);

        // Limpa os campos de entrada
        scoreInput.value = '';

        // Atualiza a exibição da pontuação
        updateScoreDisplay();

        // Exibe a notificação temporária
        displayNotification(team, score);
    } catch (error) {
        console.error("Erro ao adicionar pontuação: ", error);
        alert("Houve um erro ao adicionar a pontuação. Tente novamente.");
    }
};

function displayNotification(team, score) {
    const notificationElement = document.getElementById("notificacao");

    // Define o texto da notificação
    if(score > 0){
        notificationElement.innerText = `+${score} pontos!`;
    }else{
        notificationElement.innerText = `${score} pontos!`;
    }

    // Exibe a notificação
    notificationElement.style.display = "block";

    // Define um tempo para remover a notificação (exemplo: 3 segundos)
    setTimeout(() => {
        notificationElement.style.display = "none"; // Esconde a notificação após 3 segundos
    }, 2000);
}

// Função para atualizar a exibição da pontuação e das notas
async function updateScoreDisplay() {
    try {
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        teamsSnapshot.forEach((doc) => {
            const teamData = doc.data();
            const teamId = doc.id.charAt(doc.id.length - 1); // Último caractere do ID do time
            const scoreDisplay = document.getElementById(`score${teamId}`);
            // Verifique se o elemento existe antes de tentar acessá-lo
            if (scoreDisplay) {
                scoreDisplay.textContent = teamData.score || 0; // Exibe 0 se não houver pontuação
            } else {
                console.warn(`Elemento de pontuação para time ${teamId} não encontrado.`);
            }
        });
    } catch (error) {
        console.error("Erro ao atualizar a exibição da pontuação: ", error);
    }
}


// Função para inicializar os times no Firestore
async function initializeTeams() {
    const teams = ['A', 'B', 'C', 'D', 'E', 'F'];
    try {
        for (const team of teams) {
            const teamRef = doc(db, "teams", `team${team}`);
            const teamDoc = await getDoc(teamRef);

            if (!teamDoc.exists()) {
                await setDoc(teamRef, { score: 0, note: "" });
            }
        }
        updateScoreDisplay();
    } catch (error) {
        console.error("Erro ao inicializar times: ", error);
    }
}

// Chama a inicialização ao carregar a página
window.addEventListener('load', () => {
    initializeTeams();
    showTeamFromURL(); // Mostra o time a partir da URL
    openModal(); // Abre o modal automaticamente ao carregar a página
});



function closePenaltyModal() {
    const penaltyModal = document.getElementById("penaltyModal");
    penaltyModal.style.display = "none"; // Oculta o modal
}

// Função para aplicar a penalização
document.getElementById("submitPenalty").onclick = async function () {
    const team = document.getElementById("penaltyTeam").value;
    const penaltyPoints = parseInt(document.getElementById("penaltyPoints").value);

    if (isNaN(penaltyPoints) || penaltyPoints <= 0) {
        alert("Por favor, insira uma penalização válida!");
        return;
    }

    try {
        const teamRef = doc(db, "teams", `team${team}`);
        await updateDoc(teamRef, {
            score: increment(-penaltyPoints) // Subtrai os pontos
        });

        // Adicionar ao histórico de penalização
        await addScoreHistory(team, user, -penaltyPoints);

        // Atualiza a exibição da pontuação
        updateScoreDisplay();

        // Fecha o modal
        closePenaltyModal();

        // Exibe notificação
        displayNotification(team, -penaltyPoints);
    } catch (error) {
        console.error("Erro ao aplicar penalização: ", error);
        alert("Houve um erro ao aplicar a penalização. Tente novamente.");
    }
};
