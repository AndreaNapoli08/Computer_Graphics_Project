

let viewMatrixMain;
 async function loadObj(objHref, resizeObj, positionObj, rotation, rotatePosition, plane, velocity, spaceShuttle, bird, airBaloon, superman) {
  // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }
  
    // collega gli shaders, ricerca le posizioni degli attributi e delle uniformi
    const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);
  
    const response = await fetch(objHref);
    const text = await response.text();
    const obj = parseOBJ(text);
    const baseHref = new URL(objHref, window.location.href);
    const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
      const matHref = new URL(filename, baseHref).href;
      const response = await fetch(matHref);
      return await response.text();
    }));
    const materials = parseMTL(matTexts.join('\n'));
  
    const textures = {
      defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
      defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
    };
  
    // caricamento delle texture per i materiali
    for (const material of Object.values(materials)) {
      Object.entries(material)
        .filter(([key]) => key.endsWith('Map'))
        .forEach(([key, filename]) => {
          let texture = textures[filename];
          if (!texture) {
            const textureHref = new URL(filename, baseHref).href;
            texture = createTexture(gl, textureHref);
            textures[filename] = texture;
          }
          material[key] = texture;
        });
    }
  
    Object.values(materials).forEach(m => {
      m.shininess = 25;
      m.specular = [3, 2, 1];
    });
  
    const defaultMaterial = {
      diffuse: [1, 1, 1],
      diffuseMap: textures.defaultWhite,
      normalMap: textures.defaultNormal,
      ambient: [0, 0, 0],
      specular: [1, 1, 1],
      specularMap: textures.defaultWhite,
      shininess: 400,
      opacity: 1,
    };
  
    const parts = obj.geometries.map(({ material, data }) => {
  
      if (data.color) {
        if (data.position.length === data.color.length) {
          data.color = { numComponents: 3, data: data.color };
        }
      } else {
        data.color = { value: [1, 1, 1, 1] };
      }
  
      if (data.texcoord && data.normal) {
        data.tangent = generateTangents(data.position, data.texcoord);
      } else {
        data.tangent = { value: [1, 0, 0] };
      }
  
      if (!data.texcoord) {
        data.texcoord = { value: [0, 0] };
      }
  
      if (!data.normal) {
        data.normal = { value: [0, 0, 1] };
      }
  
      const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
      return {
        material: {
          ...defaultMaterial,
          ...materials[material],
        },
        bufferInfo,
      };
    });
  
    function getExtents(positions) {
      const min = positions.slice(0, 3);
      const max = positions.slice(0, 3);
      for (let i = 3; i < positions.length; i += 3) {
        for (let j = 0; j < 3; ++j) {
          const v = positions[i + j];
          min[j] = Math.min(v, min[j]);
          max[j] = Math.max(v, max[j]);
        }
      }
      return { min, max };
    }
  
    function getGeometriesExtents(geometries) {
      return geometries.reduce(({ min, max }, { data }) => {
        const minMax = getExtents(data.position);
        return {
          min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
          max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
        };
      }, {
        min: Array(3).fill(Number.POSITIVE_INFINITY),
        max: Array(3).fill(Number.NEGATIVE_INFINITY),
      });
    }
  
    const extents = getGeometriesExtents(obj.geometries);
    const range = m4.subtractVectors(extents.max, extents.min);

    // spostare l'oggetto in modo il centro si trovi nell'origine
    const objOffset = m4.scaleVector(
      m4.addVectors(
        extents.min,
        m4.scaleVector(range, 0.5)),
      -1);
    const radius = m4.length(range) * 0.5;
    
    const zNear = radius / 100;
    const zFar = radius * 1000000;
  
    function degToRad(deg) {
      return deg * Math.PI / 180;
    }
  
  // Variabili per memorizzare lo stato dei tasti
  const keys = {
    t: false,
    f: false,
    g: false,
    h: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  };
  
  let mouseDown = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  // Event listeners per i tasti
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
      keys[key] = true;
      if(plane){
        updateCameraPosition();
      }
  }
  
  function handleKeyUp(event) {
    sound_plane.pause();
    turbo_plane.pause();
    const key = event.key.toLowerCase();
      keys[key] = false;
      updateCameraPosition();
  }
  
  // Event listeners per i bottoni direzionali
  document.querySelectorAll(".commandButton").forEach(function(button) {
    const keyCode = button.getAttribute("data-key");
  
    button.addEventListener("mousedown", function(e) {
      keys[keyCode] = true;
      updateCameraPosition();
    });
    
    button.addEventListener("mouseup", function(e) {
      keys[keyCode] = false;
      sound_plane.pause();
      turbo_plane.pause();
      updateCameraPosition();
    });
  
    button.addEventListener("mouseout", function(e) {
      keys[keyCode] = false;
      updateCameraPosition();
    });
  });
  
  // Event listeners per il mouse
  canvas.addEventListener('mousedown', (event) => {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });
  
  canvas.addEventListener('mouseup', () => {
    mouseDown = false;
  });
  
  canvas.addEventListener('mousemove', (event) => {
    if (mouseDown) {
      const deltaX = event.clientX - lastMouseX;
      const deltaY = event.clientY - lastMouseY;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      updateCameraPositionWithMouse(deltaX, deltaY);
    }
  });
  
  // Funzione per aggiornare la posizione della camera in base al movimento del mouse
  function updateCameraPositionWithMouse(deltaX, deltaY) {
    const rotationSpeed = 0.0001; // Velocità di rotazione della camera
  
    // Ruota la camera in base al movimento del mouse
    m4.yRotate(cameraPositionMain, deltaX * rotationSpeed, cameraPositionMain);
    m4.xRotate(cameraPositionMain, deltaY * rotationSpeed, cameraPositionMain);
  
    // Ruota anche la navicella
    m4.xRotate(planeCamera, degToRad(-deltaY * rotationSpeed), planeCamera);
  }
  
  // Funzione per aggiornare la posizione della camera in base ai tasti premuti
  function updateCameraPosition() {
    if (keys['t'] && (keys[' '] || buttonSprint)){
      m4.translate(cameraPositionMain, 0, 0, -velocity*3, cameraPositionMain);
      turbo_plane.play();
      sound_plane.pause();
    }else if (keys['t']) {
      m4.translate(cameraPositionMain, 0, 0, -velocity, cameraPositionMain);
      sound_plane.play();
    }
    if (keys['f'] && (keys[' '] || buttonSprint)) {
      m4.translate(cameraPositionMain, -velocity*3, 0, 0, cameraPositionMain);
      turbo_plane.play();
      sound_plane.pause();
    }else if (keys['f']) {
      m4.translate(cameraPositionMain, -velocity, 0, 0, cameraPositionMain);
      sound_plane.play();
    }
    if (keys['g'] && (keys[' '] || buttonSprint)) {
      m4.translate(cameraPositionMain, 0, 0, velocity*3, cameraPositionMain);
      turbo_plane.play();
      sound_plane.pause();
    }else if (keys['g']) {
      m4.translate(cameraPositionMain, 0, 0, velocity, cameraPositionMain);
      sound_plane.play();
    }
    if (keys['h'] && (keys[' '] || buttonSprint)) {
      m4.translate(cameraPositionMain, velocity*3, 0, 0, cameraPositionMain);
      turbo_plane.play();
      sound_plane.pause();
    }else if (keys['h']) {
      m4.translate(cameraPositionMain, velocity, 0, 0, cameraPositionMain);
      sound_plane.play();
    }

    // comandi da tastiera
    if (keys['arrowup']) {
      m4.xRotate(cameraPositionMain, degToRad(0.1), cameraPositionMain);
    }
    if (keys['arrowdown']) {
      m4.xRotate(cameraPositionMain, degToRad(-0.1), cameraPositionMain);
    }
    if (keys['arrowleft']) {
      m4.yRotate(cameraPositionMain, degToRad(0.1), cameraPositionMain);
    }
    if (keys['arrowright']) {
      m4.yRotate(cameraPositionMain, degToRad(-0.1), cameraPositionMain);
    }
    // comandi sul menù 
    if (keys['ArrowUp']) {
      m4.xRotate(cameraPositionMain, degToRad(0.1), cameraPositionMain);
    }
    if (keys['ArrowDown']) {
      m4.xRotate(cameraPositionMain, degToRad(-0.1), cameraPositionMain);
    }
    if (keys['ArrowLeft']) {
      m4.yRotate(cameraPositionMain, degToRad(0.1), cameraPositionMain);
    }
    if (keys['ArrowRight']) {
      m4.yRotate(cameraPositionMain, degToRad(-0.1), cameraPositionMain);
    }
  }
  
  
  function resizeObject(resizeObj, u_world) {
    // Crea la matrice di scala
    const scaleMatrix = m4.scaling(resizeObj, resizeObj, resizeObj);
    // Moltiplica la matrice di scala per u_world
    return m4.multiply(u_world, scaleMatrix);
  }
  
  function moveObject(positionObj, u_world) {
    // Crea la matrice di traslazione
    const translationMatrix = m4.translation(positionObj[0], positionObj[1], positionObj[2]);
  
    // Moltiplica la matrice di traslazione per u_world
    return m4.multiply(translationMatrix, u_world);
  }
  
  function rotateObject(rotatePosition, u_world) {
    // Crea le matrici di rotazione per gli assi x, y e z
    const xRotationMatrix = m4.xRotation(degToRad(rotatePosition[0]));
    const yRotationMatrix = m4.yRotation(degToRad(rotatePosition[1]));
    const zRotationMatrix = m4.zRotation(degToRad(rotatePosition[2]));
  
    // Moltiplica le matrici di rotazione per u_world
    return m4.multiply(m4.multiply(m4.multiply(u_world, xRotationMatrix), yRotationMatrix), zRotationMatrix);
  }
  
  function render(time) {
    if(spaceShuttle){
      animateSpaceShuttle();
    }
    if(bird){
      animateBird();
    }
    if(airBaloon){
      animateAirBaloon();
    }

    if(superman){
      animateSuperman();
    }
    time *= rotation; 
    
    function calculateMovement(angle, radius) {
      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;
      return [x,z];
    }
  
    function animateSpaceShuttle() {
      let angle = time * 0.001;
      let radius = 10000;
      let [x,z] = calculateMovement(angle, radius);
      if(x>-5000){
        rotatePosition[1] = 10;
      }else{
        rotatePosition[1] = 160;
      }
      positionObj[0] = x-11000;
      positionObj[2] = z-11000;
    }
  
    function animateBird() {
      let angle = time * 0.0004; 
      let radius = 50000;
      let [x,z] = calculateMovement(angle, radius);
      positionObj[0] = -x+30000;
      x=Math.floor(x);
      if(x>=49999 || x<=-49999) {
        if(!positionBirdChange){
          if(rotatePosition[1]==90){
            rotatePosition[1]=-90
          }else{
            rotatePosition[1]=90
          }
          positionBirdChange = true;
        }
      }
      if(x<49998 && x>-49998){
        positionBirdChange = false;
      }
    }
  
    function animateAirBaloon() {
      let angle = time * 0.0005;
      let radius = 15000;
      let [y,z] = calculateMovement(angle, radius);
      positionObj[1] = y;
    }

    function animateSuperman() {
      let angle = time * 0.001;
      let radius = 10000;
      let [y,z] = calculateMovement(angle, radius);
      positionObj[1] = y;
      y=Math.floor(y);
      if(y>=9999 || y<=-9999) {
        if(!positionSupermanChange){
          if(rotatePosition[2]==0){
            rotatePosition[2]=180
          }else{
            rotatePosition[2]=0
          }
          positionSupermanChange = true;
        }
      }
      if(y<9998 && y>-9998){
        positionSupermanChange = false;
      }
    }
    
    // resize del canvas e impostazioni iniziali
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    
    // calcolo della matrice di proiezione
    const fieldOfViewRadians = degToRad(fov);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    
    // Impostazioni di illuminazione e vista:
    var sharedUniforms;
    viewMatrixMain = m4.inverse(cameraPositionMain);
    sharedUniforms = {
      u_lightDirection: m4.normalize([lightx, lighty, -lightz]), 
      u_ambientLight: m4.normalize([0, 0, 0]),
      u_frontLightDirection: m4.normalize([10, 50, -1]), 
      u_lightsEnabled: lightsEnabled ? 1 : 0,
      u_shadowEnabled: shadowEnabled ? 1 : 0,
      u_bumpEnabled: bumpEnabled ? 1 : 0,
      u_view: viewMatrixMain,
      u_projection: projection,
    }; 
  
    // gestione dell'aereo
    if(plane){
      viewMatrixMain = m4.inverse(planeCamera);
      sharedUniforms = {
        u_lightDirection: m4.normalize([lightx, lighty, -lightz]),
        u_ambientLight: m4.normalize([0, 0, 0]),
        u_lightsEnabled: lightsEnabled ? 1 : 0, 
        u_shadowEnabled: shadowEnabled ? 1 : 0,
        u_bumpEnabled: bumpEnabled ? 1 : 0,
        u_view: viewMatrixMain,
        u_projection: projection,
      };
    } 
    
    // rendering degli oggetti
    gl.useProgram(meshProgramInfo.program);
  
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
    
    let u_world = m4.yRotation(time);
    u_world = m4.translate(u_world, ...objOffset);
  
    // Ridimensiona l'oggetto
    u_world = resizeObject(resizeObj, u_world);
  
    u_world = moveObject(positionObj,u_world)
  
    u_world = rotateObject(rotatePosition,u_world)
  
    
    for (const { bufferInfo, material } of parts) {
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      webglUtils.setUniforms(meshProgramInfo, {
        u_world,
      }, material);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }
  
    requestAnimationFrame(render);
    updateCameraPosition(velocity)
  }
  
    requestAnimationFrame(render);
}