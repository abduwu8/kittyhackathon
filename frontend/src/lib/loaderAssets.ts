const LOADER_SOURCES = [
  require('../loader/loader1.gif'),
  require('../loader/loader2.gif'),
  require('../loader/Loading Cat.gif'),
] as const;

export function pickRandomLoaderSource() {
  const index = Math.floor(Math.random() * LOADER_SOURCES.length);
  return LOADER_SOURCES[index];
}
