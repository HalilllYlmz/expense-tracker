import { useExpenseStore } from "@/store/useExpenseStore";
import { format, isSameDay, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function StatsScreen() {
  const { expenses } = useExpenseStore();

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

  const chartData = getLast7DaysData();
  const totalWeekExpense = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <View className="flex-1 bg-gray-950 pt-16 px-4">
      <Text className="text-white text-3xl font-bold mb-6">
        Harcama Analizi
      </Text>

      <View className="bg-gray-900 p-6 rounded-3xl border border-gray-800 mb-6">
        <Text className="text-gray-400 font-medium mb-4">
          Son 7 Günlük Harcama Trendi
        </Text>

        <View className="items-center">
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
            height={200}
            width={300}
            isAnimated
          />
        </View>

        <View className="mt-6 pt-4 border-t border-gray-800 flex-row justify-between items-center">
          <Text className="text-gray-500 text-xs">Bu hafta toplam</Text>
          <Text className="text-white font-bold text-xl">
            {totalWeekExpense} ₺
          </Text>
        </View>
      </View>

      <View className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
        <Text className="text-gray-500 text-center text-sm">
          Daha fazla istatistik yakında... 🚀
        </Text>
      </View>
    </View>
  );
}
