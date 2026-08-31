// ============================================================
// BACKGROUND MUSIC
// ============================================================
//
// Plays music files from assets/music/ in a playlist.
//
// Behaviour:
//
//     • Builds a playlist from a manifest or naming convention.
//     • Randomly selects a starting point between 30-60%
//       of the playlist.
//     • Plays through the playlist in order.
//     • Loops back to the beginning when finished.
//     • Within each track, randomly starts between 30-60%
//       of the track's duration.
//
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

const MUSIC_DIRECTORY = "assets/music/";

const MUSIC_VOLUME = 0.25;

// Don't randomly start in the final 5 minutes of a track.
const MINIMUM_REMAINING_TIME = 300;

// Random start range within each track (30% to 60%).
const TRACK_START_MIN = 0.30;
const TRACK_START_MAX = 0.60;

// Random start range within the playlist (30% to 60%).
const PLAYLIST_START_MIN = 0.30;
const PLAYLIST_START_MAX = 0.60;

// Maximum number of tracks to try discovering.
const MAX_TRACKS = 50;


// ============================================================
// AUDIO
// ============================================================

const backgroundMusic = new Audio();

backgroundMusic.preload = "auto";

backgroundMusic.volume = MUSIC_VOLUME;


// ============================================================
// PLAYLIST STATE
// ============================================================

let playlist = [];

let currentTrackIndex = 0;

let randomStartChosen = false;

let playlistStarted = false;


// ============================================================
// DISCOVER MUSIC FILES
// ============================================================
//
// Tries to find music files using naming conventions:
//
//     track1.mp3
//     track2.mp3
//     track3.mp3
//     ...
//
// Also tries .ogg and .wav as fallbacks.
//
// ============================================================

async function discoverMusicFiles() {

    const extensions = [".mp3", ".ogg", ".wav"];

    const discovered = [];


    for (
        let i = 1;
        i <= MAX_TRACKS;
        i++
    ) {

        let found = false;


        for (
            const extension
            of extensions
        ) {

            const path =
                MUSIC_DIRECTORY +
                "track" +
                i +
                extension;


            try {

                const response =
                    await fetch(path);


                if (
                    response.ok
                ) {

                    discovered.push(path);

                    found = true;

                    break;

                }

            }

            catch {

                // Try next extension or break.

            }

        }


        // If no extension worked for this number,
        // assume we've found all tracks.

        if (!found) {

            break;

        }

    }


    return discovered;

}


// ============================================================
// CHOOSE RANDOM TRACK START
// ============================================================
//
// Randomly positions the current track between 30-60%
// of its duration.
//
// ============================================================

function chooseRandomTrackStart() {

    const duration =
        backgroundMusic.duration;


    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        console.log(
            "Music duration not available yet."
        );

        return false;
    }


    // Calculate start range.

    const startMin =
        duration * TRACK_START_MIN;


    const startMax =
        duration * TRACK_START_MAX;


    // Make sure we don't start too close to the end.

    const maximumStart =
        Math.max(
            0,
            duration -
            MINIMUM_REMAINING_TIME
        );


    const actualMax =
        Math.min(
            startMax,
            maximumStart
        );


    const randomPosition =

        startMin +
        Math.random() *
        (
            actualMax -
            startMin
        );


    backgroundMusic.currentTime =
        randomPosition;


    randomStartChosen = true;


    console.log(
        `Track ${currentTrackIndex + 1} random start: ${
            Math.floor(randomPosition)
        } seconds of ${
            Math.floor(duration)
        } seconds`
    );


    return true;
}


// ============================================================
// CHOOSE RANDOM PLAYLIST START
// ============================================================
//
// Randomly selects a starting track between 30-60%
// of the playlist.
//
// ============================================================

function chooseRandomPlaylistStart() {

    if (
        playlist.length === 0
    ) {

        return;
    }


    const startMin =
        Math.floor(
            playlist.length *
            PLAYLIST_START_MIN
        );


    const startMax =
        Math.floor(
            playlist.length *
            PLAYLIST_START_MAX
        );


    const randomIndex =

        startMin +
        Math.floor(
            Math.random() *
            (
                startMax -
                startMin +
                1
            )
        );


    currentTrackIndex =
        Math.min(
            randomIndex,
            playlist.length - 1
        );


    console.log(
        `Playlist random start: track ${
            currentTrackIndex + 1
        } of ${playlist.length}`
    );


    playlistStarted = true;

}


// ============================================================
// LOAD TRACK
// ============================================================

function loadTrack(
    index
) {

    if (
        index < 0 ||
        index >= playlist.length
    ) {

        return;

    }


    const path =
        playlist[index];


    backgroundMusic.src =
        path;


    randomStartChosen =
        false;


    console.log(
        `Loading track ${index + 1}: ${path}`
    );

}


// ============================================================
// START MUSIC
// ============================================================

async function startMusic() {

    console.log(
        "Attempting to start music..."
    );


    if (!randomStartChosen) {

        chooseRandomTrackStart();

    }


    try {

        await backgroundMusic.play();


        console.log(
            "Music is playing!"
        );

    }

    catch (error) {

        console.log(
            "Browser blocked autoplay:",
            error
        );

    }

}


// ============================================================
// PLAY NEXT TRACK
// ============================================================

function playNextTrack() {

    currentTrackIndex++;


    if (
        currentTrackIndex >=
        playlist.length
    ) {

        currentTrackIndex = 0;

        console.log(
            "Playlist complete. Looping back to start."
        );

    }


    loadTrack(
        currentTrackIndex
    );


    startMusic();

}


// ============================================================
// AUDIO LOADED
// ============================================================

backgroundMusic.addEventListener(
    "loadedmetadata",
    () => {

        console.log(
            "Music metadata loaded."
        );


        chooseRandomTrackStart();


        startMusic();

    }
);


// ============================================================
// AUDIO CAN PLAY
// ============================================================

backgroundMusic.addEventListener(
    "canplay",
    () => {

        console.log(
            "Music can play."
        );

    }
);


// ============================================================
// AUDIO ERROR
// ============================================================

backgroundMusic.addEventListener(
    "error",
    () => {

        console.error(
            "Could not load music file:",
            backgroundMusic.src,
            backgroundMusic.error
        );


        // Try next track if this one fails.

        if (
            playlist.length > 0
        ) {

            playNextTrack();

        }

    }
);


// ============================================================
// MUSIC ENDS
// ============================================================

backgroundMusic.addEventListener(
    "ended",
    () => {

        console.log(
            "Track ended. Playing next track."
        );


        playNextTrack();

    }
);


// ============================================================
// USER INTERACTION
// ============================================================

function userInteracted() {

    console.log(
        "User interaction detected."
    );


    if (!randomStartChosen) {

        chooseRandomTrackStart();

    }


    startMusic();


    // Only need this once.

    document.removeEventListener(
        "click",
        userInteracted
    );

    document.removeEventListener(
        "keydown",
        userInteracted
    );

    document.removeEventListener(
        "pointerdown",
        userInteracted
    );

}


// ============================================================
// INTERACTION LISTENERS
// ============================================================

document.addEventListener(
    "click",
    userInteracted
);

document.addEventListener(
    "keydown",
    userInteracted
);

document.addEventListener(
    "pointerdown",
    userInteracted
);


// ============================================================
// INITIALIZE
// ============================================================

async function initMusic() {

    console.log(
        "Music system initialized."
    );


    console.log(
        "Discovering music files in:",
        MUSIC_DIRECTORY
    );


    playlist =
        await discoverMusicFiles();


    if (
        playlist.length === 0
    ) {

        console.warn(
            "No music files found. Music disabled."
        );

        return;

    }


    console.log(
        `Found ${playlist.length} music tracks.`
    );


    // Choose random starting track.

    chooseRandomPlaylistStart();


    // Load the starting track.

    loadTrack(
        currentTrackIndex
    );

}


// ============================================================
// START
// ============================================================

initMusic();
