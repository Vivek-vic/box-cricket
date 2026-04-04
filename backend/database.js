// ============================================================
//  DATABASE SETUP — database.js
//  Real Hyderabad box cricket ground data
// ============================================================

const Database = require('better-sqlite3')
const path     = require('path')

const db = new Database(path.join(__dirname, 'cricbox.db'))

// ── CREATE TABLES ──────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS grounds (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  area        TEXT    NOT NULL,
  address     TEXT    NOT NULL,
  phone       TEXT    NOT NULL,
  lat         REAL,              -- ← add this
  lng         REAL,              -- ← add this
  map_url     TEXT    NOT NULL,
  price       INTEGER NOT NULL,
  rating      REAL    NOT NULL,
  reviews     INTEGER NOT NULL,
  badge       TEXT,
  badge_class TEXT,
  bg_color    TEXT,
  pitch_color TEXT,
  amenities   TEXT    NOT NULL,
  description TEXT    NOT NULL
);

  CREATE TABLE IF NOT EXISTS slots (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ground_id INTEGER NOT NULL,
    time      TEXT    NOT NULL,
    is_free   INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (ground_id) REFERENCES grounds(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ground_id INTEGER,
    ground_name TEXT,
    name TEXT,
    phone TEXT,
    date TEXT,
    slots TEXT,
    total INTEGER,
    convenience_fee INTEGER,
    payment_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    age        INTEGER NOT NULL,
    phone      TEXT    NOT NULL UNIQUE,
    latitude   REAL,
    longitude  REAL,
    area       TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`)

// ── DELETE OLD DUMMY DATA & RESEED ─────────────────────────
// We wipe and reseed every time so switching from
// dummy → real data is clean with no leftover rows.

const groundCount = db.prepare('SELECT COUNT(*) as count FROM grounds').get()

if (groundCount.count === 0) {
  console.log('Seeding real ground data...')

 const insertGround = db.prepare(`
  INSERT INTO grounds
    (name, area, address, phone, lat, lng, map_url, price, rating,
     reviews, badge, badge_class, bg_color, pitch_color, amenities, description)
  VALUES
    (@name, @area, @address, @phone, @lat, @lng, @mapUrl, @price, @rating,
     @reviews, @badge, @badgeClass, @bgColor, @pitchColor, @amenities, @description)
`)

  const insertSlot = db.prepare(`
    INSERT INTO slots (ground_id, time, is_free)
    VALUES (@groundId, @time, @isFree)
  `)

  // Default slot timings used for every ground
  // You can customise per ground later
  const defaultSlots = [
    { time: '6 AM',  free: true  },
    { time: '7 AM',  free: true  },
    { time: '8 AM',  free: true  },
    { time: '9 AM',  free: true  },
    { time: '4 PM',  free: true  },
    { time: '5 PM',  free: true  },
    { time: '6 PM',  free: true  },
    { time: '7 PM',  free: true  },
    { time: '8 PM',  free: true  },
    { time: '9 PM',  free: true  },
    { time: '10 PM', free: true  },
    { time: '11 PM', free: true  }
  ]

  const seedAll = db.transaction((grounds) => {
    for (const g of grounds) {
      const result   = insertGround.run(g)
      const groundId = result.lastInsertRowid
      const slots    = g.slots || defaultSlots

      for (const slot of slots) {
        insertSlot.run({
          groundId,
          time:   slot.time,
          isFree: slot.free ? 1 : 0
        })
      }
    }
  })

  // ── REAL GROUND DATA ──────────────────────────────────────

 seedAll([
  {
    name:        'Royal Cricket Box',
    area:        'Lalaguda Gate',
    address:     '10, Tukaram Gate Main Rd, Tukaram Gate, Secunderabad, Telangana 500017',
    phone:       '7702201268',
    lat:         17.4418,
    lng:         78.4988,
    mapUrl:      'https://maps.app.goo.gl/h1ebceGF7iii7Ky86',
    price:       800,
    rating:      4.3,
    reviews:     87,
    badge:       'Popular',
    badgeClass:  'badge-popular',
    bgColor:     '#e8f5ee',
    pitchColor:  '#c5e8d2',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
    description: 'One of the well-known box cricket venues in Secunderabad near Tukaram Gate.'
  },
  {
    name:        "A'N'S Box Cricket",
    area:        'Abids',
    address:     '6th Floor, Sanali Mall, Chirag Ali Lane, Abids, Hyderabad, Telangana 500001',
    phone:       'Not Available',
    lat:         17.3924,
    lng:         78.4739,
    mapUrl:      'https://maps.app.goo.gl/ziYM2Vp8FEAfYF1T8',
    price:       900,
    rating:      4.1,
    reviews:     62,
    badge:       null,
    badgeClass:  '',
    bgColor:     '#eef2fb',
    pitchColor:  '#c8d6f5',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,🏬 Mall Parking,☕ Food Court Nearby',
    description: "Located on the 6th floor of Sanali Mall in Abids — unique indoor box cricket in the heart of Hyderabad."
  },
  {
    name:        'Cricfit Box Cricket',
    area:        'Malkajgiri',
    address:     'Plot No 98, beside ICICI Bank, Sanjay Nagar, Malkajgiri, Secunderabad, Telangana 500047',
    phone:       '9160091020',
    lat:         17.4512,
    lng:         78.5392,
    mapUrl:      'https://maps.app.goo.gl/Rbkh5AJQRHgZTNFg6',
    price:       750,
    rating:      4.2,
    reviews:     104,
    badge:       'Budget Pick',
    badgeClass:  'badge-budget',
    bgColor:     '#fdf5e8',
    pitchColor:  '#f5dfa0',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
    description: 'Cricfit is a popular box cricket destination in Malkajgiri, beside ICICI Bank in Sanjay Nagar.'
  },
  {
    name:        'Abbu Arman Box Cricket',
    area:        'Uppal',
    address:     'Nacharam - Mallapur Rd, New Bhavani Nagar, K L Reddy Nagar, Uppal, Hyderabad, Telangana 500076',
    phone:       '6300671382',
    lat:         17.4062,
    lng:         78.5603,
    mapUrl:      'https://maps.app.goo.gl/bCXZUTr4UBY3vnz26',
    price:       700,
    rating:      4.0,
    reviews:     48,
    badge:       'Budget Pick',
    badgeClass:  'badge-budget',
    bgColor:     '#f5eef8',
    pitchColor:  '#e0c8f0',
    amenities:   '🔦 Floodlights,🍃 Natural Turf,🚗 Parking,💧 Drinking Water',
    description: 'Affordable box cricket ground on the Nacharam-Mallapur Road in Uppal.'
  },
  {
    name:        'U/A Sports Academy',
    area:        'Nacharam',
    address:     'Sri Sai Nagar, New Raghavendra Nagar, Nacharam, Secunderabad, Telangana 500076',
    phone:       'Not Available',
    lat:         17.4198,
    lng:         78.5631,
    mapUrl:      'https://maps.app.goo.gl/MnLEmFwZRn5wzQ339',
    price:       750,
    rating:      4.1,
    reviews:     39,
    badge:       null,
    badgeClass:  '',
    bgColor:     '#eef8f5',
    pitchColor:  '#b8e8d8',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,🏋️ Coaching Available',
    description: 'U/A Sports Academy offers box cricket with coaching facilities in Raghavendra Nagar.'
  },
  {
    name:        'Loginn Sports - Cricket & Football',
    area:        'Nacharam',
    address:     'Industrial Development Area, Nacharam, Secunderabad, Telangana 500076',
    phone:       '7671821001',
    lat:         17.4089,
    lng:         78.5712,
    mapUrl:      'https://maps.app.goo.gl/KLSQCUXLBjRGTKdu8',
    price:       850,
    rating:      4.4,
    reviews:     136,
    badge:       'Top Rated',
    badgeClass:  'badge-premium',
    bgColor:     '#fff5ee',
    pitchColor:  '#ffd4a8',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,⚽ Football Ground,🚗 Parking,🚿 Changing Room,💧 Drinking Water',
    description: 'Loginn Sports is a multi-sport facility in Nacharam Industrial Area offering box cricket and football.'
  },
  {
    name:        '18 Sports Arena Box Cricket',
    area:        'Mallapur',
    address:     'Opp. Janapriya Township, Annapurna Colony, Mallapur, Secunderabad, Telangana 500076',
    phone:       '8501818098',
    lat:         17.4023,
    lng:         78.5834,
    mapUrl:      'https://maps.app.goo.gl/pL4vwzp9wBBwWUM46',
    price:       800,
    rating:      4.2,
    reviews:     73,
    badge:       null,
    badgeClass:  '',
    bgColor:     '#f0faf5',
    pitchColor:  '#aadfc0',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
    description: 'Situated opposite Janapriya Township in Mallapur. Easy to find and good for evening matches.'
  },
  {
    name:        'Smart Box Cricket',
    area:        'Ramanthapur',
    address:     'KCR Nagar, Near Happy Bar, Ramanthapur, Hyderabad, Telangana 500013',
    phone:       '7093077349',
    lat:         17.3998,
    lng:         78.5421,
    mapUrl:      'https://maps.app.goo.gl/Z3Shmc7Wv6nAmhR79',
    price:       750,
    rating:      4.0,
    reviews:     55,
    badge:       null,
    badgeClass:  '',
    bgColor:     '#eef4fb',
    pitchColor:  '#b8d4f0',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
    description: 'Smart Box Cricket in KCR Nagar, Ramanthapur. Decent turf and lighting at an affordable price.'
  },
  {
    name:        'Sri Sports Club (SSC) - Box Cricket',
    area:        'Uppal',
    address:     'Plot 323, Raghavendra Nagar Colony, Srinivasa Colony, Uppal, Hyderabad, Telangana 500039',
    phone:       '9216269216',
    lat:         17.4156,
    lng:         78.5589,
    mapUrl:      'https://maps.app.goo.gl/UyP9uG67z3VMuKUB9',
    price:       700,
    rating:      4.1,
    reviews:     66,
    badge:       'Budget Pick',
    badgeClass:  'badge-budget',
    bgColor:     '#fdf5e8',
    pitchColor:  '#f5dfa0',
    amenities:   '🔦 Floodlights,🍃 Natural Turf,🚗 Parking,💧 Drinking Water',
    description: 'SSC Box Cricket in Raghavendra Nagar Colony, Uppal. Popular among local cricket enthusiasts.'
  },
  {
    name:        'Hit Zone Box Cricket',
    area:        'Uppal',
    address:     'Plot No 1404, HMDA, Raghavendra Nagar Colony, Gayatri Nagar, Uppal, Hyderabad, Telangana 500039',
    phone:       '9966111067',
    lat:         17.4134,
    lng:         78.5567,
    mapUrl:      'https://maps.app.goo.gl/oD9JfX6DkQCXUwWU9',
    price:       800,
    rating:      4.3,
    reviews:     91,
    badge:       'Popular',
    badgeClass:  'badge-popular',
    bgColor:     '#e8f5ee',
    pitchColor:  '#c5e8d2',
    amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,🚿 Changing Room,💧 Drinking Water',
    description: 'Hit Zone Box Cricket in Gayatri Nagar, Uppal. Frequently hosts local tournaments.'
  },
  // ============================================================
//  ADD THESE 15 GROUNDS to the seedAll([...]) array
//  in database.js — paste them BEFORE the closing ]) bracket
// ============================================================

    {
      name:        'SIM Arena Box Cricket',
      area:        'Necklace Road',
      address:     'IMAX Theater, opp. People\'s Plaza, Necklace Road, Hyderabad, Telangana 500082',
      phone:       '7207764105',
      lat:         17.4128,
      lng:         78.4772,
      mapUrl:      'https://maps.app.goo.gl/JPU1EUwjwQXZhj7e9',
      price:       1000,
      rating:      4.4,
      reviews:     112,
      badge:       'Popular',
      badgeClass:  'badge-popular',
      bgColor:     '#e8f5ee',
      pitchColor:  '#c5e8d2',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,🏬 Near IMAX,💧 Drinking Water',
      description: 'Situated near the IMAX Theater on Necklace Road, SIM Arena is one of Hyderabad\'s most scenic box cricket venues. Close to People\'s Plaza and Hussain Sagar lake.'
    },
    {
      name:        'Night Riders Box Cricket',
      area:        'Balanagar',
      address:     'Agarwal Complex, 11-175/1, Fateh Nagar Main Rd, Valmiki Nagar, Balanagar, Hyderabad, Telangana 500018',
      phone:       '9030505607',
      lat:         17.4725,
      lng:         78.4481,
      mapUrl:      'https://maps.app.goo.gl/YTS1bbhCJYim79N69',
      price:       750,
      rating:      4.1,
      reviews:     68,
      badge:       null,
      badgeClass:  '',
      bgColor:     '#1a1a2e',
      pitchColor:  '#16213e',
      bgColor:     '#eef4fb',
      pitchColor:  '#b8d4f0',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
      description: 'Night Riders Box Cricket in Balanagar is a well-known venue in the western Hyderabad belt. Good for evening and late-night matches with proper floodlighting.'
    },
    {
      name:        'Fitforte Sports Arena',
      area:        'Madhura Nagar',
      address:     'Below Metro Station, Lata Enclave, Madhura Nagar, Hyderabad, Telangana 500073',
      phone:       '9985511998',
      lat:         17.4502,
      lng:         78.4412,
      mapUrl:      'https://maps.app.goo.gl/wjNk5wq7N26Apj1S8',
      price:       850,
      rating:      4.3,
      reviews:     94,
      badge:       'Top Rated',
      badgeClass:  'badge-premium',
      bgColor:     '#f5eef8',
      pitchColor:  '#e0c8f0',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚇 Metro Nearby,🚗 Parking,🚿 Changing Room',
      description: 'Fitforte Sports Arena is conveniently located below Madhura Nagar Metro Station. One of the best-connected box cricket venues in Hyderabad — easy to reach by metro.'
    },
    {
      name:        'Rise And Reign Box Cricket',
      area:        'Upperpally',
      address:     'Street No 9, near Mahaveer Dry Fruit Store, AG Colony, Upperpally, Hyderabad, Telangana 500048',
      phone:       '9948122212',
      lat:         17.3412,
      lng:         78.4198,
      mapUrl:      'https://maps.app.goo.gl/uiMGWgKbAbwo5Uc9A',
      price:       750,
      rating:      4.2,
      reviews:     57,
      badge:       'New',
      badgeClass:  'badge-new',
      bgColor:     '#fff5ee',
      pitchColor:  '#ffd4a8',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🏸 Shuttle Court,🚗 Parking,💧 Drinking Water',
      description: 'Rise and Reign offers both box cricket and shuttle badminton in Upperpally. A great multi-sport option in South Hyderabad near Attapur.'
    },
    {
      name:        'Super Over - Box Cricket & Football',
      area:        'Attapur',
      address:     'Pillar No 118, Behind Hanuman Temple, Somi Reddy Nagar, Attapur, Hyderabad, Telangana 500048',
      phone:       '9390732277',
      lat:         17.3489,
      lng:         78.4231,
      mapUrl:      'https://maps.app.goo.gl/qaZh6J9A6NvEZ2736',
      price:       800,
      rating:      4.3,
      reviews:     88,
      badge:       null,
      badgeClass:  '',
      bgColor:     '#eef8f5',
      pitchColor:  '#b8e8d8',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,⚽ Football Ground,🚗 Parking,💧 Drinking Water',
      description: 'Super Over in Attapur offers both box cricket and football on the same premises. A popular multi-sport destination near the PVNR Expressway flyover.'
    },
    {
      name:        'Cloud9 Box Cricket',
      area:        'Attapur',
      address:     'Near KAYNS Badminton, Sri Sai Janachithanya Colony, Golden Heights Colony, Attapur, Hyderabad, Telangana 500048',
      phone:       '9885559585',
      lat:         17.3521,
      lng:         78.4267,
      mapUrl:      'https://maps.app.goo.gl/EzSbGz5LxkkpNeHP9',
      price:       800,
      rating:      4.2,
      reviews:     74,
      badge:       null,
      badgeClass:  '',
      bgColor:     '#e8f5ee',
      pitchColor:  '#c5e8d2',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water,🚿 Changing Room',
      description: 'Cloud9 Box Cricket in Attapur is located near KAYNS Badminton Academy. Clean facility with good turf and changing rooms — great for corporate outings.'
    },
    {
      name:        'Nex Arena Attapur - Indoor Box',
      area:        'Attapur',
      address:     'Plot No 162, Street No 1, Near PGR Divine Apartments, Nalanda Nagar, Attapur, Hyderabad, Telangana 500048',
      phone:       '9100850770',
      lat:         17.3498,
      lng:         78.4212,
      mapUrl:      'https://maps.app.goo.gl/DGKjSNM6wxqwNoQZ7',
      price:       900,
      rating:      4.5,
      reviews:     131,
      badge:       'Popular',
      badgeClass:  'badge-popular',
      bgColor:     '#fdf5e8',
      pitchColor:  '#f5dfa0',
      amenities:   '🔦 Floodlights,🏠 Indoor Arena,🌿 Artificial Turf,🚗 Parking,🚿 Changing Room,💧 Drinking Water',
      description: 'Nex Arena is a premium indoor box cricket facility in Attapur. Fully covered arena protects from rain and sun — one of the best indoor venues in South Hyderabad.'
    },
    {
      name:        'SL Sports Box Cricket',
      area:        'Amberpet',
      address:     'Bank Colony, Somasundara Nagar, Amberpet, Hyderabad, Telangana 500013',
      phone:       '8897159550',
      lat:         17.4023,
      lng:         78.5312,
      mapUrl:      'https://maps.app.goo.gl/iN9mSCKKHquct1316',
      price:       700,
      rating:      4.0,
      reviews:     49,
      badge:       'Budget Pick',
      badgeClass:  'badge-budget',
      bgColor:     '#eef2fb',
      pitchColor:  '#c8d6f5',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
      description: 'SL Sports Box Cricket in Amberpet offers affordable box cricket sessions in a well-maintained facility. Popular among local teams for evening practice sessions.'
    },
    {
      name:        'RR Box Cricket',
      area:        'Amberpet',
      address:     '2-3, 70/21, Amberpet, Hyderabad, Telangana 500013',
      phone:       'Not Available',
      lat:         17.4012,
      lng:         78.5289,
      mapUrl:      'https://maps.app.goo.gl/bC9oASoLSJxwDrHj6',
      price:       650,
      rating:      3.9,
      reviews:     31,
      badge:       'Budget Pick',
      badgeClass:  'badge-budget',
      bgColor:     '#f0faf5',
      pitchColor:  '#aadfc0',
      amenities:   '🔦 Floodlights,🍃 Natural Turf,🚗 Parking,💧 Drinking Water',
      description: 'RR Box Cricket is a budget-friendly option in Amberpet. Simple facilities with natural turf, ideal for regular neighbourhood matches at an affordable price.'
    },
    {
      name:        'Nex Arena Abids',
      area:        'Abids',
      address:     'Terrace, 5th Floor, Sagar Plaza, Hanuman Tekdi, Abids, Hyderabad, Telangana 500001',
      phone:       '7799263119',
      lat:         17.3889,
      lng:         78.4712,
      mapUrl:      'https://maps.app.goo.gl/PGouHRRTEYsvdWa56',
      price:       950,
      rating:      4.4,
      reviews:     108,
      badge:       'Top Rated',
      badgeClass:  'badge-premium',
      bgColor:     '#f5eef8',
      pitchColor:  '#e0c8f0',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🏙️ Rooftop Venue,🏬 Mall Parking,💧 Drinking Water',
      description: 'Nex Arena Abids is a unique rooftop box cricket experience on the 5th floor of Sagar Plaza in the heart of Abids. Stunning city views while you play!'
    },
    {
      name:        'Royal Sports Arena',
      area:        'Kothapet',
      address:     'Phanigiri Colony, Kothapet, Hyderabad, Telangana 500060',
      phone:       '8121809390',
      lat:         17.3712,
      lng:         78.5489,
      mapUrl:      'https://maps.app.goo.gl/YNmES6Aap6pqQvyn7',
      price:       800,
      rating:      4.2,
      reviews:     76,
      badge:       null,
      badgeClass:  '',
      bgColor:     '#fff5ee',
      pitchColor:  '#ffd4a8',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,🚿 Changing Room,💧 Drinking Water',
      description: 'Royal Sports Arena in Kothapet is a well-maintained box cricket ground popular in the LB Nagar corridor. Known for good turf quality and proper boundary nets.'
    },
    {
      name:        'KR Box Cricket',
      area:        'Dilsukhnagar',
      address:     'Indira Nagar, Chaitanyapuri, Dilsukhnagar, Hyderabad, Telangana 500060',
      phone:       '9346319190',
      lat:         17.3689,
      lng:         78.5412,
      mapUrl:      'https://maps.app.goo.gl/8ir8XUn9T6uY8Mas9',
      price:       750,
      rating:      4.1,
      reviews:     63,
      badge:       null,
      badgeClass:  '',
      bgColor:     '#eef8f5',
      pitchColor:  '#b8e8d8',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
      description: 'KR Box Cricket in Chaitanyapuri, Dilsukhnagar is a reliable venue for cricket in South Hyderabad. Easy to reach from Dilsukhnagar bus stand and metro.'
    },
    {
      name:        'Vintage Box Cricket',
      area:        'Uppal',
      address:     'Plot No 286, Near Nagole Road, Raghavendra Nagar Colony, Uppal Metro Station, Uppal, Hyderabad, Telangana 500039',
      phone:       '7794960606',
      lat:         17.4089,
      lng:         78.5598,
      mapUrl:      'https://maps.app.goo.gl/gX35sEAoqZ1BZ45E6',
      price:       750,
      rating:      4.0,
      reviews:     44,
      badge:       null,
      badgeClass:  '',
      bgColor:     '#fdf5e8',
      pitchColor:  '#f5dfa0',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚇 Metro Nearby,🚗 Parking,💧 Drinking Water',
      description: 'Vintage Box Cricket is located right next to Uppal Metro Station, making it one of the most accessible grounds in East Hyderabad. Ideal for post-office match sessions.'
    },
    {
      name:        'VV Box Cricket',
      area:        'Kothapet',
      address:     'Backside of Nimantran Palace, Near Samanthapuri, Kothapet, Hyderabad, Telangana 500102',
      phone:       '9000969567',
      lat:         17.3698,
      lng:         78.5467,
      mapUrl:      'https://maps.app.goo.gl/5LnhAoJppfBkfjvy6',
      price:       700,
      rating:      4.0,
      reviews:     38,
      badge:       'Budget Pick',
      badgeClass:  'badge-budget',
      bgColor:     '#e8f5ee',
      pitchColor:  '#c5e8d2',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,💧 Drinking Water',
      description: 'VV Box Cricket behind Nimantran Palace in Kothapet is a budget-friendly option in the area. Great for regular evening matches and casual weekend games.'
    },
    {
      name:        'The Box @ YMCA',
      area:        'Narayanguda',
      address:     'YMCA, Chitrapuri Colony, Narayanguda, Hyderabad, Telangana 500027',
      phone:       '8099225160',
      lat:         17.3989,
      lng:         78.4867,
      mapUrl:      'https://maps.app.goo.gl/LFmNvyhGmxy2GcGCA',
      price:       900,
      rating:      4.4,
      reviews:     119,
      badge:       'Popular',
      badgeClass:  'badge-popular',
      bgColor:     '#eef2fb',
      pitchColor:  '#c8d6f5',
      amenities:   '🔦 Floodlights,🌿 Artificial Turf,🏋️ Gym Nearby,🚗 Parking,🚿 Changing Room,💧 Drinking Water',
      description: 'The Box at YMCA Narayanguda is a premium box cricket venue inside the iconic YMCA campus. Well-maintained facilities with changing rooms and easy access from the city centre.'
    }
])
}
// ── DATABASE FUNCTIONS ──────────────────────────────────────

function getAllGrounds() {
  const grounds = db.prepare('SELECT * FROM grounds').all()

  return grounds.map(g => {
    const slots = db.prepare(
      'SELECT time, is_free FROM slots WHERE ground_id = ? ORDER BY id'
    ).all(g.id)

    return {
      ...g,
      amenities: g.amenities.split(','),
      slots: slots.map(s => ({
        time: s.time,
        free: s.is_free === 1
      }))
    }
  })
}

function getGroundById(id) {
  const ground = db.prepare('SELECT * FROM grounds WHERE id = ?').get(id)
  if (!ground) return null

  const slots = db.prepare(
    'SELECT time, is_free FROM slots WHERE ground_id = ? ORDER BY id'
  ).all(id)

  return {
    ...ground,
    amenities: ground.amenities.split(','),
    slots: slots.map(s => ({ time: s.time, free: s.is_free === 1 }))
  }
}

// function createBooking(groundId, groundName, name, phone, date, slots, total) {
//   const saveBooking = db.transaction(() => {
//     const result = db.prepare(`
//       INSERT INTO bookings (ground_id, ground_name, name, phone, date, slots, total)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `).run(groundId, groundName, name, phone, date, slots.join(','), total)

//     const markSlot = db.prepare(`
//       UPDATE slots SET is_free = 0
//       WHERE ground_id = ? AND time = ?
//     `)

//     for (const time of slots) {
//       markSlot.run(groundId, time)
//     }

//     return result.lastInsertRowid
//   })
function createBooking(
  groundId,
  groundName,
  name,
  phone,
  date,
  slots,
  total,
  convenienceFee,
  paymentType
) {
  const result = db.prepare(`
    INSERT INTO bookings (
      ground_id,
      ground_name,
      name,
      phone,
      date,
      slots,
      total,
      convenience_fee,
      payment_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    groundId,
    groundName,
    name,
    phone,
    date,
    slots.join(','),
    total,
    convenienceFee,
    paymentType
  )

  return result.lastInsertRowid
}
//   return saveBooking()
// }

// function checkSlotAvailability(groundId, date, slots) {
//   const bookings = db.prepare(`
//     SELECT slots FROM bookings
//     WHERE ground_id = ? AND date = ?
//   `).all(groundId, date)

//   const bookedSlots = bookings.flatMap(b => b.slots.split(','))

//   return slots.every(slot => !bookedSlots.includes(slot))
// }
function getGroundsWithAvailability(date) {
  const grounds = db.prepare('SELECT * FROM grounds').all()

  const allSlots = [
    "6 AM","7 AM","8 AM","9 AM",
    "4 PM","5 PM","6 PM","7 PM",
    "8 PM","9 PM","10 PM","11 PM"
  ]

  return grounds.map(g => {
    const bookings = db.prepare(`
      SELECT slots FROM bookings
      WHERE ground_id = ? AND date = ?
    `).all(g.id, date)

    const bookedSlots = bookings.flatMap(b => b.slots.split(','))

    const slots = allSlots.map(time => ({
      time,
      free: !bookedSlots.includes(time)
    }))

    return {
      ...g,
      amenities: g.amenities.split(','),
      slots
    }
  })
}
function getAllBookings() {
  return db.prepare(
    'SELECT * FROM bookings ORDER BY created_at DESC'
  ).all()
}

function getBookingsByGround(groundId) {
  return db.prepare(
    'SELECT * FROM bookings WHERE ground_id = ? ORDER BY created_at DESC'
  ).all(groundId)
}


function getUserByPhone(phone) {
  return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
}

function createUser(name, age, phone, latitude, longitude, area) {
  const result = db.prepare(`
    INSERT INTO users (name, age, phone, latitude, longitude, area)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, age, phone, latitude, longitude, area)

  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
}

function updateUser(name, age, latitude, longitude, area, phone) {
  db.prepare(`
    UPDATE users
    SET name = ?, age = ?, latitude = ?, longitude = ?, area = ?
    WHERE phone = ?
  `).run(name, age, latitude, longitude, area, phone)
}

// module.exports = {
//   getAllGrounds,
//   getGroundById,
//   createBooking,
//   getAllBookings,
//   getBookingsByGround,
//   getUserByPhone,    // ← add
//   createUser,        // ← add
//   updateUser         // ← add
// }

module.exports = {
  getAllGrounds,
  getGroundById,
  getGroundsWithAvailability,
  createBooking,
  getAllBookings,
  checkSlotAvailability,
  getUserByPhone,
  createUser,
  updateUser
}