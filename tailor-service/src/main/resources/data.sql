set search_path to tailor_schema;

insert into users (username, password_hash, email)
values ('admin', 'admin@123', 'admin@example.com');

insert into varieties (type, measure_list)
values ('shirt', '{"collar", "shoulder", "chest", "waist", "seat", "sleeve", "length"}')
, ('pant', '{"waist", "seat", "thigh", "knee", "crotch", "bottom", "length"}')
;

-- test data to be deleted
insert into customer(name,address,mobile)
values('Kedar', 'Solapur, Maha, India', 9876543210);

insert into billing(bill_id,bill_date,due_date,paid_amount,pending_amount)
values ('b101', '2023-10-06', '2023-10-12', 350.0, 250.0);

insert into billing_items(bill_id,cust_id,quantity,rate)
values('b101', 1, 1, 600);