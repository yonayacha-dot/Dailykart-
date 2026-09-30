INSERT INTO products (name, price, mrp, description, category, image_url, is_available, tag, delivery_time, size)
SELECT 'Chicken Fried Rice - DailyKart Special', 149, 179, 'Wok-tossed rice with tender chicken and house spices.', 'Chicken Fried Rice', 'https://dummyimage.com/640x480/F5F1EB/2E2E2E&text=DailyKart+Special', true, 'highlight', '15 mins', 'big'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Chicken Fried Rice - DailyKart Special');
