const form = document.getElementById('productForm');
const productsContainer = document.getElementById('products');
const statusEl = document.getElementById('status');

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
          <button class="delete-btn" data-id="${product._id}">Delete</button>
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
    renderProducts(products);
  } catch (error) {
    productsContainer.innerHTML = '<p class="empty">Failed to load products.</p>';
    setStatus(error.message, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Saving product...');

  const payload = {
    name: document.getElementById('name').value.trim(),
    quantity: Number(document.getElementById('quantity').value),
    price: Number(document.getElementById('price').value),
    image: document.getElementById('image').value.trim()
  };

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Could not save product');
    }

    form.reset();
    document.getElementById('quantity').value = 0;
    document.getElementById('price').value = 0;
    setStatus('Product added successfully.');
    loadProducts();
  } catch (error) {
    setStatus(error.message, true);
  }
});

productsContainer.addEventListener('click', async (event) => {
  const button = event.target.closest('.delete-btn');
  if (!button) {
    return;
  }

  const id = button.getAttribute('data-id');
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

    setStatus('Product deleted.');
    loadProducts();
  } catch (error) {
    setStatus(error.message, true);
  }
});

loadProducts();
