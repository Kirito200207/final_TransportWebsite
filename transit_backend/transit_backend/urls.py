"""
URL configuration for transit_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.http import HttpResponse

def api_root(request):
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Transit API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #333;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                margin-bottom: 10px;
            }
            a {
                color: #0066cc;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <h1>Transit API</h1>
        <p>Welcome to the Transit API. Please choose one of the following options:</p>
        <ul>
            <li><a href="/admin/">Admin Interface</a> - Manage data and users</li>
            <li><a href="/api/">API Endpoints</a> - Access the API directly</li>
        </ul>
    </body>
    </html>
    """
    return HttpResponse(html_content)

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
