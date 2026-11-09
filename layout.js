function ajustarTela() {
    const larguraBase = 1366;
    const alturaBase = 768;

    const escalaLargura = window.innerWidth / larguraBase;
    const escalaAltura = (window.innerHeight - 80) / alturaBase;

    const escala = Math.min(escalaLargura, escalaAltura);

    document.querySelector(".tela").style.setProperty("--escala", escala);
}

window.addEventListener("resize", ajustarTela);

ajustarTela();