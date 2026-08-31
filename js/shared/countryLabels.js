// ============================================================
// COUNTRYLABELS.JS
// ============================================================
//
// Draws country name labels on the map.
//
// Labels are only shown when zoomed out (camera.zoom < 0.7).
//
// Only major powers are labeled.
//
// The label appears in the center of the largest contiguous
// land region of the country.
//
// ============================================================

import {
    tiles,
    countries,
    hexToWorld,
    HEX_SIZE,
    COLS,
    ROWS
} from "./map.js";

import {
    camera
} from "./camera.js";


// ============================================================
// MAJOR POWERS TO LABEL
// ============================================================

const LABEL_COUNTRIES = new Set([

    "france",
    "spain",
    "britain",
    "russia",
    "austria",
    "prussia",
    "sweden",
    "ottoman"

]);


// ============================================================
// ZOOM THRESHOLD
// ============================================================

const LABEL_MAX_ZOOM = 0.7;


// ============================================================
// MINIMUM TILES FOR LABEL
// ============================================================

const MIN_TILES_FOR_LABEL = 20;


// ============================================================
// GET COUNTRY TILES
// ============================================================

function getCountryLandTiles(
    countryId
) {

    const countryTiles = [];


    for (
        const tile of tiles
    ) {

        if (
            tile.owner === countryId &&
            tile.owner !== "ocean"
        ) {

            countryTiles.push(tile);

        }

    }


    return countryTiles;

}


// ============================================================
// GET NEIGHBOURING TILES
// ============================================================

function getNeighbouringTiles(
    tile
) {

    const neighbours = [];


    const even =
        tile.row % 2 === 0;


    const directions = [

        { col: 1, row: 0 },

        even
            ? { col: 0, row: 1 }
            : { col: 1, row: 1 },

        even
            ? { col: -1, row: 1 }
            : { col: 0, row: 1 },

        { col: -1, row: 0 },

        even
            ? { col: -1, row: -1 }
            : { col: 0, row: -1 },

        even
            ? { col: 0, row: -1 }
            : { col: 1, row: -1 }

    ];


    for (
        const direction
        of directions
    ) {

        const newCol =
            tile.col + direction.col;


        const newRow =
            tile.row + direction.row;


        if (
            newCol < 0 ||
            newCol >= COLS ||
            newRow < 0 ||
            newRow >= ROWS
        ) {

            continue;

        }


        const neighbour =
            tiles[newRow * COLS + newCol];


        if (
            neighbour &&
            neighbour.owner === tile.owner
        ) {

            neighbours.push(neighbour);

        }

    }


    return neighbours;

}


// ============================================================
// FIND LARGEST CONTIGUOUS REGION
// ============================================================

function findLargestRegion(
    countryTiles
) {

    if (
        countryTiles.length === 0
    ) {

        return null;

    }


    const visited = new Set();

    let largestRegion = null;

    let largestSize = 0;


    for (
        const startTile
        of countryTiles
    ) {

        const key =
            `${startTile.col},${startTile.row}`;


        if (
            visited.has(key)
        ) {

            continue;

        }


        const region = [];

        const stack = [startTile];

        visited.add(key);


        while (
            stack.length > 0
        ) {

            const currentTile =
                stack.pop();


            region.push(currentTile);


            const neighbours =
                getNeighbouringTiles(
                    currentTile
                );


            for (
                const neighbour
                of neighbours
            ) {

                const neighbourKey =
                    `${neighbour.col},${neighbour.row}`;


                if (
                    !visited.has(neighbourKey)
                ) {

                    visited.add(neighbourKey);

                    stack.push(neighbour);

                }

            }

        }


        if (
            region.length > largestSize
        ) {

            largestSize = region.length;

            largestRegion = region;

        }

    }


    return largestRegion;

}


// ============================================================
// CALCULATE CENTER
// ============================================================

function calculateCenter(
    region
) {

    let totalX = 0;

    let totalY = 0;


    for (
        const tile of region
    ) {

        const world =
            hexToWorld(
                tile.col,
                tile.row
            );


        totalX += world.x;

        totalY += world.y;

    }


    return {

        x:
            totalX / region.length,

        y:
            totalY / region.length

    };

}


// ============================================================
// CALCULATE BOUNDING BOX
// ============================================================

function calculateBoundingBox(
    region
) {

    let minCol = Infinity;

    let maxCol = -Infinity;

    let minRow = Infinity;

    let maxRow = -Infinity;


    for (
        const tile of region
    ) {

        if (tile.col < minCol) minCol = tile.col;

        if (tile.col > maxCol) maxCol = tile.col;

        if (tile.row < minRow) minRow = tile.row;

        if (tile.row > maxRow) maxRow = tile.row;

    }


    return {

        minCol,
        maxCol,
        minRow,
        maxRow,

        width:
            maxCol - minCol + 1,

        height:
            maxRow - minRow + 1

    };

}


// ============================================================
// GET LABEL INFO
// ============================================================

function getLabelInfo(
    countryId
) {

    const countryTiles =
        getCountryLandTiles(countryId);


    if (
        countryTiles.length <
        MIN_TILES_FOR_LABEL
    ) {

        return null;

    }


    const largestRegion =
        findLargestRegion(countryTiles);


    if (
        !largestRegion ||
        largestRegion.length <
        MIN_TILES_FOR_LABEL
    ) {

        return null;

    }


    const fragmentationRatio =
        largestRegion.length /
        countryTiles.length;


    if (
        fragmentationRatio < 0.6
    ) {

        return null;

    }


    const center =
        calculateCenter(largestRegion);


    const boundingBox =
        calculateBoundingBox(largestRegion);


    const fontSize =
        Math.max(

            18,

            Math.min(
                48,
                boundingBox.width *
                HEX_SIZE *
                0.12
            )

        );


    const country =
        countries[countryId];


    return {

        text:
            country.name,

        x:
            center.x,

        y:
            center.y,

        fontSize

    };

}


// ============================================================
// DRAW COUNTRY LABELS
// ============================================================

export function drawCountryLabels(
    ctx
) {

    if (
        camera.zoom >=
        LABEL_MAX_ZOOM
    ) {

        return;

    }


    ctx.save();


    for (
        const countryId
        of LABEL_COUNTRIES
    ) {

        const labelInfo =
            getLabelInfo(countryId);


        if (
            !labelInfo
        ) {

            continue;

        }


        ctx.save();


        ctx.font =
            `${labelInfo.fontSize}px Georgia, serif`;


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillStyle =
            "rgba(0, 0, 0, 0.55)";


        ctx.fillText(
            labelInfo.text,
            labelInfo.x + 2,
            labelInfo.y + 2
        );


        ctx.fillStyle =
            "rgba(245, 239, 224, 0.80)";


        ctx.fillText(
            labelInfo.text,
            labelInfo.x,
            labelInfo.y
        );


        ctx.restore();

    }


    ctx.restore();

}
