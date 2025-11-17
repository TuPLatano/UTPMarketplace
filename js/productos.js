// productos.js
// Datos de ejemplo (puedes mover esto a un JSON externo si quieres)
const productosDB = [
  {
    id: 1,
    titulo: "Libro: Fundamentos de Programación",
    descripcion: "Libro de texto usado. Buen estado. 350 páginas.",
    precio: 40.00,
    categoria: "Libros",
    img: "img/libro1.png"
  },
  {
    id: 2,
    titulo: "Calculadora Científica",
    descripcion: "Calculadora científica para ingeniería. Nueva.",
    precio: 25.50,
    categoria: "Accesorios",
    img: "img/calc1.png"
  },
  {
    id: 3,
    titulo: "Proyecto: Robot seguidor",
    descripcion: "Proyecto completo con documentación y código. Ideal para laboratorio.",
    precio: 60.00,
    categoria: "Proyectos",
    img: "img/robot1.png"
  },
  {
    id: 4,
    titulo: "Servicio: Tutorías de Matemáticas",
    descripcion: "Clases particulares presenciales o virtuales (por hora).",
    precio: 15.00,
    categoria: "Servicios",
    img: "img/tutor1.png"
  }
];

// Helper: formatea moneda
function formatPrice(val) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
}

/* ---------- Catalogo: renderizado de lista ---------- */
function renderCatalogo(containerId = "lista-productos") {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  cont.innerHTML = ""; // limpiar

  productosDB.forEach(producto => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4 mb-4";

    col.innerHTML = `
      <div class="card producto-card h-100 shadow-sm">
        <img src="${producto.img}" class="card-img-top producto-img" alt="${escapeHtml(producto.titulo)}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(producto.titulo)}</h5>
          <p class="card-text text-truncate">${escapeHtml(producto.descripcion)}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <small class="text-muted">${escapeHtml(producto.categoria)}</small>
            <strong>${formatPrice(producto.precio)}</strong>
          </div>
          <div class="mt-3 d-flex gap-2">
            <a href="detalle.html?id=${producto.id}" class="btn btn-outline-primary btn-sm flex-grow-1">Ver</a>
            <button class="btn btn-primary btn-sm" onclick="agregarAlCarrito(${producto.id})">Añadir</button>
          </div>
        </div>
      </div>
    `;

    cont.appendChild(col);
  });
}

/* ---------- Detalle: renderiza producto por id en query string ---------- */
function renderDetalle(containerId = "detalle-producto") {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const producto = productosDB.find(p => p.id === id);

  if (!producto) {
    cont.innerHTML = `<div class="alert alert-warning">Producto no encontrado.</div>`;
    return;
  }

  cont.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <img src="${producto.img}" class="card-img" alt="${escapeHtml(producto.titulo)}">
        </div>
      </div>
      <div class="col-md-6">
        <h2>${escapeHtml(producto.titulo)}</h2>
        <p class="text-muted">${escapeHtml(producto.categoria)}</p>
        <h3 class="my-3">${formatPrice(producto.precio)}</h3>
        <p>${escapeHtml(producto.descripcion)}</p>

        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-lg btn-primary" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
          <a href="catalogo.html" class="btn btn-outline-secondary btn-lg">Volver al catálogo</a>
        </div>
      </div>
    </div>
  `;
}

/* ---------- Seguridad mínima: escape HTML ---------- */
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

/* ---------- Carrito: interfaz mínima para añadir desde catálogo/detalle ---------- */
function agregarAlCarrito(productId) {
  // Buscar producto
  const producto = productosDB.find(p => p.id === productId);
  if (!producto) {
    alert("Producto no encontrado.");
    return;
  }

  // Delegar en carrito.js (función global)
  if (typeof agregarProductoAlCarrito === "function") {
    agregarProductoAlCarrito(producto);
    // Opcional: mostrar feedback
    mostrarToast(`${producto.titulo} agregado al carrito.`);
  } else {
    // fallback si carrito.js no cargó
    let carrito = JSON.parse(localStorage.getItem("utp_carrito") || "[]");
    const existente = carrito.find(i => i.id === productId);
    if (existente) existente.cantidad += 1;
    else carrito.push({ ...producto, cantidad: 1 });
    localStorage.setItem("utp_carrito", JSON.stringify(carrito));
    mostrarToast(`${producto.titulo} agregado al carrito.`);
  }

  // Si existe un contenedor de carrito en la página, refrescarlo
  if (document.getElementById("carrito-container")) {
    if (typeof renderCarrito === "function") renderCarrito();
  }
}

/* ---------- Toast simple (feedback) ---------- */
function mostrarToast(text) {
  // crea un toast simple flotante
  const toast = document.createElement("div");
  toast.className = "toast-feedback";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 100);
  setTimeout(() => toast.classList.remove("visible"), 2400);
  setTimeout(() => toast.remove(), 3000);
}

/* ---------- Auto-inicialización cuando se cargan las páginas ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // Si existe contenedor de catálogo
  if (document.getElementById("lista-productos")) renderCatalogo();

  // Si existe contenedor de detalle
  if (document.getElementById("detalle-producto")) renderDetalle();
});
