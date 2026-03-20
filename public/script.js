const form = document.getElementById('productForm');
const productsContainer = document.getElementById('products');
const statusEl = document.getElementById('status');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

let editingProductId = null;
let productsById = new Map();

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#b91c1c' : '#0f766e';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resetForm() {
  editingProductId = null;
  form.reset();
  document.getElementById('quantity').value = 0;
  document.getElementById('price').value = 0;
  formTitle.textContent = 'Add Product';
  submitBtn.textContent = 'Add Product';
  cancelEditBtn.classList.add('hidden');
}

function beginEdit(product) {
  editingProductId = product._id;
  document.getElementById('name').value = product.name || '';
  document.getElementById('quantity').value = Number.isFinite(product.quantity) ? product.quantity : 0;
  document.getElementById('price').value = Number.isFinite(product.price) ? product.price : 0;
  document.getElementById('image').value = typeof product.image === 'string' ? product.image : '';
  formTitle.textContent = 'Update Product';
  submitBtn.textContent = 'Update Product';
  cancelEditBtn.classList.remove('hidden');
  setStatus('Editing product. Update fields and submit.');
}

function renderProducts(products) {
  if (!products.length) {
    productsContainer.innerHTML = '<p class="empty">No products found.</p>';
    return;
  }

  productsContainer.innerHTML = products
    .map((product) => {
      const safeName = escapeHtml(product.name || 'Unnamed product');
      const quantity = Number.isFinite(product.quantity) ? product.quantity : 0;
      const price = Number.isFinite(product.price) ? product.price : 0;
      const imageUrl = typeof product.image === 'string' ? product.image.trim() : '';
      const imageMarkup = imageUrl
        ? `<img class="product-image" src="${escapeHtml(imageUrl)}" alt="${safeName}" loading="lazy" onerror="this.style.display='none'" />`
        : '';

      return `
        <article class="product-item">
          <div class="product-main">
            ${imageMarkup}
            <div>
              <strong>${safeName}</strong>
              <p class="product-meta">Quantity: ${quantity}</p>
              <p class="product-meta">Price: ${formatCurrency(price)}</p>
            </div>
          </div>
          <div class="product-actions">
            <button class="edit-btn" data-id="${product._id}" type="button">Edit</button>
            <button class="delete-btn" data-id="${product._id}" type="button">Delete</button>
          </div>
        </article>
      `;
    })
    .join('');
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Could not load products');
    }
    const products = await response.json();
    productsById = new Map(products.map((product) => [product._id, product]));
    renderProducts(products);
  } catch (error) {
    productsContainer.innerHTML = '<p class="empty">Failed to load products.</p>';
    setStatus(error.message, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const isEditing = Boolean(editingProductId);
  setStatus(isEditing ? 'Updating product...' : 'Saving product...');

  const payload = {
    name: document.getElementById('name').value.trim(),
    quantity: Number(document.getElementById('quantity').value),
    price: Number(document.getElementById('price').value),
    image: document.getElementById('image').value.trim()
  };

  try {
    const response = await fetch(isEditing ? `/api/product/${editingProductId}` : '/api/products', {
      method: isEditing ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(isEditing ? 'Could not update product' : 'Could not save product');
    }

    setStatus(isEditing ? 'Product updated successfully.' : 'Product added successfully.');
    resetForm();
    loadProducts();
  } catch (error) {
    setStatus(error.message, true);
  }
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
  setStatus('Edit cancelled.');
});

productsContainer.addEventListener('click', async (event) => {
  const editBtn = event.target.closest('.edit-btn');
  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    const product = id ? productsById.get(id) : null;
    if (!product) {
      setStatus('Could not find product to edit.', true);
      return;
    }
    beginEdit(product);
    return;
  }

  const deleteBtn = event.target.closest('.delete-btn');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    if (!id) {
      return;
    }

    try {
      const response = await fetch(`/api/product/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Could not delete product');
      }

      if (editingProductId === id) {
        resetForm();
      }

      setStatus('Product deleted.');
      loadProducts();
    } catch (error) {
      setStatus(error.message, true);
    }
  }
});

resetForm();
loadProducts();
