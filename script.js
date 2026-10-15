import gsap from "https://esm.sh/gsap@3.14.2";
import { ScrollTrigger } from "https://esm.sh/gsap@3.14.2/ScrollTrigger";
import lottie from "https://esm.sh/lottie-web@5.13.0";
import Lenis from "https://esm.sh/lenis@1.2.3";

gsap.registerPlugin(ScrollTrigger);

// Smooth scrolling
const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Elements
const beeElement = document.querySelector(".bee");
const shadowElement = document.querySelector(".bee-shadow");

if (!beeElement || !shadowElement) {
  throw new Error("Bee or bee-shadow element was not found.");
}

// Load bee animation
const beeAnimation = lottie.loadAnimation({
  container: beeElement,
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "/fly2.json",
});

const shadowAnimation = lottie.loadAnimation({
  container: shadowElement,
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "/fly2.json",
});

// Flight path
const horizontalKeyFrames = [
  { progress: 0.0, offset: -0.3 },
  { progress: 0.1, offset: -0.6 },
  { progress: 0.2, offset: -0.15 },
  { progress: 0.28, offset: -0.18 },
  { progress: 0.4, offset: 0.7 },
  { progress: 0.52, offset: 0.3 },
  { progress: 0.58, offset: 0.35 },
  { progress: 0.68, offset: -0.55 },
  { progress: 0.8, offset: -0.8 },
  { progress: 0.9, offset: 0.15 },
  { progress: 1.0, offset: -0.2 },
];

const verticalKeyFrames = [
  { progress: 0.0, drop: 0.0 },
  { progress: 0.05, drop: 0.16 },
  { progress: 0.3, drop: 0.34 },
  { progress: 0.6, drop: 0.5 },
  { progress: 0.85, drop: 0.66 },
  { progress: 1.0, drop: 1.0 },
];

const BEE_SIZE = 125;
const SHADOW_SIZE = 115;

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;

const beeX = gsap.quickSetter(beeElement, "x", "px");
const beeY = gsap.quickSetter(beeElement, "y", "px");
const beeRotation = gsap.quickSetter(beeElement, "rotation", "deg");

const shadowX = gsap.quickSetter(shadowElement, "x", "px");
const shadowY = gsap.quickSetter(shadowElement, "y", "px");

function interpolateKeyframes(keyframes, progress, valueKey) {
  if (progress <= keyframes[0].progress) {
    return keyframes[0][valueKey];
  }

  for (let i = 1; i < keyframes.length; i++) {
    const previous = keyframes[i - 1];
    const current = keyframes[i];

    if (progress <= current.progress) {
      const localProgress =
        (progress - previous.progress) / (current.progress - previous.progress);

      return (
        previous[valueKey] +
        (current[valueKey] - previous[valueKey]) * localProgress
      );
    }
  }

  return keyframes[keyframes.length - 1][valueKey];
}

function updateFlight(progress) {
  const horizontalOffset = interpolateKeyframes(
    horizontalKeyFrames,
    progress,
    "offset",
  );

  const verticalDrop = interpolateKeyframes(
    verticalKeyFrames,
    progress,
    "drop",
  );

  // Keep the bee within a reasonable horizontal flight area.
  const maxHorizontalOffset = viewportWidth * 0.35;

  const x =
    (viewportWidth - BEE_SIZE) / 2 + horizontalOffset * maxHorizontalOffset;

  const y = -BEE_SIZE - 60 + verticalDrop * (viewportHeight + BEE_SIZE + 110);

  beeX(x);
  beeY(y);

  // Follow the same flight path with a slightly smaller shadow.
  shadowX(x + (BEE_SIZE - SHADOW_SIZE) / 2);
  shadowY(y + (BEE_SIZE - SHADOW_SIZE) / 2);

  // Subtle directional tilt.
  const nextOffset = interpolateKeyframes(
    horizontalKeyFrames,
    Math.min(progress + 0.01, 1),
    "offset",
  );

  const direction = nextOffset - horizontalOffset;

  beeRotation(gsap.utils.clamp(-18, 18, direction * 100));
}

// Animate the bee throughout the page.
const flightTrigger = ScrollTrigger.create({
  trigger: document.documentElement,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate(self) {
    updateFlight(self.progress);
  },
});

// Start with the bee above the screen.
updateFlight(0);

// Recalculate on resize.
window.addEventListener("resize", () => {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;

  ScrollTrigger.refresh();
  updateFlight(flightTrigger.progress);
});

// Check Lottie loading errors.
beeAnimation.addEventListener("data_failed", () => {
  console.error("Failed to load /bee.json");
});

shadowAnimation.addEventListener("data_failed", () => {
  console.error("Failed to load shadow animation /bee.json");
});

beeAnimation.addEventListener("DOMLoaded", () => {
  console.log("Bee animation loaded successfully.");
});

ScrollTrigger.refresh();
