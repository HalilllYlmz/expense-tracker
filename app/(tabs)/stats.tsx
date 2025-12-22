import { CATEGORIES } from "@/constants/Categories";
import { useExpenseStore } from "@/store/useExpenseStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  endOfMonth,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  subDays,
} from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function StatsScreen() {
  const { expenses, budgets, saveCategoryBudget } = useExpenseStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newLimit, setNewLimit] = useState("");

  // --- 1. Grafik Verisi (Son 7 Gün) ---
  const getLast7DaysData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayExpenses = expenses.filter(
        (e) => e.type === "expense" && isSameDay(new Date(e.date), date)
      );
      const totalAmount = dayExpenses.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      data.push({
        value: totalAmount,
        label: format(date, "EEE", { locale: tr }),
        frontColor: "#3b82f6",
        topLabelComponent: () =>
          totalAmount > 0 ? (
            <Text className="text-gray-400 text-[10px] mb-1">
              {Math.round(totalAmount)}
            </Text>
          ) : null,
      });
    }
    return data;
  };

  const getCategoryStats = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthlyExpenses = expenses.filter(
      (e) =>
        e.type === "expense" &&
        isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
    );

    const stats = CATEGORIES.expense.map((cat) => {
      const spent = monthlyExpenses
        .filter((e) => e.category === cat.id)
        .reduce((sum, item) => sum + item.amount, 0);

      const budgetItem = budgets.find((b) => b.category === cat.id);
      const limit = budgetItem ? budgetItem.amount : 0;

      return { ...cat, spent, limit };
    });

    return stats;
  };

  const chartData = getLast7DaysData();
  const categoryStats = getCategoryStats();
  const totalWeekExpense = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const openBudgetModal = (category: any) => {
    setSelectedCategory(category);
    setNewLimit(category.limit > 0 ? category.limit.toString() : "");
    setModalVisible(true);
  };

  const saveBudget = async () => {
    if (!selectedCategory) return;
    const amount = parseFloat(newLimit);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin.");
      return;
    }

    await saveCategoryBudget(selectedCategory.id, amount);
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-gray-950 pt-16 px-4">
      <Text className="text-white text-3xl font-bold mb-6">
        Harcama Analizi
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-gray-900 p-6 rounded-3xl border border-gray-800 mb-8">
          <Text className="text-gray-400 font-medium mb-4">Son 7 Gün</Text>
          <View className="items-center overflow-hidden">
            <BarChart
              data={chartData}
              barWidth={22}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="#3b82f6"
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              yAxisTextStyle={{ color: "#6b7280" }}
              xAxisLabelTextStyle={{ color: "#9ca3af", fontSize: 12 }}
              height={180}
              width={300}
              isAnimated
            />
          </View>
          <View className="mt-4 pt-4 border-t border-gray-800 flex-row justify-between items-center">
            <Text className="text-gray-500 text-xs">Bu hafta toplam</Text>
            <Text className="text-white font-bold text-xl">
              {totalWeekExpense} ₺
            </Text>
          </View>
        </View>

        <Text className="text-white text-xl font-bold mb-4">
          Aylık Bütçe Hedefleri
        </Text>
        <Text className="text-gray-500 text-xs mb-4">
          Limit belirlemek için kategoriye dokunun.
        </Text>

        <View className="pb-20">
          {categoryStats.map((item) => {
            const percentage =
              item.limit > 0 ? (item.spent / item.limit) * 100 : 0;

            let progressColor = "bg-green-500";
            if (percentage > 80) progressColor = "bg-yellow-500";
            if (percentage >= 100) progressColor = "bg-red-500";
            if (item.limit === 0) progressColor = "bg-gray-700";

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => openBudgetModal(item)}
                className="bg-gray-900 p-4 rounded-2xl mb-3 border border-gray-800"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-3">
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color="#9ca3af"
                      />
                    </View>
                    <View>
                      <Text className="text-white font-semibold">
                        {item.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {item.limit > 0
                          ? `%${Math.round(percentage)} kullanıldı`
                          : "Limit ayarlanmadı"}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-bold">{item.spent} ₺</Text>
                    <Text className="text-gray-500 text-xs">
                      / {item.limit > 0 ? item.limit + " ₺" : "∞"}
                    </Text>
                  </View>
                </View>

                <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${progressColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <View className="bg-gray-900 w-full p-6 rounded-3xl border border-gray-800">
            <Text className="text-white text-xl font-bold mb-2 text-center">
              {selectedCategory?.name} Limiti
            </Text>
            <Text className="text-gray-400 text-sm mb-6 text-center">
              Bu kategori için aylık maksimum harcama hedefi belirleyin.
            </Text>

            <View className="bg-gray-800 rounded-xl p-4 mb-6 flex-row items-center border border-gray-700">
              <Text className="text-white text-xl font-bold mr-2">₺</Text>
              <TextInput
                className="flex-1 text-white text-2xl font-bold"
                placeholder="0"
                placeholderTextColor="#4b5563"
                keyboardType="numeric"
                value={newLimit}
                onChangeText={setNewLimit}
                autoFocus
              />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-800 py-3 rounded-xl items-center"
              >
                <Text className="text-gray-300 font-bold">Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveBudget}
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
