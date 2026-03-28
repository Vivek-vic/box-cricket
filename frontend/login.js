// ============================================================
//  LOGIN PAGE — login.js
//  Handles:
//  1. GPS auto-detection
//  2. Manual area fallback
//  3. Form validation
//  4. POST to /api/users
//  5. Save user to localStorage → redirect to index.html
// ============================================================

const API_URL = 'http://localhost:3000'

// Stores GPS coordinates if detected
let detectedLat  = null
let detectedLng  = null
let locationReady = false   // true when GPS succeeded


// ============================================================
//  GPS DETECTION
//  Called when user clicks "Detect My Location"
// ============================================================

function detectLocation() {
  const btn      = document.getElementById('gpsBtn')
  const btnText  = document.getElementById('gpsBtnText')
  const btnIcon  = document.getElementById('gpsBtnIcon')
  const status   = document.getElementById('gpsStatus')
  const manualWrap = document.getElementById('manualWrap')

  // Check if browser supports geolocation
  if (!navigator.geolocation) {
    setGPSStatus('error', '❌ Your browser does not support GPS. Enter area manually below.')
    btn.classList.add('failed')
    manualWrap.style.display = 'block'
    return
  }

  // Update button to "detecting" state
  btn.classList.remove('success', 'failed')
  btn.classList.add('detecting')
  btnIcon.textContent = '⏳'
  btnText.textContent = 'Detecting location...'
  btn.disabled = true
  setGPSStatus('', 'Requesting location from your device...')

  // Ask browser for GPS coordinates
  navigator.geolocation.getCurrentPosition(
    // ── SUCCESS ──
    function(position) {
      detectedLat   = position.coords.latitude
      detectedLng   = position.coords.longitude
      locationReady = true

      btn.classList.remove('detecting')
      btn.classList.add('success')
      btnIcon.textContent = '✅'
      btnText.textContent = 'Location Detected!'
      btn.disabled = false

      setGPSStatus('success',
        `📍 Got your location (${detectedLat.toFixed(4)}, ${detectedLng.toFixed(4)})`
      )

      // Hide manual input since GPS worked
      manualWrap.style.display = 'none'
    },

    // ── ERROR / DENIED ──
    function(error) {
      btn.classList.remove('detecting')
      btn.classList.add('failed')
      btnIcon.textContent = '❌'
      btnText.textContent = 'Location Denied — Enter Manually'
      btn.disabled = false

      let message = ''
      if (error.code === error.PERMISSION_DENIED) {
        message = 'Location access denied. Please enter your area below.'
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'Location unavailable. Please enter your area below.'
      } else {
        message = 'Could not detect location. Please enter your area below.'
      }

      setGPSStatus('error', message)

      // Show manual input as fallback
      manualWrap.style.display = 'block'
      document.getElementById('inp-area').focus()
    },

    // Options
    {
      enableHighAccuracy: true,
      timeout: 10000,        // give up after 10 seconds
      maximumAge: 60000      // accept cached position up to 1 min old
    }
  )
}


// ============================================================
//  GPS STATUS HELPER
// ============================================================

function setGPSStatus(type, message) {
  const status = document.getElementById('gpsStatus')
  status.textContent = message
  status.className   = 'gps-status ' + type
}


// ============================================================
//  FORM VALIDATION
//  Returns true if all fields are valid, false if not
// ============================================================

function validateForm() {
  let valid = true

  const name  = document.getElementById('inp-name').value.trim()
  const age   = document.getElementById('inp-age').value.trim()
  const phone = document.getElementById('inp-phone').value.trim()
  const area  = document.getElementById('inp-area').value.trim()

  // Clear previous errors
  clearErrors()

  // Name
  if (!name) {
    showError('name', 'Please enter your name')
    valid = false
  }

  // Age
  if (!age) {
    showError('age', 'Please enter your age')
    valid = false
  } else if (isNaN(age) || age < 5 || age > 100) {
    showError('age', 'Please enter a valid age (5–100)')
    valid = false
  }

  // Phone
  if (!phone) {
    showError('phone', 'Please enter your phone number')
    valid = false
  } else if (phone.length !== 10 || isNaN(phone)) {
    showError('phone', 'Phone must be exactly 10 digits')
    valid = false
  }

  // Location — either GPS or manual area must be provided
  if (!locationReady && !area) {
    setGPSStatus('error',
      'Please detect your location or enter your area manually'
    )
    valid = false
  }

  return valid
}

function showError(fieldId, message) {
  document.getElementById(`inp-${fieldId}`).classList.add('error')
  document.getElementById(`err-${fieldId}`).textContent = message
}

function clearErrors() {
  ;['name', 'age', 'phone'].forEach(id => {
    document.getElementById(`inp-${id}`).classList.remove('error')
    document.getElementById(`err-${id}`).textContent = ''
  })
}


// ============================================================
//  HANDLE SUBMIT
//  Validates → sends to backend → saves to localStorage → redirects
// ============================================================

async function handleSubmit() {
  if (!validateForm()) return

  const name  = document.getElementById('inp-name').value.trim()
  const age   = document.getElementById('inp-age').value.trim()
  const phone = document.getElementById('inp-phone').value.trim()
  const area  = document.getElementById('inp-area').value.trim()

  const submitBtn = document.getElementById('submitBtn')
  submitBtn.disabled    = true
  submitBtn.textContent = '⏳ Saving...'

  try {
    const res = await fetch(`${API_URL}/api/users`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        age:       parseInt(age),
        phone,
        latitude:  detectedLat  || null,
        longitude: detectedLng  || null,
        area:      locationReady ? null : area   // only save manual area if GPS not used
      })
    })

    const data = await res.json()

    if (data.success) {
      // Save user details to localStorage so index.html can read them
      localStorage.setItem('cricbox_user', JSON.stringify(data.user))

      // Brief success message then redirect
      submitBtn.textContent = data.isNewUser
        ? `✅ Welcome, ${data.user.name}! Redirecting...`
        : `✅ Welcome back, ${data.user.name}! Redirecting...`

      setTimeout(() => {
        window.location.href = 'index.html'
      }, 1000)

    } else {
      submitBtn.disabled    = false
      submitBtn.textContent = 'Find Grounds Near Me →'
      setGPSStatus('error', `⚠️ ${data.error}`)
    }

  } catch (err) {
    console.error('Submit error:', err)
    submitBtn.disabled    = false
    submitBtn.textContent = 'Find Grounds Near Me →'
    setGPSStatus('error', '⚠️ Cannot connect to server. Is it running?')
  }
}


// ============================================================
//  ON PAGE LOAD
//  If user is already logged in (localStorage has data)
//  → skip login, go straight to index.html
// ============================================================

;(function checkAlreadyLoggedIn() {
  const stored = localStorage.getItem('cricbox_user')
  if (!stored) return

  try {
    const user = JSON.parse(stored)
    if (user && user.phone) {
      // Verify the user still exists in the backend
      fetch(`${API_URL}/api/users/${user.phone}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            // Still valid — skip login
            window.location.href = 'index.html'
          } else {
            // User not found in DB — clear localStorage and stay on login
            localStorage.removeItem('cricbox_user')
          }
        })
        .catch(() => {
          // Server unreachable — stay on login page
        })
    }
  } catch {
    localStorage.removeItem('cricbox_user')
  }
})()


// ============================================================
//  SHOW MANUAL LOCATION INPUT ON LOAD
//  (hidden by default, shown if GPS fails)
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  // Start with manual input hidden
  document.getElementById('manualWrap').style.display = 'none'
})