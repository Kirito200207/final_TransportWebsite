from django.db import models
from django.contrib.auth.models import User

class TransportType(models.Model):
    """Transport Type Model"""
    name = models.CharField(max_length=50, verbose_name="Transport Type Name")
    icon = models.CharField(max_length=255, verbose_name="Icon Path")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Transport Type"
        verbose_name_plural = "Transport Types"

class Route(models.Model):
    """Route Model"""
    route_number = models.CharField(max_length=20, verbose_name="Route Number")
    name = models.CharField(max_length=100, verbose_name="Route Name")
    transport_type = models.ForeignKey(TransportType, on_delete=models.CASCADE, related_name="routes", verbose_name="Transport Type")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    frequency = models.CharField(max_length=50, verbose_name="Departure Frequency")
    operating_cars = models.CharField(max_length=20, verbose_name="Operating Vehicles")
    
    def __str__(self):
        return f"{self.route_number} - {self.name}"
    
    class Meta:
        verbose_name = "Route"
        verbose_name_plural = "Routes"

class Stop(models.Model):
    """Stop Model"""
    name = models.CharField(max_length=100, verbose_name="Stop Name")
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Stop"
        verbose_name_plural = "Stops"

class RouteStop(models.Model):
    """Route Stop Relationship Model"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="stops", verbose_name="Route")
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name="routes", verbose_name="Stop")
    order = models.IntegerField(verbose_name="Stop Order")
    
    class Meta:
        verbose_name = "Route Stop"
        verbose_name_plural = "Route Stops"
        ordering = ['order']
        unique_together = ['route', 'order']

class Schedule(models.Model):
    """Schedule Model"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="schedules", verbose_name="Route")
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name="schedules", verbose_name="Stop")
    arrival_time = models.TimeField(verbose_name="Arrival Time")
    day_of_week = models.IntegerField(choices=[(i, day) for i, day in enumerate(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])], verbose_name="Day of Week")
    
    class Meta:
        verbose_name = "Schedule"
        verbose_name_plural = "Schedules"
        ordering = ['day_of_week', 'arrival_time']

class SystemStatus(models.Model):
    """System Status Model"""
    STATUS_CHOICES = [
        ('good', 'Good'),
        ('warning', 'Minor Delay'),
        ('bad', 'Severe Delay'),
    ]
    
    transport_type = models.ForeignKey(TransportType, on_delete=models.CASCADE, related_name="statuses", verbose_name="Transport Type")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='good', verbose_name="Status")
    details = models.TextField(verbose_name="Details")
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Last Updated")
    
    def __str__(self):
        return f"{self.transport_type.name} - {self.get_status_display()}"
    
    class Meta:
        verbose_name = "System Status"
        verbose_name_plural = "System Statuses"

class Notification(models.Model):
    """Notification Model"""
    title = models.CharField(max_length=100, verbose_name="Title")
    message = models.TextField(verbose_name="Message Content")
    transport_type = models.ForeignKey(TransportType, on_delete=models.SET_NULL, null=True, blank=True, related_name="notifications", verbose_name="Related Transport Type")
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name="notifications", verbose_name="Related Route")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    is_read = models.BooleanField(default=False, verbose_name="Is Read")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications", verbose_name="User")
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

class UserRoute(models.Model):
    """User Frequent Route Model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="routes", verbose_name="User")
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="users", verbose_name="Route")
    from_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name="from_routes", verbose_name="Origin Stop")
    to_stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name="to_routes", verbose_name="Destination Stop")
    name = models.CharField(max_length=100, verbose_name="Route Alias", blank=True)
    is_favorite = models.BooleanField(default=False, verbose_name="Is Favorite")
    
    def __str__(self):
        return f"{self.user.username} - {self.route.route_number} ({self.from_stop.name} -> {self.to_stop.name})"
    
    class Meta:
        verbose_name = "User Route"
        verbose_name_plural = "User Routes"

class UserSettings(models.Model):
    """User Settings Model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings", verbose_name="User")
    reminder_enabled = models.BooleanField(default=True, verbose_name="Enable Reminders")
    notification_enabled = models.BooleanField(default=True, verbose_name="Enable Notifications")
    
    def __str__(self):
        return f"{self.user.username}'s Settings"
    
    class Meta:
        verbose_name = "User Settings"
        verbose_name_plural = "User Settings"

class Reminder(models.Model):
    """Reminder Model"""
    REPEAT_CHOICES = [
        ('once', 'One-time'),
        ('daily', 'Daily'),
        ('weekdays', 'Weekdays'),
        ('weekends', 'Weekends'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reminders", verbose_name="User")
    title = models.CharField(max_length=100, verbose_name="Reminder Title")
    description = models.TextField(verbose_name="Reminder Content", blank=True)
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name="reminders", verbose_name="Related Route")
    from_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name="from_reminders", verbose_name="Origin Stop")
    to_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name="to_reminders", verbose_name="Destination Stop")
    reminder_time = models.DateTimeField(verbose_name="Reminder Time")
    advance_notice = models.IntegerField(default=15, verbose_name="Advance Notice Time (minutes)")
    repeat_type = models.CharField(max_length=20, choices=REPEAT_CHOICES, default='once', verbose_name="Repeat Type")
    repeat_days = models.CharField(max_length=50, blank=True, verbose_name="Repeat Days (e.g., for weekly, 1,3,5 means Monday, Wednesday, Friday)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Status")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        verbose_name = "Reminder"
        verbose_name_plural = "Reminders"
        ordering = ['reminder_time']

class RouteStatus(models.Model):
    """Route Real-time Status Model"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="status_updates", verbose_name="Route")
    current_load = models.IntegerField(default=0, verbose_name="Current Load Percentage")
    delay_minutes = models.IntegerField(default=0, verbose_name="Delay Time (minutes)")
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Last Updated")
    operating_status = models.CharField(
        max_length=20,
        choices=[
            ('normal', 'Normal Operation'),
            ('delayed', 'Delayed'),
            ('suspended', 'Service Suspended'),
            ('cancelled', 'Service Cancelled'),
        ],
        default='normal',
        verbose_name="Operating Status"
    )
    message = models.TextField(blank=True, verbose_name="Status Message")
    
    def __str__(self):
        return f"{self.route} - {self.get_operating_status_display()}"
    
    class Meta:
        verbose_name = "Route Status"
        verbose_name_plural = "Route Statuses"
        ordering = ['-last_updated']

class VehiclePosition(models.Model):
    """Vehicle Position Model"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="vehicles", verbose_name="Route")
    vehicle_id = models.CharField(max_length=50, verbose_name="Vehicle ID")
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    heading = models.FloatField(default=0, verbose_name="Heading Angle")
    speed = models.FloatField(default=0, verbose_name="Speed (km/h)")
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Last Updated")
    next_stop = models.ForeignKey(Stop, on_delete=models.SET_NULL, null=True, related_name="approaching_vehicles", verbose_name="Next Stop")
    estimated_arrival = models.DateTimeField(null=True, blank=True, verbose_name="Estimated Arrival Time")
    
    def __str__(self):
        return f"{self.route} - Vehicle {self.vehicle_id}"
    
    class Meta:
        verbose_name = "Vehicle Position"
        verbose_name_plural = "Vehicle Positions"
        ordering = ['-last_updated']

class ExternalAPIKey(models.Model):
    """External API Key Model"""
    name = models.CharField(max_length=100, verbose_name="API Name")
    key = models.CharField(max_length=255, verbose_name="API Key")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Expiration Time")
    allowed_ips = models.TextField(blank=True, verbose_name="Allowed IP Addresses (comma-separated)")
    rate_limit = models.IntegerField(default=100, verbose_name="Hourly Request Limit")
    
    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"
    
    class Meta:
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"
