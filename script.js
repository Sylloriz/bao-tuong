/* Simple accessible slideshow
   - Automatic cycling (5s)
   - Manual prev/next buttons
   - Click indicators to jump
   - Pause on hover & focus
   - Keyboard support (Left/Right)
*/
document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.slide'));
    const indicators = Array.from(carousel.querySelectorAll('.indicator'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    let current = slides.findIndex(s => s.classList.contains('active'));
    if (current === -1) current = 0;
    const intervalMs = 5000;
    let timer = null;

    function setActive(index) {
        index = (index + slides.length) % slides.length;
        slides.forEach((s, i) => {
            const active = i === index;
            s.classList.toggle('active', active);
            s.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        indicators.forEach((ind, i) => {
            const sel = i === index;
            ind.classList.toggle('active', sel);
            ind.setAttribute('aria-selected', sel ? 'true' : 'false');
            ind.setAttribute('tabindex', sel ? '0' : '-1');
        });
        current = index;
    }

    function next() { setActive(current + 1); }
    function prev() { setActive(current - 1); }

    function startAuto() {
        stopAuto();
        timer = setInterval(next, intervalMs);
        carousel.dataset.playing = 'true';
    }

    function stopAuto() {
        if (timer) { clearInterval(timer); timer = null; }
        carousel.dataset.playing = 'false';
    }

    // Attach events safely
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); stopAuto(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); stopAuto(); startAuto(); });

    indicators.forEach(function (btn, i) {
        btn.addEventListener('click', function () { setActive(i); stopAuto(); startAuto(); });
        btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i); stopAuto(); startAuto(); }
        });
    });

    // Pause on hover/focus
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { prev(); stopAuto(); startAuto(); }
        if (e.key === 'ArrowRight') { next(); stopAuto(); startAuto(); }
    });

    // Initialize
    slides.forEach((s, i) => s.setAttribute('role', 'group'));
    indicators.forEach((ind, i) => ind.setAttribute('role', 'tab'));
    setActive(current);
    startAuto();
    // ================= AUDIO: try autoplay, fallback to user prompt if blocked =================
    const audio = document.getElementById('bg-audio');
    const audioControl = document.getElementById('audio-control');
    if (audio) {
        // sensible default volume
        try { audio.volume = 0.6; } catch (e) {}

        function updateControlUI(isPlaying) {
            if (!audioControl) return;
            audioControl.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
            audioControl.textContent = isPlaying ? '🔊' : '🔈';
            // keep control visible so user can toggle if they want
            audioControl.classList.add('show');
        }

        function tryPlayAudio() {
            // return a promise-like boolean
            const p = audio.play();
            if (p !== undefined && typeof p.then === 'function') {
                p.then(() => {
                    // playing
                    updateControlUI(true);
                }).catch((err) => {
                    // autoplay blocked; show the button so user can enable
                    if (audioControl) audioControl.classList.add('show');
                });
            }
        }

        // try to autoplay immediately
        tryPlayAudio();

        // If autoplay is blocked, many browsers allow play after a user gesture — listen once
        const onFirstGesture = function () {
            tryPlayAudio();
            window.removeEventListener('click', onFirstGesture);
            window.removeEventListener('keydown', onFirstGesture);
            window.removeEventListener('scroll', onFirstGesture);
        };
        window.addEventListener('click', onFirstGesture, { once: true });
        window.addEventListener('keydown', onFirstGesture, { once: true });
        window.addEventListener('scroll', onFirstGesture, { once: true });

        // audio control button behavior
        if (audioControl) {
            audioControl.addEventListener('click', function () {
                if (audio.paused) {
                    audio.play().then(() => updateControlUI(true)).catch(() => {
                        // still blocked — keep the button visible
                        audioControl.classList.add('show');
                    });
                } else {
                    audio.pause();
                    updateControlUI(false);
                }
            });
            // update UI if audio ends or plays
            audio.addEventListener('play', () => updateControlUI(true));
            audio.addEventListener('pause', () => updateControlUI(false));
        }
    }
        /* ================= PETAL EFFECTS: burst+fall with toggle and text mode ================= */
        // Skip entirely if user prefers reduced motion
        if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            // Controls
            const effectsToggleBtn = document.getElementById('effects-toggle');

            // Load preference from localStorage
            let effectsEnabled = localStorage.getItem('effectsEnabled');
            if (effectsEnabled === null) effectsEnabled = 'true';
            effectsEnabled = effectsEnabled === 'true';

            let continuousIntervalId = null;

            function updateControlsUI() {
                if (effectsToggleBtn) {
                    effectsToggleBtn.setAttribute('aria-pressed', effectsEnabled ? 'true' : 'false');
                    effectsToggleBtn.textContent = effectsEnabled ? 'Hiệu ứng: On' : 'Hiệu ứng: Off';
                }
            }

            function removeAllEffects() {
                document.querySelectorAll('.petal, .floating-text').forEach(el => el.remove());
            }

            function createEffectElement(x = null, y = null, burst = false) {
                // If effects are disabled do nothing
                if (!effectsEnabled) return;

                // Decide whether to create a floating text along with petals (approx 25% chance)
                const createText = Math.random() < 0.25;
                if (createText) {
                    const el = document.createElement('div');
                    el.classList.add('floating-text');
                    // size variations
                    const sizeClass = Math.random() < 0.33 ? 'small' : (Math.random() > 0.85 ? 'large' : '');
                    if (sizeClass) el.classList.add(sizeClass);
                    el.style.color = '#000';
                    el.textContent = '12C10';

                    if (burst) {
                        el.style.left = x + 'px';
                        el.style.top = y + 'px';
                        const randomX = (Math.random() - 0.5) * 600 + 'px';
                        const randomY = (Math.random() - 0.5) * 600 + 'px';
                        el.style.setProperty('--x', randomX);
                        el.style.setProperty('--y', randomY);
                        el.style.animation = 'burst 1.5s ease-out forwards';
                        document.body.appendChild(el);
                        setTimeout(() => el.remove(), 1500);
                    } else {
                        el.style.left = Math.random() * window.innerWidth + 'px';
                        const duration = 5 + Math.random() * 5;
                        el.style.animationDuration = duration + 's';
                        el.style.animationName = 'fall';
                        document.body.appendChild(el);
                        setTimeout(() => el.remove(), (duration + 2) * 1000);
                    }
                    // continue to create a petal as well below
                }

                // Default: petal (CSS shape)
                const petal = document.createElement('div');
                petal.classList.add('petal');

                if (burst) {
                    petal.style.left = x + 'px';
                    petal.style.top = y + 'px';
                    const randomX = (Math.random() - 0.5) * 600 + 'px';
                    const randomY = (Math.random() - 0.5) * 600 + 'px';
                    petal.style.setProperty('--x', randomX);
                    petal.style.setProperty('--y', randomY);
                    petal.style.animation = 'burst 1.5s ease-out forwards';
                    document.body.appendChild(petal);
                    setTimeout(() => petal.remove(), 1500);
                } else {
                    petal.style.left = Math.random() * window.innerWidth + 'px';
                    const duration = 5 + Math.random() * 5;
                    petal.style.animationDuration = duration + 's';
                    petal.style.animationName = 'fall';
                    document.body.appendChild(petal);
                    setTimeout(() => petal.remove(), (duration + 2) * 1000);
                }
            }

            function initialBurst() {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 3;
                const count = 24; // reduced ~40% from 40
                for (let i = 0; i < count; i++) {
                    if (!effectsEnabled) break;
                    createEffectElement(centerX, centerY, true);
                }
            }

            function startContinuous() {
                if (continuousIntervalId) return;
                continuousIntervalId = setInterval(() => {
                    if (!effectsEnabled) return;
                    createEffectElement();
                }, 500); // slower spawn (was 300ms) to reduce overall amount by ~40%
            }

            function stopContinuous() {
                if (continuousIntervalId) { clearInterval(continuousIntervalId); continuousIntervalId = null; }
            }

            // wire up control buttons
            if (effectsToggleBtn) {
                effectsToggleBtn.addEventListener('click', () => {
                    effectsEnabled = !effectsEnabled;
                    localStorage.setItem('effectsEnabled', effectsEnabled ? 'true' : 'false');
                    updateControlsUI();
                    if (effectsEnabled) {
                        initialBurst();
                        setTimeout(startContinuous, 1500);
                    } else {
                        stopContinuous();
                        removeAllEffects();
                    }
                });
            }

            // Visibility handling: stop continuous when hidden, resume when visible
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    stopContinuous();
                } else {
                    if (effectsEnabled) startContinuous();
                }
            });

            // Initialize controls and start effects if enabled
            updateControlsUI();
            if (effectsEnabled) {
                try {
                    initialBurst();
                    setTimeout(startContinuous, 1500);
                } catch (err) {
                    console.error('Effect init error', err);
                }
            }
            // ================= ENVELOPE / TRIBUTE LETTER TOGGLE =================
            const envelopeBtn = document.getElementById('envelope-btn');
            const tributeLetter = document.getElementById('tribute-letter');
            const closeLetterBtn = document.getElementById('close-letter');

            function openLetter() {
                if (!tributeLetter) return;
                tributeLetter.classList.remove('closed');
                tributeLetter.classList.add('open');
                tributeLetter.setAttribute('aria-hidden', 'false');
                if (envelopeBtn) { envelopeBtn.classList.add('opened'); envelopeBtn.setAttribute('aria-expanded', 'true'); }
                // scroll into view for smaller screens
                tributeLetter.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // show stamp with a short delay and animation
                const stamp = tributeLetter.querySelector('.stamp');
                if (stamp) {
                    stamp.classList.remove('visible');
                    // small delay so flap animation feels natural
                    setTimeout(() => stamp.classList.add('visible'), 300);
                }
            }

            function closeLetter() {
                if (!tributeLetter) return;
                tributeLetter.classList.remove('open');
                tributeLetter.classList.add('closed');
                tributeLetter.setAttribute('aria-hidden', 'true');
                if (envelopeBtn) { envelopeBtn.classList.remove('opened'); envelopeBtn.setAttribute('aria-expanded', 'false'); }
                const stamp = tributeLetter.querySelector('.stamp');
                if (stamp) stamp.classList.remove('visible');
            }

            if (envelopeBtn) {
                envelopeBtn.addEventListener('click', function () {
                    const isOpen = tributeLetter && tributeLetter.classList.contains('open');
                    if (isOpen) closeLetter(); else openLetter();
                });
            }

            if (closeLetterBtn) {
                closeLetterBtn.addEventListener('click', function () { closeLetter(); });
            }

            // Close with Escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeLetter();
            });
        }
});
