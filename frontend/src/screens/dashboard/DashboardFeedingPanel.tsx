import { Utensils } from 'lucide-react-native';
import { View } from 'react-native';

import {
  FeedingScheduleSection,
  getFeedingSummaryRows,
} from '../../components/catCare/FeedingScheduleSection';
import { DashboardHeroCard } from '../../components/dashboard/DashboardHeroCard';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardSaveButton } from '../../components/dashboard/DashboardSaveButton';
import { dashboardStyles } from '../../components/dashboard/dashboardStyles';
import { useCatCare } from '../../contexts/CatCareContext';

export function DashboardFeedingPanel() {
  const {
    feeding,
    setFeeding,
    feedingErrors,
    isSavingFeeding,
    saveFeeding,
  } = useCatCare();

  return (
    <View style={dashboardStyles.panel}>
      <DashboardPageHeader
        title="Food & Feeding"
        subtitle="Set meal times and track what your cat eats."
      />

      <DashboardHeroCard
        icon={Utensils}
        title="at a glance"
        rows={getFeedingSummaryRows(feeding)}
      />

      <FeedingScheduleSection value={feeding} onChange={setFeeding} errors={feedingErrors} />

      <DashboardSaveButton
        label="Save"
        icon={Utensils}
        onPress={saveFeeding}
        isLoading={isSavingFeeding}
      />
    </View>
  );
}
