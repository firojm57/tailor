create table if not exists users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    mobile_number TEXT,
    role TEXT DEFAULT 'ROLE_TAILOR',
    reset_token TEXT,
    reset_token_expiry TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

create table if not exists draft_invoices (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    mobile_number TEXT,
    due_date TEXT,
    notes TEXT,
    discount REAL DEFAULT 0.0,
    items_json TEXT,
    updated_at TEXT
);

create table if not exists varieties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL UNIQUE,
    measure_list TEXT NOT NULL,
    style_list TEXT
);


create table if not exists measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    measurement_date TEXT NOT NULL,
    delivery_date TEXT,
    clothing_type_id INTEGER,
    clothing_type_name TEXT NOT NULL,
    measurement_values TEXT NOT NULL,
    style TEXT
);

create table if not exists billing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    bill_date TEXT NOT NULL,
    due_date TEXT,
    total_amount REAL DEFAULT 0.0,
    discount REAL DEFAULT 0.0,
    grand_total REAL DEFAULT 0.0,
    paid INTEGER DEFAULT 0,
    notes TEXT
);

create table if not exists billing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER REFERENCES billing(id) ON DELETE CASCADE,
    clothing_type_id INTEGER,
    clothing_type_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0.0,
    description TEXT
);