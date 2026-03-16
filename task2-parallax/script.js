const slides = document.querySelectorAll(".slide");

const cloud = document.querySelector(".layer-cloud img");
const moon = document.querySelector(".layer-moon img");
const container = document.querySelector(".kv-container");

let targetX = 0;
let targetY = 0;

let currentX = 0;
let currentY = 0;

container.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  targetX = (mouseX - centerX) / centerX;
  targetY = (mouseY - centerY) / centerY;
});

function animate() {
  const ease = 0.03;

  currentX += (targetX - currentX) * ease;
  currentY += (targetY - currentY) * ease;

  const cloudMoveX = currentX * -80;
  const cloudMoveY = currentY * -60;

  const moonMoveX = currentX * -50;
  const moonMoveY = currentY * -40;

  cloud.style.transform = `translate(calc(-50% + ${cloudMoveX}px), calc(-50% + ${cloudMoveY}px))`;
  moon.style.transform = `translate(calc(-50% + ${moonMoveX}px), calc(-50% + ${moonMoveY}px))`;

  requestAnimationFrame(animate);
}

animate();

const leftZone = document.querySelector(".nav-left");
const rightZone = document.querySelector(".nav-right");

let currentIndex = 0;
let isAnimating = false;

function showSlide(index, direction) {
  if (isAnimating) return;
  if (index === currentIndex) return;

  isAnimating = true;

  const current = slides[currentIndex];
  const next = slides[index];

  slides.forEach((s) => {
    s.style.transform = "";
    s.classList.remove("exit-left", "exit-right", "enter-left", "enter-right");
  });

  next.style.opacity = "1";

  if (direction === "right") {
    current.classList.add("exit-left");
    next.classList.add("enter-right");
  } else {
    current.classList.add("exit-right");
    next.classList.add("enter-left");
  }

  current.classList.add("moving");
  next.classList.add("moving");
  next.classList.add("active");

  setTimeout(() => {
    current.classList.remove("exit-left", "exit-right", "active");
    next.classList.remove("enter-left", "enter-right");

    current.classList.remove("moving");
    next.classList.remove("moving");

    current.style.transform = "";
    next.style.transform = "";

    current.style.opacity = "0";

    currentIndex = index;
    isAnimating = false;
  }, 600);
}

leftZone.addEventListener("click", () => {
  let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(prevIndex, "left");
});

rightZone.addEventListener("click", () => {
  let nextIndex = (currentIndex + 1) % slides.length;
  showSlide(nextIndex, "right");
});
