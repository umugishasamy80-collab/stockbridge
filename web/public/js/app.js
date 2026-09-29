const API = "http://localhost:5000/api";
const CURRENCIES = [
    { code: "RWF", symbol: "FRw", name: "Rwandan Franc" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
    { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
    { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" }
];

function currencyOptions() {
    return CURRENCIES.map(currency => `
        <option value="${currency.code}">
            ${currency.code} — ${currency.name}
        </option>
    `).join("");
}

function currencySymbol(code) {
    const currency = CURRENCIES.find(
        item => item.code === code
    );

    return currency
        ? currency.symbol
        : code;
}

function formatMoney(amount, currency = "RWF") {

    if (amount === null || amount === undefined || amount === "") {
        return "Contact seller";
    }

    return `${currencySymbol(currency)} ${Number(amount).toLocaleString()}`;
}

let token = localStorage.getItem("stocklink_token");
let registerMap;
let mainMap;
let marker;

const categoryIcons = {
    "Fruits & Vegetables": "🍎",
    "Food & Agriculture": "🌾",
    "Beverages": "🥤",
    "Electronics": "📱",
    "Computers & Accessories": "💻",
    "Clothing & Fashion": "👕",
    "Shoes": "👟",
    "Furniture": "🪑",
    "Home & Kitchen": "🏠",
    "Beauty & Personal Care": "🧴",
    "Health & Medical Supplies": "💊",
    "Construction & Building Materials": "🏗️",
    "Automotive": "🚗",
    "Machinery & Equipment": "⚙️",
    "Packaging Materials": "📦",
    "Cleaning & Household Supplies": "🧹",
    "Livestock & Animal Products": "🐄",
    "Office Supplies": "🏢",
    "Tools & Hardware": "🔧",
    "Books & Educational Supplies": "📚",
    "Other": "📦"
};


function showPage(page) {

    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    const target = document.getElementById(page);

    if (target) {
        target.classList.remove("hidden");
    }

    if (page === "marketplace") {
        loadProducts();
    }

    if (page === "categories") {
        loadCategories();
    }

    if (page === "dashboard") {
        loadDashboard();
    }

    if (page === "map") {
        setTimeout(loadMainMap, 100);
    }

    if (page === "register") {
        setTimeout(loadRegisterMap, 100);
    }
}


async function api(url, options = {}) {

    const headers = options.headers || {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    options.headers = headers;

    const response = await fetch(url, options);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}


function updateAuthUI() {

    const authButtons =
        document.getElementById("authButtons");

    const userButtons =
        document.getElementById("userButtons");

    if (token) {
        authButtons.classList.add("hidden");
        userButtons.classList.remove("hidden");
    } else {
        authButtons.classList.remove("hidden");
        userButtons.classList.add("hidden");
    }
}


document
    .getElementById("registerForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const message =
            document.getElementById("registerMessage");

        message.textContent = "Creating account...";

        try {

            const data = await api(
                `${API}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({

                        name:
                            document.getElementById("regName").value,

                        email:
                            document.getElementById("regEmail").value,

                        password:
                            document.getElementById("regPassword").value,

                        phone:
                            document.getElementById("phone").value,

                        whatsapp:
                            document.getElementById("whatsapp").value,

                        business_name:
                            document.getElementById("businessName").value,

                        business_type:
                            document.getElementById("businessType").value,

                        address:
                            document.getElementById("address").value,

                        city:
                            document.getElementById("city").value,

                        latitude:
                            document.getElementById("latitude").value || null,

                        longitude:
                            document.getElementById("longitude").value || null,

                        description:
                            document.getElementById("description").value

                    })
                }
            );

            token = data.token;

            localStorage.setItem(
                "stocklink_token",
                token
            );

            updateAuthUI();

            message.textContent =
                "Account created successfully.";

            setTimeout(() => {
                showPage("dashboard");
            }, 700);

        } catch (error) {

            message.textContent =
                error.message;
        }

    });


document
    .getElementById("loginForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const message =
            document.getElementById("loginMessage");

        message.textContent = "Logging in...";

        try {

            const data = await api(
                `${API}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({

                        email:
                            document.getElementById("loginEmail").value,

                        password:
                            document.getElementById("loginPassword").value

                    })
                }
            );

            token = data.token;

            localStorage.setItem(
                "stocklink_token",
                token
            );

            updateAuthUI();

            message.textContent =
                "Login successful.";

            setTimeout(() => {
                showPage("dashboard");
            }, 500);

        } catch (error) {

            message.textContent =
                error.message;
        }

    });


function logout() {

    token = null;

    localStorage.removeItem(
        "stocklink_token"
    );

    updateAuthUI();

    showPage("home");
}


async function loadCategories() {

    try {

        const categories =
            await api(`${API}/categories`);

        const grid =
            document.getElementById("categoriesGrid");

        const categorySelect =
            document.getElementById("productCategory");

        const searchCategory =
            document.getElementById("searchCategory");

        grid.innerHTML = "";

        categorySelect.innerHTML =
            `<option value="">Select category</option>`;

        searchCategory.innerHTML =
            `<option value="">All categories</option>`;

        categories.forEach(category => {

            const icon =
                categoryIcons[category.name] || "📦";

            grid.innerHTML += `
                <div
                    class="category-card"
                    onclick="filterCategory(${category.id})">

                    <div>${icon}</div>

                    <strong>
                        ${category.name}
                    </strong>

                </div>
            `;

            categorySelect.innerHTML += `
                <option value="${category.id}">
                    ${category.name}
                </option>
            `;

            searchCategory.innerHTML += `
                <option value="${category.id}">
                    ${category.name}
                </option>
            `;
        });

    } catch (error) {

        console.error(error);
    }
}


function filterCategory(id) {

    showPage("marketplace");

    document.getElementById(
        "searchCategory"
    ).value = id;

    loadProducts();
}


async function loadProducts() {

    const grid =
        document.getElementById("productsGrid");

    grid.innerHTML =
        "Loading products...";

    try {

        const search =
            document.getElementById("searchProduct")?.value || "";

        const category =
            document.getElementById("searchCategory")?.value || "";

        const city =
            document.getElementById("searchCity")?.value || "";

        const params =
            new URLSearchParams();

        if (search) params.set("search", search);

        if (category) params.set("category", category);

        if (city) params.set("city", city);

        const products =
            await api(
                `${API}/products?${params.toString()}`
            );

        grid.innerHTML = "";

        if (!products.length) {

            grid.innerHTML = `
                <div class="panel">
                    No products found.
                </div>
            `;

            return;
        }

        products.forEach(product => {

            const image =
                product.image
                    ? `<img src="http://localhost:5000${product.image}">`
                    : categoryIcons[product.category] || "📦";

            const price =
                product.price
                    ? `${Number(product.price).toLocaleString()} RWF`
                    : "Contact seller";

            grid.innerHTML += `

                <div class="product-card">

                    <div class="product-image">
                        ${image}
                    </div>

                    <div class="product-body">

                        <div class="product-category">
                            ${product.category}
                        </div>

                        <h3>
                            ${product.name}
                        </h3>

                        <p>
                            ${product.description || "No description"}
                        </p>

                        <div class="product-price">
                            ${price}
                        </div>

                        <p>
                            ${product.quantity}
                            ${product.unit}
                            available
                        </p>

                        <div class="product-seller">

                            <strong>
                                ${product.business_name || product.seller_name}
                            </strong>

                            <span>
                                📍 ${product.city || product.address || "Location not provided"}
                            </span>

                            <span>
                                📞 ${product.phone || "Contact unavailable"}
                            </span>

                        </div>

                    </div>

                </div>

            `;
        });

    } catch (error) {

        grid.innerHTML = `
            <div class="panel">
                ${error.message}
            </div>
        `;
    }
}


document
    .getElementById("productForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        const message =
            document.getElementById("productMessage");

        message.textContent =
            "Adding product...";

        try {

            const formData =
                new FormData();

            formData.append(
                "name",
                document.getElementById("productName").value
            );

            formData.append(
                "category_id",
                document.getElementById("productCategory").value
            );

            formData.append(
                "quantity",
                document.getElementById("productQuantity").value
            );

            formData.append(
                "unit",
                document.getElementById("productUnit").value
            );

            formData.append(
                "price",
                document.getElementById("productPrice").value
            );

            formData.append(
                "minimum_order",
                document.getElementById("minimumOrder").value
            );

            formData.append(
                "condition",
                document.getElementById("productCondition").value
            );

            formData.append(
                "description",
                document.getElementById("productDescription").value
            );

            const image =
                document.getElementById("productImage").files[0];

            if (image) {
                formData.append("image", image);
            }

            await api(
                `${API}/products`,
                {
                    method: "POST",
                    body: formData
                }
            );

            message.textContent =
                "Product added successfully.";

            document
                .getElementById("productForm")
                .reset();

            setTimeout(() => {
                showPage("dashboard");
            }, 700);

        } catch (error) {

            message.textContent =
                error.message;
        }

    });


async function loadDashboard() {

    try {

        const user =
            await api(`${API}/me`);

        document.getElementById(
            "welcomeName"
        ).textContent =
            `Welcome back, ${user.name}`;

        document.getElementById(
            "businessDisplay"
        ).textContent =
            user.business_name || "Your business";

        document.getElementById(
            "businessInfo"
        ).innerHTML = `

            <div class="business-contact">

                <strong>
                    ${user.business_name || "Business"}
                </strong>

                <br>

                👤 ${user.name}

                <br>

                📧 ${user.email}

                <br>

                📞 ${user.phone || "Not provided"}

                <br>

                💬 ${user.whatsapp || "Not provided"}

                <br>

                📍 ${user.address || "Not provided"}

                ${user.city ? `, ${user.city}` : ""}

            </div>

        `;

        const products =
            await api(`${API}/my-products`);

        document.getElementById(
            "productCount"
        ).textContent =
            products.length;

        const total =
            products.reduce(
                (sum, product) =>
                    sum + Number(product.quantity || 0),
                0
            );

        document.getElementById(
            "stockCount"
        ).textContent = total;

        document.getElementById(
            "myProducts"
        ).innerHTML = products.length
            ? products.map(product => `

                <div class="my-product">

                    <div>

                        <strong>
                            ${product.name}
                        </strong>

                        <small>
                            ${product.quantity}
                            ${product.unit}
                            · ${product.category}
                        </small>

                    </div>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.id})">
                        Delete
                    </button>

                </div>

            `).join("")
            : "You have not added any products yet.";

        const categories =
            await api(`${API}/categories`);

        document.getElementById(
            "categoryCount"
        ).textContent =
            categories.length;

    } catch (error) {

        console.error(error);
    }
}


async function deleteProduct(id) {

    if (!confirm("Delete this product?")) {
        return;
    }

    try {

        await api(
            `${API}/products/${id}`,
            {
                method: "DELETE"
            }
        );

        loadDashboard();

    } catch (error) {

        alert(error.message);
    }
}


function loadRegisterMap() {

    if (registerMap) {
        registerMap.invalidateSize();
        return;
    }

    registerMap =
        L.map("registerMap").setView(
            [-1.9441, 30.0619],
            12
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(registerMap);

    registerMap.on("click", event => {

        const lat =
            event.latlng.lat;

        const lng =
            event.latlng.lng;

        document.getElementById(
            "latitude"
        ).value = lat;

        document.getElementById(
            "longitude"
        ).value = lng;

        if (marker) {
            registerMap.removeLayer(marker);
        }

        marker =
            L.marker([lat, lng])
                .addTo(registerMap)
                .bindPopup(
                    "Your business location"
                )
                .openPopup();

    });
}


async function loadMainMap() {

    if (mainMap) {
        mainMap.invalidateSize();
    } else {

        mainMap =
            L.map("mainMap").setView(
                [-1.9441, 30.0619],
                12
            );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap"
            }
        ).addTo(mainMap);
    }

    try {

        const products =
            await api(`${API}/products`);

        products.forEach(product => {

            if (
                product.latitude &&
                product.longitude
            ) {

                L.marker([
                    product.latitude,
                    product.longitude
                ])
                .addTo(mainMap)
                .bindPopup(`

                    <strong>
                        ${product.business_name || product.seller_name}
                    </strong>

                    <br>

                    ${product.name}

                    <br>

                    ${product.quantity}
                    ${product.unit}

                    <br>

                    📞 ${product.phone || "No phone"}

                `);
            }

        });

    } catch (error) {

        console.error(error);
    }
}


async function initialize() {

    updateAuthUI();

    await loadCategories();

    await loadProducts();

    if (token) {
        loadDashboard();
    }

    showPage("home");
}

initialize();/* ==========================================
   STOCKLINK PUBLIC MARKETPLACE
========================================== */

const STOCKLINK_CURRENCIES = [
    { code: "RWF", symbol: "FRw", name: "Rwandan Franc" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
    { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
    { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" }
];

const STOCKLINK_CATEGORIES = [
    ["🍎", "Fruits & Vegetables"],
    ["🌾", "Food & Agriculture"],
    ["🥤", "Beverages"],
    ["📱", "Electronics"],
    ["💻", "Computers & Accessories"],
    ["👕", "Clothing & Fashion"],
    ["👟", "Shoes"],
    ["🪑", "Furniture"],
    ["🏠", "Home & Kitchen"],
    ["💄", "Beauty & Personal Care"],
    ["💊", "Health & Medical"],
    ["🏗️", "Construction"],
    ["🚗", "Automotive"],
    ["⚙️", "Machinery & Equipment"],
    ["📦", "Packaging"],
    ["🧹", "Cleaning Supplies"],
    ["🐄", "Livestock & Animal Products"],
    ["🏢", "Office Supplies"],
    ["🔧", "Tools & Hardware"],
    ["📚", "Books & Education"],
    ["📦", "Other"]
];

function stocklinkWhatsApp(phone, message = "") {

    if (!phone) return "#";

    let clean = phone.replace(/[^\d]/g, "");

    if (clean.startsWith("0")) {
        clean = "250" + clean.substring(1);
    }

    const text = encodeURIComponent(message);

    return `https://wa.me/${clean}?text=${text}`;
}

function stocklinkCurrencyOptions() {

    return STOCKLINK_CURRENCIES.map(c => `
        <option value="${c.code}">
            ${c.code} — ${c.name}
        </option>
    `).join("");
}

function stocklinkFormatMoney(amount, currency) {

    const item = STOCKLINK_CURRENCIES.find(
        c => c.code === currency
    );

    const symbol = item ? item.symbol : currency;

    if (amount === null || amount === undefined || amount === "") {
        return "Contact seller";
    }

    return `${symbol} ${Number(amount).toLocaleString()}`;
}

function stocklinkCategoryCards() {

    const container =
        document.getElementById("stocklinkCategories");

    if (!container) return;

    container.innerHTML =
        STOCKLINK_CATEGORIES.map(category => `
            <button
                class="stocklink-category-card"
                onclick="stocklinkSelectCategory('${category[1]}')">

                <span class="stocklink-category-icon">
                    ${category[0]}
                </span>

                <span>
                    ${category[1]}
                </span>

            </button>
        `).join("");
}

function stocklinkSelectCategory(category) {

    const search =
        document.getElementById("marketplaceSearch");

    if (search) {
        search.value = category;
    }

    if (typeof showPage === "function") {
        showPage("marketplace");
    }

    if (typeof loadProducts === "function") {
        loadProducts();
    }
}

function stocklinkRequireLogin(action) {

    const loggedIn =
        localStorage.getItem("stocklink_user");

    if (!loggedIn) {

        localStorage.setItem(
            "stocklink_after_login",
            action
        );

        if (typeof showPage === "function") {
            showPage("login");
        }

        return false;
    }

    return true;
}

function stocklinkRequestOrder(productId) {

    async function stocklinkRequestOrder(productId) {

    const loggedIn =
        localStorage.getItem("stocklink_user");

    if (!loggedIn) {

        localStorage.setItem(
            "stocklink_after_login",
            `order:${productId}`
        );

        if (typeof showPage === "function") {
            showPage("login");
        } else {
            window.location.href = "/login";
        }

        return;
    }

    try {

        const response =
            await fetch(
                `/api/products/${productId}`
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Product not found"
            );

            return;
        }

        const product = data.product;

        const modal =
            document.createElement("div");

        modal.className =
            "stocklink-product-modal";

        modal.innerHTML = `

            <div
                class="stocklink-modal-overlay">

                <div
                    class="stocklink-order-form"
                    onclick="event.stopPropagation()">

                    <button
                        class="stocklink-modal-close"
                        onclick="
                            this.closest(
                                '.stocklink-product-modal'
                            ).remove()
                        ">

                        ×

                    </button>

                    <span
                        class="stocklink-eyebrow">

                        ORDER REQUEST

                    </span>

                    <h2>
                        Request ${product.name}
                    </h2>

                    <p>
                        Seller:
                        <strong>
                            ${
                                data.seller?.name ||
                                "Business seller"
                            }
                        </strong>
                    </p>

                    <label>
                        Quantity
                    </label>

                    <input
                        id="stocklinkOrderQuantity"
                        type="number"
                        min="1"
                        max="${product.quantity || 999999}"
                        value="1"
                    >

                    <label>
                        Delivery address
                    </label>

                    <textarea
                        id="stocklinkDeliveryAddress"
                        placeholder="Enter your delivery address">
                    </textarea>

                    <label>
                        Message to seller
                    </label>

                    <textarea
                        id="stocklinkOrderMessage"
                        placeholder="Optional message">
                    </textarea>

                    <button
                        class="stocklink-order-submit"
                        onclick="
                            stocklinkSubmitOrder(
                                ${product.id}
                            )
                        ">

                        Send Order Request

                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to StockLink server."
        );

    }

}
async function stocklinkSubmitOrder(productId) {

    const quantity =
        document.getElementById(
            "stocklinkOrderQuantity"
        )?.value;

    const deliveryAddress =
        document.getElementById(
            "stocklinkDeliveryAddress"
        )?.value;

    const message =
        document.getElementById(
            "stocklinkOrderMessage"
        )?.value;

    if (!quantity || Number(quantity) <= 0) {

        alert("Enter a valid quantity.");
        return;

    }

    try {

        const response =
            await fetch("/api/orders", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    product_id: productId,

                    quantity:
                        Number(quantity),

                    delivery_address:
                        deliveryAddress || "",

                    message:
                        message || ""

                })

            });

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Order request failed."
            );

            return;
        }

        const modal =
            document.querySelector(
                ".stocklink-product-modal"
            );

        if (modal) {
            modal.remove();
        }

        alert(
            "Order request sent successfully."
        );

    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to StockLink server."
        );

    }

}

function stocklinkRequestQuote(productId) {

    if (!stocklinkRequireLogin(
        `quote:${productId}`
    )) {
        return;
    }

    alert(
        "Quotation request started."
    );
}

function stocklinkContactSeller(productId) {

    if (!stocklinkRequireLogin(
        `contact:${productId}`
    )) {
        return;
    }

    alert(
        "Seller contact is available after login."
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        stocklinkCategoryCards();

    }
);/* ==========================================
   STOCKLINK SAMPLE MARKETPLACE
   5 PRODUCTS PER CATEGORY
========================================== */

const STOCKLINK_SAMPLE_PRODUCTS = [

    /* FRUITS & VEGETABLES */
    {
        id: 1001,
        name: "Fresh Tomatoes",
        category: "Fruits & Vegetables",
        price: 18000,
        currency: "RWF",
        quantity: 120,
        unit: "kg",
        seller: "Kigali Fresh Foods",
        city: "Kigali",
        lat: -1.9441,
        lng: 30.0619,
        image: "🍅"
    },
    {
        id: 1002,
        name: "Irish Potatoes",
        category: "Fruits & Vegetables",
        price: 32000,
        currency: "RWF",
        quantity: 250,
        unit: "kg",
        seller: "Hillside Produce",
        city: "Kigali",
        lat: -1.9536,
        lng: 30.0606,
        image: "🥔"
    },
    {
        id: 1003,
        name: "Fresh Bananas",
        category: "Fruits & Vegetables",
        price: 15000,
        currency: "RWF",
        quantity: 180,
        unit: "kg",
        seller: "Green Valley Traders",
        city: "Kigali",
        lat: -1.9660,
        lng: 30.1040,
        image: "🍌"
    },
    {
        id: 1004,
        name: "Fresh Avocados",
        category: "Fruits & Vegetables",
        price: 22000,
        currency: "RWF",
        quantity: 90,
        unit: "kg",
        seller: "Kigali Farm Supply",
        city: "Kigali",
        lat: -1.9200,
        lng: 30.0900,
        image: "🥑"
    },
    {
        id: 1005,
        name: "Fresh Onions",
        category: "Fruits & Vegetables",
        price: 25000,
        currency: "RWF",
        quantity: 140,
        unit: "kg",
        seller: "City Harvest",
        city: "Kigali",
        lat: -1.9700,
        lng: 30.0400,
        image: "🧅"
    },

    /* FOOD & AGRICULTURE */
    {
        id: 1101,
        name: "Premium Rice",
        category: "Food & Agriculture",
        price: 42000,
        currency: "RWF",
        quantity: 200,
        unit: "bag",
        seller: "East Africa Foods",
        city: "Kigali",
        lat: -1.9440,
        lng: 30.0500,
        image: "🍚"
    },
    {
        id: 1102,
        name: "Maize Flour",
        category: "Food & Agriculture",
        price: 28000,
        currency: "RWF",
        quantity: 150,
        unit: "bag",
        seller: "Rwanda Grain Hub",
        city: "Kigali",
        lat: -1.9300,
        lng: 30.0800,
        image: "🌽"
    },
    {
        id: 1103,
        name: "Cooking Beans",
        category: "Food & Agriculture",
        price: 36000,
        currency: "RWF",
        quantity: 180,
        unit: "bag",
        seller: "Agro Trade Rwanda",
        city: "Kigali",
        lat: -1.9550,
        lng: 30.0900,
        image: "🫘"
    },
    {
        id: 1104,
        name: "Wheat Flour",
        category: "Food & Agriculture",
        price: 45000,
        currency: "RWF",
        quantity: 100,
        unit: "bag",
        seller: "Kigali Food Market",
        city: "Kigali",
        lat: -1.9100,
        lng: 30.0700,
        image: "🌾"
    },
    {
        id: 1105,
        name: "Cooking Oil",
        category: "Food & Agriculture",
        price: 52000,
        currency: "RWF",
        quantity: 80,
        unit: "carton",
        seller: "Smart Food Suppliers",
        city: "Kigali",
        lat: -1.9800,
        lng: 30.0750,
        image: "🫗"
    },

    /* BEVERAGES */
    {
        id: 1201,
        name: "Bottled Water",
        category: "Beverages",
        price: 6500,
        currency: "RWF",
        quantity: 500,
        unit: "carton",
        seller: "Kigali Beverage Hub",
        city: "Kigali",
        lat: -1.9400,
        lng: 30.0600,
        image: "💧"
    },
    {
        id: 1202,
        name: "Fruit Juice",
        category: "Beverages",
        price: 18000,
        currency: "RWF",
        quantity: 200,
        unit: "carton",
        seller: "Fresh Drinks Rwanda",
        city: "Kigali",
        lat: -1.9500,
        lng: 30.0800,
        image: "🧃"
    },
    {
        id: 1203,
        name: "Black Tea",
        category: "Beverages",
        price: 25000,
        currency: "RWF",
        quantity: 120,
        unit: "box",
        seller: "Rwanda Tea Traders",
        city: "Kigali",
        lat: -1.9250,
        lng: 30.0600,
        image: "🍵"
    },
    {
        id: 1204,
        name: "Coffee Beans",
        category: "Beverages",
        price: 85000,
        currency: "RWF",
        quantity: 60,
        unit: "kg",
        seller: "Kigali Coffee House",
        city: "Kigali",
        lat: -1.9650,
        lng: 30.0850,
        image: "☕"
    },
    {
        id: 1205,
        name: "Soft Drinks",
        category: "Beverages",
        price: 12000,
        currency: "RWF",
        quantity: 300,
        unit: "carton",
        seller: "City Drinks Wholesale",
        city: "Kigali",
        lat: -1.9000,
        lng: 30.0650,
        image: "🥤"
    },

    /* ELECTRONICS */
    {
        id: 1301,
        name: "Samsung Galaxy Phones",
        category: "Electronics",
        price: 850,
        currency: "USD",
        quantity: 35,
        unit: "piece",
        seller: "Kigali Electronics",
        city: "Kigali",
        lat: -1.9445,
        lng: 30.0620,
        image: "📱"
    },
    {
        id: 1302,
        name: "Bluetooth Speakers",
        category: "Electronics",
        price: 28000,
        currency: "RWF",
        quantity: 80,
        unit: "piece",
        seller: "Tech World Rwanda",
        city: "Kigali",
        lat: -1.9600,
        lng: 30.0700,
        image: "🔊"
    },
    {
        id: 1303,
        name: "LED Televisions",
        category: "Electronics",
        price: 320000,
        currency: "RWF",
        quantity: 25,
        unit: "piece",
        seller: "Digital House Kigali",
        city: "Kigali",
        lat: -1.9300,
        lng: 30.0500,
        image: "📺"
    },
    {
        id: 1304,
        name: "Power Banks",
        category: "Electronics",
        price: 18000,
        currency: "RWF",
        quantity: 120,
        unit: "piece",
        seller: "Smart Tech Supplies",
        city: "Kigali",
        lat: -1.9500,
        lng: 30.0450,
        image: "🔋"
    },
    {
        id: 1305,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 35000,
        currency: "RWF",
        quantity: 65,
        unit: "piece",
        seller: "Digital Market Rwanda",
        city: "Kigali",
        lat: -1.9150,
        lng: 30.0800,
        image: "🎧"
    },

    /* COMPUTERS */
    {
        id: 1401,
        name: "Dell Business Laptop",
        category: "Computers & Accessories",
        price: 650,
        currency: "USD",
        quantity: 20,
        unit: "piece",
        seller: "Kigali Computer Center",
        city: "Kigali",
        lat: -1.9440,
        lng: 30.0610,
        image: "💻"
    },
    {
        id: 1402,
        name: "Wireless Keyboard",
        category: "Computers & Accessories",
        price: 22000,
        currency: "RWF",
        quantity: 90,
        unit: "piece",
        seller: "Tech Point Rwanda",
        city: "Kigali",
        lat: -1.9500,
        lng: 30.0550,
        image: "⌨️"
    },
    {
        id: 1403,
        name: "Computer Mouse",
        category: "Computers & Accessories",
        price: 12000,
        currency: "RWF",
        quantity: 150,
        unit: "piece",
        seller: "Digital Supplies",
        city: "Kigali",
        lat: -1.9300,
        lng: 30.0750,
        image: "🖱️"
    },
    {
        id: 1404,
        name: "24-inch Monitor",
        category: "Computers & Accessories",
        price: 180000,
        currency: "RWF",
        quantity: 30,
        unit: "piece",
        seller: "Kigali IT Solutions",
        city: "Kigali",
        lat: -1.9700,
        lng: 30.0600,
        image: "🖥️"
    },
    {
        id: 1405,
        name: "Laptop Backpacks",
        category: "Computers & Accessories",
        price: 30000,
        currency: "RWF",
        quantity: 75,
        unit: "piece",
        seller: "Computer Accessories Hub",
        city: "Kigali",
        lat: -1.9200,
        lng: 30.0500,
        image: "🎒"
    }

];/* ==========================================
   NEARBY BUSINESS SORTING
========================================== */

function stocklinkDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


function stocklinkSortNearby(
    products,
    userLat,
    userLng
) {

    return [...products].map(product => {

        if (
            product.lat === undefined ||
            product.lng === undefined
        ) {

            return {
                ...product,
                distance: Infinity
            };

        }

        return {
            ...product,
            distance:
                stocklinkDistanceKm(
                    userLat,
                    userLng,
                    product.lat,
                    product.lng
                )
        };

    }).sort(
        (a, b) =>
            a.distance - b.distance
    );
}


function stocklinkGetUserLocation() {

    return new Promise(resolve => {

        if (!navigator.geolocation) {

            resolve(null);
            return;

        }

        navigator.geolocation.getCurrentPosition(

            position => {

                resolve({
                    lat:
                        position.coords.latitude,

                    lng:
                        position.coords.longitude
                });

            },

            () => {

                resolve(null);

            },

            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 300000
            }

        );

    });

}


async function stocklinkLoadNearbyProducts() {

    const container =
        document.getElementById(
            "stocklinkPublicProducts"
        );

    if (!container) return;

    let products =
        STOCKLINK_SAMPLE_PRODUCTS;

    const location =
        await stocklinkGetUserLocation();

    if (location) {

        products =
            stocklinkSortNearby(
                products,
                location.lat,
                location.lng
            );

    }

    container.innerHTML =
        products.slice(0, 12).map(
            product => {

                const distance =
                    product.distance !== undefined &&
                    product.distance !== Infinity
                        ? `${product.distance.toFixed(1)} km away`
                        : product.city;

                return `
                    <article
                        class="stocklink-product-card">

                        <div
                            class="stocklink-product-image">

                            <span>
                                ${product.image}
                            </span>

                        </div>

                        <div
                            class="stocklink-product-body">

                            <span
                                class="stocklink-product-category">

                                ${product.category}

                            </span>

                            <h3>
                                ${product.name}
                            </h3>

                            <div
                                class="stocklink-product-price">

                                ${stocklinkFormatMoney(
                                    product.price,
                                    product.currency
                                )}

                            </div>

                            <div
                                class="stocklink-product-meta">

                                ${product.quantity}
                                ${product.unit}s available

                                <br>

                                ${product.seller}

                                <br>

                                📍 ${product.city}

                                <br>

                                📍 ${distance}

                            </div>

                            <div
                                class="stocklink-product-actions">

                                <button
                                    class="stocklink-secondary-action"
                                    onclick="
                                        stocklinkViewProduct(
                                            ${product.id}
                                        )
                                    ">

                                    View

                                </button>

                                <button
                                    class="stocklink-primary-action"
                                    onclick="
                                        stocklinkRequestOrder(
                                            ${product.id}
                                        )
                                    ">

                                    Request Order

                                </button>

                            </div>

                        </div>

                    </article>
                `;

            }
        ).join("");

}


function stocklinkViewProduct(id) {

async function stocklinkViewProduct(id) {

    try {

        const response =
            await fetch(`/api/products/${id}`);

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Could not load product"
            );

            return;
        }

        const product = data.product;
        const seller = data.seller;

        const modal =
            document.createElement("div");

        modal.className =
            "stocklink-product-modal";

        const whatsapp =
            seller && seller.phone
                ? stocklinkWhatsApp(
                    seller.phone,
                    `Hello ${seller.name || ""},

I found your ${product.name} product on StockLink.

I would like to know more about it.`
                )
                : "#";

        modal.innerHTML = `

            <div class="stocklink-modal-overlay"
                 onclick="this.parentElement.remove()">

                <div
                    class="stocklink-product-detail"
                    onclick="event.stopPropagation()">

                    <button
                        class="stocklink-modal-close"
                        onclick="this.closest(
                            '.stocklink-product-modal'
                        ).remove()">

                        ×

                    </button>

                    <div
                        class="stocklink-detail-image">

                        ${
                            product.image
                            ? `<img src="${product.image}"
                                   alt="${product.name}">`
                            : `<span>📦</span>`
                        }

                    </div>

                    <div
                        class="stocklink-detail-content">

                        <span
                            class="stocklink-product-category">

                            ${product.category || "Other"}

                        </span>

                        <h2>
                            ${product.name}
                        </h2>

                        <div
                            class="stocklink-detail-price">

                            ${stocklinkFormatMoney(
                                product.price,
                                product.currency
                            )}

                        </div>

                        <p>
                            ${
                                product.description ||
                                "No product description provided."
                            }
                        </p>

                        <div
                            class="stocklink-detail-info">

                            <div>
                                <strong>
                                    Available
                                </strong>

                                <span>
                                    ${product.quantity || 0}
                                    ${product.unit || "units"}
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Location
                                </strong>

                                <span>
                                    ${
                                        product.address ||
                                        product.city ||
                                        "Location not provided"
                                    }
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Seller
                                </strong>

                                <span>
                                    ${
                                        seller?.name ||
                                        "Business seller"
                                    }
                                </span>
                            </div>

                        </div>

                        <div
                            class="stocklink-detail-actions">

                            ${
                                seller?.phone
                                ? `
                                <a
                                    href="${whatsapp}"
                                    target="_blank"
                                    class="stocklink-whatsapp-button">

                                    💬 WhatsApp Seller

                                </a>
                                `
                                : ""
                            }

                            <button
                                class="stocklink-order-button"
                                onclick="
                                    this.closest(
                                        '.stocklink-product-modal'
                                    ).remove();

                                    stocklinkRequestOrder(
                                        ${product.id}
                                    );
                                ">

                                Request Order

                            </button>

                        </div>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to StockLink server."
        );

    }

}