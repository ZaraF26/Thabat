export const APP_NAME = "Thabat";

export const PRAYERS = [
  { id: "fajr", name: "Fajr", time: "Dawn", icon: "moon" },
  { id: "dhuhr", name: "Dhuhr", time: "Midday", icon: "sun" },
  { id: "asr", name: "Asr", time: "Afternoon", icon: "cloud-sun" },
  { id: "maghrib", name: "Maghrib", time: "Sunset", icon: "sunset" },
  { id: "isha", name: "Isha", time: "Night", icon: "moon-star" },
];

export const SALAH_STATUSES = [
  { id: "prayed", label: "Prayed", tone: "primary" },
  { id: "qada", label: "Made up (Qada)", tone: "accent" },
  { id: "missed", label: "Missed", tone: "muted" },
];

export const FEELINGS = ["Peaceful", "Grateful", "Connected", "Tired", "Distracted", "Other"];

export const DHIKR_TYPES = [
  "SubhanAllah",
  "Alhamdulillah",
  "Allahu Akbar",
  "Astaghfirullah",
  "Salawat",
  "La ilaha illa Allah",
  "Custom",
];

export const DHIKR_QUICK_ADDS = [1, 10, 33, 100];

export const FOCUS_OPTIONS = [
  "Building consistency",
  "Getting back into regular salah",
  "Keeping track of my prayers",
  "Increasing my dhikr",
  "Reading more Quran",
  "Building a daily spiritual routine",
];

export const SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Aal-E-Imran", "An-Nisa", "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf",
  "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam",
  "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan",
  "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum", "Luqman",
  "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad",
  "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan",
  "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah",
  "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah",
  "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam",
  "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir",
  "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
  "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams",
  "Al-Lail", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr",
  "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", "Al-Qari'ah", "At-Takathur",
  "Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar",
  "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas",
];

// Tasbeeh: 33 beads per complete tasbeeh. One bead per 5 completed salahs.
export const BEADS_PER_TASBEEH = 33;
export const SALAH_PER_BEAD = 5;

// Prayer mats unlock after complete tasbeehs (3 complete tasbeehs = 1 mat, per spec).
export const TASBEEH_PER_MAT = 3;

export const PRAYER_MAT_STYLES = [
  { id: "terracotta", name: "Terracotta Mat", base: "#b5604a", accent: "#e0a06a", pattern: "diamond" },
  { id: "forest", name: "Forest Mat", base: "#5a6b4a", accent: "#a3b58a", pattern: "arch" },
  { id: "geometric", name: "Geometric Mat", base: "#7a4a3a", accent: "#d9a441", pattern: "geometric" },
  { id: "floral", name: "Floral Mat", base: "#a4543a", accent: "#e9c46a", pattern: "floral" },
  { id: "beige", name: "Sandy Mat", base: "#c2a376", accent: "#8a6a3a", pattern: "diamond" },
  { id: "rust", name: "Rust Mat", base: "#9a4a2e", accent: "#e0a06a", pattern: "arch" },
];

// Collectible rewards. `stat` is matched against the user's computed stats.
export const COLLECTION_ITEMS = [
  { id: "star1", category: "Stars", name: "Morning Star", icon: "star", stat: "totalPrayed", value: 25 },
  { id: "star2", category: "Stars", name: "Guiding Star", icon: "star", stat: "totalPrayed", value: 75 },
  { id: "star3", category: "Stars", name: "Bright Star", icon: "star", stat: "totalPrayed", value: 150 },
  { id: "moon1", category: "Moons", name: "Crescent Moon", icon: "moon", stat: "longestStreak", value: 7 },
  { id: "moon2", category: "Moons", name: "Half Moon", icon: "moon", stat: "longestStreak", value: 30 },
  { id: "moon3", category: "Moons", name: "Full Moon", icon: "moon", stat: "longestStreak", value: 60 },
  { id: "lantern1", category: "Lanterns", name: "Brass Lantern", icon: "lantern", stat: "totalPrayed", value: 100 },
  { id: "lantern2", category: "Lanterns", name: "Ornate Lantern", icon: "lantern", stat: "totalPrayed", value: 200 },
  { id: "flower1", category: "Flowers", name: "Desert Bloom", icon: "flower", stat: "totalDhikr", value: 1000 },
  { id: "flower2", category: "Flowers", name: "Olive Branch", icon: "flower", stat: "totalDhikr", value: 5000 },
  { id: "leaf1", category: "Other Rewards", name: "First Leaf", icon: "leaf", stat: "quranPages", value: 30 },
  { id: "book1", category: "Other Rewards", name: "Little Book", icon: "book", stat: "quranPages", value: 100 },
];

export const COLLECTION_CATEGORIES = [
  "Tasbeeh",
  "Prayer Mats",
  "Stars",
  "Moons",
  "Lanterns",
  "Flowers",
  "Other Rewards",
];