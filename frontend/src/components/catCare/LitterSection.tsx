import { Box } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { DashboardSection } from '../dashboard/DashboardSection';
import type {
  CleaningFrequency,
  EliminationObservation,
  LitterBoxType,
  LitterTrackingErrors,
  LitterTrackingInput,
} from '../../types/catCare';
import {
  combineDateAndTime,
  formatDateTimeLabel,
} from '../../lib/catCareValidation';
import { AuthInput } from '../auth/AuthInput';
import { CareCollapsible } from './CareCollapsible';
import { FormChipGroup } from './FormChipGroup';
import { FormDateTimeField } from './FormDateTimeField';
import { FormToggle } from './FormToggle';

const LITTER_BOX_OPTIONS: Array<{ label: string; value: LitterBoxType }> = [
  { label: 'open', value: 'open' },
  { label: 'covered', value: 'covered' },
  { label: 'top entry', value: 'top_entry' },
  { label: 'auto', value: 'automatic' },
  { label: 'other', value: 'other' },
];

const CLEANING_FREQUENCY_OPTIONS: Array<{ label: string; value: CleaningFrequency }> = [
  { label: 'daily', value: 'daily' },
  { label: 'every 2 days', value: 'every_other_day' },
  { label: '2× weekly', value: 'twice_weekly' },
  { label: 'weekly', value: 'weekly' },
  { label: 'as needed', value: 'as_needed' },
];

const OBSERVATION_OPTIONS: Array<{ label: string; value: EliminationObservation }> = [
  { label: 'normal', value: 'normal' },
  { label: 'small', value: 'small_amount' },
  { label: 'large', value: 'large_amount' },
  { label: 'none', value: 'none' },
  { label: 'concerning', value: 'concerning' },
];

const FREQUENCY_LABELS: Record<CleaningFrequency, string> = {
  daily: 'daily',
  every_other_day: 'every 2 days',
  twice_weekly: '2× weekly',
  weekly: 'weekly',
  as_needed: 'as needed',
};

type LitterSectionProps = {
  value: LitterTrackingInput;
  onChange: (value: LitterTrackingInput) => void;
  errors?: LitterTrackingErrors;
};

export function getLitterSummaryRows(value: LitterTrackingInput) {
  const lastCleanedAt = combineDateAndTime(value.lastCleanedDate, value.lastCleanedTime);
  const cleaningFrequencyLabel = value.cleaningFrequency
    ? FREQUENCY_LABELS[value.cleaningFrequency]
    : 'not set';

  return [
    { label: 'last cleaned', value: formatDateTimeLabel(lastCleanedAt) },
    { label: 'frequency', value: cleaningFrequencyLabel },
    {
      label: 'concern',
      value: value.abnormalBehavior ? 'yes' : 'no',
      highlight: value.abnormalBehavior,
    },
  ];
}

export function LitterSection({ value, onChange, errors = {} }: LitterSectionProps) {
  const update = <K extends keyof LitterTrackingInput>(
    key: K,
    nextValue: LitterTrackingInput[K],
  ) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <DashboardSection icon={Box} title="Litter care">
      <FormChipGroup
        label="box type"
        value={value.litterBoxType}
        options={LITTER_BOX_OPTIONS}
        onChange={(nextValue) => update('litterBoxType', nextValue)}
        error={errors.litterBoxType}
      />

      <AuthInput
        label="litter"
        value={value.litterType}
        onChangeText={(nextValue) => update('litterType', nextValue)}
        placeholder="clumping clay, tofu, pine..."
        error={errors.litterType}
      />

      <AuthInput
        label="number of boxes"
        value={value.numberOfBoxes}
        onChangeText={(nextValue) => update('numberOfBoxes', nextValue)}
        placeholder="1"
        keyboardType="number-pad"
        error={errors.numberOfBoxes}
      />

      <FormDateTimeField
        dateLabel="last cleaned"
        timeLabel="time"
        dateValue={value.lastCleanedDate}
        timeValue={value.lastCleanedTime}
        onDateChange={(nextValue) => update('lastCleanedDate', nextValue)}
        onTimeChange={(nextValue) => update('lastCleanedTime', nextValue)}
        dateError={errors.lastCleanedDate}
        timeError={errors.lastCleanedTime}
      />

      <FormChipGroup
        label="how often do you clean?"
        value={value.cleaningFrequency}
        options={CLEANING_FREQUENCY_OPTIONS}
        onChange={(nextValue) => update('cleaningFrequency', nextValue)}
        error={errors.cleaningFrequency}
      />

      <FormChipGroup
        label="urine"
        value={value.urineObservation}
        options={OBSERVATION_OPTIONS}
        onChange={(nextValue) => update('urineObservation', nextValue)}
        error={errors.urineObservation}
      />

      <FormChipGroup
        label="stool"
        value={value.stoolObservation}
        options={OBSERVATION_OPTIONS}
        onChange={(nextValue) => update('stoolObservation', nextValue)}
        error={errors.stoolObservation}
      />

      <FormToggle
        label="unusual behavior"
        value={value.abnormalBehavior}
        onChange={(nextValue) => update('abnormalBehavior', nextValue)}
      />

      <CareCollapsible title="notes">
        <AuthInput
          label="notes"
          value={value.notes}
          onChangeText={(nextValue) => update('notes', nextValue)}
          placeholder="odor changes, accidents, litter switch..."
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />
      </CareCollapsible>
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
