import artistCapitalizationPatches from '../json/artist-capitalization-patches.js';
import mbidPatches from '../json/mbid-patches.js';

export const artistCapitalization = (artist) => artistCapitalizationPatches[artist?.toLowerCase()] || artist

export const sanitizeMediaString = (string) => {
  const normalizedStr = string.normalize('NFD');
  return normalizedStr.replace(/[\u0300-\u036f]/g, '').replace(/\.{3}/g, '');
};

export const mbidMap = (artist) => mbidPatches[artist.toLowerCase()] || ''