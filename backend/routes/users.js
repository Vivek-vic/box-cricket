// ============================================================
//  USERS ROUTES — routes/users.js
// ============================================================

const express = require('express')
const router  = express.Router()
const db      = require('../database.js')

// ── POST /api/users ─────────────────────────────────────────

router.post('/', function(req, res) {
  try {
    const { name, age, phone, latitude, longitude, area } = req.body

    // Validate
    if (!name || !age || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, age and phone are required'
      })
    }

    if (String(phone).length !== 10 || isNaN(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Phone must be a valid 10-digit number'
      })
    }

    if (age < 5 || age > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid age'
      })
    }

    // Check if returning user
    const existing = db.getUserByPhone(phone)

    if (existing) {
      db.updateUser(name, age, latitude || null, longitude || null, area || null, phone)
      const updated = db.getUserByPhone(phone)
      return res.json({
        success:   true,
        isNewUser: false,
        message:   `Welcome back, ${updated.name}!`,
        user:      updated
      })
    }

    // New user
    const newUser = db.createUser(
      name,
      parseInt(age),
      phone,
      latitude  || null,
      longitude || null,
      area      || null
    )

    res.status(201).json({
      success:   true,
      isNewUser: true,
      message:   `Welcome, ${newUser.name}! 🏏`,
      user:      newUser
    })

  } catch (err) {
    console.error('User registration error:', err)
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.'
    })
  }
})

// ── GET /api/users/:phone ───────────────────────────────────

router.get('/:phone', function(req, res) {
  try {
    const user = db.getUserByPhone(req.params.phone)

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    res.json({ success: true, user })

  } catch (err) {
    console.error('User lookup error:', err)
    res.status(500).json({ success: false, error: 'Something went wrong' })
  }
})
// ── USER FUNCTIONS ─────────────────────────────────────────
// Add these 3 functions to database.js
// Place them just ABOVE the module.exports block

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



module.exports = router