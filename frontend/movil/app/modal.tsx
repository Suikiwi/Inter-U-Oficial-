import { Redirect } from "expo-router";

export default function ModalScreen() {
  // 👇 redirige automáticamente al login
  return <Redirect href="/(stack)/login" />;
}
