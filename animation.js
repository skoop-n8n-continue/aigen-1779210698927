const PRODUCTS_PER_CYCLE = 1; // 1 hero product at a time for maximum impact
let PRODUCTS = [];

async function loadProducts() {
    try {
        const response = await fetch('./products.json');
        const data = await response.json();
        PRODUCTS = data.products || [];
    } catch (error) {
        console.error('Failed to load products.json:', error);
        // Fallback for visual testing if no products.json is available
        PRODUCTS = [
            {
                name: "Premium Vape Kit",
                price: "$45.00",
                image_url: "https://images.unsplash.com/photo-1536836746985-64d84f2de1b3?auto=format&fit=crop&q=80&w=800&h=1000",
                meta: "Fruit Medley • 5% Nic"
            }
        ];
    }

    if (PRODUCTS.length > 0) {
        initPersistentAnimations();
        startCycle();
    }
}

function initPersistentAnimations() {
    gsap.registerPlugin(SplitText, CustomEase);

    // Ticker animation
    gsap.to("#ticker-content", {
        xPercent: -50,
        ease: "none",
        duration: 20,
        repeat: -1
    });

    // Background slow breathing
    gsap.to("#background", {
        scale: 1.05,
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });

    // Decorative elements
    gsap.to(".circle-1", {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: "none"
    });

    gsap.to(".circle-2", {
        y: -30,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });

    gsap.to(".deco-cross", {
        rotation: 180,
        scale: 1.2,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "power2.inOut"
    });

    // Headline entrance (only happens once at start)
    const splitHeadline = new SplitText("#main-headline", {type: "chars,words"});
    const splitSub = new SplitText("#sub-headline", {type: "words"});

    const introTl = gsap.timeline();

    introTl.from(".promo-badge", {
        y: 50,
        opacity: 0,
        rotation: -5,
        duration: 0.8,
        ease: "back.out(1.7)"
    })
    .from(splitHeadline.chars, {
        y: 100,
        opacity: 0,
        rotationX: -90,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(2)"
    }, "-=0.4")
    .from(splitSub.words, {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.4");
}

function getBatch(batchIndex) {
    const start = (batchIndex * PRODUCTS_PER_CYCLE) % Math.max(PRODUCTS.length, 1);
    const batch = [];
    for (let i = 0; i < PRODUCTS_PER_CYCLE; i++) {
        if (PRODUCTS.length > 0) {
            batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
        }
    }
    return batch;
}

function renderBatch(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach((product, index) => {
        const productEl = document.createElement('div');
        productEl.className = 'product';

        // Calculate a fake "original" price to show the 10% off
        const priceNum = parseFloat(product.price.replace(/[^0-9.]/g, ''));
        const originalPrice = isNaN(priceNum) ? product.price : `$${(priceNum * 1.11).toFixed(2)}`;

        productEl.innerHTML = `
            <div class="product-image-container">
                <img class="product-image" src="${product.image_url}" alt="${product.name}">
                <div class="product-shadow"></div>
            </div>
            <div class="product-info-box">
                <h2 class="product-name">${product.name}</h2>
                <div class="product-meta">${product.meta || ''}</div>
                <div class="product-price-wrapper">
                    <span class="price-original">${originalPrice}</span>
                    <span class="price-sale">${product.price}</span>
                </div>
            </div>
        `;
        container.appendChild(productEl);
    });
}

function animateCycle(batchIndex) {
    const batch = getBatch(batchIndex);
    renderBatch(batch);

    const tl = gsap.timeline({
        onComplete: () => animateCycle(batchIndex + 1)
    });

    // Phase 1: Entrance
    tl.fromTo(".product-image-container",
        { y: 600, scale: 0.5, rotation: 15, opacity: 0 },
        { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "expo.out" }
    )
    .fromTo(".product-info-box",
        { y: 100, opacity: 0, scale: 0.8, rotation: -10 },
        { y: 0, opacity: 1, scale: 1, rotation: 2, duration: 1, ease: "back.out(1.5)" },
        "-=0.8"
    )

    // Phase 2: Living Moment (Float effect)
    .to(".product-image", {
        y: -25,
        rotation: 2,
        duration: 2.5,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut"
    }, "-=0.5")
    .to(".product-shadow", {
        scale: 0.8,
        opacity: 0.3,
        duration: 2.5,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut"
    }, "<")

    // Phase 3: Exit
    .to(".product-image-container", {
        y: -600,
        scale: 0.8,
        rotation: -10,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in"
    }, "+=0.5")
    .to(".product-info-box", {
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        ease: "power2.in"
    }, "<0.2");
}

function startCycle() {
    // Add a small delay so intro typography can finish coming in
    setTimeout(() => {
        animateCycle(0);
    }, 1500);
}

window.addEventListener('DOMContentLoaded', loadProducts);