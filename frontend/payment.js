const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://cricbox-backend-kvv3.onrender.com';

const pending = JSON.parse(localStorage.getItem('pendingBooking'));
const user = JSON.parse(localStorage.getItem('cricbox_user'));

// Redirect if data is missing
if (!pending || !user) {
    window.location.href = 'index.html';
}

// Initial UI setup
document.getElementById('btnAmount').textContent = pending.total;

document.getElementById('ticketContent').innerHTML = `
    <div class="ticket-row">
        <span class="label">Ground</span>
        <span class="value">${pending.groundName}</span>
    </div>
    <div class="ticket-row">
        <span class="label">Date</span>
        <span class="value">${pending.date}</span>
    </div>
    <div class="ticket-row">
        <span class="label">Slots</span>
        <span class="value">${pending.slots.join(', ')}</span>
    </div>
    <div class="ticket-row">
        <span class="label">Booked by</span>
        <span class="value">${user.name}</span>
    </div>
    <div class="total-section">
        <span style="font-weight:700; color:var(--text-dark)">Total Payable</span>
        <span class="total-price">₹${pending.total}</span>
    </div>
`;

// Handle Payment Method Selection UI
const cards = document.querySelectorAll('.method-card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
});

async function processPayment() {
    const btn = document.getElementById('finalPayBtn');
    const method = document.querySelector('input[name="payMethod"]:checked').value;
    
    btn.disabled = true;
    btn.innerHTML = '⚙️ Verifying...';

    try {
        const res = await fetch(`${API_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...pending,
                paymentMethod: method
            })
        });

        const data = await res.json();

        if (data.success) {
            btn.style.background = '#28a745';
            btn.innerHTML = '✅ Confirmed!';
            
            // Show a nice success alert
            setTimeout(() => {
                alert(`Booking Successful! \nYour ID is #${data.bookingId}`);
                localStorage.removeItem('pendingBooking');
                window.location.href = 'index.html';
            }, 1000);
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        alert('Payment Failed: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = `Confirm & Pay ₹${pending.total}`;
    }
}