# consumers.py
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

    # Este nombre debe coincidir con "type": "chat_message" del view
    async def chat_message(self, event):
        # Lo que se envía al cliente (payload) puede tener type "message" para tu frontend
        await self.send(text_data=json.dumps({
            "type": "message",
            "id_mensaje": event["id_mensaje"],
            "texto": event["texto"],
            "fecha": event["fecha"],
            "estudiante": event["estudiante"],
            "user": event["user"],
        }))
