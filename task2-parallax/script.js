const slides = document.querySelectorAll(".slide");
const cloudLayer = document.querySelector("#cloud-layer");
const rainbowLayer = document.querySelector("#rainbow-layer");
const container = document.querySelector(".kv-container");
const canvas = document.getElementById("webgl-canvas");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

const webgl = new WebGLTransition(canvas);

webgl.loadImages([
  "../assets/images/task2/slide1-bg1.jpeg",
  "../assets/images/task2/slide2-bg-1.jpeg",
]);

// Параллакс
let parallaxActive = true;
let cloudMoveX = 0,
  cloudMoveY = 0,
  rainbowMoveX = 0,
  rainbowMoveY = 0;

container.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  targetX = (mouseX - centerX) / centerX;
  targetY = (mouseY - centerY) / centerY;
});

function animateParallax() {
  if (!parallaxActive) {
    requestAnimationFrame(animateParallax);
    return;
  }

  const ease = 0.03;
  currentX += (targetX - currentX) * ease;
  currentY += (targetY - currentY) * ease;

  cloudMoveX = currentX * -80;
  cloudMoveY = currentY * -60;
  rainbowMoveX = currentX * -50;
  rainbowMoveY = currentY * -40;

  cloudLayer.style.transform = `translate(calc(-50% + ${cloudMoveX}px), calc(-50% + ${cloudMoveY}px))`;
  rainbowLayer.style.transform = `translate(calc(-50% + ${rainbowMoveX}px), calc(-50% + ${rainbowMoveY}px))`;

  requestAnimationFrame(animateParallax);
}
animateParallax();

const leftZone = document.querySelector(".nav-left");
const rightZone = document.querySelector(".nav-right");

let currentIndex = 0;
let isAnimating = false;

cloudLayer.style.opacity = 1;
rainbowLayer.style.opacity = 0;

function showSlide(index, direction) {
  if (isAnimating) return;
  if (index === currentIndex) return;

  isAnimating = true;
  parallaxActive = false;

  cloudLayer.style.opacity = 1;
  rainbowLayer.style.opacity = 1;

  webgl.startTransition(
    index,
    direction,
    () => {
      slides.forEach((s) => s.classList.remove("active"));
      slides[index].classList.add("active");
      currentIndex = index;
      isAnimating = false;
      parallaxActive = true;

      cloudLayer.style.opacity = index === 0 ? 1 : 0;
      rainbowLayer.style.opacity = index === 1 ? 1 : 0;
    },
    (progress, dir) => {
      const shift = dir * progress * window.innerWidth;
      const shiftIn = -dir * (1 - progress) * window.innerWidth;

      const minOpacity = 0.3;
      const maxOpacity = 1.0;

      const outOpacity = maxOpacity - (maxOpacity - minOpacity) * progress;
      const inOpacity = minOpacity + (maxOpacity - minOpacity) * progress;

      if (currentIndex === 0) {
        // Уходит облако
        cloudLayer.style.transform = `translate(calc(-50% + ${
          cloudMoveX + shift
        }px), calc(-50% + ${cloudMoveY}px))`;
        cloudLayer.style.opacity = outOpacity;

        // Появляется радуга
        rainbowLayer.style.transform = `translate(calc(-50% + ${
          rainbowMoveX + shiftIn
        }px), calc(-50% + ${rainbowMoveY}px))`;
        rainbowLayer.style.opacity = inOpacity;
      } else {
        // Уходит радуга
        rainbowLayer.style.transform = `translate(calc(-50% + ${
          rainbowMoveX + shift
        }px), calc(-50% + ${rainbowMoveY}px))`;
        rainbowLayer.style.opacity = outOpacity;

        // Появляется облако
        cloudLayer.style.transform = `translate(calc(-50% + ${
          cloudMoveX + shiftIn
        }px), calc(-50% + ${cloudMoveY}px))`;
        cloudLayer.style.opacity = inOpacity;
      }
    }
  );
}

leftZone.addEventListener("click", () => {
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(prevIndex, "left");
});

rightZone.addEventListener("click", () => {
  const nextIndex = (currentIndex + 1) % slides.length;
  showSlide(nextIndex, "right");
});
