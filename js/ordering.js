document.addEventListener('DOMContentLoaded', () => {
    // Create Modal HTML dynamically if it doesn't exist
    if (!document.querySelector('.modal-overlay')) {
        const modalHTML = `
        <div class="modal-overlay" id="orderModal">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2 class="modal-title">Order Online</h2>
                <div class="modal-options">
                    <a href="https://order.tandoorhayward.com/pickup" class="modal-btn" target="_blank">Pickup</a>
                    <a href="https://order.tandoorhayward.com/delivery" class="modal-btn" target="_blank">Delivery</a>
                    <!-- Fallback generic link if specific ones aren't ready -->
                    <!-- <a href="order.html" class="modal-btn">View Menu</a> -->
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('orderModal');
    const closeBtn = modal.querySelector('.modal-close');
    const orderButtons = document.querySelectorAll('a[href="#order"], .order-online-btn, .footer-cta[href="order.html"], .nav-right a[href="order.html"]');
    // Trying to catch various buttons. Note: some links go to order.html directly. 
    // We might want to intercept those or just let them go to the page. 
    // For now, let's target specific "#order" links or add a specific class.

    function openModal(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Attach to triggers
    // We specifically target links with href="#order" OR class "order-trigger"
    const triggers = document.querySelectorAll('a[href="#order"], .order-trigger, .order-online-btn, .footer-cta[href="order.html"], .nav-right a[href="order.html"]');

    triggers.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    // Close events
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
