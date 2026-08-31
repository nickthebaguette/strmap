// ============================================================
// CAMERA.JS
// Shared camera system
// ============================================================

import {
    MAP_WIDTH,
    MAP_HEIGHT,
    HEX_SIZE
} from "./map.js";


// ============================================================
// FRAME
// ============================================================

// Inner frame around the actual map.

export const FRAME_OVERHANG =
    HEX_SIZE * 0.5;

export const FRAME_WIDTH =
    8;

export const FRAME_COLOR =
    "#3a3a36";


// Outer frame.
//
// This covers one full hex worth of empty space around the
// complete map footprint.

export const OUTER_FRAME_OVERHANG =
    HEX_SIZE;


// ============================================================
// CAMERA
// ============================================================

export const camera = {

    x: 0,

    y: 0,

    zoom: 0.55

};


export let MIN_ZOOM =
    0.55;

export const MAX_ZOOM =
    3.0;


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
// CAMERA BOUNDS
// ============================================================

export function getCameraBounds() {

    return {

        left:
            -OUTER_FRAME_OVERHANG,

        top:
            -OUTER_FRAME_OVERHANG,

        right:
            MAP_WIDTH +
            OUTER_FRAME_OVERHANG,

        bottom:
            MAP_HEIGHT +
            OUTER_FRAME_OVERHANG

    };

}


// ============================================================
// GET LOGICAL SIZE
// ============================================================
//
// Returns the logical (CSS pixel) dimensions of the canvas.
//
// We use logical dimensions for all camera calculations
// because mouse coordinates are in CSS pixels.
//
// The canvas backing store (canvas.width/height) uses
// physical pixels, which can vary between monitors.
//
// ============================================================

function getLogicalSize(
    canvas
) {

    return {

        width:
            canvas.logicalWidth ||
            canvas.width,

        height:
            canvas.logicalHeight ||
            canvas.height

    };

}


// ============================================================
// MINIMUM ZOOM
// ============================================================

export function updateMinimumZoom(
    canvas
) {

    const bounds =
        getCameraBounds();


    const frameWidth =
        bounds.right -
        bounds.left;


    const frameHeight =
        bounds.bottom -
        bounds.top;


    const logical =
        getLogicalSize(canvas);


    const zoomX =
        logical.width /
        frameWidth;


    const zoomY =
        logical.height /
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
// CLAMP CAMERA
// ============================================================

export function clampCamera(
    canvas
) {

    const logical =
        getLogicalSize(canvas);


    const visibleWidth =
        logical.width /
        camera.zoom;


    const visibleHeight =
        logical.height /
        camera.zoom;


    const bounds =
        getCameraBounds();


    const frameWidth =
        bounds.right -
        bounds.left;


    const frameHeight =
        bounds.bottom -
        bounds.top;


    // --------------------------------------------------------
    // HORIZONTAL
    // --------------------------------------------------------

    if (
        visibleWidth >= frameWidth
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


    // --------------------------------------------------------
    // VERTICAL
    // --------------------------------------------------------

    if (
        visibleHeight >= frameHeight
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
//
// Called when the window resizes or when the device pixel
// ratio changes (e.g., moving between monitors).
//
// ============================================================

export function resizeCamera(
    canvas
) {

    const DPR =
        window.devicePixelRatio || 1;


    const logicalWidth =
        window.innerWidth;


    const logicalHeight =
        window.innerHeight;


    // --------------------------------------------------------
    // Set canvas backing store size (physical pixels)
    // --------------------------------------------------------

    canvas.width =
        Math.round(
            logicalWidth * DPR
        );


    canvas.height =
        Math.round(
            logicalHeight * DPR
        );


    // --------------------------------------------------------
    // Set canvas CSS size (logical pixels)
    // --------------------------------------------------------

    canvas.style.width =
        logicalWidth + "px";


    canvas.style.height =
        logicalHeight + "px";


    // --------------------------------------------------------
    // Store logical dimensions for camera calculations
    // --------------------------------------------------------

    canvas.logicalWidth =
        logicalWidth;


    canvas.logicalHeight =
        logicalHeight;


    // --------------------------------------------------------
    // Update camera
    // --------------------------------------------------------

    updateMinimumZoom(
        canvas
    );


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
// ZOOM
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


    const before =
        screenToWorld(
            mouseX,
            mouseY
        );


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


    camera.zoom =
        Math.max(
            MIN_ZOOM,
            Math.min(
                MAX_ZOOM,
                camera.zoom
            )
        );


    const after =
        screenToWorld(
            mouseX,
            mouseY
        );


    camera.x +=
        before.x -
        after.x;


    camera.y +=
        before.y -
        after.y;


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
