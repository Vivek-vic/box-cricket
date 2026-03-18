// ============================================================
//  DATABASE SETUP — database.js
//  This file:
//  1. Creates the SQLite database file (cricbox.db)
//  2. Creates the tables if they don't exist yet
//  3. Exports functions that server.js uses to read/write data
// ============================================================

const Database = require('better-sqlite3')
const path     = require('path')

// This creates the .db file in your backend folder
// If it already exists, it just opens it
const db = new Database(path.join(__dirname, 'cricbox.db'))

// ── CREATE TABLES ──────────────────────────────────────────
// These run every time the server starts
// "IF NOT EXISTS" means it won't crash if tables are already there

db.exec(`
  CREATE TABLE IF NOT EXISTS grounds (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    area        TEXT    NOT NULL,
    address     TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    distance    TEXT    NOT NULL,
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
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ground_id  INTEGER NOT NULL,
    time       TEXT    NOT NULL,
    is_free    INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (ground_id) REFERENCES grounds(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ground_id  INTEGER NOT NULL,
    ground_name TEXT   NOT NULL,
    name       TEXT    NOT NULL,
    phone      TEXT    NOT NULL,
    date       TEXT    NOT NULL,
    slots      TEXT    NOT NULL,
    total      INTEGER NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ground_id) REFERENCES grounds(id)
  );
`)

// ── SEED GROUNDS ───────────────────────────────────────────
// Only insert ground data if the table is empty
// So we don't duplicate data every time the server restarts

const groundCount = db.prepare('SELECT COUNT(*) as count FROM grounds').get()

if (groundCount.count === 0) {
  console.log('Seeding grounds data...')

  const insertGround = db.prepare(`
    INSERT INTO grounds
      (name, area, address, phone, distance, map_url, price, rating,
       reviews, badge, badge_class, bg_color, pitch_color, amenities, description)
    VALUES
      (@name, @area, @address, @phone, @distance, @mapUrl, @price, @rating,
       @reviews, @badge, @badgeClass, @bgColor, @pitchColor, @amenities, @description)
  `)

  const insertSlot = db.prepare(`
    INSERT INTO slots (ground_id, time, is_free)
    VALUES (@groundId, @time, @isFree)
  `)

  // Use a transaction so all inserts happen together (faster + safer)
  const seedAll = db.transaction((grounds) => {
    for (const g of grounds) {
      const result = insertGround.run(g)
      const groundId = result.lastInsertRowid

      for (const slot of g.slots) {
        insertSlot.run({
          groundId,
          time:   slot.time,
          isFree: slot.free ? 1 : 0
        })
      }
    }
  })

  // The real ground data
  seedAll([
    {
      name: 'Smaaash Cricket', area: 'Madhapur',
      address: 'Inorbit Mall, HITEC City Rd, Madhapur, Hyderabad – 500081',
      phone: '+91 98490 12345', distance: '2.3 km',
      mapUrl: 'https://maps.google.com/?q=Smaaash+Inorbit+Mall+Hyderabad',
      price: 1200, rating: 4.5, reviews: 318,
      badge: 'Popular', badgeClass: 'badge-popular',
      bgColor: '#e8f5ee', pitchColor: '#c5e8d2',
      amenities: '🔦 Floodlights,🌿 Artificial Turf,🚗 Parking,🚿 Changing Room,☕ Cafeteria',
      description: 'One of Hyderabad\'s top indoor box cricket venues inside Inorbit Mall.',
      slots: [
        { time: '6 AM', free: true  }, { time: '7 AM', free: false },
        { time: '8 AM', free: true  }, { time: '9 AM', free: false },
        { time: '4 PM', free: true  }, { time: '5 PM', free: false },
        { time: '6 PM', free: true  }, { time: '7 PM', free: false },
        { time: '8 PM', free: true  }, { time: '9 PM', free: true  },
        { time: '10 PM', free: false }, { time: '11 PM', free: true }
      ]
    },
    {
      name: 'Box Cricket Club HYD', area: 'Gachibowli',
      address: 'Near Wipro Circle, Gachibowli, Hyderabad – 500032',
      phone: '+91 97010 55678', distance: '4.8 km',
      mapUrl: 'https://maps.google.com/?q=Box+Cricket+Club+Gachibowli+Hyderabad',
      price: 1000, rating: 4.3, reviews: 214,
      badge: 'Top Rated', badgeClass: 'badge-premium',
      bgColor: '#eef2fb', pitchColor: '#c8d6f5',
      amenities: '🔦 Floodlights,🌿 Astro Turf,📊 Scoreboard,🚗 Parking,🚿 Changing Room',
      description: 'Well-known box cricket ground near Wipro Circle, popular among IT professionals.',
      slots: [
        { time: '6 AM', free: false }, { time: '7 AM', free: true  },
        { time: '8 AM', free: false }, { time: '9 AM', free: true  },
        { time: '4 PM', free: true  }, { time: '5 PM', free: false },
        { time: '6 PM', free: true  }, { time: '7 PM', free: true  },
        { time: '8 PM', free: false }, { time: '9 PM', free: true  },
        { time: '10 PM', free: true }, { time: '11 PM', free: false }
      ]
    },
    {
      name: 'Premier Box Cricket', area: 'Kompally',
      address: 'Suchitra Circle, Kompally, Hyderabad – 500067',
      phone: '+91 90000 11223', distance: '14.2 km',
      mapUrl: 'https://maps.google.com/?q=Premier+Box+Cricket+Kompally+Hyderabad',
      price: 700, rating: 4.1, reviews: 89,
      badge: 'Budget Pick', badgeClass: 'badge-budget',
      bgColor: '#fdf5e8', pitchColor: '#f5dfa0',
      amenities: '🔦 Floodlights,🍃 Natural Turf,🚗 Parking,💧 Drinking Water',
      description: 'Affordable and spacious ground in North Hyderabad. Great for casual games.',
      slots: [
        { time: '6 AM', free: true  }, { time: '7 AM', free: true  },
        { time: '8 AM', free: true  }, { time: '9 AM', free: false },
        { time: '4 PM', free: true  }, { time: '5 PM', free: true  },
        { time: '6 PM', free: false }, { time: '7 PM', free: true  },
        { time: '8 PM', free: false }, { time: '9 PM', free: true  },
        { time: '10 PM', free: true }, { time: '11 PM', free: true }
      ]
    },
    {
      name: 'Sports Village Box Cricket', area: 'Uppal',
      address: 'Ramanthapur Rd, Near Uppal Metro, Uppal – 500039',
      phone: '+91 91234 56780', distance: '11.5 km',
      mapUrl: 'https://maps.google.com/?q=Sports+Village+Box+Cricket+Uppal+Hyderabad',
      price: 800, rating: 4.4, reviews: 176,
      badge: 'Trending', badgeClass: 'badge-popular',
      bgColor: '#f5eef8', pitchColor: '#e0c8f0',
      amenities: '🔦 Floodlights,🌿 Artificial Turf,🏋️ Coaching,🚿 Dressing Room,💧 Water',
      description: 'Highly popular venue near Uppal Metro Station. Book in advance.',
      slots: [
        { time: '6 AM', free: false }, { time: '7 AM', free: false },
        { time: '8 AM', free: false }, { time: '9 AM', free: false },
        { time: '4 PM', free: false }, { time: '5 PM', free: false },
        { time: '6 PM', free: false }, { time: '7 PM', free: false },
        { time: '8 PM', free: true  }, { time: '9 PM', free: true  },
        { time: '10 PM', free: true }, { time: '11 PM', free: false }
      ]
    },
    {
      name: 'Sportz Village', area: 'Kukatpally',
      address: 'KPHB Phase 5, Near JNTU, Kukatpally – 500072',
      phone: '+91 80008 99001', distance: '7.1 km',
      mapUrl: 'https://maps.google.com/?q=Sportz+Village+Kukatpally+Hyderabad',
      price: 850, rating: 4.2, reviews: 132,
      badge: null, badgeClass: '',
      bgColor: '#eef8f5', pitchColor: '#b8e8d8',
      amenities: '🔦 Floodlights,🌿 Artificial Turf,☕ Cafeteria,🚗 Parking,🚿 Changing Room',
      description: 'Popular multi-sport venue in KPHB with a dedicated box cricket arena.',
      slots: [
        { time: '6 AM', free: true  }, { time: '7 AM', free: false },
        { time: '8 AM', free: true  }, { time: '9 AM', free: true  },
        { time: '4 PM', free: false }, { time: '5 PM', free: true  },
        { time: '6 PM', free: true  }, { time: '7 PM', free: false },
        { time: '8 PM', free: true  }, { time: '9 PM', free: true  },
        { time: '10 PM', free: false }, { time: '11 PM', free: true }
      ]
    },
    {
      name: 'Cricket Box Arena', area: 'Miyapur',
      address: 'Near Miyapur Metro Exit 1, Miyapur – 500049',
      phone: '+91 73737 12345', distance: '10.3 km',
      mapUrl: 'https://maps.google.com/?q=Cricket+Box+Arena+Miyapur+Hyderabad',
      price: 750, rating: 4.0, reviews: 58,
      badge: 'New', badgeClass: 'badge-new',
      bgColor: '#eef4fb', pitchColor: '#b8d4f0',
      amenities: '🔦 Floodlights,🏏 Matting Pitch,🚿 Changing Room,💧 Drinking Water',
      description: 'Brand new facility right next to Miyapur Metro. Opening discounts available.',
      slots: [
        { time: '6 AM', free: true  }, { time: '7 AM', free: true  },
        { time: '8 AM', free: false }, { time: '9 AM', free: true  },
        { time: '4 PM', free: true  }, { time: '5 PM', free: true  },
        { time: '6 PM', free: true  }, { time: '7 PM', free: true  },
        { time: '8 PM', free: true  }, { time: '9 PM', free: false },
        { time: '10 PM', free: true }, { time: '11 PM', free: false }
      ]
    },
    {
      name: 'Green Park Box Cricket', area: 'Nizampet',
      address: 'Nizampet X Roads, Near Bachupally, Hyderabad – 500090',
      phone: '+91 98765 43210', distance: '13.6 km',
      mapUrl: 'https://maps.google.com/?q=Green+Park+Box+Cricket+Nizampet+Hyderabad',
      price: 650, rating: 3.9, reviews: 44,
      badge: 'Budget Pick', badgeClass: 'badge-budget',
      bgColor: '#f0faf5', pitchColor: '#aadfc0',
      amenities: '🔦 Floodlights,🍃 Natural Turf,🚗 Parking',
      description: 'One of the most affordable grounds in the Nizampet-Bachupally belt.',
      slots: [
        { time: '6 AM', free: true  }, { time: '7 AM', free: true  },
        { time: '8 AM', free: true  }, { time: '9 AM', free: true  },
        { time: '4 PM', free: true  }, { time: '5 PM', free: true  },
        { time: '6 PM', free: false }, { time: '7 PM', free: true  },
        { time: '8 PM', free: true  }, { time: '9 PM', free: true  },
        { time: '10 PM', free: false }, { time: '11 PM', free: true }
      ]
    },
    {
      name: 'Champions Box Cricket', area: 'LB Nagar',
      address: 'Near LB Nagar Flyover, LB Nagar – 500074',
      phone: '+91 99988 77665', distance: '16.2 km',
      mapUrl: 'https://maps.google.com/?q=Champions+Box+Cricket+LB+Nagar+Hyderabad',
      price: 900, rating: 4.3, reviews: 101,
      badge: null, badgeClass: '',
      bgColor: '#fff5ee', pitchColor: '#ffd4a8',
      amenities: '🔦 Floodlights,🌿 Artificial Turf,📊 Scoreboard,🚗 Parking,☕ Cafeteria',
      description: 'Popular ground in South Hyderabad. Known for hosting weekend tournaments.',
      slots: [
        { time: '6 AM', free: false }, { time: '7 AM', free: true  },
        { time: '8 AM', free: true  }, { time: '9 AM', free: false },
        { time: '4 PM', free: true  }, { time: '5 PM', free: true  },
        { time: '6 PM', free: false }, { time: '7 PM', free: true  },
        { time: '8 PM', free: true  }, { time: '9 PM', free: false },
        { time: '10 PM', free: true }, { time: '11 PM', free: true }
      ]
    }
  ])

  console.log('✅ Grounds and slots seeded successfully!')
}

// ── DATABASE FUNCTIONS ──────────────────────────────────────
// These are the functions server.js will call
// Think of these as the "helpers" that talk to the database

// Get all grounds with their current slot availability
function getAllGrounds() {
  const grounds = db.prepare('SELECT * FROM grounds').all()

  return grounds.map(g => {
    const slots = db.prepare(
      'SELECT time, is_free FROM slots WHERE ground_id = ? ORDER BY id'
    ).all(g.id)

    return {
      ...g,
      amenities: g.amenities.split(','),   // convert "a,b,c" → ["a","b","c"]
      slots: slots.map(s => ({
        time: s.time,
        free: s.is_free === 1
      }))
    }
  })
}

// Get one ground by ID
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

// Save a new booking + mark those slots as booked
function createBooking(groundId, groundName, name, phone, date, slots, total) {
  // Use a transaction — both the booking save AND slot updates
  // must succeed together. If one fails, both roll back.
  const saveBooking = db.transaction(() => {

    // 1. Insert the booking record
    const result = db.prepare(`
      INSERT INTO bookings (ground_id, ground_name, name, phone, date, slots, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(groundId, groundName, name, phone, date, slots.join(','), total)

    // 2. Mark each booked slot as taken in the slots table
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

// Get all bookings (for admin view later)
function getAllBookings() {
  return db.prepare(
    'SELECT * FROM bookings ORDER BY created_at DESC'
  ).all()
}

// Get bookings for one specific ground
function getBookingsByGround(groundId) {
  return db.prepare(
    'SELECT * FROM bookings WHERE ground_id = ? ORDER BY created_at DESC'
  ).all(groundId)
}

// Export all functions so server.js can use them
module.exports = {
  getAllGrounds,
  getGroundById,
  createBooking,
  getAllBookings,
  getBookingsByGround
}