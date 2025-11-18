from django import views
from django.urls import path
from .views import (
    # Publicaciones
    MisChatsView, PublicacionListCreateView, PublicacionDetailView,
    PublicacionUpdateView, PublicacionDeleteView, MisPublicacionesView,
    # Chats y mensajes
    ChatListCreateView, ChatDetailView, CompletarIntercambioView, MensajeListCreateView,
    # Calificaciones
    CalificacionChatCreateView,
    # Notificaciones
    NotificacionListView, MarcarNotificacionLeidaView, MarcarTodasNotificacionesLeidasView,
    # Perfil
    PerfilDetailView, CrearPerfilView, EliminarMiCuenta,
    # Reportes
    CrearReporteView, ListarReportesView, ModerarReporteView, 
    # Consentimiento
    verificar_consentimiento ,registrar_consentimiento
    
)

urlpatterns = [
    
 

    # Perfil
    path('perfil/', PerfilDetailView.as_view(), name='perfil-estudiante'),
    path('perfil/crear/', CrearPerfilView.as_view(), name='crear-perfil'),
    path("perfil/eliminar/", EliminarMiCuenta.as_view(), name="perfil-eliminar"),

    # Publicaciones
    path('publicaciones/', PublicacionListCreateView.as_view(), name='publicaciones-list-create'),
    path('publicaciones/mias/', MisPublicacionesView.as_view(), name='mis-publicaciones'),
    path('publicaciones/<int:pk>/', PublicacionDetailView.as_view(), name='publicaciones-detail'),
    path('publicaciones/<int:pk>/editar/', PublicacionUpdateView.as_view(), name='publicaciones-update'),
    path('publicaciones/<int:pk>/eliminar/', PublicacionDeleteView.as_view(), name='publicaciones-delete'),

    # Chats
    path('chats/', ChatListCreateView.as_view(), name='chat-list-create'),
    path('chats/<int:pk>/', ChatDetailView.as_view(), name='chat-detail'),
    path('chats/<int:pk>/completar/', CompletarIntercambioView.as_view(), name='chat-completar'),

    # Mensajes
    path('mensajes/', MensajeListCreateView.as_view(), name='mensaje-list-create'),

    # Calificaciones
    path('calificaciones-chat/', CalificacionChatCreateView.as_view(), name='calificacion-chat'),

    # Notificaciones
    path('notificaciones/', NotificacionListView.as_view(), name='notificacion-list'),
    path('notificaciones/<int:pk>/marcar-leida/', MarcarNotificacionLeidaView.as_view(), name='notificacion-marcar-leida'),
    path('notificaciones/marcar-todas-leidas/', MarcarTodasNotificacionesLeidasView.as_view(), name='notificaciones-marcar-todas-leidas'),

    # Reportes
    path('reportes/', CrearReporteView.as_view(), name='crear-reporte'),
    path('reportes/listar/', ListarReportesView.as_view(), name='listar-reportes'),
    path('reportes/<int:pk>/moderar/', ModerarReporteView.as_view(), name='moderar-reporte'),
    
    path('chats/mios/', MisChatsView.as_view(), name='mis-chats'),
    # Consentimineto
    path("consentimiento/verificar/", verificar_consentimiento),
    path("consentimiento/registrar/", registrar_consentimiento),

]
