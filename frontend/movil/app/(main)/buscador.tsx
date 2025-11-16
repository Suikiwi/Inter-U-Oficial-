import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function BuscadorScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const mockData = [
    "Proyecto de Redes",
    "Automatización Industrial",
    "Desarrollo de Software",
    "UX/UI",
    "Inteligencia Artificial",
  ];

  // 🔹 Debounce: espera 300ms antes de filtrar
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length > 0) {
        const filtered = mockData.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const renderItem = ({ item }: { item: string }) => {
    // 🔹 Resalta el texto buscado dentro del resultado
    const regex = new RegExp(`(${query})`, "gi");
    const parts = item.split(regex);

    return (
      <View style={styles.resultItem}>
        <Text style={styles.resultText}>
          {parts.map((part, index) =>
            regex.test(part) ? (
              <Text key={index} style={styles.highlight}>
                {part}
              </Text>
            ) : (
              part
            )
          )}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscador</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu búsqueda..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          query.length > 0 ? (
            <Text style={styles.noResults}>No se encontraron resultados</Text>
          ) : (
            <Text style={styles.noResults}>Empieza a escribir para buscar</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: "#2E2E48",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  clearButton: {
    marginLeft: 10,
    backgroundColor: "#8A4FFF",
    borderRadius: 8,
    padding: 8,
  },
  clearText: { color: "#fff", fontWeight: "bold" },
  resultItem: {
    backgroundColor: "#2E2E48",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultText: { color: "#fff", fontSize: 16 },
  highlight: { color: "#FFD700", fontWeight: "bold" }, // 🔹 resalta coincidencias
  noResults: { color: "#aaa", textAlign: "center", marginTop: 20 },
});
