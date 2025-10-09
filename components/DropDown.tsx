import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal } from "react-native";

type DropDownProps<T> = {
  data: T[];
  selectedValue: T | null;
  onValueChange: (value: T) => void;
  labelExtractor: (item: T) => string; // 데이터 항목에서 보여줄 텍스트를 추출
  placeholder?: string;
  disabled?: boolean; // 비활성화 여부
};

function DropDown<T>({
  data,
  selectedValue,
  onValueChange,
  labelExtractor,
  placeholder = "Select",
  disabled = false,
}: DropDownProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (item: T) => {
    onValueChange(item);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[styles.buttonText, disabled && styles.textDisabled]}>
          {selectedValue ? labelExtractor(selectedValue) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={data}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
                  <Text style={styles.itemText}>{labelExtractor(item)}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 250 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFBBC1",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    color: "#998372",
    textAlign: "center",
    fontFamily: "DunggeunmisoB",
  },
  textDisabled: {
    color: "#ccc",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 4,
    maxHeight: 250,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemText: {
    fontSize: 14,
    color: "#998372",
    textAlign: "center",
    fontFamily: "DunggeunmisoB",
  },
});

export default DropDown;
