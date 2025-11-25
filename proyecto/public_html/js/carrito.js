// -----------------------------
// carrito.js con Supabase (sin usuarios)
// -----------------------------

const supabaseUrl = 'jdbc:postgresql://db.vmhpyrmteouykzqnrveg.supabase.co:5432/postgres?sslmode=require';
const supabaseKey = 'Contraseña';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ID del cart temporal
let tempCartId = null;

// Obtener o crear cart temporal
async function getCartId() {
  if (tempCartId) return tempCartId;

  // Revisar si hay un cart ya creado (el más reciente)
  let { data: carts, error } = await supabase
    .from('carts')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error al obtener cart:', error);
    return null;
  }

  if (!carts || carts.length === 0) {
    // Crear cart temporal
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert([{}])
      .select();
    if (createError) {
      console.error('Error creando cart temporal:', createError);
      return null;
    }
    tempCartId = newCart[0].id;
  } else {
    tempCartId = carts[0].id;
  }

  return tempCartId;
}

// Obtener items del carrito
async function obtenerCarritoBD() {
  const cartId = await getCartId();
  if (!cartId) return [];

  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`id, quantity, price_at_time, products(title, price, img, category)`)
    .eq('cart_id', cartId);

  if (error) {
    console.error('Error obteniendo cart_items:', error);
    return [];
  }

  return items.map(i => ({
    id: i.id,
    title: i.products.title,
    price: Number(i.products.price),
    category: i.products.category,
    img: i.products.img,
    cantidad: i.quantity
  }));
}

// Agregar producto al carrito
async function agregarProductoAlCarritoBD(producto) {
  const cartId = await getCartId();
  if (!cartId) return;

  // Revisar si ya existe
  const { data: existingItems } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', producto.id)
    .limit(1);

  if (existingItems && existingItems.length > 0) {
    await supabase
      .from('cart_items')
      .update({ quantity: existingItems[0].quantity + 1 })
      .eq('id', existingItems[0].id);
  } else {
    await supabase
      .from('cart_items')
      .insert([{
        cart_id: cartId,
        product_id: producto.id,
        quantity: 1,
        price_at_time: producto.price
      }]);
  }

  renderCarrito();
}

// Eliminar producto
async function eliminarProductoDelCarritoBD(itemId) {
  const cartId = await getCartId();
  if (!cartId) return;

  await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  renderCarrito();
}

// Actualizar cantidad
async function actualizarCantidadBD(itemId, nuevaCantidad) {
  if (nuevaCantidad < 1) return;
  const cartId = await getCartId();
  if (!cartId) return;

  await supabase
    .from('cart_items')
    .update({ quantity: Number(nuevaCantidad) })
    .eq('id', itemId);

  renderCarrito();
}

// Vaciar carrito
async function vaciarCarritoBD() {
  const cartId = await getCartId();
  if (!cartId) return;

  await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);

  renderCarrito();
}

// Calcular total
function calcularTotal(carrito) {
  return carrito.reduce((s, it) => s + (it.price || 0) * (it.cantidad || 0), 0);
}

// Renderizar carrito
async function renderCarrito(containerId = "carrito-container") {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  const carrito = await obtenerCarritoBD();
  if (carrito.length === 0) {
    cont.innerHTML = `<div class="alert alert-info">Tu carrito está vacío.</div>`;
    return;
  }

  const rows = carrito.map(item => `
    <div class="card mb-3">
      <div class="row g-0 align-items-center">
        <div class="col-3 col-sm-2">
          <img src="${item.img}" class="img-fluid rounded-start" alt="${escapeHtml(item.title)}">
        </div>
        <div class="col-5">
          <div class="card-body py-2">
            <h6 class="card-title mb-1">${escapeHtml(item.title)}</h6>
            <p class="card-text small text-muted mb-1">${escapeHtml(item.category || '')}</p>
            <p class="card-text"><strong>${new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(item.price)}</strong></p>
          </div>
        </div>
        <div class="col-4">
          <div class="d-flex align-items-center justify-content-end gap-2 pe-3">
            <input type="number" min="1" value="${item.cantidad}" class="form-control form-control-sm cantidad-input" style="width:70px"
              onchange="actualizarCantidadBD('${item.id}', this.value)">
            <button class="btn btn-sm btn-danger" onclick="eliminarProductoDelCarritoBD('${item.id}')">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  const total = calcularTotal(carrito);

  cont.innerHTML = `
    ${rows}
    <div class="mt-3 d-flex justify-content-between align-items-center">
      <strong>Total: ${new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(total)}</strong>
      <div>
        <button class="btn btn-vaciar me-2" onclick="vaciarCarritoBD()">Vaciar</button>
        <button class="btn btn-comprar" onclick="simularCompra()">Simular compra</button>
      </div>
    </div>
  `;
}

// Simular compra
async function simularCompra() {
  const carrito = await obtenerCarritoBD();
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  alert("Compra simulada correctamente. (No hay pago real en esta demo)");
  await vaciarCarritoBD();
}

// Auto carga
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("carrito-container")) {
    renderCarrito();
  }
});
