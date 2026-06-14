import { Pill } from 'lucide-react-native';
import { View } from 'react-native';

import {
  getMedicationSummaryRows,
  MedicationSection,
} from '../../components/catCare/MedicationSection';
import { DashboardHeroCard } from '../../components/dashboard/DashboardHeroCard';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardSaveButton } from '../../components/dashboard/DashboardSaveButton';
import { dashboardStyles } from '../../components/dashboard/dashboardStyles';
import { useCatCare } from '../../contexts/CatCareContext';

export function DashboardMedicationPanel() {
  const {
    medications,
    setMedications,
    medicationErrors,
    addMedication,
    isSavingMedications,
    saveMedications,
  } = useCatCare();

  return (
    <View style={dashboardStyles.panel}>
      <DashboardPageHeader
        title="Medications"
        subtitle="Log doses and set reminder times."
      />

      <DashboardHeroCard
        icon={Pill}
        title="at a glance"
        rows={getMedicationSummaryRows(medications)}
      />

      <MedicationSection
        value={medications}
        onChange={setMedications}
        errors={medicationErrors}
        onAddMedication={addMedication}
      />

      <DashboardSaveButton
        label="Save"
        icon={Pill}
        onPress={saveMedications}
        isLoading={isSavingMedications}
      />
    </View>
  );
}
