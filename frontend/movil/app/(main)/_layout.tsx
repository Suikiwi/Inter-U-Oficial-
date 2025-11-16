import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "feed") iconName = "home";
          else if (route.name === "buscador") iconName = "search";
          else if (route.name === "nuevapublicacion") iconName = "add-circle";
          else if (route.name === "mensajes") iconName = "chatbubble";
          else if (route.name === "perfil") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#8A4FFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tabs.Screen name="feed" options={{ title: "Publicaciones" }} />
      <Tabs.Screen name="buscador" options={{ title: "Buscar" }} />
      <Tabs.Screen name="nuevapublicacion" options={{ title: "Nueva publicación" }} />
      <Tabs.Screen name="mensajes" options={{ title: "Mensajes" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
