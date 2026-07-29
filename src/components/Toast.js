import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let showHandler = null;

export function showToast(message, type = 'error') {
  showHandler?.(message, type);
}

export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);

  useEffect(() => {
    showHandler = (message, type) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, type });
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
      }, 2500);
    };
    return () => {
      showHandler = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [opacity]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        toast.type === 'success' ? styles.success : styles.error,
        { bottom: 32 + insets.bottom, opacity },
      ]}
    >
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 999,
    elevation: 6,
  },
  error: { backgroundColor: '#DC2626' },
  success: { backgroundColor: '#1F2937' },
  text: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});
