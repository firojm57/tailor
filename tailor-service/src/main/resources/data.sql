-- Default Clothing Categories Configuration (only inserted if not present)
insert or ignore into varieties (id, type, measure_list, style_list)
values 
(1, 'Shirt', '["Collar", "Shoulder", "Chest", "Waist", "Seat", "Sleeve Length", "Shirt Length"]', '["Formal", "Casual", "Sports", "Partywear"]'),
(2, 'Pant', '["Waist", "Seat", "Thigh", "Knee", "Crotch", "Bottom", "Pant Length"]', '["Formal", "Casual", "Jeans", "Chinos"]'),
(3, 'Suit', '["Jacket Length", "Shoulder", "Chest", "Waist", "Sleeve Length", "Pant Waist", "Pant Length"]', '["Formal", "Tuxedo", "Wedding"]'),
(4, 'Kurta', '["Chest", "Shoulder", "Sleeve Length", "Kurta Length", "Collar"]', '["Ethnic", "Casual", "Wedding"]'),
(5, 'Sherwani', '["Chest", "Waist", "Shoulder", "Sherwani Length", "Sleeve Length"]', '["Ethnic", "Wedding", "Designer"]');

