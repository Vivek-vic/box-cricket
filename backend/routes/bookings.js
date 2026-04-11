const express = require('express')
const router  = express.Router()
const db      = require('../database.js')

// POST /api/bookings
router.post('/', function(req, res) {
  try {
    const {
      groundId,
      groundName,
      name,
      phone,
      date,
      slots,
      total,
      convenienceFee,
      paymentType
    } = req.body

    if (!groundId || !name || !phone || !date || !slots || !total) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
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

    const bookingId = db.createBooking(
      groundId,
      groundName,
      name,
      phone,
      date,
      slots,
      total,
      convenienceFee || 0,
      paymentType || 'UPI'
    )

    // Mark slots as booked in the slots table
    const markSlot = require('better-sqlite3')(
      require('path').join(__dirname, '../cricbox.db')
    )
    slots.forEach(time => {
      markSlot.prepare(
        'UPDATE slots SET is_free = 0 WHERE ground_id = ? AND time = ?'
      ).run(groundId, time)
    })
    markSlot.close()

    res.status(201).json({
      success: true,
      bookingId,
      message: `Booking confirmed at ${groundName}`
    })

  } catch (err) {
    console.error('Booking error:', err)
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    })
  }
})

// GET /api/bookings
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