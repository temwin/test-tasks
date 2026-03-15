document.addEventListener("DOMContentLoaded", function () {
  const img = document.getElementById("sequence-image");
  const counter = document.getElementById("frame-counter");
  const totalFrames = 27;

  function updateFrameOnScroll() {
    let scrollY = window.scrollY; /*сколько мы проскроллили*/
    let maxScroll =
      document.documentElement.scrollHeight -
      window.innerHeight; /*Сколько можно проскроллить = вся страница минус один экран*/
    let scrollPercent =
      scrollY /
      maxScroll; /*Находим процент того, сколько УЖЕ проскроллили от максимально возможного*/
    let frameNumber = Math.min(
      Math.floor(scrollPercent * totalFrames) + 1,
      totalFrames
    );

    /*генерация пути по шаблону*/
    img.src = `../assets/sequence/frame-${String(frameNumber).padStart(
      2,
      "0"
    )}.jpg`;
    counter.textContent = `${frameNumber} / ${totalFrames}`;
  }

  window.addEventListener("scroll", updateFrameOnScroll);
});
