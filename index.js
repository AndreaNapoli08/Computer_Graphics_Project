const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const objectTypeSelect = document.getElementById('objectType');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');

let objectToDraw = objectTypeSelect.value;
let objectColor = colorInput.value;
let objectSize = sizeInput.value;

function drawObject() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = objectColor;
    
    if (objectToDraw === 'cube') {
        context.fillRect(50, 50, objectSize, objectSize);
    } else if (objectToDraw === 'sphere') {
        context.beginPath();
        context.arc(100, 100, objectSize / 2, 0, Math.PI * 2);
        context.fill();
    } else if (objectToDraw === 'cylinder') {
        context.beginPath();
        context.moveTo(75, 150);
        context.lineTo(125, 150);
        context.arc(100, 150, objectSize / 2, 0, Math.PI);
        context.closePath();
        context.fill();
    }
}

objectTypeSelect.addEventListener('change', function() {
    objectToDraw = this.value;
    drawObject();
});

colorInput.addEventListener('input', function() {
    objectColor = this.value;
    drawObject();
});

sizeInput.addEventListener('input', function() {
    objectSize = this.value;
    drawObject();
});

drawObject();
