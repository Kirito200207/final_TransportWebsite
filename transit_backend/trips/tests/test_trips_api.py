import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from trips.models import Trip, Route, Stop
from trips.serializers import TripSerializer, RouteSerializer

TRIPS_URL = reverse('trips:trip-list')
ROUTES_URL = reverse('trips:route-list')


def detail_url(trip_id):
    """返回行程详情URL"""
    return reverse('trips:trip-detail', args=[trip_id])


def route_detail_url(route_id):
    """返回路线详情URL"""
    return reverse('trips:route-detail', args=[route_id])


def create_user(**params):
    """创建并返回一个新用户"""
    defaults = {
        'email': 'user@example.com',
        'password': 'testpass123',
        'name': 'Test User',
    }
    defaults.update(params)
    return get_user_model().objects.create_user(**defaults)


def create_stop(**params):
    """创建并返回一个车站"""
    defaults = {
        'name': 'Test Stop',
        'latitude': 40.7128,
        'longitude': -74.0060,
        'address': '123 Test St',
    }
    defaults.update(params)
    return Stop.objects.create(**defaults)


def create_route(**params):
    """创建并返回一个路线"""
    defaults = {
        'name': 'Test Route',
        'description': 'Test Route Description',
    }
    defaults.update(params)
    route = Route.objects.create(**defaults)
    
    # 添加车站到路线
    stop1 = create_stop(name='Stop 1')
    stop2 = create_stop(name='Stop 2')
    route.stops.add(stop1, stop2)
    
    return route


def create_trip(user, **params):
    """创建并返回一个行程"""
    route = create_route()
    
    defaults = {
        'route': route,
        'departure_time': datetime.datetime.now() + datetime.timedelta(hours=1),
        'arrival_time': datetime.datetime.now() + datetime.timedelta(hours=2),
        'available_seats': 50,
        'price': 10.00,
    }
    defaults.update(params)
    
    return Trip.objects.create(user=user, **defaults)


class PublicTripApiTests(TestCase):
    """测试未认证用户的行程API访问"""

    def setUp(self):
        self.client = APIClient()

    def test_auth_required(self):
        """测试需要认证才能访问端点"""
        res = self.client.get(TRIPS_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PrivateTripApiTests(TestCase):
    """测试已认证用户的行程API请求"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(self.user)

    def test_retrieve_trips(self):
        """测试获取行程列表"""
        create_trip(user=self.user)
        create_trip(user=self.user)

        res = self.client.get(TRIPS_URL)

        trips = Trip.objects.all().order_by('-id')
        serializer = TripSerializer(trips, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_trip_list_limited_to_user(self):
        """测试返回的行程列表限于已认证用户"""
        other_user = create_user(email='other@example.com')
        create_trip(user=other_user)
        create_trip(user=self.user)

        res = self.client.get(TRIPS_URL)

        trips = Trip.objects.filter(user=self.user)
        serializer = TripSerializer(trips, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_get_trip_detail(self):
        """测试获取行程详情"""
        trip = create_trip(user=self.user)

        url = detail_url(trip.id)
        res = self.client.get(url)

        serializer = TripSerializer(trip)
        self.assertEqual(res.data, serializer.data)

    def test_create_trip(self):
        """测试创建行程"""
        route = create_route()
        
        payload = {
            'route': route.id,
            'departure_time': '2023-01-01T12:00:00Z',
            'arrival_time': '2023-01-01T14:00:00Z',
            'available_seats': 40,
            'price': 15.00,
        }
        res = self.client.post(TRIPS_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        trip = Trip.objects.get(id=res.data['id'])
        self.assertEqual(trip.user, self.user)
        self.assertEqual(trip.route.id, payload['route'])
        self.assertEqual(trip.available_seats, payload['available_seats'])

    def test_partial_update(self):
        """测试部分更新行程"""
        original_price = 10.00
        trip = create_trip(
            user=self.user,
            price=original_price,
            available_seats=30
        )

        payload = {'available_seats': 25}
        url = detail_url(trip.id)
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        trip.refresh_from_db()
        self.assertEqual(trip.available_seats, payload['available_seats'])
        self.assertEqual(trip.price, original_price)

    def test_full_update(self):
        """测试完全更新行程"""
        trip = create_trip(user=self.user)
        route = create_route(name='New Route')
        
        payload = {
            'route': route.id,
            'departure_time': '2023-02-01T10:00:00Z',
            'arrival_time': '2023-02-01T12:00:00Z',
            'available_seats': 20,
            'price': 20.00,
        }
        url = detail_url(trip.id)
        res = self.client.put(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        trip.refresh_from_db()
        self.assertEqual(trip.route.id, payload['route'])
        self.assertEqual(trip.available_seats, payload['available_seats'])
        self.assertEqual(float(trip.price), payload['price'])

    def test_delete_trip(self):
        """测试删除行程"""
        trip = create_trip(user=self.user)

        url = detail_url(trip.id)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Trip.objects.filter(id=trip.id).exists())


class RouteApiTests(TestCase):
    """测试路线API"""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user(is_staff=True)
        self.client.force_authenticate(self.user)

    def test_retrieve_routes(self):
        """测试获取路线列表"""
        create_route()
        create_route(name='Route 2')

        res = self.client.get(ROUTES_URL)

        routes = Route.objects.all().order_by('-name')
        serializer = RouteSerializer(routes, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_create_route(self):
        """测试创建路线"""
        stop1 = create_stop(name='Stop A')
        stop2 = create_stop(name='Stop B')
        
        payload = {
            'name': 'New Route',
            'description': 'New Route Description',
            'stops': [stop1.id, stop2.id],
        }
        res = self.client.post(ROUTES_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        route = Route.objects.get(id=res.data['id'])
        self.assertEqual(route.name, payload['name'])
        self.assertEqual(route.stops.count(), 2) 