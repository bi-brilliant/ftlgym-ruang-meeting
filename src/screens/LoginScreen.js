import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('yosi@gmail.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    const ok = await signIn(email, password);
    if (ok) navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Ruangan Meeting</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        <TextInput
          style={styles.input}
          placeholder="Email..."
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password..."
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#1F2937' },
  card: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: '#1F2937' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  passwordInput: { flex: 1, paddingVertical: 10 },
  eyeIcon: { fontSize: 16, paddingLeft: 8 },
  button: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#DC2626', fontSize: 12, marginBottom: 8 },
});
