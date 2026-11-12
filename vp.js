// ======================================
// VORTEX TRAINING — PAINEL PRINCIPAL
// ======================================

const STORAGE_TREINOS = "vortexTreinos";
const STORAGE_USUARIO = "vortexUsuarioLogado";
const STORAGE_PERFIL = "vortexPerfil";

// ELEMENTOS
const treinoForm = document.getElementById("treinoForm");
const listaTreinos = document.getElementById("listaTreinos");
const contadorAgenda = document.getElementById("contadorAgenda");

// ======================================
// ARMAZENAMENTO
// ======================================

function carregarTreinos() {
    try {
        const dados = JSON.parse(localStorage.getItem(STORAGE_TREINOS));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarTreinos() {
    try {
        localStorage.setItem(STORAGE_TREINOS, JSON.stringify(treinos));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar treinos:", erro);
        return false;
    }
}

function carregarUsuario() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_USUARIO)) || {};
    } catch {
        return {};
    }
}

function carregarPerfil() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_PERFIL)) || {};
    } catch {
        return {};
    }
}

let treinos = carregarTreinos();

// ======================================
// PERFIL DO USUÁRIO
// ======================================

const usuario = carregarUsuario();
const perfilSalvo = carregarPerfil();

const perfil = {
    nome: perfilSalvo.nome || usuario.nome || "Usuário Vortex",
    email: perfilSalvo.email || usuario.email || "",
    bio: perfilSalvo.bio || "",
    foto: perfilSalvo.foto || usuario.foto || ""
};

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileBio = document.getElementById("profileBio");
const profilePhoto = document.getElementById("profilePhoto");
const profileAvatar = document.getElementById("profileAvatar");
const headerAvatar = document.getElementById("headerAvatar");
const headerName = document.getElementById("headerName");
const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");
const logoutButton = document.getElementById("logoutButton");

function iniciais(nome) {
    return (nome || "Usuário Vortex")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte[0])
        .join("")
        .toUpperCase() || "VT";
}

function atualizarAvatar(elemento) {
    if (!elemento) return;

    if (perfil.foto) {
        elemento.style.backgroundImage = `url("${perfil.foto}")`;
        elemento.textContent = "";
    } else {
        elemento.style.backgroundImage = "";
        elemento.textContent = iniciais(perfil.nome);
    }
}

function atualizarPerfil() {
    if (profileName) profileName.value = perfil.nome;
    if (profileEmail) profileEmail.value = perfil.email;
    if (profileBio) profileBio.value = perfil.bio;

    if (headerName) {
        headerName.textContent = perfil.nome || "Minha conta";
    }

    atualizarAvatar(profileAvatar);
    atualizarAvatar(headerAvatar);
}

function salvarPerfil() {
    localStorage.setItem(STORAGE_PERFIL, JSON.stringify(perfil));

    const sessaoAtual = carregarUsuario();

    localStorage.setItem(STORAGE_USUARIO, JSON.stringify({
        ...sessaoAtual,
        nome: perfil.nome,
        email: perfil.email,
        foto: perfil.foto
    }));

    atualizarPerfil();
}

atualizarPerfil();

// Só executa se o formulário de perfil existir na página.
if (profileForm) {
    profileForm.addEventListener("submit", event => {
        event.preventDefault();

        const nome = profileName.value.trim();
        const email = profileEmail.value.trim().toLowerCase();

        if (nome.length < 2) {
            if (profileMessage) {
                profileMessage.textContent = "Digite um nome válido.";
            }
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (profileMessage) {
                profileMessage.textContent = "Digite um e-mail válido.";
            }
            return;
        }

        perfil.nome = nome;
        perfil.email = email;
        perfil.bio = profileBio ? profileBio.value.trim() : "";

        salvarPerfil();

        if (profileMessage) {
            profileMessage.textContent = "Perfil atualizado com sucesso!";
        }
    });
}

// FOTO DE PERFIL
if (profilePhoto) {
    profilePhoto.addEventListener("change", event => {
        const arquivo = event.target.files[0];

        if (!arquivo) return;

        if (!arquivo.type.startsWith("image/")) {
            if (profileMessage) {
                profileMessage.textContent = "Selecione um arquivo de imagem.";
            }

            profilePhoto.value = "";
            return;
        }

        if (arquivo.size > 2 * 1024 * 1024) {
            if (profileMessage) {
                profileMessage.textContent = "A imagem deve ter no máximo 2 MB.";
            }

            profilePhoto.value = "";
            return;
        }

        const leitor = new FileReader();

        leitor.onload = () => {
            perfil.foto = leitor.result;
            salvarPerfil();

            if (profileMessage) {
                profileMessage.textContent = "Foto de perfil atualizada!";
            }
        };

        leitor.readAsDataURL(arquivo);
    });
}

// SAIR DA CONTA
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_USUARIO);
        localStorage.removeItem(STORAGE_PERFIL);

        window.location.href = "login.html";
    });
}

// ======================================
// AGENDA DE TREINOS
// ======================================

function formatarData(data) {
    if (!data) return "Data não definida";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterDataHora(data, hora) {
    return new Date(`${data}T${hora || "00:00"}:00`);
}

function renderizarTreinos() {
    if (!listaTreinos) return;

    listaTreinos.innerHTML = "";

    const concluidos = treinos.filter(treino => treino.concluido).length;

    const totalTreinos = document.getElementById("totalTreinos");
    const totalConcluidos = document.getElementById("totalConcluidos");
    const proximoTreino = document.getElementById("proximoTreino");
    const dataProximo = document.getElementById("dataProximo");

    if (totalTreinos) {
        totalTreinos.textContent = treinos.length;
    }

    if (totalConcluidos) {
        totalConcluidos.textContent = concluidos;
    }

    if (contadorAgenda) {
        contadorAgenda.textContent =
            `${treinos.length} ${treinos.length === 1 ? "treino" : "treinos"}`;
    }

    const pendentes = treinos
        .filter(treino => !treino.concluido)
        .sort((a, b) => {
            return obterDataHora(a.data, a.hora) -
                   obterDataHora(b.data, b.hora);
        });

    const agora = new Date();

    const proximo = pendentes.find(treino => {
        return obterDataHora(treino.data, treino.hora) >= agora;
    });

    if (proximoTreino) {
        proximoTreino.textContent = proximo ? proximo.nome : "—";
    }

    if (dataProximo) {
        dataProximo.textContent = proximo
            ? `${formatarData(proximo.data)} às ${proximo.hora}`
            : "Nenhum treino futuro";
    }

    if (treinos.length === 0) {
        listaTreinos.innerHTML = `
            <div class="empty-agenda">
                <p>Sua agenda está vazia.</p>
                <p>Adicione seu primeiro treino e comece sua evolução!</p>
            </div>
        `;
        return;
    }

    treinos
        .slice()
        .sort((a, b) => {
            return obterDataHora(a.data, a.hora) -
                   obterDataHora(b.data, b.hora);
        })
        .forEach(treino => {
            const card = document.createElement("article");

            card.className = `workout-card ${treino.concluido ? "completed" : ""}`;

            const info = document.createElement("div");
            info.className = "workout-info";

            const titulo = document.createElement("h3");
            titulo.textContent = treino.nome;

            const detalhes = document.createElement("p");
            detalhes.textContent =
                `${treino.tipo} • ${treino.duracao} minutos • ${formatarData(treino.data)} às ${treino.hora}`;

            const observacoes = document.createElement("p");
            observacoes.textContent = treino.observacoes || "";

            info.append(titulo, detalhes, observacoes);

            const actions = document.createElement("div");
            actions.className = "workout-actions";

            const concluir = document.createElement("button");
            concluir.type = "button";
            concluir.className = "complete-button";
            concluir.textContent = treino.concluido ? "Desfazer" : "Concluir";

            concluir.addEventListener("click", () => {
                alterarStatus(treino.id);
            });

            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.className = "delete-button";
            excluir.textContent = "Excluir";

            excluir.addEventListener("click", () => {
                excluirTreino(treino.id);
            });

            actions.append(concluir, excluir);
            card.append(info, actions);

            listaTreinos.appendChild(card);
        });
}

// ======================================
// ALTERAR STATUS DO TREINO
// ======================================

function alterarStatus(id) {
    treinos = treinos.map(treino => {
        if (treino.id === id) {
            return {
                ...treino,
                concluido: !treino.concluido
            };
        }

        return treino;
    });

    salvarTreinos();
    renderizarTreinos();
}

// ======================================
// EXCLUIR TREINO
// ======================================

function excluirTreino(id) {
    treinos = treinos.filter(treino => treino.id !== id);

    salvarTreinos();
    renderizarTreinos();
}

// ======================================
// CADASTRAR TREINO
// ======================================

if (treinoForm) {
    treinoForm.addEventListener("submit", event => {
        event.preventDefault();

        const nomeCampo = document.getElementById("nomeTreino");
        const tipoCampo = document.getElementById("tipoTreino");
        const duracaoCampo = document.getElementById("duracao");
        const dataCampo = document.getElementById("dataTreino");
        const horaCampo = document.getElementById("horaTreino");
        const observacoesCampo = document.getElementById("observacoes");
        const mensagem = document.getElementById("mensagem");

        if (
            !nomeCampo ||
            !tipoCampo ||
            !duracaoCampo ||
            !dataCampo ||
            !horaCampo
        ) {
            console.error("Um ou mais campos do formulário não foram encontrados.");
            return;
        }

        const nome = nomeCampo.value.trim();
        const tipo = tipoCampo.value;
        const duracao = duracaoCampo.value;
        const data = dataCampo.value;
        const hora = horaCampo.value;
        const observacoes = observacoesCampo
            ? observacoesCampo.value.trim()
            : "";

        if (!nome || !tipo || !duracao || !data || !hora) {
            if (mensagem) {
                mensagem.textContent = "Preencha todos os campos obrigatórios.";
            }
            return;
        }

        const dataEscolhida = new Date(`${data}T${hora}:00`);

        if (
            Number.isNaN(dataEscolhida.getTime()) ||
            dataEscolhida <= new Date()
        ) {
            if (mensagem) {
                mensagem.textContent = "Escolha uma data e um horário futuros.";
            }
            return;
        }

        const novoTreino = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            nome,
            tipo,
            duracao,
            data,
            hora,
            observacoes,
            concluido: false
        };

        treinos.push(novoTreino);

        if (!salvarTreinos()) {
            treinos.pop();

            if (mensagem) {
                mensagem.textContent = "Não foi possível salvar o treino. Tente novamente.";
            }
            return;
        }

        treinoForm.reset();

        if (mensagem) {
            mensagem.textContent = "Treino adicionado à agenda com sucesso!";
        }

        renderizarTreinos();
    });
}

// ======================================
// NAVEGAÇÃO
// ======================================

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});

// ======================================
// DATA MÍNIMA DO FORMULÁRIO
// ======================================

const campoData = document.getElementById("dataTreino");

if (campoData) {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    campoData.min = `${ano}-${mes}-${dia}`;
}

// ======================================
// INICIALIZAÇÃO
// ======================================

renderizarTreinos();