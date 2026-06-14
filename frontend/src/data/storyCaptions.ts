export const STORY_CAPTIONS: Record<string, { intro: string; panels: string[] }> = {
  'one-brain-cell': {
    intro: 'What if the fate of Earth depended on a cat whose only skill was sleeping?',
    panels: [
      'a cat spent his entire day doing what he loved most, sleeping.',
      'while rolling around during a nap, he accidentally pressed a strange red button.',
      'the button instantly launched him into outer space.',
      'startled and confused, the cat began wildly waving his paws.',
      'by pure chance, he smacked into a giant vacuum machine floating nearby.',
      'the machine suddenly powered on with a loud roar.',
      'it started sucking up all the space junk surrounding earth.',
      'old rockets, broken satellites, and drifting debris quickly disappeared.',
      "with earth's orbit clean again, the planet was safer than ever.",
      'the cat eventually landed back at home without understanding what had happened.',
      'he yawned, curled up, and went back to sleep—completely unaware that he had just saved the entire world.',
    ],
  },
  'his-meowjesty': {
    intro: 'Humanity searched for a great ruler',
    panels: [
    'a cat climbed onto a cardboard box looking for a better nap spot.',
  'the box rolled down a hill and stopped in front of an ancient castle.',
  'everyone inside thought the cat was a legendary king.',
  'the cat had no idea what was happening.',
  'he wandered through the castle looking for food.',
  'while chasing a butterfly, he accidentally discovered a hidden treasure room.',
  'the kingdom became rich overnight.',
  'the people cheered for their "wise ruler."',
  'the cat accepted the praise and a large bowl of fish.',
  'after dinner, he climbed back into his cardboard box.',
  'the greatest king in history fell asleep before his own celebration.',
    ],
  },
  'internets-unexpected-hero': {
    intro: 'Ctrl + Alt + Meow',
    panels: [
      'one morning, the internet stopped working everywhere.',
  "experts searched for the problem but couldn't find it.",
  'meanwhile, a cat crawled behind a desk chasing a toy.',
  'he found a loose cable dangling from a machine.',
  'thinking it looked fun, he batted it with his paw.',
  'the cable snapped perfectly back into place.',
  'screens across the world lit up again.',
  'people celebrated the return of the internet.',
  'the cat believed he had simply caught his toy.',
  'he proudly carried it away.',
  'humanity never learned who its real hero was.',
    ],
  },
};

export function getStoryCaption(
  storyId: string,
  revealedCount: number,
): string | null {
  const story = STORY_CAPTIONS[storyId];
  if (!story) {
    return null;
  }

  if (revealedCount <= 1) {
    return story.intro;
  }

  return story.panels[Math.min(revealedCount - 2, story.panels.length - 1)] ?? story.intro;
}
