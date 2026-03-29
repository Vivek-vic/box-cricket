// ============================================================
//  SERVER — server.js
//  The entry point of the entire backend
// ============================================================

const express  = require('express')
const cors     = require('cors')
const path     = require('path')

// Import our route files
const groundsRouter  = require('./routes/grounds.js')
const bookingsRouter = require('./routes/bookings.js')
const usersRouter = require('./routes/users.js')

// This line starts the database (creates tables + seeds data)
require('./database.js')

// ── SETUP ──────────────────────────────────────────────────
const app  = express()
const PORT = 3000

// Middlewares — these run on every request before your routes
// app.use(cors())
  app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://localhost:3000',
    'https://box-cricket-liard.vercel.app'
  ],
  credentials: true
}))               // allow frontend on port 5500 to talk to us
app.use(express.json())       // parse JSON request bodies

// Serve your frontend files directly from the backend
// So you only need to run ONE server for everything
app.use(express.static(path.join(__dirname, '../frontend')))

// ── ROUTES ─────────────────────────────────────────────────
app.use('/api/grounds',  groundsRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/users', usersRouter)

// Catch-all — for any unknown route, send the frontend
app.get('/{*path}', function(req, res) {
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

// ── START ───────────────────────────────────────────────────
app.listen(PORT, function() {
  console.log('─────────────────────────────────────')
  console.log(`✅ CricBox server running!`)
  console.log(`🌐 Open: http://localhost:${PORT}`)
  console.log(`📦 API:  http://localhost:${PORT}/api/grounds`)
  console.log('─────────────────────────────────────')
})
