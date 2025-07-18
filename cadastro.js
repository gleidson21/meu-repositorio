const API_URL = 'https://api-backend-2025.onrender.com';
const form = document.getElementById('user-form');
const messageElement = document.getElementById('register-message');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            messageElement.textContent = `Usuário ${data.name} cadastrado com sucesso!`;
            messageElement.style.color = '#5cb85c';
            form.reset();
            // Opcional: redirecionar para a tela de login após o cadastro
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageElement.textContent = `Erro: ${data.error || 'Falha no cadastro.'}`;
            messageElement.style.color = '#d9534f';
        }
    } catch (error) {
        messageElement.textContent = 'Erro de conexão com a API.';
        messageElement.style.color = '#d9534f';
    }
});