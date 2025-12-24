import { CATEGORIES } from "@/constants/Categories";
import { useExpenseStore } from "@/store/useExpenseStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// --- 1. TÜRKÇE TAKVİM AYARLARI ---
LocaleConfig.locales["tr"] = {
  monthNames: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  monthNamesShort: [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ],
  dayNames: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],
  dayNamesShort: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  today: "Bugün",
};
LocaleConfig.defaultLocale = "tr";

export default function CalendarScreen() {
  const { expenses } = useExpenseStore();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  // --- 2. GÜNLÜK İSTATİSTİKLERİ HESAPLA (GELİR VE GİDER AYRI) ---
  const dailyStats = useMemo(() => {
    // Yapı: { "2024-12-25": { income: 500, expense: 100 } }
    const stats: Record<string, { income: number; expense: number }> = {};

    expenses.forEach((exp) => {
      const dateKey = format(new Date(exp.date), "yyyy-MM-dd");

      if (!stats[dateKey]) {
        stats[dateKey] = { income: 0, expense: 0 };
      }

      if (exp.type === "income") {
        stats[dateKey].income += exp.amount;
      } else {
        stats[dateKey].expense += exp.amount;
      }
    });

    return stats;
  }, [expenses]);

  // --- 3. SEÇİLİ GÜNÜN DETAYLARI ---
  const selectedDayExpenses = expenses.filter(
    (e) => format(new Date(e.date), "yyyy-MM-dd") === selectedDate
  );

  const getCategoryIcon = (catId: string, type: string) => {
    const category = CATEGORIES[type as "expense" | "income"]?.find(
      (c) => c.id === catId
    );
    return category ? category.icon : "help-circle";
  };

  return (
    <View className="flex-1 bg-gray-950 pt-16">
      <Text className="text-white text-3xl font-bold px-4 mb-6">Takvim</Text>

      {/* --- TAKVİM BİLEŞENİ --- */}
      <Calendar
        theme={{
          backgroundColor: "#030712",
          calendarBackground: "#030712",
          textSectionTitleColor: "#6b7280",
          selectedDayBackgroundColor: "#2563eb",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#3b82f6",
          dayTextColor: "#ffffff",
          textDisabledColor: "#374151",
          monthTextColor: "#ffffff",
          arrowColor: "#3b82f6",
          textDayFontWeight: "600",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "normal",
          textDayFontSize: 14,
        }}
        markedDates={{
          [selectedDate]: { selected: true, disableTouchEvent: true },
        }}
        onDayPress={(day: any) => {
          setSelectedDate(day.dateString);
        }}
        // 🔥 GÜNCELLENMİŞ GÖRÜNÜM (HEM GELİR HEM GİDER)
        dayComponent={({ date, state }: any) => {
          const dateString = date.dateString;
          const dayData = dailyStats[dateString]; // O günün verisini çek
          const isSelected = dateString === selectedDate;
          const isToday = dateString === format(new Date(), "yyyy-MM-dd");

          // Rakamı kısaltma (1500 -> 1.5k)
          const formatMoney = (amount: number) => {
            if (amount >= 1000) return (amount / 1000).toFixed(1) + "k";
            return Math.round(amount).toString();
          };

          return (
            <TouchableOpacity
              onPress={() => setSelectedDate(dateString)}
              className={`items-center justify-start w-10 h-12 rounded-lg pt-1 ${
                isSelected ? "bg-blue-600" : ""
              }`}
            >
              {/* Gün Sayısı */}
              <Text
                className={`${
                  isSelected
                    ? "text-white"
                    : isToday
                    ? "text-blue-400"
                    : state === "disabled"
                    ? "text-gray-700"
                    : "text-white"
                } font-bold text-xs mb-0.5`}
              >
                {date.day}
              </Text>

              {/* Varsa Gelir (Yeşil Badge) */}
              {dayData?.income ? (
                <View className="bg-green-900/60 px-1 rounded mb-0.5 w-full items-center">
                  <Text className="text-[7px] text-green-300 font-bold">
                    +{formatMoney(dayData.income)}
                  </Text>
                </View>
              ) : null}

              {/* Varsa Gider (Kırmızı Badge) */}
              {dayData?.expense ? (
                <View className="bg-red-900/60 px-1 rounded w-full items-center">
                  <Text className="text-[7px] text-red-200 font-bold">
                    -{formatMoney(dayData.expense)}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
      />

      {/* --- SEÇİLİ GÜN DETAYLARI --- */}
      <View className="flex-1 bg-gray-900 mt-6 rounded-t-3xl px-4 pt-6 border-t border-gray-800">
        <Text className="text-gray-400 font-bold mb-4 uppercase text-xs">
          {format(new Date(selectedDate), "d MMMM yyyy, EEEE", { locale: tr })}
        </Text>

        <FlatList
          data={selectedDayExpenses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center mt-10">
              Bugün işlem yok.
            </Text>
          }
          renderItem={({ item }) => (
            <View className="bg-gray-950 p-4 rounded-xl mb-3 flex-row justify-between items-center border border-gray-800">
              <View className="flex-row items-center gap-3">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    item.type === "income" ? "bg-green-900/30" : "bg-red-900/30"
                  }`}
                >
                  <Ionicons
                    name={
                      getCategoryIcon(
                        item.category || "other",
                        item.type
                      ) as any
                    }
                    size={20}
                    color={item.type === "income" ? "#4ade80" : "#f87171"}
                  />
                </View>
                <View>
                  <Text className="text-white font-semibold">{item.title}</Text>
                  <Text className="text-gray-500 text-xs">
                    {item.type === "income" ? "Gelir" : "Gider"}
                  </Text>
                </View>
              </View>
              <Text
                className={`font-bold ${
                  item.type === "income" ? "text-green-400" : "text-red-400"
                }`}
              >
                {item.type === "income" ? "+" : "-"}
                {item.amount} ₺
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}
