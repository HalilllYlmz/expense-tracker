import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-900">
      <Text className="text-white text-2xl font-bold">
        Expense Tracker
      </Text>
      <Text className="text-gray-400 mt-2">
        Kurulum Başarılı! 🚀
      </Text>
    </View>
  );
}