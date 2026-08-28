// terrain.js
// Handles terrain data and terrain editing.
//
// Terrain defaults:
// - Ocean tiles are automatically "water"
// - Land tiles are automatically "plains"
// - terrain.json only stores manual terrain overrides


// ============================================================
// TERRAIN TYPES
// ============================================================

export const TERRAIN_TYPES = {
    water: {
        name: "Water",
        editable: false
    },

    plains: {
        name: "Plains",
        editable: true
    },

    forest: {
        name: "Forest",
        editable: true
    },

    hills: {
        name: "Hills",
        editable: true
    },

    mountains: {
        name: "Mountains",
        editable: true
    },

    desert: {
        name: "Desert",
        editable: true
    },

    swamp: {
        name: "Swamp",
        editable: true
    }
};


// ============================================================
// TERRAIN DATA
// ============================================================

let terrainData = {
    cols: 150,
    rows: 90,
    default: "plains",
    tiles: {}
};


// ============================================================
// LOAD TERRAIN.JSON
// ============================================================

export async function loadTerrain() {
    try {
        const response = await fetch("data/terrain.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        terrainData = {
            cols: data.cols ?? 150,
            rows: data.rows ?? 90,
            default: data.default ?? "plains",
            tiles: data.tiles ?? {}
        };

        console.log(
            `Terrain loaded: ${Object.keys(terrainData.tiles).length} overrides`
        );

    } catch (error) {
        console.error("Failed to load terrain.json:", error);

        // Keep the default empty terrain dataset.
        terrainData = {
            cols: 150,
            rows: 90,
            default: "plains",
            tiles: {}
        };
    }
}


// ============================================================
// TERRAIN KEY
// ============================================================

function getTerrainKey(col, row) {
    return `${col},${row}`;
}


// ============================================================
// GET TERRAIN
// ============================================================

export function getTerrain(col, row, mapTiles) {

    const key = getTerrainKey(col, row);

    // --------------------------------------------------------
    // Ocean always has water terrain.
    // --------------------------------------------------------

    const mapTile = mapTiles?.find(
        tile => tile.col === col && tile.row === row
    );

    if (mapTile && mapTile.owner === "ocean") {
        return "water";
    }


    // --------------------------------------------------------
    // Check for manually assigned terrain.
    // --------------------------------------------------------

    if (terrainData.tiles[key]) {
        return terrainData.tiles[key];
    }


    // --------------------------------------------------------
    // All other land defaults to plains.
    // --------------------------------------------------------

    return terrainData.default;
}


// ============================================================
// SET TERRAIN
// ============================================================

export function setTerrain(col, row, terrain, mapTiles) {

    // Make sure the terrain exists.
    if (!TERRAIN_TYPES[terrain]) {
        console.warn(`Unknown terrain type: ${terrain}`);
        return;
    }


    // Water is automatically determined by map.js.
    // Don't allow it to be manually assigned.
    if (terrain === "water") {
        console.warn("Water terrain is determined automatically by map.js.");
        return;
    }


    // Don't allow terrain to be painted onto ocean.
    const mapTile = mapTiles?.find(
        tile => tile.col === col && tile.row === row
    );

    if (mapTile && mapTile.owner === "ocean") {
        return;
    }


    const key = getTerrainKey(col, row);


    // --------------------------------------------------------
    // If assigning the default terrain, remove the override.
    // --------------------------------------------------------

    if (terrain === terrainData.default) {
        delete terrainData.tiles[key];
    }

    // --------------------------------------------------------
    // Otherwise store an override.
    // --------------------------------------------------------

    else {
        terrainData.tiles[key] = terrain;
    }
}


// ============================================================
// GET ALL TERRAIN OVERRIDES
// ============================================================

export function getTerrainOverrides() {
    return terrainData.tiles;
}


// ============================================================
// GET TERRAIN DATA
// ============================================================

export function getTerrainData() {
    return terrainData;
}
