
const opcoes = [];

let pausarSorteio = false;
let sorteioEmAndamento = false;
let timerGiro;
let resolverEspera;

let restantesSorteio = [];


// FUNÇÃO DOS AVISOS AUTOMÁTICOS
function mostrarAviso(mensagem) {
    let area = document.getElementById("area-avisos");

    if (!area) {
        area = document.createElement("div");
        area.id = "area-avisos";
        document.body.appendChild(area);
    }

    const aviso = document.createElement("div");
    aviso.classList.add("aviso-popup");
    aviso.textContent = mensagem;

    area.appendChild(aviso);

    setTimeout(() => {
        aviso.remove();

        if (area.children.length === 0) {
            area.remove();
        }
    }, 3000);
}

function esperar(tempo) {
    return new Promise(resolve => {

        resolverEspera = () => {
            clearTimeout(timerGiro);
            resolverEspera = null;
            resolve();
        };

        timerGiro = setTimeout(() => {
            resolverEspera = null;
            resolve();
        }, tempo);

    });
}

// ATUALIZA A ROLETA
function atualizarRoleta() {
    const canvas = document.getElementById("roleta");

    if (!canvas) return;

    canvas.style.transition = "none";
    canvas.style.transform = "rotate(0deg)";

    if (opcoes.length > 0) {
        desenharRoleta(opcoes);
    } else {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}


// ADICIONAR OPÇÃO
function adicionarOpcao() {
    const campo = document.getElementById("opcao");
    const texto = campo.value.trim();

    if (texto !== "") {

        if (opcoes.includes(texto)) {
            mostrarAviso("Essa opção já foi adicionada!");
            return;
        }

        opcoes.push(texto);

        if (pausarSorteio) {
            restantesSorteio.push(texto);
        }

        const lista = document.getElementById("lista-opcoes");
        const item = document.createElement("li");

        const textoOpcao = document.createElement("span");
        textoOpcao.textContent = texto;

        item.appendChild(textoOpcao);

        const botao = document.createElement("button");

        botao.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">' +
            '<path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 1 0v-7a.5.5 0 0 0-.5-.5m3 0a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 1 0v-7a.5.5 0 0 0-.5-.5m3 0a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 1 0v-7a.5.5 0 0 0-.5-.5"/>' +
            '</svg>';

        botao.addEventListener("click", () => botaoRemover(item, texto));
        botao.classList.add("botao-remover");

        item.appendChild(botao);
        lista.appendChild(item);

        atualizarRoleta();

        campo.value = "";
    }
}


// DESENHAR ROLETA
function desenharRoleta(opcoesRoleta) {
    const canvas = document.getElementById("roleta");
    const ctx = canvas.getContext("2d");

    const centro = canvas.width / 2;
    const raio = centro - 5;

    const cores = [
        "#d0d328",
        "#64c538",
        "#3fc9bd",
        "#305acc",
        "#A855F7",
        "#c03939",
        "#f39c12",
        "#8e44ad",
        "#2c3e50",
        "#16a085",
        "#f1c40f"
    ];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tamanhoFatia = (2 * Math.PI) / opcoesRoleta.length;

    opcoesRoleta.forEach((opcao, i) => {

        const inicio = -Math.PI / 2 + i * tamanhoFatia;
        const fim = inicio + tamanhoFatia;
        const meio = inicio + tamanhoFatia / 2;

        // Desenha a fatia
        ctx.beginPath();
        ctx.moveTo(centro, centro);
        ctx.arc(centro, centro, raio, inicio, fim);
        ctx.closePath();

        ctx.fillStyle = cores[i % cores.length];
        ctx.fill();

        ctx.strokeStyle = "#E9D5FF";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Escreve o nome da opção
        ctx.save();

        ctx.translate(
            centro + Math.cos(meio) * raio * 0.62,
            centro + Math.sin(meio) * raio * 0.62
        );

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 17px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(opcao, 0, 0, raio * 0.65);

        ctx.restore();
    });

    // Contorno da roleta
    ctx.beginPath();
    ctx.arc(centro, centro, raio, 0, 2 * Math.PI);

    ctx.strokeStyle = "#D946EF";
    ctx.lineWidth = 7;
    ctx.stroke();
}


// PAUSAR ROLETA

function pausarRoleta() {
    if (!sorteioEmAndamento) return;

    pausarSorteio = true;

    const canvas = document.getElementById("roleta");

    // Congela a roleta na posição atual
    const estilo = window.getComputedStyle(canvas);
    const rotacao = estilo.transform;

    canvas.style.transition = "none";
    canvas.style.transform = rotacao;

    // Interrompe a espera atual
    if (resolverEspera) {
        resolverEspera();
    }

    // Atualiza os botões
    document.querySelectorAll("button").forEach(botao => {
        botao.disabled = false;
    });

    document.querySelector(".botton-pausar").disabled = true;
    document.querySelector(".botton-continuar").disabled = false;

    mostrarAviso("Sorteio pausado! Clique em Continuar para retomar.");
}


// INICIAR O SORTEIO
async function decidir() {

    if (sorteioEmAndamento) return;

    if (pausarSorteio) {
        mostrarAviso("Clique em Continuar para retomar o sorteio!");
        return;
    }

    if (opcoes.length < 2) {
        mostrarAviso("Adicione pelo menos duas opções!");
        return;
    }

    // Guarda todas as opções para iniciar um novo sorteio
    restantesSorteio = [...opcoes];

    const listaResultados = document.getElementById("lista-resultados");
    listaResultados.innerHTML = "";

    pausarSorteio = false;
    sorteioEmAndamento = true;

    executarSorteio();
}


// CONTINUAR O SORTEIO
function continuarRoleta() {

    if (sorteioEmAndamento) return;

    if (!pausarSorteio) return;

    pausarSorteio = false;
    sorteioEmAndamento = true;

    mostrarAviso("Sorteio retomado!");

    executarSorteio();
}


// EXECUTAR AS SELEÇÕES
async function executarSorteio() {

    const canvas = document.getElementById("roleta");
    const botoes = document.querySelectorAll("button");

    // Bloqueia os botões durante o sorteio
    botoes.forEach(botao => botao.disabled = true);

    document.querySelector(".botton-pausar").disabled = false;

    while (restantesSorteio.length > 0) {

        desenharRoleta(restantesSorteio);

        canvas.style.transition = "none";
        canvas.style.transform = "rotate(0deg)";
        canvas.offsetWidth;

        const tamanhoFatia = 360 / restantesSorteio.length;

        const indice = Math.floor(
            Math.random() * restantesSorteio.length
        );

        const destino = 360 * 5 + (
            360 - (indice + 0.5) * tamanhoFatia
        );

        canvas.style.transition =
            "transform 4s cubic-bezier(0.15, 0.65, 0.15, 1)";

        canvas.style.transform = `rotate(${destino}deg)`;

        // Aguarda o giro da roleta
        await esperar(4200);

        if (pausarSorteio) {
            sorteioEmAndamento = false;
            return;
        }

        // Registra a opção escolhida
        const escolha = restantesSorteio.splice(indice, 1)[0];

        const item = document.createElement("li");
        item.textContent = escolha;

        document.getElementById("lista-resultados").appendChild(item);

        // Pequeno intervalo entre as seleções
        await esperar(700);

        if (pausarSorteio) {
            sorteioEmAndamento = false;
            return;
        }
    }

    // Sorteio finalizado
    sorteioEmAndamento = false;

    desenharRoleta(["Sorteio concluído!"]);

    botoes.forEach(botao => botao.disabled = false);

    document.querySelector(".botton-continuar").disabled = true;

    mostrarAviso("Sorteio concluído!");
}


// APAGAR TODAS AS OPÇÕES
function apagarAll() {

    if (opcoes.length === 0) {
        mostrarAviso("Não há opções para apagar!");
        return;
    }

    opcoes.length = 0;

    restantesSorteio = [];
    pausarSorteio = false;
    sorteioEmAndamento = false;

    document.querySelector(".botton-pausar").disabled = false;
    document.querySelector(".botton-continuar").disabled = true;

    const lista = document.getElementById("lista-opcoes");
    lista.innerHTML = "";

    const listaResultados = document.getElementById("lista-resultados");
    listaResultados.innerHTML = "";

    atualizarRoleta();

    mostrarAviso("Todas as opções foram apagadas!");
}


// REMOVER UMA OPÇÃO
function botaoRemover(item, texto) {
    const index = opcoes.indexOf(texto);

    if (index !== -1) {
        opcoes.splice(index, 1);


        mostrarAviso("Opção '" + texto + "' removida!");
    }

    const indexRestante = restantesSorteio.indexOf(texto);

    if (indexRestante !== -1) {
        restantesSorteio.splice(indexRestante, 1);
    }

    item.remove();

    // Procura a opção na Ordem escolhida
    const listaResultados = document.getElementById("lista-resultados");
    const resultados = listaResultados.querySelectorAll("li");

    resultados.forEach(resultado => {
        if (resultado.textContent === texto) {
            resultado.remove();
        }
    });

    atualizarRoleta();
}


// ADICIONAR OPÇÃO AO PRESSIONAR ENTER
const campo = document.getElementById("opcao");

campo.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        adicionarOpcao();
    }
});
