export function initializeUIControls() {
    const fovInput = document.getElementById('fov');
    const fovValue = document.getElementById('fovLabel');
    fovInput.addEventListener('input', function () {
        fovValue.textContent = "Fov: " + fovInput.value;
        fov = fovInput.value;
    });

    const LightXInput = document.getElementById('lightx');
    const LightXValue = document.getElementById('lightxLabel');
    LightXInput.addEventListener('input', function () {
        LightXValue.textContent = "Light x: " + LightXInput.value;
        lightx = LightXInput.value;
    });

    const LightYInput = document.getElementById('lighty');
    const LightYValue = document.getElementById('lightyLabel');
    LightYInput.addEventListener('input', function () {
        LightYValue.textContent = "Light y: " + LightYInput.value;
        lighty = LightYInput.value;
    });

    const LightZInput = document.getElementById('lightz');
    const LightZValue = document.getElementById('lightzLabel');
    LightZInput.addEventListener('input', function () {
        LightZValue.textContent = "Light z: " + LightZInput.value;
        lightz = LightZInput.value;
    });

    const lightsCheckbox = document.getElementById('lightsCheckbox');
    lightsCheckbox.addEventListener('change', function () {
        lightsEnabled = lightsCheckbox.checked;
    });

    const shadowCheckbox = document.getElementById('shadowCheckbox');
    const bumpCheckbox = document.getElementById('bumpCheckbox');

    shadowCheckbox.addEventListener('change', function () {
        shadowEnabled = shadowCheckbox.checked;
        bumpCheckbox.disabled = !shadowEnabled;
        bumpCheckboxWrapper.classList.toggle('bg-gray-300', !shadowEnabled);
        bumpCheckboxWrapper.classList.toggle('cursor-not-allowed', !shadowEnabled);
        bumpCheckboxWrapper.classList.toggle('opacity-50', !shadowEnabled);
        bumpLabel.classList.toggle('text-gray-300', !shadowEnabled);
    });

    bumpCheckbox.addEventListener('change', function () {
        bumpEnabled = bumpCheckbox.checked;
    });
}

