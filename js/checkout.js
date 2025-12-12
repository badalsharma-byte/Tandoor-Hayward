document.addEventListener('DOMContentLoaded', async () => {
    // Check order type from localStorage
    const orderType = localStorage.getItem('tandoor_order_type');
    if (!orderType) {
        // Redirect to menu landing if no order type selected
        window.location.href = 'menu.php';
        return;
    }

    // Set order type in form
    document.getElementById('orderType').value = orderType;
    document.getElementById('type-label').textContent = orderType === 'pickup' ? 'Pickup' : 'Delivery';
    document.getElementById('type-icon').textContent = orderType === 'pickup' ? '🛍️' : '🚗';

    loadCart();
    loadSavedCustomerInfo();
    await loadRestaurantHours(); // Load hours and generate pickup times
    setupFormLogic();
    setupPaymentMethods();
});

// Load saved customer info from localStorage
function loadSavedCustomerInfo() {
    const savedInfo = localStorage.getItem('tandoor_customer');
    if (savedInfo) {
        try {
            const customer = JSON.parse(savedInfo);
            if (customer.name) document.getElementById('name').value = customer.name;
            if (customer.email) document.getElementById('email').value = customer.email;
            if (customer.phone) document.getElementById('phone').value = customer.phone;
        } catch (e) {
            console.warn('Could not load saved customer info');
        }
    }
}

// Save customer info to localStorage
function saveCustomerInfo() {
    const customer = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    localStorage.setItem('tandoor_customer', JSON.stringify(customer));
}

let cart = [];
let stripe, elements, cardElement;
let currentOrderId = null;
let restaurantHours = null;

// Configuration - loaded from backend or use defaults
const CONFIG = {
    stripePublishableKey: 'pk_test_51MzFQaSAvKanZHOTw7fQwTQSGYD9ShjGORLZbEiWe01iV8MBhPdxhR5VEipxwPSAhu1ttah9YtSV74g203ivlrxH00ZvOUprcH',
    paypalClientId: 'AXRmhuAul_k1oo98JKk09TlNVxWq801j3fvPVKtN5y6zxWuJSYl8jU_Jl5InBL2-B41zCk-vkG7fPDhQ',
    taxRate: 0.085,
    apiBase: 'crm/api',
    // Will be loaded from backend - set to false for "Coming Soon" mode
    orderingEnabled: false
};

// Load restaurant hours and generate pickup time slots
async function loadRestaurantHours() {
    try {
        const response = await fetch(`${CONFIG.apiBase}/get-restaurant-hours.php`);
        const data = await response.json();

        if (data.success) {
            restaurantHours = data;
            CONFIG.orderingEnabled = data.ordering.enabled;
            generatePickupTimeSlots(data);
        }
    } catch (err) {
        console.warn('Could not load restaurant hours, using defaults');
        generateDefaultPickupSlots();
    }
}

// Generate pickup time slots based on restaurant hours
function generatePickupTimeSlots(data) {
    const pickupSelect = document.getElementById('pickup-time');
    const pickupDetails = document.getElementById('pickup-details');

    // Get current time in restaurant timezone
    const now = new Date(data.current_time);
    const currentDay = now.getDay(); // 0 = Sunday
    const todayHours = data.hours[currentDay];

    // Clear existing options
    pickupSelect.innerHTML = '';

    // Check if restaurant is closed today
    if (todayHours.closed) {
        // Find next open day
        let nextOpenDay = null;
        for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (!data.hours[checkDay].closed) {
                nextOpenDay = data.hours[checkDay];
                break;
            }
        }

        pickupSelect.innerHTML = `<option value="" disabled selected>Closed today - Opens ${nextOpenDay ? nextOpenDay.day : 'soon'}</option>`;
        showClosedMessage(todayHours, nextOpenDay);
        return;
    }

    const prepTime = data.ordering.prep_time_minutes;
    const slotInterval = data.ordering.slot_interval_minutes;
    const lastOrderBuffer = data.ordering.last_order_buffer_minutes;

    // Parse opening and closing times
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);

    const openTime = new Date(now);
    openTime.setHours(openHour, openMin, 0, 0);

    const closeTime = new Date(now);
    closeTime.setHours(closeHour, closeMin, 0, 0);

    // Last order time (close time minus buffer)
    const lastOrderTime = new Date(closeTime.getTime() - lastOrderBuffer * 60000);

    // Earliest pickup time (now + prep time, rounded to next slot)
    let earliestPickup = new Date(now.getTime() + prepTime * 60000);

    // If before opening, set to opening time + prep time
    if (earliestPickup < openTime) {
        earliestPickup = new Date(openTime.getTime() + prepTime * 60000);
    }

    // Round up to next slot interval
    const minutes = earliestPickup.getMinutes();
    const roundedMinutes = Math.ceil(minutes / slotInterval) * slotInterval;
    earliestPickup.setMinutes(roundedMinutes, 0, 0);

    // Check if we're past last order time
    if (now >= lastOrderTime) {
        pickupSelect.innerHTML = `<option value="" disabled selected>Kitchen closed - Orders resume tomorrow at ${formatTime(openHour, openMin)}</option>`;
        showClosedMessage(todayHours, null, true);
        return;
    }

    // Add ASAP option
    const asapTime = new Date(now.getTime() + prepTime * 60000);
    pickupSelect.innerHTML = `<option value="asap">ASAP (approx. ${prepTime}-${prepTime + 10} mins)</option>`;

    // Generate time slots
    let slotTime = new Date(earliestPickup);
    while (slotTime <= lastOrderTime) {
        const timeStr = formatTime(slotTime.getHours(), slotTime.getMinutes());
        const value = `${String(slotTime.getHours()).padStart(2, '0')}:${String(slotTime.getMinutes()).padStart(2, '0')}`;
        pickupSelect.innerHTML += `<option value="${value}">${timeStr}</option>`;
        slotTime = new Date(slotTime.getTime() + slotInterval * 60000);
    }

    // Show current status
    updatePickupStatus(now, openTime, closeTime, prepTime);
}

// Format time to 12-hour format
function formatTime(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
}

// Show closed message
function showClosedMessage(todayHours, nextOpenDay, kitchenClosed = false) {
    const pickupDetails = document.getElementById('pickup-details');
    const infoText = pickupDetails.querySelector('.info-text');

    if (kitchenClosed) {
        infoText.innerHTML = `
            <span style="color: #dc3545;">⚠️ Kitchen is closed for today.</span><br>
            <small>Please come back tomorrow to place your order.</small>
        `;
    } else if (nextOpenDay) {
        infoText.innerHTML = `
            <span style="color: #dc3545;">⚠️ We're closed today.</span><br>
            <small>We'll be open again on ${nextOpenDay.day} at ${formatTime(...nextOpenDay.open.split(':').map(Number))}.</small>
        `;
    }
}

// Update pickup status message
function updatePickupStatus(now, openTime, closeTime, prepTime) {
    const pickupDetails = document.getElementById('pickup-details');
    const infoText = pickupDetails.querySelector('.info-text');

    if (now < openTime) {
        const opensAt = formatTime(openTime.getHours(), openTime.getMinutes());
        infoText.innerHTML = `
            <strong>Pickup at:</strong> 27167 Mission Blvd, Hayward, CA 94544<br>
            <small style="color: #F5A623;">🕐 Opens at ${opensAt} - Earliest pickup ~${prepTime} mins after opening</small>
        `;
    } else {
        infoText.innerHTML = `
            <strong>Pickup at:</strong> 27167 Mission Blvd, Hayward, CA 94544<br>
            <small style="color: #28a745;">✓ Open now - Prep time approximately ${prepTime} minutes</small>
        `;
    }
}

// Fallback default pickup slots
function generateDefaultPickupSlots() {
    const pickupSelect = document.getElementById('pickup-time');
    pickupSelect.innerHTML = `
        <option value="asap">ASAP (approx. 25-35 mins)</option>
        <option value="18:00">6:00 PM</option>
        <option value="18:30">6:30 PM</option>
        <option value="19:00">7:00 PM</option>
        <option value="19:30">7:30 PM</option>
        <option value="20:00">8:00 PM</option>
        <option value="20:30">8:30 PM</option>
    `;
}

function loadCart() {
    const storedCart = localStorage.getItem('tandoor_cart');
    if (!storedCart) {
        window.location.href = 'order.php';
        return;
    }

    cart = JSON.parse(storedCart);
    if (cart.length === 0) {
        window.location.href = 'order.php';
        return;
    }

    renderOrderSummary();
}

function getOrderTotals() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.qty;
    });
    const tax = subtotal * CONFIG.taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

function renderOrderSummary() {
    const container = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');

    container.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;

        const optionsStr = item.options && item.options.length > 0
            ? item.options.map(o => `${o.value}`).join(', ')
            : '';

        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
            <div class="s-item-info">
                <h4>${escapeHtml(item.name)}</h4>
                ${optionsStr ? `<div class="s-item-options">${escapeHtml(optionsStr)}</div>` : ''}
                <div class="s-item-qty">Qty: ${item.qty}</div>
            </div>
            <div class="s-item-price">$${itemTotal.toFixed(2)}</div>
        `;
        container.appendChild(div);
    });

    const { subtotal, tax, total } = getOrderTotals();

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function setupFormLogic() {
    // Order type is pre-selected from menu.php, no toggle needed

    // Payment Method Toggle
    const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
    const cardContainer = document.getElementById('card-element-container');
    const paypalContainer = document.getElementById('paypal-button-container');
    const submitBtn = document.getElementById('place-order-btn');

    // Function to toggle Place Order button visibility
    function updateSubmitButton(paymentMethod) {
        if (paymentMethod === 'paypal') {
            submitBtn.style.display = 'none';
        } else {
            submitBtn.style.display = 'block';
        }
    }

    paymentInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-option').forEach(l => l.classList.remove('active'));
            e.target.closest('label').classList.add('active');

            if (e.target.value === 'card') {
                cardContainer.classList.add('active');
                paypalContainer.classList.remove('active');
            } else {
                cardContainer.classList.remove('active');
                paypalContainer.classList.add('active');
            }

            updateSubmitButton(e.target.value);
        });
    });

    // Set initial state based on selected payment method
    const initialPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card';
    updateSubmitButton(initialPaymentMethod);

    // Form Submission
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if ordering is disabled
        if (!CONFIG.orderingEnabled) {
            showComingSoonToast();
            return;
        }

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        if (paymentMethod === 'card') {
            await handleStripePayment();
        }
    });
}

// Show coming soon toast message
function showComingSoonToast() {
    // Remove existing toast if any
    const existingToast = document.querySelector('.coming-soon-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'coming-soon-toast';
    toast.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a1a, #333);
            color: #fff;
            padding: 30px 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            max-width: 400px;
        ">
            <div style="font-size: 3rem; margin-bottom: 15px;">🍽️</div>
            <h3 style="margin: 0 0 10px; color: #F5A623; font-size: 1.5rem;">Coming Soon!</h3>
            <p style="margin: 0; color: #ccc; line-height: 1.6;">
                Online ordering is not available yet.<br>
                Please call us to place your order.
            </p>
            <a href="tel:+15105550123" style="
                display: inline-block;
                margin-top: 20px;
                background: #F5A623;
                color: #fff;
                padding: 12px 30px;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 600;
            ">📞 Call to Order</a>
        </div>
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        " onclick="this.parentElement.remove()"></div>
    `;
    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 5000);
}

function setupPaymentMethods() {
    // --- Stripe Setup ---
    stripe = Stripe(CONFIG.stripePublishableKey);
    elements = stripe.elements();

    const style = {
        base: {
            color: '#32325d',
            fontFamily: '"Poppins", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    };

    cardElement = elements.create('card', {
        style: style,
        hidePostalCode: true  // Hide postal code - not needed for local restaurant
    });
    cardElement.mount('#card-element');

    cardElement.on('change', function (event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // --- PayPal Setup ---
    if (window.paypal) {
        paypal.Buttons({
            createOrder: async function (data, actions) {
                // Check if ordering is disabled
                if (!CONFIG.orderingEnabled) {
                    showComingSoonToast();
                    throw new Error('Ordering is currently disabled');
                }

                // Save customer info for future orders
                saveCustomerInfo();

                // First create order in our system
                const orderData = await createOrderInSystem('paypal');
                if (!orderData.success) {
                    throw new Error('Failed to create order');
                }
                currentOrderId = orderData.order_id;

                const { total } = getOrderTotals();

                return actions.order.create({
                    purchase_units: [{
                        reference_id: orderData.order_id.toString(),
                        amount: {
                            value: total.toFixed(2)
                        }
                    }]
                });
            },
            onApprove: async function (data, actions) {
                return actions.order.capture().then(async function (details) {
                    // Verify with backend
                    try {
                        const response = await fetch(`${CONFIG.apiBase}/verify-paypal.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_id: currentOrderId,
                                paypal_order_id: data.orderID
                            })
                        });
                        const result = await response.json();

                        if (result.success) {
                            completeOrder(details.payer.name.given_name);
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (err) {
                        console.error('PayPal verification error:', err);
                        // Still complete the order since PayPal approved it
                        completeOrder(details.payer.name.given_name);
                    }
                });
            },
            onError: function (err) {
                console.error('PayPal error:', err);
                alert('PayPal payment failed. Please try again.');
            }
        }).render('#paypal-button-container');
    }
}

function getFormData() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);

    const data = {
        customer_name: formData.get('name') || '',
        customer_email: formData.get('email') || '',
        customer_phone: formData.get('phone') || '',
        order_type: formData.get('orderType') || 'pickup',
        pickup_time: formData.get('pickupTime') || '',
    };

    // Debug: log form data
    console.log('Form data collected:', data);

    return data;
}

async function createOrderInSystem(paymentMethod) {
    const customerData = getFormData();
    const { subtotal, tax, total } = getOrderTotals();

    const orderData = {
        ...customerData,
        items: cart,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        payment_method: paymentMethod
    };

    try {
        const response = await fetch(`${CONFIG.apiBase}/create-order.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return await response.json();
    } catch (err) {
        console.error('Order creation error:', err);
        return { success: false, error: err.message };
    }
}

async function handleStripePayment() {
    const submitBtn = document.getElementById('place-order-btn');
    const errorElement = document.getElementById('card-errors');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    errorElement.textContent = '';

    // Save customer info for future orders
    saveCustomerInfo();

    try {
        // Step 1: Create order in our system (only if we don't have one already)
        if (!currentOrderId) {
            const orderResult = await createOrderInSystem('card');

            if (!orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order');
            }
            currentOrderId = orderResult.order_id;
        }

        const { total } = getOrderTotals();
        const customerData = getFormData();

        // Step 2: Create PaymentIntent on backend
        const intentResponse = await fetch(`${CONFIG.apiBase}/create-payment-intent.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: currentOrderId,
                amount: total,
                customer_name: customerData.customer_name,
                customer_email: customerData.customer_email
            })
        });

        const intentResult = await intentResponse.json();

        if (!intentResult.success) {
            // If backend not ready, fall back to simulated payment
            console.warn('Payment intent failed, using fallback:', intentResult.error);
            await handleFallbackPayment();
            return;
        }

        // Step 3: Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(intentResult.clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: customerData.customer_name,
                    email: customerData.customer_email
                }
            }
        });

        if (error) {
            // Payment failed - allow retry with different card
            throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
            // Step 4: Confirm payment on backend
            const confirmResponse = await fetch(`${CONFIG.apiBase}/confirm-payment.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: currentOrderId,
                    payment_method: 'card',
                    payment_id: paymentIntent.id
                })
            });

            const confirmResult = await confirmResponse.json();
            console.log('Payment confirmed:', confirmResult);

            completeOrder();
        }
    } catch (err) {
        console.error('Payment error:', err);
        // Show error and allow retry
        errorElement.innerHTML = `
            <div style="color: #dc3545; padding: 10px; background: #f8d7da; border-radius: 5px; margin-top: 10px;">
                <strong>Payment failed:</strong> ${escapeHtml(err.message)}<br>
                <small>Please check your card details and try again, or use a different card.</small>
            </div>
        `;
        // Clear the card element for retry
        cardElement.clear();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
}

// Fallback for when backend is not configured
async function handleFallbackPayment() {
    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
        const submitBtn = document.getElementById('place-order-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    } else {
        console.log('Stripe Token (fallback):', token.id);

        // Confirm order in backend
        if (currentOrderId) {
            await fetch(`${CONFIG.apiBase}/confirm-payment.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: currentOrderId,
                    payment_method: 'card',
                    payment_id: token.id
                })
            });
        }

        completeOrder();
    }
}

function completeOrder(customerName = '') {
    // Get order details before clearing
    const orderType = localStorage.getItem('tandoor_order_type') || 'pickup';
    const { subtotal, tax, total } = getOrderTotals();
    const orderItems = [...cart]; // Copy cart before clearing

    // Clear cart and order type
    localStorage.removeItem('tandoor_cart');
    localStorage.removeItem('tandoor_order_type');

    const greeting = customerName ? customerName : 'Guest';
    const pickupTime = document.getElementById('pickup-time')?.value || 'ASAP';
    const pickupTimeDisplay = pickupTime === 'asap' ? 'ASAP (25-35 mins)' : pickupTime;

    // Generate items HTML
    let itemsHtml = '';
    orderItems.forEach(item => {
        const itemTotal = item.price * item.qty;
        const optionsStr = item.options && item.options.length > 0
            ? `<div style="font-size: 0.85rem; color: #888;">${item.options.map(o => o.value).join(', ')}</div>`
            : '';
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div>
                    <div style="font-weight: 500;">${escapeHtml(item.name)} x${item.qty}</div>
                    ${optionsStr}
                </div>
                <div style="font-weight: 500;">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });

    // Show receipt
    document.querySelector('.checkout-container').innerHTML = `
        <div style="grid-column: 1 / -1; max-width: 500px; margin: 0 auto; padding: 120px 20px 40px;">
            <!-- Receipt Card -->
            <div style="background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Receipt Header -->
                <div style="background: linear-gradient(135deg, #1a1a1a, #333); padding: 30px; text-align: center;">
                    <img src="./assets/images/logo (2).png" alt="Tandoor" style="height: 60px; margin-bottom: 15px;">
                    <div style="color: #F5A623; font-size: 0.85rem; letter-spacing: 2px; text-transform: uppercase;">Order Confirmation</div>
                </div>

                <!-- Order Status -->
                <div style="background: #F5A623; color: #fff; padding: 15px; text-align: center;">
                    <div style="font-size: 1.5rem; margin-bottom: 5px;">✓</div>
                    <div style="font-weight: 600; font-size: 1.1rem;">Order Placed Successfully!</div>
                </div>

                <!-- Receipt Body -->
                <div style="padding: 25px;">
                    <!-- Order Info -->
                    <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px dashed #eee;">
                        ${currentOrderId ? `<div style="font-size: 0.9rem; color: #888;">Order #${currentOrderId}</div>` : ''}
                        <div style="font-size: 1.2rem; font-weight: 600; color: #1a1a1a; margin-top: 5px;">Thank you, ${escapeHtml(greeting)}!</div>
                    </div>

                    <!-- Pickup Info -->
                    <div style="background: #f9f8f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.2rem;">${orderType === 'pickup' ? '🛍️' : '🚗'}</span>
                            <span style="font-weight: 600; text-transform: capitalize;">${orderType}</span>
                        </div>
                        <div style="font-size: 0.9rem; color: #666;">
                            <div style="margin-bottom: 5px;">⏱️ ${pickupTimeDisplay}</div>
                            <div>📍 27167 Mission Blvd, Hayward, CA 94544</div>
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: 600; margin-bottom: 10px; color: #1a1a1a;">Order Details</div>
                        ${itemsHtml}
                    </div>

                    <!-- Totals -->
                    <div style="border-top: 2px solid #eee; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #666;">
                            <span>Subtotal</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #666;">
                            <span>Tax (8.5%)</span>
                            <span>$${tax.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; color: #1a1a1a; padding-top: 10px; border-top: 1px solid #eee;">
                            <span>Total</span>
                            <span style="color: #F5A623;">$${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Receipt Footer -->
                <div style="background: #f9f8f6; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 5px;">Tandoor Indian Restaurant</div>
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 3px;">27167 Mission Blvd, Hayward, CA 94544</div>
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 10px;">(510) 555-0123</div>
                    <div style="font-size: 0.8rem; color: #888;">A confirmation email has been sent to your inbox.</div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin-top: 25px;">
                <a href="index.php" style="display: inline-block; background: #F5A623; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; transition: all 0.3s;">Return Home</a>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
