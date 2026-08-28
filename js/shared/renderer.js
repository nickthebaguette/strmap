// ============================================================
// RENDERER.JS
// ============================================================

import {
    tiles,
    countries,
    hexToWorld,
    MAP_WIDTH,
    MAP_HEIGHT,
    COLS,
    ROWS
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
// VISUAL SETTINGS
// ============================================================

const HEX_SIZE = 14;

const HEX_BORDER_WIDTH = 0.7;

const COUNTRY_BORDER_WIDTH = 2.2;

const COUNTRY_BORDER_ALPHA = 0.9;


// ============================================================
// TEXTURES
// ============================================================

// ------------------------------------------------------------
// Base textures
// ------------------------------------------------------------

const parchmentTexture =
    new Image();

const waterTexture =
    new Image();


// ------------------------------------------------------------
// Terrain textures
// ------------------------------------------------------------

const terrainTextures = {

    plains:
        new Image(),

    forest:
        new Image(),

    hills:
        new Image(),

    mountains:
        new Image(),

    desert:
        new Image(),

    swamp:
        new Image()

};


// ============================================================
// TEXTURE LOADING STATE
// ============================================================

let parchmentLoaded =
    false;

let waterLoaded =
    false;


const terrainLoaded = {

    plains: false,

    forest: false,

    hills: false,

    mountains: false,

    desert: false,

    swamp: false

};


// ============================================================
// TEXTURE PATHS
// ============================================================

parchmentTexture.src =
    "assets/textures/parchment.png";

waterTexture.src =
    "assets/textures/water.png";


terrainTextures.plains.src =
    "assets/textures/terrain/plains.png";

terrainTextures.forest.src =
    "assets/textures/terrain/forest.png";

terrainTextures.hills.src =
    "assets/textures/terrain/hills.png";

terrainTextures.mountains.src =
    "assets/textures/terrain/mountains.png";

terrainTextures.desert.src =
    "assets/textures/terrain/desert.png";

terrainTextures.swamp.src =
    "assets/textures/terrain/swamp.png";


// ============================================================
// BASE TEXTURE EVENTS
// ============================================================

parchmentTexture.onload =
    () => {

        parchmentLoaded =
            true;

        rebuildMapCanvas();

    };


parchmentTexture.onerror =
    () => {

        console.warn(
            "Could not load parchment texture. Using flat colors."
        );

        parchmentLoaded =
            false;

    };


waterTexture.onload =
    () => {

        waterLoaded =
            true;

        rebuildMapCanvas();

    };


waterTexture.onerror =
    () => {

        console.warn(
            "Could not load water texture. Using flat colors."
        );

        waterLoaded =
            false;

    };


// ============================================================
// TERRAIN TEXTURE EVENTS
// ============================================================

for (
    const terrain
    of Object.keys(
        terrainTextures
    )
) {

    terrainTextures[terrain].onload =
        () => {

            terrainLoaded[terrain] =
                true;

            rebuildMapCanvas();

        };


    terrainTextures[terrain].onerror =
        () => {

            console.warn(
                `Could not load terrain texture: ${terrain}`
            );

            terrainLoaded[terrain] =
                false;

        };

}


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
    baseTexture,
    terrainTexture
) {

    // ========================================================
    // BASE HEX
    // ========================================================

    createHexPath(
        context,
        x,
        y,
        size
    );


    context.fillStyle =
        color;

    context.fill();


    // ========================================================
    // BASE TEXTURE
    // ========================================================

    if (
        baseTexture
    ) {

        const pattern =
            context.createPattern(
                baseTexture,
                "repeat"
            );


        if (
            pattern
        ) {

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


    // ========================================================
    // TERRAIN TEXTURE
    // ========================================================

    if (
        terrainTexture
    ) {

        const pattern =
            context.createPattern(
                terrainTexture,
                "repeat"
            );


        if (
            pattern
        ) {

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
                pattern;

            context.fill();

            context.restore();

        }

    }


    // ========================================================
    // NORMAL HEX BORDER
    // ========================================================

    createHexPath(
        context,
        x,
        y,
        size
    );


    context.strokeStyle =
        "#30302d";

    context.lineWidth =
        HEX_BORDER_WIDTH;

    context.stroke();

}


// ============================================================
// DRAW POLITICAL BORDERS
// ============================================================
//
// Political borders are derived from map ownership.
//
// A border is drawn when:
//
//     tile.owner !== neighbor.owner
//
// AND:
//
//     neither tile is ocean.
//
// Each shared edge receives TWO colored halves:
//
//     COUNTRY A | COUNTRY B
//
// This gives the frontier a two-sided cartographic appearance.
//
// ============================================================

function drawCountryBorders() {

    mapCtx.save();


    mapCtx.globalAlpha =
        COUNTRY_BORDER_ALPHA;


    // --------------------------------------------------------
    // Directions
    // --------------------------------------------------------
    //
    // Hexes use odd-row offset coordinates.
    //
    // Neighbor coordinates depend on whether the current row
    // is even or odd.
    //
    // Each tile only checks three directions.
    //
    // This prevents drawing the same border twice.
    //
    // --------------------------------------------------------

    for (
        const tile
        of tiles
    ) {

        if (
            tile.owner === "ocean"
        ) {

            continue;

        }


        const rowIsOdd =
            tile.row % 2 !== 0;


        const neighbors =
            rowIsOdd

                ? [

                    // upper-left
                    {
                        col:
                            tile.col,

                        row:
                            tile.row - 1
                    },

                    // upper-right
                    {
                        col:
                            tile.col + 1,

                        row:
                            tile.row - 1
                    },

                    // right
                    {
                        col:
                            tile.col + 1,

                        row:
                            tile.row
                    }

                ]

                : [

                    // upper-left
                    {
                        col:
                            tile.col - 1,

                        row:
                            tile.row - 1
                    },

                    // upper-right
                    {
                        col:
                            tile.col,

                        row:
                            tile.row - 1
                    },

                    // right
                    {
                        col:
                            tile.col + 1,

                        row:
                            tile.row
                    }

                ];


        for (
            let direction = 0;

            direction <
            neighbors.length;

            direction++
        ) {

            const neighbor =
                neighbors[
                    direction
                ];


            // ------------------------------------------------
            // Check map bounds
            // ------------------------------------------------

            if (
                neighbor.col < 0 ||
                neighbor.col >= COLS ||
                neighbor.row < 0 ||
                neighbor.row >= ROWS
            ) {

                continue;

            }


            const neighborTile =
                tiles[
                    neighbor.row * COLS +
                    neighbor.col
                ];


            if (
                !neighborTile
            ) {

                continue;

            }


            // ------------------------------------------------
            // Ignore ocean borders
            // ------------------------------------------------

            if (
                neighborTile.owner === "ocean"
            ) {

                continue;

            }


            // ------------------------------------------------
            // Same country = no political border
            // ------------------------------------------------

            if (
                neighborTile.owner ===
                tile.owner
            ) {

                continue;

            }


            // ------------------------------------------------
            // Draw shared edge
            // ------------------------------------------------

            drawSharedBorder(
                tile,
                neighborTile,
                direction
            );

        }

    }


    mapCtx.restore();

}


// ============================================================
// DRAW SHARED BORDER
// ============================================================
//
// Draws a two-colored border along the shared edge.
//
// The line is drawn in two halves:
//
//     country A color
//              |
//     country B color
//
// ============================================================

function drawSharedBorder(
    tile,
    neighborTile,
    direction
) {

    const a =
        hexToWorld(
            tile.col,
            tile.row
        );


    const b =
        hexToWorld(
            neighborTile.col,
            neighborTile.row
        );


    // --------------------------------------------------------
    // Determine shared edge endpoints
    // --------------------------------------------------------

    let start;
    let end;


    // ========================================================
    // RIGHT EDGE
    // ========================================================

    if (
        direction === 2
    ) {

        start = {

            x:
                a.x +
                HEX_SIZE *
                Math.cos(
                    -Math.PI / 6
                ),

            y:
                a.y +
                HEX_SIZE *
                Math.sin(
                    -Math.PI / 6
                )

        };


        end = {

            x:
                a.x +
                HEX_SIZE *
                Math.cos(
                    Math.PI / 6
                ),

            y:
                a.y +
                HEX_SIZE *
                Math.sin(
                    Math.PI / 6
                )

        };

    }


    // ========================================================
    // UPPER-LEFT
    // ========================================================

    else if (
        direction === 0
    ) {

        start = {

            x:
                a.x +
                HEX_SIZE *
                Math.cos(
                    -5 * Math.PI / 6
                ),

            y:
                a.y +
                HEX_SIZE *
                Math.sin(
                    -5 * Math.PI / 6
                )

        };


        end = {

            x:
                a.x +
                HEX_SIZE *
                Math.cos(
                    -Math.PI / 2
                ),

            y:
                a.y +
                HEX_SIZE *
                Math.sin(
                    -Math.PI / 2
                )

        };

    }


    // ========================================================
    // UPPER-RIGHT
    // ========================================================

    else {

        start = {

            x:
                a.x +
                HEX_SIZE *
                Math.cos(
                    -Math.PI / 2
                ),

            y:
                a.y +
                HEX_SIZE *
                Math.sin(
                    -Math.PI / 2
                )

        };


        end = {

            x:
                a.x +
                HEX_SIZE *
                Math.cos(
                    -Math.PI / 6
                ),

            y:
                a.y +
                HEX_SIZE *
                Math.sin(
                    -Math.PI / 6
                )

        };

    }


    // --------------------------------------------------------
    // Midpoint
    // --------------------------------------------------------

    const midpoint = {

        x:
            (start.x + end.x) / 2,

        y:
            (start.y + end.y) / 2

    };


    // --------------------------------------------------------
    // First half
    // --------------------------------------------------------

    drawBorderSegment(

        start,

        midpoint,

        countries[
            tile.owner
        ].color

    );


    // --------------------------------------------------------
    // Second half
    // --------------------------------------------------------

    drawBorderSegment(

        midpoint,

        end,

        countries[
            neighborTile.owner
        ].color

    );

}


// ============================================================
// DRAW BORDER SEGMENT
// ============================================================

function drawBorderSegment(
    start,
    end,
    color
) {

    mapCtx.beginPath();


    mapCtx.moveTo(
        start.x,
        start.y
    );


    mapCtx.lineTo(
        end.x,
        end.y
    );


    mapCtx.strokeStyle =
        color;


    mapCtx.lineWidth =
        COUNTRY_BORDER_WIDTH;


    mapCtx.lineCap =
        "butt";


    mapCtx.stroke();

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
        const tile
        of tiles
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


        // ====================================================
        // TERRAIN
        // ====================================================

        const terrain =
            getTerrain(
                tile
            );


        // ====================================================
        // BASE TEXTURE
        // ====================================================

        let baseTexture =
            null;


        if (
            tile.owner === "ocean"
        ) {

            if (
                waterLoaded
            ) {

                baseTexture =
                    waterTexture;

            }

        }

        else {

            if (
                parchmentLoaded
            ) {

                baseTexture =
                    parchmentTexture;

            }

        }


        // ====================================================
        // TERRAIN TEXTURE
        // ====================================================

        let terrainTexture =
            null;


        if (
            terrain !== "water" &&
            terrainLoaded[terrain]
        ) {

            terrainTexture =
                terrainTextures[
                    terrain
                ];

        }


        // ====================================================
        // DRAW TILE
        // ====================================================

        drawHexOnContext(

            mapCtx,

            world.x,
            world.y,

            HEX_SIZE,

            country.color,

            baseTexture,

            terrainTexture

        );

    }


    // ========================================================
    // POLITICAL BORDERS
    // ========================================================

    drawCountryBorders();


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
    // CITIES
    // ========================================================

    drawCities(ctx);


    // ========================================================
    // ARMIES
    // ========================================================

    drawArmies(ctx);


    // ========================================================
    // OUTER BORDER
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
