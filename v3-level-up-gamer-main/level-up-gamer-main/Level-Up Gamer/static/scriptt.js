/* =========================
   1. FUNCIONES PRINCIPALES Y DE AUTENTICACIÓN
   ========================= */

// Versión única y funcional de checkAuth
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Debes iniciar sesión para continuar");
        window.location.href = "login.html";
        return false;
    }
    if (requiredRole && user.role !== requiredRole) {
        alert("Acceso denegado");
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// Versión única de logout
function logout() {
    localStorage.removeItem("user");
    //localStorage.removeItem("carrito");
    alert("Sesión cerrada");
    window.location.href = "index.html";
}

// Añadir productos al carrito
function addToCart(product) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Debes iniciar sesión para comprar.");
        window.location.href = "login.html";
        return;
    }
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    // --- CAMBIO CLAVE: Buscamos por ID en lugar de por NOMBRE ---
    const existing = carrito.find(item => item.id === product.id);

    if (existing) {
        existing.cantidad += 1;
    } else {
        carrito.push({ ...product, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(product.name + " agregado al carrito ✅");
}


/* =========================
   2. RENDERIZADO DE COMPONENTES (MENÚ, USUARIO, CARRITO)
   ========================= */

// Renderiza el menú base
function renderMenu() {
    const menu = document.getElementById("mainMenu");
    if (!menu) return;
    menu.innerHTML = `
        <a href="index.html">Inicio</a>
        <a href="productos.html">Productos</a>
        <a href="eventos.html">Eventos</a>
        <a href="nosotros.html">Nosotros</a>
        <a href="contacto.html">Contacto</a>
    `;
}

// Muestra la info del usuario y añade links de perfil/admin al menú
function renderUser() {
    const userInfo = document.getElementById("userActions"); // Apunta al div correcto
    const menu = document.getElementById("mainMenu");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!userInfo || !menu) return;

    if (user) {
        userInfo.innerHTML = `
            <span>👤 ${user.email}</span>
            <button onclick="logout()">Cerrar Sesión</button>
        `;
        let userLinksHTML = `<a href="perfil.html">Mi Perfil</a>`;
        if (user.role === 'admin') {
            userLinksHTML += `<a href="admin.html" class="admin-link">⚙️ Admin</a>`;
        }
        // Evita duplicar los enlaces si la función se llama varias veces
        if (!menu.querySelector('a[href="perfil.html"]')) {
             menu.innerHTML += userLinksHTML;
        }
    } else {
        userInfo.innerHTML = `<a href="login.html">Iniciar Sesión</a>`;
    }
}

// Función ÚNICA Y CORRECTA para renderizar el carrito con descuento
function renderCarrito() {
    const carritoBody = document.getElementById("carrito");
    const subtotalElement = document.getElementById("subtotal-carrito");
    const lineaDescuentoElement = document.getElementById("linea-descuento");
    const montoDescuentoElement = document.getElementById("monto-descuento");
    const totalFinalElement = document.getElementById("total-final-carrito");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const user = JSON.parse(localStorage.getItem("user"));
    const esAlumnoDuoc = user && user.email.toLowerCase().endsWith('@duocuc.cl');

    if (carrito.length === 0) {
        carritoBody.innerHTML = `<tr><td colspan="6">Tu carrito está vacío</td></tr>`;
        subtotalElement.textContent = "$0";
        totalFinalElement.textContent = "$0";
        lineaDescuentoElement.style.display = "none";
        return;
    }

    carritoBody.innerHTML = "";
    let subtotal = 0;

    carrito.forEach((item, i) => {
        const itemSubtotal = item.price * item.cantidad;
        subtotal += itemSubtotal;
        carritoBody.innerHTML += `
            <tr>
                <td><img src="${item.img || 'https://via.placeholder.com/80'}" alt="${item.name}" class="carrito-img"> ${item.name}</td>
                <td>${item.brand}</td>
                <td>$${item.price.toLocaleString('es-CL')}</td>
                <td>
                    <button onclick="changeQuantity(${i}, -1)">➖</button>
                    ${item.cantidad}
                    <button onclick="changeQuantity(${i}, 1)">➕</button>
                </td>
                <td>$${itemSubtotal.toLocaleString('es-CL')}</td>
                <td><button class="btn-eliminar" onclick="removeFromCart(${i})">❌</button></td>
            </tr>
        `;
    });

    let descuento = 0;
    if (esAlumnoDuoc) {
        descuento = subtotal * 0.15;
        lineaDescuentoElement.style.display = "block";
    } else {
        lineaDescuentoElement.style.display = "none";
    }
    const totalFinal = subtotal - descuento;

    subtotalElement.textContent = `$${subtotal.toLocaleString('es-CL')}`;
    montoDescuentoElement.textContent = `-$${Math.round(descuento).toLocaleString('es-CL')}`;
    totalFinalElement.textContent = `$${Math.round(totalFinal).toLocaleString('es-CL')}`;
}

// Funciones auxiliares para el carrito
function changeQuantity(i, delta) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito[i].cantidad += delta;
    if (carrito[i].cantidad <= 0) carrito.splice(i, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
}

function removeFromCart(i) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(i, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
}

// Función para procesar la compra
function procesarCompra() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Debes iniciar sesión para finalizar la compra.");
        return;
    }
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    const esAlumnoDuoc = user.email.toLowerCase().endsWith('@duocuc.cl');
    const subtotal = carrito.reduce((sum, item) => sum + item.price * item.cantidad, 0);
    let descuento = 0;
    if (esAlumnoDuoc) {
        descuento = subtotal * 0.15;
    }
    const totalFinal = subtotal - descuento;
    const historialKey = `historial_${user.email}`;
    const historial = JSON.parse(localStorage.getItem(historialKey)) || [];
    const nuevaCompra = {
        fecha: new Date().toLocaleDateString("es-CL"),
        productos: carrito,
        subtotal: subtotal,
        descuento: Math.round(descuento),
        total: Math.round(totalFinal)
    };
    historial.push(nuevaCompra);
    localStorage.setItem(historialKey, JSON.stringify(historial));
    localStorage.removeItem("carrito");
    alert("¡Compra realizada con éxito! Se ha aplicado tu descuento de Duoc UC. Gracias por elegir Level-Up Gamer.");
    window.location.href = "perfil.html";
}


/* =======================================================
   3. EJECUCIÓN PRINCIPAL Y LÓGICA DE PÁGINAS
   ======================================================= */
document.addEventListener("DOMContentLoaded", () => {
    // --- Lógica que se ejecuta en TODAS las páginas ---
    renderMenu();
    renderUser();

    // --- Lógica para la página del CARRITO ---
    if (document.getElementById("carrito")) {
        checkAuth(); // Protege la página del carrito
        renderCarrito();
    }

    // --- Lógica para la página de PERFIL ---
    if (document.querySelector(".perfil-container")) {
        checkAuth();
        const user = JSON.parse(localStorage.getItem("user"));
        const datosUsuarioDiv = document.getElementById("datosUsuario");
        datosUsuarioDiv.innerHTML = `<p><strong>Email:</strong> ${user.email}</p><p><strong>Rol:</strong> ${user.role}</p>`;
        const historialDiv = document.getElementById("historialCompras");
        const historialKey = `historial_${user.email}`;
        const historial = JSON.parse(localStorage.getItem(historialKey)) || [];
        if (historial.length > 0) {
            historialDiv.innerHTML = "";
            historial.forEach(compra => {
                const compraHTML = `
                    <div class="compra-item">
                        <h4>Compra del ${compra.fecha} - Total: $${compra.total.toLocaleString()}</h4>
                        <ul>${compra.productos.map(p => `<li>${p.name} (x${p.cantidad})</li>`).join('')}</ul>
                    </div>`;
                historialDiv.innerHTML += compraHTML;
            });
        }
    }

    // --- Lógica para el LOGIN ---
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const pass = document.getElementById("password").value;
            if (email === "admin@levelup.cl" && pass === "admin123") {
                localStorage.setItem("user", JSON.stringify({ role: "admin", email }));
                window.location.href = "admin.html";
            } else {
                localStorage.setItem("user", JSON.stringify({ role: "user", email }));
                window.location.href = "index.html";
            }
        });
    }

    // --- Lógica para el REGISTRO ---
    if (document.getElementById("registerForm")) {
        document.getElementById("registerForm").addEventListener("submit", function(e) {
            e.preventDefault();
            const email = document.getElementById("email").value;
            alert("Usuario " + email + " registrado correctamente.");
            window.location.href = "login.html";
        });
    }

    // --- Lógica para el PANEL DE ADMIN ---
    if (document.getElementById("addProductForm")) {
        checkAuth("admin");
        // (La lógica de admin se autoejecuta dentro de su propio bloque `if` en tu código original, se mantiene igual)
    }

    // --- Lógica para el MAPA DE EVENTOS ---
    if (document.getElementById("map")) {
        const map = L.map('map').setView([-36.77, -72.75], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        const eventos = [
            {

          nombre: "Feria de Videojuegos Indie",
          lugar: "Suractivo, Concepción",
          fecha: "5 de Noviembre, 2025",
          coords: [-36.7978, -73.0632]

          },

          {

          nombre: "🏆 Torneo de League of Legends: Copa Level-Up",
          lugar: "Auditorio, Facultad de Ingeniería, UdeC",
          fecha: "Sábado 8 de Noviembre, 2025",
          coords: [-36.8324, -73.0300]

          },
          {

          nombre: "🎮 Pop-Up Store: Novedades y Ofertas Exclusivas",
          lugar: "Sector Central, Mallplaza Trébol, Talcahuano",
          fecha: "25 y 26 de Octubre, 2025",
          coords: [-36.8093, -73.0654]

          },

          {

          nombre: "🛠️ Taller: Arma tu Primer PC Gamer",
          lugar: "Level-Up Gamer Store, Concepción Centro",
          fecha: "Sábado 15 de Noviembre, 2025",
          coords: [-36.8269, -73.0502]

          },

          {
          nombre: "🚀 Level-Up Llega a Chillán: Venta Especial",
          lugar: "Patio de Comidas, Mall Arauco Chillán",
          fecha: "Sábado 22 de Noviembre, 2025",
          coords: [-36.6074, -72.1023]
          },
          {
          nombre: "🤝 Junta Gamer y Noche de Demos",
          lugar: "Centro de Eventos Costa-Río, San Pedro de la Paz",
          fecha: "Viernes 24 de Octubre, 2025",
          coords: [-36.8400, -73.0981]
          }

        ];
        eventos.forEach(evento => {
            const marker = L.marker(evento.coords).addTo(map);
            marker.bindPopup(`<h3>${evento.nombre}</h3><p><strong>Lugar:</strong> ${evento.lugar}</p><p><strong>Fecha:</strong> ${evento.fecha}</p>`);
        });
    }

    // --- Lógica para FILTROS Y BÚSQUEDA de productos ---
    const searchInput = document.getElementById("buscar");
    if (searchInput) { // Si existe el buscador, asumimos que estamos en una página de productos con filtros
        const minInput = document.getElementById("precioMin");
        const maxInput = document.getElementById("precioMax");
        const applyBtn = document.getElementById("aplicarFiltros");
        const clearBtn = document.getElementById("limpiarFiltros");
        const brandCheckboxes = Array.from(document.querySelectorAll(".marca"));
        const cards = Array.from(document.querySelectorAll(".card"));
        if (!cards.length) return;

        function getCardPrice(card) {
            const dataPrice = card.dataset.precio;
            if (dataPrice) return parseInt(dataPrice, 10);
            const pTags = card.querySelectorAll("p");
            for (const p of pTags) {
                const n = parseInt(String(p.textContent).replace(/[^\d]/g, ""), 10);
                if (!isNaN(n)) return n;
            }
            return 0;
        }

        function applyFilters() {
            const q = (searchInput.value || "").trim().toLowerCase();
            const minVal = parseInt(minInput.value || "0") || 0;
            const maxVal = parseInt(maxInput.value || "Infinity") || Infinity;
            const selectedBrands = brandCheckboxes.filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
            cards.forEach(card => {
                const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
                const brand = (card.dataset.marca || "").toLowerCase();
                const price = getCardPrice(card);
                let visible = true;
                if (q && !(name.includes(q) || brand.includes(q))) visible = false;
                if (price < minVal || price > maxVal) visible = false;
                if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) visible = false;
                card.style.display = visible ? "" : "none";
            });
        }
        applyBtn?.addEventListener("click", applyFilters);
        clearBtn?.addEventListener("click", () => {
            searchInput.value = "";
            minInput.value = "";
            maxInput.value = "";
            brandCheckboxes.forEach(cb => cb.checked = false);
            cards.forEach(c => c.style.display = "");
        });
        searchInput?.addEventListener("input", applyFilters);
    }
    
    // --- Lógica para EFECTO 3D en tarjetas de categoría ---
    const categoriaCards = document.querySelectorAll('.categoria-card');
    if (categoriaCards.length > 0) {
        categoriaCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                card.style.transform = `scale(1.05) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1) perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }
});