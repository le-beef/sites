// CONFIG FIREBASE
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
const SENHA_ACAO = "8387";

let editandoId = null;

// LOGIN
function verificarLogin() {

  const senha = document
    .getElementById("senhaEntrada")
    .value
    .trim();

  if (senha === SENHA_ENTRADA) {

    document.getElementById("loginScreen").style.display = "none";

    document.getElementById("app").style.display = "block";

  } else {

    alert("Senha incorreta!");

  }
}

window.verificarLogin = verificarLogin;

// MOSTRAR FORM
function toggleForm() {

  const form = document.getElementById("formBox");

  const botao = document.querySelector(".novo-btn");

  if (form.style.display === "block") {

    form.style.display = "none";
    botao.style.display = "block";

    limpar();

    editandoId = null;

  } else {

    form.style.display = "block";
    botao.style.display = "none";

  }
}

window.toggleForm = toggleForm;

// SALVAR
async function salvar() {

  const senha = document
    .getElementById("senhaAcao")
    .value
    .trim();

  if (senha !== SENHA_ACAO) {

    alert("Senha incorreta!");
    return;

  }

  const titulo = document.getElementById("titulo").value;
  const link = document.getElementById("link").value;
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;
  const observacao = document.getElementById("observacao").value;

  if (!titulo || !link || !data) {

    alert("Preencha tudo!");
    return;

  }

  if (editandoId) {

    await db.collection("eventos").doc(editandoId).update({
      titulo,
      link,
      data,
      descricao,
      observacao
    });

  } else {

    await db.collection("eventos").add({
      titulo,
      link,
      data,
      descricao
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
  document.getElementById("observacao").value = "";

}

// FORMATAR DATA
function formatarData(data) {

  const novaData = new Date(data);

  return novaData.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).toUpperCase();
}

// CARREGAR EVENTOS
async function carregar() {

  const lista = document.getElementById("lista");

  lista.innerHTML = "";

  const snapshot = await db.collection("eventos").get();

  let eventos = [];

  snapshot.forEach(doc => {

    eventos.push({
      id: doc.id,
      ...doc.data()
    });

  });

  eventos.sort((a, b) => new Date(a.data) - new Date(b.data));

  eventosGlobais = eventos;

  renderizarCalendario();

  eventos.forEach(evento => {

  const hoje = new Date();

  const dataEvento = new Date(evento.data);

  const diferenca = dataEvento - hoje;

  const diasRestantes = diferenca / (1000 * 60 * 60 * 24);

  let classeProximo = "";

  if (diasRestantes <= 5 && diasRestantes >= 0) {
    classeProximo = "proximo";
  }

    lista.innerHTML += `

      <div class="card ${classeProximo}">

        <div class="evento-info">

          <a
            href="${evento.link}"
            target="_blank"
            class="titulo-link"
          >
            ${evento.titulo}
          </a>

          <div class="data">
            ${formatarData(evento.data)}
          </div>

          <div class="senha">
            SENHA: ${evento.descricao || '---'}
          </div>
	 
	  <div class="observacao">
  	    OBS: ${evento.observacao || '---'}
	  </div>

        </div>

        <div class="botoes">

          <button
            class="editar"
            onclick="editar(
              '${evento.id}',
              '${evento.titulo}',
              '${evento.link}',
              '${evento.data}',
              '${evento.descricao || ''}',
	      '${evento.observacao || ''}'
            )"
          >
            ✏️
          </button>

          <button
            class="excluir"
            onclick="remover('${evento.id}')"
          >
            ❌
          </button>

        </div>

      </div>

    `;

  });
}

// EDITAR
function editar(id, titulo, link, data, descricao, observacao) {

  editandoId = id;

  document.getElementById("titulo").value = titulo;
  document.getElementById("link").value = link;
  document.getElementById("data").value = data;
  document.getElementById("descricao").value = descricao;
  document.getElementById("observacao").value = observacao;

  toggleForm();
}

window.editar = editar;

// EXCLUIR
async function remover(id) {

  const senha = prompt("Digite a senha:");

  if (senha !== SENHA_ACAO) {

    alert("Senha incorreta!");
    return;

  }

  const confirmar = confirm("Excluir evento?");

  if (!confirmar) return;

  await db.collection("eventos").doc(id).delete();

  carregar();
}

window.remover = remover;

// CALENDÁRIO
let dataAtual = new Date();
let eventosGlobais = [];

function renderizarCalendario() {

  const calendario = document.getElementById("calendario");
  const mesAno = document.getElementById("mesAno");

  calendario.innerHTML = "";

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ];

  mesAno.innerText = `${meses[mes]} ${ano}`;

  for (let i = 0; i < primeiroDia; i++) {

    const vazio = document.createElement("div");
    calendario.appendChild(vazio);

  }

  for (let dia = 1; dia <= ultimoDia; dia++) {

    const elementoDia = document.createElement("div");

    elementoDia.classList.add("dia");

    elementoDia.innerText = dia;

    const hoje = new Date();

    if (
      dia === hoje.getDate() &&
      mes === hoje.getMonth() &&
      ano === hoje.getFullYear()
    ) {
      elementoDia.classList.add("hoje");
    }

    const possuiEvento = eventosGlobais.some(evento => {

      const dataEvento = new Date(evento.data);

      return (
        dataEvento.getDate() === dia &&
        dataEvento.getMonth() === mes &&
        dataEvento.getFullYear() === ano
      );

    });

    if (possuiEvento) {

  elementoDia.classList.add("reservado");

  elementoDia.onclick = () => {

    const eventosDia = eventosGlobais.filter(evento => {

      const dataEvento = new Date(evento.data);

      return (
        dataEvento.getDate() === dia &&
        dataEvento.getMonth() === mes &&
        dataEvento.getFullYear() === ano
      );

    });

    let mensagem = `EVENTOS DO DIA ${dia}\n\n`;

    eventosDia.forEach(evento => {

      const hora = new Date(evento.data)
        .toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });

      mensagem +=
`\n📌 ${evento.titulo}
🕒 ${hora}
🔑 ${evento.descricao || '---'}
📝 ${evento.observacao || '---'}

`;

    });

    alert(mensagem);

  };

}

    calendario.appendChild(elementoDia);
  }
}

function proximoMes() {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  renderizarCalendario();
}

window.proximoMes = proximoMes;

function mesAnterior() {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  renderizarCalendario();
}

window.mesAnterior = mesAnterior;

// INICIAR
carregar();
renderizarCalendario();
