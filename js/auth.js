// minha-loja-frontend/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // *** ATENÇÃO: COLOQUE A URL DA SUA API AQUI! ***
    const API_URL = 'https://api-backend-2025.onrender.com/api'; // <--- ALTERE ESTA URL!

    // Lógica para a página de Login
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            loginMessage.textContent = 'Autenticando...';
            loginMessage.className = 'message info'; // Adiciona classe para estilo de info

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('authToken', data.token); // Armazena o token
                    loginMessage.textContent = 'Login bem-sucedido!';
                    loginMessage.className = 'message success';
                    // Redireciona para a loja principal
                    window.location.href = 'loja.html'; 
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

    // Lógica para a página de Cadastro
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newUsername = document.getElementById('newUsername').value;
            const newPassword = document.getElementById('newPassword').value;

            registerMessage.textContent = 'Cadastrando...';
            registerMessage.className = 'message info';

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: newUsername, password: newPassword }),
                });

                const data = await response.json();

                if (response.ok) {
                    registerMessage.textContent = 'Cadastro realizado com sucesso! Agora você pode fazer login.';
                    registerMessage.className = 'message success';
                    registerForm.reset(); // Limpa o formulário
                    // Opcional: Redirecionar para a página de login após alguns segundos
                    setTimeout(() => {
                        window.location.href = 'login.html'; 
                    }, 3000);
                } else {
                    registerMessage.textContent = data.error || 'Erro ao cadastrar. Tente outro nome de usuário.';
                    registerMessage.className = 'message error';
                }
            } catch (error) {
                registerMessage.textContent = 'Erro de conexão com o servidor. Verifique sua URL da API.';
                registerMessage.className = 'message error';
                console.error('Register error:', error);
            }
        });
    }
});