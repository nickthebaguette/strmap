// ============================================================
// MAP.JS
// Shared map/grid system
// ============================================================


export const countries = {

    ocean: {
        name: "Ocean",
        color: "#4f8194"
    },

    france: {
        name: "France",
        color: "#231BA7"
    },

    spain: {
        name: "Spain",
        color: "#CD9B23"
    },

    portugal: {
        name: "Portugal",
        color: "#f18d8b"
    },

    britain: {
        name: "Great Britain",
        color: "#C8102E"
    },

    batavia: {
        name: "Batavian Republic",
        color: "#fe9836"
    },

    netherlands: {
        name: "Batavian Republic",
        color: "#fe9836"
    },

    prussia: {
        name: "Prussia",
        color: "#383838"
    },

    austria: {
        name: "Austria",
        color: "#D9B106"
    },

    russia: {
        name: "Russian Empire",
        color: "#055B2D"
    },

    sweden: {
        name: "Sweden",
        color: "#006AA7"
    },

    denmark: {
        name: "Denmark-Norway",
        color: "#891E47"
    },

    italy: {
        name: "Kingdom of Italy",
        color: "#6EA563"
    },

    ottoman: {
        name: "Ottoman Empire",
        color: "#562828"
    },

    switzerland: {
        name: "Switzerland",
        color: "#AD6464"
    },

    bavaria: {
        name: "Bavaria",
        color: "#66D8FF"
    },

    saxony: {
        name: "Saxony",
        color: "#5F7A3F"
    },

    naples: {
        name: "Naples",
        color: "#a2ddab"
    },

    papal: {
        name: "Papal States",
        color: "#d09d91"
    },

    badenwurttemberg: {
        name: "Baden-Württemberg",
        color: "#6B4124"
    },

    hre: {
        name: "Holy Roman Empire",
        color: "#CCB886"
    },

    sardinia: {
        name: "Sardinia",
        color: "#7BC421"
    }

};


// ============================================================
// GRID
// ============================================================

export let COLS = 100;

export let ROWS = 60;


// ============================================================
// HEX SIZE
// ============================================================
//
// Increased from 14 to 20 for better rendering quality.
//
// Larger hexes mean:
//
//     • More pixels per hex
//     • Crisper grid lines
//     • Better texture detail
//     • Easier to see borders and ownership
//
// ============================================================

export const HEX_SIZE = 24;


export const HEX_WIDTH =
    Math.sqrt(3) *
    HEX_SIZE;


export const HEX_VERTICAL_DISTANCE =
    HEX_SIZE *
    1.5;


// ============================================================
// MAP DIMENSIONS
// ============================================================
//
// MAP_WIDTH / MAP_HEIGHT represent the actual outer bounds
// of the complete hex grid.
//
// The first hex is inset by HEX_SIZE so that its edges do
// not extend into negative world coordinates.
//
// Odd rows are shifted horizontally by half a hex width.
//
// ============================================================

export let MAP_WIDTH =
    0;

export let MAP_HEIGHT =
    0;


export function updateMapDimensions() {

    // --------------------------------------------------------
    // Horizontal bounds
    // --------------------------------------------------------

    const lastColumn =
        Math.max(
            0,
            COLS - 1
        );


    // If the final row is odd, it is shifted right by half
    // a hex width.
    //
    // This means the maximum possible horizontal shift is
    // determined by the final row.

    const finalRowShift =
        (
            ROWS > 1 &&
            (ROWS - 1) % 2 === 1
        )
            ? HEX_WIDTH / 2
            : 0;


    MAP_WIDTH =
        HEX_SIZE +
        lastColumn * HEX_WIDTH +
        finalRowShift +
        HEX_SIZE;


    // --------------------------------------------------------
    // Vertical bounds
    // --------------------------------------------------------

    const lastRow =
        Math.max(
            0,
            ROWS - 1
        );


    MAP_HEIGHT =
        HEX_SIZE +
        lastRow *
        HEX_VERTICAL_DISTANCE +
        HEX_SIZE;

}


// Initialize dimensions immediately.

updateMapDimensions();


// ============================================================
// TILES
// ============================================================

export const tiles = [];


export function createTiles() {

    tiles.length = 0;


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < COLS;
            col++
        ) {

            tiles.push({

                col,
                row,

                owner:
                    "ocean"

            });

        }

    }

}


// ============================================================
// HEX POSITION
// ============================================================
//
// World coordinates are now based on the OUTER MAP bounds.
//
// The first hex center is at:
//
//     HEX_SIZE, HEX_SIZE
//
// rather than:
//
//     0, 0
//
// This prevents the first hex from extending outside the
// map's coordinate system.
//
// ============================================================

export function hexToWorld(
    col,
    row
) {

    return {

        x:
            HEX_SIZE +
            col * HEX_WIDTH +
            (row % 2) *
            HEX_WIDTH / 2,

        y:
            HEX_SIZE +
            row *
            HEX_VERTICAL_DISTANCE

    };

}


// ============================================================
// FIND TILE
// ============================================================

export function getTileAt(
    worldX,
    worldY
) {

    const approxCol =
        Math.round(
            (
                worldX -
                HEX_SIZE
            ) /
            HEX_WIDTH
        );


    const approxRow =
        Math.round(
            (
                worldY -
                HEX_SIZE
            ) /
            HEX_VERTICAL_DISTANCE
        );


    let closest =
        null;


    let closestDistance =
        HEX_SIZE;


    for (
        let row =
            approxRow - 2;

        row <=
            approxRow + 2;

        row++
    ) {

        for (
            let col =
                approxCol - 2;

            col <=
                approxCol + 2;

            col++
        ) {

            if (
                col < 0 ||
                col >= COLS ||
                row < 0 ||
                row >= ROWS
            ) {

                continue;

            }


            const p =
                hexToWorld(
                    col,
                    row
                );


            const dx =
                worldX -
                p.x;


            const dy =
                worldY -
                p.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                closestDistance
            ) {

                closest =
                    tiles[
                        row * COLS +
                        col
                    ];


                closestDistance =
                    distance;

            }

        }

    }


    return closest;

}


// ============================================================
// LOAD MAP DATA
// ============================================================

export function applyMapData(
    data
) {

    if (
        Number.isInteger(
            Number(data.cols)
        )
    ) {

        COLS =
            Number(data.cols);

    }


    if (
        Number.isInteger(
            Number(data.rows)
        )
    ) {

        ROWS =
            Number(data.rows);

    }


    updateMapDimensions();

    createTiles();


    // ========================================================
    // MODERN FORMAT
    // ========================================================

    if (
        Array.isArray(
            data.tiles
        )
    ) {

        for (
            const savedTile
            of data.tiles
        ) {

            const col =
                Number(
                    savedTile.col
                );


            const row =
                Number(
                    savedTile.row
                );


            const owner =
                savedTile.owner;


            if (
                !Number.isInteger(col) ||
                !Number.isInteger(row)
            ) {

                continue;

            }


            if (
                col < 0 ||
                col >= COLS ||
                row < 0 ||
                row >= ROWS
            ) {

                continue;

            }


            if (
                !countries[owner]
            ) {

                continue;

            }


            tiles[
                row * COLS +
                col
            ].owner =
                owner;

        }

    }


    // ========================================================
    // OLD OWNERS FORMAT
    // ========================================================

    else if (
        Array.isArray(
            data.owners
        )
    ) {

        for (
            let i = 0;

            i <
                data.owners.length &&
            i <
                tiles.length;

            i++
        ) {

            const owner =
                data.owners[i];


            if (
                countries[owner]
            ) {

                tiles[i].owner =
                    owner;

            }

        }

    }


    // ========================================================
    // OLD MAP FORMAT
    // ========================================================

    else if (
        Array.isArray(
            data.map
        )
    ) {

        for (
            let row = 0;

            row <
                data.map.length &&
            row <
                ROWS;

            row++
        ) {

            const mapRow =
                data.map[row];


            if (
                !Array.isArray(
                    mapRow
                )
            ) {

                continue;

            }


            for (
                let col = 0;

                col <
                    mapRow.length &&
                col <
                    COLS;

                col++
            ) {

                const owner =
                    mapRow[col];


                if (
                    countries[owner]
                ) {

                    tiles[
                        row * COLS +
                        col
                    ].owner =
                        owner;

                }

            }

        }

    }

}


// ============================================================
// CREATE MAP JSON
// ============================================================

export function createMapJSON() {

    return {

        cols:
            COLS,

        rows:
            ROWS,

        tiles:
            tiles.map(
                tile => ({

                    col:
                        tile.col,

                    row:
                        tile.row,

                    owner:
                        tile.owner

                })
            )

    };

}
