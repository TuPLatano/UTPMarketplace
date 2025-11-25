/* Formatear moneda */
function formatPrice(v) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN"
  }).format(v);
}

/* Escapar HTML para seguridad */
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* Obtener productos desde backend */
async function fetchProductos() {
  try {
    const res = await fetch("http://localhost:8080/api/productos"); // ajusta la URL si tu backend tiene otro puerto
    if (!res.ok) throw new Error("Error al obtener productos");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* Render catálogo */
async function renderCatalogo(containerId = "lista-productos") {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  cont.innerHTML = "";

  const productos = await fetchProductos();

  if (!productos.length) {
    cont.innerHTML = `<div class="alert alert-warning">No hay productos disponibles.</div>`;
    return;
  }

  productos.forEach(producto => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4 mb-4";

    col.innerHTML = `
      <div class="card producto-card h-100 shadow-sm">
        <img src="${producto.img}" class="card-img-top producto-img" alt="${escapeHtml(producto.title)}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(producto.title)}</h5>
          <p class="card-text text-truncate">${escapeHtml(producto.description)}</p>
          <div class="mt-auto d-flex justify-content-between">
            <small class="text-muted">${escapeHtml(producto.category)}</small>
            <strong>${formatPrice(producto.price)}</strong>
          </div>
          <div class="mt-3 d-flex gap-2">
            <a href="detalle.html?id=${producto.id}" class="btn btn-outline-primary btn-sm flex-grow-1">Ver</a>
            <button class="btn btn-primary btn-sm" onclick="agregarAlCarrito('${producto.id}', '${escapeHtml(producto.title)}', ${producto.price}, '${producto.img}', '${escapeHtml(producto.category)}')">Añadir</button>
          </div>
        </div>
      </div>
    `;

    cont.appendChild(col);
  });
}

/* Render detalle */
async function renderDetalle(containerId = "detalle-producto") {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const productos = await fetchProductos();
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    cont.innerHTML = `<div class="alert alert-warning">Producto no encontrado.</div>`;
    return;
  }

  cont.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <img src="${producto.img}" class="card-img" alt="${escapeHtml(producto.title)}">
        </div>
      </div>
      <div class="col-md-6">
        <h2>${escapeHtml(producto.title)}</h2>
        <p class="text-muted">${escapeHtml(producto.category)}</p>
        <h3 class="my-3">${formatPrice(producto.price)}</h3>
        <p>${escapeHtml(producto.description)}</p>

        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-lg btn-primary" onclick="agregarAlCarrito('${producto.id}', '${escapeHtml(producto.title)}', ${producto.price}, '${producto.img}', '${escapeHtml(producto.category)}')">Agregar al carrito</button>
          <a href="catalogo.html" class="btn btn-outline-secondary btn-lg">Volver al catálogo</a>
        </div>
      </div>
    </div>
  `;
}

/* Función para agregar al carrito desde la API */
function agregarAlCarrito(id, titulo, precio, img, categoria) {
  const producto = { id, titulo, precio, img, categoria, cantidad: 1 };
  if (typeof agregarProductoAlCarrito === "function") {
    agregarProductoAlCarrito(producto);
  }
  mostrarToast(`${titulo} agregado al carrito.`);
  if (document.getElementById("carrito-container")) renderCarrito();
}

/* Toast visual simple */
function mostrarToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast-feedback";
  toast.textContent = text;

  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 100);
  setTimeout(() => toast.classList.remove("visible"), 2400);
  setTimeout(() => toast.remove(), 3000);
}

/* Auto carga */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("lista-productos")) renderCatalogo();
  if (document.getElementById("detalle-producto")) renderDetalle();
});
