const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const territoryName = document.getElementById("territory-name");
const territoryOwner = document.getElementById("territory-owner");


// --------------------------------------------------
// TERRITORIES
// --------------------------------------------------

const territories = [
    {
        name: "Northland",
        owner: "France",
        color: "#4f78b8",

        points: [
            { x: 100, y: 100 },
            { x: 300, y: 80 },
            { x: 340, y: 220 },
            { x: 120, y: 240 }
        ]
    },

    {
        name: "Eastmarch",
        owner: "England",
        color: "#a85454",

        points: [
            { x: 300, y: 80 },
            { x: 500, y: 120 },
            { x: 470, y: 250 },
            { x: 340, y: 220 }
        ]
    },

    {
        name: "Southland",
        owner: "France",
        color: "#4f78b8",

        points: [
            { x: 120, y: 240 },
            { x: 340, y: 220 },
            { x: 380, y: 400 },
            { x: 150, y: 420 }
        ]
    },

    {
        name: "Westreach",
        owner: "Burgundy",
        color: "#b59b45",

        points: [
            { x: 340, y: 220 },
            { x: 470, y: 250 },
            { x: 550, y: 420 },
            { x: 380, y: 400 }
        ]
    }
];


// --------------------------------------------------
// CANVAS
// --------------------------------------------------

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
}

window.addEventListener("resize", resizeCanvas);


// --------------------------------------------------
// DRAWING
// --------------------------------------------------

function drawTerritory(territory) {

    ctx.beginPath();

    ctx.moveTo(
        territory.points[0].x,
        territory.points[0].y
    );

    for (let i = 1; i < territory.points.length; i++) {

        ctx.lineTo(
            territory.points[i].x,
            territory.points[i].y
        );
    }

    ctx.closePath();

    // Territory color
    ctx.fillStyle = territory.color;
    ctx.fill();

    // Border
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3;
    ctx.stroke();
}


function draw() {

    // Clear screen
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Draw territories
    for (const territory of territories) {
        drawTerritory(territory);
    }
}


// --------------------------------------------------
// CLICKING TERRITORIES
// --------------------------------------------------

canvas.addEventListener("click", (event) => {

    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (const territory of territories) {

        if (pointInsideTerritory(
            mouseX,
            mouseY,
            territory.points
        )) {

            selectTerritory(territory);

            return;
        }
    }
});


function pointInsideTerritory(x, y, points) {

    let inside = false;

    for (
        let i = 0, j = points.length - 1;
        i < points.length;
        j = i++
    ) {

        const xi = points[i].x;
        const yi = points[i].y;

        const xj = points[j].x;
        const yj = points[j].y;

        const intersects =
            ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersects) {
            inside = !inside;
        }
    }

    return inside;
}


// --------------------------------------------------
// TERRITORY SELECTION
// --------------------------------------------------

function selectTerritory(territory) {

    territoryName.textContent = territory.name;

    territoryOwner.textContent =
        "Owner: " + territory.owner;

    draw();

    // Highlight selected territory
    ctx.beginPath();

    ctx.moveTo(
        territory.points[0].x,
        territory.points[0].y
    );

    for (let i = 1; i < territory.points.length; i++) {

        ctx.lineTo(
            territory.points[i].x,
            territory.points[i].y
        );
    }

    ctx.closePath();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.stroke();
}


// --------------------------------------------------
// START
// --------------------------------------------------

resizeCanvas();
