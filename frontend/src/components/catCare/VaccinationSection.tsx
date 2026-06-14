import { Syringe } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';

import { DashboardSection } from '../dashboard/DashboardSection';
import type { VaccinationErrorsMap, VaccinationInput } from '../../types/catCare';
import { getNextVaccineDue, getVaccinationStatusLabel } from '../../lib/vaccinationStatus';
import { CareAddButton } from './CareAddButton';
import { VaccinationFormItem } from './VaccinationFormItem';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

type VaccinationSectionProps = {
  value: VaccinationInput[];
  onChange: (value: VaccinationInput[]) => void;
  errors?: VaccinationErrorsMap;
  onAddVaccination: () => void;
};

export function getVaccinationSummaryRows(value: VaccinationInput[]) {
  const nextDue = getNextVaccineDue(value);

  return [
    {
      label: 'next due',
      value: nextDue.label,
      highlight: nextDue.status === 'overdue' || nextDue.status === 'due_soon',
    },
    { label: 'vaccine', value: nextDue.vaccineName },
    {
      label: 'status',
      value: getVaccinationStatusLabel(nextDue.status),
      highlight: nextDue.status === 'overdue',
    },
  ];
}

export function VaccinationSection({
  value,
  onChange,
  errors = {},
  onAddVaccination,
}: VaccinationSectionProps) {
  const updateVaccination = (index: number, nextVaccination: VaccinationInput) => {
    onChange(
      value.map((vaccination, currentIndex) =>
        currentIndex === index ? nextVaccination : vaccination,
      ),
    );
  };

  const removeVaccination = (index: number) => {
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <DashboardSection icon={Syringe} title="Vaccines">
      {value.map((vaccination, index) => (
        <VaccinationFormItem
          key={vaccination.id}
          vaccination={vaccination}
          index={index}
          errors={errors[vaccination.id]}
          onChange={(nextVaccination) => updateVaccination(index, nextVaccination)}
          onRemove={() => removeVaccination(index)}
          canRemove={value.length > 1}
        />
      ))}

      <CareAddButton label="Add vaccine" onPress={onAddVaccination} />

      {value.length === 0 ? (
        <Text style={styles.emptyText}>add a vaccine to track due dates.</Text>
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
