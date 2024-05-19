
let velocity = 10;
var spaceshipCamera = m4.identity();
var cameraPositionMain = m4.identity();
let initialSpaceshipRotation = 0;
let initialSpaceshipRotation2 = 0;
// Definisci le variabili per tenere traccia dello stato dei tasti WASD
var keys = {};
window.addEventListener("keydown", function(event) {
  keys[event.key] = true;
  updateCameraPosition();
});
window.addEventListener("keyup", function(event) {
  keys[event.key] = false;
  updateCameraPosition();
});

function degToRad(deg) {
    return deg * Math.PI / 180;
  }

// Aggiorna la posizione della telecamera in base ai tasti premuti
function updateCameraPosition() {
  if (keys['ArrowUp']) {
    console.log("su");
    m4.xRotate(cameraPositionMain, degToRad(0.5), cameraPositionMain);
    m4.zRotate(spaceshipCamera, degToRad(-0.1), spaceshipCamera);
    initialSpaceshipRotation2 -= 0.1
  }
  if (keys['ArrowDown']) {
    console.log("giu");
    m4.xRotate(cameraPositionMain, degToRad(-0.5), cameraPositionMain);
    m4.zRotate(spaceshipCamera, degToRad(0.1), spaceshipCamera);
    initialSpaceshipRotation2 += 0.1
  }
  if (keys['ArrowLeft']) {
    console.log("sinistra");
    m4.yRotate(cameraPositionMain, degToRad(0.5), cameraPositionMain);
    m4.zRotate(spaceshipCamera, degToRad(-0.1), spaceshipCamera);
    initialSpaceshipRotation -= 0.1
  }
  if (keys['ArrowRight']) {
    console.log("destra");
    m4.yRotate(cameraPositionMain, degToRad(-0.5), cameraPositionMain);
    m4.zRotate(spaceshipCamera, degToRad(0.1), spaceshipCamera);
    initialSpaceshipRotation += 0.1
  }
}
  