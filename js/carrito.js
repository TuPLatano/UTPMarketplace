// carrito.js
// Gestión de carrito usando localStorage (clave: utp_carrito)

/* Recupera carrito desde localStorage */
function obtenerCarrito() {
  try {
    const raw = localStorage.getItem("utp_carrito");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error parseando carrito:", e);
    return [];
  }
}

/* Guarda carrito en localStorage */
function guardarCarrito(carrito) {
  localStorage.setItem("utp_carrito", JSON.stringify(carrito));
}

/* Añadir producto (obj completo con id, titulo, precio, img...) */
function agregarProductoAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(item => item.id === producto.id);
  if (existente) {
    existente.cantidad = (existente.cantidad || 1) + 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  guardarCarrito(carrito);
}

/* Eliminar un producto (por id) */
function eliminarProductoDelCarrito(productId) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(item => item.id !== productId);
  guardarCarrito(carrito);
  if (typeof renderCarrito === "function") renderCarrito();
}

/* Actualizar cantidad */
function actualizarCantidad(productId, nuevaCantidad) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.id === productId);
  if (!item) return;
  item.cantidad = Math.max(1, Number(nuevaCantidad) || 1);
  guardarCarrito(carrito);
  if (typeof renderCarrito === "function") renderCarrito();
}

/* Vaciar carrito */
function vaciarCarrito() {
  if (!confirm("¿Deseas vaciar el carrito?")) return;
  localStorage.removeItem("utp_carrito");
  if (typeof renderCarrito === "function") renderCarrito();
}

/* Calcular total */
function calcularTotal(carrito) {
  return carrito.reduce((s, it) => s + (it.precio || 0) * (it.cantidad || 1), 0);
}

/* Renderizar carrito en la página (contenedor con id carrito-container) */
function renderCarrito(containerId = "carrito-container") {
  const cont = document.getElementById(containerId);
  if (!cont) return;
  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    cont.innerHTML = `<div class="alert alert-info">Tu carrito está vacío.</div>`;
    return;
  }

  const rows = carrito.map(item => `
    <div class="card mb-3">
      <div class="row g-0 align-items-center">
        <div class="col-3 col-sm-2">
          <img src="${item.img || 'img/placeholder.png'}" class="img-fluid rounded-start" alt="${escapeHtml(item.titulo)}">
        </div>
        <div class="col-5">
          <div class="card-body py-2">
            <h6 class="card-title mb-1">${escapeHtml(item.titulo)}</h6>
            <p class="card-text small text-muted mb-1">${escapeHtml(item.categoria || '')}</p>
            <p class="card-text"><strong>${new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(item.precio)}</strong></p>
          </div>
        </div>
        <div class="col-4">
          <div class="d-flex align-items-center justify-content-end gap-2 pe-3">
            <input type="number" min="1" value="${item.cantidad || 1}" class="form-control form-control-sm cantidad-input" style="width:70px"
              onchange="actualizarCantidad(${item.id}, this.value)">
            <button class="btn btn-sm btn-danger" onclick="eliminarProductoDelCarrito(${item.id})">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  const total = calcularTotal(carrito);

  cont.innerHTML = `${rows}
    <div class="mt-3 d-flex justify-content-between align-items-center">
      <strong>Total: ${new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(total)}</strong>
      <div>
        <button class="btn btn-vaciar me-2" onclick="vaciarCarrito()">Vaciar</button>
        <button class="btn btn-comprar" onclick="simularCompra()">Simular compra</button>
      </div>
    </div>
  `;
}

/* Simular compra: sólo vacía carrito y muestra mensaje */
function simularCompra() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  // Aquí podrías validar formulario de contacto o enviar a backend
  alert("Compra simulada correctamente. (No hay pago real en esta demo)");
  localStorage.removeItem("utp_carrito");
  if (typeof renderCarrito === "function") renderCarrito();
}

/* Al cargar la página intentar renderizar el carrito si existe un contenedor */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("carrito-container")) renderCarrito();
});
