import { useAuth } from '../../lib/auth-context';
import { View, Text, Button } from 'react-native';

export default function Home() {
  const { logout } = useAuth();

  return (
    <View>
      <Text>메인 화면면</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
