
SITE_ID = 1
X_FRAME_OPTIONS = 'DENY'
from dotenv import load_dotenv
load_dotenv()
def env(key, default=None):
    return os.environ.get(key, default)

from pathlib import Path
from datetime import timedelta
import os


CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": ("'self'",),
        "script-src": ("'self'",),
        "style-src": ("'self'",),
    }
}

BASE_DIR = Path(__file__).resolve().parent.parent

# ==================== SECURITY ====================
SECRET_KEY = 'django-insecure-etnirkf_vzw6vn3^r+qme2yl4#sdkcnmjctnq#(6gt_v%bez*m'
DEBUG = True
ALLOWED_HOSTS = ['*']

# ==================== FRONTEND URL ====================
FRONTEND_URL = "http://localhost:5173"

# ==================== APPLICATION DEFINITION ====================
INSTALLED_APPS = [
    'corsheaders',
    'daphne',      
    'channels',
    'csp',
    'core',
    'accounts',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'djoser',
    'django.contrib.sites',  # Necesario para djoser
]



MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'core.middleware.SecurityHeadersMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'csp.middleware.CSPMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'interu_backend.urls'
WSGI_APPLICATION = 'interu_backend.wsgi.application'
ASGI_APPLICATION = "interu_backend.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}
# ==================== TEMPLATES ====================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ==================== DATABASE ====================
DATABASES = {
    'default': {
        'ENGINE': env('DJANGO_DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': env('DJANGO_DB_NAME', BASE_DIR / 'db.sqlite3'),
        'USER': env('DJANGO_DB_USER', ''),
        'PASSWORD': env('DJANGO_DB_PASSWORD', ''),
        'HOST': env('DJANGO_DB_HOST', ''),
        'PORT': env('DJANGO_DB_PORT', ''),
    }
}

# ==================== PASSWORD VALIDATION ====================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
    {'NAME': 'accounts.validators.PoliticaContrasenaValidator'},
]

# ==================== INTERNATIONALIZATION ====================
LANGUAGE_CODE = 'es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ==================== STATIC FILES ====================
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== CUSTOM USER MODEL ====================
AUTH_USER_MODEL = 'accounts.User'

# ==================== CORS ====================
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# ==================== REST FRAMEWORK & JWT ====================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ==================== DJOSER CONFIGURATION ====================
DJOSER = {
    "USER_ID_FIELD": "id",
    "LOGIN_FIELD": "email",
    "ACTIVATION_URL": "activate/{uid}/{token}",
    "PASSWORD_RESET_CONFIRM_URL": "reset-password-confirm/{uid}/{token}",

    "DOMAIN": "localhost:5173",
    "SITE_NAME": "Inter-U",

    "SEND_ACTIVATION_EMAIL": True,   # habilita envío de correo de activación
    "SEND_CONFIRMATION_EMAIL": False,

    "PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND": True,
    "PASSWORD_RESET_TIMEOUT": 1800,

    "SERIALIZERS": {
        "user_create": "accounts.serializers.CustomUserCreateSerializer",
        "user": "accounts.serializers.CustomUserSerializer",
        "password_reset_confirm": "accounts.serializers.LoggingPasswordResetConfirmSerializer",
    },
}

    
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'interusihu@gmail.com'
EMAIL_HOST_PASSWORD = 'kkymiwcxdwnybyfx'  #  App Password de Google
DEFAULT_FROM_EMAIL = 'interusihu@gmail.com'

# ==================== LOGGING (DEBUG) ====================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'password_reset_debug.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'accounts.serializers': {  # Logger específico para tu serializer
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'djoser': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}