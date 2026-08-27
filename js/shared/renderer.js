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


// ============================================================
// MAP CANVAS
// ============================================================

export const mapCanvas =
    document.createElement("canvas");

export const mapCtx =
    mapCanvas.getContext("2d");


// ============================================================
// TEXTURES
// ============================================================

const parchmentTexture =
    new Image();

const waterTexture =
    new Image();


parchmentTexture.src =
    "assets/textures/parchment.png";

waterTexture.src =
    "assets/textures/water.png";


let texturesLoaded = false;


// Wait until both textures are available.

Promise.all([

    new Promise(resolve => {

        parchmentTexture.onload =
            resolve;

        parchmentTexture.onerror =
            resolve;

    }),

    new Promise(resolve => {

        waterTexture.onload =
            resolve;

        waterTexture.onerror =
            resolve;

    })

]).then(() => {

    texturesLoaded = true;

    rebuildMapCanvas();

});


// ============================================================
// HEX PATH
// ============================================================

function createHexPath(
    context,
    x,
    y,
    size
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


        if (
            i === 0
        ) {

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

}


// ============================================================
// DRAW HEX
// ============================================================

function drawHexOnContext(
    context,
    x,
    y,
    size,
    color,
    texture
) {

    // --------------------------------------------------------
    // HEX PATH
    // --------------------------------------------------------

    createHexPath(
        context,
        x,
        y,
        size
    );


    // --------------------------------------------------------
    // TEXTURE
    // --------------------------------------------------------

    if (
        texture &&
        texture.complete &&
        texture.naturalWidth > 0
    ) {

        context.save();


        // Use the hex as a clipping mask.

        context.clip();


        // ----------------------------------------------------
        // Draw texture using world coordinates.
        //
        // This keeps the texture continuous across
        // neighboring hexes.
        // ----------------------------------------------------

        const pattern =
            context.createPattern(
                texture,
                "repeat"
            );


        if (pattern) {

            context.fillStyle =
                pattern;


            context.fillRect(

                -x,

                -y,

                MAP_WIDTH +
                100,

                MAP_HEIGHT +
                100

            );

        }


        context.restore();

    }

    else {

        // Fallback if texture hasn't loaded.

        context.fillStyle =
            color;

        context.fill();

    }


    // --------------------------------------------------------
    // COUNTRY COLOUR OVERLAY
    // --------------------------------------------------------

    createHexPath(
        context,
        x,
        y,
        size
    );


    context.save();


    context.globalAlpha =
        0.45;


    context.fillStyle =
        color;

    context.fill();


    context.restore();


    // --------------------------------------------------------
    // HEX OUTLINE
    // --------------------------------------------------------

    createHexPath(
        context,
        x,
        y,
        size
    );


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


    // --------------------------------------------------------
    // MAP TILES
    // --------------------------------------------------------

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


        // Ocean uses water texture.

        if (
            tile.owner ===
            "ocean"
        ) {

            drawHexOnContext(

                mapCtx,

                world.x,
                world.y,

                14,

                country.color,

                waterTexture

            );

        }

        // Everything else uses parchment.

        else {

            drawHexOnContext(

                mapCtx,

                world.x,
                world.y,

                14,

                country.color,

                parchmentTexture

            );

        }

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


    // ========================================================
    // CAMERA
    // ========================================================

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


    // ========================================================
    // FRAME
    // ========================================================

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


    // ========================================================
    // MAP
    // ========================================================

    ctx.drawImage(

        mapCanvas,

        -FRAME_OVERHANG,

        -FRAME_OVERHANG

    );


    // ========================================================
    // ENTITIES
    // ========================================================

    drawCities(ctx);

    drawArmies(ctx);


    // ========================================================
    // FRAME BORDER
    // ========================================================

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
