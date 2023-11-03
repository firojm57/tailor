drop schema tailor_schema cascade;
create schema tailor_schema;
set search_path to tailor_schema;

drop table if exists users cascade;
create table users (
    id bigserial primary key,
    username varchar(50) not null unique,
    email varchar(255),
    password_hash varchar(255) not null,
    created_at timestamptz default now()
);

-- static data
-- measure_list will save the keys of measurement json
-- type is like shirt, pant etc
drop table if exists varieties cascade;
create table varieties (
    id bigserial primary key,
    type varchar(255) not null unique,
    measure_list text[]
);

drop table if exists customer cascade;
create table customer (
    cust_id bigserial primary key,
    name varchar(255) not null,
    address varchar(1024),
    mobile varchar(50) not null
);

drop table if exists billing cascade;
create table billing (
    id bigserial primary key,
    bill_id varchar(255) unique not null,
    cust_id bigint references customer(cust_id),
    bill_date date,
    due_date date,
    paid_amount numeric,
    pending_amount numeric
);

-- this table contains multiple quantity and rate for one bill
-- measure_data will have keys from variety(measure_list) and values from user (ui)
drop table if exists billing_items cascade;
create table billing_items (
    id bigserial primary key,
    bill_id varchar(255) references billing(bill_id),
    type varchar(255) references varieties(type),
    quantity int,
    rate numeric,
    measure_data json
);