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

const closeBtn = document.querySelector('.close-modal');

if (modal && modalImg && closeBtn) {
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
    
            
            modalImg.src = img.src;
            modalTitle.textContent = img.alt;
            modalDescription.textContent = 'Ilustración original';

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

// Configurar modal estilo Instagram/Behance
function setupModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close-modal');
    const infoPanel = document.getElementById('modalInfoPanel');
    const infoHandle = document.querySelector('.modal-info-handle');
    
    if (modal && closeBtn) {
        // Cerrar modal
        closeBtn.addEventListener('click', () => {
            closeModal();
        });
        
        // Cerrar al hacer click en el fondo
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Manejar panel deslizable
        if (infoHandle && infoPanel) {
            infoHandle.addEventListener('click', () => {
                infoPanel.classList.toggle('active');
            });
        }
        
        // Auto-mostrar panel después de 1 segundo
        setTimeout(() => {
            if (infoPanel) {
                infoPanel.classList.add('active');
            }
        }, 1000);
        
        // Configurar botones de acción
        setupModalActions();
    }
}

// Configurar acciones del modal
function setupModalActions() {
    const likeBtn = document.querySelector('.like-btn');
    const shareBtn = document.querySelector('.share-btn');
    const downloadBtn = document.querySelector('.download-btn');
    
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('liked');
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            // Funcionalidad de compartir
            if (navigator.share) {
                navigator.share({
                    title: 'IKKITOUCH - Ilustración',
                    text: 'Mira esta increíble ilustración',
                    url: window.location.href
                });
            } else {
                // Fallback para navegadores que no soportan Web Share API
                navigator.clipboard.writeText(window.location.href);
                showNotification('¡Enlace copiado al portapapeles!');
            }
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            showNotification('Información de contacto disponible en la sección de contacto');
        });
    }
}

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 3000;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Función para abrir el modal
function openModal(image) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalCategory = document.getElementById('modalCategory');
    const modalPrice = document.getElementById('modalPrice');
    const infoPanel = document.getElementById('modalInfoPanel');
    
    if (modal && modalImg && modalTitle && modalDescription) {
        // Configurar imagen
        modalImg.src = image.src;
        modalTitle.textContent = image.name;
        modalDescription.textContent = 'Ilustración digital original creada con técnicas avanzadas de arte digital. Cada pieza refleja la pasión por el arte y la atención al detalle.';
        
        // Configurar categoría
        if (modalCategory) {
            const category = getCategoryFromPath(image.src);
            modalCategory.textContent = category;
        }
        
        // Configurar precio
        if (modalPrice) {
            const price = getPriceForCategory(image.src);
            modalPrice.textContent = `$${price}`;
        }
        
        // Resetear panel de información
        if (infoPanel) {
            infoPanel.classList.remove('active');
        }
        
        // Mostrar modal
        modal.classList.add('active');
        
        // Auto-mostrar panel después de 1 segundo
        setTimeout(() => {
            if (infoPanel) {
                infoPanel.classList.add('active');
            }
        }, 1000);
    }
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    const infoPanel = document.getElementById('modalInfoPanel');
    
    if (infoPanel) {
        infoPanel.classList.remove('active');
    }
    
    setTimeout(() => {
        if (modal) {
            modal.classList.remove('active');
        }
    }, 200);
}

// Función auxiliar para obtener categoría desde la ruta
function getCategoryFromPath(imagePath) {
    if (imagePath.includes('CABALLEROS')) return 'Caballeros del Zodíaco';
    if (imagePath.includes('POKE')) return 'Pokémon';
    if (imagePath.includes('DBZ')) return 'Dragon Ball Z';
    if (imagePath.includes('MYL')) return 'Mitos y Leyendas';
    return 'Portfolio';
}

// Función auxiliar para obtener precio por categoría
function getPriceForCategory(imagePath) {
    if (imagePath.includes('CABALLEROS')) return 30;
    if (imagePath.includes('POKE')) return 25;
    if (imagePath.includes('DBZ')) return 35;
    if (imagePath.includes('MYL')) return 40;
    return 25;
}

// Función auxiliar para obtener imágenes de una categoría
async function getImagesFromCategory(path) {
    const images = {
        'IMG/portfolio/CABALLEROS DEL ZODIACO': [
            { src: 'IMG/portfolio/CABALLEROS DEL ZODIACO/Hila_De_Polaris.webp', name: 'Hila De Polaris' },
            { src: 'IMG/portfolio/CABALLEROS DEL ZODIACO/capricornio.webp', name: 'Capricornio' }
        ],
        'IMG/portfolio/POKE': [
            { src: 'IMG/portfolio/POKE/Charmander.webp', name: 'Charmander' },
            { src: 'IMG/portfolio/POKE/Gengar - copia.webp', name: 'Gengar' },
            { src: 'IMG/portfolio/POKE/Gengar 3.webp', name: 'Gengar Oscuro' },
            { src: 'IMG/portfolio/POKE/Mewtwo - copia.webp', name: 'Mewtwo' },
            { src: 'IMG/portfolio/POKE/pikachu - copia.webp', name: 'Pikachu' }
        ],
        'IMG/portfolio/DBZ': [
            { src: 'IMG/portfolio/DBZ/Black goku.webp', name: 'Black Goku' },
            { src: 'IMG/portfolio/DBZ/Dbz.webp', name: 'Janemba' },
            { src: 'IMG/portfolio/DBZ/Bills 2.webp', name: 'Bills' },
            { src: 'IMG/portfolio/DBZ/Cell medio.webp', name: 'Cell Medio' },
            { src: 'IMG/portfolio/DBZ/Db final.webp', name: 'DB Final' },
            { src: 'IMG/portfolio/DBZ/Majin bu gordo.webp', name: 'Majin Buu' },
            { src: 'IMG/portfolio/DBZ/Piccolo.webp', name: 'Piccolo' },
            { src: 'IMG/portfolio/DBZ/Cell.webp', name: 'Cell' },
            { src: 'IMG/portfolio/DBZ/Freezer normal - copia.webp', name: 'Freezer' },
            { src: 'IMG/portfolio/DBZ/Kid buu.webp', name: 'Kid Buu' }
        ],
        'IMG/portfolio/MYL': [
            { src: 'IMG/portfolio/MYL/fereydun 2.webp', name: 'Fereydun' },
            { src: 'IMG/portfolio/MYL/Dragon dorado 2 final - copia.webp', name: 'Dragón Dorado' },
            { src: 'IMG/portfolio/MYL/Greuceanu.webp', name: 'Greuceanu' },
            { src: 'IMG/portfolio/MYL/Kamensky cmyk.webp', name: 'Kamensky' },
            { src: 'IMG/portfolio/MYL/Parte_Trasera_Mesa_Redonda.webp', name: 'Mesa Redonda' },
            { src: 'IMG/portfolio/MYL/Capitan_Garfio.webp', name: 'Capitán Garfio' },
            { src: 'IMG/portfolio/MYL/Cthulhu.webp', name: 'Cthulhu' },
            { src: 'IMG/portfolio/MYL/Londres.webp', name: 'Londres' },
            { src: 'IMG/portfolio/MYL/Mac da tho 2.webp', name: 'Mac da Tho' },
            { src: 'IMG/portfolio/MYL/finn mac cool.webp', name: 'Finn Mac Cool' }
        ]
    };

    return images[path] || [];
}
 