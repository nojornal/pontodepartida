
document.querySelector(".share-btn").addEventListener("click", () => {
    const modal = document.getElementById("share-modal");
    const modalContent = document.getElementById("share-modal-content");

    modal.classList.remove("hidden");

    setTimeout(() => {
        modalContent.classList.remove("scale-95", "opacity-0");
        modalContent.classList.add("scale-100", "opacity-100");
    }, 20);
});

// Fechar modal
document.querySelectorAll(".close-share-modal, #close-modal-x").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = document.getElementById("share-modal");
        const modalContent = document.getElementById("share-modal-content");

        modalContent.classList.remove("scale-100", "opacity-100");
        modalContent.classList.add("scale-95", "opacity-0");

        setTimeout(() => {
            modal.classList.add("hidden");
        }, 200);
    });
});

function gerarCardPadrao() {

    const iconeProjeto = "🎙️";       
    const iconeAutor   = "@";         
    const iconeAudio   = "🎧";       
    const iconeLink    = "🔗";        

    const nomeProjeto = document.getElementById("banner-title")?.innerText || "Podcast";
    const autor       = document.getElementById("banner-author")?.innerText || "Autor";
    const nomeAudio   = document.getElementById("banner-subtitle")?.innerText || "Áudio";
    const link        = window.location.href;

    
    return (
`${iconeProjeto} *${nomeProjeto}*

${iconeAutor} Autor: *${autor}*
${iconeAudio} Áudio: *${nomeAudio}*

${iconeLink} ${link}`
    );
}

function compartilharNativo(texto) {
    if (navigator.share) {
        navigator.share({
            title: "Compartilhar conteúdo",
            text: texto,
            url: window.location.href
        }).catch(err => {
            console.log("Compartilhamento cancelado", err);
        });
    }
}

document.querySelectorAll(".share-option").forEach(btn => {
    btn.addEventListener("click", () => {

        const plataforma = btn.dataset.platform;
        const card = gerarCardPadrao();

        // WHATSAPP
        if (plataforma === "whatsapp") {
            const url = "https://wa.me/?text=" + encodeURIComponent(card);
            window.open(url, "_blank");
        }

        // INSTAGRAM — SOMENTE DIRECT
        else if (plataforma === "instagram") {
            navigator.clipboard.writeText(card)
                .then(() => {
                    alert("Mensagem copiada! Agora escolha alguém no Instagram Direct e cole.");
                    window.open("https://www.instagram.com/direct/inbox/", "_blank");
                });
        }

        else if (plataforma === "copy") {
            navigator.clipboard.writeText(card)
                .then(() => {
                    alert("Card copiado com sucesso!");
                });
        }

    });
});


document.querySelector(".share-btn").addEventListener("click", () => {
    const texto = gerarCardPadrao();
    compartilharNativo(texto);
});
