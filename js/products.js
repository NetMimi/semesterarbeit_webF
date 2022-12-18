import { showErrorMessage, Authorization, setLikeCount } from './common.js';

let productContainer = document.getElementById('product-container');
let amountProducts = document.getElementById('product-amount');

// ---------- SELECT MENU: COUNT---------- //
let countSelection = document.getElementById('count-selection');

countSelection.addEventListener('change', async (e) => {
  await fetchProducts();
});

// ---------- SELECT MENU: CATEGORY ----------//

let categorySelection = document.getElementById('category-selection');
categorySelection.addEventListener('change', async (e) => {
  await fetchProducts();
});

// ---------- SELECT MENU: PRICE ---------- //

let priceSelection = document.getElementById('price-selection');
priceSelection.addEventListener('change', (e) => {
  appendProducts(products);
});

let products = [];

//---------- GET PRODUCTS FROM API ----------//

async function fetchProducts() {
  try {
    let response = await fetch(prepareURL(), {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization,
      },
    });

    let data = await response.json();

    if (response.status === 200) {
      amountProducts.innerText = data.amount;
      products = data.products;
      appendProducts(products);
    } else {
      showErrorMessage(data.message);
    }
  } catch (err) {
    showErrorMessage(data.message);
  }
}

function prepareURL() {
  if (categorySelection.value === 'all') {
    return `https://web-modules.dev/api/v1/products/${countSelection.value}`;
  } else {
    return `https://web-modules.dev/api/v1/products/byCategory/${categorySelection.value}/${countSelection.value}`;
  }
}

function appendProducts(products) {
  productContainer.innerHTML = '';
  let sortedProducts = Array.from(products);
  if (priceSelection.value === 'none') {
    sortedProducts = products;
  } else if (priceSelection.value === 'up') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else {
    sortedProducts.sort((a, b) => b.price - a.price);
  }
  sortedProducts.forEach((product) => {
    appendProduct(product);
  });
}

fetchProducts();

//---------- APPEND PRODUCTS TO DOM ----------//

function appendProduct(product) {
  let productCard = document.createElement('article');
  productCard.classList.add('product-card');

  let productLink = document.createElement('button');
  productLink.classList.add('product-link');
  productLink.addEventListener('click', (e) => {
    productOverlay(product);
  });
  productCard.appendChild(productLink);

  let image = document.createElement('img');
  image.classList.add('product-img');
  image.src = product.image;
  image.alt = 'Produktebild';
  productLink.appendChild(image);

  let productContent = document.createElement('div');
  productContent.classList.add('product-content');
  productLink.appendChild(productContent);

  let productTitle = document.createElement('h2');
  productTitle.classList.add('product-title');
  productTitle.innerText = `${product.name}`;
  productContent.appendChild(productTitle);

  let productInfo = document.createElement('div');
  productInfo.classList.add('product-info');
  productContent.appendChild(productInfo);

  let productPrice = document.createElement('span');
  productPrice.classList.add('product-price');
  productPrice.innerText = `${product.price.toLocaleString('de-CH', {
    style: 'currency',
    currency: 'CHF',
    useGrouping: true,
  })}`;
  productInfo.appendChild(productPrice);

  let productButton = document.createElement('button');
  productButton.classList.add('button');
  productButton.innerText = 'Mehr';
  productInfo.appendChild(productButton);

  productContainer.appendChild(productCard);
}

// ---------- APPEND PRODUCT TO OVERLAY ---------- //

const overlay = document.getElementById('overlay');
overlay.addEventListener('click', closeOverlay);

function closeOverlay(e) {
  if (e.currentTarget === e.target) {
    overlay.style.display = 'none';
  }
}

let overlayContent = document.getElementById('overlay-content');

function productOverlay(product) {
  overlayContent.innerHTML = '';
  overlay.style.display = 'grid';

  let overlayImage = document.createElement('img');
  overlayImage.classList.add('overlay-img');
  overlayImage.src = product.image;
  overlayImage.alt = 'Produktebild';
  overlayContent.appendChild(overlayImage);

  let closeBtn = document.createElement('img');
  closeBtn.classList.add('close-btn');
  closeBtn.src = './img/close-btn.png';
  closeBtn.alt = 'close';
  closeBtn.addEventListener('click', closeOverlay);
  overlayContent.appendChild(closeBtn);

  let overlayTitleContainer = document.createElement('div');
  overlayTitleContainer.classList.add('overlay-title-container');
  overlayContent.appendChild(overlayTitleContainer);

  let overlayTitle = document.createElement('h2');
  overlayTitle.classList.add('overlay-title');
  overlayTitle.innerText = `${product.name}`;
  overlayTitleContainer.appendChild(overlayTitle);

  let overlayPrice = document.createElement('p');
  overlayPrice.classList.add('overlay-price');
  overlayPrice.innerText = `${product.price.toLocaleString('de-CH', {
    style: 'currency',
    currency: 'CHF',
    useGrouping: true,
  })}`;
  overlayContent.appendChild(overlayPrice);

  let overlayInfoContainer = document.createElement('div');
  overlayInfoContainer.classList.add('overlay-info');
  overlayContent.appendChild(overlayInfoContainer);

  let sku = document.createElement('p');
  sku.innerText = `Artikelnummer: ${product.sku}`;
  overlayInfoContainer.appendChild(sku);

  let category = document.createElement('p');
  category.innerText = `Kategorie: ${product.category.name}`;
  overlayInfoContainer.appendChild(category);

  let overlayDescriptionContainer = document.createElement('div');
  overlayDescriptionContainer.classList.add('overlay-info');
  overlayContent.appendChild(overlayDescriptionContainer);

  let descriptionTitle = document.createElement('p');
  descriptionTitle.innerText = `Produktebeschrieb:`;
  overlayDescriptionContainer.appendChild(descriptionTitle);

  let description = document.createElement('p');
  description.innerText = `${product.description}`;
  overlayDescriptionContainer.appendChild(description);

  let likeContainer = document.createElement('div');
  likeContainer.classList.add('product-likes');
  overlayTitleContainer.appendChild(likeContainer);

  let likeImg = document.createElement('img');
  likeImg.src = './img/heart.png';
  likeImg.alt = 'Like';
  likeImg.classList.add('likes-img');
  likeContainer.appendChild(likeImg);

  let likeCount = document.createElement('span');
  setLikeCount(likeCount, product.likes_count);
  likeContainer.appendChild(likeCount);

  likeImg.addEventListener('click', async (e) => {
    await sendLike(product, likeCount);
  });
}

// ---------- LIKE ---------- //

async function sendLike(product, likeCount) {
  try {
    let response = await fetch('https://web-modules.dev/api/v1/like', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'product',
        id: product.id,
      }),
    });

    let data = await response.json();

    if (response.status === 200) {
      product.likes_count = data.amount;
      setLikeCount(likeCount, product.likes_count);
    } else {
      showErrorMessage(data.message);
    }
  } catch (err) {
    showErrorMessage(data.message);
  }
}
