// ============================================================
// RENDERER.JS
// ============================================================

import {
    tiles,
    countries,
    hexToWorld,
    MAP_WIDTH,
    MAP_HEIGHT
} from "./map.js";

import {
    FRAME_OVERHANG,
    FRAME_WIDTH,
    FRAME_COLOR,
    camera
} from "./camera.js";

import {
    drawCities
} from "./cities.js";

import {
    drawArmies
} from "./armies.js";


export const mapCanvas =
    document.createElement("canvas");

export const mapCtx =
    mapCanvas.getContext("2d");


// ============================================================
// HEX
// ============================================================

function drawHexOnContext(
    context,
    x,
    y,
    size,
    color
) {

    context.beginPath();


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const angle =
            Math.PI / 180 *
            (60 * i - 30);


        const px =
            x +
            size *
            Math.cos(angle);

        const py =
            y +
            size *
            Math.sin(angle);


        if (i === 0) {

            context.moveTo(
                px,
                py
            );

        }

        else {

            context.lineTo(
                px,
                py
            );

        }

    }


    context.closePath();

    context.fillStyle =
        color;

    context.fill();

    context.strokeStyle =
        "#30302d";

    context.lineWidth =
        0.7;

    context.stroke();

}


// ============================================================
// MAP CACHE
// ============================================================

export function rebuildMapCanvas() {

    mapCanvas.width =
        Math.ceil(
            MAP_WIDTH +
            FRAME_OVERHANG * 2
        );

    mapCanvas.height =
        Math.ceil(
            MAP_HEIGHT +
            FRAME_OVERHANG * 2
        );


    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
    );


    mapCtx.save();


    mapCtx.translate(
        FRAME_OVERHANG,
        FRAME_OVERHANG
    );


    for (
        const tile of tiles
    ) {

        const world =
            hexToWorld(
                tile.col,
                tile.row
            );


        const country =
            countries[
                tile.owner
            ];


        if (!country) {

            continue;

        }


        drawHexOnContext(

            mapCtx,

            world.x,
            world.y,

            14,

            country.color

        );

    }


    mapCtx.restore();

}


// ============================================================
// DRAW
// ============================================================

export function draw(
    ctx,
    canvas
) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();


    ctx.translate(

        -camera.x *
        camera.zoom,

        -camera.y *
        camera.zoom

    );


    ctx.scale(
        camera.zoom,
        camera.zoom
    );


    // FRAME

    ctx.fillStyle =
        FRAME_COLOR;


    ctx.fillRect(

        -FRAME_OVERHANG,

        -FRAME_OVERHANG,

        MAP_WIDTH +
        FRAME_OVERHANG * 2,

        MAP_HEIGHT +
        FRAME_OVERHANG * 2

    );


    // MAP

    ctx.drawImage(

        mapCanvas,

        -FRAME_OVERHANG,

        -FRAME_OVERHANG

    );


    // ENTITIES

    drawCities(ctx);

    drawArmies(ctx);


    // BORDER

    ctx.strokeStyle =
        FRAME_COLOR;

    ctx.lineWidth =
        FRAME_WIDTH /
        camera.zoom;


    ctx.strokeRect(

        -FRAME_OVERHANG,

        -FRAME_OVERHANG,

        MAP_WIDTH +
        FRAME_OVERHANG * 2,

        MAP_HEIGHT +
        FRAME_OVERHANG * 2

    );


    ctx.restore();

}
