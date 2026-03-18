const draggable = document.querySelector("#draggable");

function center() {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  draggable.style.left = (ww - 200) / 2 + "px";
  draggable.style.top = (wh - 200) / 2 + "px";
}
center();
window.addEventListener("resize", center);

let shiftX = 0, shiftY = 0;

draggable.addEventListener("mousedown", (e) => {
  e.preventDefault();

  const rect = draggable.getBoundingClientRect();
  shiftX = e.clientX - rect.left;
  shiftY = e.clientY - rect.top;

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

draggable.addEventListener("touchstart", (e) => {
  e.preventDefault();

  const rect = draggable.getBoundingClientRect();
  const touch = e.touches[0];
  shiftX = touch.clientX - rect.left;
  shiftY = touch.clientY - rect.top;

  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd);
  document.addEventListener("touchcancel", onTouchEnd);
});

function onMouseMove(e) {
  draggable.style.left = e.clientX - shiftX + "px";
  draggable.style.top = e.clientY - shiftY + "px";
}

function onMouseUp() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

function onTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  if (touch) {
    draggable.style.left = touch.clientX - shiftX + "px";
    draggable.style.top = touch.clientY - shiftY + "px";
  }
}

function onTouchEnd() {
  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
  document.removeEventListener("touchcancel", onTouchEnd);
}
