import { Syringe } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { VaccinationFieldErrors, VaccinationInput, VaccinationStatus } from '../../types/catCare';
import {
  deriveVaccinationStatus,
  getVaccinationStatusLabel,
} from '../../lib/vaccinationStatus';
import { AuthInput } from '../auth/AuthInput';
import { CareCollapsible } from './CareCollapsible';
import { DocumentUploadField } from './DocumentUploadField';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';

const STATUS_CHIP_STYLES: Record<VaccinationStatus, { backgroundColor: string; color: string }> = {
  up_to_date: { backgroundColor: 'rgba(110, 155, 107, 0.14)', color: colors.success },
  due_soon: { backgroundColor: 'rgba(201, 143, 90, 0.16)', color: colors.caramel },
  overdue: { backgroundColor: 'rgba(184, 92, 92, 0.12)', color: colors.error },
};

type VaccinationFormItemProps = {
  vaccination: VaccinationInput;
  index: number;
  errors?: VaccinationFieldErrors;
  onChange: (vaccination: VaccinationInput) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export function VaccinationFormItem({
  vaccination,
  index,
  errors = {},
  onChange,
  onRemove,
  canRemove,
}: VaccinationFormItemProps) {
  const status = deriveVaccinationStatus(vaccination.nextDueDate);
  const chipStyle = STATUS_CHIP_STYLES[status];
  const displayName = vaccination.vaccineName.trim() || `vaccine ${index + 1}`;

  const update = <K extends keyof VaccinationInput>(
    key: K,
    nextValue: VaccinationInput[K],
  ) => {
    onChange({ ...vaccination, [key]: nextValue });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={styles.cardIconWrap}>
            <Syringe size={18} color={colors.coco} strokeWidth={2.25} />
          </View>
          <View style={styles.cardTitleContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={[styles.statusChip, { backgroundColor: chipStyle.backgroundColor }]}>
              <Text style={[styles.statusChipText, { color: chipStyle.color }]}>
                {getVaccinationStatusLabel(status)}
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
        label="vaccine"
        value={vaccination.vaccineName}
        onChangeText={(nextValue) => update('vaccineName', nextValue)}
        placeholder="fvrcp, rabies, felv..."
        error={errors.vaccineName}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <AuthInput
            label="date given"
            value={vaccination.dateGiven}
            onChangeText={(nextValue) => update('dateGiven', nextValue)}
            placeholder="2026-01-15"
            keyboardType="numbers-and-punctuation"
            error={errors.dateGiven}
          />
        </View>
        <View style={styles.flex}>
          <AuthInput
            label="next due"
            value={vaccination.nextDueDate}
            onChangeText={(nextValue) => update('nextDueDate', nextValue)}
            placeholder="2027-01-15"
            keyboardType="numbers-and-punctuation"
            error={errors.nextDueDate}
          />
        </View>
      </View>

      <AuthInput
        label="vet / clinic"
        value={vaccination.vetClinicName}
        onChangeText={(nextValue) => update('vetClinicName', nextValue)}
        placeholder="clinic name"
        error={errors.vetClinicName}
      />

      <CareCollapsible title="certificate & notes">
        <AuthInput
          label="batch / certificate #"
          value={vaccination.batchOrCertificateNumber}
          onChangeText={(nextValue) => update('batchOrCertificateNumber', nextValue)}
          placeholder="optional"
          error={errors.batchOrCertificateNumber}
        />

        <DocumentUploadField
          label="proof document"
          fileName={vaccination.proofDocumentName}
          onPick={(fileName, fileUri) => {
            update('proofDocumentName', fileName);
            update('proofDocumentUri', fileUri);
          }}
          onClear={() => {
            update('proofDocumentName', '');
            update('proofDocumentUri', '');
          }}
          error={errors.proofDocumentName}
        />

        <AuthInput
          label="notes"
          value={vaccination.notes}
          onChangeText={(nextValue) => update('notes', nextValue)}
          placeholder="reactions, booster history..."
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
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
});
