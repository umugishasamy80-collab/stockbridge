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

initialize();