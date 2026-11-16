from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
from datetime import datetime

app = FastAPI(title="Tino Shop UXraina API")

# Mamela ny React (Frontend) hifandray amin'ny Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "tino_shop.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# Famoronana ireo tabilao SQL (Tables)
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Tabilao Mpampiasa (Users)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            contact TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'client'
        )
    """)

    # 2. Tabilao Entana (Products)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            old_price REAL,
            stock INTEGER DEFAULT 10,
            badge TEXT DEFAULT 'Vaovao',
            image TEXT
        )
    """)

    # 3. Tabilao Kaomandy (Orders)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            gps_lat TEXT,
            gps_lng TEXT,
            payment_method TEXT NOT NULL,
            mvola_ref TEXT,
            items TEXT NOT NULL,
            total REAL NOT NULL,
            status TEXT DEFAULT 'Miandry',
            date TEXT NOT NULL
        )
    """)

    # 4. Tabilao Hevitra (Comments)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_name TEXT NOT NULL,
            text TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )
    """)

    # Fampidirana ny kaonty Mpitantana (Admin) raha mbola tsy ao
    cursor.execute("SELECT * FROM users WHERE contact = ?", ("0384910020",))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (full_name, contact, password, role) VALUES (?, ?, ?, ?)",
            ("Mioratiana Lydia", "0384910020", "tino2026", "admin")
        )

    conn.commit()
    conn.close()

init_db()

# --- Modely angon-drakitra (Schemas) ---
class UserRegister(BaseModel):
    full_name: str
    contact: str
    password: str

class UserLogin(BaseModel):
    contact: str
    password: str

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    old_price: Optional[float] = 0
    stock: int = 10
    badge: str = "Vaovao"
    image: Optional[str] = ""

class OrderCreate(BaseModel):
    id: str
    customer: str
    phone: str
    address: str
    gps_lat: Optional[str] = None
    gps_lng: Optional[str] = None
    payment_method: str
    mvola_ref: Optional[str] = "-"
    items: str
    total: float

class CommentCreate(BaseModel):
    product_id: int
    user_name: str
    text: str

# --- API Endpoints ---

@app.post("/api/register")
def register(user: UserRegister):
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (full_name, contact, password, role) VALUES (?, ?, ?, 'client')",
            (user.full_name, user.contact.strip(), user.password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"id": user_id, "fullName": user.full_name, "contact": user.contact, "role": "client"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Efa misy mampiasa io mailaka na laharana finday io.")
    finally:
        conn.close()

@app.post("/api/login")
def login(creds: UserLogin):
    conn = get_db()
    clean_contact = creds.contact.strip().replace(" ", "") if creds.contact.strip().replace(" ", "") == "0384910020" else creds.contact.strip()
    user = conn.execute(
        "SELECT * FROM users WHERE LOWER(contact) = LOWER(?) AND password = ?",
        (clean_contact, creds.password)
    ).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Diso ny mailaka/finday na ny teny miafina.")
    return {
        "id": user["id"],
        "fullName": user["full_name"],
        "contact": user["contact"],
        "role": user["role"]
    }

@app.get("/api/products")
def get_products():
    conn = get_db()
    rows = conn.execute("SELECT * FROM products ORDER BY id DESC").fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "category": r["category"],
            "price": r["price"],
            "oldPrice": r["old_price"],
            "stock": r["stock"],
            "badge": r["badge"],
            "image": r["image"]
        } for r in rows
    ]

@app.post("/api/products")
def create_product(prod: ProductCreate):
    conn = get_db()
    cursor = conn.cursor()
    img = prod.image if prod.image else "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80"
    old_p = prod.old_price if prod.old_price and prod.old_price > 0 else prod.price + 15000
    cursor.execute(
        "INSERT INTO products (name, category, price, old_price, stock, badge, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (prod.name, prod.category, prod.price, old_p, prod.stock, prod.badge, img)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, **prod.dict(), "oldPrice": old_p, "image": img}

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"message": "Voafafa ny entana"}

@app.get("/api/orders")
def get_orders():
    conn = get_db()
    rows = conn.execute("SELECT * FROM orders ORDER BY rowid DESC").fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "customer": r["customer"],
            "phone": r["phone"],
            "address": r["address"],
            "gps": {"lat": r["gps_lat"], "lng": r["gps_lng"]} if r["gps_lat"] else None,
            "paymentMethod": r["payment_method"],
            "mvolaRef": r["mvola_ref"],
            "items": r["items"],
            "total": r["total"],
            "status": r["status"],
            "date": r["date"]
        } for r in rows
    ]

@app.post("/api/orders")
def create_order(ord: OrderCreate):
    conn = get_db()
    now_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    conn.execute(
        """INSERT INTO orders (id, customer, phone, address, gps_lat, gps_lng, payment_method, mvola_ref, items, total, status, date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Miandry', ?)""",
        (ord.id, ord.customer, ord.phone, ord.address, ord.gps_lat, ord.gps_lng, ord.payment_method, ord.mvola_ref, ord.items, ord.total, now_str)
    )
    conn.commit()
    conn.close()
    return {"message": "Voaray ny kaomandy", "date": now_str}

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: str, status: str):
    conn = get_db()
    conn.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
    conn.commit()
    conn.close()
    return {"status": status}

@app.get("/api/comments/{product_id}")
def get_comments(product_id: int):
    conn = get_db()
    rows = conn.execute("SELECT * FROM comments WHERE product_id = ? ORDER BY id DESC", (product_id,)).fetchall()
    conn.close()
    return [{"id": r["id"], "user": r["user_name"], "text": r["text"], "date": r["date"]} for r in rows]

@app.post("/api/comments")
def add_comment(comm: CommentCreate):
    conn = get_db()
    now_str = datetime.now().strftime("%d/%m/%Y")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO comments (product_id, user_name, text, date) VALUES (?, ?, ?, ?)",
        (comm.product_id, comm.user_name, comm.text, now_str)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "user": comm.user_name, "text": comm.text, "date": now_str}