import { Syringe } from 'lucide-react-native';
import { View } from 'react-native';

import {
  getVaccinationSummaryRows,
  VaccinationSection,
} from '../../components/catCare/VaccinationSection';
import { DashboardHeroCard } from '../../components/dashboard/DashboardHeroCard';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardSaveButton } from '../../components/dashboard/DashboardSaveButton';
import { dashboardStyles } from '../../components/dashboard/dashboardStyles';
import { useCatCare } from '../../contexts/CatCareContext';

export function DashboardVaccinationPanel() {
  const {
    vaccinations,
    setVaccinations,
    vaccinationErrors,
    addVaccination,
    isSavingVaccinations,
    saveVaccinations,
  } = useCatCare();

  return (
    <View style={dashboardStyles.panel}>
      <DashboardPageHeader
        title="Vaccinations"
        subtitle="Track vaccines and upcoming due dates."
      />

      <DashboardHeroCard
        icon={Syringe}
        title="at a glance"
        rows={getVaccinationSummaryRows(vaccinations)}
      />

      <VaccinationSection
        value={vaccinations}
        onChange={setVaccinations}
        errors={vaccinationErrors}
        onAddVaccination={addVaccination}
      />

      <DashboardSaveButton
        label="Save"
        icon={Syringe}
        onPress={saveVaccinations}
        isLoading={isSavingVaccinations}
      />
    </View>
  );
}
