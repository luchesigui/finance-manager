"use client";

import confetti from "canvas-confetti";
import Cookies from "js-cookie";
import { useEffect, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

type SavingsConfettiProps = {
  savingsGoalAchieved: boolean;
  yearMonth: string; // Format: "YYYY-MM"
};

// ============================================================================
// Constants
// ============================================================================

const CELEBRATION_COOKIE_PREFIX = "savings_goal_celebrated_";
const COOKIE_EXPIRY_DAYS = 7;

// ============================================================================
// Component
// ============================================================================

export function SavingsConfetti({ savingsGoalAchieved, yearMonth }: SavingsConfettiProps) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Prevent triggering multiple times in the same render cycle
    if (hasTriggered.current) return;

    // Only trigger if goal is achieved
    if (!savingsGoalAchieved) return;

    // Check if already celebrated this month
    const cookieName = `${CELEBRATION_COOKIE_PREFIX}${yearMonth}`;
    const hasSeenCelebration = Cookies.get(cookieName);

    if (hasSeenCelebration) return;

    // Mark as triggered
    hasTriggered.current = true;

    // Set cookie to prevent repeated celebration
    Cookies.set(cookieName, "true", { expires: COOKIE_EXPIRY_DAYS });

    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    // Gold and green colors for success
    const colors = ["#FACC15", "#22C55E", "#FFD700", "#10B981"];

    const runConfetti = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        disableForReducedMotion: true,
      });

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        disableForReducedMotion: true,
      });

      requestAnimationFrame(runConfetti);
    };

    // Start confetti from center top
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.3 },
      colors,
      disableForReducedMotion: true,
    });

    // Continue with side confetti
    runConfetti();

    // Cleanup function - reset the trigger ref when component unmounts
    return () => {
      hasTriggered.current = false;
    };
  }, [savingsGoalAchieved, yearMonth]);

  // This component doesn't render anything visible
  return null;
}
