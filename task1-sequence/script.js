document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.querySelector(".sequence-canvas");
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const counter = document.querySelector("#frame-counter");
  const totalFrames = 27;

  const images = [];
  let loadedCount = 0;
  let ticking = false;

  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = `../assets/sequence/frame-${String(i).padStart(2, "0")}.jpg`;

    img.onload = () => {
      loadedCount++;
      if (loadedCount === totalFrames) {
        canvas.width = images[0].width;
        canvas.height = images[0].height;
        drawFrame(1);
      }
    };
    images.push(img);
  }

  function drawFrame(frameNumber) {
    const frame1 = Math.floor(frameNumber);
    const frame2 = Math.min(frame1 + 1, totalFrames);
    const blend = frameNumber - frame1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 1;
    ctx.drawImage(images[frame1 - 1], 0, 0, canvas.width, canvas.height);

    if (blend > 0.01) {
      ctx.globalAlpha = blend;
      ctx.drawImage(images[frame2 - 1], 0, 0, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 1;
    counter.textContent = `${Math.floor(frameNumber)} / ${totalFrames}`;
  }

  function updateFrameOnScroll() {
    let scrollY = window.scrollY;
    let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    let scrollPercent = scrollY / maxScroll;
    let frameNumber = 1 + scrollPercent * (totalFrames - 1);
    drawFrame(frameNumber);
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateFrameOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
});
