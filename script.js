document.addEventListener('DOMContentLoaded', () => {
    // Initialize Vanta Fog Background (Vibrant RGB Red/Green/Blue 3D smoke)
    try {
        VANTA.FOG({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0xff0055, // Vibrant Red
            midtoneColor: 0x10b981, // Vibrant Green
            lowlightColor: 0x0ea5e9, // Vibrant Blue
            baseColor: 0x0b0f19, // Deep Dark background
            blurFactor: 0.60,
            speed: 2.00,
            zoom: 1.00
        });
    } catch(e) { console.error("Vanta WebGL failed to load", e); }

    // GSAP Animations
    gsap.from(".hero-title", { duration: 1, y: 50, opacity: 0, ease: "power3.out", delay: 0.2 });
    gsap.from(".hero-subtitle", { duration: 1, y: 30, opacity: 0, ease: "power3.out", delay: 0.4 });
    gsap.from(".cta-button", { duration: 1, y: 30, opacity: 0, ease: "power3.out", delay: 0.6 });

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                gsap.from(entry.target, {
                    duration: 0.8,
                    y: 100,
                    opacity: 0,
                    ease: "power3.out",
                    delay: index * 0.2
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.flip-card').forEach(card => observer.observe(card));
    document.querySelectorAll('.about-card').forEach(card => observer.observe(card));

    // Modal Logic for Details Order Option
    const modal = document.getElementById('order-modal');
    const closeModal = document.querySelector('.close-modal');
    const orderForm = document.getElementById('order-form');
    let selectedProduct = '';
    let selectedPrice = '';

    document.querySelectorAll('.order-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent the card from flipping when clicking order
            
            // Attractive hiding animation
            this.style.opacity = '0';
            this.style.transform = 'scale(0.8) translateY(10px)';
            
            setTimeout(() => {
                selectedProduct = this.getAttribute('data-product');
                selectedPrice = this.getAttribute('data-price');
                
                document.getElementById('modal-product-title').innerText = 'Order: ' + selectedProduct;
                document.getElementById('modal-product-price').innerText = 'Price: ' + selectedPrice;
                
                modal.style.display = 'flex';
                
                // Restore button secretly after modal opens
                setTimeout(() => {
                    this.style.opacity = '1';
                    this.style.transform = 'none';
                }, 400);
            }, 300);
        });
    });

    closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if(e.target == modal) modal.style.display = 'none'; });

    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.querySelector('.submit-order-btn');
        const originalText = btn.innerText;
        
        // Hide text and shrink into loading spinner
        btn.classList.add('btn-loading');
        
        const orderData = {
            product: selectedProduct,
            price: selectedPrice,
            name: document.getElementById('cust-name').value,
            email: document.getElementById('cust-email').value,
            phone: document.getElementById('cust-phone').value,
            address: document.getElementById('cust-address').value
        };
        
        try {
            // Add a slight artificial delay so the user can actually see 
            // the beautiful shape-shifting spinner animation before it completes instantly!
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            
            if(response.ok) {
                btn.classList.remove('btn-loading');
                btn.classList.add('btn-success');
                btn.innerText = 'Order Placed Successfully!';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    orderForm.reset();
                    btn.classList.remove('btn-success');
                    btn.innerText = originalText;
                }, 2500);
            } else {
                btn.classList.remove('btn-loading');
                btn.innerText = 'Failed';
                btn.style.backgroundColor = '#ef4444';
            }
        } catch (error) {
            console.error('Error placing order:', error);
            btn.classList.remove('btn-loading');
            btn.innerText = 'Error';
            btn.style.backgroundColor = '#ef4444';
        }
        
        setTimeout(() => {
            if (btn.innerText === 'Failed' || btn.innerText === 'Error') {
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
            }
        }, 3000);
    });
});
