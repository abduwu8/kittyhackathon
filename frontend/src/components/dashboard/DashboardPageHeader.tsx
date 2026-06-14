import { StyleSheet, Text, View } from 'react-native';

import { dashboardStyles } from './dashboardStyles';

type DashboardPageHeaderProps = {
  title: string;
  subtitle: string;
};

export function DashboardPageHeader({ title, subtitle }: DashboardPageHeaderProps) {
  return (
    <View style={dashboardStyles.pageHeader}>
      <Text style={dashboardStyles.pageTitle}>{title}</Text>
      <Text style={dashboardStyles.pageSubtitle}>{subtitle}</Text>
    </View>
  );
}
