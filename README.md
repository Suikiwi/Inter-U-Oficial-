Inter-U — Plataforma de Intercambio de Habilidades Universitarias

Inter-U es una plataforma que permite a estudiantes publicar habilidades, iniciar chats, completar intercambios y calificarse mutuamente. Este proyecto incluye:

Backend Django + Django REST Framework + Channels (WebSockets) Frontend Web con React + Vite App Móvil con React Native + Expo Base de datos PostgreSQL Sistema de notificaciones Sistema de calificaciones Chat en tiempo real

Requisitos

Backend: Python 3.10+ PostgreSQL 14+ pip virtualenv

Frontend Web: Node 18+ npm

Móvil: Expo CLI Expo Go (Android/iOS)

Crear entorno virtual

python -m venv venv source venv/bin/activate (Linux/Mac) venv\Scripts\activate (Windows)

Instalar dependencias del backend

pip install Django djangorestframework django-cors-headers django-csp djangorestframework-simplejwt djoser channels daphne python-dotenv Pillow psycopg2-binary

Instalar dependencias del frontend web

npm install axios@1.13.2 lucide-react@0.553.0 react@19.2.0 react-dom@19.2.0 react-router-dom@7.9.6 socket.io-client@4.8.1

Dependencias de desarrollo:

npm install -D @eslint/js@9.39.1 @tailwindcss/postcss@4.1.17 @types/axios@0.9.36 @types/node@24.10.1 @types/react@19.2.4 @types/react-dom@19.2.3 @types/react-router-dom@5.3.3 @vitejs/plugin-react@5.1.1 autoprefixer@10.4.22 eslint@9.39.1 eslint-plugin-react-hooks@5.2.0 eslint-plugin-react-refresh@0.4.24 globals@16.5.0 postcss@8.5.6 tailwindcss@4.1.17 typescript@5.9.3 typescript-eslint@8.46.4 vite@6.4.1

Instalar dependencias del móvil

npm install npm install lucide-react

Configurar PostgreSQL

psql -U postgres

Dentro de PostgreSQL:

CREATE DATABASE interu_db; CREATE USER interu_user WITH PASSWORD 'interu_pass'; GRANT ALL PRIVILEGES ON DATABASE interu_db TO interu_user;

Configurar settings.py para PostgreSQL

DATABASES = { 'default': { 'ENGINE': 'django.db.backends.postgresql', 'NAME': 'interu_db', 'USER': 'interu_user', 'PASSWORD': 'interu_pass', 'HOST': 'localhost', 'PORT': '5432', } }

Aplicar migraciones

python manage.py migrate

Cargar datos reales

python manage.py loaddata datos_reales.json

Si hay errores:

python manage.py flush python manage.py migrate python manage.py loaddata datos_reales.json

Crear administrador

python manage.py shell

from core.models import User

admin = User.objects.create_user( email="admin@inacapmail.cl", password="admin123", acepta_politicas=True ) admin.is_active = True admin.is_estudiante = False admin.is_admin_interu = True admin.is_staff = True admin.is_superuser = False admin.save()

Levantar el backend (ASGI + WebSockets)

daphne -b 0.0.0.0 -p 8000 interu_backend.asgi:application

Levantar el frontend web

npm run dev

Corre en: http://localhost:5173

Levantar la app móvil

npm run start

Expo abrirá en: exp://TU_IP:8081

Asegúrate de que api.js tenga la IP local correcta:

const BASE_URL = "http://192.168.1.X:8000/";

Checklist final

PostgreSQL funcionando Migraciones aplicadas Datos reales cargados Backend ASGI funcionando Web funcionando Móvil funcionando WebSockets funcionando Calificaciones funcionando Notificaciones funcionando

Notas importantes

Si tu IP cambia, debes actualizar api.js en móvil. Daphne debe usarse siempre en desarrollo real (no runserver). datos_reales.json contiene toda la data real del proyecto. No necesitas volver a crear tablas manualmente.

Estructura del proyecto

interu_backend/ core/ publicaciones/ chats/ perfiles/ notificaciones/ interu_backend/asgi.py settings.py

interu_web/ src/ components/ pages/ api/

interu_mobile/ App.js api.js