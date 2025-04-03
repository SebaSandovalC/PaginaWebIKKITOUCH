// Verificar si estamos en la página principal
const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

// Efecto de scroll suave para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Efecto de scroll para el header
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scroll Down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scroll Up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Efecto de fade-in para las secciones
const sections = document.querySelectorAll('section');
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Solo aplicar el efecto de fade-in en la página principal
if (isHomePage) {
    sections.forEach(section => {
        if (!section.id.includes('sobre-mi')) { // Excluir la sección "Sobre Mí"
            observer.observe(section);
        }
    });
}

// Efecto de hover para el logo
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('mouseover', () => {
        logo.classList.add('hover');
    });
    
    logo.addEventListener('mouseout', () => {
        logo.classList.remove('hover');
    });
}

// Efecto de hover para las imágenes del portfolio
const portfolioItems = document.querySelectorAll('.gallery-item');
portfolioItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.classList.add('hover');
    });
    
    item.addEventListener('mouseleave', () => {
        item.classList.remove('hover');
    });
});

// Modal para las imágenes del portfolio
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const closeBtn = document.querySelector('.close-modal');

if (modal && modalImg && modalPrice && closeBtn) {
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const price = item.querySelector('.price').textContent;
            
            modalImg.src = img.src;
            modalTitle.textContent = img.alt;
            modalDescription.textContent = 'Ilustración original';
            modalPrice.textContent = price;
            modal.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Efecto de parallax para el hero (solo en la página principal)
if (isHomePage) {
    const heroLogo = document.querySelector('.hero-logo');
    if (heroLogo) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            const yPos = scrolled * parallaxSpeed;
            
            if (scrolled <= window.innerHeight) {
                heroLogo.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
    }
}

// Efecto de hover para los botones de filtro
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.classList.add('hover');
    });
    
    button.addEventListener('mouseleave', () => {
        button.classList.remove('hover');
    });
});

// Validación del formulario de contacto
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('¡Gracias por tu mensaje! Te contactaré pronto.');
        contactForm.reset();
    });
}

// Portfolio Gallery (solo en la página principal)
if (isHomePage) {
    document.addEventListener('DOMContentLoaded', function() {
        loadPortfolioImages();
        setupFilters();
        setupModal();
    });
}

// Cargar imágenes del portfolio
async function loadPortfolioImages() {
    const gallery = document.querySelector('.gallery');
    const categories = {
        caballeros: 'IMG/portfolio/CABALLEROS DEL ZODIACO',
        pokemon: 'IMG/portfolio/POKE',
        myl: 'IMG/portfolio/MYL',
        dbz: 'IMG/portfolio/DBZ'
    };

    // Almacenar todas las imágenes por categoría
    const imagesByCategory = {};

    // Cargar imágenes de cada categoría
    for (const [category, path] of Object.entries(categories)) {
        const images = await getImagesFromCategory(path);
        imagesByCategory[category] = images;
        
        // Crear elementos para todas las imágenes pero ocultarlos inicialmente
        images.forEach(image => {
            const item = createGalleryItem(image, category);
            item.style.display = 'none'; // Ocultar inicialmente
            gallery.appendChild(item);
        });
    }

    // Mostrar las primeras 2 imágenes de cada categoría inicialmente
    for (const category in imagesByCategory) {
        const categoryImages = document.querySelectorAll(`.gallery-item.${category}`);
        for (let i = 0; i < Math.min(2, categoryImages.length); i++) {
            categoryImages[i].style.display = 'block';
        }
    }

    return imagesByCategory;
}

// Crear elemento de galería
function createGalleryItem(image, category) {
    const item = document.createElement('div');
    item.className = `gallery-item ${category}`;
    
    item.innerHTML = `
        <img src="${image.src}" alt="${image.name}">
        <div class="overlay">
            <h3>${image.name}</h3>
            <p>Ilustración original</p>
            <span class="price">$${image.price}</span>
        </div>
    `;

    item.addEventListener('click', () => openModal(image));
    return item;
}

// Formatear nombre de imagen
function formatImageName(name) {
    return name
        .replace(/\.[^/.]+$/, "") // Remover extensión
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

// Configurar filtros
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            // Actualizar botones activos
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filtrar items
            const items = document.querySelectorAll('.gallery-item');
            
            if (category === 'all') {
                // Para "Todos", mostrar solo 2 imágenes por categoría
                const categories = ['caballeros', 'pokemon', 'myl', 'dbz'];
                
                // Primero ocultar todas las imágenes
                items.forEach(item => item.style.display = 'none');
                
                // Luego mostrar solo 2 de cada categoría
                categories.forEach(cat => {
                    const categoryItems = document.querySelectorAll(`.gallery-item.${cat}`);
                    for (let i = 0; i < Math.min(2, categoryItems.length); i++) {
                        categoryItems[i].style.display = 'block';
                    }
                });
            } else {
                // Para categorías específicas, mostrar todas las imágenes de esa categoría
                items.forEach(item => {
                    if (item.classList.contains(category)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    });
}

// Configurar modal
function setupModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (modal && closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

// Función para abrir el modal
function openModal(image) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalPrice = document.getElementById('modalPrice');
    
    if (modal && modalImg && modalTitle && modalDescription && modalPrice) {
        modalImg.src = image.src;
        modalTitle.textContent = image.name;
        modalDescription.textContent = 'Ilustración original';
        modalPrice.textContent = `$${image.price}`;
        
        // Configurar el botón de añadir al carrito
        const modalContent = modal.querySelector('.modal-content');
        const addToCartBtn = modalContent.querySelector('.add-to-cart-btn');
        addToCartBtn.onclick = function() {
            const item = {
                id: image.name.toLowerCase().replace(/\s+/g, '-'),
                name: image.name,
                price: parseFloat(image.price),
                image: image.src
            };
            window.cart.addItem(item);
            closeModal();
        };
        
        modal.classList.add('active');
    }
}

// Función auxiliar para obtener imágenes de una categoría
async function getImagesFromCategory(path) {
    const images = {
        'IMG/portfolio/CABALLEROS DEL ZODIACO': [
            { src: 'IMG/portfolio/CABALLEROS DEL ZODIACO/Hila_De_Polaris.webp', name: 'Hila De Polaris', price: '30.00' },
            { src: 'IMG/portfolio/CABALLEROS DEL ZODIACO/capricornio.webp', name: 'Capricornio', price: '30.00' }
        ],
        'IMG/portfolio/POKE': [
            { src: 'IMG/portfolio/POKE/Charmander.webp', name: 'Charmander', price: '25.00' },
            { src: 'IMG/portfolio/POKE/Gengar - copia.webp', name: 'Gengar', price: '25.00' },
            { src: 'IMG/portfolio/POKE/Gengar 3.webp', name: 'Gengar Oscuro', price: '25.00' },
            { src: 'IMG/portfolio/POKE/Mewtwo - copia.webp', name: 'Mewtwo', price: '25.00' },
            { src: 'IMG/portfolio/POKE/pikachu - copia.webp', name: 'Pikachu', price: '25.00' }
        ],
        'IMG/portfolio/DBZ': [
            { src: 'IMG/portfolio/DBZ/Black goku.webp', name: 'Black Goku', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Dbz.webp', name: 'Janemba', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Bills 2.webp', name: 'Bills', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Cell medio.webp', name: 'Cell Medio', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Db final.webp', name: 'DB Final', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Majin bu gordo.webp', name: 'Majin Buu', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Piccolo.webp', name: 'Piccolo', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Cell.webp', name: 'Cell', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Freezer normal - copia.webp', name: 'Freezer', price: '35.00' },
            { src: 'IMG/portfolio/DBZ/Kid buu.webp', name: 'Kid Buu', price: '35.00' }
        ],
        'IMG/portfolio/MYL': [
            { src: 'IMG/portfolio/MYL/fereydun 2.webp', name: 'Fereydun', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Dragon dorado 2 final - copia.webp', name: 'Dragón Dorado', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Greuceanu.webp', name: 'Greuceanu', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Kamensky cmyk.webp', name: 'Kamensky', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Parte_Trasera_Mesa_Redonda.webp', name: 'Mesa Redonda', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Capitan_Garfio.webp', name: 'Capitán Garfio', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Cthulhu.webp', name: 'Cthulhu', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Londres.webp', name: 'Londres', price: '40.00' },
            { src: 'IMG/portfolio/MYL/Mac da tho 2.webp', name: 'Mac da Tho', price: '40.00' },
            { src: 'IMG/portfolio/MYL/finn mac cool.webp', name: 'Finn Mac Cool', price: '40.00' }
        ]
    };

    return images[path] || [];
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
const currentTheme = localStorage.getItem('theme') || 
    (prefersDarkScheme.matches ? 'dark' : 'light');

// Apply the saved theme
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Update theme icon based on current theme
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
} 