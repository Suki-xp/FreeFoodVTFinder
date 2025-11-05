import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true, // shows a header with a built-in hamburger icon
        drawerActiveTintColor: "#861F41",
        drawerInactiveTintColor: "#555",
      }}
    >
      <Drawer.Screen
        name="homepage"
        options={{ title: "Home" }}
      />
      <Drawer.Screen
        name="event_list"
        options={{ title: "Events" }}
      />
    </Drawer>
  );
}
