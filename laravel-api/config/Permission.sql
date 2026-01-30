INSERT INTO permissions (name, group, is_menu_web, web_route_key) VALUES 
-- Dashboard
('Dashboard.View', 'Dashboard', 1, ''),

-- POS
('POS.View', 'POS', 1, 'pos'),
('POS.Create', 'POS',null, ''),
('POS.Update', 'POS',null, ''),
('POS.Delete', 'POS',null, ''),

-- Product
('Product.View', 'Product', 1, 'products'),
('Product.Create', 'Product',null, ''),
('Product.Update', 'Product',null, ''),
('Product.Delete', 'Product',null, ''),

-- Categories
('Categories.View', 'Categories', 1, 'categories'),
('Categories.Create', 'Categories',null, ''),
('Categories.Update', 'Categories',null, ''),
('Categories.Delete', 'Categories',null, ''),

-- Brand
('Brand.View', 'Brand', 1, 'brands'),
('Brand.Create', 'Brand',null, ''),
('Brand.Update', 'Brand',null, ''),
('Brand.Delete', 'Brand',null, ''),

-- Province
('Province.View', 'Province', 1, 'provinces'),
('Province.Create', 'Province',null, ''),
('Province.Update', 'Province',null, ''),
('Province.Delete', 'Province',null, ''),

-- User (Parent Menu)
('User.View', 'User', 1, 'users'),
('User.Create', 'User',null, ''),
('User.Update', 'User',null, ''),
('User.Delete', 'User',null, ''),

-- Role (Submenu under User)
('Role.View', 'Role', 1, 'roles'),
('Role.Create', 'Role',null, ''),
('Role.Update', 'Role',null, ''),
('Role.Delete', 'Role',null, ''),

-- Files (Submenu under User)
('Files.View', 'Files', 1, 'files'),
('Files.Create', 'Files',null, ''),
('Files.Update', 'Files',null, ''),
('Files.Delete', 'Files',null, '');