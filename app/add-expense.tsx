import { CATEGORIES } from "@/constants/Categories";
import { useExpenseStore } from "@/store/useExpenseStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { clsx } from "clsx";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const expenseSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalı"),
  amount: z.coerce.number().min(1, "Tutar en az 1 olmalı"),
  type: z.enum(["income", "expense"]),
  category: z.string(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const { addNewExpense, editExpense } = useExpenseStore();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      type: "expense",
      category: "other",
    },
  });

  useEffect(() => {
    if (isEditing) {
      setValue("title", params.title as string);
      setValue("amount", Number(params.amount));
      setValue("type", params.type as any);
      setValue("category", params.category as string);

      if (params.date) {
        setDate(new Date(Number(params.date)));
      }
    }
  }, [params.id]);

  const selectedType = watch("type");

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    setDate(currentDate);
  };

  const confirmIOSDate = () => {
    setShowDatePicker(false);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (isEditing) {
        await editExpense(
          Number(params.id),
          data.title,
          data.amount,
          data.category,
          data.type,
          date.getTime()
        );
        Alert.alert("Güncellendi", "Kayıt başarıyla düzenlendi ✅");
      } else {
        await addNewExpense(
          data.title,
          data.amount,
          data.category,
          data.type,
          date.getTime()
        );
        Alert.alert("Başarılı", "İşlem kaydedildi ✅");
      }
      router.back();
    } catch (error) {
      Alert.alert("Hata", "Kaydederken bir sorun oluştu.");
    }
  };

  const activeColor =
    selectedType === "expense" ? "text-red-500" : "text-green-500";
  const activeBg = selectedType === "expense" ? "bg-red-500" : "bg-green-500";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-950"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="flex-row p-1 mx-4 mt-6 bg-gray-900/80 rounded-2xl border border-gray-800">
          <TouchableOpacity
            onPress={() => setValue("type", "expense")}
            className={clsx(
              "flex-1 py-3 rounded-xl items-center justify-center transition-all",
              selectedType === "expense" ? "bg-gray-800" : "bg-transparent"
            )}
          >
            <Text
              className={clsx(
                "font-bold text-sm",
                selectedType === "expense" ? "text-red-400" : "text-gray-500"
              )}
            >
              Gider
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setValue("type", "income")}
            className={clsx(
              "flex-1 py-3 rounded-xl items-center justify-center transition-all",
              selectedType === "income" ? "bg-gray-800" : "bg-transparent"
            )}
          >
            <Text
              className={clsx(
                "font-bold text-sm",
                selectedType === "income" ? "text-green-400" : "text-gray-500"
              )}
            >
              Gelir
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center justify-center py-12">
          <Text className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-[10px]">
            TUTAR GİRİN
          </Text>
          <View className="flex-row items-center justify-center h-20">
            <Text className={`text-4xl font-light mr-2 ${activeColor}`}>₺</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="text-6xl font-bold text-white min-w-[100px] text-center h-20"
                  placeholder="0"
                  placeholderTextColor="#374151"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ? value.toString() : ""}
                  autoFocus
                />
              )}
            />
          </View>
          {errors.amount && (
            <Text className="text-red-400 mt-2 text-sm">
              {errors.amount.message as string}
            </Text>
          )}
        </View>

        <View className="mx-4 bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 mb-8">
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
            className="flex-row items-center p-5 border-b border-gray-800/50"
          >
            <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-4">
              <Ionicons name="calendar" size={20} color="#9ca3af" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-gray-500 text-xs mb-0.5">Tarih</Text>
              <Text className="text-white font-medium text-lg">
                {format(date, "d MMMM yyyy", { locale: tr })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4b5563" />
          </TouchableOpacity>

          <View className="flex-row items-center p-5">
            <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-4">
              <Ionicons name="create" size={20} color="#9ca3af" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-0.5">Açıklama</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="text-white font-medium text-lg p-0 h-7"
                    placeholder="Örn: Market Fişi"
                    placeholderTextColor="#4b5563"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>
          {errors.title && (
            <Text className="text-red-400 px-5 pb-3 text-sm">
              {errors.title.message as string}
            </Text>
          )}
        </View>

        <View className="mx-4 mb-32">
          <Text className="text-gray-500 font-medium mb-4 ml-1">
            Kategori Seçin
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES[selectedType].map((cat) => {
              const isSelected = watch("category") === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setValue("category", cat.id)}
                  className={clsx(
                    "flex-row items-center px-4 py-3 rounded-2xl border transition-all",
                    isSelected
                      ? `${activeBg} border-transparent`
                      : "bg-gray-900 border-gray-800"
                  )}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={isSelected ? "white" : "#9ca3af"}
                  />
                  <Text
                    className={clsx(
                      "ml-2 font-semibold text-sm",
                      isSelected ? "text-white" : "text-gray-400"
                    )}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-10 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className={clsx(
            "w-full py-4 rounded-3xl items-center shadow-lg active:scale-95 transition-transform",
            activeBg
          )}
        >
          <Text className="text-white font-bold text-xl">
            {isEditing ? "Güncelle" : "Kaydet"}
          </Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-gray-900 rounded-t-3xl border-t border-gray-800 pb-10">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
                <Text className="text-gray-400 font-medium">Tarih Seçin</Text>
                <TouchableOpacity
                  onPress={confirmIOSDate}
                  className="bg-gray-800 px-4 py-2 rounded-lg"
                >
                  <Text className="text-blue-400 font-bold">Bitti</Text>
                </TouchableOpacity>
              </View>

              <View className="p-4 bg-gray-900 items-center justify-center">
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                  textColor="white"
                  themeVariant="dark"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}
