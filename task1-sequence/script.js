document.addEventListener("DOMContentLoaded", function () {
  const img = document.querySelector("#sequence-image");
  const counter = document.querySelector("#frame-counter");
  const totalFrames = 27;

  function updateFrameOnScroll() {
    let scrollY = window.scrollY;
    let maxScroll =
      document.documentElement.scrollHeight -
      window.innerHeight; 
    let scrollPercent =
      scrollY /
      maxScroll;
    let frameNumber = Math.max(
      1,
      Math.min(Math.floor(scrollPercent * totalFrames) + 1, totalFrames)
    );

    img.src = `../assets/sequence/frame-${String(frameNumber).padStart(
      2,
      "0"
    )}.jpg`;
    counter.textContent = `${frameNumber} / ${totalFrames}`;
  }

  window.addEventListener("scroll", updateFrameOnScroll);
});
