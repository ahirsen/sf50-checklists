// Scales the fixed-size cockpit layout (1270 x 860) to fit any screen,
// so it isn't clipped on an iPad or phone. Re-fits on rotate/resize.
(function () {
    const W = 1270, H = 860;
    function fit() {
        const c = document.querySelector('.container');
        if (!c) return;
        const vw = window.innerWidth, vh = window.innerHeight;
        const s = Math.min(vw / W, vh / H);
        const x = Math.max(0, (vw - W * s) / 2);
        const y = Math.max(0, (vh - H * s) / 2);
        c.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    }
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', () => setTimeout(fit, 200));
    document.addEventListener('DOMContentLoaded', fit);
    fit();
})();
