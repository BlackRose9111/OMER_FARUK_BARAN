(function () {

    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
        console.log("wrong page");
        return;
    }

    const DATA_URL = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
    const STORAGE_KEY = "carouselProducts";
    const FAVORITES_KEY = "favoriteProducts";
    const APPEND_AFTER_CLASS = ".Section1";
    // ÖMER FARUK BARAN https://github.com/BlackRose9111

    let products = [];
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

    async function getProducts() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            products = JSON.parse(stored);
        } else {
            try {
                const res = await fetch(DATA_URL);
                products = await res.json();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        }
        renderCarousel();
    }


    function buildHTML(product) {
        let discountHTML = "";
        let oldPriceHTML = "";

        if (product.original_price && product.price < product.original_price) {
            const discountPercent = Math.round(
                ((product.original_price - product.price) / product.original_price) * 100
            );
            discountHTML = `<span class="discount-badge">%${discountPercent}</span>`;
            oldPriceHTML = `<span class="old-price">${product.original_price.toFixed(2)} TL</span>`;
        }

        const heartClass = favorites.includes(product.id) ? "heart-btn active" : "heart-btn";

        return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image">
          <img src="${product.img}" alt="${product.name}">
          ${discountHTML}
          <button class="${heartClass}">&#9825;</button>
        </div>
        <div class="product-info">
          <p class="product-title">${product.name}</p>
          <div class="product-prices">
            <span class="current-price">${product.price.toFixed(2)} TL</span>
            ${oldPriceHTML}
          </div>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      </div>
    `;
    }


    function renderCarousel() {
        const section = document.createElement("section");
        section.className = "carousel";

        section.innerHTML = `
      <h2 class="carousel-title">Beğenebileceğinizi Düşündüklerimiz</h2>
      <button class="carousel-arrow left">&lt;</button>
      <button class="carousel-arrow right">&gt;</button>
      <div class="carousel-track">
        ${products.map(buildHTML).join("")}
      </div>
    `;

        const targetElement = document.querySelector(APPEND_AFTER_CLASS);
        targetElement.parentNode.insertBefore(section, targetElement.nextSibling);

        const track = section.querySelector(".carousel-track");
        const leftBtn = section.querySelector(".carousel-arrow.left");
        const rightBtn = section.querySelector(".carousel-arrow.right");


        leftBtn.addEventListener("click", () => {
            track.scrollBy({ left: -300, behavior: "smooth" });
        });
        rightBtn.addEventListener("click", () => {
            track.scrollBy({ left: 300, behavior: "smooth" });
        });


        section.querySelectorAll(".product-card").forEach((card) => {
            const id = parseInt(card.dataset.id, 10);
            const product = products.find((p) => p.id === id);

            card.addEventListener("click", () => {
                window.open(product.url, "_blank");
            });

            // Prevent click on heart bubbling up
            const heart = card.querySelector(".heart-btn");
            heart.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleFavorite(id, heart);
            });
        });

        buildCSS();
    }


    function toggleFavorite(id, btn) {
        if (favorites.includes(id)) {
            favorites = favorites.filter((f) => f !== id);
            btn.classList.remove("active");
        } else {
            favorites.push(id);
            btn.classList.add("active");
        }
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }


    function buildCSS() {
        if (document.getElementById("carousel-styles")) return;

        const style = document.createElement("style");
        style.id = "carousel-styles";
        style.textContent = `
      .carousel { position: relative; margin: 20px auto; max-width: 1200px; padding: 10px; overflow: hidden; font-family: Arial, sans-serif; }
      .carousel-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333; }
      .carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: white; border: 1px solid #ccc; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; z-index: 10; color: #f9a66c; }
      .carousel-arrow.left { left: 5px; }
      .carousel-arrow.right { right: 5px; }
      .carousel-track { display: flex; gap: 15px; overflow-x: auto; scroll-behavior: smooth; }
      .carousel-track::-webkit-scrollbar { display: none; }
      .product-card { min-width: 200px; background: #fff; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05); flex-shrink: 0; cursor: pointer; display: flex; flex-direction: column; }
      .product-image { position: relative; }
      .product-image img { width: 100%; display: block; }
      .discount-badge { position: absolute; top: 10px; left: 10px; background: #f36c21; color: white; font-size: 12px; padding: 2px 6px; border-radius: 4px; }
      .heart-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer; color: #ccc; }
      .heart-btn.active { color: #f36c21; }
      .product-info { padding: 10px; margin-top: auto; }
      .product-title { font-size: 14px; color: #333; margin-bottom: 5px; }
      .product-prices { display: flex; gap: 8px; align-items: center; }
      .current-price { font-weight: bold; color: #333; }
      .old-price { text-decoration: line-through; color: #999; font-size: 13px; }
      .add-to-cart { margin-top: 10px; padding: 8px;  background: #f9a66c; color: white; border: none;  border-radius: 8px; cursor: pointer; font-size: 14px; text-align: center; transition: background 0.3s; }
    `;
        document.head.appendChild(style);
    }


    getProducts();
})();
