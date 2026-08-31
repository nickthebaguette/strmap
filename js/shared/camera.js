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

export const FRAME_OVERHANG =
    HEX_SIZE * 0.5;

export const FRAME_WIDTH =
    8;

export const FRAME_COLOR =
    "#3a3a36";


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
// GET DPR
// ============================================================

export function getDPR() {

    return window.devicePixelRatio || 1;

}


// ============================================================
// SCREEN → WORLD
// ============================================================
//
// Converts screen (CSS pixel) coordinates to world
// coordinates.
//
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
// MINIMUM ZOOM
// ============================================================
//
// Uses window.innerWidth/innerHeight (CSS pixels) since
// mouse coordinates and canvas display size are in CSS
// pixels.
//
// ============================================================

export function updateMinimumZoom() {

    const bounds =
        getCameraBounds();


    const frameWidth =
        bounds.right -
        bounds.left;


    const frameHeight =
        bounds.bottom -
        bounds.top;


    const zoomX =
        window.innerWidth /
        frameWidth;


    const zoomY =
        window.innerHeight /
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
//
// Uses window.innerWidth/innerHeight (CSS pixels).
//
// ============================================================

export function clampCamera() {

    const visibleWidth =
        window.innerWidth /
        camera.zoom;


    const visibleHeight =
        window.innerHeight /
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

export function resizeCamera(
    canvas
) {

    const DPR =
        getDPR();


    const logicalWidth =
        window.innerWidth;


    const logicalHeight =
        window.innerHeight;


    // --------------------------------------------------------
    // Set canvas backing store (physical pixels)
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
    // Update camera
    // --------------------------------------------------------

    updateMinimumZoom();


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


    clampCamera();

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


    clampCamera();

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


    clampCamera();

}
