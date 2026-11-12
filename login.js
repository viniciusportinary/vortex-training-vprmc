const splash = document.getElementById('splash');
const layout = document.getElementById('layout');

function finishSplash() {
    if (splash) splash.classList.add('done');
    if (layout) layout.classList.add('ready');
}

window.addEventListener('load', () => {
    setTimeout(finishSplash, 1500);
});

setTimeout(finishSplash, 3500);

// Ano atual
const year = document.getElementById('year');

if (year) {
    year.textContent = new Date().getFullYear();
}

// Elementos de login e cadastro
const loginView = document.getElementById('loginView');
const signupView = document.getElementById('signupView');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');

function switchView(view) {
    const login = view === 'login';

    if (loginView) loginView.hidden = !login;
    if (signupView) signupView.hidden = login;

    if (loginTab) loginTab.classList.toggle('active', login);
    if (signupTab) signupTab.classList.toggle('active', !login);

    const loginMessage = document.getElementById('loginMessage');
    const signupMessage = document.getElementById('signupMessage');

    if (loginMessage) loginMessage.className = 'message';
    if (signupMessage) signupMessage.className = 'message';
}

if (loginTab) {
    loginTab.addEventListener('click', () => switchView('login'));
}

if (signupTab) {
    signupTab.addEventListener('click', () => switchView('signup'));
}

document.querySelectorAll('.switch-btn').forEach(button => {
    button.addEventListener('click', () => {
        switchView(button.dataset.view);
    });
});

// Mensagens
function msg(id, text, type = 'error') {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = text;
    element.className = 'message show ' + type;
}

// Validação de e-mail
function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mostrar e ocultar senha
document.querySelectorAll('.show-pass').forEach(button => {
    button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.target);

        if (!input) return;

        input.type = input.type === 'password' ? 'text' : 'password';

        button.textContent =
            input.type === 'password' ? '◉' : '◎';
    });
});

// Indicador de força da senha
const pass = document.getElementById('signupPassword');

if (pass) {
    pass.addEventListener('input', () => {
        const password = pass.value;
        let score = 0;

        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = [
            ['0%', '#ff697d', 'Digite uma senha.'],
            ['25%', '#ff697d', 'Senha fraca.'],
            ['50%', '#ffb454', 'Senha razoável.'],
            ['75%', '#91a5ff', 'Senha boa.'],
            ['100%', '#71e7b5', 'Senha forte.']
        ];

        const level = password ? score : 0;
        const bar = document.getElementById('strengthBar');
        const label = document.getElementById('strengthLabel');

        if (bar) {
            bar.style.width = levels[level][0];
            bar.style.background = levels[level][1];
        }

        if (label) {
            label.textContent = levels[level][2];
        }
    });
}

// Cadastro demonstrativo armazenado no navegador
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('vortexUsuarios')) || [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('vortexUsuarios', JSON.stringify(users));
}

// Redirecionamento para o painel principal
function go(button) {
    if (button) {
        button.disabled = true;

        const span = button.querySelector('span');

        if (span) {
            span.textContent = 'ABRINDO SEU PAINEL...';
        }
    }

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 550);
}

// LOGIN
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', event => {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (!validEmail(email)) {
            msg('loginMessage', 'Digite um e-mail válido.');
            return;
        }

        if (!password.trim()) {
            msg('loginMessage', 'Digite sua senha para continuar.');
            return;
        }

        const users = getUsers();

        const user = users.find(item =>
            item.email === email && item.password === password
        );

        if (!user) {
            msg('loginMessage', 'Usuário não encontrado ou senha incorreta.');
            return;
        }

        localStorage.setItem('vortexUsuarioLogado', JSON.stringify({
            nome: user.nome,
            email: user.email,
            foto: user.foto || ''
        }));

        go(loginForm.querySelector('.submit'));
    });
}

// CADASTRO
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', event => {
        event.preventDefault();

        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim().toLowerCase();
        const password = pass ? pass.value : '';
        const confirm = document.getElementById('confirmPassword').value;

        if (name.length < 2) {
            msg('signupMessage', 'Digite seu nome.');
            return;
        }

        if (!validEmail(email)) {
            msg('signupMessage', 'Digite um e-mail válido.');
            return;
        }

        if (password.length < 8) {
            msg('signupMessage', 'A senha precisa ter pelo menos 8 caracteres.');
            return;
        }

        if (password !== confirm) {
            msg('signupMessage', 'As senhas não coincidem.');
            return;
        }

        const acceptTerms = document.getElementById('acceptTerms');

        if (!acceptTerms || !acceptTerms.checked) {
            msg('signupMessage', 'Confirme que entendeu que este cadastro é demonstrativo.');
            return;
        }

        const users = getUsers();

        if (users.some(user => user.email === email)) {
            msg('signupMessage', 'Este e-mail já está cadastrado.');
            return;
        }

        const newUser = {
            nome: name,
            email: email,
            password: password,
            foto: ''
        };

        users.push(newUser);
        saveUsers(users);

        localStorage.setItem('vortexUsuarioLogado', JSON.stringify({
            nome: newUser.nome,
            email: newUser.email,
            foto: ''
        }));

        msg('signupMessage', 'Cadastro realizado! Abrindo seu painel...', 'success');

        go(signupForm.querySelector('.submit'));
    });
}

// RECUPERAÇÃO DE SENHA
const forgotButton = document.getElementById('forgot');

if (forgotButton) {
    forgotButton.addEventListener('click', () => {
        msg(
            'loginMessage',
            'A recuperação de senha exige um serviço de autenticação e não está disponível nesta versão.'
        );
    });
}
