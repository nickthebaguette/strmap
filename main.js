const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const territoryName = document.getElementById("territory-name");
const territoryOwner = document.getElementById("territory-owner");


// ==================================================
// MAP SETTINGS
// ==================================================

const MAP_WIDTH = 1800;
const MAP_HEIGHT = 1100;

let camera = {
    x: 0,
    y: 0,
    zoom: 0.7
};

let selectedTerritory = null;

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;


// ==================================================
// TERRITORIES
// ==================================================
//
// Coordinates are in our own map-space.
// They are intentionally simplified rather than
// attempting to reproduce every historical border.
//

const territories = [

    // ----------------------------------------------
    // WESTERN EUROPE
    // ----------------------------------------------

    {
        name: "France",
        owner: "France",
        color: "#4f78b8",

        points: [
            [260, 400],
            [380, 300],
            [540, 310],
            [650, 390],
            [620, 540],
            [560, 690],
            [430, 700],
            [300, 620],
            [240, 500]
        ]
    },

    {
        name: "Spain",
        owner: "Spain",
        color: "#c98c4a",

        points: [
            [120, 650],
            [300, 620],
            [430, 700],
            [390, 830],
            [250, 860],
            [120, 790]
        ]
    },

    {
        name: "Portugal",
        owner: "Portugal",
        color: "#71965a",

        points: [
            [80, 670],
            [120, 650],
            [120, 790],
            [80, 760]
        ]
    },

    {
        name: "Great Britain",
        owner: "Great Britain",
        color: "#a65b5b",

        points: [
            [250, 150],
            [300, 100],
            [350, 120],
            [360, 220],
            [330, 330],
            [270, 340],
            [230, 250]
        ]
    },

    {
        name: "Ireland",
        owner: "Ireland",
        color: "#6f925d",

        points: [
            [190, 180],
            [220, 140],
            [240, 210],
            [225, 290],
            [180, 270]
        ]
    },

    {
        name: "Batavian Republic",
        owner: "Batavian Republic",
        color: "#a97d91",

        points: [
            [570, 270],
            [650, 260],
            [690, 330],
            [620, 360],
            [570, 330]
        ]
    },


    // ----------------------------------------------
    // GERMAN STATES
    // ----------------------------------------------

    {
        name: "Hanover",
        owner: "Hanover",
        color: "#c7a95a",

        points: [
            [690, 270],
            [790, 260],
            [820, 350],
            [750, 390],
            [680, 340]
        ]
    },

    {
        name: "Prussia",
        owner: "Prussia",
        color: "#7d8fa8",

        points: [
            [790, 200],
            [1030, 170],
            [1130, 250],
            [1080, 350],
            [900, 350],
            [820, 300]
        ]
    },

    {
        name: "Saxony",
        owner: "Saxony",
        color: "#a88458",

        points: [
            [800, 350],
            [900, 350],
            [940, 430],
            [850, 460],
            [790, 420]
        ]
    },

    {
        name: "Bavaria",
        owner: "Bavaria",
        color: "#6f8d68",

        points: [
            [700, 470],
            [800, 450],
            [870, 500],
            [830, 590],
            [700, 600],
            [650, 530]
        ]
    },

    {
        name: "Württemberg",
        owner: "Württemberg",
        color: "#9b745e",

        points: [
            [610, 500],
            [700, 470],
            [720, 540],
            [670, 590],
            [610, 560]
        ]
    },

    {
        name: "Baden",
        owner: "Baden",
        color: "#b59b55",

        points: [
            [560, 480],
            [610, 500],
            [610, 560],
            [570, 600],
            [540, 540]
        ]
    },

    {
        name: "Hesse",
        owner: "Hesse",
        color: "#967d9d",

        points: [
            [610, 380],
            [700, 370],
            [720, 470],
            [650, 480],
            [600, 430]
        ]
    },


    // ----------------------------------------------
    // SWITZERLAND
    // ----------------------------------------------

    {
        name: "Switzerland",
        owner: "Switzerland",
        color: "#a75b5b",

        points: [
            [500, 520],
            [560, 480],
            [610, 560],
            [570, 620],
            [500, 590]
        ]
    },


    // ----------------------------------------------
    // AUSTRIA / CENTRAL EUROPE
    // ----------------------------------------------

    {
        name: "Austria",
        owner: "Habsburg Monarchy",
        color: "#c4a84d",

        points: [
            [850, 500],
            [1000, 440],
            [1110, 500],
            [1160, 600],
            [1060, 680],
            [900, 650],
            [830, 590]
        ]
    },

    {
        name: "Hungary",
        owner: "Habsburg Monarchy",
        color: "#d0b45c",

        points: [
            [1060, 680],
            [1160, 600],
            [1290, 650],
            [1280, 770],
            [1160, 820],
            [1050, 760]
        ]
    },


    // ----------------------------------------------
    // ITALY
    // ----------------------------------------------

    {
        name: "Kingdom of Italy",
        owner: "France",
        color: "#7196a0",

        points: [
            [650, 620],
            [760, 610],
            [800, 680],
            [760, 760],
            [690, 740],
            [620, 670]
        ]
    },

    {
        name: "Piedmont",
        owner: "France",
        color: "#789b65",

        points: [
            [500, 620],
            [600, 600],
            [650, 650],
            [620, 700],
            [540, 690]
        ]
    },

    {
        name: "Tuscany",
        owner: "Tuscany",
        color: "#b38b52",

        points: [
            [650, 740],
            [760, 760],
            [780, 820],
            [690, 850],
            [630, 800]
        ]
    },

    {
        name: "Papal States",
        owner: "Papal States",
        color: "#8f7195",

        points: [
            [780, 760],
            [850, 740],
            [900, 810],
            [850, 870],
            [780, 820]
        ]
    },

    {
        name: "Kingdom of Naples",
        owner: "Naples",
        color: "#b47b52",

        points: [
            [850, 870],
            [900, 810],
            [960, 850],
            [940, 980],
            [880, 1010],
            [840, 940]
        ]
    },

    {
        name: "Sardinia",
        owner: "Sardinia",
        color: "#7c9164",

        points: [
            [520, 790],
            [560, 760],
            [580, 850],
            [540, 900],
            [510, 850]
        ]
    },


    // ----------------------------------------------
    // SCANDINAVIA
    // ----------------------------------------------

    {
        name: "Denmark-Norway",
        owner: "Denmark-Norway",
        color: "#9b5f68",

        points: [
            [720, 70],
            [800, 50],
            [850, 100],
            [820, 180],
            [750, 180],
            [700, 120]
        ]
    },

    {
        name: "Sweden",
        owner: "Sweden",
        color: "#c6a44f",

        points: [
            [850, 30],
            [940, 40],
            [970, 170],
            [900, 270],
            [850, 180]
        ]
    },


    // ----------------------------------------------
    // EASTERN EUROPE
    // ----------------------------------------------

    {
        name: "Russia",
        owner: "Russian Empire",
        color: "#7ca06a",

        points: [
            [1030, 80],
            [1450, 70],
            [1600, 220],
            [1500, 430],
            [1350, 500],
            [1200, 400],
            [1130, 250],
            [1030, 170]
        ]
    },

    {
        name: "Polish Lands",
        owner: "Russian Empire",
        color: "#8baa76",

        points: [
            [1030, 350],
            [1130, 350],
            [1200, 400],
            [1160, 500],
            [1050, 520],
            [980, 450]
        ]
    },

    {
        name: "Moldavia",
        owner: "Ottoman Empire",
        color: "#9fbd55",

        points: [
            [1160, 500],
            [1230, 470],
            [1290, 540],
            [1260, 630],
            [1180, 620]
        ]
    },

    {
        name: "Wallachia",
        owner: "Ottoman Empire",
        color: "#a5c55a",

        points: [
            [1050, 650],
            [1180, 620],
            [1200, 700],
            [1120, 750],
            [1050, 730]
        ]
    },


    // ----------------------------------------------
    // BALKANS / OTTOMAN EMPIRE
    // ----------------------------------------------

    {
        name: "Ottoman Empire",
        owner: "Ottoman Empire",
        color: "#a8c857",

        points: [
            [1160, 760],
            [1280, 700],
            [1450, 720],
            [1550, 820],
            [1500, 960],
            [1250, 980],
            [1160, 900]
        ]
    },

    {
        name: "Montenegro",
        owner: "Montenegro",
        color: "#687d63",

        points: [
            [1080, 780],
            [1130, 760],
            [1160, 820],
            [1120, 860],
            [1080, 830]
        ]
    }
];


// ==================================================
// CANVAS RESIZE
// ==================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
}

window.addEventListener("resize", resizeCanvas);


// ==================================================
// CAMERA TRANSFORM
// ==================================================

function worldToScreen(x, y) {

    return {
        x: (x - camera.x) * camera.zoom,
        y: (y - camera.y) * camera.zoom
    };
}


function screenToWorld(x, y) {

    return {
        x: x / camera.zoom + camera.x,
        y: y / camera.zoom + camera.y
    };
}


// ==================================================
// DRAW TERRITORY
// ==================================================

function drawTerritory(territory) {

    ctx.beginPath();

    const first = worldToScreen(
        territory.points[0][0],
        territory.points[0][1]
    );

    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < territory.points.length; i++) {

        const point = worldToScreen(
            territory.points[i][0],
            territory.points[i][1]
        );

        ctx.lineTo(point.x, point.y);
    }

    ctx.closePath();

    ctx.fillStyle = territory.color;
    ctx.fill();

    ctx.strokeStyle = "#302d29";
    ctx.lineWidth = 2;

    ctx.stroke();


    // Selected territory
    if (territory === selectedTerritory) {

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 5;

        ctx.stroke();
    }
}


// ==================================================
// DRAW
// ==================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Sea
    ctx.fillStyle = "#b9ccd2";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Territories
    for (const territory of territories) {

        drawTerritory(territory);
    }
}


// ==================================================
// TERRITORY HIT DETECTION
// ==================================================

function pointInsideTerritory(x, y, points) {

    let inside = false;

    for (
        let i = 0, j = points.length - 1;
        i < points.length;
        j = i++
    ) {

        const xi = points[i][0];
        const yi = points[i][1];

        const xj = points[j][0];
        const yj = points[j][1];

        const intersect =
            ((yi > y) !== (yj > y)) &&
            (
                x <
                (xj - xi) *
                (y - yi) /
                (yj - yi) +
                xi
            );

        if (intersect) {

            inside = !inside;
        }
    }

    return inside;
}


function getTerritoryAt(x, y) {

    // Reverse order so later territories appear on top
    for (let i = territories.length - 1; i >= 0; i--) {

        if (
            pointInsideTerritory(
                x,
                y,
                territories[i].points
            )
        ) {

            return territories[i];
        }
    }

    return null;
}


// ==================================================
// MOUSE CLICK
// ==================================================

canvas.addEventListener("click", (event) => {

    if (isDragging) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const screenX =
        event.clientX - rect.left;

    const screenY =
        event.clientY - rect.top;

    const world =
        screenToWorld(
            screenX,
            screenY
        );

    const territory =
        getTerritoryAt(
            world.x,
            world.y
        );

    if (territory) {

        selectedTerritory = territory;

        territoryName.textContent =
            territory.name;

        territoryOwner.textContent =
            "Owner: " + territory.owner;

        draw();
    }
});


// ==================================================
// PAN
// ==================================================

canvas.addEventListener("mousedown", (event) => {

    isDragging = false;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    canvas.dataset.mouseDown = "true";
});


canvas.addEventListener("mousemove", (event) => {

    if (canvas.dataset.mouseDown !== "true") {
        return;
    }

    const dx =
        event.clientX - lastMouseX;

    const dy =
        event.clientY - lastMouseY;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        isDragging = true;
    }

    camera.x -= dx / camera.zoom;
    camera.y -= dy / camera.zoom;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    draw();
});


canvas.addEventListener("mouseup", () => {

    canvas.dataset.mouseDown = "false";
});


canvas.addEventListener("mouseleave", () => {

    canvas.dataset.mouseDown = "false";
});


// ==================================================
// ZOOM
// ==================================================

canvas.addEventListener("wheel", (event) => {

    event.preventDefault();

    const rect =
        canvas.getBoundingClientRect();

    const mouseX =
        event.clientX - rect.left;

    const mouseY =
        event.clientY - rect.top;


    // Position under cursor before zoom
    const worldBefore =
        screenToWorld(
            mouseX,
            mouseY
        );


    const zoomFactor =
        event.deltaY < 0
            ? 1.1
            : 0.9;


    camera.zoom *= zoomFactor;


    // Clamp zoom
    camera.zoom =
        Math.max(
            0.35,
            Math.min(
                2.5,
                camera.zoom
            )
        );


    // Keep cursor over same world position
    const worldAfter =
        screenToWorld(
            mouseX,
            mouseY
        );

    camera.x +=
        worldBefore.x -
        worldAfter.x;

    camera.y +=
        worldBefore.y -
        worldAfter.y;

    draw();
});


// ==================================================
// INITIAL CAMERA
// ==================================================

camera.x = 0;
camera.y = 0;
camera.zoom = 0.7;


// ==================================================
// START
// ==================================================

resizeCanvas();
