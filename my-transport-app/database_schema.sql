-- 交通应用数据库模式
-- 专为叶卡捷琳堡市的公共交通系统设计

-- 用户表
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    profile_image_url VARCHAR(255)
);

-- 地点表（车站、站点等）
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'station', 'stop', 'poi' (point of interest)
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    address VARCHAR(255),
    description TEXT,
    is_accessible BOOLEAN DEFAULT false, -- 是否无障碍设施
    has_wifi BOOLEAN DEFAULT false,
    has_ticket_machine BOOLEAN DEFAULT false,
    has_waiting_area BOOLEAN DEFAULT false,
    has_bike_parking BOOLEAN DEFAULT false,
    has_car_parking BOOLEAN DEFAULT false,
    image_url VARCHAR(255)
);

-- 交通方式表
CREATE TABLE transport_types (
    transport_type_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 'Tram', 'Bus', 'Trolleybus', 'Metro', etc.
    icon_url VARCHAR(255),
    color VARCHAR(20), -- 颜色代码
    description TEXT
);

-- 路线表
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    route_number VARCHAR(20) NOT NULL, -- 例如 "T5", "A32"
    name VARCHAR(100) NOT NULL,
    transport_type_id INTEGER REFERENCES transport_types(transport_type_id),
    color VARCHAR(20), -- 路线在地图上的颜色
    is_accessible BOOLEAN DEFAULT true,
    weekday_first_departure TIME,
    weekday_last_departure TIME,
    weekend_first_departure TIME,
    weekend_last_departure TIME,
    frequency_peak_minutes INTEGER, -- 高峰期发车频率（分钟）
    frequency_offpeak_minutes INTEGER, -- 非高峰期发车频率（分钟）
    is_active BOOLEAN DEFAULT true,
    description TEXT
);

-- 车站/站点与路线关联表（表示一条路线的所有停靠站）
CREATE TABLE route_locations (
    route_location_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    location_id INTEGER REFERENCES locations(location_id),
    sequence_number INTEGER NOT NULL, -- 站点在路线中的顺序
    is_terminal BOOLEAN DEFAULT false, -- 是否是终点站
    arrival_offset_minutes INTEGER, -- 从起点站发车后到达此站的时间（分钟）
    departure_wait_minutes INTEGER DEFAULT 0, -- 在此站停留时间（分钟）
    UNIQUE(route_id, sequence_number)
);

-- 车辆类型表
CREATE TABLE vehicle_types (
    vehicle_type_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 例如 "Standard Tram", "Articulated Bus"
    capacity INTEGER NOT NULL, -- 车辆载客量
    wheelchair_spaces INTEGER DEFAULT 0,
    bike_spaces INTEGER DEFAULT 0,
    description TEXT,
    image_url VARCHAR(255)
);

-- 车辆表
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_type_id INTEGER REFERENCES vehicle_types(vehicle_type_id),
    manufacture_year INTEGER,
    last_maintenance_date DATE,
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'maintenance', 'inactive'
);

-- 班次表（特定路线的具体发车计划）
CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id),
    day_type VARCHAR(20) NOT NULL, -- 'weekday', 'saturday', 'sunday', 'holiday'
    departure_time TIME NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id),
    notes TEXT
);

-- 两站之间的路段表
CREATE TABLE segments (
    segment_id SERIAL PRIMARY KEY,
    from_location_id INTEGER REFERENCES locations(location_id),
    to_location_id INTEGER REFERENCES locations(location_id),
    distance_km DECIMAL(5, 2) NOT NULL,
    typical_duration_minutes INTEGER NOT NULL,
    peak_duration_minutes INTEGER, -- 高峰期通常需要的时间
    late_night_duration_minutes INTEGER, -- 夜间通常需要的时间
    UNIQUE(from_location_id, to_location_id)
);

-- 用户收藏地点表
CREATE TABLE favorite_locations (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    location_name VARCHAR(100) NOT NULL,
    location_type VARCHAR(20) NOT NULL, -- 'home', 'work', 'custom'
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    address VARCHAR(255),
    icon VARCHAR(50) DEFAULT '📍', -- emoji 或图标标识
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户行程历史记录表
CREATE TABLE trip_history (
    trip_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    from_latitude DECIMAL(10, 7) NOT NULL,
    from_longitude DECIMAL(10, 7) NOT NULL,
    from_name VARCHAR(100),
    to_latitude DECIMAL(10, 7) NOT NULL,
    to_longitude DECIMAL(10, 7) NOT NULL,
    to_name VARCHAR(100),
    trip_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    distance_km DECIMAL(5, 2),
    transport_types TEXT, -- 使用的交通类型（可能是多种）
    route_numbers TEXT, -- 使用的路线编号（可能是多条）
    trip_status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'cancelled', 'in_progress'
    is_favorite BOOLEAN DEFAULT false -- 用户是否收藏此行程
);

-- 行程步骤表（一次行程的各个部分）
CREATE TABLE trip_steps (
    step_id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trip_history(trip_id),
    step_type VARCHAR(20) NOT NULL, -- 'walk', 'tram', 'bus', 'trolleybus', 'wait'
    step_order INTEGER NOT NULL,
    route_id INTEGER REFERENCES routes(route_id),
    from_location_id INTEGER REFERENCES locations(location_id),
    to_location_id INTEGER REFERENCES locations(location_id),
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    distance_km DECIMAL(5, 2),
    step_status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'completed', 'skipped'
    notes TEXT
);

-- 系统状态表（记录各个交通系统的运行状态）
CREATE TABLE system_status (
    status_id SERIAL PRIMARY KEY,
    transport_type_id INTEGER REFERENCES transport_types(transport_type_id),
    status VARCHAR(20) NOT NULL, -- 'good', 'minor_delays', 'major_delays', 'planned_works', 'suspended'
    details TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    related_route_id INTEGER REFERENCES routes(route_id),
    notification_type VARCHAR(20) NOT NULL, -- 'delay', 'service_change', 'reminder', 'system'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP
);

-- 实时位置更新表
CREATE TABLE real_time_updates (
    update_id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id),
    route_id INTEGER REFERENCES routes(route_id),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    speed_kmh DECIMAL(5, 2),
    heading INTEGER, -- 0-359 度
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_location_id INTEGER REFERENCES locations(location_id),
    delay_minutes INTEGER DEFAULT 0 -- 正值表示延迟，负值表示提前
);

-- 用户设置表
CREATE TABLE user_settings (
    setting_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) UNIQUE,
    preferred_transport_types TEXT[], -- 偏好的交通方式
    max_walking_minutes INTEGER DEFAULT 15,
    preferred_routes TEXT[], -- 偏好的路线
    avoid_transfers BOOLEAN DEFAULT false,
    accessible_routes_only BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'en',
    distance_unit VARCHAR(10) DEFAULT 'km', -- 'km' or 'miles'
    theme VARCHAR(20) DEFAULT 'light' -- 'light', 'dark', 'system'
);

-- 评论与反馈表
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    feedback_type VARCHAR(20) NOT NULL, -- 'route', 'location', 'vehicle', 'app', 'general'
    related_id INTEGER, -- 可能是route_id, location_id等，取决于feedback_type
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT true
);

-- 交通费用表
CREATE TABLE fare_types (
    fare_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 例如 "单程票", "日票", "月票"
    price DECIMAL(8, 2) NOT NULL,
    duration_minutes INTEGER, -- 有效时长，NULL表示不限时
    transfer_allowed BOOLEAN DEFAULT true,
    description TEXT
);

-- 叶卡捷琳堡特色地点表
CREATE TABLE yekaterinburg_landmarks (
    landmark_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'historical', 'cultural', 'business', 'educational', 'recreational'
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    address VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    website VARCHAR(255),
    opening_hours TEXT,
    popular_transport_routes TEXT, -- 前往该地点的流行路线
    location_id INTEGER REFERENCES locations(location_id) -- 最近的交通站点
);

-- 插入叶卡捷琳堡市的主要交通类型
INSERT INTO transport_types (name, icon_url, color, description) VALUES
('Tram', '/img2/有轨电车.png', '#e74c3c', '叶卡捷琳堡的有轨电车系统是俄罗斯第三大的电车网络'),
('Bus', '/img2/android-bus.png', '#3498db', '叶卡捷琳堡的公交车网络覆盖整个城市'),
('Trolleybus', '/img2/无轨电车.png', '#2ecc71', '无轨电车是叶卡捷琳堡公共交通系统的重要组成部分'),
('Metro', '/img2/地铁.png', '#9b59b6', '叶卡捷琳堡地铁是一条贯穿城市的单线地铁系统');

-- 插入一些示例路线（有轨电车）
INSERT INTO routes (route_number, name, transport_type_id, color, is_accessible, weekday_first_departure, weekday_last_departure, frequency_peak_minutes, frequency_offpeak_minutes, description) VALUES
('T1', '火车站 - 铸造厂', 1, '#e74c3c', true, '05:30', '23:45', 8, 15, '连接市中心与北部工业区的主要电车线路'),
('T4', '市中心环线', 1, '#e67e22', true, '06:00', '23:30', 10, 20, '环绕市中心的电车线路'),
('T5', '东西贯穿线', 1, '#f1c40f', true, '05:45', '00:15', 7, 12, '连接城市东西部的快速电车线路'),
('T8', '火车站 - 乌拉尔大学', 1, '#1abc9c', true, '06:15', '23:00', 12, 20, '连接火车站与大学区的电车线路');

-- 插入一些示例路线（公交车）
INSERT INTO routes (route_number, name, transport_type_id, color, is_accessible, weekday_first_departure, weekday_last_departure, frequency_peak_minutes, frequency_offpeak_minutes, description) VALUES
('A1', '机场快线', 2, '#3498db', true, '04:30', '01:30', 15, 30, '连接科尔佐沃机场与市中心的快速公交线路'),
('A22', '市中心 - 购物中心', 2, '#2980b9', true, '06:00', '22:00', 10, 15, '连接市中心与主要购物区的公交线路'),
('A50', '环城线', 2, '#34495e', true, '05:30', '23:00', 12, 20, '环绕城市外围的公交线路');

-- 插入一些重要地点（车站、站点）
INSERT INTO locations (name, type, latitude, longitude, address, description, is_accessible, has_wifi, has_ticket_machine) VALUES
('叶卡捷琳堡火车站', 'station', 56.858333, 60.602222, 'Vokzalnaya St. 22', '城市主要火车站，连接莫斯科和其他主要城市', true, true, true),
('1905年广场', 'station', 56.837778, 60.599444, 'Lenin Ave. & 8 March St.', '市中心主要交通枢纽', true, true, true),
('乌拉尔大学', 'stop', 56.844722, 60.654444, 'Mira St. 19', '服务乌拉尔联邦大学的主要站点', true, false, true),
('Mega购物中心', 'stop', 56.786111, 60.537778, 'Metallurgov St. 87', '大型购物中心站点', true, true, true),
('动物园', 'stop', 56.823056, 60.629722, 'Kuibyshev St. 44', '叶卡捷琳堡动物园附近站点', true, false, false),
('科尔佐沃机场', 'station', 56.743333, 60.802778, 'Airport Road 1', '叶卡捷琳堡国际机场站', true, true, true),
('Plotinka大坝', 'stop', 56.836389, 60.614167, 'Lenin Ave. 39', '城市历史中心地标附近站点', true, false, true),
('铸造厂', 'stop', 56.897222, 60.614444, 'Kosmonavtov Ave. 14', '北部工业区主要站点', false, false, false);

-- 插入一些路线站点关系（T1路线）
INSERT INTO route_locations (route_id, location_id, sequence_number, is_terminal, arrival_offset_minutes) VALUES
(1, 1, 1, true, 0), -- 火车站（起点）
(1, 2, 5, false, 12), -- 1905年广场
(1, 7, 9, false, 20), -- Plotinka大坝
(1, 8, 15, true, 35); -- 铸造厂（终点）

-- 插入一些路线站点关系（T8路线）
INSERT INTO route_locations (route_id, location_id, sequence_number, is_terminal, arrival_offset_minutes) VALUES
(4, 1, 1, true, 0), -- 火车站（起点）
(4, 2, 4, false, 10), -- 1905年广场
(4, 7, 7, false, 17), -- Plotinka大坝
(4, 3, 12, true, 30); -- 乌拉尔大学（终点）

-- 插入叶卡捷琳堡的一些地标
INSERT INTO yekaterinburg_landmarks (name, category, latitude, longitude, address, description, popular_transport_routes, location_id) VALUES
('叶卡捷琳堡城市池塘', 'recreational', 56.836944, 60.613889, 'Lenin Ave.', '城市中心的人工湖，由Iset河形成，周围有许多历史建筑', 'T4, T8, A22', 7),
('血液教堂', 'historical', 56.844722, 60.608889, 'Tolmacheva St. 34', '全名为流血的救世主教堂，建于1912年，纪念罗曼诺夫王朝最后的沙皇尼古拉二世和他的家人', 'T4, A22', 2),
('乌拉尔联邦大学', 'educational', 56.844444, 60.653889, 'Mira St. 19', '俄罗斯最古老和最负盛名的大学之一，前身为乌拉尔国立技术大学', 'T8', 3),
('叶卡捷琳堡歌剧院', 'cultural', 56.836667, 60.616111, 'Lenin Ave. 46A', '始建于1912年的新古典主义建筑，是俄罗斯最古老的歌剧院之一', 'T4, T8, A22', 7),
('叶卡捷琳堡电视塔', 'landmark', 56.844444, 60.614444, 'Visotsky St. 8', '城市的显著地标，虽然建设未完成但仍是城市天际线的重要组成部分', 'T4, A22', 7),
('Vysotsky摩天大楼', 'business', 56.835556, 60.617778, 'Malysheva St. 51', '乌拉尔地区最高的摩天大楼，拥有餐厅和观景台', 'T4, T8, A22', 7),
('Mega购物中心', 'shopping', 56.786389, 60.538056, 'Metallurgov St. 87', '城市最大的购物和娱乐中心之一', 'A22, A50', 4);

-- 插入一些车辆类型
INSERT INTO vehicle_types (name, capacity, wheelchair_spaces, bike_spaces) VALUES
('标准有轨电车', 120, 2, 0),
('铰接式有轨电车', 175, 3, 2),
('标准公交车', 85, 1, 0),
('铰接式公交车', 130, 2, 2),
('无轨电车', 95, 1, 0),
('地铁车厢', 200, 4, 4);

-- 插入费用类型
INSERT INTO fare_types (name, price, duration_minutes, transfer_allowed, description) VALUES
('单程票', 32.00, 60, true, '任何交通工具的单程票，含60分钟内换乘'),
('日票', 150.00, 1440, true, '24小时内无限次乘坐所有公共交通工具'),
('月票', 2800.00, 43200, true, '一个月内无限次乘坐所有公共交通工具');

-- 插入系统状态
INSERT INTO system_status (transport_type_id, status, details) VALUES
(1, 'good', '有轨电车网络正常运行，平均等待时间：4.5分钟'),
(2, 'minor_delays', '部分公交线路因道路施工有轻微延误'); 