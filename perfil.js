
// ======================================
// VORTEX TRAINING — PERFIL DO USUÁRIO
// ======================================

const STORAGE_USUARIO = "vortexUsuarioLogado";
const STORAGE_PERFIL = "vortexPerfil";

const profileForm = document.getElementById("profileForm");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const bio = document.getElementById("bio");

const photoInput = document.getElementById("photoInput");
const profileImage = document.getElementById("profileImage");
const avatarInitials = document.getElementById("avatarInitials");

const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");

const message = document.getElementById("message");
const bioCount = document.getElementById("bioCount");

const cancelButton = document.getElementById("cancelButton");

let usuario = {};
let perfil = {};
let dadosOriginais = {};

function lerStorage(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || {};
    } catch {
        return {};
    }
}

function iniciais(nome) {
    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte[0])
        .join("")
        .toUpperCase() || "VT";
}

function carregarPerfil() {
    usuario = lerStorage(STORAGE_USUARIO);

    const perfilSalvo = lerStorage(STORAGE_PERFIL);

    perfil = {
        nome: perfilSalvo.nome || usuario.nome || "",
        email: perfilSalvo.email || usuario.email || "",
        bio: perfilSalvo.bio || "",
        foto: perfilSalvo.foto || usuario.foto || ""
    };

    dadosOriginais = { ...perfil };

    preencherFormulario();
}

function preencherFormulario() {
    fullName.value = perfil.nome;
    email.value = perfil.email;
    bio.value = perfil.bio;

    displayName.textContent = perfil.nome || "Usuário Vortex";
    displayEmail.textContent = perfil.email || "E-mail não informado";

    bioCount.textContent = perfil.bio.length;

    atualizarFoto();
}

function atualizarFoto() {
    if (perfil.foto) {
        profileImage.src = perfil.foto;
        profileImage.style.display = "block";
        avatarInitials.style.display = "none";
    } else {
        profileImage.removeAttribute("src");
        profileImage.style.display = "none";
        avatarInitials.style.display = "block";
        avatarInitials.textContent = iniciais(perfil.nome);
    }
}

function mostrarMensagem(texto, tipo) {
    message.textContent = texto;
    message.className = `message ${tipo}`;
}

function salvarDados() {
    localStorage.setItem(STORAGE_PERFIL, JSON.stringify(perfil));

    usuario = {
        ...usuario,
        nome: perfil.nome,
        email: perfil.email,
        foto: perfil.foto
    };

    localStorage.setItem(STORAGE_USUARIO, JSON.stringify(usuario));

    dadosOriginais = { ...perfil };
    preencherFormulario();
}

// CONTADOR DA BIOGRAFIA
bio.addEventListener("input", () => {
    bioCount.textContent = bio.value.length;
});

// SALVAR PERFIL
profileForm.addEventListener("submit", event => {
    event.preventDefault();

    const nome = fullName.value.trim();
    const emailDigitado = email.value.trim().toLowerCase();

    if (nome.length < 2) {
        mostrarMensagem("Digite um nome válido.", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDigitado)) {
        mostrarMensagem("Digite um endereço de e-mail válido.", "error");
        return;
    }

    perfil.nome = nome;
    perfil.email = emailDigitado;
    perfil.bio = bio.value.trim();

    salvarDados();

    mostrarMensagem("Suas informações foram atualizadas!", "success");
});

// ALTERAR FOTO
photoInput.addEventListener("change", event => {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
        mostrarMensagem("Escolha uma imagem JPG, PNG ou WEBP.", "error");
        photoInput.value = "";
        return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
        mostrarMensagem("A imagem deve ter no máximo 2 MB.", "error");
        photoInput.value = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
        perfil.foto = leitor.result;

        salvarDados();

        mostrarMensagem("Foto de perfil atualizada!", "success");
    };

    leitor.onerror = () => {
        mostrarMensagem("Não foi possível carregar a imagem.", "error");
    };

    leitor.readAsDataURL(arquivo);
});

// CANCELAR ALTERAÇÕES
cancelButton.addEventListener("click", () => {
    perfil = { ...dadosOriginais };

    preencherFormulario();

    photoInput.value = "";

    mostrarMensagem("Alterações canceladas.", "success");
});

// INICIALIZAÇÃO
carregarPerfil();
