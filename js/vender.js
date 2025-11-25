const form = document.getElementById('formProducto');
const lista = document.getElementById('listaProductos');
const inputImagen = document.getElementById('imagen');

const previewImg = document.getElementById('preview-img');
const previewNombre = document.getElementById('preview-nombre');
const previewDescripcion = document.getElementById('preview-descripcion');
const previewCategoria = document.getElementById('preview-categoria');
const previewPrecio = document.getElementById('preview-precio');
const toast = document.getElementById('toast');

let productos = [];
let imagenURL = 'img/default.png';

// Actualizar preview en tiempo real
inputImagen.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        imagenURL = URL.createObjectURL(file);
        previewImg.src = imagenURL;
    }
});

document.getElementById('nombre').addEventListener('input', (e) => previewNombre.textContent = e.target.value || 'Nombre del producto');
document.getElementById('descripcion').addEventListener('input', (e) => previewDescripcion.textContent = e.target.value || 'Descripción');
document.getElementById('categoria').addEventListener('input', (e) => previewCategoria.textContent = e.target.value || 'Categoría');
document.getElementById('precio').addEventListener('input', (e) => previewPrecio.textContent = e.target.value ? `S/.${e.target.value}` : 'S/.0');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const descripcion = document.getElementById('descripcion').value;
    const categoria = document.getElementById('categoria').value;

    const producto = { nombre, precio, descripcion, categoria, imagen: imagenURL };
    productos.push(producto);

    renderProductos();
    form.reset();

    // Reset preview
    imagenURL = 'img/default.png';
    previewImg.src = imagenURL;
    previewNombre.textContent = 'Nombre del producto';
    previewDescripcion.textContent = 'Descripción';
    previewCategoria.textContent = 'Categoría';
    previewPrecio.textContent = 'S/.0';

    // Mostrar toast
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
});

function renderProductos() {
    lista.innerHTML = '';
    productos.forEach(p => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="producto-card shadow-sm">
                <img src="${p.imagen}" alt="${p.nombre}" class="producto-img">
                <div class="card-body">
                    <h5>${p.nombre}</h5>
                    <p>${p.descripcion}</p>
                    <small>${p.categoria} - S/.${p.precio}</small>
                </div>
            </div>
        `;
        lista.appendChild(col);
    });
}
