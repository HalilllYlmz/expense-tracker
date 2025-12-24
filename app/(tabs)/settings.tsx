import { useExpenseStore } from "@/store/useExpenseStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

// 👇 1. IMPORT: Servis dosyamızı içeri alıyoruz
import { exportToExcel, exportToPDF } from "../../services/ExportServices";

export default function SettingsScreen() {
  const { resetAllData, expenses } = useExpenseStore();

  // Toplamları hesapla (PDF özeti için)
  const totalIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  // --- Mevcut JSON Yedekleme Fonksiyonu ---
  const handleJsonExport = async () => {
    if (expenses.length === 0) {
      Alert.alert("Veri Yok", "Dışa aktarılacak harcama bulunamadı.");
      return;
    }

    try {
      // @ts-ignore
      const directory =
        FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const fileUri = directory + "expense_tracker_backup.json";
      const jsonData = JSON.stringify(expenses, null, 2);

      await FileSystem.writeAsStringAsync(fileUri, jsonData, {
        encoding: "utf8",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Hata", "Paylaşım bu cihazda desteklenmiyor.");
      }
    } catch (error) {
      Alert.alert("Hata", "Yedekleme dosyası oluşturulamadı.");
      console.error(error);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Dikkat ⚠️",
      "Tüm harcamaların kalıcı olarak silinecek. Bu işlem geri alınamaz!",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Hepsini Sil",
          style: "destructive",
          onPress: async () => {
            await resetAllData();
            Alert.alert("Sıfırlandı", "Tüm veriler temizlendi.");
          },
        },
      ]
    );
  };

  // --- UI Bileşeni (SettingItem) ---
  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    isDestructive = false,
    iconColor = "#9ca3af", // Varsayılan gri
    iconBg = "bg-gray-800", // Varsayılan gri arka plan
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 bg-gray-900 mb-3 rounded-2xl border border-gray-800"
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
          isDestructive ? "bg-red-900/30" : iconBg
        }`}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isDestructive ? "#ef4444" : iconColor}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`font-semibold text-lg ${
            isDestructive ? "text-red-400" : "text-white"
          }`}
        >
          {title}
        </Text>
        {subtitle && <Text className="text-gray-500 text-xs">{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#4b5563" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-950 pt-16 px-4">
      <Text className="text-white text-3xl font-bold mb-6">Ayarlar</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- BÖLÜM 1: RAPORLAR (YENİ) --- */}
        <Text className="text-gray-500 font-medium mb-3 ml-1 uppercase text-xs tracking-widest">
          Raporlar ve Çıktılar
        </Text>

        {/* Excel Butonu */}
        <SettingItem
          icon="document-text"
          title="Excel Olarak İndir"
          subtitle="Tablo formatında (.xlsx)"
          onPress={() => exportToExcel(expenses)}
          iconColor="#10b981" // Yeşil
          iconBg="bg-green-900/30"
        />

        {/* PDF Butonu */}
        <SettingItem
          icon="print"
          title="PDF Raporu Al"
          subtitle="Özet ve detaylı liste (.pdf)"
          onPress={() => exportToPDF(expenses, totalIncome, totalExpense)}
          iconColor="#f59e0b" // Turuncu/Sarı
          iconBg="bg-yellow-900/30"
        />

        {/* --- BÖLÜM 2: VERİ YÖNETİMİ --- */}
        <Text className="text-gray-500 font-medium mb-3 mt-4 ml-1 uppercase text-xs tracking-widest">
          Veri Yönetimi
        </Text>

        <SettingItem
          icon="code-download-outline"
          title="Yedek Al (JSON)"
          subtitle="Ham veri yedeği"
          onPress={handleJsonExport}
        />

        <SettingItem
          icon="trash-outline"
          title="Tüm Verileri Sil"
          subtitle="Veritabanını tamamen temizler"
          onPress={handleReset}
          isDestructive
        />

        {/* --- BÖLÜM 3: HAKKINDA --- */}
        <Text className="text-gray-500 font-medium mb-3 mt-6 ml-1 uppercase text-xs tracking-widest">
          Uygulama Hakkında
        </Text>

        <View className="bg-gray-900 p-6 rounded-2xl border border-gray-800 items-center mb-10">
          <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-900">
            <Ionicons name="wallet" size={32} color="white" />
          </View>
          <Text className="text-white font-bold text-xl">Expense Tracker</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Versiyon 1.0.0 (Beta)
          </Text>
          <Text className="text-gray-600 text-xs mt-4 text-center">
            Halil Yılmaz tarafından geliştirildi 💻
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
