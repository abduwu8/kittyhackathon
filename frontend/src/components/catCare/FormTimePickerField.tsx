import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '../auth/AuthInput';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import { formatTimeFromDate, formatTimeLabel, parseTimeToDate } from '../../lib/timeFormat';

type FormTimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function FormTimePickerField({
  label,
  value,
  onChange,
  error,
}: FormTimePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <AuthInput
        label={label}
        value={value}
        onChangeText={onChange}
        placeholder="07:30"
        keyboardType="numbers-and-punctuation"
        error={error}
      />
    );
  }

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    onChange(formatTimeFromDate(selectedDate));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [
          styles.trigger,
          error ? styles.triggerError : null,
          pressed ? styles.triggerPressed : null,
        ]}
      >
        <Clock size={20} color={colors.coco} strokeWidth={2} />
        <Text style={[styles.triggerText, !value ? styles.placeholder : null]}>
          {value ? formatTimeLabel(value) : 'select time'}
        </Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {showPicker ? (
        <DateTimePicker
          value={parseTimeToDate(value)}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <Pressable
          onPress={() => setShowPicker(false)}
          style={({ pressed }) => [styles.doneButton, pressed ? styles.doneButtonPressed : null]}
        >
          <Text style={styles.doneButtonText}>done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.stone,
    ...lowercase,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    backgroundColor: colors.surface,
  },
  triggerError: {
    borderColor: colors.error,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  triggerText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
    ...lowercase,
  },
  placeholder: {
    color: colors.stone,
    fontFamily: fonts.regular,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    ...lowercase,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  doneButtonPressed: {
    opacity: 0.85,
  },
  doneButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.coco,
    ...lowercase,
  },
});
