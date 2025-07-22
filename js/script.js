// minha-loja-frontend/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api-backend-2025.onrender.com';

    // --- Seletores de Elementos ---
    // Sempre verifique se o elemento existe antes de tentar usá-lo ou adicionar listeners
    const logoutButton = document.getElementById('logout-button');
    const productsContainer = document.getElementById('product-grid'); // ID CORRIGIDO AQUI!

    // Modais e seus botões (Verificar existência)
    const paymentModal = document.getElementById('paymentModal');
    let paymentCloseButton = null;
    let paymentForm = null;
    let paymentMessage = null;
    if (paymentModal) { // Só busca os elementos internos se o modal existir
        paymentCloseButton = paymentModal.querySelector('.close-button');
        paymentForm = document.getElementById('paymentForm');
        paymentMessage = document.getElementById('payment-message');
    }

    // Elementos do Carrinho (Verificar existência)
    const cartIconContainer = document.getElementById('cart-icon-container');
    let cartCount = null;
    let cartModal = null;
    let cartCloseButton = null;
    let cartItemsList = null;
    let cartTotalElement = null;
    let checkoutButton = null;
    let emptyCartMessage = null;

    if (cartIconContainer) { // Só busca os elementos internos se o ícone do carrinho existir
        cartCount = document.getElementById('cart-count');
        cartModal = document.getElementById('cartModal');
        if (cartModal) { // Só busca os elementos internos se o modal do carrinho existir
            cartCloseButton = cartModal.querySelector('.close-button');
            cartItemsList = document.getElementById('cart-items-list');
            cartTotalElement = document.getElementById('cart-total');
            checkoutButton = document.getElementById('checkout-button');
            emptyCartMessage = document.getElementById('empty-cart-message');
        }
    }

    // --- Variáveis de Estado ---
    let cart = [];

    // --- Funções de Utilitário ---
    const checkLoginStatus = () => {
        const token = localStorage.getItem('authToken');
        return !!token;
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
        // Só atualiza se os elementos existirem
        if (cartCount && cartItemsList && cartTotalElement && checkoutButton && emptyCartMessage) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
            cartItemsList.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                emptyCartMessage.style.display = 'block';
                checkoutButton.disabled = true;
                cartTotalElement.textContent = `Total: R$ 0,00`;
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
        }
    };

    // --- Funções de Busca e Exibição de Produtos ---
    const fetchAndDisplayProducts = async () => {
        if (!productsContainer) { // Não faz nada se o container de produtos não existir
            console.warn("Elemento 'product-grid' não encontrado. Não é uma página de loja.");
            return;
        }

        productsContainer.innerHTML = '<p class="message info">Carregando produtos do servidor...</p>';

        try {
            const response = await fetch(`${API_URL}/products`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
            productsContainer.innerHTML = `<p class="message error">Erro ao carregar produtos: ${error.message}. Verifique a conexão com o backend ou se há produtos cadastrados.</p>`;
            console.error('Error fetching products:', error);
        }
    };

    // --- Funções de Processamento de Pagamento ---
    const processPayment = async (event) => {
        event.preventDefault();
        if (paymentMessage) paymentMessage.textContent = 'Processando pagamento...';
        if (paymentMessage) paymentMessage.className = 'message info';

        // Esses IDs devem ser buscados dentro da função, pois só são relevantes aqui
        const cardNumberInput = document.getElementById('card-number');
        const cardNameInput = document.getElementById('card-name');
        const expiryDateInput = document.getElementById('expiry-date');
        const cvvInput = document.getElementById('cvv');

        const cardNumber = cardNumberInput ? cardNumberInput.value : '';
        const cardName = cardNameInput ? cardNameInput.value : '';
        const expiryDate = expiryDateInput ? expiryDateInput.value : '';
        const cvv = cvvInput ? cvvInput.value : '';

        const simulatedPaymentToken = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;

        if (!cardNumber || !cardName || !expiryDate || !cvv) {
            if (paymentMessage) {
                paymentMessage.textContent = 'Preencha todos os dados do cartão.';
                paymentMessage.className = 'message error';
            }
            return;
        }

        if (cart.length === 0) {
            if (paymentMessage) {
                paymentMessage.textContent = 'Erro: Carrinho vazio. Adicione produtos antes de pagar.';
                paymentMessage.className = 'message error';
            }
            return;
        }

        try {
            const isGatewaySuccess = true;
            if (!isGatewaySuccess) {
                if (paymentMessage) {
                    paymentMessage.textContent = 'Falha na comunicação com o gateway de pagamento. Tente novamente.';
                    paymentMessage.className = 'message error';
                }
                return;
            }

            const token = localStorage.getItem('authToken');
            if (!token) {
                if (paymentMessage) {
                    paymentMessage.textContent = 'Erro: Você não está logado. Faça login para comprar.';
                    paymentMessage.className = 'message error';
                }
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
                if (paymentMessage) {
                    paymentMessage.textContent = `Pagamento de R$ ${formatPrice(totalCartPrice)} aprovado!`;
                    paymentMessage.className = 'message success';
                }
                cart = [];
                saveCart();
                updateCartDisplay();

                setTimeout(() => {
                    if (paymentModal) paymentModal.style.display = 'none';
                    if (paymentForm) paymentForm.reset();
                    fetchAndDisplayProducts();
                }, 3000);
            } else {
                if (paymentMessage) {
                    paymentMessage.textContent = `Erro no pagamento: ${data.error || 'Falha na confirmação.'}`;
                    paymentMessage.className = 'message error';
                }
            }
        } catch (error) {
            if (paymentMessage) {
                paymentMessage.textContent = 'Ocorreu um erro inesperado ao processar o pagamento.';
                paymentMessage.className = 'message error';
            }
            console.error('Payment processing error:', error);
        }
    };

    // --- Event Listeners ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('cart');
            window.location.href = 'login.html';
        });
    }

    if (productsContainer) {
        productsContainer.addEventListener('click', (event) => {
            const addToCartButton = event.target.closest('.add-to-cart-button');
            if (addToCartButton) {
                if (!checkLoginStatus()) {
                    alert('Você precisa estar logado para adicionar produtos ao carrinho.');
                    window.location.href = 'login.html';
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
    }

    if (cartIconContainer) {
        cartIconContainer.addEventListener('click', () => {
            if (cartModal) cartModal.style.display = 'flex';
            updateCartDisplay();
        });
    }

    if (cartCloseButton) {
        cartCloseButton.addEventListener('click', () => {
            if (cartModal) cartModal.style.display = 'none';
        });
    }
    // Adicionado tratamento para o window.addEventListener fora do if(cartModal)
    // para fechar o modal ao clicar fora, mesmo se o cartIconContainer não existir.
    window.addEventListener('click', (event) => {
        if (cartModal && event.target === cartModal) { // Verifica se cartModal existe antes de comparar
            cartModal.style.display = 'none';
        }
        if (paymentModal && event.target === paymentModal) { // Verifica se paymentModal existe
            paymentModal.style.display = 'none';
        }
    });


    if (paymentCloseButton) {
        paymentCloseButton.addEventListener('click', () => {
            if (paymentModal) paymentModal.style.display = 'none';
        });
    }


    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            if (cartModal) cartModal.style.display = 'none';
            if (paymentModal) paymentModal.style.display = 'flex';
            if (paymentMessage) paymentMessage.textContent = '';
            if (paymentForm) paymentForm.reset();
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
    }

    if (cartItemsList) {
        cartItemsList.addEventListener('click', (event) => {
            const target = event.target;
            const productId = target.dataset.id;

            if (target.tagName === 'BUTTON') {
                if (target.dataset.change) {
                    updateQuantity(productId, parseInt(target.dataset.change));
                } else if (target.classList.contains('cart-item-remove')) {
                    removeFromCart(productId);
                }
            }
        });
    }

    // --- Inicialização da Loja ---
    if (productsContainer) { // Só tenta carregar produtos se estiver na página da loja
        fetchAndDisplayProducts();
        loadCart();
    }
});