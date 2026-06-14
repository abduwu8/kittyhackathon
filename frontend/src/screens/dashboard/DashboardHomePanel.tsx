import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  HomeDiscoverChip,
  HomeFactCard,
  HomeFeaturedCard,
  HomeMoodBanner,
  HomeTile,
} from '../../components/dashboard/DashboardBentoCard';
import { HomeCareGlance, type CareGlanceItem } from '../../components/dashboard/HomeCareGlance';
import { dashboardStyles } from '../../components/dashboard/dashboardStyles';
import { STORIES } from '../../data/stories';
import { useCatCare } from '../../contexts/CatCareContext';
import { useProfile } from '../../contexts/ProfileContext';
import { getNextFeedingTimeLabel, getFeedingModeLabel } from '../../lib/feedingSchedule';
import { fetchCatImages, getCatImageBreedName, shuffleCatImages } from '../../lib/catApi';
import type { CatApiImage } from '../../types/catApi';
import { fetchCatFact, type CatFact } from '../../lib/catFacts';
import { getCatAvatarSource } from '../../lib/catAvatars';
import { getNextVaccineDue } from '../../lib/vaccinationStatus';
import { countActiveMedications } from '../../lib/medicationStatus';
import { colors } from '../../theme/colors';
import { fonts, lowercase } from '../../theme/fonts';
import type { DashboardSection } from '../../types/dashboard';
import { combineDateAndTime, formatDateTimeLabel } from '../../lib/catCareValidation';

const catBotIcon = require('../../cats/catboticon.png');

const DISCOVER_ACCENT = '#E8A838';
const FACT_ACCENT = '#F5D547';
const FEEDING_ACCENT = '#C98F5A';
const LITTER_ACCENT = '#A8C3A0';
const MED_ACCENT = '#8B5E3C';
const VAX_ACCENT = '#B85C5C';

type DashboardHomePanelProps = {
  onNavigate: (section: DashboardSection) => void;
};

function useLocalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return {
    timeLabel: now.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }),
    dateLabel: now.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  };
}

function getLitterHighlight(litter: ReturnType<typeof useCatCare>['litter']) {
  const lastCleanedAt = combineDateAndTime(litter.lastCleanedDate, litter.lastCleanedTime);
  return formatDateTimeLabel(lastCleanedAt);
}

export function DashboardHomePanel({ onNavigate }: DashboardHomePanelProps) {
  const { profile, hasCat } = useProfile();
  const { catName, catBreed, catAvatar, feeding, litter, medications, vaccinations } =
    useCatCare();
  const { timeLabel, dateLabel } = useLocalClock();

  const moodPageRef = useRef(Math.floor(Math.random() * 12));
  const [moodImage, setMoodImage] = useState<CatApiImage | null>(null);
  const [isLoadingMoodImage, setIsLoadingMoodImage] = useState(true);
  const [isRefreshingMoodImage, setIsRefreshingMoodImage] = useState(false);
  const [catFact, setCatFact] = useState<CatFact | null>(null);
  const [factRevealKey, setFactRevealKey] = useState(0);
  const [isLoadingFact, setIsLoadingFact] = useState(true);
  const [isRefreshingFact, setIsRefreshingFact] = useState(false);

  const loadMoodImage = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshingMoodImage(true);
    } else {
      setIsLoadingMoodImage(true);
    }

    try {
      const page = moodPageRef.current;
      moodPageRef.current += 1;
      const images = shuffleCatImages(await fetchCatImages({ limit: 1, page }));
      setMoodImage(images[0] ?? null);
    } catch {
      if (!refresh) {
        setMoodImage(null);
      }
    } finally {
      setIsLoadingMoodImage(false);
      setIsRefreshingMoodImage(false);
    }
  }, []);

  const loadFact = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshingFact(true);
    } else {
      setIsLoadingFact(true);
    }

    try {
      setCatFact(await fetchCatFact(180));
      setFactRevealKey((key) => key + 1);
    } catch {
      if (!refresh) {
        setCatFact(null);
      }
    } finally {
      setIsLoadingFact(false);
      setIsRefreshingFact(false);
    }
  }, []);

  useEffect(() => {
    void loadMoodImage();
    void loadFact();
  }, [loadFact, loadMoodImage]);

  const greetingName = hasCat
    ? catName.trim() || profile?.cat_name?.trim() || 'your cat'
    : profile?.user_name?.trim() || 'there';

  const nextVaccine = getNextVaccineDue(vaccinations);
  const activeMeds = countActiveMedications(medications);

  const careItems = useMemo<CareGlanceItem[]>(() => {
    const vaxAttention =
      nextVaccine.status === 'overdue' || nextVaccine.status === 'due_soon';

    return [
      {
        id: 'feeding',
        label: 'feeding',
        value: getNextFeedingTimeLabel(feeding),
        detail: getFeedingModeLabel(feeding.feedingMode),
        accentColor: FEEDING_ACCENT,
        section: 'feeding',
        status: 'neutral',
      },
      {
        id: 'litter',
        label: 'litter',
        value: getLitterHighlight(litter),
        detail: litter.abnormalBehavior ? 'unusual behaviour logged' : 'box routine',
        accentColor: LITTER_ACCENT,
        section: 'litter',
        status: litter.abnormalBehavior ? 'attention' : 'good',
      },
      {
        id: 'medication',
        label: 'medication',
        value: activeMeds === 0 ? 'no active meds' : `${activeMeds} active`,
        detail: `${medications.length} total entries`,
        accentColor: MED_ACCENT,
        section: 'medication',
        status: activeMeds > 0 ? 'neutral' : 'good',
      },
      {
        id: 'vaccination',
        label: 'vaccination',
        value: nextVaccine.label,
        detail: nextVaccine.vaccineName,
        accentColor: VAX_ACCENT,
        section: 'vaccination',
        status: vaxAttention ? 'attention' : 'good',
      },
      {
        id: 'profile',
        label: 'profile',
        value: catName.trim() || 'add cat details',
        detail: catBreed.trim() || 'name, breed, photos',
        accentColor: colors.coco,
        section: 'profile',
        status: 'neutral',
      },
    ];
  }, [
    activeMeds,
    catBreed,
    catName,
    feeding,
    litter,
    medications.length,
    nextVaccine.label,
    nextVaccine.status,
    nextVaccine.vaccineName,
  ]);

  return (
    <View style={[dashboardStyles.panel, styles.panel]}>
      <View style={styles.hero}>
        <View style={styles.heroMain}>
          <View style={styles.heroCopy}>
            <Text style={styles.greeting}>welcome back</Text>
            <Text style={styles.heroTitle}>
              {hasCat ? `${greetingName}'s home` : `hi, ${greetingName}`}
            </Text>
            {hasCat && catBreed.trim() ? (
              <Text style={styles.heroMeta}>{catBreed.trim()}</Text>
            ) : null}
          </View>
          {hasCat ? (
            <Image
              source={getCatAvatarSource(catAvatar)}
              style={styles.heroAvatar}
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View style={styles.clockStrip}>
          <Text style={styles.clockTime}>{timeLabel}</Text>
          <Text style={styles.clockDate}>{dateLabel}</Text>
        </View>
      </View>

      <HomeMoodBanner
        uri={moodImage?.url ?? null}
        breedName={getCatImageBreedName(moodImage ?? undefined)}
        isLoading={isLoadingMoodImage}
        isRefreshing={isRefreshingMoodImage}
        onRefresh={() => {
          void loadMoodImage(true);
        }}
        index={1}
      />

      <HomeFactCard
        fact={catFact?.text ?? null}
        factKey={`${catFact?.id ?? 'empty'}-${factRevealKey}`}
        isLoading={isLoadingFact}
        isRefreshing={isRefreshingFact}
        onShuffle={() => {
          void loadFact(true);
        }}
        index={2}
      />

      {hasCat ? (
        <HomeCareGlance items={careItems} onNavigate={onNavigate} />
      ) : (
        <HomeTile
          label="your profile"
          value={profile?.favorite_cat_breed?.trim() || 'finish your setup'}
          hint="tell us about your cat love"
          accentColor={colors.coco}
          onPress={() => onNavigate('profile')}
          index={3}
          style={styles.fullTile}
        />
      )}

      <HomeFeaturedCard
        title="doubts for your cat?"
        body="ask catbot anything about care, behaviour, or those 3am zoomies."
        cta="open catbot"
        accentColor={colors.coco}
        image={catBotIcon}
        onPress={() => onNavigate('catbot')}
        index={8}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>discover</Text>
        <Text style={styles.sectionSubtitle}>cat photos, facts, stories, and more</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.discoverScroll}
        >
          <HomeDiscoverChip
            label="cats"
            description="swipe random feline photos"
            accentColor={DISCOVER_ACCENT}
            onPress={() => onNavigate('discover')}
            index={0}
          />
          <HomeDiscoverChip
            label="facts"
            description="trivia and breed cards"
            accentColor={FACT_ACCENT}
            onPress={() => onNavigate('catfacts')}
            index={1}
          />
          <HomeDiscoverChip
            label="stories"
            description={STORIES[0].title}
            accentColor={colors.sage}
            onPress={() => onNavigate('story')}
            index={2}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 22,
    paddingBottom: 12,
  },
  hero: {
    gap: 14,
    paddingVertical: 4,
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.stone,
    letterSpacing: 0.4,
    ...lowercase,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.5,
    ...lowercase,
  },
  heroMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.stone,
    marginTop: 2,
    ...lowercase,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sand,
    borderWidth: 2,
    borderColor: colors.sandBorder,
  },
  clockStrip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.sandBorder,
  },
  clockTime: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.coco,
    ...lowercase,
  },
  clockDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.stone,
    ...lowercase,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.ink,
    ...lowercase,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.stone,
    marginTop: -8,
    ...lowercase,
  },
  fullTile: {
    flex: undefined,
    width: '100%',
  },
  discoverScroll: {
    gap: 12,
    paddingRight: 4,
    paddingVertical: 2,
  },
});
