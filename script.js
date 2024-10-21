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

// Função para abrir o modal da senha
function openModal() {
    const modal = document.getElementById("passwordModal");
    modal.style.display = "block"; // Mostra o modal

    document.getElementById("submitPassword").onclick = () => {
        checkPassword();
    };
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById("passwordModal");
    modal.style.display = "none"; // Oculta o modal
    document.getElementById("modalPassword").value = ''; // Limpa o campo da senha
}

// Função para verificar a senha
function checkPassword() {
    const passwordInput = document.getElementById("modalPassword").value;

    if (passwordInput === "1972") {
        closeModal(); // Fecha o modal
    } else {
        alert("Senha incorreta!");
    }
}

// Função para mostrar o time correspondente ao parâmetro da URL
function showTeamFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const team = urlParams.get('team');

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
    }
}

// Função para adicionar pontuação
window.addScore = async function(team) {
    const scoreInput = document.getElementById(`inputScore${team}`);
    const score = parseInt(scoreInput.value);

    if (isNaN(score) || score <= 0) {
        alert("Por favor, insira uma pontuação válida!");
        return;
    }

    try {
        const teamRef = doc(db, "teams", `team${team}`);
        await updateDoc(teamRef, {
            score: increment(score)
        });

        // Limpa os campos de entrada
        scoreInput.value = '';

        // Atualiza a exibição da pontuação
        updateScoreDisplay();
    } catch (error) {
        console.error("Erro ao adicionar pontuação: ", error);
        alert("Houve um erro ao adicionar a pontuação. Tente novamente.");
    }
};

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
    const teams = ['A', 'B', 'C', 'D'];
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
