document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api-backend-2025.onrender.com';
    const form = document.getElementById('login-form');
    const messageElement = document.getElementById('login-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                messageElement.textContent = 'Login bem-sucedido!';
                messageElement.style.color = '#5cb85c';
                
                // --- NOVA LÓGICA DE REDIRECIONAMENTO ---
                // Verifica a permissão do usuário e redireciona
                if (data.user && data.user.role === 'admin') {
                    setTimeout(() => {
                        window.location.href = 'usuarios.html'; // Para administradores
                    }, 1000);
                } else {
                    setTimeout(() => {
                        window.location.href = 'loja.html'; // Para usuários comuns
                    }, 1000);
                }
                // --- FIM DA NOVA LÓGICA ---

            } else {
                messageElement.textContent = `Erro: ${data.error || 'Falha no login.'}`;
                messageElement.style.color = '#d9534f';
            }
        } catch (error) {
            messageElement.textContent = 'Erro de conexão com o servidor.';
            messageElement.style.color = '#d9534f';
        }
    });
});
