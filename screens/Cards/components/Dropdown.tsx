import React, { useState, useContext } from 'react';

// react-native
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

// context
import { ThemeContext } from '../../../context/themeContext';
interface DropdownProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export const Dropdown: React.FC<DropdownProps> = ({ selectedValue, onValueChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  const dynamicSelectedStyle = {
    backgroundColor: theme === 'dark' ? '#333' : '#F7F7F7',
    borderColor: theme === 'dark' ? '#555' : '#ddd',
  };

  const dynamicSelectedText = {
    color: theme === 'dark' ? '#e0e0e0' : '#333',
  };

  const dynamicDropdownStyle = {
    backgroundColor: theme === 'dark' ? '#333' : '#fff',
    borderColor: theme === 'dark' ? '#555' : '#ddd',
  };

  const dynamicItemText = {
    color: theme === 'dark' ? '#e0e0e0' : '#333',
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.selected, dynamicSelectedStyle]}>
        <Text style={[styles.selectedText, dynamicSelectedText]}>
          {options.find(o => o.value === selectedValue)?.label || 'Sélectionnez'}
        </Text>
      </Pressable>
      {isOpen && (
        <View style={[styles.dropdown, dynamicDropdownStyle]}>
          <ScrollView>
            {options.map(option => (
              <Pressable
                key={option.value}
                onPress={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                style={styles.item}>
                <Text style={[styles.itemText, dynamicItemText]}>{option.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  selected: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  selectedText: {
    fontSize: 14,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 1000,
    marginTop: 4,
    maxHeight: 150,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 14,
  },
});
