document.addEventListener('DOMContentLoaded', () => {
    // *** A URL DA SUA API (Backend no Render) - SEM O /api NO FINAL ***
    const API_URL = 'https://api-backend-2025.onrender.com';

    // Lógica para a página de Login
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) { // Verifica se o formulário de login existe na página
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // CAPTURA OS VALORES DOS CAMPOS PELOS IDs DO login.html
            const email = document.getElementById('email').value; // Agora pega o email
            const password = document.getElementById('password').value;

            loginMessage.textContent = 'Autenticando...';
            loginMessage.className = 'message info';

            try {
                // Requisição para a rota /login do seu backend
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }), // Agora envia email e password
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('authToken', data.token);
                    loginMessage.textContent = 'Login bem-sucedido!';
                    loginMessage.className = 'message success';
                    // Redireciona para a página principal da loja (ajuste o caminho se necessário)
                    window.location.href = 'loja.html'; 
                } else {
                    loginMessage.textContent = data.error || 'Erro ao fazer login. Verifique email e senha.';
                    loginMessage.className = 'message error';
                }
            } catch (error) {
                // Erro de rede, servidor fora do ar, URL da API errada, etc.
                loginMessage.textContent = 'Erro de conexão com o servidor. Verifique sua URL da API.';
                loginMessage.className = 'message error';
                console.error('Login error:', error);
            }
        });
    }

    // Lógica para a página de Cadastro
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    if (registerForm) { // Verifica se o formulário de cadastro existe na página
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // CAPTURA OS VALORES DOS CAMPOS PELOS IDs DO cadastro.html
            const name = document.getElementById('fullName').value; 
            const email = document.getElementById('newEmail').value; 
            const password = document.getElementById('newPassword').value; 

            registerMessage.textContent = 'Cadastrando...';
            registerMessage.className = 'message info';

            try {
                // Requisição para a rota /users do seu backend (POST)
                const response = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }), // Envia name, email, password
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
                // Erro de rede, servidor fora do ar, URL da API errada, etc.
                registerMessage.textContent = 'Erro de conexão com o servidor ou resposta inválida.';
                registerMessage.className = 'message error';
                console.error('Register error:', error);
            }
        });
    }
});