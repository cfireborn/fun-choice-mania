# Lose Gill Bates Money

## Goal
Build a playful, mobile-first three-round multiple-choice game from the supplied rules, blending the bold money counter of neal.fun/spend with the clear, tactile answer buttons of the Mulaney game reference.

## Experience
- Open immediately on the game with a prominent $100,000,000,000 balance and a short introduction.
- Present three non-repeating scenarios, each with four lettered attack choices and no dollar clues before selection.
- After each choice, reveal the loss, consequence, best-answer explanation when needed, prevention tip, and updated balance.
- End with the total drained, final balance, per-round recap, score, and a replay button that reshuffles the questions and choices.
- Support clicking and A–D keyboard input, with large touch targets and clear selected/reveal states.

## Visual Direction
- Editorial white canvas with a strong green money header, oversized black balance typography, and compact playful accents.
- Thick bordered answer buttons with crisp shadows, high contrast, and satisfying press/reveal motion.
- Single focused column on phones, expanding to a balanced desktop composition without losing the game-show feel.

## Technical Details
- Keep all game content and state in the frontend; no account or saved data is needed.
- Model scenarios and outcomes as typed data, randomize scenario and answer order per game, and prevent repeat submissions.
- Add accessible live updates, keyboard controls, reduced-motion support, responsive sizing, and route-specific social metadata.
- Define the full semantic color/type/motion system in the global stylesheet and use those tokens throughout the page.
- Verify the complete three-round flow and mobile/desktop rendering in the browser.
