import { Trash2 } from 'lucide-react-native';
import { View } from 'react-native';

import { DashboardHeroCard } from '../../components/dashboard/DashboardHeroCard';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardSaveButton } from '../../components/dashboard/DashboardSaveButton';
import { dashboardStyles } from '../../components/dashboard/dashboardStyles';
import {
  getLitterSummaryRows,
  LitterSection,
} from '../../components/catCare/LitterSection';
import { useCatCare } from '../../contexts/CatCareContext';

export function DashboardLitterPanel() {
  const { litter, setLitter, litterErrors, isSavingLitter, saveLitter } = useCatCare();

  return (
    <View style={dashboardStyles.panel}>
      <DashboardPageHeader
        title="Litter"
        subtitle="Track cleaning and spot health changes."
      />

      <DashboardHeroCard
        icon={Trash2}
        title="at a glance"
        rows={getLitterSummaryRows(litter)}
      />

      <LitterSection value={litter} onChange={setLitter} errors={litterErrors} />

      <DashboardSaveButton
        label="Save"
        icon={Trash2}
        onPress={saveLitter}
        isLoading={isSavingLitter}
      />
    </View>
  );
}
