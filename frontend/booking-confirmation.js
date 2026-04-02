// ============================================================
//  BOOKING CONFIRMATION — booking-confirmation.js
//  Reads booking details from localStorage
//  and displays the ticket
// ============================================================

// ── LOAD BOOKING DATA ──────────────────────────────────────
// After a successful booking, script.js saves the booking
// details to localStorage under 'cricbox_last_booking'
// We read it here and populate the ticket

function loadConfirmation() {
  const stored = localStorage.getItem('cricbox_last_booking')

  if (!stored) {
    // No booking data — redirect back to grounds
    window.location.href = 'index.html'
    return
  }

  const booking = JSON.parse(stored)

  // Format booking ID as CRB-0042
  const bookingIdFormatted = `CRB-${String(booking.bookingId).padStart(4, '0')}`

  // Format date nicely — "2026-03-31" → "31 March 2026"
  const dateObj    = new Date(booking.date)
  const dateFormatted = dateObj.toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  })

  // Format time range — ["8 PM", "9 PM"] → "8 PM – 10 PM"
  const slots     = booking.slots   // array like ["8 PM", "9 PM"]
  const timeRange = slots.length > 1
    ? `${slots[0]} – ${slots[slots.length - 1]}`
    : slots[0]

  // Duration
  const duration = `${slots.length} hour${slots.length > 1 ? 's' : ''}`

  // Booked on (current time)
  const bookedOn = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  // ── Fill in all ticket fields ──
  document.getElementById('ticketId').textContent      = bookingIdFormatted
  document.getElementById('tGround').textContent       = booking.groundName
  document.getElementById('tDate').textContent         = dateFormatted
  document.getElementById('tTime').textContent         = timeRange
  document.getElementById('tDuration').textContent     = duration
  document.getElementById('tTotal').textContent        = `₹${booking.total}`
  document.getElementById('tName').textContent         = booking.name
  document.getElementById('tPhone').textContent        = booking.phone
  document.getElementById('tArea').textContent         = booking.area || 'Hyderabad'
  document.getElementById('tBookedOn').textContent     = bookedOn
  document.getElementById('infoBookingId').textContent = bookingIdFormatted
  document.getElementById('barcodeText').textContent   = bookingIdFormatted

  // Generate barcode decoration
  generateBarcode(bookingIdFormatted)

  // Update page title
  document.title = `CricBox — Booking ${bookingIdFormatted}`
}


// ── GENERATE BARCODE DECORATION ────────────────────────────
// Creates random-looking barcode bars based on booking ID

function generateBarcode(id) {
  const container = document.getElementById('barcodeStrips')
  container.innerHTML = ''

  // Use booking ID characters to seed bar heights
  const chars = (id + id).split('')
  const barCount = 40

  for (let i = 0; i < barCount; i++) {
    const bar      = document.createElement('div')
    bar.className  = 'barcode-bar'
    const charCode = chars[i % chars.length].charCodeAt(0)
    const height   = 12 + (charCode % 28)   // height between 12px and 40px
    const width    = i % 3 === 0 ? 3 : 1.5  // some bars wider
    bar.style.height = `${height}px`
    bar.style.width  = `${width}px`
    container.appendChild(bar)
  }
}


// ── COPY BOOKING ID ────────────────────────────────────────

function copyBookingId() {
  const stored  = localStorage.getItem('cricbox_last_booking')
  if (!stored) return

  const booking = JSON.parse(stored)
  const id      = `CRB-${String(booking.bookingId).padStart(4, '0')}`

  navigator.clipboard.writeText(id).then(() => {
    showToast(`✅ Copied: ${id}`)
  }).catch(() => {
    // Fallback for older browsers
    showToast(`Your Booking ID: ${id}`)
  })
}


// ── PRINT TICKET ───────────────────────────────────────────

function printTicket() {
  window.print()
}


// ── TOAST ──────────────────────────────────────────────────

let toastTimer = null

function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000)
}


// ── START ──────────────────────────────────────────────────
loadConfirmation()