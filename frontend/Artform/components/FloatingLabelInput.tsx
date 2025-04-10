// components/FloatingLabelInput.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput, Animated, View, StyleSheet } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode; // optional: 아이콘 버튼 넣을 수 있음
}

export default function FloatingLabelInput({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry = false,
  rightIcon,
  ...rest
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedFocus = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedFocus, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 16,
    top: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 6],
    }),
    fontSize: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 10],
    }),
    color: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: ['#999', '#DAD5D1'],
    }),
    pointerEvents: 'none' as const,
  };

  return (
    <View style={styles.wrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        secureTextEntry={secureTextEntry}
        placeholder=""
        {...rest}
      />
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 56,
    width: 300,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    fontSize: 14,
    color: '#000',
    paddingTop: 12,
    paddingBottom: 2,
    fontFamily: 'Freesentation5',
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});
