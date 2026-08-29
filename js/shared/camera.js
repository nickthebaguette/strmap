// ============================================================
// CAMERA.JS
// Shared camera system
// ============================================================
//
// The camera is shared by:
//
//     main.js
//     editor.js
//
// The map itself defines its dimensions through map.js.
//
// The camera is responsible for:
//
//     - zoom
//     - panning
//     - viewport limits
//     - keeping the map inside the screen
//
// ============================================================


import {
    MAP_WIDTH,
    MAP_HEIGHT
} from "./map.js";


// ============================================================
// FRAME
// ============================================================

export const FRAME_OVERHANG =
    14 * 0.5;


export const FRAME_WIDTH =
    7;


export const FRAME_COLOR =
    "#252522";


// ============================================================
// CAMERA
// ============================================================
//
// x / y represent the world coordinate at the TOP-LEFT
// corner of the screen.
//
// zoom:
//
//     1.0 = normal
//     2.0 = 2x zoom
//     0.5 = zoomed out
//
// ============================================================

export const camera = {

    x: 0,

    y: 0,

    zoom: 0.55

};


// ============================================================
// ZOOM LIMITS
// ============================================================

export let MIN_ZOOM =
    0.55;


export const MAX_ZOOM =
    3.0;


// ============================================================
// GET FRAME BOUNDS
// ============================================================
//
// These are the actual world-space bounds of the visible
// framed map.
//
// ============================================================

function getFrameBounds() {

    return {

        left:
            -FRAME_OVERHANG,

        top:
            -FRAME_OVERHANG,

        right:
            MAP_WIDTH +
            FRAME_OVERHANG,

        bottom:
            MAP_HEIGHT +
            FRAME_OVERHANG

    };

}


// ============================================================
// SCREEN → WORLD
// ============================================================

export function screenToWorld(
    x,
    y
) {

    return {

        x:
            x / camera.zoom +
            camera.x,

        y:
            y / camera.zoom +
            camera.y

    };

}


// ============================================================
// WORLD → SCREEN
// ============================================================

export function worldToScreen(
    x,
    y
) {

    return {

        x:
            (
                x -
                camera.x
            ) *
            camera.zoom,

        y:
            (
                y -
                camera.y
            ) *
            camera.zoom

    };

}


// ============================================================
// MINIMUM ZOOM
// ============================================================
//
// The minimum zoom is the zoom at which the ENTIRE framed
// map fits inside the viewport.
//
// This is important because:
//
//     zoom < MIN_ZOOM
//
// would allow the player to see empty space around the map.
//
// We use MAX here because both dimensions must fit.
//
// ============================================================

export function updateMinimumZoom(
    canvas
) {

    const bounds =
        getFrameBounds();


    const frameWidth =
        bounds.right -
        bounds.left;


    const frameHeight =
        bounds.bottom -
        bounds.top;


    const zoomX =
        canvas.width /
        frameWidth;


    const zoomY =
        canvas.height /
        frameHeight;


    MIN_ZOOM =
        Math.max(
            zoomX,
            zoomY
        );


    MIN_ZOOM =
        Math.min(
            MIN_ZOOM,
            MAX_ZOOM
        );

}


// ============================================================
// CENTER MAP
// ============================================================
//
// Places the camera so the entire framed map is centered
// inside the viewport.
//
// This is used when:
//
//     - the page first loads
//     - the map dimensions change
//     - the window is resized while at minimum zoom
//
// ============================================================

export function centerCamera(
    canvas
) {

    const bounds =
        getFrameBounds();


    const visibleWidth =
        canvas.width /
        camera.zoom;


    const visibleHeight =
        canvas.height /
        camera.zoom;


    camera.x =
        bounds.left -
        (
            visibleWidth -
            (
                bounds.right -
                bounds.left
            )
        ) / 2;


    camera.y =
        bounds.top -
        (
            visibleHeight -
            (
                bounds.bottom -
                bounds.top
            )
        ) / 2;

}


// ============================================================
// CLAMP CAMERA
// ============================================================
//
// Keeps the camera from showing anything outside the framed
// map.
//
// At high zoom:
//
//     camera stops at the map edges.
//
// At minimum zoom:
//
//     the map is centered.
//
// ============================================================

export function clampCamera(
    canvas
) {

    const bounds =
        getFrameBounds();


    const visibleWidth =
        canvas.width /
        camera.zoom;


    const visibleHeight =
        canvas.height /
        camera.zoom;


    const frameWidth =
        bounds.right -
        bounds.left;


    const frameHeight =
        bounds.bottom -
        bounds.top;


    // ========================================================
    // HORIZONTAL
    // ========================================================

    if (
        visibleWidth >=
        frameWidth
    ) {

        camera.x =
            bounds.left -
            (
                visibleWidth -
                frameWidth
            ) / 2;

    }

    else {

        const minX =
            bounds.left;


        const maxX =
            bounds.right -
            visibleWidth;


        camera.x =
            Math.max(
                minX,
                Math.min(
                    camera.x,
                    maxX
                )
            );

    }


    // ========================================================
    // VERTICAL
    // ========================================================

    if (
        visibleHeight >=
        frameHeight
    ) {

        camera.y =
            bounds.top -
            (
                visibleHeight -
                frameHeight
            ) / 2;

    }

    else {

        const minY =
            bounds.top;


        const maxY =
            bounds.bottom -
            visibleHeight;


        camera.y =
            Math.max(
                minY,
                Math.min(
                    camera.y,
                    maxY
                )
            );

    }

}


// ============================================================
// RESIZE
// ============================================================

export function resizeCamera(
    canvas
) {

    canvas.width =
        window.innerWidth;


    canvas.height =
        window.innerHeight;


    updateMinimumZoom(
        canvas
    );


    // --------------------------------------------------------
    // Make sure zoom is legal.
    // --------------------------------------------------------

    camera.zoom =
        Math.max(
            camera.zoom,
            MIN_ZOOM
        );


    camera.zoom =
        Math.min(
            camera.zoom,
            MAX_ZOOM
        );


    clampCamera(
        canvas
    );

}


// ============================================================
// RESET / FIT MAP
// ============================================================
//
// Useful when the map has just been loaded.
//
// This guarantees that the initial view is the complete map
// rather than inheriting an old camera position or zoom.
//
// ============================================================

export function fitMap(
    canvas
) {

    updateMinimumZoom(
        canvas
    );


    camera.zoom =
        MIN_ZOOM;


    centerCamera(
        canvas
    );


    clampCamera(
        canvas
    );

}


// ============================================================
// ZOOM
// ============================================================
//
// Zooms toward the mouse cursor.
//
// The world position underneath the cursor remains fixed.
//
// ============================================================

export function zoomCamera(
    canvas,
    event
) {

    const rect =
        canvas.getBoundingClientRect();


    const mouseX =
        event.clientX -
        rect.left;


    const mouseY =
        event.clientY -
        rect.top;


    // --------------------------------------------------------
    // World coordinate under cursor BEFORE zoom.
    // --------------------------------------------------------

    const before =
        screenToWorld(
            mouseX,
            mouseY
        );


    // --------------------------------------------------------
    // Apply zoom.
    // --------------------------------------------------------

    if (
        event.deltaY < 0
    ) {

        camera.zoom *=
            1.1;

    }

    else {

        camera.zoom *=
            0.9;

    }


    // --------------------------------------------------------
    // Enforce zoom limits.
    // --------------------------------------------------------

    camera.zoom =
        Math.max(
            MIN_ZOOM,
            Math.min(
                MAX_ZOOM,
                camera.zoom
            )
        );


    // --------------------------------------------------------
    // World coordinate under cursor AFTER zoom.
    // --------------------------------------------------------

    const after =
        screenToWorld(
            mouseX,
            mouseY
        );


    // --------------------------------------------------------
    // Compensate camera position.
    // --------------------------------------------------------

    camera.x +=
        before.x -
        after.x;


    camera.y +=
        before.y -
        after.y;


    // --------------------------------------------------------
    // Make absolutely sure we remain inside the map.
    // --------------------------------------------------------

    clampCamera(
        canvas
    );

}


// ============================================================
// PAN
// ============================================================

export function panCamera(
    canvas,
    dx,
    dy
) {

    camera.x -=
        dx /
        camera.zoom;


    camera.y -=
        dy /
        camera.zoom;


    clampCamera(
        canvas
    );

}
