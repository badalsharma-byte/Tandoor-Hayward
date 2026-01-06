document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cateringForm');
    const submitBtn = form.querySelector('.submit-btn');
    const formMessage = form.querySelector('.form-message');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        formMessage.textContent = '';
        formMessage.className = 'form-message';

        const formData = new FormData(form);
        const data = {
            type: 'catering', // Identifier for backend
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            date: formData.get('date'),
            guests: formData.get('guests'),
            eventType: formData.get('eventType'),
            message: formData.get('message')
        };

        try {
            // Using the same endpoint as contact form, assuming it handles generic emails or we just send JSON
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // Adjust handling if API returns text/html instead of JSON
            const result = await response.json();

            if (result.success || response.ok) {
                formMessage.textContent = 'Thank you! Your catering inquiry has been sent.';
                formMessage.classList.add('success');
                form.reset();
            } else {
                formMessage.textContent = result.message || 'Something went wrong. Please try again.';
                formMessage.classList.add('error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            formMessage.textContent = 'Unable to submit form. Please try again later.';
            formMessage.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Inquiry';
        }
    });
});
