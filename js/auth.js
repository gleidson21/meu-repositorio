// minha-loja-frontend/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // *** ATENÇÃO: COLOQUE A URL DA SUA API AQUI! ***

    const API_URL = 'https://api-backend-2025.onrender.com'; // <--- ALTERE ESTA URL!

    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // CAPTURA OS VALORES DOS CAMPOS COM OS IDs CORRETOS DO HTML
            const name = document.getElementById('fullName').value; // <-- Captura o nome completo
            const email = document.getElementById('newEmail').value; // <-- Captura o email
            const password = document.getElementById('newPassword').value; // <-- Captura a senha

            registerMessage.textContent = 'Cadastrando...';
            registerMessage.className = 'message info';

            try {
                // Requisição para a rota /users do seu backend (POST)
                const response = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // ENVIA OS DADOS PARA O BACKEND COM OS NOMES QUE ELE ESPERA (name, email, password)
                    body: JSON.stringify({ name, email, password }), // <-- IMPORTANTE: name, email, password
                });

                const data = await response.json();

                if (response.ok) {
                    registerMessage.textContent = 'Cadastro realizado com sucesso! Agora você pode fazer login.';
                    registerMessage.className = 'message success';
                    registerForm.reset(); // Limpa o formulário
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                } else {
                    // Se o backend retornar um erro específico, mostre-o
                    registerMessage.textContent = data.error || 'Erro ao cadastrar. Verifique os dados.';
                    registerMessage.className = 'message error';
                }
            } catch (error) {
                registerMessage.textContent = 'Erro de conexão ou resposta inválida do servidor.';
                registerMessage.className = 'message error';
                console.error('Register error:', error);
            }
        });
    }
});