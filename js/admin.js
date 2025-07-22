// minha-loja-frontend/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // *** ATENÇÃO: COLOQUE A URL DA SUA API AQUI! ***
    const API_URL = 'https://api-backend-2025.onrender.com/api'; // <--- ALTERE ESTA URL!

    // --- Seletores de Elementos ---
    const addProductForm = document.getElementById('addProductForm');
    const addProductMessage = document.getElementById('addProductMessage');
    const adminProductList = document.getElementById('adminProductList');
    const loadingProductsAdmin = document.getElementById('loadingProductsAdmin');
    const adminLogoutButton = document.getElementById('admin-logout-button');

    // --- Funções Auxiliares ---
    const checkAdminAuth = () => {
        const token = localStorage.getItem('authToken');
        // Em um sistema real, você também verificaria se o token
        // pertence a um usuário com permissão de administrador no backend.
        // Por enquanto, apenas a existência do token é suficiente.
        if (!token) {
            alert('Acesso negado. Você precisa estar logado para acessar a área admin.');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    };

    const fetchAndDisplayAdminProducts = async () => {
        if (!checkAdminAuth()) return;

        loadingProductsAdmin.textContent = 'Carregando produtos para administração...';
        loadingProductsAdmin.className = 'message info';

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/products`, { // Busca todos os produtos para exibir no admin
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou sem permissão de admin. Redirecionando para login.');
                    localStorage.removeItem('authToken');
                    window.location.href = 'login.html';
                } else {
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                loadingProductsAdmin.textContent = `Erro: ${errorData.error || 'Não foi possível carregar produtos.'}`;
                loadingProductsAdmin.className = 'message error';
                return;
            }

            const products = await response.json();
            adminProductList.innerHTML = ''; // Limpa a lista existente
            loadingProductsAdmin.style.display = 'none'; // Esconde a mensagem de carregamento

            if (products.length > 0) {
                products.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</td>
                        <td>
                            <button data-id="${product.id}" class="delete-product-button">Excluir</button>
                            </td>
                    `;
                    adminProductList.appendChild(row);
                });
            } else {
                adminProductList.innerHTML = '<tr><td colspan="4">Nenhum produto cadastrado.</td></tr>';
            }

        } catch (error) {
            addProductMessage.textContent = `Erro ao carregar produtos: ${error.message}`;
            addProductMessage.className = 'message error';
            loadingProductsAdmin.textContent = `Erro ao carregar produtos: ${error.message}.`;
            loadingProductsAdmin.className = 'message error';
            console.error('Error fetching admin products:', error);
        }
    };

    const addProduct = async (event) => {
        event.preventDefault();
        if (!checkAdminAuth()) return;

        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const image_url = document.getElementById('productImage').value;

        addProductMessage.textContent = 'Adicionando produto...';
        addProductMessage.className = 'message info';

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/admin/products`, { // Rota para adicionar produto no backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, description, price, image_url })
            });

            const data = await response.json();

            if (response.ok) {
                addProductMessage.textContent = 'Produto adicionado com sucesso!';
                addProductMessage.className = 'message success';
                addProductForm.reset(); // Limpa o formulário
                fetchAndDisplayAdminProducts(); // Recarrega a lista de produtos
            } else {
                addProductMessage.textContent = data.error || 'Erro ao adicionar produto.';
                addProductMessage.className = 'message error';
            }
        } catch (error) {
            addProductMessage.textContent = 'Erro de conexão ao adicionar produto. Verifique sua URL da API.';
            addProductMessage.className = 'message error';
            console.error('Add product error:', error);
        }
    };

    const deleteProduct = async (productId) => {
        if (!checkAdminAuth()) return;

        if (!confirm(`Tem certeza que deseja excluir o produto com ID ${productId}? Esta ação é irreversível!`)) {
            return;
        }

        addProductMessage.textContent = 'Excluindo produto...';
        addProductMessage.className = 'message info';

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/admin/products/${productId}`, { // Rota para excluir produto
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                addProductMessage.textContent = `Produto ID ${productId} excluído com sucesso!`;
                addProductMessage.className = 'message success';
                fetchAndDisplayAdminProducts(); // Recarrega a lista de produtos
            } else {
                const errorData = await response.json();
                addProductMessage.textContent = errorData.error || 'Erro ao excluir produto.';
                addProductMessage.className = 'message error';
            }
        } catch (error) {
            addProductMessage.textContent = 'Erro de conexão ao excluir produto. Verifique sua URL da API.';
            addProductMessage.className = 'message error';
            console.error('Delete product error:', error);
        }
    };

    // --- Event Listeners ---
    addProductForm.addEventListener('submit', addProduct);

    adminProductList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-product-button')) {
            const productId = event.target.dataset.id;
            deleteProduct(productId);
        }
    });

    adminLogoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        alert('Você saiu da área de administração.');
        window.location.href = 'login.html'; // Volta para a página de login
    });

    // --- Inicialização do Painel Admin ---
    if (checkAdminAuth()) {
        fetchAndDisplayAdminProducts();
    }
});