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
// PAN CAMERA
// ============================================================

let isPanning = false;

let lastMouseX = 0;

let lastMouseY = 0;


// ------------------------------------------------------------
// START PAN
// ------------------------------------------------------------

canvas.addEventListener(
    "mousedown",
    event => {

        // Middle mouse button.

        if (
            event.button === 1
        ) {

            event.preventDefault();

            isPanning = true;

            lastMouseX =
                event.clientX;

            lastMouseY =
                event.clientY;

            canvas.style.cursor =
                "grabbing";

        }

    }
);


// ------------------------------------------------------------
// MOVE CAMERA
// ------------------------------------------------------------

window.addEventListener(
    "mousemove",
    event => {

        if (
            !isPanning
        ) {

            return;

        }


        const dx =
            event.clientX -
            lastMouseX;


        const dy =
            event.clientY -
            lastMouseY;


        panCamera(
            canvas,
            dx,
            dy
        );


        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;

    }
);


// ------------------------------------------------------------
// STOP PAN
// ------------------------------------------------------------

window.addEventListener(
    "mouseup",
    event => {

        if (
            event.button === 1
        ) {

            isPanning = false;

            canvas.style.cursor =
                "default";

        }

    }
);


// ------------------------------------------------------------
// CANCEL PAN IF WINDOW LOSES FOCUS
// ------------------------------------------------------------

window.addEventListener(
    "blur",
    () => {

        isPanning = false;

        canvas.style.cursor =
            "default";

    }
);


// ============================================================
// START
// ============================================================

startEditor();
