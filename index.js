"use strict";

 var cameraPositionMain = m4.identity()
 var fov = 50;
 var lightx = 50;
 var lighty = 50;
 var lightz = 50;

 var velocity = 10
 var planeCamera = m4.identity()
 var sound_plane = new Audio('audio/aereo.mp3');
 var turbo_plane = new Audio('audio/turbo.mp3');
 var positionBirdChange = false;
 var positionSupermanChange = false;
 var lightsEnabled =  true;
 var shadowEnabled = true;
 var bumpEnabled = true;
 var buttonSprint = false;
 
// Inizializzazione dei controlli dell'interfaccia utente
initializeUIControls();



document.addEventListener("DOMContentLoaded", function () {
    var loadingText = document.getElementById("loadingMessage");
    var canvas = document.getElementById("canvasdiv");
  
    function hideLoadingText() {
      loadingText.style.display = "none";
      canvas.style.display = "flex";
    }

    setTimeout(hideLoadingText, 3000);
});

// percorso anelli
loadObj("./object/ring/ring.obj", 3000, [0, 2000, -20000], 0, [0, 120, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [15000, 0, -20000], 0, [0, 260, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [30000, 2000, -20000], 0, [0, 260, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [45000, 0, -17000], 0, [0, 70, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [60000, -2000, -10000], 0, [0, 50, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [78000, -4000, 0], 0, [0, 30, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [80000, 0, 12000], 0, [0, 10, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [75000, 0, 24000], 0, [0, -10, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [65000, 1000, 35000], 0, [0, -30, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [55000, 0, 42000], 0, [0, -40, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [45000, -2000, 50000], 0, [0, -70, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [30000, 0, 48000], 0, [0, -80, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [20000, 0, 42000], 0, [0, 90, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [8000, 0, 42000], 0, [0, 90, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [1000, 0, 37000], 0, [0, 90, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [-8000, 2000, 33000], 0, [0, 90, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [-15000, -2000, 25000], 0, [0, -120, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [-22000, 0, 18000], 0, [0, -140, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [-20000, 1000, 6000], 0, [0, -160, 0], false, 10, false, false, false, false);
loadObj("./object/ring/ring.obj", 3000, [-15000, 0, -10000], 0, [0, 180, 0], false, 10, false, false, false, false);

// caricamento dei vari oggetti
loadObj("./object/plane/plane.obj", 10, [0, -100, -400], 0, [0, 180, 0], true, 10, false, false, false, false);
loadObj("./object/stella/SimpleStar.obj", 10000, [30000, 0, 15000], 0.001, [180, 90, 90], false, 10, false, false, false, false);
loadObj("./object/dirigibile/dirigibile.obj", 6000, [10, -200, -10000], 0, [0, 160, 0], false, 10, true, false, false, false);
loadObj("./object/uccello/bird.obj", 50, [5000, -500, 30000], 0, [0, 90, 0], false, 10, false, true, false, false);
loadObj("./object/ironman/ironman.obj", 2000, [3000, -200, 40000], 0, [0, 90, 0], false, 10, false, false, false, false);
loadObj("./object/mongolfiera/mongolfiera.obj", 2500, [52000, 0, -15000], 0, [0, 90, 0], false, 10, false, false, true, false);
loadObj("./object/superman/superman.obj", 2000, [36000, 0, 48000], 0.0001, [0, 90, 0], false, 10, false, false, false, true);
