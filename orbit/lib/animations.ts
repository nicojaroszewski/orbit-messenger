import { Variants } from "framer-motion";

// Orbital easing curves
export const easing = {
  orbital: [0.34, 1.56, 0.64, 1] as const,
  elastic: [0.68, -0.55, 0.265, 1.55] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
};

// Page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easing.orbital,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easing.smooth,
    },
  },
};

// Fade in animation
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: easing.smooth },
  },
  exit: { opacity: 0 },
};

// Slide up animation
export const slideUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing.orbital },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

// Scale in animation
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: easing.orbital },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Message arrival animation
export const messageArrival: Variants = {
  initial: { opacity: 0, x: -20, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: easing.orbital },
  },
};

// Message sent animation
export const messageSent: Variants = {
  initial: { opacity: 0, x: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: easing.orbital },
  },
};

// Staggered children
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// List item animation
export const listItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easing.orbital },
  },
};

// Orbital float animation
export const orbitalFloat: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [0, -10, 0, 10, 0],
    rotate: [0, 2, 0, -2, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Pulse glow animation
export const pulseGlow: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2, ease: easing.orbital },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// Modal animation
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: easing.orbital },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Sidebar animation
export const sidebarVariants: Variants = {
  initial: { x: -300, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: easing.smooth },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Notification animation
export const notificationVariants: Variants = {
  initial: { opacity: 0, y: -50, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: easing.orbital },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

// Typing indicator dots
export const typingDots: Variants = {
  initial: { y: 0, opacity: 0.4 },
  animate: {
    y: [-4, 0],
    opacity: [1, 0.4],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

// Avatar hover effect
export const avatarHover = {
  scale: 1.1,
  transition: { duration: 0.2, ease: easing.orbital },
};

// Card hover effect
export const cardHover = {
  y: -4,
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
  transition: { duration: 0.3, ease: easing.orbital },
};
