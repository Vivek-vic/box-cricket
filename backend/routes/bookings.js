// ============================================================
//  BOOKINGS ROUTES — routes/bookings.js
//  Handles creating and viewing bookings
// ============================================================

const express = require('express')
const router  = express.Router()
const db      = require('../database.js')

// POST /api/bookings — create a new booking
router.post('/', function(req, res) {
  try {
    const { groundId, groundName, name, phone, date, slots, total } = req.body

    // ── VALIDATE — make sure nothing is missing ──
    if (!groundId || !name || !phone || !date || !slots || !total) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: groundId, name, phone, date, slots, total'
      })
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Slots must be a non-empty array'
      })
    }

    if (slots.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 3 slots allowed per booking'
      })
    }

    // ── SAVE to database ──
    const bookingId = db.createBooking(
      groundId, groundName, name, phone, date, slots, total
    )

    // ── REPLY ──
    res.status(201).json({
      success: true,
      bookingId,
      message: `Booking confirmed at ${groundName} for ${slots.join(', ')}`
    })

  } catch (err) {
    console.error('Error creating booking:', err)
    res.status(500).json({ success: false, error: 'Failed to create booking' })
  }
})

// GET /api/bookings — get all bookings (admin)
router.get('/', function(req, res) {
  try {
    const bookings = db.getAllBookings()
    res.json({ success: true, bookings })
  } catch (err) {
    console.error('Error fetching bookings:', err)
    res.status(500).json({ success: false, error: 'Failed to load bookings' })
  }
})

module.exports = router