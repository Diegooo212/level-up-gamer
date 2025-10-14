document.addEventListener("DOMContentLoaded", () => {
    // Primero, verificamos que sea un admin
    checkAuth('admin');

    // --- ESTRUCTURA DE DATOS PARA MARCAS POR CATEGORÍA ---
    const categoryBrands = {
        consola: ["Sony", "Microsoft", "Nintendo", "Valve"],
        accesorio: ["Logitech", "Razer", "HyperX", "Corsair", "SteelSeries"],
        'silla gamer': ["Cougar", "DXRacer", "AKRacing", "Corsair"],
        computador: ["ASUS", "MSI", "Gigabyte", "HP Omen", "Acer Predator"]
    };

    // --- VARIABLES GLOBALES Y DATOS INICIALES ---
    let products = JSON.parse(localStorage.getItem("products")) || [];

    // --- ELEMENTOS DEL DOM ---
    const views = document.querySelectorAll(".view");
    const navLinks = document.querySelectorAll(".nav-link");
    const productTableBody = document.querySelector("#product-table tbody");
    const productForm = document.getElementById("product-form");
    const showFormBtn = document.getElementById("show-add-product-form-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const categorySelect = document.getElementById("product-category");
    const brandSelect = document.getElementById("product-brand");

    // --- NAVEGACIÓN DEL PANEL ---
    function showView(viewId) {
        views.forEach(view => view.classList.remove("active"));
        navLinks.forEach(link => link.classList.remove("active"));
        document.getElementById(viewId).classList.add("active");
        document.querySelector(`.nav-link[data-view="${viewId}"]`).classList.add("active");
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            showView(link.getAttribute("data-view"));
        });
    });

    // --- LÓGICA DE MENÚS DESPLEGABLES DINÁMICOS ---
    categorySelect.addEventListener("change", () => {
        const selectedCategory = categorySelect.value;
        brandSelect.innerHTML = '<option value="">-- Selecciona una Marca --</option>'; // Limpiar y poner opción por defecto

        if (selectedCategory && categoryBrands[selectedCategory]) {
            const brands = categoryBrands[selectedCategory];
            brands.forEach(brand => {
                const option = document.createElement("option");
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            });
            brandSelect.disabled = false; // Habilitar el menú de marcas
        } else {
            brandSelect.disabled = true; // Deshabilitar si no hay categoría
        }
    });

    // --- LÓGICA DE GESTIÓN DE PRODUCTOS (CRUD) ---
    function renderProductTable() {
        productTableBody.innerHTML = "";
        if (products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="4">No hay productos. ¡Añade uno!</td></tr>';
            return;
        }
        products.forEach((product, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>$${parseFloat(product.price).toLocaleString()} ${product.onSale ? `<span style="color:#00ffea;">(Oferta)</span>` : ''}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="admin-btn action" onclick="editProduct(${index})">Editar</button>
                    <button class="admin-btn action danger" onclick="deleteProduct(${index})">Eliminar</button>
                </td>
            `;
            productTableBody.appendChild(tr);
        });
    }

    window.deleteProduct = (index) => {
        if (confirm(`¿Seguro que quieres eliminar "${products[index].name}"?`)) {
            products.splice(index, 1);
            localStorage.setItem("products", JSON.stringify(products));
            renderProductTable();
        }
    };

    window.editProduct = (index) => {
        const product = products[index];
        productForm.classList.remove("hidden");
        showFormBtn.classList.add("hidden");
        cancelEditBtn.classList.remove("hidden");

        // Llenar el formulario con los datos del producto
        document.getElementById("product-id").value = index;
        document.getElementById("product-name").value = product.name;
        document.getElementById("product-description").value = product.description || '';
        document.getElementById("product-price").value = product.price;
        document.getElementById("product-discount-price").value = product.discountPrice || 0;
        document.getElementById("product-on-sale").checked = product.onSale || false;
        document.getElementById("product-stock").value = product.stock;
        document.getElementById("product-img").value = product.img;
        
        // Seleccionar la categoría y llenar las marcas correspondientes
        categorySelect.value = product.category;
        categorySelect.dispatchEvent(new Event('change')); // Dispara el evento para llenar las marcas
        brandSelect.value = product.brand; // Selecciona la marca guardada
    };

    showFormBtn.addEventListener("click", () => {
        productForm.reset();
        document.getElementById("product-id").value = '';
        brandSelect.innerHTML = '<option value="">-- Primero elige una categoría --</option>';
        brandSelect.disabled = true;
        productForm.classList.remove("hidden");
        showFormBtn.classList.add("hidden");
        cancelEditBtn.classList.remove("hidden");
    });
    
    cancelEditBtn.addEventListener("click", () => {
        productForm.reset();
        productForm.classList.add("hidden");
        showFormBtn.classList.remove("hidden");
        cancelEditBtn.classList.add("hidden");
    });

    productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const productData = {
            id: new Date().getTime(),
            name: document.getElementById("product-name").value,
            description: document.getElementById("product-description").value,
            category: categorySelect.value,
            brand: brandSelect.value,
            price: parseFloat(document.getElementById("product-price").value),
            discountPrice: parseFloat(document.getElementById("product-discount-price").value),
            onSale: document.getElementById("product-on-sale").checked,
            stock: parseInt(document.getElementById("product-stock").value),
            img: document.getElementById("product-img").value,
        };

        const productId = document.getElementById("product-id").value;
        if (productId !== '') { // Es una edición
            products[parseInt(productId)] = productData;
        } else { // Es un producto nuevo
            products.push(productData);
        }

        localStorage.setItem("products", JSON.stringify(products));
        renderProductTable();
        cancelEditBtn.click(); // Simula clic en cancelar para limpiar y ocultar el form
    });
    
    // ... (El resto de tu lógica para Dashboard y Reportes va aquí) ...


    // --- INICIALIZACIÓN ---
    showView("dashboard-view"); // Muestra la primera vista por defecto
    renderProductTable(); // <<--- ESTA LÍNEA ES CLAVE: MUESTRA LOS PRODUCTOS EXISTENTES AL CARGAR LA PÁGINA
    // renderDashboard();
    // renderSalesTable(sales);
});