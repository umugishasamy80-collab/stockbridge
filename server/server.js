const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 5000;
const JWT_SECRET = "stocklink-secret-key";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

const db = new Database(path.join(__dirname, "stocklink.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    business_name TEXT,
    business_type TEXT,
    address TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price REAL,
    minimum_order REAL DEFAULT 1,
    condition TEXT DEFAULT 'New',
    image TEXT,
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
);
`);

const categories = [
    "Fruits & Vegetables",
    "Food & Agriculture",
    "Beverages",
    "Electronics",
    "Computers & Accessories",
    "Clothing & Fashion",
    "Shoes",
    "Furniture",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Health & Medical Supplies",
    "Construction & Building Materials",
    "Automotive",
    "Machinery & Equipment",
    "Packaging Materials",
    "Cleaning & Household Supplies",
    "Livestock & Animal Products",
    "Office Supplies",
    "Tools & Hardware",
    "Books & Educational Supplies",
    "Other"
];

const insertCategory = db.prepare(
    "INSERT OR IGNORE INTO categories (name) VALUES (?)"
);

for (const category of categories) {
    insertCategory.run(category);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        const filename =
            Date.now() + "-" + Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, filename);
    }
});

const upload = multer({ storage });

function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            error: "Login required"
        });
    }

    const token = header.replace("Bearer ", "");

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({
            error: "Invalid or expired login"
        });
    }
}

app.get("/", (req, res) => {
    res.json({
        app: "StockLink",
        status: "READY"
    });
});

app.post("/api/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            whatsapp,
            business_name,
            business_type,
            address,
            city,
            latitude,
            longitude,
            description
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        const existing = db.prepare(
            "SELECT id FROM users WHERE email = ?"
        ).get(email);

        if (existing) {
            return res.status(400).json({
                error: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = db.prepare(`
            INSERT INTO users
            (
                name,
                email,
                password,
                phone,
                whatsapp,
                business_name,
                business_type,
                address,
                city,
                latitude,
                longitude,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            name,
            email,
            hashedPassword,
            phone || "",
            whatsapp || "",
            business_name || "",
            business_type || "",
            address || "",
            city || "",
            latitude || null,
            longitude || null,
            description || ""
        );

        const token = jwt.sign(
            {
                id: result.lastInsertRowid,
                email
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Registration successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const valid = await bcrypt.compare(
            password,
            user.password
        );

        if (!valid) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                business_name: user.business_name
            }
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.get("/api/me", auth, (req, res) => {
    const user = db.prepare(`
        SELECT
            id,
            name,
            email,
            phone,
            whatsapp,
            business_name,
            business_type,
            address,
            city,
            latitude,
            longitude,
            description
        FROM users
        WHERE id = ?
    `).get(req.user.id);

    res.json(user);
});

app.get("/api/categories", (req, res) => {
    const rows = db.prepare(
        "SELECT * FROM categories ORDER BY name"
    ).all();

    res.json(rows);
});

app.post(
    "/api/products",
    auth,
    upload.single("image"),
    (req, res) => {

        try {
            const {
                category_id,
                name,
                description,
                quantity,
                unit,
                price,
                minimum_order,
                condition
            } = req.body;

            if (
                !category_id ||
                !name ||
                !quantity ||
                !unit
            ) {
                return res.status(400).json({
                    error: "Category, name, quantity and unit are required"
                });
            }

            const image = req.file
                ? `/uploads/${req.file.filename}`
                : null;

            const result = db.prepare(`
                INSERT INTO products
                (
                    user_id,
                    category_id,
                    name,
                    description,
                    quantity,
                    unit,
                    price,
                    minimum_order,
                    condition,
                    image
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                req.user.id,
                category_id,
                name,
                description || "",
                Number(quantity),
                unit,
                price ? Number(price) : null,
                minimum_order ? Number(minimum_order) : 1,
                condition || "New",
                image
            );

            res.json({
                message: "Product added successfully",
                product_id: result.lastInsertRowid
            });

        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

app.get("/api/products", (req, res) => {
    const {
        category,
        search,
        city
    } = req.query;

    let sql = `
        SELECT
            products.*,
            categories.name AS category,
            users.business_name,
            users.name AS seller_name,
            users.phone,
            users.whatsapp,
            users.email,
            users.address,
            users.city,
            users.latitude,
            users.longitude
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        JOIN users
            ON products.user_id = users.id
        WHERE products.available = 1
    `;

    const params = [];

    if (category) {
        sql += " AND categories.id = ?";
        params.push(category);
    }

    if (search) {
        sql += " AND products.name LIKE ?";
        params.push(`%${search}%`);
    }

    if (city) {
        sql += " AND users.city LIKE ?";
        params.push(`%${city}%`);
    }

    sql += " ORDER BY products.created_at DESC";

    const products = db.prepare(sql).all(...params);

    res.json(products);
});

app.get("/api/products/:id", (req, res) => {
    const product = db.prepare(`
        SELECT
            products.*,
            categories.name AS category,
            users.business_name,
            users.name AS seller_name,
            users.phone,
            users.whatsapp,
            users.email,
            users.address,
            users.city,
            users.latitude,
            users.longitude
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        JOIN users
            ON products.user_id = users.id
        WHERE products.id = ?
    `).get(req.params.id);

    if (!product) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    res.json(product);
});

app.get("/api/my-products", auth, (req, res) => {
    const products = db.prepare(`
        SELECT
            products.*,
            categories.name AS category
        FROM products
        JOIN categories
            ON products.category_id = categories.id
        WHERE products.user_id = ?
        ORDER BY products.created_at DESC
    `).all(req.user.id);

    res.json(products);
});

app.delete("/api/products/:id", auth, (req, res) => {
    const product = db.prepare(`
        SELECT id
        FROM products
        WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!product) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    db.prepare(
        "DELETE FROM products WHERE id = ?"
    ).run(req.params.id);

    res.json({
        message: "Product deleted"
    });
});
/* ==========================================
   STOCKLINK PRODUCT DETAILS
========================================== */

app.get("/api/products/:id", (req, res) => {
    try {
        const product = db.prepare(`
            SELECT
                products.*,
                categories.name AS category
            FROM products
            LEFT JOIN categories
                ON products.category_id = categories.id
            WHERE products.id = ?
        `).get(req.params.id);

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        let seller = null;

        if (product.user_id) {
            seller = db.prepare(`
                SELECT
                    id,
                    name,
                    email,
                    phone
                FROM users
                WHERE id = ?
            `).get(product.user_id);
        }

        res.json({
            product,
            seller
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Could not load product"
        });
    }
});


/* ==========================================
   ORDERS TABLE
========================================== */

db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        seller_id INTEGER,
        quantity REAL NOT NULL,
        delivery_address TEXT,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();


/* ==========================================
   REQUEST ORDER
========================================== */

app.post("/api/orders", auth, (req, res) => {

    try {

        const {
            product_id,
            quantity,
            delivery_address,
            message
        } = req.body;

        if (!product_id) {
            return res.status(400).json({
                error: "Product is required"
            });
        }

        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({
                error: "Enter a valid quantity"
            });
        }

        const product = db.prepare(`
            SELECT *
            FROM products
            WHERE id = ?
        `).get(product_id);

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        if (
            product.quantity !== null &&
            Number(quantity) > Number(product.quantity)
        ) {
            return res.status(400).json({
                error: "Requested quantity is greater than available stock"
            });
        }

        const result = db.prepare(`
            INSERT INTO orders (
                buyer_id,
                product_id,
                seller_id,
                quantity,
                delivery_address,
                message
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            req.user.id,
            product_id,
            product.user_id,
            Number(quantity),
            delivery_address || "",
            message || ""
        );

        res.json({
            success: true,
            message: "Order request sent successfully",
            order_id: result.lastInsertRowid
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Could not create order request"
        });

    }

});


/* ==========================================
   BUYER ORDERS
========================================== */

app.get("/api/my-orders", auth, (req, res) => {

    try {

        const orders = db.prepare(`
            SELECT
                orders.*,
                products.name AS product_name
            FROM orders
            JOIN products
                ON orders.product_id = products.id
            WHERE orders.buyer_id = ?
            ORDER BY orders.created_at DESC
        `).all(req.user.id);

        res.json(orders);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Could not load orders"
        });

    }

});


/* ==========================================
   SELLER ORDERS
========================================== */

app.get("/api/seller-orders", auth, (req, res) => {

    try {

        const orders = db.prepare(`
            SELECT
                orders.*,
                products.name AS product_name
            FROM orders
            JOIN products
                ON orders.product_id = products.id
            WHERE orders.seller_id = ?
            ORDER BY orders.created_at DESC
        `).all(req.user.id);

        res.json(orders);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Could not load seller orders"
        });

    }

});


/* ==========================================
   ADMIN AUTHORIZATION
========================================== */

function adminOnly(req, res, next) {

    if (!req.user) {
        return res.status(401).json({
            error: "Login required"
        });
    }

    /*
       Temporary admin rule.

       Replace the email below with the
       administrator's actual account email.
    */

    const adminEmail =
        "admin@stocklink.com";

    if (req.user.email !== adminEmail) {

        return res.status(403).json({
            error: "Administrator access required"
        });

    }

    next();
}


/* ==========================================
   ADMIN PRODUCTS
========================================== */

app.get(
    "/api/admin/products",
    auth,
    adminOnly,
    (req, res) => {

        try {

            const products = db.prepare(`
                SELECT
                    products.*,
                    categories.name AS category
                FROM products
                LEFT JOIN categories
                    ON products.category_id = categories.id
                ORDER BY products.created_at DESC
            `).all();

            res.json(products);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Could not load products"
            });

        }

    }
);


/* ==========================================
   ADMIN EDIT PRODUCT
========================================== */

app.put(
    "/api/admin/products/:id",
    auth,
    adminOnly,
    (req, res) => {

        try {

            const {
                name,
                description,
                price,
                currency,
                quantity,
                category_id,
                image,
                address,
                city,
                latitude,
                longitude
            } = req.body;

            const product = db.prepare(`
                SELECT id
                FROM products
                WHERE id = ?
            `).get(req.params.id);

            if (!product) {

                return res.status(404).json({
                    error: "Product not found"
                });

            }

            db.prepare(`
                UPDATE products
                SET
                    name = ?,
                    description = ?,
                    price = ?,
                    currency = ?,
                    quantity = ?,
                    category_id = ?,
                    image = ?,
                    address = ?,
                    city = ?,
                    latitude = ?,
                    longitude = ?
                WHERE id = ?
            `).run(
                name,
                description || "",
                price,
                currency || "RWF",
                quantity,
                category_id,
                image || "",
                address || "",
                city || "",
                latitude || null,
                longitude || null,
                req.params.id
            );

            res.json({
                success: true,
                message: "Product updated"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Could not update product"
            });

        }

    }
);


/* ==========================================
   ADMIN DELETE PRODUCT
========================================== */

app.delete(
    "/api/admin/products/:id",
    auth,
    adminOnly,
    (req, res) => {

        try {

            const product = db.prepare(`
                SELECT id
                FROM products
                WHERE id = ?
            `).get(req.params.id);

            if (!product) {

                return res.status(404).json({
                    error: "Product not found"
                });

            }

            db.prepare(`
                DELETE FROM products
                WHERE id = ?
            `).run(req.params.id);

            res.json({
                success: true,
                message: "Product deleted"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Could not delete product"
            });

        }

    }
);


/* ==========================================
   ADMIN ORDERS
========================================== */

app.get(
    "/api/admin/orders",
    auth,
    adminOnly,
    (req, res) => {

        try {

            const orders = db.prepare(`
                SELECT
                    orders.*,
                    products.name AS product_name
                FROM orders
                LEFT JOIN products
                    ON orders.product_id = products.id
                ORDER BY orders.created_at DESC
            `).all();

            res.json(orders);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error: "Could not load orders"
            });

        }

    }
);


/* ==========================================
   ADMIN UPDATE ORDER
========================================== */

app.put(
    "/api/admin/orders/:id",
    auth,
    adminOnly,
    (req, res) => {

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "completed",
            "cancelled"
        ];

        const status = req.body.status;

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                error: "Invalid order status"
            });

        }

        db.prepare(`
            UPDATE orders
            SET status = ?
            WHERE id = ?
        `).run(
            status,
            req.params.id
        );

        res.json({
            success: true,
            message: "Order updated"
        });

    }
);
app.listen(PORT, () => {
    console.log("");
    console.log("================================");
    console.log("       STOCKLINK SERVER");
    console.log("================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Database: READY");
    console.log("Authentication: READY");
    console.log("Products: READY");
    console.log("Categories: READY");
    console.log("================================");
});