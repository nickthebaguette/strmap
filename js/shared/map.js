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
        color: "#4d72ad"
    },

    spain: {
        name: "Spain",
        color: "#c18a45"
    },

    portugal: {
        name: "Portugal",
        color: "#6c9660"
    },

    britain: {
        name: "Great Britain",
        color: "#a85858"
    },

    netherlands: {
        name: "Batavian Republic",
        color: "#9b7182"
    },

    batavia: {
        name: "Batavian Republic",
        color: "#9b7182"
    },

    prussia: {
        name: "Prussia",
        color: "#667c99"
    },

    austria: {
        name: "Austria",
        color: "#c5a74e"
    },

    russia: {
        name: "Russian Empire",
        color: "#71975e"
    },

    sweden: {
        name: "Sweden",
        color: "#c6a84d"
    },

    denmark: {
        name: "Denmark-Norway",
        color: "#a45e68"
    },

    italy: {
        name: "Kingdom of Italy",
        color: "#6d949c"
    },

    ottoman: {
        name: "Ottoman Empire",
        color: "#9bb955"
    },

    switzerland: {
        name: "Switzerland",
        color: "#9d5959"
    },

    bavaria: {
        name: "Bavaria",
        color: "#718c69"
    },

    saxony: {
        name: "Saxony",
        color: "#aa8355"
    },

    naples: {
        name: "Naples",
        color: "#8fae9b"
    },

    papal: {
        name: "Papal States",
        color: "#b89488"
    }

};


// ============================================================
// GRID
// ============================================================

export let COLS = 100;
export let ROWS = 60;

export const HEX_SIZE = 14;

export const HEX_WIDTH =
    Math.sqrt(3) * HEX_SIZE;

export const HEX_VERTICAL_DISTANCE =
    HEX_SIZE * 1.5;


export let MAP_WIDTH =
    COLS * HEX_WIDTH +
    HEX_WIDTH;

export let MAP_HEIGHT =
    ROWS * HEX_VERTICAL_DISTANCE +
    HEX_SIZE;


export function updateMapDimensions() {

    MAP_WIDTH =
        COLS * HEX_WIDTH +
        HEX_WIDTH;

    MAP_HEIGHT =
        ROWS * HEX_VERTICAL_DISTANCE +
        HEX_SIZE;

}


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
                owner: "ocean"

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
            col * HEX_WIDTH +
            (row % 2) *
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

    const approxCol =
        Math.round(
            worldX / HEX_WIDTH
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
        let row = approxRow - 2;
        row <= approxRow + 2;
        row++
    ) {

        for (
            let col = approxCol - 2;
            col <= approxCol + 2;
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
                worldX - p.x;

            const dy =
                worldY - p.y;


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
                        row * COLS + col
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

export function applyMapData(data) {

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


    if (
        Array.isArray(data.tiles)
    ) {

        for (
            const savedTile of data.tiles
        ) {

            const col =
                Number(savedTile.col);

            const row =
                Number(savedTile.row);

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
                row * COLS + col
            ].owner = owner;

        }

    }

    else if (
        Array.isArray(data.owners)
    ) {

        for (
            let i = 0;
            i < data.owners.length &&
            i < tiles.length;
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

    else if (
        Array.isArray(data.map)
    ) {

        for (
            let row = 0;
            row < data.map.length &&
            row < ROWS;
            row++
        ) {

            const mapRow =
                data.map[row];


            if (
                !Array.isArray(mapRow)
            ) {

                continue;

            }


            for (
                let col = 0;
                col < mapRow.length &&
                col < COLS;
                col++
            ) {

                const owner =
                    mapRow[col];


                if (
                    countries[owner]
                ) {

                    tiles[
                        row * COLS + col
                    ].owner = owner;

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

        cols: COLS,

        rows: ROWS,

        tiles:
            tiles.map(tile => ({

                col: tile.col,

                row: tile.row,

                owner: tile.owner

            }))

    };

}
