// ============================================================
//  PAYMENT PAGE — payment.js
// ============================================================

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://cricbox-backend-kvv3.onrender.com'

// ── Load pending booking from localStorage ──────────────────
const pending = JSON.parse(localStorage.getItem('pendingBooking'))
const user    = JSON.parse(localStorage.getItem('cricbox_user'))

// ── Convenience Fee Calculation ────────────────────────────
const CONVENIENCE_FEE_PER_HOUR = 8

const slotCount       = pending.slots.length
const convenienceFee  = slotCount * CONVENIENCE_FEE_PER_HOUR
const finalTotal      = pending.total + convenienceFee
let payableAmount = finalTotal   // default (online)

const btn = document.getElementById('finalPayBtn')
btn.innerHTML = `🏏 Confirm & Pay ₹${finalTotal}`

// If no booking data — go back to grounds
if (!pending || !user) {
  window.location.href = 'index.html'
}

// ── Format date nicely ───────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day:     'numeric',
    month:   'long',
    year:    'numeric'
  })
}

// ── Format slots nicely ──────────────────────────────────────
function formatSlots(slots) {
  if (slots.length === 1) return slots[0]
  return `${slots[0]} → ${slots[slots.length - 1]}`
}

// ── Populate the booking ticket ──────────────────────────────
document.getElementById('btnAmount').textContent = finalTotal

document.getElementById('ticketContent').innerHTML = `
  <div class="ticket-head">📋 Booking Summary</div>

  <div class="ticket-row">
    <span class="t-label">Ground</span>
    <span class="t-value">${pending.groundName}</span>
  </div>

  <div class="ticket-row">
    <span class="t-label">Date</span>
    <span class="t-value">${formatDate(pending.date)}</span>
  </div>

  <div class="ticket-row">
    <span class="t-label">Time</span>
    <span class="t-value">${formatSlots(pending.slots)}</span>
  </div>

  <div class="ticket-row">
    <span class="t-label">Duration</span>
    <span class="t-value">${pending.slots.length} hour${pending.slots.length > 1 ? 's' : ''}</span>
  </div>

  <div class="ticket-row">
    <span class="t-label">Booked by</span>
    <span class="t-value">${pending.name}</span>
  </div>

  <div class="ticket-row">
    <span class="t-label">Phone</span>
    <span class="t-value">${pending.phone}</span>
  </div>

  <div class="ticket-divider"></div>

<div class="ticket-row">
  <span class="t-label">Ground Charges</span>
  <span class="t-value">₹${pending.total}</span>
</div>

<div class="ticket-row">
  <span class="t-label">Convenience Fee</span>
  <span class="t-value">₹${convenienceFee}</span>
</div>

<div class="ticket-divider"></div>

<div class="ticket-total-row">
  <span class="ticket-total-label">Total Payable</span>
  <span class="ticket-total-amount">₹${finalTotal}</span>
</div>
`

// ── Payment method selection ─────────────────────────────────
const cards = document.querySelectorAll('.method-card')
cards.forEach(card => {
  card.addEventListener('click', () => {
    cards.forEach(c => c.classList.remove('active'))
    card.classList.add('active')

    const method = card.querySelector('input').value

    const btn = document.getElementById('finalPayBtn')

    // 🔥 ADD THIS (label + note)
    const totalLabel = document.querySelector('.ticket-total-label')
    const cashNote   = document.getElementById('cashNote')

    if (method === 'CASH') {
      payableAmount = convenienceFee

      // Button update
      btn.innerHTML = `🏏 Pay ₹${convenienceFee} now <br>
        <span style="font-size:12px;font-weight:400">
          ₹${pending.total} at venue
        </span>`

      // 🔥 NEW: label change
      totalLabel.textContent = 'Pay Now'

      // 🔥 NEW: show note
      if (cashNote) cashNote.style.display = 'block'

    } else {
      payableAmount = finalTotal

      btn.innerHTML = `🏏 Confirm & Pay ₹${finalTotal}`

      // 🔥 NEW: reset label
      totalLabel.textContent = 'Total Payable'

      // 🔥 NEW: hide note
      if (cashNote) cashNote.style.display = 'none'
    }

    document.getElementById('btnAmount').textContent = payableAmount
  })
})


// ── Process Payment ──────────────────────────────────────────
async function processPayment() {
  const btn    = document.getElementById('finalPayBtn')
  const method = document.querySelector('input[name="payMethod"]:checked').value
  // If Pay at Venue → only pay convenience fee
if (method === 'venue') {
  alert(`Please pay ₹${convenienceFee} as convenience fee to confirm booking`)
}

  // Show processing state
  btn.disabled    = true
  btn.innerHTML   = '⏳ Processing...'

  // Simulate payment processing delay (1.5 seconds)
  // In real Razorpay, this is where the payment gateway opens
  await new Promise(resolve => setTimeout(resolve, 1500))

  try {
    // Send booking to backend
    const res = await fetch(`${API_URL}/api/bookings`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
  groundId:   pending.groundId,
  groundName: pending.groundName,
  name:       pending.name,
  phone:      pending.phone,
  date:       pending.date,
  slots:      pending.slots,
  total:      payableAmount,
  convenienceFee: convenienceFee,
  paymentType: method
})
    })

    const data = await res.json()

    if (data.success) {
      // ✅ Payment + Booking successful

      btn.style.background = '#1a8c52'
      btn.innerHTML        = '✅ Payment Successful!'

      // Save full booking details for confirmation page
      localStorage.setItem('cricbox_last_booking', JSON.stringify({
        bookingId:     data.bookingId,
        groundName:    pending.groundName,
        area:          pending.area || '',
        date:          pending.date,
        slots:         pending.slots,
        total:         finalTotal,
        convenienceFee: convenienceFee,
        name:          pending.name,
        phone:         pending.phone,
        paymentMethod: method
      }))

      // Clear the pending booking
      localStorage.removeItem('pendingBooking')

      // Short delay then go to confirmation page
      setTimeout(() => {
        window.location.href = 'booking-confirmation.html'
      }, 1000)

    } else {
      throw new Error(data.error || 'Booking failed')
    }

  } catch (err) {
    console.error('Payment error:', err)

    btn.disabled  = false
    btn.innerHTML = `🏏 Confirm &amp; Pay ₹${payableAmount}`
    btn.style.background = ''

    // Show error message on page instead of alert
    showPaymentError(err.message)
  }
}


// ── Show error message on page ───────────────────────────────
function showPaymentError(message) {
  // Remove existing error if any
  const existing = document.getElementById('payError')
  if (existing) existing.remove()

  const err = document.createElement('div')
  err.id    = 'payError'
  err.style.cssText = `
    background: #fdf0ee;
    border: 1px solid #f5c6c0;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    color: #c0392b;
    margin-top: 12px;
    font-weight: 500;
  `
  err.textContent = `⚠️ ${message}. Please try again.`

  const btn = document.getElementById('finalPayBtn')
  btn.parentNode.insertBefore(err, btn.nextSibling)

  // Auto remove after 4 seconds
  setTimeout(() => err.remove(), 4000)
}