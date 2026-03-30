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
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ground_id   INTEGER NOT NULL,
    ground_name TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    date        TEXT    NOT NULL,
    slots       TEXT    NOT NULL,
    total       INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ground_id) REFERENCES grounds(id)
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

function createBooking(groundId, groundName, name, phone, date, slots, total) {
  const saveBooking = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO bookings (ground_id, ground_name, name, phone, date, slots, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(groundId, groundName, name, phone, date, slots.join(','), total)

    const markSlot = db.prepare(`
      UPDATE slots SET is_free = 0
      WHERE ground_id = ? AND time = ?
    `)

    for (const time of slots) {
      markSlot.run(groundId, time)
    }

    return result.lastInsertRowid
  })

  return saveBooking()
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

module.exports = {
  getAllGrounds,
  getGroundById,
  createBooking,
  getAllBookings,
  getBookingsByGround,
  getUserByPhone,    // ← add
  createUser,        // ← add
  updateUser         // ← add
}