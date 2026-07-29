import { StyleSheet, Text, View } from 'react-native';

// Dumb/presentational component - just renders, no logic.
export default function ScheduleCard({ startTime, endTime, room }) {
  return (
    <View style={styles.card}>
      <Text style={styles.time}>{startTime} - {endTime}</Text>
      <Text style={styles.room}>{room}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  time: { color: '#6B7280', fontSize: 13 },
  room: { color: '#1F2937', fontWeight: '600', fontSize: 13 },
});
