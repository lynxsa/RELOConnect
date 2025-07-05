import { StatusBar } from 'expo-status-bar';
import RN from 'react-native';

const { StyleSheet, Text, View } = RN;

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RELOConnect</Text>
      <Text style={styles.subtitle}>Monorepo Root - Please run specific apps</Text>
      <Text style={styles.instruction}>
        Run: cd apps/user-app && npm start
      </Text>
      <Text style={styles.instruction}>
        Or: cd apps/driver-app && npm start
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0057FF',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
});
