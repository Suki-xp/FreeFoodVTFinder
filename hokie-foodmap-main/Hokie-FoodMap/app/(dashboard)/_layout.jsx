import { Drawer } from "expo-router/drawer";
import { UserProvider } from "../UserContext";

export default function Layout() {
  return (
    <UserProvider>
      <Drawer
        screenOptions={{
          headerShown: true,
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
        <Drawer.Screen 
            name="events/[id]"
            options={{ drawerItemStyle: { display: 'none' }}}
          />
      </Drawer>
    </UserProvider>
  );
}
