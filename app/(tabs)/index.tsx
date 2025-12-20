import Dashboard from "@/components/Dashboard";
import { format, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { deleteExpense, getExpenses } from "../../db/queries";

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);

  const loadData = async () => {
    const expenses = await getExpenses();
    setData(expenses);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Bugün";
    if (isYesterday(date)) return "Dün";
    return format(date, "d MM yyyy", { locale: tr });
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert("Sil", "Bu harcamayı silmek istiyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await deleteExpense(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-900 pt-12 px-4">
      <Text className="text-white text-3xl font-bold mb-4">Cüzdanım</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View className="mb-2">
            <Dashboard expenses={data} />
            <Text className="text-gray-400 font-bold mb-2 mt-2">
              Son Hareketler
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDelete(item.id)} // Uzun basınca sil
            className="bg-gray-800 p-4 rournded-xl mb-3 flex-row justify-between items-center border border-gray-700"
          >
            <View>
              <Text className="text-white font-semibold text-lg">
                {item.title}
              </Text>
              <Text className="text-gray-400 text-xs">
                {formatDate(item.date)}
              </Text>
            </View>
            <Text
              className={`font-bold text-xl ${
                item.type === "income" ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.type === "income" ? "+" : "-"}
              {item.amount} ₺
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-20 text-lg">
            Harcama yok 🎉
          </Text>
        }
      />

      <TouchableOpacity
        onPress={() => router.push("/add-expense")}
        className="absolute bottom-10 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:bg-blue-700"
      >
        <Text className="text-white text-4xl pb-1">+</Text>
      </TouchableOpacity>
    </View>
  );
}
