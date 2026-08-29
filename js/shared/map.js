// ============================================================
// MAP.JS
// Shared map/grid system
// ============================================================
//
// map.json is the authority for:
//
//     COLS
//     ROWS
//
// Nothing here hardcodes the actual map dimensions.
//
// This module handles:
//
//     political ownership
//     grid geometry
//     tile creation
//     coordinate conversion
//     map loading
//     map JSON exporting
//
// ============================================================


// ============================================================
// COUNTRIES
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
        color: "#fbe868"
    },

    portugal: {
        name: "Portugal",
        color: "#f18d8b"
    },

    britain: {
        name: "Great Britain",
        color: "#e94263"
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
        color: "#000000"
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
        color: "#2121FF"
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
        color: "#BAF17B"
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
//
// These are geometric constants.
//
// COLS and ROWS are deliberately not fixed.
// They are populated by map.json.
//
// ============================================================

export let COLS = 0;
export let ROWS = 0;


export const HEX_SIZE = 14;


export const HEX_WIDTH =
    Math.sqrt(3) *
    HEX_SIZE;


export const HEX_VERTICAL_DISTANCE =
    HEX_SIZE *
    1.5;


// ============================================================
// MAP BOUNDS
// ============================================================
//
// Unlike the old system, these represent the actual outer
// bounds of the rendered hex field.
//
// The first hex is centred at:
//
//     x = 0
//     y = 0
//
// Therefore its left/top edges are negative.
//
// This is intentional.
//
// ============================================================

export let MAP_LEFT = 0;
export let MAP_TOP = 0;

export let MAP_RIGHT = 0;
export let MAP_BOTTOM = 0;

export let MAP_WIDTH = 0;
export let MAP_HEIGHT = 0;


// ============================================================
// UPDATE MAP DIMENSIONS
// ============================================================

export function updateMapDimensions() {

    if (
        COLS <= 0 ||
        ROWS <= 0
    ) {

        MAP_LEFT = 0;
        MAP_TOP = 0;

        MAP_RIGHT = 0;
        MAP_BOTTOM = 0;

        MAP_WIDTH = 0;
        MAP_HEIGHT = 0;

        return;

    }


    // --------------------------------------------------------
    // Left / top
    // --------------------------------------------------------
    //
    // The first hex is centred at 0,0.
    //
    // A pointy hex has a horizontal and vertical radius of
    // HEX_SIZE.
    //
    // --------------------------------------------------------

    MAP_LEFT =
        -HEX_SIZE;

    MAP_TOP =
        -HEX_SIZE;


    // --------------------------------------------------------
    // Last row offset
    // --------------------------------------------------------

    const lastRowOffset =
        (
            (ROWS - 1) % 2
        ) *
        HEX_WIDTH / 2;


    // --------------------------------------------------------
    // Right edge
    // --------------------------------------------------------

    const lastColumnCenterX =
        (COLS - 1) *
        HEX_WIDTH +
        lastRowOffset;


    MAP_RIGHT =
        lastColumnCenterX +
        HEX_SIZE;


    // --------------------------------------------------------
    // Bottom edge
    // --------------------------------------------------------

    const lastRowCenterY =
        (ROWS - 1) *
        HEX_VERTICAL_DISTANCE;


    MAP_BOTTOM =
        lastRowCenterY +
        HEX_SIZE;


    // --------------------------------------------------------
    // Final dimensions
    // --------------------------------------------------------

    MAP_WIDTH =
        MAP_RIGHT -
        MAP_LEFT;


    MAP_HEIGHT =
        MAP_BOTTOM -
        MAP_TOP;

}


// ============================================================
// TILES
// ============================================================

export const tiles = [];


// ============================================================
// CREATE TILES
// ============================================================

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

export function hexToWorld(
    col,
    row
) {

    return {

        x:
            col *
            HEX_WIDTH +

            (
                row % 2
            ) *
            HEX_WIDTH / 2,

        y:
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

    if (
        COLS <= 0 ||
        ROWS <= 0
    ) {

        return null;

    }


    const approxCol =
        Math.round(
            worldX /
            HEX_WIDTH
        );


    const approxRow =
        Math.round(
            worldY /
            HEX_VERTICAL_DISTANCE
        );


    let closest = null;


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


            const position =
                hexToWorld(
                    col,
                    row
                );


            const dx =
                worldX -
                position.x;


            const dy =
                worldY -
                position.y;


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
        !data ||
        typeof data !== "object"
    ) {

        throw new Error(
            "Invalid map data."
        );

    }


    // --------------------------------------------------------
    // DIMENSIONS
    // --------------------------------------------------------

    const newCols =
        Number(
            data.cols
        );


    const newRows =
        Number(
            data.rows
        );


    if (
        Number.isInteger(newCols) &&
        newCols > 0
    ) {

        COLS =
            newCols;

    }


    if (
        Number.isInteger(newRows) &&
        newRows > 0
    ) {

        ROWS =
            newRows;

    }


    // --------------------------------------------------------
    // Recalculate geometry
    // --------------------------------------------------------

    updateMapDimensions();


    // --------------------------------------------------------
    // Create empty map
    // --------------------------------------------------------

    createTiles();


    // --------------------------------------------------------
    // TILE FORMAT
    // --------------------------------------------------------

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


        return;

    }


    // --------------------------------------------------------
    // LEGACY OWNERS FORMAT
    // --------------------------------------------------------

    if (
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


        return;

    }


    // --------------------------------------------------------
    // LEGACY MAP FORMAT
    // --------------------------------------------------------

    if (
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


// ============================================================
// MAP INITIALIZATION
// ============================================================
//
// Useful for situations where another module wants an empty
// map before map.json has loaded.
//
// ============================================================

export function initializeEmptyMap(
    cols,
    rows
) {

    const newCols =
        Number(cols);


    const newRows =
        Number(rows);


    if (
        !Number.isInteger(newCols) ||
        newCols <= 0
    ) {

        throw new Error(
            "Invalid column count."
        );

    }


    if (
        !Number.isInteger(newRows) ||
        newRows <= 0
    ) {

        throw new Error(
            "Invalid row count."
        );

    }


    COLS =
        newCols;


    ROWS =
        newRows;


    updateMapDimensions();

    createTiles();

}
