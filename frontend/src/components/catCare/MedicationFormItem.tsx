import { Pill } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MedicationFieldErrors, MedicationInput, MedicationStatus } from '../../types/catCare';
import { deriveMedicationStatus, getMedicationStatusLabel } from '../../lib/medicationStatus';
import { AuthInput } from '../auth/AuthInput';
import { CareAddButton } from './CareAddButton';
import { CareCollapsible } from './CareCollapsible';
import { FormChipGroup } from './FormChipGroup';
import { FormTimePickerField } from './FormTimePickerField';
import { FormToggle } from './FormToggle';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const UNIT_OPTIONS = [
  { label: 'mg', value: 'mg' as const },
  { label: 'ml', value: 'ml' as const },
  { label: 'tablet', value: 'tablet' as const },
  { label: 'capsule', value: 'capsule' as const },
  { label: 'drop', value: 'drop' as const },
  { label: 'unit', value: 'unit' as const },
];

const STATUS_OPTIONS = [
  { label: 'active', value: 'active' as const },
  { label: 'inactive', value: 'inactive' as const },
  { label: 'completed', value: 'completed' as const },
  { label: 'upcoming', value: 'upcoming' as const },
];

const STATUS_CHIP_STYLES: Record<MedicationStatus, { backgroundColor: string; color: string }> = {
  active: { backgroundColor: 'rgba(110, 155, 107, 0.14)', color: colors.success },
  completed: { backgroundColor: 'rgba(110, 101, 93, 0.12)', color: colors.stone },
  upcoming: { backgroundColor: 'rgba(201, 143, 90, 0.16)', color: colors.caramel },
  inactive: { backgroundColor: 'rgba(110, 101, 93, 0.12)', color: colors.stone },
};

type MedicationFormItemProps = {
  medication: MedicationInput;
  index: number;
  errors?: MedicationFieldErrors;
  onChange: (medication: MedicationInput) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export function MedicationFormItem({
  medication,
  index,
  errors = {},
  onChange,
  onRemove,
  canRemove,
}: MedicationFormItemProps) {
  const derivedStatus = deriveMedicationStatus(medication);
  const chipStyle = STATUS_CHIP_STYLES[derivedStatus];
  const displayName = medication.name.trim() || `medication ${index + 1}`;

  const update = <K extends keyof MedicationInput>(
    key: K,
    nextValue: MedicationInput[K],
  ) => {
    onChange({ ...medication, [key]: nextValue });
  };

  const updateTime = (timeIndex: number, nextValue: string) => {
    const nextTimes = [...medication.timesToGive];
    nextTimes[timeIndex] = nextValue;
    update('timesToGive', nextTimes);
  };

  const addTime = () => {
    update('timesToGive', [...medication.timesToGive, '']);
  };

  const removeTime = (timeIndex: number) => {
    if (medication.timesToGive.length === 1) {
      update('timesToGive', ['']);
      return;
    }

    update(
      'timesToGive',
      medication.timesToGive.filter((_, currentIndex) => currentIndex !== timeIndex),
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={styles.cardIconWrap}>
            <Pill size={18} color={colors.coco} strokeWidth={2.25} />
          </View>
          <View style={styles.cardTitleContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={[styles.statusChip, { backgroundColor: chipStyle.backgroundColor }]}>
              <Text style={[styles.statusChipText, { color: chipStyle.color }]}>
                {getMedicationStatusLabel(derivedStatus)}
              </Text>
            </View>
          </View>
        </View>
        {canRemove ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <AuthInput
        label="name"
        value={medication.name}
        onChangeText={(nextValue) => update('name', nextValue)}
        placeholder="prednisolone"
        error={errors.name}
      />

      <AuthInput
        label="purpose"
        value={medication.purpose}
        onChangeText={(nextValue) => update('purpose', nextValue)}
        placeholder="inflammation, parasite prevention..."
        error={errors.purpose}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <AuthInput
            label="dose"
            value={medication.dosage}
            onChangeText={(nextValue) => update('dosage', nextValue)}
            placeholder="5"
            keyboardType="decimal-pad"
            error={errors.dosage}
          />
        </View>
        <View style={styles.flex}>
          <FormChipGroup
            label="unit"
            value={medication.unit}
            options={UNIT_OPTIONS}
            onChange={(nextValue) => update('unit', nextValue)}
            error={errors.unit}
          />
        </View>
      </View>

      <AuthInput
        label="frequency"
        value={medication.frequency}
        onChangeText={(nextValue) => update('frequency', nextValue)}
        placeholder="once daily, every 12 hours..."
        error={errors.frequency}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <AuthInput
            label="start date"
            value={medication.startDate}
            onChangeText={(nextValue) => update('startDate', nextValue)}
            placeholder="2026-06-01"
            keyboardType="numbers-and-punctuation"
            error={errors.startDate}
          />
        </View>
        <View style={styles.flex}>
          <AuthInput
            label="end date"
            value={medication.endDate}
            onChangeText={(nextValue) => update('endDate', nextValue)}
            placeholder="optional"
            keyboardType="numbers-and-punctuation"
            error={errors.endDate}
          />
        </View>
      </View>

      <View style={styles.timesBlock}>
        <Text style={styles.timesLabel}>reminder times</Text>
        {medication.timesToGive.map((time, timeIndex) => (
          <View key={`${medication.id}-time-${timeIndex}`} style={styles.timeRow}>
            <View style={styles.flex}>
              <FormTimePickerField
                label={`time ${timeIndex + 1}`}
                value={time}
                onChange={(nextValue) => updateTime(timeIndex, nextValue)}
              />
            </View>
            {medication.timesToGive.length > 1 ? (
              <Pressable onPress={() => removeTime(timeIndex)} style={styles.timeRemove}>
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
        {errors.timesToGive ? <Text style={styles.error}>{errors.timesToGive}</Text> : null}
        <CareAddButton label="Add time" onPress={addTime} />
      </View>

      <FormToggle
        label="give with food"
        value={medication.withFood}
        onChange={(nextValue) => update('withFood', nextValue)}
      />

      <CareCollapsible title="status & notes">
        <FormChipGroup
          label="status"
          value={medication.status}
          options={STATUS_OPTIONS}
          onChange={(nextValue) => update('status', nextValue)}
        />

        <AuthInput
          label="notes"
          value={medication.notes}
          onChangeText={(nextValue) => update('notes', nextValue)}
          placeholder="side effects, refill date..."
          multiline
          numberOfLines={2}
          style={styles.notesInput}
          error={errors.notes}
        />
      </CareCollapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sandBorder,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 94, 60, 0.1)',
  },
  cardTitleContent: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    ...lowercase,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChipText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    ...lowercase,
  },
  removeText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.stone,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  timesBlock: {
    gap: 10,
  },
  timesLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.ink,
    ...lowercase,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  timeRemove: {
    width: 32,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    ...lowercase,
  },
});
