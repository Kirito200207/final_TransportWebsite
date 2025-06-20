# Transit API Documentation

This document provides information about the available API endpoints for the Transit application.

## Base URL

All API endpoints are prefixed with `/api/`.

## Authentication

Most endpoints require authentication. Use the following endpoints for authentication:

- `POST /api/auth/login/`: Login with username and password
- `POST /api/register/`: Register a new user
- `POST /api/auth/logout/`: Logout current user

For authenticated requests, include the session cookie in your requests.

### Register a new user

```
POST /api/register/
```

Request body:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login

```
POST /api/auth/login/
```

Request body:
```json
{
  "username": "newuser",
  "password": "securepassword"
}
```

### Logout

```
POST /api/auth/logout/
```

## Password Management

### Request password reset

```
POST /api/request-password-reset/
```

Request body:
```json
{
  "email": "user@example.com"
}
```

### Reset password

```
POST /api/reset-password/{uidb64}/{token}/
```

Request body:
```json
{
  "password": "newpassword"
}
```

### Change password

```
POST /api/change-password/
```

Request body:
```json
{
  "old_password": "currentpassword",
  "new_password": "newpassword"
}
```

## Admin Dashboard

Admin users can access a dashboard with system statistics and overview:

```
GET /api/admin-dashboard/
```

Response:
```json
{
  "stats": {
    "users_count": 10,
    "transport_types_count": 2,
    "routes_count": 4,
    "active_routes_count": 3,
    "stops_count": 8,
    "schedules_count": 120,
    "notifications_count": 25,
    "unread_notifications_count": 8,
    "system_status": {
      "good": 1,
      "warning": 1,
      "bad": 0
    }
  },
  "top_routes": [
    {
      "id": 1,
      "route_number": "T5",
      "name": "West Mall - Central Station - East Station",
      "users_count": 5
    },
    "..."
  ],
  "latest_notifications": [
    "..."
  ],
  "system_statuses": [
    "..."
  ],
  "timestamp": "2025-05-30T14:30:00Z"
}
```

## Transport Types

### Get all transport types

```
GET /api/transport-types/
```

Response:
```json
[
  {
    "id": 1,
    "name": "Tram",
    "icon": "/img2/有轨电车.png"
  },
  {
    "id": 2,
    "name": "Bus",
    "icon": "/img2/android-bus.png"
  }
]
```

## Routes

### Get all routes

```
GET /api/routes/
```

Query parameters:
- `transport_type`: Filter by transport type ID
- `is_active`: Filter by active status (true/false)

Response:
```json
[
  {
    "id": 1,
    "route_number": "T5",
    "name": "West Mall - Central Station - East Station",
    "transport_type": 1,
    "transport_type_details": {
      "id": 1,
      "name": "Tram",
      "icon": "/img2/有轨电车.png"
    },
    "is_active": true,
    "frequency": "Every 8 min",
    "operating_cars": "4/5",
    "stops": [
      {
        "id": 1,
        "route": 1,
        "stop": 3,
        "stop_details": {
          "id": 3,
          "name": "West Mall",
          "latitude": 56.8329,
          "longitude": 60.5957
        },
        "order": 1
      },
      "..."
    ]
  },
  "..."
]
```

### Get a specific route

```
GET /api/routes/{id}/
```

## Stops

### Get all stops

```
GET /api/stops/
```

### Get nearby stops

```
GET /api/stops/nearby/?lat=56.8389&lng=60.6057&radius=1.0
```

Query parameters:
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in kilometers (default: 1.0)

Response:
```json
[
  {
    "stop": {
      "id": 1,
      "name": "Central Station",
      "latitude": 56.8389,
      "longitude": 60.6057
    },
    "distance": 0.0
  },
  "..."
]
```

## Schedules

### Get schedules

```
GET /api/schedules/
```

Query parameters:
- `route`: Filter by route ID
- `stop`: Filter by stop ID
- `day`: Filter by day of week (0-6, where 0 is Monday)

### Get next arrivals

```
GET /api/schedules/next_arrivals/?route=1&stop=1
```

Query parameters:
- `route`: Route ID (required)
- `stop`: Stop ID (required)

Response:
```json
{
  "next_arrival": {
    "id": 123,
    "route": 1,
    "route_details": {
      "id": 1,
      "route_number": "T5",
      "name": "West Mall - Central Station - East Station"
    },
    "stop": 1,
    "stop_details": {
      "id": 1,
      "name": "Central Station",
      "latitude": 56.8389,
      "longitude": 60.6057
    },
    "arrival_time": "14:30:00",
    "day_of_week": 0
  },
  "minutes_left": 15
}
```

## System Status

### Get all system statuses

```
GET /api/system-status/
```

### Get current system status

```
GET /api/system-status/current/
```

Response:
```json
{
  "statuses": [
    {
      "id": 1,
      "transport_type": 1,
      "transport_type_details": {
        "id": 1,
        "name": "Tram",
        "icon": "/img2/有轨电车.png"
      },
      "status": "good",
      "details": "All tram lines operating normally. Average wait time: 4.5 min.",
      "last_updated": "2025-05-30T14:30:00Z"
    },
    "..."
  ],
  "grouped": {
    "Tram": [
      "..."
    ],
    "Bus": [
      "..."
    ]
  },
  "last_updated": "2025-05-30T14:30:00Z"
}
```

## Notifications

### Get user notifications

```
GET /api/notifications/
```

### Mark notification as read

```
POST /api/notifications/{id}/mark_read/
```

### Mark all notifications as read

```
POST /api/notifications/mark_all_read/
```

## User Routes

### Get user routes

```
GET /api/user-routes/
```

### Create a user route

```
POST /api/user-routes/
```

Request body:
```json
{
  "route": 1,
  "from_stop": 1,
  "to_stop": 3,
  "name": "Work commute",
  "is_favorite": true
}
```

### Toggle favorite status

```
POST /api/user-routes/{id}/toggle_favorite/
```

## User Settings

### Get user settings

```
GET /api/user-settings/
```

### Update user settings

```
PUT /api/user-settings/{id}/
```

Request body:
```json
{
  "reminder_enabled": true,
  "notification_enabled": false
}
```

## User Profile

### Get user profile

```
GET /api/profile/
```

For admin users, can specify a user ID:
```
GET /api/profile/?user_id=2
```

Response:
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "settings": {
    "id": 1,
    "user": 1,
    "reminder_enabled": true,
    "notification_enabled": true
  },
  "routes": [
    "..."
  ],
  "notifications": [
    "..."
  ]
}
```

## Search

### Search routes and stops

```
GET /api/search/?q=central
```

Query parameters:
- `q`: Search query (required)

Response:
```json
{
  "routes": [
    "..."
  ],
  "stops": [
    "..."
  ]
}
```

# 缓存功能

本API使用Redis缓存来提高性能，减少数据库负载。

## 缓存策略

### 缓存的数据

以下是主要缓存的数据类型及其缓存时间：

| 数据类型 | 缓存时间 | 缓存键前缀 |
|---------|---------|-----------|
| 路线列表 | 30分钟 | RouteViewSet |
| 站点列表 | 60分钟 | StopViewSet |
| 附近站点 | 5分钟 | nearby |
| 时刻表 | 15分钟 | ScheduleViewSet |
| 即将到达的车辆 | 5分钟 | upcoming |
| 系统状态 | 5分钟 | SystemStatusViewSet |
| 当前系统状态 | 1分钟 | current |
| 首页数据 | 5分钟 | homepage_data |

### 缓存失效

当数据更新时（创建、更新、删除操作），相关的缓存会自动失效。例如，当路线信息更新时，路线列表缓存将被清除。

### 缓存容错

系统实现了多级缓存策略：

1. Redis缓存作为主要缓存后端
2. 本地内存缓存作为备用缓存
3. 当缓存不可用时，自动回退到数据库查询

## 缓存相关API

### 首页数据API

```
GET /api/homepage-data/
```

返回缓存的首页数据，包括热门路线、系统状态和通知。

### 路线列表API

```
GET /api/routes/
```

返回缓存的路线列表。

### 站点列表API

```
GET /api/stops/
```

返回缓存的站点列表。

### 附近站点API

```
GET /api/stops/nearby/?lat={latitude}&lng={longitude}&radius={radius}
```

返回缓存的附近站点数据。

### 即将到达的车辆API

```
GET /api/schedules/upcoming/?stop={stop_id}&route={route_id}&limit={limit}
```

返回缓存的即将到达的车辆信息。

### 当前系统状态API

```
GET /api/system-status/current/
```

返回缓存的当前系统状态信息。 