// ============================================================
// EDITOR.JS
// ============================================================
//
// Editor entry point.
//
// IMPORTANT:
//
// The editor does NOT have its own map renderer.
//
// It uses the exact same shared systems as the main game:
//
//     map.js
//     renderer.js
//     camera.js
//     cities.js
//     armies.js
//     terrain.js
//
// This means the editor and the actual game are always
// rendering the same map.
//
// Camera interaction is intentionally identical to main.js:
//     • Left mouse button = pan
//     • >2px movement = drag
//     • Mouse wheel = zoom
//
// ============================================================


import {

    tiles,
    applyMapData

} from "./shared/map.js";


import {

    mapCanvas,
    rebuildMapCanvas,
    draw

} from "./shared/renderer.js";


import {

    loadCities

} from "./shared/cities.js";


import {

    loadArmies

} from "./shared/armies.js";


import {

    loadTerrain

} from "./shared/terrain.js";


import {

    camera,
    resizeCamera,
    zoomCamera,
    panCamera

} from "./shared/camera.js";


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById(
        "editorCanvas"
    );


const ctx =
    canvas.getContext(
        "2d"
    );


// ============================================================
// INITIALIZATION
// ============================================================

async function startEditor() {

    // --------------------------------------------------------
    // Resize
    // --------------------------------------------------------

    resizeCamera(
        canvas
    );


    // --------------------------------------------------------
    // Load map
    // --------------------------------------------------------

    try {

        const response =
            await fetch(
                "data/map.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        applyMapData(
            data
        );

    }

    catch (
        error
    ) {

        console.error(
            "Could not load map.json:",
            error
        );

        return;

    }


    // --------------------------------------------------------
    // Load other map data
    // --------------------------------------------------------

    await loadTerrain();

    await loadCities();

    await loadArmies();


    // --------------------------------------------------------
    // Build renderer cache
    // --------------------------------------------------------

    rebuildMapCanvas();


    // --------------------------------------------------------
    // Start rendering
    // --------------------------------------------------------

    requestAnimationFrame(
        render
    );

}


// ============================================================
// RENDER LOOP
// ============================================================

function render() {

    draw(
        ctx,
        canvas
    );


    requestAnimationFrame(
        render
    );

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        resizeCamera(
            canvas
        );

    }
);


// ============================================================
// PAN
// ============================================================
//
// This intentionally matches main.js.
//
// Left mouse button starts panning.
//
// A movement greater than 2 pixels is considered an actual
// drag.
//
// ============================================================

let dragging = false;

let wasDragging = false;

let lastX = 0;

let lastY = 0;


// ------------------------------------------------------------
// START PAN
// ------------------------------------------------------------

canvas.addEventListener(
    "mousedown",
    event => {

        // ----------------------------------------------------
        // LEFT MOUSE BUTTON ONLY
        // ----------------------------------------------------

        if (
            event.button !== 0
        ) {

            return;

        }


        dragging = true;

        wasDragging = false;


        lastX =
            event.clientX;

        lastY =
            event.clientY;

    }
);


// ------------------------------------------------------------
// MOVE CAMERA
// ------------------------------------------------------------

canvas.addEventListener(
    "mousemove",
    event => {

        if (
            !dragging
        ) {

            return;

        }


        const dx =
            event.clientX -
            lastX;


        const dy =
            event.clientY -
            lastY;


        // ----------------------------------------------------
        // DETECT ACTUAL DRAG
        // ----------------------------------------------------

        if (
            Math.abs(dx) > 2 ||
            Math.abs(dy) > 2
        ) {

            wasDragging = true;

        }


        // ----------------------------------------------------
        // PAN
        // ----------------------------------------------------

        panCamera(
            canvas,
            dx,
            dy
        );


        // ----------------------------------------------------
        // UPDATE LAST POSITION
        // ----------------------------------------------------

        lastX =
            event.clientX;

        lastY =
            event.clientY;

    }
);


// ------------------------------------------------------------
// STOP PAN
// ------------------------------------------------------------

window.addEventListener(
    "mouseup",
    () => {

        dragging = false;

    }
);


// ------------------------------------------------------------
// CANCEL PAN IF WINDOW LOSES FOCUS
// ------------------------------------------------------------

window.addEventListener(
    "blur",
    () => {

        dragging = false;

    }
);


// ============================================================
// ZOOM
// ============================================================

canvas.addEventListener(
    "wheel",
    event => {

        event.preventDefault();


        zoomCamera(
            canvas,
            event
        );

    },
    {
        passive: false
    }
);


// ============================================================
// START
// ============================================================

startEditor();
