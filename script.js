const syllables = {
    'ArrowLeft': { sound: 'po.mp3', element: 'po' },
    'ArrowUp': { sound: 'ta.mp3', element: 'ta' },
    'ArrowRight': { sound: 'to.mp3', element: 'to' }
};

// Create audio elements
for (const key in syllables) {
    syllables[key].audio = new Audio(syllables[key].sound);
}

// Track the sequence of played syllables
let sequence = [];

// Track active potatoes and special state
const activePotatoes = new Set();
let specialTimeout;
let lastKeyPressTime = 0;
const simultaneousThreshold = 150; // milliseconds window for "simultaneous" presses
const bumbumSound = document.getElementById('bumbum');
const requiredKeys = new Set(['ArrowLeft', 'ArrowUp', 'ArrowRight']);
const pressedKeys = new Set();

function checkForSpecialCombination(event) {
    const now = Date.now();

    // Add the key to pressed keys
    pressedKeys.add(event.key);

    // Update the last press time
    if (now - lastKeyPressTime < simultaneousThreshold) {
        // Within the simultaneous window
        if (pressedKeys.size === 3 &&
            [...pressedKeys].every(key => requiredKeys.has(key))) {

            // Hide all regular potatoes except special
            document.querySelectorAll('.potato-img:not(#potato-special)').forEach(img => {
                img.style.opacity = '0';
                img.classList.remove('visible', 'active');
            });

            // Show special potato
            const specialPotato = document.getElementById('potato-special');
            specialPotato.style.opacity = '1';
            specialPotato.classList.add('visible');

            // Play special sound
            bumbumSound.currentTime = 0;
            bumbumSound.play();

            // Set timeout to reset everything
            clearTimeout(specialTimeout);
            specialTimeout = setTimeout(() => {
                // Hide special potato
                specialPotato.classList.remove('visible');
                specialPotato.style.opacity = '0';

                // Restore other potatoes if they were visible
                document.querySelectorAll('.potato-img').forEach(img => {
                    if (img.id !== 'potato-special') {
                        img.style.opacity = '';  // Remove inline style
                    }
                });

                // Show default potato
                document.getElementById('potato-default').style.opacity = '1';

                // Clear states
                activePotatoes.clear();
                pressedKeys.clear();
            }, 2000);

            return true;
        }
    } else {
        // Too much time has passed, reset pressed keys
        pressedKeys.clear();
        pressedKeys.add(event.key);
    }

    lastKeyPressTime = now;
    return false;
}

document.addEventListener('keydown', function(event) {
    // Check for special combination first
    if (checkForSpecialCombination(event)) {
        return; // Don't process individual syllables if special combo triggered
    }

    const syllable = syllables[event.key];
    if (syllable) {
        // Play the sound
        syllable.audio.currentTime = 0;
        syllable.audio.play();

        // Fade default potato only if this is the first active potato
        const defaultPotato = document.getElementById('potato-default');
        if (activePotatoes.size === 0) {
            defaultPotato.style.opacity = '0.2';
        }

        // Add visual feedback for syllable and potato
        const element = document.getElementById(syllable.element);
        const potatoImg = document.getElementById('potato-' + syllable.element);

        // Only activate if not already active
        if (!activePotatoes.has(syllable.element)) {
            element.classList.add('active');
            potatoImg.classList.add('visible');
            activePotatoes.add(syllable.element);

            // Add to sequence
            sequence.push(syllable.element);

            // Set up removal after delay
            setTimeout(() => {
                element.classList.remove('active');
                potatoImg.classList.remove('visible');
                activePotatoes.delete(syllable.element);

                // If no more active potatoes, restore default
                if (activePotatoes.size === 0) {
                    defaultPotato.style.opacity = '1';
                }
            }, 1000);
        }
    }
});

// Reset sequence when no key has been pressed for 2 seconds
let timeoutId;
document.addEventListener('keyup', function(event) {
    // Remove the key from pressed keys
    pressedKeys.delete(event.key);

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        sequence = [];
    }, 2000);
});
