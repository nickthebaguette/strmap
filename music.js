// ============================================================
// BACKGROUND MUSIC
// ============================================================

const MUSIC_FILE =
    "music/background.mp3";


// Minimum amount of music we want remaining
// when we choose the random starting position.
//
// For example:
// 300 = never start within the final 5 minutes.

const MINIMUM_REMAINING_TIME =
    50;


// Music volume.

const MUSIC_VOLUME =
    0.25;


// ============================================================
// AUDIO
// ============================================================

const backgroundMusic =
    new Audio(
        MUSIC_FILE
    );


backgroundMusic.volume =
    MUSIC_VOLUME;


// When the track reaches the end,
// start again from a new random position.

backgroundMusic.addEventListener(
    "ended",
    () => {

        chooseRandomStart();

        startMusic();

    }
);


// ============================================================
// RANDOM START POSITION
// ============================================================

function chooseRandomStart() {

    const duration =
        backgroundMusic.duration;


    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        return;

    }


    // Make sure we don't accidentally choose
    // a position right near the end.

    const maximumStart =
        Math.max(
            0,
            duration -
            MINIMUM_REMAINING_TIME
        );


    const randomPosition =
        Math.random() *
        maximumStart;


    backgroundMusic.currentTime =
        randomPosition;


    console.log(
        `Music starting at ${Math.floor(randomPosition)}s / ${Math.floor(duration)}s`
    );

}


// ============================================================
// START MUSIC
// ============================================================

function startMusic() {

    backgroundMusic
        .play()
        .catch(() => {

            console.log(
                "Autoplay blocked. Waiting for user interaction."
            );

        });

}


// ============================================================
// WAIT FOR AUDIO TO LOAD
// ============================================================

backgroundMusic.addEventListener(
    "loadedmetadata",
    () => {

        chooseRandomStart();

        startMusic();

    }
);


// ============================================================
// USER INTERACTION FALLBACK
// ============================================================

function enableMusicAfterInteraction() {

    startMusic();


    document.removeEventListener(
        "click",
        enableMusicAfterInteraction
    );


    document.removeEventListener(
        "keydown",
        enableMusicAfterInteraction
    );


    document.removeEventListener(
        "pointerdown",
        enableMusicAfterInteraction
    );

}


document.addEventListener(
    "click",
    enableMusicAfterInteraction
);


document.addEventListener(
    "keydown",
    enableMusicAfterInteraction
);


document.addEventListener(
    "pointerdown",
    enableMusicAfterInteraction
);
