// No real photos available for the office/rooms, so we generate stable
// placeholder images (same seed always returns the same photo) instead of
// leaving the design with blank boxes.
export function getRoomImageUri(seed, size = 200) {
  const safeSeed = encodeURIComponent(seed || 'ruang-meeting');
  return `https://picsum.photos/seed/${safeSeed}/${size}/${size}`;
}

export const COVER_IMAGE_URI = 'https://picsum.photos/seed/techtest-office/900/1200';
