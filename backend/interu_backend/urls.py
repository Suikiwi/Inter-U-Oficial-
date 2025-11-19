from django.urls import path, include
from accounts.views import PasswordResetConfirmView


urlpatterns = [
   
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
    path("auth/users/reset_password_confirm/", PasswordResetConfirmView.as_view()),

    path("", include("core.urls")),
    
]
