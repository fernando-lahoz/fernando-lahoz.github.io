
const SOUNDS = {
    menu_song: new Audio("assets/sounds/menu-song.ogg"), //--
    ambience: new Audio("assets/sounds/ambience.ogg"), //--
    block_fall: new Audio("assets/sounds/block-fall.ogg"), //--X
    block_move_1: new Audio("assets/sounds/block-move-1.ogg"),
    block_move_2: new Audio("assets/sounds/block-move-2.ogg"),
    block_move_3: new Audio("assets/sounds/block-move-3.ogg"),
    block_move_bridge_1: new Audio("assets/sounds/block-move-bridge-1.ogg"),
    block_move_bridge_2: new Audio("assets/sounds/block-move-bridge-2.ogg"),
    block_move_bridge_3: new Audio("assets/sounds/block-move-bridge-3.ogg"),
    block_move_cube_1: new Audio("assets/sounds/block-move-cube-1.ogg"),
    block_move_cube_2: new Audio("assets/sounds/block-move-cube-2.ogg"),
    block_move_fragile_1: new Audio("assets/sounds/block-move-fragile-1.ogg"),
    block_move_fragile_2: new Audio("assets/sounds/block-move-fragile-2.ogg"),
    flush_map: new Audio("assets/sounds/flush-map.ogg"), //--X
    heavy_button: new Audio("assets/sounds/heavy-button.ogg"), //--
    level_screen: new Audio("assets/sounds/level-screen.ogg"), //--
    menu_click: new Audio("assets/sounds/menu-click.ogg"), //--
    soft_button: new Audio("assets/sounds/soft-button(menu-hover).ogg"), //--
    split: new Audio("assets/sounds/split.ogg"), //--
    switched_off: new Audio("assets/sounds/switched-off.ogg"), //--
    switched_on: new Audio("assets/sounds/switched-on.ogg"), //--
    victory: new Audio("assets/sounds/victory.ogg"), //--
};

function play_one_sound_from_set(sounds) {
    const idx = Math.floor(Math.random() * sounds.length);
    play_sound(sounds[idx])
}

let is_sound_muted = true;
let sound_enabled = false;

function init_sound() {
    for (let key in SOUNDS) {
        SOUNDS[key].muted = is_sound_muted;
    }

    SOUNDS.menu_song.loop = true;
    SOUNDS.ambience.loop = true;
    SOUNDS.ambience.volume = 0.1;
    SOUNDS.block_move_cube_1.volume = 0.2;
    SOUNDS.block_move_cube_2.volume = 0.2;
    SOUNDS.block_move_1.volume = 0.2;
    SOUNDS.block_move_2.volume = 0.2;
    SOUNDS.block_move_3.volume = 0.2;
    SOUNDS.block_move_bridge_1.volume = 0.2;
    SOUNDS.block_move_bridge_2.volume = 0.2;
    SOUNDS.block_move_bridge_3.volume = 0.2;
    SOUNDS.block_move_cube_1.volume = 0.2;
    SOUNDS.block_move_cube_2.volume = 0.2;
    SOUNDS.block_move_fragile_1.volume = 0.2;
    SOUNDS.block_move_fragile_2.volume = 0.2;

    SOUNDS.menu_hover = SOUNDS.soft_button;
}

function toggle_sound() {
    is_sound_muted = !is_sound_muted;
    for (let key in SOUNDS) {
        SOUNDS[key].muted = is_sound_muted;
    }

    event_queue.push(GAME_EVENTS.main_menu.toggle_sound);
}

function is_sound_playing(sound) {
    return sound.duration > 0 && !sound.paused;
}

function play_sound(sound) {
    if (sound_enabled) {
        sound.currentTime = 0;
        sound.play();
    }
}

function stop_sound(sound) {
    sound.pause();
    sound.currentTime = 0;
}

// User must interact with the page in order to play any sound
addEventListener("click", (event) => {
    if (sound_enabled) {
        return;
    }
    sound_enabled = true;
    if (is_sound_muted) {
        toggle_sound();
    }
});