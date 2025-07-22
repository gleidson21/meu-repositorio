document.addEventListener('DOMContentLoaded', () => {
    // *** A URL DA SUA API (Backend no Render) - SEM O /api NO FINAL ***
    const API_URL = 'https://api-backend-2025.onrender.com';

    // Lógica para a página de Login (login.html)
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) { // Verifica se o formulário de login existe na página
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // Garanta que os IDs 'username' e 'password' existem no seu login.html
            const username = document.getElementById('username').value; 
            const password = document.getElementById('password').value;

            loginMessage.textContent = 'Autenticando...';
            loginMessage.className = 'message info';

            try {
                const response = await fetch(`${API_URL}/login`, { // Chama /login no backend
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('authToken', data.token);
                    loginMessage.textContent = 'Login bem-sucedido!';
                    loginMessage.className = 'message success';
                    // Redireciona para a página principal da loja (index.html ou loja.html)
                    window.location.href = 'index.html'; // Ou 'loja.html' se for sua página principal
                } else {
                    loginMessage.textContent = data.error || 'Erro ao fazer login. Verifique usuário e senha.';
                    loginMessage.className = 'message error';
                }
            } catch (error) {
                loginMessage.textContent = 'Erro de conexão com o servidor. Verifique sua URL da API.';
                loginMessage.className = 'message error';
                console.error('Login error:', error);
            }
        });
    }

    // Lógica para a página de Cadastro (cadastro.html ou index.html, se for sua página de cadastro)
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    if (registerForm) { // Verifica se o formulário de cadastro existe na página
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // CAPTURA OS VALORES DOS CAMPOS PELOS IDs CORRETOS DO cadastro.html
            // ESTES IDS DEVEM EXISTIR NO HTML, CASO CONTRÁRIO CAUSARÃO O ERRO "Cannot read properties of null"
            const name = document.getElementById('fullName').value; // ID: fullName
            const email = document.getElementById('newEmail').value; // ID: newEmail
            const password = document.getElementById('newPassword').value; // ID: newPassword

            registerMessage.textContent = 'Cadastrando...';
            registerMessage.className = 'message info';

            try {
                // Requisição para a rota /users do seu backend (POST)
                const response = await fetch(`${API_URL}/users`, { // Chama /users no backend
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // ENVIA OS DADOS COM OS NOMES QUE O BACKEND ESPERA (name, email, password)
                    body: JSON.stringify({ name, email, password }), 
                });

                const data = await response.json();

                if (response.ok) {
                    registerMessage.textContent = 'Cadastro realizado com sucesso! Agora você pode fazer login.';
                    registerMessage.className = 'message success';
                    registerForm.reset(); // Limpa o formulário
                    setTimeout(() => {
                        window.location.href = 'login.html'; // Redireciona para login
                    }, 3000);
                } else {
                    registerMessage.textContent = data.error || 'Erro ao cadastrar. Tente outro email ou verifique os dados.';
                    registerMessage.className = 'message error';
                }
            } catch (error) {
                registerMessage.textContent = 'Erro de conexão com o servidor ou resposta inválida.';
                registerMessage.className = 'message error';
                console.error('Register error:', error);
            }
        });
    }
});