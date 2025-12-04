
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def chat_message(self, event):
        # Enviar con el mismo shape que usa el serializer
        payload = {
            "type": "message",
            "id_mensaje": event["id_mensaje"],
            "texto": event["texto"],
            "fecha": event["fecha"],
            "estudiante": event["estudiante"],
            "autor_alias": event.get("autor_alias"),  # clave consistente
        }
        await self.send(text_data=json.dumps(payload))
