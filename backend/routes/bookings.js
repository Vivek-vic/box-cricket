// ============================================================
//  BOOKINGS ROUTES — routes/bookings.js (UPDATED)
// ============================================================

const express = require('express')
const router  = express.Router()
const db      = require('../database.js')

// ── POST /api/bookings — create a new booking ───────────────
router.post('/', function(req, res) {
  try {
    const {
      groundId,
      groundName,
      name,
      phone,
      date,
      slots,
      convenienceFee,
      paymentType
    } = req.body

    // ── VALIDATION ──────────────────────────────────────────
    if (!groundId || !name || !phone || !date || !slots || !paymentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    if (!Array.isArray(slots) || slots.length === 0 || slots.length > 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid slot selection'
      })
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number'
      })
    }

    // ── CHECK GROUND ───────────────────────────────────────
    const ground = db.getGroundById(groundId)
    if (!ground) {
      return res.status(404).json({
        success: false,
        error: 'Ground not found'
      })
    }

    // ── CHECK SLOT AVAILABILITY ────────────────────────────
    const available = db.checkSlotAvailability(groundId, date, slots)
    if (!available) {
      return res.status(400).json({
        success: false,
        error: 'One or more slots already booked'
      })
    }

    // ── CALCULATE PRICES (SECURE) ──────────────────────────
    const groundTotal     = slots.length * ground.price
    const platformFee     = slots.length * 8   // ₹8/hour
    const finalTotal      = groundTotal + platformFee

    // ── PAYMENT RULES ──────────────────────────────────────
    if (paymentType === 'CASH') {
      // Only convenience fee should be paid online
      if (!convenienceFee || convenienceFee !== platformFee) {
        return res.status(400).json({
          success: false,
          error: 'Convenience fee mismatch'
        })
      }
    }

    // ── SAVE BOOKING ───────────────────────────────────────
    const bookingId = db.createBooking(
      groundId,
      groundName,
      name,
      phone,
      date,
      slots,
      groundTotal,
      platformFee,
      paymentType
    )

    // ── RESPONSE ───────────────────────────────────────────
    res.status(201).json({
      success: true,
      bookingId,
      breakdown: {
        groundTotal,
        convenienceFee: platformFee,
        finalTotal
      }
    })

  } catch (err) {
    console.error('Error creating booking:', err)
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    })
  }
})

// ── GET /api/bookings — admin ──────────────────────────────
router.get('/', function(req, res) {
  try {
    const bookings = db.getAllBookings()
    res.json({ success: true, bookings })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      error: 'Failed to load bookings'
    })
  }
})

module.exports = router