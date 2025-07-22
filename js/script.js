// minha-loja-frontend/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // *** ATENÇÃO: COLOQUE A URL DA SUA API AQUI! ***
    const API_URL = 'https://api-backend-2025.onrender.com'; // <--- ALTERE ESTA URL!

    // --- Seletores de Elementos ---
    const logoutButton = document.getElementById('logout-button');
    const productsContainer = document.getElementById('products-container');

    // Modais
    const paymentModal = document.getElementById('paymentModal');
    const paymentCloseButton = paymentModal.querySelector('.close-button');
    const paymentForm = document.getElementById('paymentForm');
    const paymentMessage = document.getElementById('payment-message');

    const cartIconContainer = document.getElementById('cart-icon-container');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cartModal');
    const cartCloseButton = cartModal.querySelector('.close-button');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // --- Variáveis de Estado ---
    let cart = []; // Array para armazenar os itens do carrinho

    // --- Funções de Utilitário ---
    const checkLoginStatus = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'login.html'; // Redireciona para a página de login
            return false;
        }
        return true;
    };

    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2).replace('.', ',');
    };

    // --- Funções de Lógica do Carrinho ---
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const loadCart = () => {
        const storedCart = localStorage.getItem('cart');
        cart = storedCart ? JSON.parse(storedCart) : [];
        updateCartDisplay();
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCartDisplay();
        // Feedback visual para o usuário
        const productName = product.name.length > 20 ? product.name.substring(0, 17) + '...' : product.name;
        alert(`"${productName}" adicionado ao carrinho! Quantidade: ${existingItem ? existingItem.quantity : 1}`);
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
    };

    const updateQuantity = (productId, change) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            }
            saveCart();
            updateCartDisplay();
        }
    };

    const updateCartDisplay = () => {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        cartItemsList.innerHTML = ''; // Limpa a lista antes de renderizar
        let total = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutButton.disabled = true;
            cartTotalElement.textContent = `Total: R$ 0,00`; // Garante que o total é 0
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutButton.disabled = false;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <img src="${item.image_url || 'https://placehold.co/80x80/cccccc/333333?text=Sem+Imagem'}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>R$ ${formatPrice(item.price)} cada</p>
                        <p>Subtotal: R$ ${formatPrice(itemTotal)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button data-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">Remover</button>
                `;
                cartItemsList.appendChild(itemElement);
            });
        }
        cartTotalElement.textContent = `Total: R$ ${formatPrice(total)}`;
    };

    // --- Funções de Busca e Exibição de Produtos ---
    const fetchAndDisplayProducts = async () => {
        productsContainer.innerHTML = '<p class="message info">Carregando produtos do servidor...</p>';
        const token = localStorage.getItem('authToken');

        if (!token) {
            productsContainer.innerHTML = '<p class="message error">Erro: Você não está logado. Redirecionando para o login...</p>';
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    productsContainer.innerHTML = '<p class="message error">Sua sessão expirou ou o token é inválido. Redirecionando para o login...</p>';
                    localStorage.removeItem('authToken');
                    window.location.href = 'login.html';
                } else {
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                return;
            }

            const products = await response.json();
            productsContainer.innerHTML = '';

            if (products.length > 0) {
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    const imageUrl = product.image_url || 'https://placehold.co/300x200/cccccc/333333?text=Sem+Imagem';
                    productCard.innerHTML = `
                        <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/333333?text=Sem+Imagem';">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <span class="price">R$ ${formatPrice(product.price)}</span>
                        <button class="add-to-cart-button" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Adicionar ao Carrinho
                        </button>
                    `;
                    productsContainer.appendChild(productCard);
                });
            } else {
                productsContainer.innerHTML = '<p class="message info">Nenhum produto disponível no momento. Adicione produtos no painel de administração.</p>';
            }
        } catch (error) {
            productsContainer.innerHTML = `<p class="message error">Erro ao carregar produtos: ${error.message}. Verifique a conexão com o backend.</p>`;
        }
    };

    // --- Funções de Processamento de Pagamento ---
    const processPayment = async (event) => {
        event.preventDefault();
        paymentMessage.textContent = 'Processando pagamento...';
        paymentMessage.className = 'message info';

        const cardNumber = document.getElementById('card-number').value;
        const cardName = document.getElementById('card-name').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        const simulatedPaymentToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;

        if (!cardNumber || !cardName || !expiryDate || !cvv) {
            paymentMessage.textContent = 'Preencha todos os dados do cartão.';
            paymentMessage.className = 'message error';
            return;
        }

        if (cart.length === 0) {
            paymentMessage.textContent = 'Erro: Carrinho vazio. Adicione produtos antes de pagar.';
            paymentMessage.className = 'message error';
            return;
        }

        try {
            // Simulação de sucesso do gateway. Em uma aplicação real, você integraria com um serviço de pagamento.
            const isGatewaySuccess = true; 
            if (!isGatewaySuccess) {
                paymentMessage.textContent = 'Falha na comunicação com o gateway de pagamento. Tente novamente.';
                paymentMessage.className = 'message error';
                return;
            }

            const token = localStorage.getItem('authToken');
            if (!token) {
                paymentMessage.textContent = 'Erro: Você não está logado. Faça login para comprar.';
                paymentMessage.className = 'message error';
                window.location.href = 'login.html';
                return;
            }

            const payload = {
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                paymentToken: simulatedPaymentToken,
                // Em uma integração real, você não enviaria dados sensíveis do cartão para o backend.
                // Apenas o token gerado pelo gateway. Aqui mantemos para demonstrar a simulação.
                cardNumber: cardNumber,
                expiryDate: expiryDate,
                cvv: cvv
            };

            const response = await fetch(`${API_URL}/process-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                paymentMessage.textContent = `Pagamento de R$ ${formatPrice(totalCartPrice)} aprovado!`;
                paymentMessage.className = 'message success';
                cart = []; // Esvazia o carrinho após o pagamento
                saveCart(); // Salva o carrinho vazio
                updateCartDisplay(); // Atualiza o display do carrinho

                setTimeout(() => {
                    paymentModal.style.display = 'none';
                    paymentForm.reset();
                    fetchAndDisplayProducts(); // Opcional: recarregar produtos para atualizar estoque
                }, 3000);
            } else {
                paymentMessage.textContent = `Erro no pagamento: ${data.error || 'Falha na confirmação.'}`;
                paymentMessage.className = 'message error';
            }
        } catch (error) {
            paymentMessage.textContent = 'Ocorreu um erro inesperado ao processar o pagamento.';
            paymentMessage.className = 'message error';
            console.error('Payment processing error:', error);
        }
    };

    // --- Event Listeners ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('cart'); // Limpa o carrinho ao sair
        window.location.href = 'login.html';
    });

    productsContainer.addEventListener('click', (event) => {
        const addToCartButton = event.target.closest('.add-to-cart-button');
        if (addToCartButton) {
            if (!checkLoginStatus()) { // Garante que o usuário está logado
                return;
            }
            const productId = addToCartButton.dataset.productId;
            const token = localStorage.getItem('authToken');

            fetch(`${API_URL}/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Produto não encontrado no servidor ou acesso negado.');
                }
                return response.json();
            })
            .then(product => {
                addToCart(product);
            })
            .catch(error => {
                alert(`Erro ao adicionar produto ao carrinho: ${error.message}`);
                console.error('Error adding product to cart:', error);
            });
        }
    });

    cartIconContainer.addEventListener('click', () => {
        cartModal.style.display = 'flex';
        updateCartDisplay();
    });

    cartCloseButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    // Fecha o modal do carrinho ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    paymentCloseButton.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });
    // Fecha o modal de pagamento ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        cartModal.style.display = 'none'; // Fecha o modal do carrinho
        paymentModal.style.display = 'flex'; // Abre o modal de pagamento
        paymentMessage.textContent = '';
        paymentForm.reset();
    });

    paymentForm.addEventListener('submit', processPayment);

    cartItemsList.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.id;

        if (target.tagName === 'BUTTON') {
            if (target.dataset.change) { // Botões de + e -
                updateQuantity(productId, parseInt(target.dataset.change));
            } else if (target.classList.contains('cart-item-remove')) { // Botão Remover
                removeFromCart(productId);
            }
        }
    });

    // --- Inicialização da Loja ---
    if (checkLoginStatus()) { // Verifica login ao carregar a página da loja
        fetchAndDisplayProducts();
        loadCart(); // Carrega o carrinho ao iniciar
    }
});