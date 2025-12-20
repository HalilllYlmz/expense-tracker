import { useFocusEffect } from 'expo-router'; // Sayfaya geri dönüldüğünü anlamak için
import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { addExpense, deleteExpense, getExpenses } from '../../db/queries';

export default function HomeScreen() {
  const [data, setData] = useState<any[]>([]);

  // Verileri yükle
  const loadData = async () => {
    const expenses = await getExpenses();
    setData(expenses);
  };

  // Sayfa her odaklandığında (başka sayfadan buraya gelince) veriyi yenile
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Test verisi ekle
  const handleAddTest = async () => {
    await addExpense("Kahve Molası", 75.50);
    loadData(); // Listeyi güncelle
  };

  // Silme işlemi
  const handleDelete = (id: number) => {
    Alert.alert("Sil", "Bu harcamayı silmek istiyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Sil", 
        style: "destructive", 
        onPress: async () => {
          await deleteExpense(id);
          loadData();
        } 
      }
    ]);
  };

  return (
    <View className="flex-1 bg-gray-900 pt-12 px-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-3xl font-bold">Cüzdanım</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onLongPress={() => handleDelete(item.id)} // Uzun basınca sil
            className="bg-gray-800 p-4 rounded-xl mb-3 flex-row justify-between items-center border border-gray-700"
          >
            <View>
              <Text className="text-white font-semibold text-lg">{item.title}</Text>
              <Text className="text-gray-400 text-xs">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text className={`font-bold text-xl ${item.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
              {item.type === 'income' ? '+' : '-'}{item.amount} ₺
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-20 text-lg">Harcama yok 🎉</Text>
        }
      />

      {/* Floating Action Button (FAB) - Sağ Alt Köşe Butonu */}
      <TouchableOpacity 
        onPress={handleAddTest}
        className="absolute bottom-10 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:bg-blue-700"
      >
        <Text className="text-white text-4xl pb-1">+</Text>
      </TouchableOpacity>
    </View>
  );
}