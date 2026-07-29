import { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  // Clear the form whenever this screen loses focus (e.g. after a failed
  // attempt navigates elsewhere, or on logout->Login reset) so it never
  // shows stale input the next time it's shown.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setEmail('');
      setPassword('');
      setShowPassword(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleSignIn = async () => {
    const ok = await signIn(email, password);
    if (ok) navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      style={styles.inner}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Text style={styles.title}>Ruangan Meeting</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputField}
            placeholder="Email..."
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {email.length > 0 && (
            <TouchableOpacity onPress={() => setEmail('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password..."
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          {password.length > 0 && (
            <TouchableOpacity onPress={() => setPassword('')} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, !canSubmit && styles.buttonTextDisabled]}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#1F2937' },
  card: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: '#1F2937' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputField: { flex: 1, paddingVertical: 10 },
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
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  buttonTextDisabled: { color: '#6B7280' },
  error: { color: '#DC2626', fontSize: 12, marginBottom: 8 },
});
