import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { dashboardStyles } from './dashboardStyles';

type DashboardSectionProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

const SECTION_ICON_SIZE = 18;

export function DashboardSection({ icon: Icon, title, children }: DashboardSectionProps) {
  return (
    <View style={dashboardStyles.section}>
      <View style={dashboardStyles.sectionHeading}>
        <View style={dashboardStyles.sectionIconWrap}>
          <Icon size={SECTION_ICON_SIZE} color={colors.coco} strokeWidth={2.25} />
        </View>
        <View style={dashboardStyles.sectionTitleWrap}>
          <Text style={dashboardStyles.sectionTitle}>{title}</Text>
          <View style={dashboardStyles.sectionTitleAccent} />
        </View>
      </View>
      <View style={dashboardStyles.sectionCard}>{children}</View>
    </View>
  );
}
