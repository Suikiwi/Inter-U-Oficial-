from django import views
from django.urls import path
from .views import (
    # Publicaciones
    CalificacionesRecibidasPorPerfilView, CalificacionesRecibidasPorUsuarioView, PublicacionListCreateView, PublicacionDetailView,
    PublicacionUpdateView, PublicacionDeleteView, MisPublicacionesView,
    # Chats y mensajes
    ChatListCreateView, ChatDetailView, CompletarIntercambioView, MensajeListCreateView, MisChatsView, IniciarChatView,
    # Calificaciones
    CalificacionChatCreateView, CalificacionesRecibidasView,
    # Notificaciones
    NotificacionListView, MarcarNotificacionLeidaView, MarcarTodasNotificacionesLeidasView,
    # Perfil
    PerfilDetailView, CrearPerfilView, EliminarMiCuenta,
    # Reportes
    CrearReporteView, ListarReportesView, ModerarReporteView, PerfilPublicoPorUsuarioView,
    # Consentimiento
    verificar_consentimiento ,registrar_consentimiento
    
)

urlpatterns = [
    
 

    # Perfil
    path('perfil/', PerfilDetailView.as_view(), name='perfil-estudiante'),
    path('perfiles/usuario/<int:usuario_id>/', PerfilPublicoPorUsuarioView.as_view(), name='perfil-publico-por-usuario'),
    path('perfil/crear/', CrearPerfilView.as_view(), name='crear-perfil'),
    path("perfil/eliminar/", EliminarMiCuenta.as_view(), name="perfil-eliminar"),

    # Publicaciones
    path('publicaciones/', PublicacionListCreateView.as_view(), name='publicaciones-list-create'),
    path('publicaciones/mias/', MisPublicacionesView.as_view(), name='mis-publicaciones'),
    path('publicaciones/<int:pk>/', PublicacionDetailView.as_view(), name='publicaciones-detail'),
    path('publicaciones/<int:pk>/editar/', PublicacionUpdateView.as_view(), name='publicaciones-update'),
    path('publicaciones/<int:pk>/eliminar/', PublicacionDeleteView.as_view(), name='publicaciones-delete'),
     path("publicaciones/<int:publicacion_id>/iniciar-chat/", IniciarChatView.as_view(), name="iniciar-chat"),

    # Chats
    path('chats/', ChatListCreateView.as_view(), name='chat-list-create'),
    path('chats/<int:pk>/', ChatDetailView.as_view(), name='chat-detail'),
    path('chats/<int:pk>/completar/', CompletarIntercambioView.as_view(), name='chat-completar'),
    path("chats/mios/", MisChatsView.as_view(), name="mis-chats"),

    # Mensajes
    path('mensajes/', MensajeListCreateView.as_view(), name='mensaje-list-create'),

    # Calificaciones
    path('calificaciones-chat/', CalificacionChatCreateView.as_view(), name='calificacion-chat'),
    path("perfil/<int:pk>/calificaciones/", CalificacionesRecibidasView.as_view(), name="calificaciones-recibidas"),
    # Vista por usuario
    path("usuarios/<int:pk>/calificaciones/", CalificacionesRecibidasPorUsuarioView.as_view(), name="calificaciones-recibidas-usuario"),
    # Vista por perfil (para móvil, con ruta distinta para no chocar)
    path("perfil/<int:perfil_id>/calificaciones-recibidas/", CalificacionesRecibidasPorPerfilView.as_view(), name="calificaciones-recibidas-perfil"),


    # Notificaciones
    path('notificaciones/', NotificacionListView.as_view(), name='notificacion-list'),
    path('notificaciones/<int:pk>/marcar-leida/', MarcarNotificacionLeidaView.as_view(), name='notificacion-marcar-leida'),
    path('notificaciones/marcar-todas-leidas/', MarcarTodasNotificacionesLeidasView.as_view(), name='notificaciones-marcar-todas-leidas'),

    # Reportes
    path('reportes/', CrearReporteView.as_view(), name='crear-reporte'),
    path('reportes/listar/', ListarReportesView.as_view(), name='listar-reportes'),
    path('reportes/<int:pk>/moderar/', ModerarReporteView.as_view(), name='moderar-reporte'),
    
    # Consentimineto
    path("consentimiento/verificar/", verificar_consentimiento),
    path("consentimiento/registrar/", registrar_consentimiento),

]
