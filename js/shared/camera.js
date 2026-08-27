// ============================================================
// CAMERA.JS
// Shared camera system
// ============================================================

import {
    MAP_WIDTH,
    MAP_HEIGHT
} from "./map.js";


export const FRAME_OVERHANG = 14 * 0.5;

export const FRAME_WIDTH = 7;

export const FRAME_COLOR =
    "#252522";


export const camera = {

    x: 0,

    y: 0,

    zoom: 0.55

};


export let MIN_ZOOM = 0.55;

export const MAX_ZOOM = 3.0;


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
            (x - camera.x) *
            camera.zoom,

        y:
            (y - camera.y) *
            camera.zoom

    };

}


// ============================================================
// MINIMUM ZOOM
// ============================================================

export function updateMinimumZoom(
    canvas
) {

    const frameWidth =
        MAP_WIDTH +
        FRAME_OVERHANG * 2;

    const frameHeight =
        MAP_HEIGHT +
        FRAME_OVERHANG * 2;


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
// CLAMP
// ============================================================

export function clampCamera(
    canvas
) {

    const visibleWidth =
        canvas.width /
        camera.zoom;

    const visibleHeight =
        canvas.height /
        camera.zoom;


    const frameLeft =
        -FRAME_OVERHANG;

    const frameTop =
        -FRAME_OVERHANG;

    const frameRight =
        MAP_WIDTH +
        FRAME_OVERHANG;

    const frameBottom =
        MAP_HEIGHT +
        FRAME_OVERHANG;


    const frameWidth =
        frameRight -
        frameLeft;

    const frameHeight =
        frameBottom -
        frameTop;


    if (
        visibleWidth >= frameWidth
    ) {

        camera.x =
            frameLeft -
            (
                visibleWidth -
                frameWidth
            ) / 2;

    }

    else {

        const minX =
            frameLeft;

        const maxX =
            frameRight -
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


    if (
        visibleHeight >= frameHeight
    ) {

        camera.y =
            frameTop -
            (
                visibleHeight -
                frameHeight
            ) / 2;

    }

    else {

        const minY =
            frameTop;

        const maxY =
            frameBottom -
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

        camera.zoom *= 1.1;

    }

    else {

        camera.zoom *= 0.9;

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
        dx / camera.zoom;

    camera.y -=
        dy / camera.zoom;


    clampCamera(
        canvas
    );

}
