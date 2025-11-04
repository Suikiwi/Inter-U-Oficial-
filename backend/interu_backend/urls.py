from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutas de autenticación con djoser
    path('api/auth/', include('djoser.urls')),                # registro, activación, reset password, etc.
    path('api/auth/', include('djoser.urls.jwt')),            # login con JWT, refresh, verify

    # Rutas de tu aplicación core
    path('api/', include('core.urls')),
]
