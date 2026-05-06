// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBk3KLMwXjHe4OvrwdLrkywiJkyhNMpB0o",
  authDomain: "reserva2-d23b2.firebaseapp.com",
  projectId: "reserva2-d23b2",
  storageBucket: "reserva2-d23b2.firebasestorage.app",
  messagingSenderId: "353160897418",
  appId: "1:353160897418:web:a3627716e8554f0db89e73"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// SENHAS
const SENHA_ENTRADA = "8387";
const SENHA_ACAO = "aa120805bb";

let editandoId = null;

// LOGIN
function verificarLogin() {
  const senha = document.getElementById("senhaEntrada").value;

  if (senha === SENHA_ENTRADA) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else {
    alert("Senha incorreta!");
  }
}

window.verificarLogin = verificarLogin;

// FORM
function toggleForm() {
  const form = document.getElementById("formBox");
  const btn = document.querySelector(".novo-btn");

  if (form.style.display === "block") {
    form.style.display = "none";
    btn.style.display = "block";
    limpar();
  } else {
    form.style.display = "block";
    btn.style.display = "none";
  }
}

window.toggleForm = toggleForm;

// SALVAR
async function salvar() {

  const senha = document.getElementById("senhaAcao").value;

  if (senha !== SENHA_ACAO) {
    alert("Senha incorreta!");
    return;
  }

  const titulo = document.getElementById("titulo").value;
  const link = document.getElementById("link").value;
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;

  if (!titulo || !link) {
    alert("Preencha tudo!");
    return;
  }

  if (editandoId) {
    await db.collection("eventos").doc(editandoId).update({
      titulo, link, data, descricao
    });
    editandoId = null;
  } else {
    await db.collection("eventos").add({
      titulo, link, data, descricao
    });
  }

  limpar();
  toggleForm();
  carregar();
}

window.salvar = salvar;

// LIMPAR
function limpar() {
  document.getElementById("titulo").value = "";
  document.getElementById("link").value = "";
  document.getElementById("data").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("senhaAcao").value = "";
}

// CARREGAR
async function carregar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const snapshot = await db.collection("eventos").get();

  snapshot.forEach(doc => {
    const e = doc.data();

    lista.innerHTML += `
      <div class="card">
        <a href="${e.link}" target="_blank">${e.titulo}</a>

        <div class="descricao">
          <span>${e.data ? new Date(e.data).toLocaleString() : ""}</span>
          ${e.descricao || ""}
        </div>

        <div class="botoes">
  <button class="editar" onclick="editar('${doc.id}','${e.titulo}','${e.link}','${e.data}','${e.descricao}')">
    ✏️ Editar
  </button>

  <button class="excluir" onclick="remover('${doc.id}')">
    🗑 Excluir
  </button>
</div>
    `;
  });
}

// EDITAR
function editar(id, titulo, link, data, descricao) {
  editandoId = id;

  document.getElementById("titulo").value = titulo;
  document.getElementById("link").value = link;
  document.getElementById("data").value = data || "";
  document.getElementById("descricao").value = descricao || "";

  toggleForm();
}

window.editar = editar;

// REMOVER
async function remover(id) {

  const senha = prompt("Senha para excluir:");

  if (senha !== SENHA_ACAO) {
    alert("Senha incorreta!");
    return;
  }

  if (!confirm("Excluir evento?")) return;

  await db.collection("eventos").doc(id).delete();
  carregar();
}

window.remover = remover;

// INICIAR
carregar();