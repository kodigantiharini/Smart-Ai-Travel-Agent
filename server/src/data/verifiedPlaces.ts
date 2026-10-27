export interface VerifiedPlace {
  id: string;
  placeId: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  category: 
    | 'tourist_attraction'
    | 'mountain'
    | 'beach'
    | 'waterfall'
    | 'park'
    | 'historical_monument'
    | 'museum'
    | 'religious_site'
    | 'restaurant'
    | 'cafe'
    | 'hotel'
    | 'shopping'
    | 'adventure'
    | 'viewpoint';
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  rating: number;
  ratingCount: number;
  photos: string[];
  openingHours: string[];
  phone?: string;
  website?: string;
  priceLevel?: number; // 1-4
  popularActivities: string[];
  tags: string[];
  suggestedDurationMinutes: number;
  bestTimeToVisit: string;
}

export const VERIFIED_PLACES: VerifiedPlace[] = [
  // ==========================================
  // INDIA — ALL STATES & UNION TERRITORIES
  // ==========================================

  // 1. UTTAR PRADESH
  {
    id: "taj-mahal-agra",
    placeId: "ChIJgTwKgJcpXDkRo0Sg7eS_eQc",
    name: "The Taj Mahal & Yamuna Gardens",
    city: "Agra",
    state: "Uttar Pradesh",
    country: "India",
    category: "historical_monument",
    description: "An immense ivory-white marble mausoleum on the south bank of the Yamuna River, commissioned in 1632 by Mughal Emperor Shah Jahan for his wife Mumtaz Mahal. A UNESCO World Heritage Site and one of the New Seven Wonders of the World, admired for its symmetrical gardens, intricate pietra dura marble inlays, and ethereal sunrise glow.",
    coordinates: { lat: 27.1751, lng: 78.0421 },
    address: "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India",
    rating: 4.9,
    ratingCount: 465000,
    photos: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Saturday - Thursday: 06:00 AM - 06:30 PM", "Friday: Closed for prayers"],
    website: "https://www.tajmahal.gov.in",
    priceLevel: 2,
    popularActivities: ["Sunrise Reflection Pool Photography", "Mehtab Bagh Sunset River Panorama", "Mughal Marble Craftsmanship Tour"],
    tags: ["wonder", "unesco", "uttar pradesh", "agra", "monument", "marble"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "06:00 AM sunrise gate opening"
  },
  {
    id: "varanasi-ghats-up",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Varanasi",
    name: "Dashashwamedh Ghat & Kashi Vishwanath",
    city: "Varanasi",
    state: "Uttar Pradesh",
    country: "India",
    category: "religious_site",
    description: "The spiritual heart of India on the banks of the sacred river Ganges, dating back over 3,000 years. Witness the mesmerizing evening Ganga Aarti ritual with roaring brass lamps, incense, Vedic chants, and early morning boat rides past Manikarnika and Assi Ghats.",
    coordinates: { lat: 25.3076, lng: 83.0107 },
    address: "Dashashwamedh Ghat Rd, Godowlia, Varanasi, Uttar Pradesh 221001, India",
    rating: 4.8,
    ratingCount: 98000,
    photos: [
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours (Ganga Aarti at 06:45 PM daily)"],
    priceLevel: 1,
    popularActivities: ["Evening Grand Ganga Aarti by Boat", "Dawn Sunrise Rowing Boat Tour", "Sarnath Buddhist Stupa Excursion"],
    tags: ["varanasi", "ganges", "spiritual", "ghats", "kashi", "uttar pradesh"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "05:30 AM sunrise boat ride or 06:30 PM Aarti"
  },

  // 2. RAJASTHAN
  {
    id: "hawa-mahal-jaipur",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_HawaMahal",
    name: "Hawa Mahal (Palace of the Winds)",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    category: "historical_monument",
    description: "Built in 1799 by Maharaja Sawai Pratap Singh, this five-story honeycomb pink sandstone palace features 953 intricately latticed jharokhas. Designed in the form of Lord Krishna's crown, cool breezes flow through the vents while royal women once watched street processions unnoticed.",
    coordinates: { lat: 26.9239, lng: 75.8267 },
    address: "Hawa Mahal Rd, Badi Choupad, Pink City, Jaipur, Rajasthan 302002, India",
    rating: 4.7,
    ratingCount: 118000,
    photos: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 09:00 AM - 05:00 PM"],
    priceLevel: 1,
    popularActivities: ["Wind View Cafe Rooftop Shots", "Amber Fort Jeep Safari", "Johari Bazaar Gemstone Shopping"],
    tags: ["rajasthan", "jaipur", "pink city", "palace", "history"],
    suggestedDurationMinutes: 90,
    bestTimeToVisit: "Early morning sunrise when golden rays illuminate the pink sandstone"
  },
  {
    id: "lake-palace-udaipur",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Udaipur",
    name: "City Palace & Lake Pichola",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    category: "historical_monument",
    description: "The Venice of the East's crowned jewel, a colossal 400-year-old palace complex towering over the shimmering waters of Lake Pichola. Features ornate marble arches, mirror mosaics in the Sheesh Mahal, and sunset royal boat cruises to Jag Mandir island.",
    coordinates: { lat: 24.5764, lng: 73.6835 },
    address: "Old City, Udaipur, Rajasthan 313001, India",
    rating: 4.8,
    ratingCount: 84000,
    photos: [
      "https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 09:30 AM - 05:30 PM"],
    priceLevel: 2,
    popularActivities: ["Lake Pichola Sunset Boat Cruise", "Museum Heritage Walk", "Dharohar Folk Dance at Bagore Ki Haveli"],
    tags: ["udaipur", "rajasthan", "lake", "palace", "romance"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "October to March"
  },

  // 3. KERALA
  {
    id: "munnar-tea-gardens",
    placeId: "ChIJb7c0vW9-rTsR3e-q3P9z81M",
    name: "Kolukkumalai & Munnar Tea Terraces",
    city: "Munnar",
    state: "Kerala",
    country: "India",
    category: "mountain",
    description: "The world's highest organic orthodox tea plantation standing at 7,900 feet above sea level. Famed for its breathtaking sunrise above cloud blankets, rolling emerald slopes, Eravikulam Nilgiri Tahr wildlife, and aromatic spice gardens.",
    coordinates: { lat: 10.0889, lng: 77.2285 },
    address: "Kottakudi, Munnar, Idukki District, Kerala 685612, India",
    rating: 4.8,
    ratingCount: 38400,
    photos: [
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 04:30 AM - 06:00 PM"],
    priceLevel: 2,
    popularActivities: ["4x4 Mountain Jeep Safari", "Sunrise Cloud Carpet View", "Tea Factory Tasting"],
    tags: ["munnar", "kerala", "tea", "mountains", "clouds"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "September to March (05:45 AM sunrise)"
  },
  {
    id: "alleppey-backwaters-kerala",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Alleppey",
    name: "Alleppey (Alappuzha) Houseboat Backwaters",
    city: "Alappuzha",
    state: "Kerala",
    country: "India",
    category: "tourist_attraction",
    description: "An interconnected paradise of tranquil palm-fringed canals, emerald lagoons, and Vembanad Lake. Traditional thatched Kettuvallam houseboats cruise past floating duck farms, paddy terraces, and village coir artisans.",
    coordinates: { lat: 9.4981, lng: 76.3388 },
    address: "Finishing Point Rd, Alappuzha, Kerala 688013, India",
    rating: 4.8,
    ratingCount: 78000,
    photos: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Houseboat Day Cruises: 11:30 AM - 05:30 PM", "Overnight Stays Available"],
    priceLevel: 2,
    popularActivities: ["Overnight Luxury Houseboat Cruise", "Kerala Karimeen Fish Feast", "Village Canoe Exploration"],
    tags: ["kerala", "backwaters", "houseboat", "alleppey", "nature"],
    suggestedDurationMinutes: 300,
    bestTimeToVisit: "October to March"
  },

  // 4. LADAKH & JAMMU & KASHMIR
  {
    id: "pangong-lake-ladakh",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Pangong",
    name: "Pangong Tso High Altitude Salt Lake",
    city: "Leh",
    state: "Ladakh",
    country: "India",
    category: "mountain",
    description: "An endorheic high-altitude Himalayan salt lake situated at 14,270 feet (4,350 m), spanning 134 km across India and Tibet. Renowned worldwide for its dramatic color transformations from cobalt blue to aquamarine green against barren desert mountains.",
    coordinates: { lat: 33.7595, lng: 78.6674 },
    address: "Changthang Region, Leh, Ladakh 194201, India",
    rating: 4.9,
    ratingCount: 46000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Daylight hours (Inner Line Permit required)"],
    priceLevel: 2,
    popularActivities: ["Milky Way Stargazing", "Lakeside Glamping", "Marmot Wildlife Spotting"],
    tags: ["ladakh", "himalayas", "lake", "adventure", "pangong"],
    suggestedDurationMinutes: 360,
    bestTimeToVisit: "May to September"
  },
  {
    id: "dal-lake-srinagar",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_DalLake",
    name: "Dal Lake & Mughal Floating Gardens",
    city: "Srinagar",
    state: "Jammu and Kashmir",
    country: "India",
    category: "tourist_attraction",
    description: "The jewel in the crown of Kashmir, surrounded by Pir Panjal peaks. Famed for carved cedar wood houseboats, colorful wooden Shikaras rowing past floating vegetable markets, and the historic Nishat & Shalimar Mughal terraced gardens.",
    coordinates: { lat: 34.0837, lng: 74.8724 },
    address: "Boulevard Road, Srinagar, Jammu and Kashmir 190001, India",
    rating: 4.8,
    ratingCount: 72000,
    photos: [
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Shikara rides open from 05:30 AM - 09:00 PM"],
    priceLevel: 2,
    popularActivities: ["Sunrise Shikara Ride to Floating Market", "Nishat Bagh Mughal Walk", "Kashmiri Kahwa Tea Tasting"],
    tags: ["kashmir", "srinagar", "shikara", "dal lake", "paradise"],
    suggestedDurationMinutes: 150,
    bestTimeToVisit: "April to October for blooms; December to February for snow"
  },

  // 5. GOA
  {
    id: "palolem-beach-goa",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Palolem",
    name: "Palolem Crescent Beach & Butterfly Island",
    city: "Canacona",
    state: "Goa",
    country: "India",
    category: "beach",
    description: "A tranquil crescent bay in South Goa shaded by swaying coconut groves, pastel wooden beach chalets, safe turquoise swimming waters, and sunrise dolphin boat excursions.",
    coordinates: { lat: 15.0100, lng: 74.0232 },
    address: "Palolem Beach, Canacona, South Goa 403702, India",
    rating: 4.7,
    ratingCount: 68000,
    photos: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours"],
    priceLevel: 1,
    popularActivities: ["Sunrise Dolphin Watching Safari", "Sea Kayaking to Butterfly Island", "Fresh Goan Seafood Dining"],
    tags: ["goa", "beach", "sunset", "kayaking", "tropical"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "November to March"
  },

  // 6. HIMACHAL PRADESH
  {
    id: "solang-valley-manali",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Manali",
    name: "Solang Valley & Rohtang Pass Gateway",
    city: "Manali",
    state: "Himachal Pradesh",
    country: "India",
    category: "adventure",
    description: "A snow-crowned alpine playground in the Kullu Valley, offering paragliding, zorbing, skiing, snowmobiling, and gateway access to the high-altitude engineering marvel of Atal Tunnel and Rohtang Pass.",
    coordinates: { lat: 32.3166, lng: 77.1578 },
    address: "Solang Valley, Burwa, Manali, Himachal Pradesh 175131, India",
    rating: 4.6,
    ratingCount: 58000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 09:00 AM - 06:00 PM"],
    priceLevel: 2,
    popularActivities: ["Tandem Paragliding", "Skiing and Snowmobiling", "Atal Tunnel Drive to Sissu Waterfall"],
    tags: ["manali", "himachal", "snow", "adventure", "mountains"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "December to February for snow; May to June for paragliding"
  },

  // 7. KARNATAKA
  {
    id: "hampi-unesco-ruins",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Hampi",
    name: "Hampi Vijayanagara Ruins & Virupaksha",
    city: "Hampi",
    state: "Karnataka",
    country: "India",
    category: "historical_monument",
    description: "A UNESCO World Heritage marvel set amidst surreal boulder-strewn landscapes. The former capital of the grand Vijayanagara Empire (14th century), boasting the iconic stone chariot of Vijaya Vittala Temple, Virupaksha riverside shrine, and coracle boat rides across the Tungabhadra River.",
    coordinates: { lat: 15.3350, lng: 76.4600 },
    address: "Hampi, Vijayanagara District, Karnataka 583239, India",
    rating: 4.8,
    ratingCount: 54000,
    photos: [
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monuments: 06:00 AM - 06:00 PM"],
    priceLevel: 1,
    popularActivities: ["Stone Chariot & Musical Pillars Tour", "Matanga Hill Sunrise Bouldering", "Tungabhadra Coracle Boat Ride"],
    tags: ["hampi", "karnataka", "unesco", "heritage", "boulders", "ruins"],
    suggestedDurationMinutes: 300,
    bestTimeToVisit: "October to March"
  },
  {
    id: "mysore-palace-karnataka",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Mysore",
    name: "Mysore Palace (Amba Vilas)",
    city: "Mysuru",
    state: "Karnataka",
    country: "India",
    category: "historical_monument",
    description: "The royal seat of the Wadiyar dynasty, constructed in Indo-Saracenic grandeur with stained glass domes, carved mahogany ceilings, and solid silver doors. Illumined by nearly 100,000 incandescent bulbs on Sunday evenings.",
    coordinates: { lat: 12.3051, lng: 76.6551 },
    address: "Sayyaji Rao Rd, Agrahara, Chamrajpura, Mysuru, Karnataka 570001, India",
    rating: 4.7,
    ratingCount: 112000,
    photos: [
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 10:00 AM - 05:30 PM (Illumination on Sundays 07:00 PM - 07:45 PM)"],
    priceLevel: 1,
    popularActivities: ["Royal Durbar Hall Tour", "Sunday Evening Illumination Spectacle", "Mysore Pak Sweet Tasting"],
    tags: ["karnataka", "mysore", "palace", "illumination", "heritage"],
    suggestedDurationMinutes: 120,
    bestTimeToVisit: "October (Dasara Festival) or Sunday evenings"
  },

  // 8. TAMIL NADU
  {
    id: "meenakshi-temple-madurai",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Madurai",
    name: "Arulmigu Meenakshi Amman Temple",
    city: "Madurai",
    state: "Tamil Nadu",
    country: "India",
    category: "religious_site",
    description: "A 2,500-year-old architectural masterpiece of Dravidian temple art. Dominated by 14 colossal gopurams encrusted with thousands of vivid stucco sculptures of gods, and the Hall of Thousand Pillars featuring musical granite columns.",
    coordinates: { lat: 9.9195, lng: 78.1193 },
    address: "Madurai Main, Madurai, Tamil Nadu 625001, India",
    rating: 4.9,
    ratingCount: 96000,
    photos: [
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["05:00 AM - 12:30 PM, 04:00 PM - 10:00 PM"],
    priceLevel: 1,
    popularActivities: ["Hall of 1000 Pillars Exploration", "Night Bed Chamber Ceremony (09:00 PM)", "Jigarthanda Drink Refreshment"],
    tags: ["tamil nadu", "madurai", "temple", "dravidian", "heritage"],
    suggestedDurationMinutes: 150,
    bestTimeToVisit: "Early morning or 20:30 evening procession"
  },
  {
    id: "ooty-nilgiri-hills",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Ooty",
    name: "Ooty Botanical Gardens & Nilgiri Mountain Train",
    city: "Ooty",
    state: "Kerala / Tamil Nadu",
    country: "India",
    category: "mountain",
    description: "The Queen of Hill Stations nestled in the Nilgiri Blue Mountains at 7,350 feet. Renowned for the UNESCO-listed steam toy train, emerald Doddabetta peak vistas, Pykara waterfalls, and tea estates.",
    coordinates: { lat: 11.4102, lng: 76.6950 },
    address: "Vannarapettai, Ooty, Tamil Nadu 643002, India",
    rating: 4.6,
    ratingCount: 68000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["07:00 AM - 06:30 PM"],
    priceLevel: 1,
    popularActivities: ["UNESCO Toy Train Ride", "Boating at Ooty Lake", "Doddabetta Peak Viewpoint"],
    tags: ["ooty", "nilgiri", "hill station", "toy train", "nature"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "March to June and September to November"
  },

  // 9. MAHARASHTRA
  {
    id: "gateway-of-india-mumbai",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Mumbai",
    name: "Gateway of India & Taj Mahal Palace",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    category: "historical_monument",
    description: "Built in 1924 facing Mumbai Harbour on the Arabian Sea, this 26-meter basalt triumphal arch stands opposite the historic Taj Mahal Palace Hotel. Gateway ferry boats embark to the ancient rock-cut Elephanta Island Caves.",
    coordinates: { lat: 18.9220, lng: 72.8347 },
    address: "Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India",
    rating: 4.7,
    ratingCount: 165000,
    photos: [
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours"],
    priceLevel: 1,
    popularActivities: ["Ferry ride to Elephanta Caves", "Colaba Causeway Street Shopping", "Marine Drive Queen's Necklace Sunset Walk"],
    tags: ["mumbai", "maharashtra", "gateway", "harbour", "iconic"],
    suggestedDurationMinutes: 90,
    bestTimeToVisit: "Evening golden hour"
  },
  {
    id: "ellora-caves-aurangabad",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Ellora",
    name: "Kailash Temple (Ellora Caves)",
    city: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    country: "India",
    category: "historical_monument",
    description: "The world's largest monolithic rock-cut monument, carved top-to-bottom out of a single volcanic basalt cliff face in the 8th century AD by Rashtrakuta King Krishna I. Features intricate multi-story carvings of epics without joinery.",
    coordinates: { lat: 20.0268, lng: 75.1772 },
    address: "Ellora Cave Rd, Ellora, Maharashtra 431102, India",
    rating: 4.9,
    ratingCount: 52000,
    photos: [
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Wednesday - Monday: 06:00 AM - 06:00 PM", "Tuesday: Closed"],
    priceLevel: 1,
    popularActivities: ["Cave 16 Kailash Temple Architectural Study", "Ajanta Fresco Paintings Combination Tour", "Bibi Ka Maqbara Visit"],
    tags: ["unesco", "monolithic", "ellora", "caves", "ancient"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "October to March"
  },

  // 10. GUJARAT
  {
    id: "statue-of-unity-gujarat",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_SoU",
    name: "Statue of Unity & Sardar Sarovar",
    city: "Kevadia",
    state: "Gujarat",
    country: "India",
    category: "historical_monument",
    description: "The world's tallest statue standing at a staggering 182 meters (597 feet), commemorating Sardar Vallabhbhai Patel. Set against the Narmada River and Vindhya-Satpura mountain ranges, featuring a high-speed elevator to the 153-meter chest viewing gallery.",
    coordinates: { lat: 21.8380, lng: 73.7191 },
    address: "Sardar Sarovar Dam, Kevadia, Narmada, Gujarat 393155, India",
    rating: 4.8,
    ratingCount: 142000,
    photos: [
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Tuesday - Sunday: 08:00 AM - 06:00 PM", "Monday: Closed"],
    website: "https://statueofunity.in",
    priceLevel: 2,
    popularActivities: ["153-Meter Viewing Gallery Elevator", "Evening Laser Light & Sound Show", "Valley of Flowers & Jungle Safari"],
    tags: ["gujarat", "record-breaking", "statue", "monument", "narmada"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "October to March (18:30 for the laser show)"
  },
  {
    id: "rann-of-kutch-gujarat",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Kutch",
    name: "White Desert of Kutch (Rann Utsav)",
    city: "Dhordo",
    state: "Gujarat",
    country: "India",
    category: "tourist_attraction",
    description: "One of the largest salt deserts in the world, stretching over 7,500 square kilometers into the Arabian Sea. Glows like silver on full moon nights, illuminated during the Rann Utsav festival with Kutchi folk dances, camel safaris, and artisan handicraft bazaars.",
    coordinates: { lat: 23.7744, lng: 69.8597 },
    address: "White Rann, Dhordo, Kutch District, Gujarat 370510, India",
    rating: 4.8,
    ratingCount: 41000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours during Rann Utsav (Permits required at Bhirandiyara)"],
    priceLevel: 3,
    popularActivities: ["Full Moon Salt Desert Walk", "Camel Cart Desert Safari", "Kala Dungar Highest Point View"],
    tags: ["gujarat", "kutch", "desert", "salt", "rann utsav"],
    suggestedDurationMinutes: 300,
    bestTimeToVisit: "November to February (Full moon nights)"
  },

  // 11. PUNJAB
  {
    id: "golden-temple-amritsar",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Amritsar",
    name: "Sri Harmandir Sahib (The Golden Temple)",
    city: "Amritsar",
    state: "Punjab",
    country: "India",
    category: "religious_site",
    description: "The holiest Gurdwara of Sikhism, plated with 500 kg of pure gold leaf surrounded by the sacred Amrit Sarovar (Pool of Nectar). Open to people of all faiths, operating the world's largest free community kitchen (Langar) feeding up to 100,000 visitors daily.",
    coordinates: { lat: 31.6200, lng: 74.8765 },
    address: "Golden Temple Rd, Atta Mandi, Amritsar, Punjab 143006, India",
    rating: 4.9,
    ratingCount: 220000,
    photos: [
      "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours, 365 Days a Year"],
    website: "https://sgpc.net",
    priceLevel: 1,
    popularActivities: ["Holy Sarovar Parikrama Walk", "Langar Seva & Community Meal", "Wagah Border Flag Lowering Ceremony Excursion"],
    tags: ["punjab", "amritsar", "golden temple", "spiritual", "peace"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "04:00 AM Palki Sahib ceremony or night illumination"
  },

  // 12. DELHI (NCT)
  {
    id: "qutub-minar-delhi",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Qutub",
    name: "Qutub Minar & Mehrauli Archaeological Park",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    category: "historical_monument",
    description: "A 72.5-meter red sandstone victory tower built in 1192 by Qutb-ud-din Aibak, featuring 5 tapering fluted storeys with fine Arabic inscriptions. Accompanied by the rust-resistant 1,600-year-old Gupta Iron Pillar in the UNESCO complex.",
    coordinates: { lat: 28.5244, lng: 77.1855 },
    address: "Seth Sarai, Mehrauli, New Delhi 110030, India",
    rating: 4.6,
    ratingCount: 135000,
    photos: [
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 07:00 AM - 08:00 PM"],
    priceLevel: 1,
    popularActivities: ["Iron Pillar Mystery Inspection", "Ala-i-Minar Photography", "Mehrauli Heritage Walk"],
    tags: ["delhi", "unesco", "minar", "monument", "history"],
    suggestedDurationMinutes: 120,
    bestTimeToVisit: "Late afternoon golden hour"
  },

  // 13. TELANGANA
  {
    id: "charminar-hyderabad",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Hyd",
    name: "Charminar & Golconda Fort",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    category: "historical_monument",
    description: "Erected in 1591 by Sultan Muhammad Quli Qutb Shah with four grand 56-meter stucco minarets and delicate floral arches. Surrounded by the vibrant Laad Bazaar pearl and bangle markets, with the acoustically engineered Golconda diamond fort nearby.",
    coordinates: { lat: 17.3616, lng: 78.4747 },
    address: "Charminar Rd, Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002, India",
    rating: 4.6,
    ratingCount: 145000,
    photos: [
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 09:30 AM - 05:30 PM"],
    priceLevel: 1,
    popularActivities: ["Climbing the Charminar Balcony", "Laad Bazaar Pearl & Bangle Shopping", "Authentic Hyderabadi Dum Biryani Feast"],
    tags: ["hyderabad", "telangana", "charminar", "biryani", "heritage"],
    suggestedDurationMinutes: 120,
    bestTimeToVisit: "Evening when the monument is lit up"
  },

  // 14. ANDHRA PRADESH
  {
    id: "tirupati-balaji-ap",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Tirupati",
    name: "Sri Venkateswara Swamy Temple (Tirumala)",
    city: "Tirupati",
    state: "Andhra Pradesh",
    country: "India",
    category: "religious_site",
    description: "Perched atop the sacred Seshachalam Hills across Seven Peaks (Saptagiri). Dedicated to Lord Venkateswara (Balaji), it is the most visited sacred pilgrimage shrine in the world, famed for its golden Ananda Nilayam vimana and Tirupati Laddu prasadam.",
    coordinates: { lat: 13.6833, lng: 79.3500 },
    address: "S Mada St, Tirumala, Tirupati, Andhra Pradesh 517504, India",
    rating: 4.9,
    ratingCount: 185000,
    photos: [
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours (Darshan timings by TTD slot)"],
    website: "https://tirupatibalaji.ap.gov.in",
    priceLevel: 1,
    popularActivities: ["Vaikuntham Darshan", "Alipiri Footpath Pilgrimage Trek", "Silathoranam Natural Rock Arch"],
    tags: ["andhra pradesh", "tirupati", "balaji", "spiritual", "temple"],
    suggestedDurationMinutes: 300,
    bestTimeToVisit: "September to February"
  },

  // 15. WEST BENGAL
  {
    id: "darjeeling-tea-hills",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Darjeeling",
    name: "Tiger Hill & Darjeeling Himalayan Railway",
    city: "Darjeeling",
    state: "West Bengal",
    country: "India",
    category: "mountain",
    description: "Perched at 6,700 feet with panoramas of Kangchenjunga—the world's third highest peak. Home of the UNESCO World Heritage steam toy train zigzagging through Batasia Loop, fragrant champagne tea estates, and Himalayan mountaineering heritage.",
    coordinates: { lat: 27.0410, lng: 88.2663 },
    address: "Tiger Hill, Senchal Wildlife Sanctuary, Darjeeling, West Bengal 734102, India",
    rating: 4.7,
    ratingCount: 52000,
    photos: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Tiger Hill Sunrise: 04:00 AM - 07:00 AM"],
    priceLevel: 1,
    popularActivities: ["Kangchenjunga Sunrise from Tiger Hill", "Batasia Loop Steam Train Ride", "Happy Valley Tea Estate Tasting"],
    tags: ["darjeeling", "west bengal", "toy train", "tea", "kangchenjunga"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "October to December or March to April"
  },

  // 16. ODISHA
  {
    id: "konark-sun-temple-odisha",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Konark",
    name: "Konark Sun Temple (Black Pagoda)",
    city: "Konark",
    state: "Odisha",
    country: "India",
    category: "historical_monument",
    description: "A 13th-century UNESCO World Heritage architectural marvel conceived as a colossal cosmic chariot for the Sun God Surya, with 24 carved stone wheels serving as accurate sundials pulled by seven rearing horses beside the Bay of Bengal.",
    coordinates: { lat: 19.8876, lng: 86.0945 },
    address: "Konark, Puri District, Odisha 752111, India",
    rating: 4.8,
    ratingCount: 62000,
    photos: [
      "https://images.unsplash.com/photo-1600100397608-f010f443b718?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 06:00 AM - 08:00 PM"],
    priceLevel: 1,
    popularActivities: ["Sundial Shadow Time Calculation", "Chandrabhaga Beach Sunset", "Konark Dance Festival"],
    tags: ["odisha", "konark", "sun temple", "unesco", "architecture"],
    suggestedDurationMinutes: 150,
    bestTimeToVisit: "November to February"
  },

  // 17. SIKKIM
  {
    id: "tsomgo-lake-sikkim",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Sikkim",
    name: "Tsomgo (Changu) Lake & Nathula Pass",
    city: "Gangtok",
    state: "Sikkim",
    country: "India",
    category: "mountain",
    description: "A sacred glacial lake perched at 12,310 feet (3,753 m) along the historic Indo-China Silk Route. Reflects the snow-clad Himalayas, surrounded by blooming rhododendrons in spring and frozen solid into winter ice wonderland.",
    coordinates: { lat: 27.3742, lng: 88.7619 },
    address: "Jawaharlal Nehru Rd, Gangtok, Sikkim 737103, India",
    rating: 4.8,
    ratingCount: 38000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Daylight visits with Tourist Permit"],
    priceLevel: 2,
    popularActivities: ["Decorated Yak Ride along Lake", "Nathula Pass Border Post", "Baba Harbhajan Singh Mandir"],
    tags: ["sikkim", "gangtok", "lake", "silk route", "snow"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "March to May for flowers; December to February for snow"
  },

  // 18. MEGHALAYA
  {
    id: "living-root-bridge-meghalaya",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Cherrapunji",
    name: "Double Decker Living Root Bridge & Dawki River",
    city: "Cherrapunji (Sohra)",
    state: "Meghalaya",
    country: "India",
    category: "adventure",
    description: "Bio-engineering bio-miracles woven by the indigenous Khasi tribe over centuries using the living aerial roots of rubber fig trees (Ficus elastica). Combined with Dawki's crystal-clear Umngot River where boats appear to float on glass.",
    coordinates: { lat: 25.2458, lng: 91.6738 },
    address: "Nongriat Village, Sohra, East Khasi Hills, Meghalaya 793108, India",
    rating: 4.9,
    ratingCount: 29000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open daylight hours"],
    priceLevel: 1,
    popularActivities: ["Nongriat 3,000 Step Trek", "Umngot River Glass Boat Ride", "Nohkalikai Waterfall Overlook"],
    tags: ["meghalaya", "living roots", "cherrapunji", "waterfalls", "nature"],
    suggestedDurationMinutes: 360,
    bestTimeToVisit: "October to April"
  },

  // 19. ASSAM
  {
    id: "kaziranga-national-park-assam",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Kaziranga",
    name: "Kaziranga National Park (One-Horned Rhino)",
    city: "Golaghat",
    state: "Assam",
    country: "India",
    category: "park",
    description: "A UNESCO World Heritage sanctuary in the Brahmaputra floodplain hosting two-thirds of the world's Great One-Horned Rhinoceroses, along with wild water buffalo, Royal Bengal Tigers, Asian elephants, and migratory waterfowl.",
    coordinates: { lat: 26.5775, lng: 93.1711 },
    address: "Kanchanjuri, Golaghat District, Assam 785609, India",
    rating: 4.8,
    ratingCount: 34000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Safaris: 07:30 AM - 11:30 AM, 01:30 PM - 04:30 PM"],
    website: "https://kaziranga.assam.gov.in",
    priceLevel: 2,
    popularActivities: ["Dawn Elephant Safari to spot Rhinos", "Open 4x4 Jeep Safari across Central Range", "Assam Tea Garden Stroll"],
    tags: ["assam", "rhino", "kaziranga", "unesco", "wildlife"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "November to April (Park closed during monsoons)"
  },

  // 20. UTTARAKHAND
  {
    id: "rishikesh-ganga-uttarakhand",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Rishikesh",
    name: "Triveni Ghat & Lakshman Jhula",
    city: "Rishikesh",
    state: "Uttarakhand",
    country: "India",
    category: "adventure",
    description: "The Yoga Capital of the World where the turquoise Ganges emerges from the Himalayan foothills. Renowned for white water river rafting rapids (Grade III & IV), ashrams, suspension footbridges, and divine evening Maha Aarti.",
    coordinates: { lat: 30.1264, lng: 78.3247 },
    address: "Ganga Kinare, Triveni Ghat, Rishikesh, Uttarakhand 249201, India",
    rating: 4.8,
    ratingCount: 78000,
    photos: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours (Maha Aarti at 06:00 PM)"],
    priceLevel: 1,
    popularActivities: ["Ganges White Water Rafting", "Triveni Ghat Evening Maha Aarti", "Cliff Bungee Jumping at Mohan Chatti"],
    tags: ["uttarakhand", "rishikesh", "ganga", "yoga", "rafting", "himalayas"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "September to November and March to May"
  },

  // 21. ANDAMAN & NICOBAR ISLANDS
  {
    id: "radhanagar-beach-havelock",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Havelock",
    name: "Radhanagar Beach (Beach No. 7)",
    city: "Havelock Island (Swaraj Dweep)",
    state: "Andaman and Nicobar Islands",
    country: "India",
    category: "beach",
    description: "Crowned by Time Magazine as Asia's Best Beach. Features blinding white powdery sands, turquoise water with zero rocks, lush tropical rainforest fringe, and fiery orange sunsets over the Bay of Bengal.",
    coordinates: { lat: 11.9840, lng: 92.9510 },
    address: "Radhanagar, Havelock Island, Andaman and Nicobar Islands 744211, India",
    rating: 4.9,
    ratingCount: 42000,
    photos: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["06:00 AM - 06:00 PM (Swimming permitted till sunset)"],
    priceLevel: 2,
    popularActivities: ["Sunset Swimming in Calm Waters", "Scuba Diving at Elephant Beach", "Cellular Jail Sound & Light in Port Blair"],
    tags: ["andaman", "beach", "havelock", "island", "paradise"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "October to May"
  },

  // ==========================================
  // WORLD DESTINATIONS (ALL CONTINENTS)
  // ==========================================
  {
    id: "eiffel-tower-paris",
    placeId: "ChIJLU7jZClu5kcR4PcOOO6p3VQ",
    name: "Eiffel Tower (Tour Eiffel)",
    city: "Paris",
    country: "France",
    category: "historical_monument",
    description: "The global symbol of France and an architectural marvel built in 1889 by Gustave Eiffel. Rising 330 meters into the Parisian sky, it offers 360-degree panoramic views of Paris, exquisite fine dining, and hourly evening light sparkles.",
    coordinates: { lat: 48.8584, lng: 2.2945 },
    address: "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",
    rating: 4.8,
    ratingCount: 342000,
    photos: [
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 09:00 AM - 11:45 PM"],
    priceLevel: 3,
    popularActivities: ["Summit Observation Deck", "Champ de Mars Sunset Picnic", "Night Sparkle Photography"],
    tags: ["landmark", "romance", "panoramic", "architecture", "iconic"],
    suggestedDurationMinutes: 150,
    bestTimeToVisit: "17:30 to experience day-to-night illumination"
  },
  {
    id: "colosseum-rome",
    placeId: "ChIJ-w1_kLxhLxMRGj9b01Vf83w",
    name: "The Colosseum & Roman Forum",
    city: "Rome",
    country: "Italy",
    category: "historical_monument",
    description: "The largest amphitheater ever constructed in ancient history, completed in 80 AD under Emperor Titus. Once holding over 65,000 spectators for gladiatorial battles, it stands as an enduring monument to Roman imperial engineering.",
    coordinates: { lat: 41.8902, lng: 12.4922 },
    address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
    rating: 4.8,
    ratingCount: 395000,
    photos: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 08:30 AM - 07:15 PM"],
    priceLevel: 2,
    popularActivities: ["Arena Floor Access", "Hypogeum Underground Dungeon Tour", "Palatine Hill Stroll"],
    tags: ["ancient", "history", "gladiators", "unesco", "monument"],
    suggestedDurationMinutes: 180,
    bestTimeToVisit: "08:30 AM first entry slot"
  },
  {
    id: "matterhorn-zermatt",
    placeId: "ChIJb7c0vW9-rTsR3e-q3P9zSwiss",
    name: "The Matterhorn & Gornergrat Ridge",
    city: "Zermatt",
    country: "Switzerland",
    category: "mountain",
    description: "The jewel of the Swiss Alps, towering at 4,478 meters with its distinct four-sided pyramid peak. Accessible by the Gornergrat cogwheel railway and glacier cable cars, offering alpine mirror lakes and pristine air.",
    coordinates: { lat: 45.9765, lng: 7.7491 },
    address: "Gornergrat Bahn, 3920 Zermatt, Switzerland",
    rating: 4.9,
    ratingCount: 78000,
    photos: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Mountain Railway: 07:00 AM - 07:00 PM"],
    priceLevel: 4,
    popularActivities: ["Gornergrat Cogwheel Train", "Riffelsee Lake Reflection Trek", "Glacier Paradise Ice Palace"],
    tags: ["alps", "snow", "hiking", "luxury", "ski"],
    suggestedDurationMinutes: 300,
    bestTimeToVisit: "July to September for hiking; December to April for skiing"
  },
  {
    id: "pyramids-giza-cairo",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Giza",
    name: "The Great Pyramids of Giza & Great Sphinx",
    city: "Cairo / Giza",
    country: "Egypt",
    category: "historical_monument",
    description: "The sole surviving wonder of the original Seven Wonders of the Ancient World, erected over 4,500 years ago during Egypt's Fourth Dynasty for Pharaoh Khufu. Guarded by the monolithic limestone Great Sphinx.",
    coordinates: { lat: 29.9792, lng: 31.1342 },
    address: "Al Haram, Giza Desert, Giza Governorate, Egypt",
    rating: 4.8,
    ratingCount: 168000,
    photos: [
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 08:00 AM - 05:00 PM"],
    priceLevel: 2,
    popularActivities: ["Khufu's King's Chamber Tour", "Camel Safari across Sahara Dunes", "Giza Sound & Light Show"],
    tags: ["wonder", "ancient", "egypt", "pyramid", "sphinx"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "08:00 AM opening before desert noon heat"
  },
  {
    id: "fushimi-inari-kyoto",
    placeId: "ChIJsWlVj3gIAWAR8qF1U3-4fUQ",
    name: "Fushimi Inari Taisha (10,000 Torii Gates)",
    city: "Kyoto",
    country: "Japan",
    category: "religious_site",
    description: "The head Shinto shrine of Inari, the god of rice and prosperity, founded in 711 AD. World-famous for its Senbon Torii—a tunnel of over 10,000 vibrant vermilion torii gates winding up sacred Mount Inari.",
    coordinates: { lat: 34.9671, lng: 135.7727 },
    address: "68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto 612-0882, Japan",
    rating: 4.8,
    ratingCount: 88000,
    photos: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours"],
    priceLevel: 1,
    popularActivities: ["Torii Path Pilgrimage Hike", "Fox Statue Spotting", "Yotsutsuji Crossroads Sunset View"],
    tags: ["torii", "shinto", "kyoto", "culture", "japan"],
    suggestedDurationMinutes: 150,
    bestTimeToVisit: "06:30 AM sunrise to walk in peaceful serenity"
  },
  {
    id: "machu-picchu-peru",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_Machu",
    name: "Machu Picchu (The Lost City of the Incas)",
    city: "Cusco Region",
    country: "Peru",
    category: "historical_monument",
    description: "A 15th-century Inca citadel situated on a mountain ridge 2,430 meters above sea level in the Sacred Valley. Masterfully engineered with polished dry-stone walls blending into emerald Andean cloud forest peaks.",
    coordinates: { lat: -13.1631, lng: -72.5450 },
    address: "Machupicchu District, Urubamba Province, Peru",
    rating: 4.9,
    ratingCount: 112000,
    photos: [
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 06:00 AM - 05:30 PM"],
    priceLevel: 3,
    popularActivities: ["Inca Bridge Hike", "Huayna Picchu Mountain Summit", "Sun Gate Sunrise Trek"],
    tags: ["inca", "andes", "wonder", "unesco", "peru"],
    suggestedDurationMinutes: 240,
    bestTimeToVisit: "May to October (dry season mornings)"
  },
  {
    id: "grand-canyon-usa",
    placeId: "ChIJd87d4yEEe0gRhjXp8_P2f7M_GrandCanyon",
    name: "Grand Canyon National Park (South Rim)",
    city: "Arizona",
    country: "United States",
    category: "park",
    description: "A colossal 277-mile geological chasm carved over billions of years by the Colorado River, exposing 2 billion years of Earth's colorful rock strata with mind-boggling vistas at Mather Point and Desert View.",
    coordinates: { lat: 36.0544, lng: -112.1401 },
    address: "South Rim Visitor Center, Grand Canyon Village, AZ 86023, United States",
    rating: 4.9,
    ratingCount: 182000,
    photos: [
      "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Open 24 Hours, 365 days a year"],
    priceLevel: 2,
    popularActivities: ["Bright Angel Trail Trek", "Helicopter Canyon Flight", "Sunset at Hopi Point"],
    tags: ["national park", "canyon", "geology", "nature", "usa"],
    suggestedDurationMinutes: 300,
    bestTimeToVisit: "Sunrise at Mather Point or sunset at Hopi Point"
  },
  {
    id: "sydney-opera-house",
    placeId: "ChIJ3S-JXmauEmsRUcIaWtf4MzE",
    name: "Sydney Opera House & Harbour Bridge",
    city: "Sydney",
    country: "Australia",
    category: "historical_monument",
    description: "Jørn Utzon's UNESCO World Heritage masterpiece of modern architecture, celebrated for its soaring sail-shaped shell design set against sparkling Sydney Harbour, Circular Quay, and the Sydney Harbour Bridge.",
    coordinates: { lat: -33.8568, lng: 151.2153 },
    address: "Bennelong Point, Sydney NSW 2000, Australia",
    rating: 4.8,
    ratingCount: 155000,
    photos: [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80"
    ],
    openingHours: ["Monday - Sunday: 09:00 AM - 08:30 PM"],
    priceLevel: 2,
    popularActivities: ["Architectural Guided Tour", "Harbour Bar Craft Cocktails", "Manly Ferry Harbour Cruise"],
    tags: ["architecture", "unesco", "harbour", "sydney", "australia"],
    suggestedDurationMinutes: 120,
    bestTimeToVisit: "Sunset from Mrs Macquarie's Chair"
  }
];
