import { expenses } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../../db";

export default function HomeScreen() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function initDB() {
      try {
        await db.run(
           `CREATE TABLE IF NOT EXISTS expenses (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             title TEXT NOT NULL,
             amount REAL NOT NULL,
             date INTEGER NOT NULL,
             type TEXT DEFAULT 'expense'
           );`
        );
        fetchExpenses(); 
      } catch (e) {
        console.error("DB Hatası:", e);
      }
    }
    initDB();
  }, []);

  const fetchExpenses = async () => {
    try {
      const result = await db.select().from(expenses).orderBy(desc(expenses.id));
      setData(result);
    } catch (error) {
      console.error(error);
    }
  };

  const addTestExpense = async () => {
    try {
      await db.insert(expenses).values({
        title: "Test Harcama " + Math.floor(Math.random() * 100),
        amount: Math.floor(Math.random() * 500),
        date: Date.now(),
        type: 'expense'
      });
      fetchExpenses(); 
    } catch (error) {
      console.error("Ekleme hatası:", error);
    }
  };


  return (
    <View className="flex-1 bg-gray-900 pt-12 px-4">
      <Text className='text-white text-3xl font-bold mb-6'>Harcamalarım</Text>
      <TouchableOpacity
        onPress={addTestExpense}
        className="bg-blue-600 p-2 rounded-xl mb-6 active:bg-blue-700"
      >
        <Text className= "text-white text-center font-bold text-lg">+ Test Verisi Ekle</Text>
      </TouchableOpacity>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <View className='bg-gray-800 p-4 rounded-lg mb-3 flex-row justify-between items-center border border-gray-700'>
            <View>
            <Text className="text-white font-semibold text-lg">{item.title}</Text>
              <Text className="text-gray-400 text-sm">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text className="text-green-400 font-bold text-xl">
              {item.amount} ₺
            </Text>
          </View> 
        )}
      />
     
    </View>
  );
}