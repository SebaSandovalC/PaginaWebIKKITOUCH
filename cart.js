// Clase para manejar el carrito de compras
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.setupEventListeners();
        this.updateCartCount();
        this.renderMiniCart();
        
        // Verificar si estamos en la página de venta y renderizar el carrito
        if (window.location.pathname.includes('venta.html')) {
            this.renderCart();
        }
    }

    setupEventListeners() {
        // Evento para abrir el mini-carrito
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.mini-cart').classList.add('active');
            });
        }

        // Evento para cerrar el mini-carrito
        const closeMiniCart = document.querySelector('.close-mini-cart');
        if (closeMiniCart) {
            closeMiniCart.addEventListener('click', () => {
                document.querySelector('.mini-cart').classList.remove('active');
            });
        }

        // Evento para eliminar todo
        const clearCartBtn = document.querySelector('.clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Evento para ir a pago
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    alert('El carrito está vacío');
                    return;
                }
                window.location.href = 'venta.html';
            });
        }
    }

    addItem(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
        this.saveCart();
        this.updateCartCount();
        this.renderMiniCart();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        this.renderMiniCart();
        
        // Si estamos en la página de venta, actualizar también la vista del carrito
        if (window.location.pathname.includes('venta.html')) {
            this.renderCart();
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
        this.renderMiniCart();
        
        // Si estamos en la página de venta, actualizar también la vista del carrito
        if (window.location.pathname.includes('venta.html')) {
            this.renderCart();
        }
    }

    updateQuantity(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartCount();
            this.renderMiniCart();
            
            // Si estamos en la página de venta, actualizar también la vista del carrito
            if (window.location.pathname.includes('venta.html')) {
                this.renderCart();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }

    renderMiniCart() {
        const miniCartItems = document.querySelector('.mini-cart-items');
        const miniCartTotal = document.querySelector('.mini-cart-total-amount');
        
        if (!miniCartItems || !miniCartTotal) return;
        
        if (this.items.length === 0) {
            miniCartItems.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
            miniCartTotal.textContent = '$0';
            return;
        }

        miniCartItems.innerHTML = this.items.map(item => `
            <div class="mini-cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="mini-cart-item-info">
                    <div class="mini-cart-item-title">${item.name}</div>
                    <div class="mini-cart-item-price">$${item.price}</div>
                    <div class="mini-cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="mini-cart-item-remove" onclick="window.cart.removeItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Agregar event listeners para los botones de cantidad
        const plusButtons = miniCartItems.querySelectorAll('.quantity-btn.plus');
        const minusButtons = miniCartItems.querySelectorAll('.quantity-btn.minus');
        
        plusButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity + 1);
            });
        });
        
        minusButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity - 1);
            });
        });

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        miniCartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Calcular totales
    calculateTotals() {
        const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.19; // IVA 19%
        const total = subtotal + tax;

        return {
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        };
    }

    // Renderizar el carrito
    renderCart() {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;

        cartItems.innerHTML = this.items.length ? this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <i class="fas fa-trash remove-item" data-id="${item.id}"></i>
                </div>
            </div>
        `).join('') : '<p class="empty-cart">Tu carrito está vacío</p>';

        const totals = this.calculateTotals();
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal}`;
        if (taxEl) taxEl.textContent = `$${totals.tax}`;
        if (totalEl) totalEl.textContent = `$${totals.total}`;
        
        // Agregar event listeners para los botones de cantidad
        const plusButtons = cartItems.querySelectorAll('.quantity-btn.plus');
        const minusButtons = cartItems.querySelectorAll('.quantity-btn.minus');
        const removeButtons = cartItems.querySelectorAll('.remove-item');
        
        plusButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity + 1);
            });
        });
        
        minusButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item) this.updateQuantity(id, item.quantity - 1);
            });
        });
        
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                this.removeItem(id);
            });
        });
        
        // Agregar event listener para el botón de checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    alert('El carrito está vacío');
                    return;
                }
                alert('¡Gracias por tu compra! Procesaremos tu pago.');
                this.clearCart();
                window.location.href = 'index.html';
            });
        }
    }
}

// Inicializar el carrito cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});

// Exportar para uso en otros archivos
window.cart = cart; 