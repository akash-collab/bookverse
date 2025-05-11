const title = document.getElementById('site-title');

title.addEventListener('mouseenter', () => {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const ring = document.createElement('span');
            ring.classList.add('pulse-ring');
            title.appendChild(ring);
            setTimeout(() => ring.remove(), 1000);
        }, i * 150);
    }
});