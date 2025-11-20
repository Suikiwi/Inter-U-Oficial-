from django.urls import path, include
from accounts.views import PasswordResetConfirmView,  CustomTokenView


urlpatterns = [
   
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
    path("auth/users/reset_password_confirm/", PasswordResetConfirmView.as_view()),
    path("auth/login/", CustomTokenView.as_view(), name="custom_login"),
    path("", include("core.urls")),
    
]
