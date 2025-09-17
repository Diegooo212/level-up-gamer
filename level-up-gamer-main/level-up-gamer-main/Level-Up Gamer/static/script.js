/* =========================
   VERIFICAR SESIÓN
   ========================= */
function checkAuth(requiredRole = null) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    // Si no está logueado, lo mando al login
    alert("Debes iniciar sesión primero");
    window.location.href = "login.html";
    return;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Si intenta entrar a admin.html sin ser admin
    alert("No tienes permiso para acceder aquí");
    window.location.href = "index.html";
  }
}

/* =========================
   Autenticación y Sesiones
   ========================= */
function checkAuth(requiredRole = null){
  const user = JSON.parse(localStorage.getItem("user"));

  if(!user){
    alert("Debes iniciar sesión para continuar");
    window.location.href = "login.html";
    return false;
  }

  if(requiredRole && user.role !== requiredRole){
    alert("Acceso denegado");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

/* =========================
   LOGIN
   ========================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    if (email === "admin@levelup.cl" && pass === "admin123") {
      localStorage.setItem("user", JSON.stringify({ role: "admin", email }));
      alert("Bienvenido administrador");
      window.location.href = "admin.html";
    } else {
      localStorage.setItem("user", JSON.stringify({ role: "user", email }));
      alert("Inicio de sesión exitoso");
      window.location.href = "index.html";
    }
  });
}


/* =========================
   Registro
   ========================= */
if(document.getElementById("registerForm")){
  document.getElementById("registerForm").addEventListener("submit", function(e){
    e.preventDefault();
    const email = document.getElementById("email").value;
    alert("Usuario " + email + " registrado correctamente.");
    window.location.href = "login.html";
  });
}

/* =========================
   Panel de Admin
   ========================= */
if(document.getElementById("addProductForm")){
  checkAuth("admin");

  const productList = document.getElementById("productList");
  const products = JSON.parse(localStorage.getItem("products")) || [];

  function renderProducts(){
    productList.innerHTML = "";
    products.forEach((p, i)=>{
      productList.innerHTML += `<li>${p.name} - ${p.brand} - $${p.price} - Stock: ${p.stock}
        <button onclick="deleteProduct(${i})">Eliminar</button></li>`;
    });
  }

  document.getElementById("addProductForm").addEventListener("submit", function(e){
    e.preventDefault();
    const name = document.getElementById("name").value;
    const brand = document.getElementById("brand").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;

    products.push({name, brand, price, stock});
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
  });

  window.deleteProduct = function(i){
    products.splice(i, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
  }

  renderProducts();
}

/* =========================
   Carrito de compras
   ========================= */
if(document.getElementById("carrito")){
  checkAuth("user");

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const carritoContainer = document.getElementById("carrito");

  function renderCarrito(){
    carritoContainer.innerHTML = "";
    if(carrito.length === 0){
      carritoContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
      return;
    }
    carrito.forEach((item, i)=>{
      carritoContainer.innerHTML += `<div>
        ${item.name} - $${item.price} (x${item.cantidad})
        <button onclick="removeFromCart(${i})">❌</button>
      </div>`;
    });
  }

  window.removeFromCart = function(i){
    carrito.splice(i, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
  }

  renderCarrito();
}

/* =========================
   Agregar al carrito desde productos
   ========================= */
  

function addToCart(product){
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){
    alert("Debes iniciar sesión para comprar.");
    window.location.href = "login.html";
    return;
  }

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const existing = carrito.find(item => item.name === product.name);
  if(existing){
    existing.cantidad += 1;
  } else {
    carrito.push({...product, cantidad: 1});
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert(product.name + " agregado al carrito ✅");
}
  

/* =========================
   Header: Sesión del Usuario
   ========================= */
document.addEventListener("DOMContentLoaded", ()=>{
  const user = JSON.parse(localStorage.getItem("user"));
  const userActions = document.getElementById("userActions");
  
  if(user){
    userActions.innerHTML = `
      <span>👤 ${user.email}</span>
      <button onclick="logout()">Cerrar Sesión</button>
    `;
  } else {
    userActions.innerHTML = `<a href="login.html">Iniciar Sesión</a>`;
  }
});

function logout(){
  localStorage.removeItem("user");
  alert("Sesión cerrada");
  window.location.href = "index.html";
}
/* =========================
   Carrito con edición
   ========================= */
if (document.getElementById("carrito")) {
  const carritoBody = document.getElementById("carrito");
  const totalElement = document.getElementById("total");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  function renderCarrito() {
    carritoBody.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
      carritoBody.innerHTML = `<tr><td colspan="6">Tu carrito está vacío</td></tr>`;
      totalElement.textContent = "0";
      return;
    }

    carrito.forEach((item, i) => {
      const subtotal = item.price * item.cantidad;
      total += subtotal;

      carritoBody.innerHTML += `
        <tr>
          <td>
            <img src="${item.img || 'https://via.placeholder.com/80'}" 
                 alt="${item.name}" class="carrito-img">
            ${item.name}
          </td>
          <td>${item.brand}</td>
          <td>$${item.price.toLocaleString()}</td>
          <td>
            <button onclick="changeQuantity(${i}, -1)">➖</button>
            ${item.cantidad}
            <button onclick="changeQuantity(${i}, 1)">➕</button>
          </td>
          <td>$${subtotal.toLocaleString()}</td>
          <td>
            <button class="btn-eliminar" onclick="removeFromCart(${i})">❌</button>
          </td>
        </tr>
      `;
    });

    totalElement.textContent = total.toLocaleString();
  }

  window.removeFromCart = function (i) {
    carrito.splice(i, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
  };

  window.changeQuantity = function (i, delta) {
    carrito[i].cantidad += delta;
    if (carrito[i].cantidad <= 0) carrito.splice(i, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
  };

  renderCarrito();
}
/* =========================
   Panel de Admin
   ========================= */
if (document.getElementById("addProductForm")) {
  checkAuth("admin"); // solo admins pueden entrar

  const productList = document.getElementById("productList");
  const featuredList = document.getElementById("featuredList");

  let products = JSON.parse(localStorage.getItem("products")) || [];
  let featured = JSON.parse(localStorage.getItem("featured")) || [];

  function renderProducts() {
    productList.innerHTML = "";
    products.forEach((p, i) => {
      productList.innerHTML += `
        <li>
          ${p.name} - ${p.brand} - $${p.price} - Stock: ${p.stock}
          <button onclick="deleteProduct(${i})">❌</button>
        </li>`;
    });
  }

  function renderFeatured() {
    featuredList.innerHTML = "";
    featured.forEach((f, i) => {
      featuredList.innerHTML += `
        <li>${f}
          <button onclick="deleteFeatured(${i})">❌</button>
        </li>`;
    });
  }

  document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const brand = document.getElementById("brand").value;
    const price = parseInt(document.getElementById("price").value);
    const stock = parseInt(document.getElementById("stock").value);
    const img = document.getElementById("img").value || "https://via.placeholder.com/200";

    products.push({ name, brand, price, stock, img });
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    e.target.reset();
  });

  document.getElementById("addFeaturedForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("featuredName").value;
    featured.push(name);
    localStorage.setItem("featured", JSON.stringify(featured));
    renderFeatured();
    e.target.reset();
  });

  window.deleteProduct = function (i) {
    products.splice(i, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
  };

  window.deleteFeatured = function (i) {
    featured.splice(i, 1);
    localStorage.setItem("featured", JSON.stringify(featured));
    renderFeatured();
  };

  renderProducts();
  renderFeatured();
}
/* =========================
   MENÚ DINÁMICO
   ========================= */
function renderMenu() {
  const menu = document.getElementById("mainMenu");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!menu) return;

  // Menú base
  let html = `
    <a href="index.html">Inicio</a>
    <a href="productos.html">Productos</a>
    <a href="carrito.html">Carrito</a>
    <a href="nosotros.html">Nosotros</a>
    <a href="contacto.html">Contacto</a>
  `;

  // Si es admin, agregamos acceso al panel
  if (user && user.role === "admin") {
    html += `<a href="admin.html" class="admin-link">⚙️ Admin</a>`;
  }

  menu.innerHTML = html;
}

/* =========================
   MOSTRAR USUARIO EN HEADER
   ========================= */
function renderUser() {
  const userInfo = document.getElementById("userInfo");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!userInfo) return;

  if (user) {
    userInfo.innerHTML = `
      <span>👤 ${user.email} (${user.role})</span>
      <button onclick="logout()">Cerrar sesión</button>
    `;
  } else {
    userInfo.innerHTML = `<a href="login.html">Iniciar sesión</a>`;
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// Ejecutar al cargar
renderMenu();
renderUser();

// =========================
// FILTROS Y BUSQUEDA
// =========================
// =========================
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("buscar");
  const minInput = document.getElementById("precioMin");
  const maxInput = document.getElementById("precioMax");
  const applyBtn = document.getElementById("aplicarFiltros");
  const clearBtn = document.getElementById("limpiarFiltros");
  const brandCheckboxes = Array.from(document.querySelectorAll(".marca"));
  const cards = Array.from(document.querySelectorAll(".card")); // tus tarjetas usan clase "card"

  if (!cards.length) return; // si no hay productos salimos

  // extrae solo dígitos y devuelve número (o NaN)
  function parseNumberFromString(s) {
    if (!s) return NaN;
    const digits = String(s).replace(/[^\d]/g, "");
    return digits ? parseInt(digits, 10) : NaN;
  }

  // obtiene el precio desde data-precio o buscando en el texto del card
  function getCardPrice(card) {
    const dataPrice = card.dataset.precio;
    if (dataPrice) {
      const n = parseInt(dataPrice, 10);
      if (!isNaN(n)) return n;
    }
    // fallback: buscar el primer número en cualquier <p> dentro de la tarjeta
    const pTags = card.querySelectorAll("p");
    for (const p of pTags) {
      const n = parseNumberFromString(p.textContent);
      if (!isNaN(n)) return n;
    }
    return 0;
  }

  function applyFilters() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const minVal = (() => {
      const v = parseInt(minInput?.value || "");
      return isNaN(v) ? 0 : v;
    })();
    const maxVal = (() => {
      const v = parseInt(maxInput?.value || "");
      return isNaN(v) ? Infinity : v;
    })();

    const selectedBrands = brandCheckboxes.filter(cb => cb.checked).map(cb => cb.value.toLowerCase());

    cards.forEach(card => {
      const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
      // Preferir data-marca; si no existe, buscar en el texto de <p>
      const brand = ((card.dataset.marca) ? card.dataset.marca : (card.querySelector("p")?.textContent || "")).toLowerCase();
      const price = getCardPrice(card);

      let visible = true;

      // Si hay texto de búsqueda, buscar en nombre o marca
      if (q) {
        if (!(name.includes(q) || brand.includes(q))) visible = false;
      }

      // Precio
      if (price < minVal || price > maxVal) visible = false;

      // Marcas seleccionadas (si hay alguna seleccionada)
      if (selectedBrands.length > 0) {
        // comparar con brand extraída (lowercase)
        if (!selectedBrands.includes(brand)) visible = false;
      }

      card.style.display = visible ? "" : "none";
    });
  }

  // listeners
  applyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    applyFilters();
  });

  clearBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (searchInput) searchInput.value = "";
    if (minInput) minInput.value = "";
    if (maxInput) maxInput.value = "";
    brandCheckboxes.forEach(cb => cb.checked = false);
    cards.forEach(c => c.style.display = "");
  });

  // filtrado en tiempo real mientras escribes (opcional, útil UX)
  searchInput?.addEventListener("input", () => {
    applyFilters();
  });
});






