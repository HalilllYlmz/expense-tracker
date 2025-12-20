import { initDatabase } from "@/db/queries";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if(error) throw error;
  }, [error]);

  useEffect(() => {
    if(loaded) {
      initDatabase()
        .then(() => console.log("DB Init Successful"))
        .catch(err => console.log("DB Init Error:", err));

      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if(!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-expense" 
        options={{
          presentation: "modal",
          title: "New Expense",
          headerStyle: {backgroundColor: "#111827"},
          headerTintColor: "#FFFFFF",
        }}
      />
    </Stack>
  )

}