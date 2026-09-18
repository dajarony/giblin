import { StationData, UpgradeItem, PaintScheme, PassengerStory, Achievement } from '../types/game';

export const STATIONS: StationData[] = [
  {
    id: 'saltlight',
    name: 'Saltlight Terminus',
    u: 0.05,
    desc: 'Historic coastal lighthouse arches and cliffside terracotta villas.',
    region: 'South Cliff Bay',
    tagline: 'Where the sea breeze meets the mountain rail',
    color: '#3d7b88',
    unlockedStory: 'Built in 1894 by master stonemasons, Saltlight is the oldest aerial rail station in the archipelago.'
  },
  {
    id: 'highpines',
    name: 'High Pines Sky Bridge',
    u: 0.32,
    desc: 'Breathtaking viaduct spanning across high alpine pines and mist canyons.',
    region: 'The Whispering Spire',
    tagline: 'Perched 500 meters above the morning cloud sea',
    color: '#2e633d',
    unlockedStory: 'The High Pines viaduct is anchored to ancient petrified cedar roots that defy high mountain storms.'
  },
  {
    id: 'mangotide',
    name: 'Mango Tide Pier',
    u: 0.58,
    desc: 'Sunny terracotta terraces, citrus groves, and warm shallow tide pools.',
    region: 'East Coral Shallows',
    tagline: 'Fragrant blossoms & bustling fish markets',
    color: '#c2593f',
    unlockedStory: 'Every sunset, local traders load baskets of dried mango slices and sea-salt caramels for the express tram.'
  },
  {
    id: 'cloudworks',
    name: 'Oliver\'s Cloudworks Dock',
    u: 0.84,
    desc: 'Floating workshop hangar filled with brass clockwork, airships & cozy hearths.',
    region: 'North Foundry Isles',
    tagline: 'Home of aerial tram engineering & warm chamomile tea',
    color: '#d4a340',
    unlockedStory: 'Oliver and his companion automata have tuned over three generations of cloud trams with loving care.'
  }
];

export const UPGRADE_ITEMS: UpgradeItem[] = [
  {
    id: 'vines',
    title: 'Hanging Ivy & Sun Awning',
    icon: '🌿',
    cost: 80,
    description: 'Hand-woven emerald canvas canopy with live cliff ivy vines. Shields passengers from midday glare and softens ambient vibrations.',
    benefit: '+15% Passenger Serenity & Comfort recovery',
    category: 'comfort'
  },
  {
    id: 'lanterns',
    title: 'Beacon Brass Glow Lanterns',
    icon: '🏮',
    cost: 140,
    description: 'Twin polished copper fog-cutters with warm amber filament glow. Pierces dense cloud fog and calms twilight travelers.',
    benefit: 'Illuminates track during fog/night & +10% tips at dusk',
    category: 'visual'
  },
  {
    id: 'luggage',
    title: 'Steamer Trunks & Post Sacks',
    icon: '🧳',
    cost: 200,
    description: 'Rooftop wrought-iron rack laden with vintage leather luggage, mail parcels, and expedition crates.',
    benefit: 'Increases Tram Passenger Capacity from 16 to 22',
    category: 'capacity'
  },
  {
    id: 'suspension',
    title: 'Velvet Spring Chassis',
    icon: '✨',
    cost: 280,
    description: 'Bogie shock absorbers with oiled bronze coil springs. Dramatically dampens sway on steep grades and sharp turns.',
    benefit: '+40% Cornering tolerance before comfort penalty',
    category: 'chassis'
  },
  {
    id: 'whistle',
    title: 'Chiming Steam Whistle',
    icon: '🔔',
    cost: 160,
    description: 'Polished dual-tone brass chime that releases soft puffs of steam on command. Greet townsfolk and alert wildlife.',
    benefit: 'Grants +5 gold tip bonus when ringing near landmarks',
    category: 'visual'
  },
  {
    id: 'teacart',
    title: 'Cozy Tea & Pastry Service',
    icon: '☕',
    cost: 320,
    description: 'An onboard brass kettle serving warm citrus chamomile and fresh brioche rolls to passengers during long transits.',
    benefit: 'Generates passive tips on smooth cruising streaks',
    category: 'comfort'
  },
  {
    id: 'gramophone',
    title: 'Skywave Lo-Fi Gramophone',
    icon: '📻',
    cost: 240,
    description: 'A vintage brass acoustic horn playing soothing radio broadcast melodies through the clouds.',
    benefit: 'Unlocks in-game ambient lo-fi synth/harp soundtrack',
    category: 'visual'
  }
];

export const PAINT_SCHEMES: PaintScheme[] = [
  {
    id: 'classic_forest',
    name: 'Aethelgard Classic Emerald',
    primaryColor: 0x1e4738,
    secondaryColor: 0x4a2e1b,
    roofColor: 0xf4ecd8,
    trimColor: 0xd4a340,
    cost: 0,
    desc: 'The timeless forest green and warm cream livery of the Royal Tramways.'
  },
  {
    id: 'terracotta_sunset',
    name: 'Mango Coast Terracotta',
    primaryColor: 0xc2593f,
    secondaryColor: 0x3d271d,
    roofColor: 0xfaf0e4,
    trimColor: 0xe8b86d,
    cost: 90,
    desc: 'Rich sunbaked clay with warm golden trim, beloved by coastal travelers.'
  },
  {
    id: 'midnight_aurora',
    name: 'Celestial Midnight Navy',
    primaryColor: 0x1c2b42,
    secondaryColor: 0x121724,
    roofColor: 0xd8e4f0,
    trimColor: 0x74c7d5,
    cost: 160,
    desc: 'Deep oceanic indigo with silvery starlight accents.'
  },
  {
    id: 'pastoral_sage',
    name: 'High Pines Sage Mist',
    primaryColor: 0x4e7055,
    secondaryColor: 0x303b32,
    roofColor: 0xf5f3ea,
    trimColor: 0xc8b282,
    cost: 130,
    desc: 'A calming alpine herbal green reflecting the highland cedar valleys.'
  },
  {
    id: 'royal_cream_gold',
    name: 'Oliver\'s Cloud White & Brass',
    primaryColor: 0xf0ece1,
    secondaryColor: 0x5a3e28,
    roofColor: 0x223528,
    trimColor: 0xf5bf42,
    cost: 220,
    desc: 'Pristine porcelain white carriage with hand-hammered gilded brass filigree.'
  }
];

export const PASSENGER_STORIES: PassengerStory[] = [
  {
    id: 'elena_botanist',
    name: 'Elena the Orchid Botanist',
    avatar: '🌿',
    title: 'Curator of Cloud Flora',
    quote: 'The high bridge mist breeds rare sky-lilies that only open at gentle speeds!',
    stationOrigin: 'Saltlight Terminus',
    stationDest: 'High Pines Sky Bridge',
    activeRequest: {
      text: 'Keep speed under 38 km/h across the High Pines bridge to protect delicate orchid petals.',
      targetSpeedMax: 38,
      completed: false,
      reward: 50
    }
  },
  {
    id: 'master_tallow',
    name: 'Master Tallow',
    avatar: '🕰️',
    title: 'Clocktower Horologist',
    quote: 'Every pendulum in Aethelgard syncs with the rhythmic rumble of this very tram.',
    stationOrigin: 'High Pines Sky Bridge',
    stationDest: 'Oliver\'s Cloudworks Dock',
    activeRequest: {
      text: 'Maintain comfort above 85% for the entire trip so his delicate balance springs stay aligned.',
      targetComfortMin: 85,
      completed: false,
      reward: 65
    }
  },
  {
    id: 'maia_courier',
    name: 'Maia & Pip',
    avatar: '🕊️',
    title: 'Sky Parcel Courier & Pet Pigeon',
    quote: 'We have seven letters destined for Mango Tide. Ring the bell when we spot the harbor!',
    stationOrigin: 'Oliver\'s Cloudworks Dock',
    stationDest: 'Mango Tide Pier',
    activeRequest: {
      text: 'Ring the tram bell (Space) as you approach Mango Tide Pier platform.',
      requireBellAtStation: 'Mango Tide Pier',
      completed: false,
      reward: 55
    }
  },
  {
    id: 'giorgio_baker',
    name: 'Chef Giorgio',
    avatar: '🥐',
    title: 'Master of Sun Brioche',
    quote: 'If we arrive without tipping over the warm custard tarts, a hefty bonus is yours!',
    stationOrigin: 'Mango Tide Pier',
    stationDest: 'Saltlight Terminus',
    activeRequest: {
      text: 'Deliver without letting comfort drop below 60% on the tight sea-spray curves.',
      targetComfortMin: 60,
      completed: false,
      reward: 70
    }
  }
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_ride',
    title: 'All Aboard!',
    description: 'Complete your first station departure on the Aethelgard coastal line.',
    icon: '🚂',
    unlocked: false
  },
  {
    id: 'gentle_hands',
    title: 'Gentle Hands Conductor',
    description: 'Achieve a 2.5× smooth driving streak with 95%+ passenger comfort.',
    icon: '✨',
    unlocked: false
  },
  {
    id: 'olivers_patron',
    title: 'Oliver\'s Favorite Guest',
    description: 'Equip at least 3 custom modifications at Oliver\'s Cloudworks.',
    icon: '🛠️',
    unlocked: false
  },
  {
    id: 'sky_courier',
    title: 'Master Sky Courier',
    description: 'Collect 5 floating air parcels along the scenic sky bridges.',
    icon: '📦',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'grand_tour',
    title: 'Grand Loop Voyager',
    description: 'Complete 3 full orbital loops through all 4 island stations.',
    icon: '🗺️',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'master_photographer',
    title: 'Postcard from Aethelgard',
    description: 'Take and save a scenic postcard snapshot with photo mode.',
    icon: '📸',
    unlocked: false
  }
];
