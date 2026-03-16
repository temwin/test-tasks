const draggable = document.getElementById("draggable");

function center() {
  const ww = window.innerWidth;
  const wh = window.innerHeight;
  draggable.style.left = (ww - 200) / 2 + "px";
  draggable.style.top = (wh - 200) / 2 + "px";
}
center();
window.addEventListener("resize", center);

let shiftX = 0,
  shiftY = 0;

draggable.addEventListener("mousedown", (e) => {
  e.preventDefault();

  const rect = draggable.getBoundingClientRect();
  shiftX = e.clientX - rect.left;
  shiftY = e.clientY - rect.top;

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

function onMouseMove(e) {
  draggable.style.left = e.clientX - shiftX + "px";
  draggable.style.top = e.clientY - shiftY + "px";
}

function onMouseUp() {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}
