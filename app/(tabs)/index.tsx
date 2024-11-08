import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.contaier}>
      <Text style={styles.text}>Home Screen</Text>
      <Link href="/about" style={styles.button}>
      Go to About
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  contaier: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
