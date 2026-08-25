const canvas =
    document.getElementById("map");

const ctx =
    canvas.getContext("2d");

const countrySelect =
    document.getElementById(
        "country-select"
    );

const saveButton =
    document.getElementById(
        "save-button"
    );

const downloadButton =
    document.getElementById(
        "download-button"
    );

const status =
    document.getElementById(
        "status"
    );


// ============================================================
// MAP
// ============================================================

const COLS = 150;
const ROWS = 90;

const HEX_SIZE = 14;

const HEX_WIDTH =
    Math.sqrt(3) * HEX_SIZE;

const HEX_VERTICAL_DISTANCE =
    HEX_SIZE * 1.5;


// ============================================================
// CAMERA
// ============================================================

let camera = {
    x: 0,
    y: 0,
    zoom: 0.55
};


const MIN_ZOOM = 0.55;
const MAX_ZOOM = 3.0;


// ============================================================
// COUNTRIES
// ============================================================

const countries = {

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
    }
};


// ============================================================
// TILES
// ============================================================

const tiles = [];

function createTiles() {

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
                col: col,
                row: row,
                owner: "ocean"
            });

        }

    }
}


// ============================================================
// HEX POSITION
// ============================================================

function hexToWorld(
    col,
    row
) {

    return {

        x:
            col *
            HEX_WIDTH +
            (row % 2) *
            HEX_WIDTH /
            2,

        y:
            row *
            HEX_VERTICAL_DISTANCE

    };
}


// ============================================================
// CAMERA
// ============================================================

function worldToScreen(
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


function screenToWorld(
    x,
    y
) {

    return {

        x:
            x /
            camera.zoom +
            camera.x,

        y:
            y /
            camera.zoom +
            camera.y

    };
}


// ============================================================
// DRAW HEX
// ============================================================

function drawHex(
    x,
    y,
    size,
    color,
    border = "#30302d"
) {

    ctx.beginPath();


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const angle =
            Math.PI /
            180 *
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

            ctx.moveTo(
                px,
                py
            );

        }
        else {

            ctx.lineTo(
                px,
                py
            );

        }

    }


    ctx.closePath();


    ctx.fillStyle =
        color;

    ctx.fill();


    ctx.strokeStyle =
        border;

    ctx.lineWidth =
        0.7;

    ctx.stroke();
}


// ============================================================
// DRAW MAP
// ============================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    for (const tile of tiles) {

        const world =
            hexToWorld(
                tile.col,
                tile.row
            );


        const screen =
            worldToScreen(
                world.x,
                world.y
            );


        const country =
            countries[
                tile.owner
            ];


        drawHex(

            screen.x,
            screen.y,

            HEX_SIZE *
            camera.zoom,

            country.color

        );

    }
}


// ============================================================
// RESIZE
// ============================================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;

    draw();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================================
// FIND TILE
// ============================================================

function getTileAt(
    worldX,
    worldY
) {

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


            const d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                d <
                closestDistance
            ) {

                closest =
                    tiles[
                        row *
                        COLS +
                        col
                    ];

                closestDistance =
                    d;

            }

        }

    }


    return closest;
}


// ============================================================
// PAINTING
// ============================================================

let painting = false;


function paintTile(
    tile
) {

    if (!tile) {
        return;
    }


    tile.owner =
        countrySelect.value;


    status.textContent =
        "Unsaved changes";


    draw();
}


canvas.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button !== 0
        ) {
            return;
        }


        painting = true;


        paintFromMouse(
            event
        );

    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (!painting) {
            return;
        }


        paintFromMouse(
            event
        );

    }
);


window.addEventListener(
    "mouseup",
    () => {

        painting = false;

    }
);


function paintFromMouse(
    event
) {

    const rect =
        canvas.getBoundingClientRect();


    const screenX =
        event.clientX -
        rect.left;

    const screenY =
        event.clientY -
        rect.top;


    const world =
        screenToWorld(
            screenX,
            screenY
        );


    const tile =
        getTileAt(
            world.x,
            world.y
        );


    paintTile(
        tile
    );
}


// ============================================================
// CAMERA DRAG
// ============================================================
//
// Right mouse button = pan
//

let dragging = false;

let lastX = 0;
let lastY = 0;


canvas.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button === 2
        ) {

            dragging = true;

            lastX =
                event.clientX;

            lastY =
                event.clientY;

        }

    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (!dragging) {
            return;
        }


        const dx =
            event.clientX -
            lastX;

        const dy =
            event.clientY -
            lastY;


        camera.x -=
            dx /
            camera.zoom;

        camera.y -=
            dy /
            camera.zoom;


        lastX =
            event.clientX;

        lastY =
            event.clientY;


        draw();

    }
);


window.addEventListener(
    "mouseup",
    () => {

        dragging = false;

    }
);


canvas.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();

    }
);


// ============================================================
// ZOOM
// ============================================================

canvas.addEventListener(
    "wheel",
    (event) => {

        event.preventDefault();


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


        draw();

    }
);


// ============================================================
// EXPORT JSON
// ============================================================

function createMapData() {

    return {

        cols: COLS,

        rows: ROWS,

        tiles: tiles.map(
            tile => ({
                col: tile.col,
                row: tile.row,
                owner: tile.owner
            })
        )

    };
}


downloadButton.addEventListener(
    "click",
    () => {

        const data =
            createMapData();


        const json =
            JSON.stringify(
                data,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const a =
            document.createElement(
                "a"
            );


        a.href =
            url;

        a.download =
            "map.json";


        a.click();


        URL.revokeObjectURL(
            url
        );


        status.textContent =
            "Map downloaded.";

    }
);


// ============================================================
// LOAD EXISTING MAP
// ============================================================

async function loadMap() {

    try {

        const response =
            await fetch(
                "data/map.json"
            );


        if (!response.ok) {
            throw new Error(
                "Map not found"
            );
        }


        const data =
            await response.json();


        for (
            const savedTile
            of data.tiles
        ) {

            const tile =
                tiles[
                    savedTile.row *
                    COLS +
                    savedTile.col
                ];


            if (tile) {

                tile.owner =
                    savedTile.owner;

            }

        }


        status.textContent =
            "Map loaded.";

        draw();

    }
    catch (error) {

        console.log(
            "No saved map yet."
        );

        status.textContent =
            "New map.";

    }
}


// ============================================================
// START
// ============================================================

createTiles();

resizeCanvas();

loadMap();
