// ============================================================
//  GROUNDS ROUTES — routes/grounds.js
//  Handles everything related to listing grounds
// ============================================================

const express = require('express')
const router  = express.Router()
const db      = require('../database.js')

// GET /api/grounds — return all grounds with slots
router.get('/', function(req, res) {
  try {
    const grounds = db.getAllGrounds()
    res.json({ success: true, grounds })
  } catch (err) {
    console.error('Error fetching grounds:', err)
    res.status(500).json({ success: false, error: 'Failed to load grounds' })
  }
})

// GET /api/grounds/:id — return one ground by ID
router.get('/:id', function(req, res) {
  try {
    const ground = db.getGroundById(req.params.id)
    if (!ground) {
      return res.status(404).json({ success: false, error: 'Ground not found' })
    }
    res.json({ success: true, ground })
  } catch (err) {
    console.error('Error fetching ground:', err)
    res.status(500).json({ success: false, error: 'Failed to load ground' })
  }
})

module.exports = router