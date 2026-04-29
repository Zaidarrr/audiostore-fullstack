document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id"), 10);

    if (productId) {
        await loadProductDetails(productId);
    } else {
        document.getElementById("productDetails").innerHTML = "<p>Товар не найден</p>";
    }
});

async function loadProductDetails(productId) {
    const productDetails = document.getElementById("productDetails");
    try {
        const product = await fetch(`/api/products/${productId}`).then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
        });
        const sameCategory = await fetch(`/api/products?category=${encodeURIComponent(product.category)}`).then((r) => {
            if (!r.ok) throw new Error();
            return r.json();
        });
        const similarProducts = sameCategory.filter((p) => p.id !== product.id).slice(0, 4);

        productDetails.innerHTML = `
        <div class="product-details">
            <div class="product-details-main">
                <div class="product-details-image">
                    <div class="product-large-image">${product.image}</div>
                </div>
                <div class="product-details-info">
                    <div class="product-details-breadcrumb">
                        <a href="index.html">Главная</a> / 
                        <a href="catalog.html?category=${product.category}">${getCategoryName(product.category)}</a> / 
                        <span>${product.name}</span>
                    </div>
                    <div class="product-details-brand">${product.brand}</div>
                    <h1 class="product-details-name">${product.name}</h1>
                    <div class="product-details-price">${product.price.toLocaleString()} ₽</div>
                    <div class="product-details-description">
                        <h3>Описание</h3>
                        <p>${product.description}</p>
                        <p>${getProductDetails(product)}</p>
                    </div>
                    <div class="product-details-actions">
                        <button class="btn btn-primary btn-large" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i> Добавить в корзину
                        </button>
                        <button class="btn btn-secondary btn-large" onclick="addToFavorites(${product.id})">
                            <i class="fas fa-heart"></i> В избранное
                        </button>
                    </div>
                    <div class="product-details-features">
                        <div class="feature-item">
                            <i class="fas fa-shipping-fast"></i>
                            <span>Бесплатная доставка от 5000 ₽</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>Официальная гарантия</span>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-undo"></i>
                            <span>Возврат в течение 14 дней</span>
                        </div>
                    </div>
                </div>
            </div>

            ${similarProducts.length > 0 ? `
                <div class="similar-products">
                    <h2>Похожие товары</h2>
                    <div class="products-grid">
                        ${similarProducts.map(p => `
                            <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
                                <div class="product-image">${p.image}</div>
                                <div class="product-info">
                                    <div class="product-brand">${p.brand}</div>
                                    <div class="product-name">${p.name}</div>
                                    <div class="product-description">${p.description}</div>
                                    <div class="product-footer">
                                        <div class="product-price">${p.price.toLocaleString()} ₽</div>
                                        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id})">
                                            В корзину
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    } catch {
        productDetails.innerHTML = "<p>Товар не найден</p>";
    }
}

// Получение названия категории
function getCategoryName(category) {
    const categories = {
        'headphones': 'Наушники',
        'speakers': 'Колонки',
        'microphones': 'Микрофоны',
        'amplifiers': 'Усилители',
        'accessories': 'Аксессуары'
    };
    return categories[category] || category;
}

// Получение дополнительных деталей товара
function getProductDetails(product) {
    const details = {
        'headphones': 'Эти наушники обеспечивают превосходное качество звука с детальной проработкой всех частот. Идеально подходят для прослушивания музыки, просмотра фильмов и игр.',
        'speakers': 'Мощная акустическая система с чистым и насыщенным звуком. Отлично подходит для домашнего использования и небольших мероприятий.',
        'microphones': 'Профессиональный микрофон с высоким качеством записи. Идеален для студийной работы, подкастов и видеозаписи.',
        'amplifiers': 'Качественный аудиоинтерфейс с низкой задержкой и чистым звуком. Подходит для домашней студии и профессиональной записи.',
        'accessories': 'Качественный аксессуар, который улучшит вашу аудиосистему и обеспечит удобство использования.'
    };
    return details[product.category] || '';
}

// Добавление в избранное
function addToFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        showNotification('Товар удален из избранного');
    } else {
        favorites.push(productId);
        showNotification('Товар добавлен в избранное!');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

