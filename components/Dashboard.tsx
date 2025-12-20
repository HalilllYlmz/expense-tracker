import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

interface DashboardProps {
  expenses: any[];
}

export default function Dashboard({ expenses }: DashboardProps) {
  const totalIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  const pieData = [
    { value: totalIncome, color: "#22c552", text: "%", focused: true },
    { value: totalExpense, color: "#ef4444", text: "%" },
  ];

  const isEmpty = totalIncome === 0 && totalExpense === 0;
  const renderData = isEmpty ? [{ value: 1, color: "#374151" }] : pieData;

  return (
    <View className="bg-gray-800 p-4 rounded-2xl mb-6 shadow-lg border border-gray-700">
      <Text className="text-white text-lg font-bold mb-4">Genel Durum</Text>

      <View className="flex-row items-center justify-between">
        <View className="items-center justify-center">
          <PieChart
            data={renderData}
            donut
            radius={60}
            innerRadius={45}
            innerCircleColor="#1f2937"
            centerLabelComponent={() => {
              return (
                <View className="items-center justify-center">
                  <Text className="text-gray-400 text-xs">Net</Text>
                  <Text
                    className={`font-bold ${
                      balance >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {balance}₺
                  </Text>
                </View>
              );
            }}
          />
        </View>

        <View className="flex-1 ml-6 justify-center space-y-3">
          <View>
            <View className="flex-row items-center mb-1">
              <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <Text className="text-gray-400 text-xs">Toplam Gelir</Text>
            </View>
            <Text className="text-white font-bold text-lg">
              +{totalIncome} ₺
            </Text>
          </View>

          <View className="mt-2">
            <View className="flex-row items-center mb-1">
              <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
              <Text className="text-gray-400 text-xs">Toplam Gider</Text>
            </View>
            <Text className="text-white font-bold text-lg">
              -{totalExpense} ₺
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
