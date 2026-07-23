insert into users (username, password_hash, email)
values ('admin', 'admin@123', 'admin@example.com');

-- 1. Clothing Categories
insert into varieties (type, measure_list)
values 
('Shirt', '["Collar", "Shoulder", "Chest", "Waist", "Seat", "Sleeve Length", "Shirt Length"]'),
('Pant', '["Waist", "Seat", "Thigh", "Knee", "Crotch", "Bottom", "Pant Length"]'),
('Suit', '["Jacket Length", "Shoulder", "Chest", "Waist", "Sleeve Length", "Pant Waist", "Pant Length"]'),
('Kurta', '["Chest", "Shoulder", "Sleeve Length", "Kurta Length", "Collar"]'),
('Sherwani', '["Chest", "Waist", "Shoulder", "Sherwani Length", "Sleeve Length"]');

-- 2. Customers
insert into customer (name, address, mobile)
values 
('Rajesh Kumar', 'Solapur, Maharashtra', '9876543210'),
('Amit Shah', 'Pune, Maharashtra', '9822011223'),
('Vikram Malhotra', 'Mumbai, Maharashtra', '9930044556'),
('Sunil Verma', 'Solapur, Maharashtra', '9765432109'),
('Praveen Joshi', 'Kolhapur, Maharashtra', '9422088776'),
('Deepak Patel', 'Ahmedabad, Gujarat', '9898012345'),
('Kedar Deshmukh', 'Satara, Maharashtra', '9657011223'),
('Nitin Shinde', 'Navi Mumbai, Maharashtra', '9819055443');

-- 3. Customer Measurements
insert into measurements (customer_name, mobile_number, measurement_date, delivery_date, clothing_type_id, clothing_type_name, measurement_values, style)
values
('Rajesh Kumar', '9876543210', '2026-07-15', '2026-07-22', 1, 'Shirt', '{"Collar": "15.5", "Shoulder": "18.0", "Chest": "40.0", "Waist": "34.0", "Seat": "38.0", "Sleeve Length": "24.5", "Shirt Length": "29.0"}', 'Formal'),
('Rajesh Kumar', '9876543210', '2026-07-15', '2026-07-22', 2, 'Pant', '{"Waist": "34.0", "Seat": "40.0", "Thigh": "24.0", "Knee": "17.0", "Crotch": "25.0", "Bottom": "15.5", "Pant Length": "41.0"}', 'Formal'),
('Amit Shah', '9822011223', '2026-07-16', '2026-07-25', 3, 'Suit', '{"Jacket Length": "30.0", "Shoulder": "19.0", "Chest": "42.0", "Waist": "36.0", "Sleeve Length": "25.0", "Pant Waist": "36.0", "Pant Length": "42.0"}', 'Casual'),
('Vikram Malhotra', '9930044556', '2026-07-17', '2026-07-23', 4, 'Kurta', '{"Chest": "38.0", "Shoulder": "17.5", "Sleeve Length": "24.0", "Kurta Length": "40.0", "Collar": "15.0"}', 'Ethnic'),
('Sunil Verma', '9765432109', '2026-07-18', '2026-07-24', 1, 'Shirt', '{"Collar": "16.0", "Shoulder": "18.5", "Chest": "41.0", "Waist": "35.0", "Seat": "39.0", "Sleeve Length": "25.0", "Shirt Length": "30.0"}', 'Sports'),
('Praveen Joshi', '9422088776', '2026-07-18', '2026-07-27', 5, 'Sherwani', '{"Chest": "44.0", "Waist": "38.0", "Shoulder": "19.5", "Sherwani Length": "44.0", "Sleeve Length": "26.0"}', 'Ethnic'),
('Deepak Patel', '9898012345', '2026-07-19', '2026-07-26', 2, 'Pant', '{"Waist": "32.0", "Seat": "38.0", "Thigh": "23.0", "Knee": "16.0", "Crotch": "24.0", "Bottom": "15.0", "Pant Length": "40.0"}', 'Casual'),
('Kedar Deshmukh', '9657011223', '2026-07-20', '2026-07-28', 1, 'Shirt', '{"Collar": "15.0", "Shoulder": "17.5", "Chest": "39.0", "Waist": "33.0", "Seat": "37.0", "Sleeve Length": "24.0", "Shirt Length": "28.5"}', 'Formal');

-- 4. Billing & Invoices
insert into billing (bill_number, customer_name, mobile_number, bill_date, due_date, total_amount, discount, grand_total, paid, notes)
values
('INV-1001', 'Rajesh Kumar', '9876543210', '2026-07-15', '2026-07-22', 1400.0, 100.0, 1300.0, 1, 'Full payment received via UPI'),
('INV-1002', 'Amit Shah', '9822011223', '2026-07-16', '2026-07-25', 4500.0, 300.0, 4200.0, 0, 'Advance 2000 paid, balance 2200 pending'),
('INV-1003', 'Vikram Malhotra', '9930044556', '2026-07-17', '2026-07-23', 1200.0, 0.0, 1200.0, 1, 'Delivered and paid in cash'),
('INV-1004', 'Sunil Verma', '9765432109', '2026-07-18', '2026-07-24', 850.0, 50.0, 800.0, 0, 'Trial scheduled for tomorrow'),
('INV-1005', 'Praveen Joshi', '9422088776', '2026-07-18', '2026-07-27', 6500.0, 500.0, 6000.0, 1, 'Wedding order delivered'),
('INV-1006', 'Deepak Patel', '9898012345', '2026-07-19', '2026-07-26', 950.0, 0.0, 950.0, 0, 'Fabric stitching in progress');

-- 5. Invoice Items
insert into billing_items (bill_id, clothing_type_id, clothing_type_name, quantity, price, description)
values
(1, 1, 'Shirt', 2, 400.0, 'Cotton Formal Shirt Stitching'),
(1, 2, 'Pant', 1, 600.0, 'Slim Fit Trouser Stitching'),
(2, 3, 'Suit', 1, 4500.0, '2-Piece Tuxedo Premium Lining'),
(3, 4, 'Kurta', 1, 1200.0, 'Designer Linen Kurta Stitching'),
(4, 1, 'Shirt', 1, 850.0, 'Linen Casual Shirt'),
(5, 5, 'Sherwani', 1, 6500.0, 'Royal Silk Sherwani with Zari embroidery'),
(6, 2, 'Pant', 1, 950.0, 'Formal Chino Pant Stitching');
