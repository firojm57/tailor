drop table if exists billing_items;
drop table if exists billing;
drop table if exists measurements;
drop table if exists customer;
drop table if exists varieties;
drop table if exists users;

create table users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

create table varieties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL UNIQUE,
    measure_list TEXT NOT NULL
);

create table customer (
    cust_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    mobile TEXT NOT NULL
);

create table measurements (
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

create table billing (
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

create table billing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER REFERENCES billing(id) ON DELETE CASCADE,
    clothing_type_id INTEGER,
    clothing_type_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0.0,
    description TEXT
);