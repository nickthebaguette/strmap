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

import {
    getTerrain
} from "./terrain.js";


// ============================================================
// CANVAS
// ============================================================

export const mapCanvas =
    document.createElement("canvas");

export const mapCtx =
    mapCanvas.getContext("2d");


// ============================================================
// TEXTURES
// ============================================================
//
// Keep visual assets inside the renderer.
//
// If a texture fails to load, the renderer simply falls
// back to the normal country color.
//

const parchmentTexture =
    new Image();

const waterTexture =
    new Image();


// Track whether each texture successfully loaded.

let parchmentLoaded = false;
let waterLoaded = false;


// ------------------------------------------------------------
// Texture paths
// ------------------------------------------------------------

parchmentTexture.src =
    "assets/textures/parchment.png";

waterTexture.src =
    "assets/textures/water.png";


// ------------------------------------------------------------
// Texture loading
// ------------------------------------------------------------

parchmentTexture.onload = () => {

    parchmentLoaded = true;

    rebuildMapCanvas();

};


waterTexture.onload = () => {

    waterLoaded = true;

    rebuildMapCanvas();

};


// If an image fails to load, DON'T break the map.

parchmentTexture.onerror = () => {

    console.warn(
        "Could not load parchment texture. Using flat colors."
    );

    parchmentLoaded = false;

};


waterTexture.onerror = () => {

    console.warn(
        "Could not load water texture. Using flat colors."
    );

    waterLoaded = false;

};


// ============================================================
// HEX
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
    // Create hex shape
    // --------------------------------------------------------

    createHexPath(
        context,
        x,
        y,
        size
    );


    // --------------------------------------------------------
    // Base color
    // --------------------------------------------------------
    //
    // This is ALWAYS drawn first.
    //
    // That means even if the texture is missing, the map
    // remains visible.
    //

    context.fillStyle =
        color;

    context.fill();


    // --------------------------------------------------------
    // Texture
    // --------------------------------------------------------

    if (
        texture
    ) {

        const pattern =
            context.createPattern(
                texture,
                "repeat"
            );


        if (
            pattern
        ) {

            // Recreate the hex path because fill()
            // consumed the previous path.

            createHexPath(
                context,
                x,
                y,
                size
            );


            context.save();

            context.globalAlpha =
                0.55;

            context.fillStyle =
                pattern;

            context.fill();

            context.restore();

        }

    }


    // --------------------------------------------------------
    // Border
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


    // ========================================================
    // DRAW TILES
    // ========================================================

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


        if (
            !country
        ) {

            continue;

        }


        // ----------------------------------------------------
        // Choose texture
        // ----------------------------------------------------

        let texture = null;


        if (
            tile.owner === "ocean"
        ) {

            if (
                waterLoaded
            ) {

                texture =
                    waterTexture;

            }

        }

        else {

            if (
                parchmentLoaded
            ) {

                texture =
                    parchmentTexture;

            }

        }


        // ----------------------------------------------------
        // Draw
        // ----------------------------------------------------

        drawHexOnContext(

            mapCtx,

            world.x,
            world.y,

            14,

            country.color,

            texture

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
    // BORDER
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
