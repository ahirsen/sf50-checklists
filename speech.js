// Read-aloud for the SF50 checklist app.
// Tap the speaker button to turn voice on. While on, it announces the checklist
// title, then each highlighted step (item and action), including any notes,
// cautions or warnings that come before it. Tap Select / check a box to advance.
// Uses the browser's built-in speech voice, so it works offline.
(function () {
    const synth = window.speechSynthesis;
    const button = document.getElementById('speak-button');
    if (!synth || !button) {
        if (button) button.style.display = 'none';
        return;
    }

    let enabled = false;
    let lastSpokenStep = null;
    let lastTitle = '';
    let voice = null;
    let loading = false;

    function pickVoice() {
        const voices = synth.getVoices();
        voice =
            voices.find(v => v.lang === 'en-US' && /Samantha|Alex|Ava|Allison/i.test(v.name)) ||
            voices.find(v => v.lang === 'en-US' && v.localService) ||
            voices.find(v => v.lang && v.lang.startsWith('en')) ||
            null;
    }
    pickVoice();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = pickVoice;

    // Short words the voice should say as words, not letters.
    const SAY_AS_WORD = new Set(['ON', 'OFF', 'SET', 'AND', 'ALL', 'FOR', 'THE', 'TO', 'AS', 'OR', 'IF', 'IN', 'AT', 'UP', 'OUT', 'USE', 'NO', 'ONE', 'TWO', 'MAX', 'MIN', 'IDLE', 'ARM']);

    function clean(text) {
        if (!text) return '';
        return text
            .replace(/\bA\/R\b/g, 'as required')
            .replace(/\bAR\b/g, 'as required')
            .replace(/(\d)\s*%/g, '$1 percent')
            .replace(/%/g, ' percent ')
            .replace(/\bVDC\b/g, 'volts D C')
            .replace(/(\d)\s*A\b/g, '$1 amps')
            .replace(/\bKIAS\b/g, 'knots')
            .replace(/\bft\b/gi, 'feet')
            .replace(/→|->/g, ' then ')
            .replace(/\s*\n\s*/g, '. ')
            // All-caps words of 4+ letters read better lowercased; short ones are mostly acronyms.
            .replace(/\b[A-Z][A-Z]+\b/g, w => (w.length >= 4 || SAY_AS_WORD.has(w)) ? w.toLowerCase() : w)
            .replace(/\s+/g, ' ')
            .trim();
    }

    function say(text, opts) {
        const t = clean(text);
        if (!t) return;
        const u = new SpeechSynthesisUtterance(t);
        if (voice) u.voice = voice;
        u.lang = (voice && voice.lang) || 'en-US';
        u.rate = 1.0;
        if (opts && opts.interrupt) synth.cancel();
        synth.speak(u);
    }

    function stepText(stepEl) {
        const label = stepEl.querySelector('.step-label');
        const action = stepEl.querySelector('.action-text');
        const l = label ? label.innerText.trim() : '';
        const a = action ? action.innerText.trim() : '';
        // Drop leading list numbers like "1." but keep sub-step letters' meaning.
        const l2 = l.replace(/^\d+\.\s*/, '');
        return a ? `${l2}. ${a}` : l2;
    }

    // Notes, cautions and warnings sitting between the previous step and this one.
    function precedingNotes(stepEl) {
        const parts = [];
        let el = stepEl.previousElementSibling;
        while (el && !el.classList.contains('step-item')) {
            if (el.classList.contains('warning-text') || el.classList.contains('special-text')) {
                parts.unshift(el.innerText.trim());
            }
            el = el.previousElementSibling;
        }
        return parts;
    }

    function speakStep(stepEl, interrupt) {
        if (!enabled || !stepEl || stepEl === lastSpokenStep) return;
        lastSpokenStep = stepEl;
        if (interrupt) synth.cancel();
        precedingNotes(stepEl).forEach(n => say(n));
        say(stepText(stepEl));
    }

    function speakChecklistStart() {
        const title = document.getElementById('checklist-title');
        const desc = document.getElementById('checklist-description');
        synth.cancel();
        loading = false;
        lastSpokenStep = null;
        if (title) say(title.innerText);
        if (desc && desc.innerText.trim()) say(desc.innerText);
        const current = document.querySelector('#checklist-steps .step-item.selected-item');
        if (current) speakStep(current, false);
    }

    function speakEnd() {
        const steps = document.getElementById('checklist-steps');
        const done = steps && steps.querySelector('.procedure-complete');
        say(done ? done.innerText : 'Checklist complete');
    }

    // React to the app's own highlighting.
    const stepsList = document.getElementById('checklist-steps');
    const titleEl = document.getElementById('checklist-title');
    const nextBtn = document.getElementById('go-next-checklist');

    if (titleEl) {
        new MutationObserver(() => {
            const t = titleEl.innerText;
            if (!enabled || t === lastTitle) return;
            lastTitle = t;
            loading = true;
            // Let the app finish building the list before reading it.
            setTimeout(speakChecklistStart, 50);
        }).observe(titleEl, { childList: true, characterData: true, subtree: true });
    }

    if (stepsList) {
        new MutationObserver(muts => {
            if (!enabled) return;
            // A new checklist is loading; the title handler will read it in order.
            if (loading || (titleEl && titleEl.innerText !== lastTitle)) return;
            for (const m of muts) {
                const el = m.target;
                if (m.type === 'attributes' && el.classList && el.classList.contains('step-item') &&
                    el.classList.contains('selected-item')) {
                    speakStep(el, true);
                }
            }
        }).observe(stepsList, { attributes: true, attributeFilter: ['class'], subtree: true });
    }

    if (nextBtn) {
        new MutationObserver(() => {
            if (enabled && nextBtn.classList.contains('selected-item')) {
                lastSpokenStep = nextBtn;
                speakEnd();
            }
        }).observe(nextBtn, { attributes: true, attributeFilter: ['class'] });
    }

    function setEnabled(on) {
        enabled = on;
        button.classList.toggle('on', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
        button.innerHTML = on ? '&#128266;' : '&#128264;';
        if (on) {
            lastTitle = titleEl ? titleEl.innerText : '';
            // iOS needs the first utterance to come straight from the tap.
            speakChecklistStart();
        } else {
            synth.cancel();
            lastSpokenStep = null;
        }
    }

    button.addEventListener('click', e => {
        e.stopPropagation();
        setEnabled(!enabled);
    });
})();
