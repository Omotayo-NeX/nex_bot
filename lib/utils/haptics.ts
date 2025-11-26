/**
 * Utility functions for haptic feedback on mobile devices
 */

export const triggerHaptic = (duration: number = 10) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug('Haptic feedback not available:', error);
    }
  }
};

export const hapticFeedback = {
  // Light tap for button presses
  light: () => triggerHaptic(10),

  // Medium feedback for confirmations
  medium: () => triggerHaptic(20),

  // Strong feedback for important actions
  strong: () => triggerHaptic(30),

  // Success pattern
  success: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  // Error pattern
  error: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 100, 20]);
    }
  },
};
