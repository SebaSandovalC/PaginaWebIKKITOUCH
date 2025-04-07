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

        // Evento para ir a pago - solo en el mini-carrito
        const miniCartCheckoutBtn = document.querySelector('.mini-cart .checkout-btn');
        if (miniCartCheckoutBtn) {
            miniCartCheckoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }

        // Evento para ir a pago - solo en la página de venta
        const cartPageCheckoutBtn = document.getElementById('checkout-btn');
        if (cartPageCheckoutBtn) {
            cartPageCheckoutBtn.addEventListener('click', () => {
                this.checkout();
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
        const cartCounts = document.querySelectorAll('.cart-count');
        cartCounts.forEach(cartCount => {
            cartCount.textContent = count;
        });
    }

    renderMiniCart() {
        const miniCartItems = document.querySelector('.mini-cart-items');
        const miniCartTotal = document.querySelector('.mini-cart-total-amount');
        
        if (!miniCartItems) return;

        if (this.items.length === 0) {
            miniCartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
            miniCartTotal.textContent = '$0';
            return;
        }

        miniCartItems.innerHTML = this.items.map(item => `
            <div class="mini-cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="mini-cart-item-image">
                <div class="mini-cart-item-info">
                    <h4 class="mini-cart-item-title">${item.name}</h4>
                    <p class="mini-cart-item-price">$${item.price}</p>
                    <div class="mini-cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="mini-cart-item-remove" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Agregar evento de clic a los items del mini-carrito
        miniCartItems.querySelectorAll('.mini-cart-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Evitar que se active cuando se hace clic en los botones de cantidad o eliminar
                if (e.target.closest('.quantity-btn') || e.target.closest('.mini-cart-item-remove')) {
                    return;
                }
                
                const itemId = item.dataset.id;
                const cartItem = this.items.find(i => i.id === itemId);
                if (cartItem) {
                    this.showItemModal(cartItem);
                }
            });
        });

        // Agregar event listeners para los botones de cantidad
        const plusButtons = miniCartItems.querySelectorAll('.quantity-btn.plus');
        const minusButtons = miniCartItems.querySelectorAll('.quantity-btn.minus');
        const removeButtons = miniCartItems.querySelectorAll('.mini-cart-item-remove');
        
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

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        miniCartTotal.textContent = `$${total.toFixed(2)}`;
    }

    showItemModal(item) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-image-container">
                    <span class="close-modal">&times;</span>
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="modal-info">
                    <div class="modal-info-left">
                        <h3>${item.name}</h3>
                        <p>Precio: $${item.price}</p>
                        <p>Cantidad: ${item.quantity}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Cerrar modal al hacer clic en la X
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Cerrar modal al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
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

    checkout() {
        // Verificar si ya existe un pop-up activo
        if (document.querySelector('.empty-cart-popup.active')) {
            return;
        }

        // Verificar si el carrito está vacío
        if (this.items.length === 0) {
            // Crear el pop-up de carrito vacío
            const popup = document.createElement('div');
            popup.className = 'empty-cart-popup';
            popup.innerHTML = `
                <div class="empty-cart-content">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Carrito Vacío</h3>
                    <p>Tu carrito está vacío. Agrega algunos productos antes de proceder al pago.</p>
                    <button class="close-popup">Entendido</button>
                </div>
            `;
            document.body.appendChild(popup);

            // Agregar clase para animación
            setTimeout(() => {
                popup.classList.add('active');
            }, 10);

            // Cerrar pop-up al hacer clic en el botón o fuera del contenido
            const closePopup = () => {
                popup.classList.remove('active');
                setTimeout(() => {
                    popup.remove();
                }, 300);
            };

            // Agregar evento de clic al botón de cerrar
            const closeButton = popup.querySelector('.close-popup');
            if (closeButton) {
                closeButton.addEventListener('click', closePopup);
            }

            // Agregar evento de clic al fondo
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    closePopup();
                }
            });

            return;
        }

        // Si el carrito no está vacío, redirigir a la página de venta
        window.location.href = 'venta.html';
    }
}

// Inicializar el carrito cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});

// Exportar para uso en otros archivos
window.cart = cart; 