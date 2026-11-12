import { Text, View, StyleSheet } from "react-native";

/** "Overview" tab screen — the `index` route of the native tab bar. */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      <Text style={styles.subtitle}>Your dashboard at a glance.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
});
