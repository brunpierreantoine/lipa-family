"use client";

/**
 * Creates a confetti explosion on the screen.
 * Dependency-free: uses CSS and DOM elements.
 */
export function triggerConfetti() {
    const count = 60;
    const defaults = {
        origin: { y: 0.7 },
    };

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement("div");
        const color = colors[Math.floor(Math.random() * colors.length)];

        confetti.style.position = "absolute";
        confetti.style.width = "10px";
        confetti.style.height = "10px";
        confetti.style.backgroundColor = color;
        confetti.style.left = "50%";
        confetti.style.bottom = "30%";
        confetti.style.opacity = "1";
        confetti.style.borderRadius = "2px";

        container.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 10 + Math.random() * 20;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 15; // Initial upward burst

        let posX = 0;
        let posY = 0;
        let vx = dx;
        let vy = dy;
        let rotation = Math.random() * 360;
        const rotV = (Math.random() - 0.5) * 20;

        const gravity = 0.5;
        const friction = 0.98;

        const startTime = Date.now();
        const duration = 3000;

        function update() {
            const now = Date.now();
            const elapsed = now - startTime;

            if (elapsed > duration) {
                confetti.remove();
                if (container.children.length === 0) container.remove();
                return;
            }

            vx *= friction;
            vy += gravity;
            posX += vx;
            posY += vy;
            rotation += rotV;

            confetti.style.transform = `translate(${posX}px, ${posY}px) rotate(${rotation}deg)`;
            const opacity = 1 - (elapsed / duration);
            confetti.style.opacity = opacity.toString();

            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }
}
