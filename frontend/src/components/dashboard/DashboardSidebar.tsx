import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronDown, Compass, LayoutDashboard, LogOut } from 'lucide-react-native';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOptionalAppGuide } from '../../contexts/AppGuideContext';
import { useProfile } from '../../contexts/ProfileContext';
import { getCatAvatarSource } from '../../lib/catAvatars';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import type { DashboardSection } from '../../types/dashboard';

const NAV_ICON_SIZE = 22;
const NAV_IMAGE_ICON_SIZE = 30;
const guideNavIcon = require('../../sidebaricons/guide.png');
const catBotNavIcon = require('../../cats/catboticon.png');
const catNavIcon = require('../../sidebaricons/cat.png');
const catFactsNavIcon = require('../../sidebaricons/catfacts.png');
const feedingNavIcon = require('../../sidebaricons/foodicon.png');
const litterNavIcon = require('../../sidebaricons/littericon.png');
const medicationNavIcon = require('../../sidebaricons/medicationicon.png');
const storiesNavIcon = require('../../sidebaricons/storiesicon.png');
const vaccinationNavIcon = require('../../sidebaricons/vaccinationicon.png');

type NavItem = {
  label: string;
  icon?: LucideIcon;
  imageIcon?: ImageSourcePropType;
  section?: DashboardSection;
  action?: 'guide';
  disabled?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  collapsible: boolean;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'overview',
    collapsible: false,
    items: [{ label: 'home', icon: LayoutDashboard, section: 'home' }],
  },
  {
    id: 'help',
    label: 'help',
    collapsible: false,
    items: [{ label: 'app guide', imageIcon: guideNavIcon, action: 'guide' }],
  },
  {
    id: 'management',
    label: 'management',
    collapsible: true,
    items: [
      { label: 'profile', imageIcon: catNavIcon, section: 'profile' },
      { label: 'litter', imageIcon: litterNavIcon, section: 'litter' },
      { label: 'medication', imageIcon: medicationNavIcon, section: 'medication' },
      { label: 'vaccination', imageIcon: vaccinationNavIcon, section: 'vaccination' },
      { label: 'feeding', imageIcon: feedingNavIcon, section: 'feeding' },
    ],
  },
  {
    id: 'discover',
    label: 'discover',
    collapsible: true,
    items: [
      { label: 'cats', icon: Compass, section: 'discover' },
      { label: 'cat facts', imageIcon: catFactsNavIcon, section: 'catfacts' },
      { label: 'stories', imageIcon: storiesNavIcon, section: 'story' },
      { label: 'cat bot', imageIcon: catBotNavIcon, section: 'catbot' },
    ],
  },
];

type DashboardSidebarProps = {
  activeSection: DashboardSection;
  hasCat: boolean;
  onSectionChange: (section: DashboardSection) => void;
  onSignOut: () => void;
  isSigningOut: boolean;
  onClose: () => void;
};

function groupContainsSection(group: NavGroup, section: DashboardSection) {
  return group.items.some((item) => item.section === section);
}

function buildInitialExpanded(groups: NavGroup[], activeSection: DashboardSection, hasCat: boolean) {
  const expanded: Record<string, boolean> = {};

  for (const group of groups) {
    if (!group.collapsible) {
      continue;
    }

    expanded[group.id] = groupContainsSection(group, activeSection);
  }

  if (!Object.values(expanded).some(Boolean)) {
    expanded.management = hasCat;
    expanded.discover = true;
  }

  return expanded;
}

type NavItemRowProps = {
  item: NavItem;
  index: number;
  isActive: boolean;
  onPress: () => void;
};

function NavItemRow({ item, index, isActive, onPress }: NavItemRowProps) {
  const Icon = item.icon;
  const iconColor = item.disabled
    ? colors.sandBorder
    : isActive
      ? colors.onPrimary
      : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={item.disabled}
      style={({ pressed }) => [
        styles.navItem,
        isActive ? styles.navItemActive : null,
        item.disabled ? styles.navItemDisabled : null,
        pressed && !item.disabled ? styles.navItemPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ disabled: item.disabled, selected: isActive }}
    >
      <View style={styles.navIconSlot}>
        {item.imageIcon ? (
          <Image source={item.imageIcon} style={styles.navImageIcon} resizeMode="contain" />
        ) : Icon ? (
          <Icon size={NAV_ICON_SIZE} color={iconColor} strokeWidth={2.25} />
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          styles.navLabel,
          isActive ? styles.navLabelActive : null,
          item.disabled ? styles.navLabelDisabled : null,
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

type NavGroupSectionProps = {
  group: NavGroup;
  activeSection: DashboardSection;
  expanded: boolean;
  onToggle: () => void;
  onSectionPress: (section: DashboardSection | undefined, disabled?: boolean, action?: 'guide') => void;
};

function NavGroupSection({
  group,
  activeSection,
  expanded,
  onToggle,
  onSectionPress,
}: NavGroupSectionProps) {
  const hasActiveItem = groupContainsSection(group, activeSection);

  if (!group.collapsible) {
    return (
      <View style={styles.navGroup}>
        <Text style={styles.groupLabel}>{group.label}</Text>
        <View style={styles.groupItems}>
          {group.items.map((item, index) => (
            <NavItemRow
              key={item.section ?? `${item.label}-${index}`}
              item={item}
              index={index}
              isActive={Boolean(item.section && !item.disabled && activeSection === item.section)}
              onPress={() => onSectionPress(item.section, item.disabled, item.action)}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.navGroup}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.groupHeader,
          hasActiveItem ? styles.groupHeaderActive : null,
          pressed ? styles.groupHeaderPressed : null,
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${group.label} menu`}
      >
        <Text style={[styles.groupLabel, styles.groupHeaderLabel, hasActiveItem ? styles.groupLabelActive : null]}>
          {group.label}
        </Text>
        <MotiView
          animate={{ rotate: expanded ? '180deg' : '0deg' }}
          transition={{ type: 'timing', duration: 220 }}
        >
          <ChevronDown
            size={16}
            color={hasActiveItem ? colors.coco : colors.stone}
            strokeWidth={2.4}
          />
        </MotiView>
      </Pressable>

      <AnimatePresence initial={false}>
        {expanded ? (
          <MotiView
            key={`${group.id}-items`}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <View style={styles.groupItems}>
              {group.items.map((item, index) => (
                <NavItemRow
                  key={item.section ?? `${item.label}-${index}`}
                  item={item}
                  index={index}
                  isActive={Boolean(item.section && !item.disabled && activeSection === item.section)}
                  onPress={() => onSectionPress(item.section, item.disabled, item.action)}
                />
              ))}
            </View>
          </MotiView>
        ) : null}
      </AnimatePresence>
    </View>
  );
}

export function DashboardSidebar({
  activeSection,
  hasCat,
  onSectionChange,
  onSignOut,
  isSigningOut,
  onClose,
}: DashboardSidebarProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const appGuide = useOptionalAppGuide();
  const brandTitle = hasCat
    ? 'cat dashboard'
    : profile?.user_name?.trim() || 'your profile';
  const brandSubtitle = hasCat
    ? profile?.cat_name ?? 'your cat'
    : profile?.favorite_cat_breed?.trim()
      ? `loves ${profile.favorite_cat_breed.trim()}`
      : null;
  const avatarSource = getCatAvatarSource(profile?.cat_avatar);

  const navGroups = useMemo(
    () =>
      NAV_GROUPS.map((group) => {
        if (group.id === 'overview') {
          return group;
        }

        if (group.id !== 'management') {
          return group;
        }

        return {
          ...group,
          label: hasCat ? group.label : 'profile',
          items: hasCat
            ? group.items
            : group.items.filter((item) => item.section === 'profile'),
        };
      }),
    [hasCat],
  );

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    buildInitialExpanded(navGroups, activeSection, hasCat),
  );

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = { ...current };

      for (const group of navGroups) {
        if (group.collapsible && groupContainsSection(group, activeSection)) {
          next[group.id] = true;
        }
      }

      return next;
    });
  }, [activeSection, navGroups]);

  const handleSectionPress = (
    section: DashboardSection | undefined,
    disabled?: boolean,
    action?: 'guide',
  ) => {
    if (disabled) {
      return;
    }

    if (action === 'guide') {
      appGuide?.openGuide();
      onClose();
      return;
    }

    if (!section) {
      return;
    }

    onSectionChange(section);
    onClose();
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.brandBlock}>
        <Image source={avatarSource} style={styles.brandAvatar} resizeMode="cover" />
        <Text style={styles.brandTitle}>{brandTitle}</Text>
        {brandSubtitle ? <Text style={styles.brandSubtitle}>{brandSubtitle}</Text> : null}
      </View>

      <ScrollView
        style={styles.navScroll}
        contentContainerStyle={styles.navScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {navGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            activeSection={activeSection}
            expanded={expandedGroups[group.id] ?? false}
            onToggle={() => toggleGroup(group.id)}
            onSectionPress={handleSectionPress}
          />
        ))}
      </ScrollView>

      <Pressable
        onPress={onSignOut}
        disabled={isSigningOut}
        style={({ pressed }) => [
          styles.signOutButton,
          isSigningOut ? styles.signOutDisabled : null,
          pressed ? styles.signOutPressed : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel="sign out"
      >
        <LogOut size={20} color={colors.stone} strokeWidth={2} />
        <Text style={styles.signOutText}>{isSigningOut ? 'signing out...' : 'sign out'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 16,
    flexShrink: 0,
  },
  brandAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.sand,
  },
  brandTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
    ...lowercase,
  },
  brandSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.stone,
    textAlign: 'center',
    ...lowercase,
  },
  navScroll: {
    flex: 1,
    minHeight: 0,
  },
  navScrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  navGroup: {
    gap: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  groupHeaderActive: {
    backgroundColor: 'rgba(139, 94, 60, 0.08)',
  },
  groupHeaderPressed: {
    backgroundColor: colors.sand,
  },
  groupHeaderLabel: {
    flex: 1,
    textAlign: 'left',
  },
  groupLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.stone,
    letterSpacing: 0.4,
    ...lowercase,
  },
  groupLabelActive: {
    color: colors.coco,
  },
  groupItems: {
    gap: 4,
    paddingTop: 2,
    paddingLeft: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 10,
  },
  navItemActive: {
    backgroundColor: colors.coco,
  },
  navItemPressed: {
    backgroundColor: colors.sand,
  },
  navItemDisabled: {
    opacity: 0.45,
  },
  navIconSlot: {
    width: NAV_IMAGE_ICON_SIZE,
    height: NAV_IMAGE_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navImageIcon: {
    width: NAV_IMAGE_ICON_SIZE,
    height: NAV_IMAGE_ICON_SIZE,
  },
  navLabel: {
    flex: 1,
    flexShrink: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
    ...lowercase,
  },
  navLabelActive: {
    color: colors.onPrimary,
  },
  navLabelDisabled: {
    color: colors.stone,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    flexShrink: 0,
  },
  signOutDisabled: {
    opacity: 0.6,
  },
  signOutPressed: {
    opacity: 0.7,
  },
  signOutText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.stone,
    ...lowercase,
  },
});
