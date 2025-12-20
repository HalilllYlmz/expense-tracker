import { addExpense } from '@/db/queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const expenseSchema = z.object({
    title: z.string().min(2, "Başlık en az 2 karakter olmalı"),
    amount: z.coerce.number().min(1, "Tutar en az 1 olmalı"),
    type: z.enum(['income', 'expense']),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function AddExpenseScreen() {
    const router = useRouter();

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
          title: '',
          amount: undefined, // Başlangıçta boş
          type: 'expense', // Varsayılan Gider
        },
      });

      const selectedType = watch('type');

      const onSubmit = async (data: ExpenseFormData) => {
        try {
          await addExpense(data.title, data.amount, data.type);
          Alert.alert("Başarılı", "İşlem kaydedildi ✅");
          router.back(); // Bir önceki sayfaya dön
        } catch (error) {
          Alert.alert("Hata", "Kaydederken bir sorun oluştu.");
        }
      };

      return (
        <View className="flex-1 bg-gray-900 p-6">
          
          {/* Gelir / Gider Seçimi (Toggle) */}
          <View className="flex-row bg-gray-800 rounded-xl p-1 mb-6">
            <TouchableOpacity 
              onPress={() => setValue('type', 'expense')}
              className={clsx(
                "flex-1 py-3 rounded-lg items-center",
                selectedType === 'expense' ? "bg-red-500" : "bg-transparent"
              )}
            >
              <Text className="text-white font-bold">Gider (-)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setValue('type', 'income')}
              className={clsx(
                "flex-1 py-3 rounded-lg items-center",
                selectedType === 'income' ? "bg-green-500" : "bg-transparent"
              )}
            >
              <Text className="text-white font-bold">Gelir (+)</Text>
            </TouchableOpacity>
          </View>
    
          {/* Başlık Input */}
          <View className="mb-4">
            <Text className="text-gray-400 mb-2 font-medium">Başlık</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500"
                  placeholder="Örn: Market Alışverişi"
                  placeholderTextColor="#6B7280"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.title && <Text className="text-red-400 mt-1">{errors.title.message}</Text>}
          </View>
    
          {/* Tutar Input */}
          <View className="mb-8">
            <Text className="text-gray-400 mb-2 font-medium">Tutar (₺)</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500 text-2xl font-bold"
                  placeholder="0.00"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric" // Sadece sayı klavyesi
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ? value.toString() : ''}
                />
              )}
            />
            {errors.amount && <Text className="text-red-400 mt-1">{errors.amount.message}</Text>}
          </View>
    
          {/* Kaydet Butonu */}
          <TouchableOpacity 
            onPress={handleSubmit(onSubmit)}
            className={clsx(
              "p-4 rounded-xl items-center active:opacity-90",
              selectedType === 'expense' ? "bg-red-500" : "bg-green-500"
            )}
          >
            <Text className="text-white font-bold text-lg">Kaydet</Text>
          </TouchableOpacity>
    
        </View>
      );

}