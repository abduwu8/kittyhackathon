import { Pill } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';

import { DashboardSection } from '../dashboard/DashboardSection';
import type { MedicationErrorsMap, MedicationInput } from '../../types/catCare';
import { countActiveMedications } from '../../lib/medicationStatus';
import { CareAddButton } from './CareAddButton';
import { MedicationFormItem } from './MedicationFormItem';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type MedicationSectionProps = {
  value: MedicationInput[];
  onChange: (value: MedicationInput[]) => void;
  errors?: MedicationErrorsMap;
  onAddMedication: () => void;
};

export function getMedicationSummaryRows(value: MedicationInput[]) {
  const activeCount = countActiveMedications(value);
  const reminderTimes = value.reduce(
    (total, medication) => total + medication.timesToGive.filter(Boolean).length,
    0,
  );

  return [
    { label: 'active', value: String(activeCount) },
    { label: 'total', value: String(value.length) },
    { label: 'reminders', value: String(reminderTimes) },
  ];
}

export function MedicationSection({
  value,
  onChange,
  errors = {},
  onAddMedication,
}: MedicationSectionProps) {
  const updateMedication = (index: number, nextMedication: MedicationInput) => {
    onChange(value.map((medication, currentIndex) =>
      currentIndex === index ? nextMedication : medication,
    ));
  };

  const removeMedication = (index: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <DashboardSection icon={Pill} title="Medications">
      {value.map((medication, index) => (
        <MedicationFormItem
          key={medication.id}
          medication={medication}
          index={index}
          errors={errors[medication.id]}
          onChange={(nextMedication) => updateMedication(index, nextMedication)}
          onRemove={() => removeMedication(index)}
          canRemove={value.length > 1}
        />
      ))}

      <CareAddButton label="Add medication" onPress={onAddMedication} />

      {value.length === 0 ? (
        <Text style={styles.emptyText}>add a medication to track doses.</Text>
      ) : null}
    </DashboardSection>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.stone,
    textAlign: 'center',
    ...lowercase,
  },
});
