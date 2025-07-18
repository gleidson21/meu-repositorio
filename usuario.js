const API_URL = 'https://api-backend-2025.onrender.com';
const usersList = document.getElementById('users-list');
const logoutButton = document.getElementById('logout-button');

// Função para buscar a lista de usuários (protegida por token)
const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        usersList.innerHTML = '<li>Acesso negado. Por favor, faça o login.</li>';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const users = await response.json();
        
        if (response.ok) {
            usersList.innerHTML = '';
            if (users.length > 0) {
                users.forEach(user => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <div class="user-info">
                            <i class="fas fa-user"></i>
                            <div class="user-details">
                                <p><strong>ID:</strong> ${user.id}</p>
                                <p><strong>Nome:</strong> ${user.name}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                            </div>
                        </div>
                        <div class="actions">
                            <button class="delete-button" data-user-id="${user.id}">
                                <i class="fas fa-trash-alt"></i> Deletar
                            </button>
                        </div>
                    `;
                    usersList.appendChild(listItem);
                });
            } else {
                usersList.innerHTML = '<li>Nenhum usuário cadastrado ainda.</li>';
            }
        } else {
            localStorage.removeItem('authToken');
            usersList.innerHTML = '<li>Sessão expirada. Faça o login novamente.</li>';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } catch (error) {
        usersList.innerHTML = '<li>Erro ao carregar lista de usuários.</li>';
    }
};

// Função para deletar um usuário
const deleteUser = async (userId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Você precisa estar logado para deletar um usuário.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert(`Usuário ${userId} deletado com sucesso!`);
            fetchUsers(); // Atualiza a lista após a deleção
        } else {
            const errorData = await response.json();
            alert(`Erro ao deletar: ${errorData.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        alert('Erro de conexão com a API.');
    }
};

// Adiciona um listener de evento para a lista para capturar cliques nos botões
usersList.addEventListener('click', (event) => {
    if (event.target.closest('.delete-button')) {
        const button = event.target.closest('.delete-button');
        const userId = button.dataset.userId;
        if (confirm('Tem certeza que deseja deletar este usuário?')) {
            deleteUser(userId);
        }
    }
});

// Lógica de logout
logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
});

// Carrega a lista de usuários quando a página é carregada
document.addEventListener('DOMContentLoaded', fetchUsers);