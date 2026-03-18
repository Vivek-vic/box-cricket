// ============================================================
//  CricBox Frontend — script.js
//  All ground data now comes from the backend API.
//  Bookings are sent to the backend via POST /api/bookings
// ============================================================

// ── STATE ───────────────────────────────────────────────────
let grounds       = []     // filled by loadGrounds() from the API
let availOnly     = false
let selectedSlots = {}     // { groundId: ['8 PM', '9 PM'] }


// ============================================================
//  INIT — runs on page load
// ============================================================

async function init() {
  await loadGrounds()
  populateAreaFilter()
  updateHeroStats()
  renderCards()
}


// ============================================================
//  LOAD GROUNDS FROM BACKEND
//  Replaces the old hardcoded array
// ============================================================

async function loadGrounds() {
  try {
    const res  = await fetch('http://localhost:3000/api/grounds')
    const data = await res.json()

    if (data.success) {
      grounds = data.grounds
    } else {
      showToast('⚠️ Failed to load grounds')
    }
  } catch (err) {
    console.error('Could not reach backend:', err)
    showToast('⚠️ Cannot connect to server. Is it running?')
  }
}


// ============================================================
//  HERO STATS — calculated from live data
// ============================================================

function updateHeroStats() {
  const prices = grounds.map(g => g.price)
  const areas  = [...new Set(grounds.map(g => g.area))]

  document.getElementById('heroEyebrow').textContent = `🏟️ ${grounds.length} Grounds Listed`
  document.getElementById('statGrounds').textContent = grounds.length
  document.getElementById('statPrice').textContent   = `₹${Math.min(...prices)}–₹${Math.max(...prices)}`
  document.getElementById('statAreas').textContent   = areas.length
}


// ============================================================
//  POPULATE AREA FILTER DROPDOWN
// ============================================================

function populateAreaFilter() {
  const areas  = [...new Set(grounds.map(g => g.area))].sort()
  const select = document.getElementById('areaFilter')

  select.innerHTML = '<option value="">All Areas</option>'

  areas.forEach(area => {
    const opt       = document.createElement('option')
    opt.value       = area
    opt.textContent = area
    select.appendChild(opt)
  })
}


// ============================================================
//  RENDER CARDS — filter → sort → build HTML
// ============================================================

function renderCards() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim()
  const area  = document.getElementById('areaFilter').value
  const sort  = document.getElementById('sortFilter').value

  let list = grounds.filter(g => {
    const matchSearch = !query ||
      g.name.toLowerCase().includes(query) ||
      g.area.toLowerCase().includes(query) ||
      g.address.toLowerCase().includes(query)
    const matchArea  = !area || g.area === area
    const matchAvail = !availOnly || g.slots.some(s => s.free)
    return matchSearch && matchArea && matchAvail
  })

  if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
  if (sort === 'rating')     list.sort((a, b) => b.rating - a.rating)
  if (sort === 'name')       list.sort((a, b) => a.name.localeCompare(b.name))

  document.getElementById('resultsLabel').innerHTML =
    `Showing <strong>${list.length}</strong> of <strong>${grounds.length}</strong> grounds`

  const grid = document.getElementById('grid')

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <span class="empty-icon">🏏</span>
        <div class="empty-title">No grounds found</div>
        <p>Try a different search term or remove some filters.</p>
      </div>`
    return
  }

  grid.innerHTML = list.map((g, i) => buildCard(g, i)).join('')
}


// ============================================================
//  BUILD ONE CARD
// ============================================================

function buildCard(ground, index) {
  const freeCount  = ground.slots.filter(s => s.free).length
  const isAvail    = freeCount > 0
  const shown      = ground.amenities.slice(0, 4)
  const extra      = ground.amenities.length - shown.length
  const amenityHTML = shown.map(a => `<span class="tag">${a}</span>`).join('')
    + (extra > 0 ? `<span class="tag">+${extra} more</span>` : '')

  const slotHTML = ground.slots.slice(0, 8).map(s => {
    const label = s.time.replace(' AM', 'a').replace(' PM', 'p')
    return `<div class="slot-dot ${s.free ? 'free' : 'busy'}">${label}</div>`
  }).join('')

  // Note: backend sends badge_class (snake_case) not badgeClass
  const badgeHTML = ground.badge
    ? `<span class="badge ${ground.badge_class}">${ground.badge}</span>`
    : ''

  return `
    <div class="card" style="animation-delay:${index * 50}ms">
      <div class="card-visual">
        ${pitchSVG(ground)}
        <div class="card-badges">${badgeHTML}</div>
      </div>
      <div class="card-body">
        <div class="card-name">${ground.name}</div>
        <div class="card-location">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${ground.area} &nbsp;·&nbsp; ${ground.distance}
        </div>
        <div class="card-divider"></div>
        <div class="card-top-row">
          <div>
            <span class="price-amount">₹${ground.price}</span>
            <span class="price-unit">/ hr</span>
          </div>
          <div class="avail-chip ${isAvail ? 'free' : 'busy'}">
            <span class="avail-dot"></span>
            ${isAvail ? `${freeCount} free` : 'Full'}
          </div>
        </div>
        <div class="amenities">${amenityHTML}</div>
        <div class="slots-preview">${slotHTML}</div>
      </div>
      <div class="card-footer">
        <a class="btn btn-outline"
           href="${ground.map_url}"
           target="_blank"
           rel="noopener noreferrer">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Directions
        </a>
        <button class="btn btn-primary" onclick="openModal(${ground.id})">
          View &amp; Book →
        </button>
      </div>
    </div>`
}


// ============================================================
//  PITCH SVG ILLUSTRATION
// ============================================================

function pitchSVG(g) {
  const bg    = g.bg_color    || '#e8f5ee'
  const pitch = g.pitch_color || '#c5e8d2'
  return `
    <svg class="pitch-svg" viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="130" fill="${bg}"/>
      <rect x="150" y="18" width="100" height="94" rx="4" fill="${pitch}" opacity="0.7"/>
      <line x1="150" y1="38" x2="250" y2="38" stroke="white" stroke-width="1.5" opacity="0.55"/>
      <line x1="150" y1="98" x2="250" y2="98" stroke="white" stroke-width="1.5" opacity="0.55"/>
      <rect x="193" y="23" width="3" height="14" rx="1" fill="white" opacity="0.85"/>
      <rect x="199" y="23" width="3" height="14" rx="1" fill="white" opacity="0.85"/>
      <rect x="205" y="23" width="3" height="14" rx="1" fill="white" opacity="0.85"/>
      <line x1="192" y1="24" x2="209" y2="24" stroke="white" stroke-width="1.5" opacity="0.85"/>
      <rect x="193" y="93" width="3" height="14" rx="1" fill="white" opacity="0.85"/>
      <rect x="199" y="93" width="3" height="14" rx="1" fill="white" opacity="0.85"/>
      <rect x="205" y="93" width="3" height="14" rx="1" fill="white" opacity="0.85"/>
      <line x1="192" y1="107" x2="209" y2="107" stroke="white" stroke-width="1.5" opacity="0.85"/>
      <ellipse cx="200" cy="65" rx="180" ry="57" fill="none" stroke="${pitch}" stroke-width="2" opacity="0.45"/>
      <circle cx="48" cy="28" r="16" fill="${pitch}" opacity="0.3"/>
      <circle cx="352" cy="102" r="12" fill="${pitch}" opacity="0.3"/>
    </svg>`
}


// ============================================================
//  TOGGLE "AVAILABLE NOW"
// ============================================================

function toggleAvail() {
  availOnly = !availOnly
  document.getElementById('availBtn').classList.toggle('active', availOnly)
  renderCards()
  showToast(availOnly ? 'Showing only available grounds' : 'Showing all grounds')
}


// ============================================================
//  OPEN MODAL
// ============================================================

function openModal(id) {
  const g = grounds.find(x => x.id === id)
  if (!g) return

  if (!selectedSlots[g.id]) selectedSlots[g.id] = []

  const freeCount = g.slots.filter(s => s.free).length

  document.getElementById('mName').textContent = g.name
  document.getElementById('mArea').textContent =
    `${g.area}, Hyderabad  ·  ⭐ ${g.rating} (${g.reviews} reviews)  ·  ${g.distance}`

  document.getElementById('mBody').innerHTML = `

    <p style="font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:20px">
      ${g.description}
    </p>

    <!-- Pricing -->
    <div class="modal-section">
      <div class="section-label">💰 Pricing</div>
      <div class="price-cards">
        <div class="price-card"><div class="amt">₹${g.price}</div><div class="dur">1 Hour</div></div>
        <div class="price-card"><div class="amt">₹${g.price * 2}</div><div class="dur">2 Hours</div></div>
        <div class="price-card"><div class="amt">₹${g.price * 3}</div><div class="dur">3 Hours</div></div>
      </div>
    </div>

    <!-- Slot selection -->
    <div class="modal-section">
      <div class="section-label">🕐 Pick Your Slot — ${freeCount} of ${g.slots.length} available</div>
      <div class="slots-full" id="slotsGrid-${g.id}">
        ${g.slots.map(s => buildSlotCard(g.id, s)).join('')}
      </div>
      <div class="booking-summary" id="summary-${g.id}"></div>
    </div>

    <!-- Booking form -->
    <div class="modal-section">
      <div class="section-label">📋 Your Details</div>
      <div class="form-grid">

        <div class="form-group">
          <label class="form-label" for="fname-${g.id}">Full Name</label>
          <input
            class="form-input"
            id="fname-${g.id}"
            type="text"
            placeholder="e.g. Ravi Kumar"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="fphone-${g.id}">Phone Number</label>
          <input
            class="form-input"
            id="fphone-${g.id}"
            type="tel"
            placeholder="e.g. 9876543210"
            maxlength="10"
          />
        </div>

        <div class="form-group form-group-full">
          <label class="form-label" for="fdate-${g.id}">Date</label>
          <input
            class="form-input"
            id="fdate-${g.id}"
            type="date"
            min="${getTodayString()}"
          />
        </div>

      </div>
    </div>

    <!-- Amenities -->
    <div class="modal-section">
      <div class="section-label">🏟️ Amenities</div>
      <div class="amenities-full">
        ${g.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
      </div>
    </div>

    <!-- Location -->
    <div class="modal-section">
      <div class="section-label">📍 Location &amp; Directions</div>
      <a class="map-card" href="${g.map_url}" target="_blank" rel="noopener noreferrer">
        <div class="map-icon">🗺️</div>
        <div>
          <div class="map-address">${g.address}</div>
          <div class="map-cta">Open in Google Maps →</div>
        </div>
      </a>
    </div>

    <!-- Contact -->
    <div class="modal-section">
      <div class="section-label">📞 Contact</div>
      <a href="tel:${g.phone}" class="map-card" style="text-decoration:none">
        <div class="map-icon">📞</div>
        <div>
          <div class="map-address">${g.phone}</div>
          <div class="map-cta">Tap to call</div>
        </div>
      </a>
    </div>

    <!-- Book button -->
    <button
      class="btn btn-primary btn-full"
      id="bookBtn-${g.id}"
      onclick="handleBooking(${g.id})"
    >
      🏏 Confirm Booking
    </button>
  `

  document.getElementById('overlay').classList.add('open')
  document.body.style.overflow = 'hidden'
}


// ============================================================
//  BUILD ONE SLOT CARD
// ============================================================

function buildSlotCard(groundId, slot) {
  const isSelected = (selectedSlots[groundId] || []).includes(slot.time)

  if (!slot.free) {
    return `
      <div class="slot-card busy">
        ${slot.time}
        <div class="slot-status">Booked</div>
      </div>`
  }

  return `
    <div
      class="slot-card free ${isSelected ? 'selected' : ''}"
      id="slot-${groundId}-${slot.time.replace(' ', '_')}"
      onclick="toggleSlot(${groundId}, '${slot.time}')"
    >
      ${slot.time}
      <div class="slot-status">${isSelected ? 'Selected ✓' : 'Free'}</div>
    </div>`
}


// ============================================================
//  TOGGLE SLOT SELECTION
//  Rules: max 3 slots, must be consecutive
// ============================================================

function toggleSlot(groundId, time) {
  const ground   = grounds.find(g => g.id === groundId)
  if (!selectedSlots[groundId]) selectedSlots[groundId] = []

  const current  = selectedSlots[groundId]
  const allSlots = ground.slots

  function slotIndex(t) {
    return allSlots.findIndex(s => s.time === t)
  }

  const clickedIdx      = slotIndex(time)
  const alreadySelected = current.includes(time)

  if (alreadySelected) {
    const sorted = [...current].sort((a, b) => slotIndex(a) - slotIndex(b))
    const isEdge = time === sorted[0] || time === sorted[sorted.length - 1]

    if (!isEdge) {
      showToast('⚠️ Deselect from either end to keep slots consecutive')
      return
    }
    selectedSlots[groundId] = current.filter(t => t !== time)

  } else {
    if (current.length >= 3) {
      showToast('⚠️ Maximum 3 slots allowed per booking')
      return
    }

    if (current.length === 0) {
      selectedSlots[groundId] = [time]
    } else {
      const sorted   = [...current].sort((a, b) => slotIndex(a) - slotIndex(b))
      const firstIdx = slotIndex(sorted[0])
      const lastIdx  = slotIndex(sorted[sorted.length - 1])

      if (clickedIdx !== firstIdx - 1 && clickedIdx !== lastIdx + 1) {
        showToast('⚠️ Slots must be consecutive — pick the next or previous slot')
        return
      }

      selectedSlots[groundId] = [...current, time]
    }
  }

  refreshSlotGrid(groundId)
  updateBookingSummary(groundId)
}


// ============================================================
//  REFRESH SLOT GRID
// ============================================================

function refreshSlotGrid(groundId) {
  const ground = grounds.find(g => g.id === groundId)
  const grid   = document.getElementById(`slotsGrid-${groundId}`)
  if (!grid) return

  const selected = selectedSlots[groundId] || []
  const allSlots = ground.slots

  function isSelectable(slot) {
    if (!slot.free) return false
    if (selected.length === 0) return true
    if (selected.length >= 3)  return selected.includes(slot.time)

    const sorted   = [...selected].sort((a, b) =>
      allSlots.findIndex(s => s.time === a) - allSlots.findIndex(s => s.time === b)
    )
    const firstIdx = allSlots.findIndex(s => s.time === sorted[0])
    const lastIdx  = allSlots.findIndex(s => s.time === sorted[sorted.length - 1])
    const thisIdx  = allSlots.findIndex(s => s.time === slot.time)

    return (
      selected.includes(slot.time) ||
      thisIdx === firstIdx - 1 ||
      thisIdx === lastIdx  + 1
    )
  }

  grid.innerHTML = allSlots.map(slot => {
    const isSel = selected.includes(slot.time)
    const canSel = isSelectable(slot)

    if (!slot.free) {
      return `<div class="slot-card busy">${slot.time}<div class="slot-status">Booked</div></div>`
    }
    if (isSel) {
      return `
        <div class="slot-card free selected"
             id="slot-${groundId}-${slot.time.replace(' ','_')}"
             onclick="toggleSlot(${groundId}, '${slot.time}')">
          ${slot.time}<div class="slot-status">Selected ✓</div>
        </div>`
    }
    if (canSel) {
      return `
        <div class="slot-card free"
             id="slot-${groundId}-${slot.time.replace(' ','_')}"
             onclick="toggleSlot(${groundId}, '${slot.time}')">
          ${slot.time}<div class="slot-status">Free</div>
        </div>`
    }
    return `
      <div class="slot-card free dimmed" title="Select adjacent slots only">
        ${slot.time}<div class="slot-status">Free</div>
      </div>`
  }).join('')
}


// ============================================================
//  BOOKING SUMMARY
// ============================================================

function updateBookingSummary(groundId) {
  const ground   = grounds.find(g => g.id === groundId)
  const selected = selectedSlots[groundId] || []
  const summary  = document.getElementById(`summary-${groundId}`)
  const bookBtn  = document.getElementById(`bookBtn-${groundId}`)

  if (!summary) return

  if (selected.length === 0) {
    summary.classList.remove('visible')
    summary.innerHTML = ''
    if (bookBtn) bookBtn.textContent = '🏏 Confirm Booking'
    return
  }

  const allSlots  = ground.slots
  const sorted    = [...selected].sort(
    (a, b) => allSlots.findIndex(s => s.time === a) - allSlots.findIndex(s => s.time === b)
  )
  const totalCost = selected.length * ground.price
  const timeRange = selected.length > 1
    ? `${sorted[0]} → ${sorted[sorted.length - 1]}`
    : sorted[0]

  summary.classList.add('visible')
  summary.innerHTML = `
    ✅ <strong>${selected.length} hour${selected.length > 1 ? 's' : ''}</strong> selected:
    &nbsp;${timeRange}
    <br>
    <strong>Total: ₹${totalCost}</strong>
    &nbsp;(${selected.length} hr × ₹${ground.price}/hr)
  `

  if (bookBtn) bookBtn.textContent = `🏏 Book ${timeRange} — ₹${totalCost}`
}


// ============================================================
//  HANDLE BOOKING — real POST request to backend
// ============================================================

async function handleBooking(groundId) {
  const ground   = grounds.find(g => g.id === groundId)
  const selected = selectedSlots[groundId] || []

  // Validate slots
  if (selected.length === 0) {
    showToast('⚠️ Please select at least one slot first')
    return
  }

  // Validate form
  const name  = document.getElementById(`fname-${groundId}`).value.trim()
  const phone = document.getElementById(`fphone-${groundId}`).value.trim()
  const date  = document.getElementById(`fdate-${groundId}`).value

  if (!name) {
    showToast('⚠️ Please enter your name')
    document.getElementById(`fname-${groundId}`).focus()
    return
  }

  if (!phone || phone.length !== 10 || isNaN(phone)) {
    showToast('⚠️ Please enter a valid 10-digit phone number')
    document.getElementById(`fphone-${groundId}`).focus()
    return
  }

  if (!date) {
    showToast('⚠️ Please select a date')
    document.getElementById(`fdate-${groundId}`).focus()
    return
  }

  // Sort slots in order
  const allSlots  = ground.slots
  const sorted    = [...selected].sort(
    (a, b) => allSlots.findIndex(s => s.time === a) - allSlots.findIndex(s => s.time === b)
  )
  const totalCost = sorted.length * ground.price

  // Disable button while request is in flight
  const bookBtn       = document.getElementById(`bookBtn-${groundId}`)
  bookBtn.disabled    = true
  bookBtn.textContent = '⏳ Booking...'

  try {
    const res = await fetch('http://localhost:3000/api/bookings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groundId,
        groundName: ground.name,
        name,
        phone,
        date,
        slots:  sorted,
        total:  totalCost
      })
    })

    const data = await res.json()

    if (data.success) {
      showToast(`✅ Booking confirmed! ID #${data.bookingId}`)

      // Update local slot data so UI reflects immediately
      sorted.forEach(time => {
        const slot = ground.slots.find(s => s.time === time)
        if (slot) slot.free = false
      })

      selectedSlots[groundId] = []
      closeModal()
      renderCards()

    } else {
      showToast(`⚠️ ${data.error}`)
      bookBtn.disabled    = false
      bookBtn.textContent = '🏏 Try Again'
    }

  } catch (err) {
    console.error('Booking error:', err)
    showToast('⚠️ Could not connect to server')
    bookBtn.disabled    = false
    bookBtn.textContent = '🏏 Confirm Booking'
  }
}


// ============================================================
//  CLOSE MODAL
// ============================================================

function closeModal() {
  document.getElementById('overlay').classList.remove('open')
  document.body.style.overflow = ''
}

function handleOverlayClick(event) {
  if (event.target === document.getElementById('overlay')) closeModal()
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal()
})


// ============================================================
//  HELPER — today's date string for date input min attribute
// ============================================================

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}


// ============================================================
//  TOAST
// ============================================================

let toastTimer = null

function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500)
}


// ============================================================
//  START
// ============================================================

init()