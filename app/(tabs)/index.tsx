import Dashboard from "@/components/Dashboard";
import { CATEGORIES } from "@/constants/Categories";
import { useExpenseStore } from "@/store/useExpenseStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { expenses, loadExpenses, removeExpense, loading } = useExpenseStore();

  const [filterType, setFilterType] = useState<"week" | "month" | "all">(
    "month"
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  const getFilteredExpenses = () => {
    const now = new Date();
    let filtered = expenses;

    if (filterType === "week") {
      const oneWeekAgo = subDays(now, 7);
      filtered = filtered.filter((e) => e.date >= oneWeekAgo.getTime());
    } else if (filterType === "month") {
      const oneMonthAgo = subDays(now, 30);
      filtered = filtered.filter((e) => e.date >= oneMonthAgo.getTime());
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) || // Başlıkta ara
          (e.category &&
            e.category.toLowerCase().includes(searchQuery.toLowerCase())) // Kategoride ara
      );
    }

    return filtered;
  };

  const filteredData = getFilteredExpenses();

  const handleDelete = (id: number) => {
    Alert.alert("Vazgeç", "Bu gideri silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => removeExpense(id) },
    ]);
  };

  const getCategoryIcon = (catId: string, type: "expense" | "income") => {
    const category = CATEGORIES[type].find((c) => c.id === catId);
    return category ? category.icon : "help-circle";
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Bugün";
    if (isYesterday(date)) return "Dün";
    return format(date, "d MMM yyyy", { locale: tr });
  };

  return (
    <View className="flex-1 bg-gray-950 pt-12 px-4">
      <Text className="text-white text-3xl font-bold mb-4">Cüzdanım</Text>

      <View className="flex-row items-center bg-gray-900 p-3 rounded-xl border border-gray-800 mb-4">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-white font-medium h-full"
          placeholder="Harcama ara..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              Keyboard.dismiss();
            }}
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row bg-gray-900 p-1 rounded-xl mb-4 border border-gray-800">
        <TouchableOpacity
          onPress={() => setFilterType("week")}
          className={clsx(
            "flex-1 py-2 rounded-lg items-center",
            filterType === "week" ? "bg-gray-800" : ""
          )}
        >
          <Text
            className={clsx(
              "font-medium text-xs",
              filterType === "week" ? "text-white" : "text-gray-500"
            )}
          >
            7 Gün
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType("month")}
          className={clsx(
            "flex-1 py-2 rounded-lg items-center",
            filterType === "month" ? "bg-gray-800" : ""
          )}
        >
          <Text
            className={clsx(
              "font-medium text-xs",
              filterType === "month" ? "text-white" : "text-gray-500"
            )}
          >
            30 Gün
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterType("all")}
          className={clsx(
            "flex-1 py-2 rounded-lg items-center",
            filterType === "all" ? "bg-gray-800" : ""
          )}
        >
          <Text
            className={clsx(
              "font-medium text-xs",
              filterType === "all" ? "text-white" : "text-gray-500"
            )}
          >
            Tümü
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View className="mb-2">
            <Dashboard expenses={filteredData} />
            <Text className="text-gray-400 font-bold mb-2 mt-2">
              Hareketler ({filteredData.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDelete(item.id)}
            onPress={() => {
              router.push({
                pathname: "/add-expense",
                params: {
                  id: item.id,
                  title: item.title,
                  amount: item.amount,
                  category: item.category,
                  type: item.type,
                  date: item.date,
                },
              });
            }}
            className="bg-gray-900 p-4 rounded-xl mb-3 flex-row justify-between items-center border border-gray-800"
          >
            <View className="flex-row items-center gap-4">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  item.type === "income" ? "bg-green-900/30" : "bg-red-900/30"
                }`}
              >
                <Ionicons
                  name={
                    getCategoryIcon(item.category || "other", item.type) as any
                  }
                  size={24}
                  color={item.type === "income" ? "#4ade80" : "#f87171"}
                />
              </View>
              <View>
                <Text className="text-white font-semibold text-lg">
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {formatDate(item.date)}
                </Text>
              </View>
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
            Bu aralıkta işlem yok.
          </Text>
        }
      />

      <TouchableOpacity
        onPress={() => router.push("/add-expense")}
        className="absolute bottom-10 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:bg-blue-700"
      >
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
}
