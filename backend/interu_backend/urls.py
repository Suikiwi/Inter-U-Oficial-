from django.contrib import admin
from django.urls import path, include
from accounts.views import PasswordResetConfirmView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutas de autenticación con djoser
    path('api/auth/', include('djoser.urls')),                # registro, activación, reset password, etc.
    path('api/auth/', include('djoser.urls.jwt')),    
    path("api/auth/users/reset_password_confirm/", PasswordResetConfirmView.as_view()),

    # Rutas de tu aplicación core
    path('api/', include('core.urls')),
]
