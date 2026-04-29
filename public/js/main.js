let cart = JSON.parse(localStorage.getItem("cart")) || [];
let productsCache = [];

async function fetchProducts(params = {}) {
    const query = new URLSearchParams(params);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    if (typeof apiRequest === "function") {
        return apiRequest(`/api/products${suffix}`);
    }
    const response = await fetch(`/api/products${suffix}`);
    if (!response.ok) throw new Error("Не удалось загрузить товары");
    return response.json();
}

// Обновление счетчика корзины
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(el => {
        el.textContent = count;
    });
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Добавление товара в корзину
async function addToCart(productId) {
    let product = productsCache.find((p) => p.id === productId);
    if (!product) {
        try {
            product = await fetch(`/api/products/${productId}`).then((r) => {
                if (!r.ok) throw new Error();
                return r.json();
            });
            productsCache.push(product);
        } catch {
            showNotification("Не удалось добавить товар в корзину", "error");
            return;
        }
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
    showNotification('Товар добавлен в корзину!');
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
}

// Изменение количества товара
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCart();
    }
}

// Обновление отображения корзины
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.image}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">Удалить</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Обновление итоговой суммы
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        cartTotal.textContent = `${total.toLocaleString()} ₽`;
    }
}

// Переключение корзины
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('active');
    }
}

// Оформление заказа
async function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!', 'error');
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        showNotification('Необходимо войти в систему для оформления заказа', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const order = await apiRequest("/api/orders", {
            method: "POST",
            body: JSON.stringify({
                items: cart.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            }),
        });

        alert(`Спасибо за заказ!\n\nЗаказ #${order.id}\nИтого: ${total.toLocaleString()} ₽\n\nВаш заказ будет обработан в ближайшее время.`);
        cart = [];
        saveCart();
        updateCart();
        toggleCart();
    } catch (error) {
        showNotification(error.message || "Не удалось оформить заказ", "error");
    }
}

// Показ уведомлений (глобальная функция)
window.showNotification = function(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Поиск товаров
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterProducts(query);
        });
    }
}

// Фильтрация товаров
function filterProducts(searchQuery = '') {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    let filteredProducts = productsCache;

    // Поиск по названию и описанию
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery) ||
            product.brand.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery)
        );
    }

    // Отображение товаров
    displayProducts(filteredProducts);
}

// Отображение товаров
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (productsToShow.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Товары не найдены</p>';
        return;
    }

    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Фильтр по категории
function filterByCategory(category) {
    window.location.href = `catalog.html?category=${category}`;
}

// Переключение мобильного меню
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    if (nav) {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
    updateCart();
    setupSearch();

    // Загрузка популярных товаров на главной странице
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        try {
            productsCache = await fetchProducts();
            const popularProducts = productsCache.slice(0, 8);
            displayProducts(popularProducts);
        } catch (error) {
            showNotification("Не удалось загрузить товары", "error");
        }
    }
});

// Закрытие корзины при клике вне её
document.addEventListener('click', (e) => {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar && !cartSidebar.contains(e.target) && 
        !e.target.closest('.cart-icon') && 
        !e.target.closest('.close-cart')) {
        cartSidebar.classList.remove('active');
    }
});

// Добавление анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
