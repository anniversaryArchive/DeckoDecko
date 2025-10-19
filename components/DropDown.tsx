import React from 'react';
import { View, TouchableOpacity, FlatList, Modal } from 'react-native';
import Icon from '@components/Icon';
import Typography from '@components/Typography';

type DropDownProps<T> = {
  data: T[];
  selectedValue: T | null;
  onValueChange: (value: T) => void;
  labelExtractor: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
  color?: "primary" | "secondary" | "secondary-dark";
};

const dropBoxTheme = {
  primary: "primary",
  secondary: "secondary",
  "secondary-dark": "secondary-dark",
};

function DropDown<T>({
                       data,
                       selectedValue,
                       onValueChange,
                       labelExtractor,
                       placeholder = "Select",
                       disabled = false,
                       color = "primary",
                     }: DropDownProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);

  const iconColor = dropBoxTheme[color];

  const handleSelect = (item: T) => {
    onValueChange(item);
    setIsOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        className={`py-3 px-4 bg-background-primary rounded-md border border-${color} ${
          disabled ? "opacity-50" : ""
        }`}
        onPress={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <View className="flex-row justify-between items-center">
          <Typography
            variant="Body4"
            className={disabled ? "text-gray-04" : ""}
          >
            {selectedValue ? labelExtractor(selectedValue) : placeholder}
          </Typography>
          <Icon
            name="chevronDown"
            size={24}
            fill={iconColor}
            stroke={iconColor}
          />
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/30 justify-center px-10"
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        >
          <View className="bg-background-primary rounded max-h-[250px]">
            <FlatList
              data={data}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-3 border-b border-gray-03"
                  onPress={() => handleSelect(item)}
                >
                  <Typography variant="Body4">
                    {labelExtractor(item)}
                  </Typography>
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

export default DropDown;
