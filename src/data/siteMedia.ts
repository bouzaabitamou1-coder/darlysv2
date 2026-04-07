import { mediaUrl } from "@/lib/mediaUrl";

/** Filenames in `public/media/` — hyphens instead of spaces. */
const f = {
  birdRiad: "bird-riad.jpg",
  chairsRiad: "chairs-riad.jpg",
  guestsRiad: "guests-at-riad.jpg",
  guestsRiad2: "guests-at-riad-2.jpg",
  riadFountain: "riad-fountain.jpg",
  riadLobby: "riad-lobby.jpg",
  riadLobby2: "riad-lobby-2.jpg",
  riadLobby3: "riad-lobby3.jpg",
  riadRestaurant: "riad-restaurant.jpg",
  riadView: "riad-view.jpg",
  riadView2: "riad-view2.jpg",
  restaurant2: "restaurant2.jpg",
  table: "table.jpg",
  tableRestaurant: "table-restaurant.jpg",
  terraceRiad: "terrace-riad.jpg",
  laClassique1: "la-classique1.jpg",
  laClassique2: "la-classique-2.jpg",
  laClassique3: "la-classique-3.jpg",
  laDeluxe1: "la-deluxe-1.jpg",
  laDeluxe2: "la-deluxe-2.jpg",
  laDeluxe3: "la-deluxe-3.jpg",
  laDeluxe4: "la-deluxe-4.jpg",
  laDeluxe5: "la-deluxe-5.jpg",
  laLysFamily1: "la-lys-family-1.jpg",
  laLysFamily2: "la-lys-family-2.jpg",
  laLysFamily3: "la-lys-family-3.jpg",
  laLysFamily4: "la-lys-family-4.jpg",
  laLysFamily5: "la-lys-family-5.jpg",
  superior1: "the-superior-1.jpg",
  superior2: "the-superior-2.jpg",
  superior3: "the-superior-3.jpg",
  superior4: "the-superior-4.jpg",
  superior5: "the-superior-5.jpg",
  superior6: "the-superior-6.jpg",
} as const;

const u = (key: keyof typeof f) => mediaUrl(f[key]);

export const photo = {
  heroMain: u("riadView2"),
  patioHero: u("terraceRiad"),
  courtyard: u("riadFountain"),
  patio: u("riadLobby"),
  exterior: u("guestsRiad"),
  salon: u("chairsRiad"),
  spaInterior: u("riadLobby2"),
  roomClassique: u("laClassique1"),
  roomDeluxe: u("laDeluxe1"),
  roomSuperieure: u("superior1"),
  roomFamily: u("laLysFamily1"),
  roomHeroBanner: u("riadView"),
  restaurantZahra: u("riadRestaurant"),
  restaurantPatio: u("tableRestaurant"),
  restaurantBar: u("chairsRiad"),
  diningExtra: u("restaurant2"),
  patioEvening: u("guestsRiad2"),
  riadDetail: u("birdRiad"),
} as const;

/** All images per room type (gallery + main). */
export const roomGallery: Record<string, string[]> = {
  "la-classique": [u("laClassique1"), u("laClassique2"), u("laClassique3")],
  "la-deluxe": [u("laDeluxe1"), u("laDeluxe2"), u("laDeluxe3"), u("laDeluxe4"), u("laDeluxe5")],
  "la-superieure": [u("superior1"), u("superior2"), u("superior3"), u("superior4"), u("superior5"), u("superior6")],
  "la-lys-family": [u("laLysFamily1"), u("laLysFamily2"), u("laLysFamily3"), u("laLysFamily4"), u("laLysFamily5")],
};

export const menuPhoto = {
  briouats: u("tableRestaurant"),
  zaalouk: u("riadRestaurant"),
  harira: u("table"),
  tagine: u("restaurant2"),
  pastilla: u("restaurant2"),
  couscous: u("riadRestaurant"),
  fish: u("tableRestaurant"),
  pastillaLait: u("table"),
  tea: u("chairsRiad"),
  cornes: u("riadLobby3"),
} as const;

export const video = {
  homeHero: mediaUrl("event.mp4"),
  ambience: mediaUrl("restaurant1.mp4"),
  riadWalkthrough: mediaUrl("food-video.mp4"),
  reelRiad: mediaUrl("event.mp4"),
  reelExperience: mediaUrl("food-video.mp4"),
  spa: mediaUrl("spa-video.mp4"),
} as const;

export type GalleryItem =
  | { type: "image"; src: string; category: string; alt: string }
  | { type: "video"; src: string; category: string; alt: string; poster: string };

export const galleryItems: GalleryItem[] = [
  { type: "image", src: photo.heroMain, category: "Riad", alt: "Dar Lys — view of the riad" },
  { type: "image", src: photo.patioHero, category: "Riad", alt: "Terrace" },
  { type: "image", src: photo.courtyard, category: "Riad", alt: "Courtyard fountain" },
  { type: "image", src: photo.patio, category: "Riad", alt: "Riad lobby" },
  { type: "image", src: u("riadLobby2"), category: "Riad", alt: "Interior" },
  { type: "image", src: u("riadLobby3"), category: "Riad", alt: "Dar Lys" },
  { type: "image", src: photo.exterior, category: "Riad", alt: "Guests at the riad" },
  { type: "image", src: photo.patioEvening, category: "Riad", alt: "Evening at Dar Lys" },
  { type: "image", src: photo.riadDetail, category: "Riad", alt: "Courtyard detail" },
  { type: "image", src: u("chairsRiad"), category: "Riad", alt: "Courtyard seating" },
  ...roomGallery["la-classique"].map((src, i) => ({ type: "image" as const, src, category: "Rooms", alt: `La Classique ${i + 1}` })),
  ...roomGallery["la-deluxe"].map((src, i) => ({ type: "image" as const, src, category: "Rooms", alt: `La Deluxe ${i + 1}` })),
  ...roomGallery["la-superieure"].map((src, i) => ({ type: "image" as const, src, category: "Rooms", alt: `The Superior ${i + 1}` })),
  ...roomGallery["la-lys-family"].map((src, i) => ({ type: "image" as const, src, category: "Rooms", alt: `La Lys Family ${i + 1}` })),
  { type: "image", src: photo.restaurantZahra, category: "Dining", alt: "Restaurant" },
  { type: "image", src: photo.restaurantPatio, category: "Dining", alt: "Restaurant table" },
  { type: "image", src: photo.diningExtra, category: "Dining", alt: "Dining room" },
  { type: "image", src: u("table"), category: "Dining", alt: "Table setting" },
  { type: "image", src: photo.spaInterior, category: "Spa", alt: "Spa & well-being" },
  { type: "video", src: video.homeHero, category: "Videos", alt: "Dar Lys — events & riad", poster: photo.heroMain },
  { type: "video", src: video.ambience, category: "Videos", alt: "Restaurant & atmosphere", poster: photo.restaurantZahra },
  { type: "video", src: video.riadWalkthrough, category: "Videos", alt: "Food at Dar Lys", poster: photo.restaurantPatio },
  { type: "video", src: video.spa, category: "Videos", alt: "Lotus Spa", poster: photo.spaInterior },
];
