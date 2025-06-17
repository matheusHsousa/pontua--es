console.log("auth.js rodando");

const senhas = [
  "thiago",
  "álvaro",
  "júlia",
  "matheus",
  "mariana mendes",
  "ana camila",
  "rômulo",
  "mari chaves",
  "luana",
  "lucas",
  "gabriel",
  "daniel",
  "cristhian",
  "marjorie",
  "kaique",
  "lander",
  "edward",
  "gustavo",
  "nicollas",
  "andressa",
  "murylo"
];



function normalizar(texto) {
  return texto.trim().toLowerCase();
}

function openModal() {
  const modal = document.getElementById("passwordModal");
  modal.style.display = "block";

  document.getElementById("submitPassword").onclick = () => {
    checkPassword();
  };
}

function checkPassword() {
  const senhaInput = normalizar(document.getElementById("modalPassword").value);
 if (senhas.includes(senhaInput)) {
    localStorage.setItem("userPassword", senhaInput);
    closeModal();
    showHub();
  } else {
    alert("Senha incorreta!");
  }
}

function closeModal() {
  const modal = document.getElementById("passwordModal");
  modal.style.display = "none";
  document.getElementById("modalPassword").value = "";
}

function showHub() {
  const hub = document.getElementById("hub");
  hub.style.display = "block";

  document.getElementById("btnIndex").onclick = () => {
    window.location.href = "index.html";
  };
  document.getElementById("btnUni").onclick = () => {
    window.location.href = "uni.html";
  };
}

window.onload = () => {
  if (localStorage.getItem("userPassword")) {
    showHub();
  } else {
    openModal();
  }

  // Ligar botão para ver senha
  const toggleBtn = document.getElementById("togglePassword");
  toggleBtn.onclick = togglePasswordVisibility;
};

function togglePasswordVisibility() {
  const input = document.getElementById("modalPassword");
  const btn = document.getElementById("togglePassword");

  const cursorPos = input.selectionStart; // salva posição do cursor/foco
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
  input.setSelectionRange(cursorPos, cursorPos); // restaura o cursor
  input.focus(); // garante foco no input
}
