// ============================================================
// MAIN.JS
// ============================================================

import {
    createTiles,
    applyMapData,
    getTileAt,
    countries
} from "./shared/map.js";

import {
    camera,
    resizeCamera,
    panCamera,
    zoomCamera,
    clampCamera,
    MIN_ZOOM,
    MAX_ZOOM
} from "./shared/camera.js";

import {
    cities,
    loadCities,
    isMajorCity
} from "./shared/cities.js";

import {
    armies,
    loadArmies,
    getSoldierIconCount
} from "./shared/armies.js";

import {
    rebuildMapCanvas,
    draw,
    setSelectedTile,
    setHoveredTile,
    selectedTileRef,
    hoveredTileRef
} from "./shared/renderer.js";

import {
    setCountryFlag
} from "./shared/countryFlags.js";


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("map");

const ctx =
    canvas.getContext("2d");


// ============================================================
// TERRITORY PANEL
// ============================================================

const territoryName =
    document.getElementById(
        "territory-name"
    );

const territoryOwner =
    document.getElementById(
        "territory-owner"
    );

const territoryFlag =
    document.getElementById(
        "territory-flag"
    );

const territoryCity =
    document.getElementById(
        "territory-city"
    );

const cityNameDisplay =
    document.getElementById(
        "city-name-display"
    );

const cityTypeDisplay =
    document.getElementById(
        "city-type-display"
    );

const territoryManpower =
    document.getElementById(
        "territory-manpower"
    );

const manpowerIcons =
    document.getElementById(
        "manpower-icons"
    );

const territoryArmy =
    document.getElementById(
        "territory-army"
    );

const armyNameDisplay =
    document.getElementById(
        "army-name-display"
    );

const armyStrengthDisplay =
    document.getElementById(
        "army-strength-display"
    );


// ============================================================
// HOVER TOOLTIP
// ============================================================

const hoverTooltip =
    document.getElementById(
        "hover-tooltip"
    );

const tooltipCountry =
    document.getElementById(
        "tooltip-country"
    );

const tooltipCity =
    document.getElementById(
        "tooltip-city"
    );

const tooltipArmy =
    document.getElementById(
        "tooltip-army"
    );

const tooltipManpower =
    document.getElementById(
        "tooltip-manpower"
    );


// ============================================================
// LOADING OVERLAY
// ============================================================

const loadingOverlay =
    document.getElementById(
        "loading-overlay"
    );

const loadingPainting =
    document.getElementById(
        "loading-painting"
    );

const loadingQuote =
    document.getElementById(
        "loading-quote"
    );

const loadingQuoteText =
    document.getElementById(
        "loading-quote-text"
    );

const loadingQuoteAuthor =
    document.getElementById(
        "loading-quote-author"
    );

const loadingPaintingInfo =
    document.getElementById(
        "loading-painting-info"
    );

const loadingPaintingTitle =
    document.getElementById(
        "loading-painting-title"
    );

const loadingPaintingArtist =
    document.getElementById(
        "loading-painting-artist"
    );

const dateDisplay =
    document.getElementById(
        "date-display"
    );

const compassRose =
    document.getElementById(
        "compass-rose"
    );

const cinematicSound =
    document.getElementById(
        "cinematic-sound"
    );


// ============================================================
// PAINTINGS & QUOTES
// ============================================================

let paintings = [];

let quotes = [];


// ============================================================
// LOAD PAINTINGS MANIFEST
// ============================================================

async function loadPaintings() {

    try {

        const response =
            await fetch(
                "data/paintings.json"
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(
                data.paintings
            )
        ) {

            paintings =
                data.paintings;

        }


        return true;

    }

    catch (error) {

        console.warn(
            "Could not load paintings.json:",
            error
        );


        return false;

    }

}


// ============================================================
// LOAD QUOTES
// ============================================================

async function loadQuotes() {

    try {

        const response =
            await fetch(
                "data/quotes.json"
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(
                data.quotes
            )
        ) {

            quotes =
                data.quotes;

        }


        return true;

    }

    catch (error) {

        console.warn(
            "Could not load quotes.json:",
            error
        );


        return false;

    }

}


// ============================================================
// RUN LOADING SEQUENCE
// ============================================================

async function runLoadingSequence() {

    await loadPaintings();

    await loadQuotes();


    let hasAdvanced = false;

    let paintingLoaded = false;


    if (
        paintings.length > 0
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                paintings.length
            );


        const painting =
            paintings[randomIndex];


        loadingPainting.src =
            painting.file;


        loadingPainting.onload =
            () => {

                loadingPainting.classList.add(
                    "loaded"
                );


                paintingLoaded = true;

            };


        loadingPainting.onerror =
            () => {

                console.warn(
                    `Could not load painting: ${painting.file}`
                );


                paintingLoaded = true;

            };


        loadingPaintingTitle.textContent =
            painting.title;


        loadingPaintingArtist.textContent =
            `${painting.artist} — ${painting.year}`;


        loadingPaintingInfo.style.display =
            "block";


        setTimeout(
            () => {

                loadingPaintingInfo.classList.add(
                    "visible"
                );

            },
            1500
        );

    }

    else {

        paintingLoaded = true;

    }


    if (
        quotes.length > 0
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                quotes.length
            );


        const quote =
            quotes[randomIndex];


        loadingQuoteText.textContent =
            `"${quote.text}"`;


        loadingQuoteAuthor.textContent =
            `— ${quote.author}`;


        loadingQuote.style.display =
            "block";


        setTimeout(
            () => {

                loadingQuote.classList.add(
                    "visible"
                );

            },
            1200
        );

    }


    dateDisplay.style.display =
        "block";


    dateDisplay.classList.add(
        "corner"
    );


    function advanceToMap() {

        if (
            hasAdvanced
        ) {

            return;

        }


        hasAdvanced =
            true;


        if (
            cinematicSound
        ) {

            cinematicSound.volume =
                0.6;


            cinematicSound.play().catch(
                () => {

                    console.warn(
                        "Could not play cinematic sound."
                    );

                }
            );

        }


        loadingOverlay.classList.add(
            "fade-out"
        );


        setTimeout(
            () => {

                compassRose.style.display =
                    "block";

            },
            1200
        );


        setTimeout(
            () => {

                loadingOverlay.style.display =
                    "none";

            },
            2200
        );

    }


    loadingOverlay.addEventListener(
        "click",
        () => {

            if (
                paintingLoaded
            ) {

                advanceToMap();

            }

        }
    );


    setTimeout(
        advanceToMap,
        15000
    );

}


// ============================================================
// INITIALIZE
// ============================================================

async function start() {

    createTiles();

    resizeCamera(canvas);

    rebuildMapCanvas();

    draw(ctx, canvas);


    try {

        const response =
            await fetch(
                "data/map.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load map.json"
            );

        }


        const data =
            await response.json();


        applyMapData(data);


        rebuildMapCanvas();


        resizeCamera(canvas);

        draw(ctx, canvas);


        console.log(
            `Map loaded successfully: ${data.cols} × ${data.rows}`
        );

    }

    catch (error) {

        console.error(
            "Failed to load map:",
            error
        );

    }


    await loadCities();

    await loadArmies();


    draw(ctx, canvas);


    runLoadingSequence();

}


// ============================================================
// DRAW VIGNETTE
// ============================================================

function drawVignette() {

    const DPR =
        window.devicePixelRatio || 1;


    ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );


    const gradient =
        ctx.createRadialGradient(

            window.innerWidth / 2,
            window.innerHeight / 2,
            window.innerWidth * 0.25,

            window.innerWidth / 2,
            window.innerHeight / 2,
            window.innerWidth * 0.75

        );


    gradient.addColorStop(
        0,
        "rgba(0, 0, 0, 0)"
    );


    gradient.addColorStop(
        1,
        "rgba(0, 0, 0, 0.35)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

}


// ============================================================
// REDRAW
// ============================================================

function redraw() {

    draw(
        ctx,
        canvas
    );


    drawVignette();

}


// ============================================================
// UPDATE MANPOWER DISPLAY
// ============================================================

function updateManpowerDisplay(
    army,
    container
) {

    const filledCount =
        getSoldierIconCount(
            army.strength
        );


    const soldierIcons =
        container.querySelectorAll(
            ".soldier-icon"
        );


    const country =
        countries[
            army.country
        ];


    soldierIcons.forEach(
        (
            icon,
            index
        ) => {

            const isFilled =
                index < filledCount;


            icon.classList.toggle(
                "filled",
                isFilled
            );


            if (
                isFilled &&
                country
            ) {

                icon.style.backgroundColor =
                    country.color;

            }

            else {

                icon.style.backgroundColor =
                    "rgba(0, 0, 0, 0.45)";

            }

        }
    );

}


// ============================================================
// FIND CITY AT TILE
// ============================================================

function getCityAtTile(tile) {

    if (!tile) {

        return null;

    }


    return cities.find(
        city =>
            city.col === tile.col &&
            city.row === tile.row
    ) || null;

}


// ============================================================
// FIND ARMY AT TILE
// ============================================================

function getArmyAtTile(tile) {

    if (!tile) {

        return null;

    }


    return armies.find(
        army =>
            army.col === tile.col &&
            army.row === tile.row
    ) || null;

}


// ============================================================
// UPDATE TERRITORY PANEL
// ============================================================

function updateTerritoryPanel(
    tile,
    country
) {

    territoryName.textContent =
        country.name;


    territoryOwner.textContent =
        `Tile: ${tile.col}, ${tile.row}`;


    setCountryFlag(
        territoryFlag,
        tile.owner
    );


    // --------------------------------------------------------
    // City
    // --------------------------------------------------------

    const city =
        getCityAtTile(tile);


    if (city) {

        territoryCity.style.display =
            "block";


        cityNameDisplay.textContent =
            city.name;


        cityTypeDisplay.textContent =
            isMajorCity(city)
                ? "National Center"
                : "Regional Center";

    }

    else {

        territoryCity.style.display =
            "none";

    }


    // --------------------------------------------------------
    // Army
    // --------------------------------------------------------

    const army =
        getArmyAtTile(tile);


    if (army) {

        territoryArmy.style.display =
            "block";


        armyNameDisplay.textContent =
            army.name;


        armyStrengthDisplay.textContent =
            `${army.strength.toLocaleString()} men`;


        territoryManpower.style.display =
            "block";


        updateManpowerDisplay(
            army,
            manpowerIcons
        );

    }

    else {

        territoryArmy.style.display =
            "none";


        territoryManpower.style.display =
            "none";

    }

}


// ============================================================
// CLEAR TERRITORY PANEL
// ============================================================

function clearTerritoryPanel() {

    territoryName.textContent =
        "No territory selected";


    territoryOwner.textContent =
        "";


    territoryFlag.style.display =
        "none";


    territoryCity.style.display =
        "none";


    territoryArmy.style.display =
        "none";


    territoryManpower.style.display =
        "none";

}


// ============================================================
// SHOW HOVER TOOLTIP
// ============================================================

function showHoverTooltip(
    tile,
    mouseX,
    mouseY
) {

    const country =
        countries[
            tile.owner
        ];


    const city =
        getCityAtTile(tile);


    const army =
        getArmyAtTile(tile);


    if (
        !city &&
        !army
    ) {

        hideHoverTooltip();

        return;

    }


    if (country) {

        tooltipCountry.textContent =
            country.name;


        tooltipCountry.style.display =
            "block";

    }

    else {

        tooltipCountry.style.display =
            "none";

    }


    if (city) {

        tooltipCity.textContent =
            city.name;


        tooltipCity.style.display =
            "block";

    }

    else {

        tooltipCity.style.display =
            "none";

    }


    if (army) {

        tooltipArmy.textContent =
            army.name;


        tooltipArmy.style.display =
            "block";


        tooltipManpower.innerHTML =
            "";


        tooltipManpower.style.display =
            "flex";


        const filledCount =
            getSoldierIconCount(
                army.strength
            );


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const icon =
                document.createElement("div");


            icon.classList.add(
                "soldier-icon"
            );


            if (
                i < filledCount &&
                country
            ) {

                icon.classList.add(
                    "filled"
                );


                icon.style.backgroundColor =
                    country.color;

            }

            else {

                icon.style.backgroundColor =
                    "rgba(0, 0, 0, 0.45)";

            }


            tooltipManpower.appendChild(
                icon
            );

        }


        const strengthText =
            document.createElement("div");


        strengthText.classList.add(
            "tooltip-strength"
        );


        strengthText.textContent =
            `${army.strength.toLocaleString()} men`;


        tooltipManpower.appendChild(
            strengthText
        );

    }

    else {

        tooltipArmy.style.display =
            "none";


        tooltipManpower.style.display =
            "none";

    }


    hoverTooltip.style.display =
        "block";


    const offsetX =
        15;


    const offsetY =
        15;


    let tooltipX =
        mouseX + offsetX;


    let tooltipY =
        mouseY + offsetY;


    const tooltipRect =
        hoverTooltip.getBoundingClientRect();


    if (
        tooltipX + tooltipRect.width >
        window.innerWidth - 10
    ) {

        tooltipX =
            mouseX - tooltipRect.width - offsetX;

    }


    if (
        tooltipY + tooltipRect.height >
        window.innerHeight - 10
    ) {

        tooltipY =
            mouseY - tooltipRect.height - offsetY;

    }


    hoverTooltip.style.left =
        tooltipX + "px";


    hoverTooltip.style.top =
        tooltipY + "px";

}


// ============================================================
// HIDE HOVER TOOLTIP
// ============================================================

function hideHoverTooltip() {

    hoverTooltip.style.display =
        "none";

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        resizeCamera(canvas);

        redraw();

    }
);


// ============================================================
// CLICK
// ============================================================

let wasDragging = false;


canvas.addEventListener(
    "click",
    event => {

        if (wasDragging) {

            wasDragging = false;

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const world = {

            x:
                (
                    event.clientX -
                    rect.left
                ) /
                camera.zoom +
                camera.x,

            y:
                (
                    event.clientY -
                    rect.top
                ) /
                camera.zoom +
                camera.y

        };


        const tile =
            getTileAt(
                world.x,
                world.y
            );


        if (!tile) {

            setSelectedTile(null);

            clearTerritoryPanel();

            redraw();

            return;

        }


        if (
            selectedTileRef &&
            selectedTileRef.col === tile.col &&
            selectedTileRef.row === tile.row
        ) {

            setSelectedTile(null);

            clearTerritoryPanel();

            redraw();

            return;

        }


        const country =
            countries[
                tile.owner
            ];


        if (!country) {

            return;

        }


        setSelectedTile(
            tile
        );


        updateTerritoryPanel(
            tile,
            country
        );


        redraw();

    }
);


// ============================================================
// HOVER
// ============================================================

canvas.addEventListener(
    "mousemove",
    event => {

        if (dragging) {

            setHoveredTile(null);

            hideHoverTooltip();

            redraw();

            return;

        }


        const rect =
            canvas.getBoundingClientRect();


        const world = {

            x:
                (
                    event.clientX -
                    rect.left
                ) /
                camera.zoom +
                camera.x,

            y:
                (
                    event.clientY -
                    rect.top
                ) /
                camera.zoom +
                camera.y

        };


        const tile =
            getTileAt(
                world.x,
                world.y
            );


        if (!tile) {

            setHoveredTile(null);

            hideHoverTooltip();

            redraw();

            return;

        }


        const city =
            getCityAtTile(tile);


        const army =
            getArmyAtTile(tile);


        if (
            city ||
            army
        ) {

            setHoveredTile(tile);

            showHoverTooltip(
                tile,
                event.clientX,
                event.clientY
            );

        }

        else {

            setHoveredTile(null);

            hideHoverTooltip();

        }


        redraw();

    }
);


// ============================================================
// HIDE TOOLTIP WHEN MOUSE LEAVES
// ============================================================

canvas.addEventListener(
    "mouseleave",
    () => {

        setHoveredTile(null);

        hideHoverTooltip();

        redraw();

    }
);


// ============================================================
// PAN
// ============================================================

let dragging = false;

let lastX = 0;

let lastY = 0;


canvas.addEventListener(
    "mousedown",
    event => {

        if (
            event.button !== 0
        ) {

            return;

        }


        dragging = true;

        wasDragging = false;


        lastX =
            event.clientX;

        lastY =
            event.clientY;

    }
);


canvas.addEventListener(
    "mousemove",
    event => {

        if (!dragging) {

            return;

        }


        const dx =
            event.clientX -
            lastX;

        const dy =
            event.clientY -
            lastY;


        if (
            Math.abs(dx) > 2 ||
            Math.abs(dy) > 2
        ) {

            wasDragging = true;

        }


        panCamera(
            canvas,
            dx,
            dy
        );


        lastX =
            event.clientX;

        lastY =
            event.clientY;


        setHoveredTile(null);

        hideHoverTooltip();


        redraw();

    }
);


// ============================================================
// STOP DRAGGING
// ============================================================

window.addEventListener(
    "mouseup",
    () => {

        dragging = false;

    }
);


// ============================================================
// ZOOM
// ============================================================

canvas.addEventListener(
    "wheel",
    event => {

        event.preventDefault();


        zoomCamera(
            canvas,
            event
        );


        setHoveredTile(null);

        hideHoverTooltip();


        redraw();

    }
);


// ============================================================
// TOUCH SUPPORT
// ============================================================
//
// Mobile/tablet touch handling:
//
//     • Single finger drag → pan
//     • Two finger pinch → zoom
//     • Single tap → select
//
// ============================================================

let touchDragging = false;

let touchWasDragging = false;

let lastTouchX = 0;

let lastTouchY = 0;

let pinchStartDistance = 0;

let pinchStartZoom = 0;


function getTouchDistance(
    touches
) {

    if (
        touches.length < 2
    ) {

        return 0;

    }


    const dx =
        touches[0].clientX -
        touches[1].clientX;


    const dy =
        touches[0].clientY -
        touches[1].clientY;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


canvas.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();


        const touches =
            event.touches;


        if (
            touches.length === 1
        ) {

            touchDragging = true;

            touchWasDragging = false;


            lastTouchX =
                touches[0].clientX;


            lastTouchY =
                touches[0].clientY;

        }

        else if (
            touches.length === 2
        ) {

            touchDragging = false;


            pinchStartDistance =
                getTouchDistance(touches);


            pinchStartZoom =
                camera.zoom;

        }

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();


        const touches =
            event.touches;


        if (
            touches.length === 1 &&
            touchDragging
        ) {

            const dx =
                touches[0].clientX -
                lastTouchX;


            const dy =
                touches[0].clientY -
                lastTouchY;


            if (
                Math.abs(dx) > 3 ||
                Math.abs(dy) > 3
            ) {

                touchWasDragging = true;

            }


            panCamera(
                canvas,
                dx,
                dy
            );


            lastTouchX =
                touches[0].clientX;


            lastTouchY =
                touches[0].clientY;


            setHoveredTile(null);

            hideHoverTooltip();


            redraw();

        }

        else if (
            touches.length === 2
        ) {

            const currentDistance =
                getTouchDistance(touches);


            if (
                pinchStartDistance > 0 &&
                currentDistance > 0
            ) {

                const scale =
                    currentDistance /
                    pinchStartDistance;


                const newZoom =
                    pinchStartZoom *
                    scale;


                camera.zoom =
                    Math.max(
                        MIN_ZOOM,
                        Math.min(
                            MAX_ZOOM,
                            newZoom
                        )
                    );


                clampCamera();


                setHoveredTile(null);

                hideHoverTooltip();


                redraw();

            }

        }

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchend",
    event => {

        event.preventDefault();


        if (
            event.touches.length === 0
        ) {

            touchDragging = false;

            pinchStartDistance = 0;

        }

        else if (
            event.touches.length === 1
        ) {

            lastTouchX =
                event.touches[0].clientX;


            lastTouchY =
                event.touches[0].clientY;


            pinchStartDistance = 0;

        }

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchcancel",
    event => {

        touchDragging = false;

        pinchStartDistance = 0;

    }
);


// ============================================================
// START
// ============================================================

start();
