document.addEventListener('DOMContentLoaded', () => {
    // *** A URL DA SUA API (Backend no Render) ***
    const API_URL = 'https://api-backend-2025.onrender.com';

    // --- Funções de Utilitário ---
    const getToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Sua sessão expirou ou você não está logado. Por favor, faça login.');
            window.location.href = 'login.html'; // Redireciona para o login
            return null;
        }
        return token;
    };

    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2).replace('.', ',');
    };

    const displayMessage = (element, message, type) => {
        if (element) {
            element.textContent = message;
            element.className = `message ${type}`; // 'info', 'success', 'error'
        }
    };

    // --- Seletores de Elementos (com Verificações de Existência) ---
    const logoutButton = document.getElementById('logout-button');
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productDescriptionInput = document.getElementById('productDescription');
    const productPriceInput = document.getElementById('productPrice');
    const productImageInput = document.getElementById('productImage');
    const saveProductButton = document.getElementById('saveProductButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const productMessage = document.getElementById('productMessage');
    const productListDiv = document.getElementById('productList');
    const userListDiv = document.getElementById('userList');
    const transactionListDiv = document.getElementById('transactionList');

    // --- Funções de Gerenciamento de Produtos ---
    const fetchProducts = async () => {
        const token = getToken();
        if (!token) return;

        displayMessage(productListDiv, 'Carregando produtos...', 'info');
        try {
            const response = await fetch(`${API_URL}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            displayMessage(productListDiv, `Erro ao carregar produtos: ${error.message}`, 'error');
            console.error('Erro ao buscar produtos:', error);
        }
    };

    const renderProducts = (products) => {
        if (!productListDiv) return; // Garante que o elemento existe
        productListDiv.innerHTML = ''; // Limpa a lista

        if (products.length === 0) {
            productListDiv.innerHTML = '<p class="message info">Nenhum produto cadastrado.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('admin-list-items');
        products.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${product.name} (R$ ${formatPrice(product.price)})</span>
                <div class="actions">
                    <button class="edit-button" data-id="${product.id}">Editar</button>
                    <button class="delete-button" data-id="${product.id}">Excluir</button>
                </div>
            `;
            ul.appendChild(li);
        });
        productListDiv.appendChild(ul);
    };

    const saveProduct = async (event) => {
        event.preventDefault();
        const token = getToken();
        if (!token) return;

        const productId = productIdInput ? productIdInput.value : '';
        const name = productNameInput ? productNameInput.value : '';
        const description = productDescriptionInput ? productDescriptionInput.value : '';
        const price = productPriceInput ? parseFloat(productPriceInput.value) : 0;
        const image_url = productImageInput ? productImageInput.value : '';

        if (!name || !price) {
            displayMessage(productMessage, 'Nome e preço são obrigatórios.', 'error');
            return;
        }

        const method = productId ? 'PUT' : 'POST';
        const url = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`;

        displayMessage(productMessage, 'Salvando produto...', 'info');

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, description, price, image_url })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(productMessage, data.message || 'Produto salvo com sucesso!', 'success');
                productForm.reset();
                if (productIdInput) productIdInput.value = ''; // Limpa o ID oculto
                if (cancelEditButton) cancelEditButton.style.display = 'none';
                fetchProducts(); // Recarrega a lista
            } else {
                displayMessage(productMessage, data.error || 'Erro ao salvar produto.', 'error');
            }
        } catch (error) {
            displayMessage(productMessage, `Erro de conexão: ${error.message}`, 'error');
            console.error('Erro ao salvar produto:', error);
        }
    };

    const editProduct = async (productId) => {
        const token = getToken();
        if (!token) return;

        displayMessage(productMessage, 'Carregando produto para edição...', 'info');
        try {
            const response = await fetch(`${API_URL}/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const product = await response.json();

            if (productIdInput) productIdInput.value = product.id;
            if (productNameInput) productNameInput.value = product.name;
            if (productDescriptionInput) productDescriptionInput.value = product.description || '';
            if (productPriceInput) productPriceInput.value = product.price;
            if (productImageInput) productImageInput.value = product.image_url || '';

            if (cancelEditButton) cancelEditButton.style.display = 'inline-block';
            displayMessage(productMessage, 'Produto carregado para edição.', 'info');
        } catch (error) {
            displayMessage(productMessage, `Erro ao carregar produto: ${error.message}`, 'error');
            console.error('Erro ao editar produto:', error);
        }
    };

    const deleteProduct = async (productId) => {
        const token = getToken();
        if (!token) return;

        if (!confirm('Tem certeza que deseja excluir este produto?')) { // Usando confirm para simplicidade, mas modal seria melhor
            return;
        }

        displayMessage(productMessage, 'Excluindo produto...', 'info');
        try {
            const response = await fetch(`${API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(productMessage, data.message || 'Produto excluído com sucesso!', 'success');
                fetchProducts(); // Recarrega a lista
            } else {
                displayMessage(productMessage, data.error || 'Erro ao excluir produto.', 'error');
            }
        } catch (error) {
            displayMessage(productMessage, `Erro de conexão: ${error.message}`, 'error');
            console.error('Erro ao excluir produto:', error);
        }
    };

    // --- Funções de Gerenciamento de Usuários (Exemplo) ---
    const fetchUsers = async () => {
        const token = getToken();
        if (!token) return;

        displayMessage(userListDiv, 'Carregando usuários...', 'info');
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            displayMessage(userListDiv, `Erro ao carregar usuários: ${error.message}`, 'error');
            console.error('Erro ao buscar usuários:', error);
        }
    };

    const renderUsers = (users) => {
        if (!userListDiv) return;
        userListDiv.innerHTML = '';

        if (users.length === 0) {
            userListDiv.innerHTML = '<p class="message info">Nenhum usuário cadastrado.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('admin-list-items');
        users.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${user.name} (${user.email}) - ${user.role}</span>
                            <div class="actions">
                                <button class="delete-user-button" data-id="${user.id}">Excluir</button>
                            </div>`;
            ul.appendChild(li);
        });
        userListDiv.appendChild(ul);
    };

    const deleteUser = async (userId) => {
        const token = getToken();
        if (!token) return;

        if (!confirm('Tem certeza que deseja excluir este usuário?')) {
            return;
        }

        displayMessage(userListDiv, 'Excluindo usuário...', 'info');
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(userListDiv, data.message || 'Usuário excluído com sucesso!', 'success');
                fetchUsers();
            } else {
                displayMessage(userListDiv, data.error || 'Erro ao excluir usuário.', 'error');
            }
        } catch (error) {
            displayMessage(userListDiv, `Erro de conexão: ${error.message}`, 'error');
            console.error('Erro ao excluir usuário:', error);
        }
    };


    // --- Funções de Gerenciamento de Transações (Exemplo) ---
    const fetchTransactions = async () => {
        const token = getToken();
        if (!token) return;

        displayMessage(transactionListDiv, 'Carregando transações...', 'info');
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const transactions = await response.json();
            renderTransactions(transactions);
        } catch (error) {
            displayMessage(transactionListDiv, `Erro ao carregar transações: ${error.message}`, 'error');
            console.error('Erro ao buscar transações:', error);
        }
    };

    const renderTransactions = (transactions) => {
        if (!transactionListDiv) return;
        transactionListDiv.innerHTML = '';

        if (transactions.length === 0) {
            transactionListDiv.innerHTML = '<p class="message info">Nenhuma transação encontrada.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('admin-list-items');
        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>ID: ${transaction.id} | Usuário: ${transaction.user ? transaction.user.email : 'N/A'} | Produto: ${transaction.product ? transaction.product.name : 'N/A'} | Valor: R$ ${formatPrice(transaction.amount)} | Status: ${transaction.paymentStatus}</span>
            `;
            ul.appendChild(li);
        });
        transactionListDiv.appendChild(ul);
    };


    // --- Event Listeners ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Você foi desconectado do painel administrativo.');
            window.location.href = 'login.html';
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }

    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            if (productForm) productForm.reset();
            if (productIdInput) productIdInput.value = '';
            if (cancelEditButton) cancelEditButton.style.display = 'none';
            displayMessage(productMessage, '', 'info'); // Limpa a mensagem
        });
    }

    if (productListDiv) {
        productListDiv.addEventListener('click', (event) => {
            const target = event.target;
            const productId = target.dataset.id;
            if (target.classList.contains('edit-button')) {
                editProduct(productId);
            } else if (target.classList.contains('delete-button')) {
                deleteProduct(productId);
            }
        });
    }

    if (userListDiv) {
        userListDiv.addEventListener('click', (event) => {
            const target = event.target;
            const userId = target.dataset.id;
            if (target.classList.contains('delete-user-button')) {
                deleteUser(userId);
            }
        });
    }


    // --- Inicialização do Painel Admin ---
    const token = getToken(); // Verifica o token logo no início
    if (token) {
        // Carrega os dados apenas se o token for válido
        if (productListDiv) fetchProducts();
        if (userListDiv) fetchUsers();
        if (transactionListDiv) fetchTransactions();
    }
});
