import { CalendarClock, Utensils } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DashboardSection } from '../dashboard/DashboardSection';
import type { FeedingScheduleErrors, FeedingScheduleInput } from '../../types/catCare';
import { getFeedingModeLabel, getNextFeedingTimeLabel } from '../../lib/feedingSchedule';
import { AuthInput } from '../auth/AuthInput';
import { CareAddButton } from './CareAddButton';
import { CareCollapsible } from './CareCollapsible';
import { FormChipGroup } from './FormChipGroup';
import { FormTimePickerField } from './FormTimePickerField';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const FEEDING_MODE_OPTIONS = [
  { label: 'scheduled meals', value: 'meal_fed' as const },
  { label: 'free feeding', value: 'free_fed' as const },
];

const FOOD_FORMAT_OPTIONS = [
  { label: 'wet', value: 'wet' as const },
  { label: 'dry', value: 'dry' as const },
  { label: 'mixed', value: 'mixed' as const },
  { label: 'homemade', value: 'homemade' as const },
];

const PORTION_UNIT_OPTIONS = [
  { label: 'g', value: 'grams' as const },
  { label: 'oz', value: 'ounces' as const },
  { label: 'cups', value: 'cups' as const },
  { label: 'cans', value: 'cans' as const },
  { label: 'pouches', value: 'pouches' as const },
];

type FeedingScheduleSectionProps = {
  value: FeedingScheduleInput;
  onChange: (value: FeedingScheduleInput) => void;
  errors?: FeedingScheduleErrors;
};

export function getFeedingSummaryRows(value: FeedingScheduleInput) {
  return [
    { label: 'next meal', value: getNextFeedingTimeLabel(value) },
    { label: 'mode', value: getFeedingModeLabel(value.feedingMode) },
    { label: 'meals', value: String(value.feedingTimes.filter(Boolean).length) },
  ];
}

export function FeedingScheduleSection({
  value,
  onChange,
  errors = {},
}: FeedingScheduleSectionProps) {
  const update = <K extends keyof FeedingScheduleInput>(
    key: K,
    nextValue: FeedingScheduleInput[K],
  ) => {
    onChange({ ...value, [key]: nextValue });
  };

  const updateFeedingTime = (timeIndex: number, nextValue: string) => {
    const nextTimes = [...value.feedingTimes];
    nextTimes[timeIndex] = nextValue;
    update('feedingTimes', nextTimes);
  };

  const addFeedingTime = () => {
    update('feedingTimes', [...value.feedingTimes, '']);
  };

  const removeFeedingTime = (timeIndex: number) => {
    if (value.feedingTimes.length === 1) {
      update('feedingTimes', ['']);
      return;
    }

    update(
      'feedingTimes',
      value.feedingTimes.filter((_, currentIndex) => currentIndex !== timeIndex),
    );
  };

  const isMealFed = value.feedingMode === 'meal_fed';

  return (
    <>
      <DashboardSection icon={Utensils} title="Food & schedule">
        <FormChipGroup
          label="how do you feed?"
          value={value.feedingMode}
          options={FEEDING_MODE_OPTIONS}
          onChange={(nextValue) => update('feedingMode', nextValue)}
          error={errors.feedingMode}
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <AuthInput
              label="food"
              value={value.foodType}
              onChangeText={(nextValue) => update('foodType', nextValue)}
              placeholder="indoor formula, kitten..."
              error={errors.foodType}
            />
          </View>
          <View style={styles.flex}>
            <AuthInput
              label="brand"
              value={value.brand}
              onChangeText={(nextValue) => update('brand', nextValue)}
              placeholder="hills, purina..."
              error={errors.brand}
            />
          </View>
        </View>

        <FormChipGroup
          label="food type"
          value={value.foodFormat}
          options={FOOD_FORMAT_OPTIONS}
          onChange={(nextValue) => update('foodFormat', nextValue)}
          error={errors.foodFormat}
        />

        {isMealFed ? (
          <View style={styles.row}>
            <View style={styles.flex}>
              <AuthInput
                label="portion"
                value={value.portionSize}
                onChangeText={(nextValue) => update('portionSize', nextValue)}
                placeholder="45"
                keyboardType="decimal-pad"
                error={errors.portionSize}
              />
            </View>
            <View style={styles.flex}>
              <FormChipGroup
                label="unit"
                value={value.portionUnit}
                options={PORTION_UNIT_OPTIONS}
                onChange={(nextValue) => update('portionUnit', nextValue)}
                error={errors.portionUnit}
              />
            </View>
          </View>
        ) : null}
      </DashboardSection>

      <DashboardSection icon={CalendarClock} title="Meal times">
        {value.feedingTimes.map((time, timeIndex) => (
          <View key={`feeding-time-${timeIndex}`} style={styles.timeRow}>
            <View style={styles.flex}>
              <FormTimePickerField
                label={`meal ${timeIndex + 1}`}
                value={time}
                onChange={(nextValue) => updateFeedingTime(timeIndex, nextValue)}
              />
            </View>
            {value.feedingTimes.length > 1 ? (
              <Pressable onPress={() => removeFeedingTime(timeIndex)} style={styles.timeRemove}>
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        {errors.feedingTimes ? <Text style={styles.error}>{errors.feedingTimes}</Text> : null}

        <CareAddButton label="Add meal time" onPress={addFeedingTime} />

        <CareCollapsible title="notes & extras">
          <AuthInput
            label="treats"
            value={value.treatNotes}
            onChangeText={(nextValue) => update('treatNotes', nextValue)}
            placeholder="optional"
            multiline
            numberOfLines={2}
            style={styles.shortNotes}
            error={errors.treatNotes}
          />
          <AuthInput
            label="water"
            value={value.waterIntakeNotes}
            onChangeText={(nextValue) => update('waterIntakeNotes', nextValue)}
            placeholder="optional"
            multiline
            numberOfLines={2}
            style={styles.shortNotes}
            error={errors.waterIntakeNotes}
          />
          <AuthInput
            label="diet restrictions"
            value={value.dietaryRestrictions}
            onChangeText={(nextValue) => update('dietaryRestrictions', nextValue)}
            placeholder="allergies, vet diet rules..."
            multiline
            numberOfLines={2}
            style={styles.shortNotes}
            error={errors.dietaryRestrictions}
          />
          <AuthInput
            label="special instructions"
            value={value.specialInstructions}
            onChangeText={(nextValue) => update('specialInstructions', nextValue)}
            placeholder="mix ratios, slow feeder..."
            multiline
            numberOfLines={2}
            style={styles.shortNotes}
            error={errors.specialInstructions}
          />
        </CareCollapsible>
      </DashboardSection>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
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
    marginBottom: 0,
  },
  removeText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.stone,
    lineHeight: 24,
  },
  shortNotes: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.error,
    ...lowercase,
  },
});
