//TODO: record en el menú

//TODO: add another line to slabs

//TODO: animation of falling to the map at the beginning

// Block types

const LONG = 0;
const SHORT = 1;


// Player states

const IDLE = 0;
const MOVING = 1;
const FALLING = 2;
const WINNING = 3;
const SPLITING = 4;

// Movement directions

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;


let player = {
    block_type: LONG,
    chosen_block: 0, // 0 | 1
    position: [ vec3(0, 0, 0), vec3(0, 1, 0) ],

    state: IDLE,
    animation: null, // { direction, remaining_time, angular_speed }
};

let player_action = {
    left:  false, // -x
    right: false, // +x
    up:    false, // -z
    down:  false, // +z
};

function reset_player_action() {
    player_action.left = false;
    player_action.right = false;
    player_action.up = false;
    player_action.down = false;
}

function is_block_standing(player) {
    const [[x0, y0, z0], [x1, y1, z1]] = player.position;
    return x1 === x0 && z1 === z0;
}

function move_player_position_long(dx, dz) {
    const [[x0, y0, z0], [x1, y1, z1]] = player.position;

    if (y0 === 1 && y1 === 0) {
        player.position = [
            vec3(x0 + 2 * dx, 0, z0 + 2 * dz),
            vec3(x1 + dx, 0, z1 + dz)
        ];
    }
    else if (y0 === 0 && y1 === 1) {
        player.position = [
            vec3(x0 + dx, 0, z0 + dz),
            vec3(x1 + 2 * dx, 0, z1 + 2 * dz)
        ];
    }
    else if (dx !== 0) { //y0 === 0 && y1 === 0
        if (x0 < x1 && dx < 0 || x0 > x1 && dx > 0) {
            player.position = [
                vec3(x0 + dx, 0, z0),
                vec3(x1 + 2 * dx, 1, z1)
            ];
        } else if (x0 > x1 && dx < 0 || x0 < x1 && dx > 0) {
            player.position = [
                vec3(x0 + 2 * dx, 1, z0),
                vec3(x1 + dx, 0, z1)
            ];
        } else {
            player.position = [
                vec3(x0 + dx, 0, z0),
                vec3(x1 + dx, 0, z1)
            ];
        }
    }
    else if (dz !== 0) { //y0 === 0 && y1 === 0
        if (z0 < z1 && dz < 0 || z0 > z1 && dz > 0) {
            player.position = [
                vec3(x0, 0, z0 + dz),
                vec3(x1, 1, z1 + 2 * dz)
            ];
        } else if (z0 > z1 && dz < 0 || z0 < z1 && dz > 0) {
            player.position = [
                vec3(x0, 1, z0 + 2 * dz),
                vec3(x1, 0, z1 + dz)
            ];
        } else {
            player.position = [
                vec3(x0, 0, z0 + dz),
                vec3(x1, 0, z1 + dz)
            ];
        }
    }
}

function move_player_position_short(dx, dz) {
    const [x, y, z] = player.position[player.chosen_block];
    player.position[player.chosen_block] = vec3(x + dx, y, z + dz);
}

function move_player_position(dx, dz) {
    game_state.move_counter += 1;
    update_in_game_panel_state(game_state);
    if (player.block_type == LONG) { move_player_position_long(dx, dz); }
    else { move_player_position_short(dx, dz); }
}

function get_distance_to_rotation_edge(dx, dz) {
    const [[x0, y0, z0], [x1, y1, z1]] = player.position;

    if (player.block_type === LONG) {
        if (y0 === 1 && y1 === 0) {
            return [0.5, 1.5];
        }
        else if (y0 === 0 && y1 === 1) {
            return [0.5, 0.5];
        }
        else if (dx !== 0 && (x0 > x1 && dx < 0 || x0 < x1 && dx > 0)) {
            return [1.5, 0.5];
        }
        else if (dz !== 0 && (z0 > z1 && dz < 0 || z0 < z1 && dz > 0)) {
            return [1.5, 0.5];
        }
    }
    
    return [0.5, 0.5];
}

function get_longblock_rotation() {
    const [[x0, y0, z0], [x1, y1, z1]] = player.position;

    if (y0 > y1) {
        return rotate(180.0, vec3(1, 0, 0));
    }
    else if (y0 < y1) {
        return new mat4();
    }
    else if (x0 > x1) {
        return rotate(90.0, vec3(0, 0, 1));
    } else if (x0 < x1) {
        return rotate(270.0, vec3(0, 0, 1));
    } else if (z0 > z1) {
        return rotate(270.0, vec3(1, 0, 0));
    } else if (z0 < z1) {
        return rotate(90.0, vec3(1, 0, 0));
    }
}

let game_state = {
    level: 1,
    matrix: null, // 10 x 15
    
    move_counter: 0,
    attempts: 0,
    timer: {
        minutes: 0,
        seconds: 0,
        hours: 0,
    },
};

function reset_game_state() {
    game_state = {
        level: 1,
        matrix: null, // 10 x 15
        
        move_counter: 0,
        attempts: 0,
        timer: {
            hours: 0,
            minutes: 0,
            seconds: 0,
        },
    };
}

let timer_interval_id = null;

function start_timer() {
    clearInterval(timer_interval_id);
    timer_interval_id = setInterval(function() {
        game_state.timer.seconds += 1;
        if (game_state.timer.seconds === 60) {
            game_state.timer.seconds = 0;
            game_state.timer.minutes += 1;
            if (game_state.timer.minutes === 60) {
                game_state.timer.minutes = 0;
                game_state.timer.hours += 1;
            }
        }
        update_in_game_panel_state(game_state);
    }, 1000);
}

function stop_timer() {
    clearInterval(timer_interval_id);
}


// Floor types

const AIR = 0;
const PLAIN = 1;
const FRAGILE = 2;
const BUTTON = 3;
const SPLIT = 4;
const SWITCHED = 5;
const HOLE = 6;


// Button activation

const HEAVY = 0;
const SOFT = 1;

// Floor generators

function air() { return { type: AIR }; }

function plain() { return { type: PLAIN }; }

function fragile() { return { type: FRAGILE }; }

function button(activation, open, close, toggle) {
    return {
        type: BUTTON,
        activation: activation,
        open: open,
        close: close,
        toggle: toggle
    };
}

function split(p1, p2) { return { type: SPLIT, p1: p1, p2: p2 }; }

function switched(active) { return { type: SWITCHED, active: active}; }

function hole() { return { type: HOLE }; } 


const SWITCHED_OFF = 0;
const SWITCHED_ON = 1;

const SWITCH_TIME = 0.15;

function activate_button(button) {
    let opened = false;
    let closed = false;
    if (button.open) {
        button.open.forEach((tile) => {
            const pre_active = tile.active;
            tile.active = true;
            opened |= !pre_active;
            animation_array.push({
                type: SWITCHED_ON,
                remaining_time: SWITCH_TIME,
                falling_speed: 50.0,
                falling_distance: 5,
                affected_objects: tile.affected_objects,
                pre_active: pre_active,
            })
        });
    }
    if (button.close) {
        button.close.forEach((tile) => {
            const pre_active = tile.active;
            closed |= pre_active;
            tile.active = false;
            animation_array.push({
                type: SWITCHED_OFF,
                remaining_time: SWITCH_TIME,
                falling_speed: 0.0,
                falling_distance: 0.0,
                affected_objects: tile.affected_objects,
                pre_active: pre_active,
            })
        });
    }
    if (button.toggle) {
        button.toggle.forEach((tile) => {
            const pre_active = tile.active;
            tile.active = !tile.active;

            closed |= tile.active;
            opened |= !tile.active;

            animation_array.push({
                type: tile.active ? SWITCHED_ON : SWITCHED_OFF,
                remaining_time: SWITCH_TIME,
                falling_speed: tile.active ? 50 : 0.0,
                falling_distance: tile.active ? 2 : 0.0,
                affected_objects: tile.affected_objects,
                pre_active: pre_active,
            })
        });
    }

    if (opened) {
        play_sound(SOUNDS.switched_off);
    }
    if (closed) {
        play_sound(SOUNDS.switched_on);
    }
}


// After movement function

const BOTH_BLOCKS_FALL = -1;
const NO_BLOCK_FALL = -2;
const FRAGILE_BLOCK_FALLS = -3;

let last_pressing_tile = [null, null];

function get_movement_sound_of_tile(tile) {
    if (tile.type === SWITCHED && tile.active) {
        return [SWITCHED, [SOUNDS.block_move_bridge_1,
                           SOUNDS.block_move_bridge_2,
                           SOUNDS.block_move_bridge_3]];
    }

    if (tile.type === BUTTON) {
        return [BUTTON, null];
    }

    if (tile.type === PLAIN) {
        // if (player.block_type === LONG) {
        //     return [PLAIN, [SOUNDS.block_move_1,
        //                     SOUNDS.block_move_2,
        //                     SOUNDS.block_move_3]];
        // }
        // else {
            return [PLAIN, [SOUNDS.block_move_cube_1,
                            SOUNDS.block_move_cube_2]];
        // }
    }

    if (tile.type === FRAGILE) {
        return [FRAGILE, [SOUNDS.block_move_fragile_1,
                        SOUNDS.block_move_fragile_2]];
    }

    return [null, null];
}

function movement_sound_two_tiles(tile0, tile1) {
    const [t0, s0] = get_movement_sound_of_tile(tile0);
    const [t1, s1] = get_movement_sound_of_tile(tile1);

    if (t0 === BUTTON || t1 === BUTTON) {
        return;
    }

    if (t0 === SWITCHED || (t1 !== SWITCHED && (t0 === FRAGILE || (t0 === PLAIN && t1 !== FRAGILE))))
    {
        play_one_sound_from_set(s0);
    }
    else if (s1 !== null) {
        play_one_sound_from_set(s1);
    }
}

function movement_sound_one_tile(tile) {
    const [type, sounds] = get_movement_sound_of_tile(tile);
    if (sounds !== null) {
        play_one_sound_from_set(sounds);
    }
}

function get_after_movement_state() {

    const i0 = player.position[0][2];
    const j0 = player.position[0][0];
    const i1 = player.position[1][2];
    const j1 = player.position[1][0];

    // --- Before evaluation, check if blocks have to regroup ------------------

    if (player.block_type === SHORT &&
        (Math.abs(i0 - i1) + Math.abs(j0 - j1) === 1))
    {
        player.block_type = LONG;
        player.chosen_block = 0;

        previsualization_events.block_mixed = true;
    }

    // --- Then check matrix limits --------------------------------------------

    function between(a, x, b) { return x >= a && x <= b; }

    const tile0_out = !between(0, i0, LEVEL_MATRIX.H - 1) || !between(0, j0, LEVEL_MATRIX.W - 1);
    const tile1_out = !between(0, i1, LEVEL_MATRIX.H - 1) || !between(0, j1, LEVEL_MATRIX.W - 1);

    if (tile0_out && tile1_out) { return [FALLING, BOTH_BLOCKS_FALL]; }
    else if (tile0_out) {
        const tile1 = game_state.matrix[i1][j1];
        if (player.block_type === LONG && tile1.type === BUTTON && tile1.activation === SOFT)
        {
            play_sound(SOUNDS.soft_button);
            activate_button(tile1);
        }
        else {
            movement_sound_one_tile(tile1);
        }
        return [FALLING, 0];
    }
    else if (tile1_out) {
        const tile0 = game_state.matrix[i0][j0];
        if (player.block_type === LONG && tile0.type === BUTTON && tile0.activation === SOFT)
        {
            play_sound(SOUNDS.soft_button);
            activate_button(tile0);
        }
        else {
            movement_sound_one_tile(tile0);
        }
        return [FALLING, 1];
    }

    const tile0 = game_state.matrix[i0][j0];
    const tile1 = game_state.matrix[i1][j1];

    // --- First consider staying at one tile ----------------------------------

    if (is_block_standing(player)) {
        movement_sound_one_tile(tile0);
        switch (tile0.type) {

            case PLAIN:
                return [IDLE, NO_BLOCK_FALL];

            case HOLE:
                return [WINNING, BOTH_BLOCKS_FALL];

            case FRAGILE:
                return [FALLING, FRAGILE_BLOCK_FALLS];

            case AIR:
                return [FALLING, BOTH_BLOCKS_FALL];

            case BUTTON:
                activate_button(tile0);
                return [IDLE, NO_BLOCK_FALL];

            case SPLIT: 
                player.position = [tile0.p1, tile0.p2];
                player.block_type = SHORT;
                player.chosen_block = 0;
                previsualization_events.change_chosen_block = true;
                return [SPLITING, NO_BLOCK_FALL];
            
            case SWITCHED:
                return [tile0.active ? IDLE : FALLING, BOTH_BLOCKS_FALL];
        }
    }

    movement_sound_two_tiles(tile0, tile1);

    // --- Check if player pressed a soft button -------------------------------

    if ((player.chosen_block === 0 || player.block_type === LONG) &&
        tile0.type === BUTTON && tile0.activation === SOFT &&
        last_pressing_tile[0] !== player.position[0])
    {
        play_sound(SOUNDS.soft_button);
        activate_button(tile0);
        last_pressing_tile[0] = player.position[0];
    }
    else if (last_pressing_tile[0] !== player.position[0]) {
        last_pressing_tile[0] = null;
    }

    if ((player.chosen_block === 1 || player.block_type === LONG) &&
        tile1.type === BUTTON && tile1.activation === SOFT &&
        last_pressing_tile[1] !== player.position[1])
    {
        play_sound(SOUNDS.soft_button);
        activate_button(tile1);
        last_pressing_tile[1] = player.position[1];
    }
    else if (last_pressing_tile[1] !== player.position[1]) {
        last_pressing_tile[1] = null;
    }

    // -------------------------------------------------------------------------
    
    const tile0_falls = tile0.type === AIR || (tile0.type === SWITCHED && !tile0.active);
    const tile1_falls = tile1.type === AIR || (tile1.type === SWITCHED && !tile1.active);

    if (tile0_falls && tile1_falls) { return [FALLING, BOTH_BLOCKS_FALL]; }
    else if (tile0_falls) { return [FALLING, 0]; }
    else if (tile1_falls) { return [FALLING, 1]; }

    return [IDLE, NO_BLOCK_FALL];
}


// Level info

const NUM_LEVELS = 33;

const LEVEL_INITIAL_POSITION = [
    [ vec3(3, 0, 3), vec3(3, 1, 3) ], // 1
    [ vec3(1, 0, 5), vec3(1, 1, 5) ], // 2
    [ vec3(1, 0, 4), vec3(1, 1, 4) ], // 3
    [ vec3(1, 0, 6), vec3(1, 1, 6) ], // 4
    [ vec3(13, 0, 1), vec3(13, 1, 1) ], // 5
    [ vec3(0, 0, 3), vec3(0, 1, 3) ], // 6
    [ vec3(1, 0, 4), vec3(1, 1, 4) ], // 7
    [ vec3(1, 0, 4), vec3(1, 1, 4) ], // 8
    [ vec3(1, 0, 4), vec3(1, 1, 4) ], // 9
    [ vec3(10, 0, 1), vec3(10, 1, 1) ], // 10
    [ vec3(2, 0, 5), vec3(2, 1, 5) ], // 11
    [ vec3(3, 0, 6), vec3(3, 1, 6) ], // 12
    [ vec3(12, 0, 3), vec3(12, 1, 3) ], // 13
    [ vec3(4, 0, 2), vec3(4, 1, 2) ], // 14
    [ vec3(1, 0, 8), vec3(1, 1, 8) ], // 15
    [ vec3(3, 0, 8), vec3(3, 1, 8) ], // 16
    [ vec3(1, 0, 1), vec3(1, 1, 1) ], // 17
    [ vec3(2, 0, 4), vec3(2, 1, 4) ], // 18
    [ vec3(1, 0, 0), vec3(1, 1, 0) ], // 19
    [ vec3(8, 0, 2), vec3(8, 1, 2) ], // 20
    [ vec3(1, 0, 3), vec3(1, 1, 3) ], // 21
    [ vec3(2, 0, 3), vec3(2, 1, 3) ], // 22
    [ vec3(4, 0, 7), vec3(4, 1, 7) ], // 23
    [ vec3(2, 0, 3), vec3(2, 1, 3) ], // 24
    [ vec3(1, 0, 7), vec3(1, 1, 7) ], // 25
    [ vec3(10, 0, 5), vec3(10, 1, 5) ], // 26
    [ vec3(1, 0, 1), vec3(1, 1, 1) ], // 27
    [ vec3(2, 0, 2), vec3(2, 1, 2) ], // 28
    [ vec3(7, 0, 3), vec3(7, 1, 3) ], // 29
    [ vec3(2, 0, 4), vec3(2, 1, 4) ], // 30
    [ vec3(12, 0, 7), vec3(12, 1, 7) ], // 31
    [ vec3(11, 0, 6), vec3(11, 1, 6) ], // 32
    [ vec3(1, 0, 3), vec3(1, 1, 3) ], // 33
];

const LEVEL_MATRIX = {
    W: 15,
    H: 10,
    generate_matrix: [
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            return [ // Level 1
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, p, p, p, _, _, _, _, _, _, _, _, _, _],
                [_, _, p, p, p, p, p, p, _, _, _, _, _, _, _],
                [_, _, p, p, p, p, p, p, p, p, p, _, _, _, _],
                [_, _, _, p, p, p, p, p, p, p, p, p, _, _, _],
                [_, _, _, _, _, _, p, p, H, p, p, _, _, _, _],
                [_, _, _, _, _, _, _, p, p, p, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const O = button(SOFT, null, null, [ S1 ]);
            const S2 = switched(false);
            const X = button(HEAVY, null, null, [ S2 ]);
            return [ // Level 2
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, p, p, p, p, _, _, p, p, p],
                [p, p, p, p, _, _, p, p, X, p, _, _, p, H, p],
                [p, p, O, p, _, _, p, p, p, p, _, _, p, p, p],
                [p, p, p, p, _, _, p, p, p, p, _, _, p, p, p],
                [p, p, p, p, S1,S1,p, p, p, p, S2,S2,p, p, p],
                [p, p, p, p, _, _, p, p, p, p, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            return [ // Level 3
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, p, p, p, p, p, p, p, _, _],
                [p, p, p, p, _, _, p, p, p, _, _, p, p, _, _],
                [p, p, p, p, p, p, p, p, p, _, _, p, p, p, p],
                [p, p, p, p, _, _, _, _, _, _, _, p, p, H, p],
                [p, p, p, p, _, _, _, _, _, _, _, p, p, p, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, p, p, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const f = fragile();
            const H = hole();
            return [ // Level 4
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, f, f, f, f, f, f, f, _, _, _, _, _],
                [_, _, _, f, f, f, f, f, f, f, _, _, _, _, _],
                [p, p, p, p, _, _, _, _, _, p, p, p, _, _, _],
                [p, p, p, _, _, _, _, _, _, _, p, p, _, _, _],
                [p, p, p, _, _, _, _, _, _, _, p, p, _, _, _],
                [p, p, p, _, _, p, p, p, p, f, f, f, f, f, _],
                [p, p, p, _, _, p, p, p, p, f, f, f, f, f, _],
                [_, _, _, _, _, p, H, p, _, _, f, f, p, f, _],
                [_, _, _, _, _, p, p, p, _, _, f, f, f, f, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const S3 = switched(true);
            const O1 = button(SOFT, null, null, [ S1 ]);
            const O2 = button(SOFT, [ S3 ], null, null);
            const O3 = button(SOFT, null, [ S3 ], null);
            const O4 = button(SOFT, null, null, [ S3 ]);
            return [ // Level 5
                [_, _, _, _, _, _, _, _, _, _, _, p, p, p, p],
                [_, p, p, p, p, S1,S1,p, O1,p, p, p, p, p, p],
                [_, p, p, p, p, _, _, _, _, _, _, _, p, p, p],
                [_, p, p, O2,p, _, _, _, _, _, _, _, _, _, _],
                [_, p, p, p, p, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, p, p, p, O3,p, S2,S2,p, p, p, _, _],
                [_, _, _, _, _, _, _, _, _, _, p, p, p, p,O4],
                [p, p, p, _, _, _, _, _, _, _, p, p, p, p, p],
                [p, H, p, p, p, S3,S3,p, p, p, p, p, p, _, _],
                [p, p, p, p, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            return [ // Level 6
                [_, _, _, _, _, p, p, p, p, p, p, _, _, _, _],
                [_, _, _, _, _, p, _, _, p, p, p, _, _, _, _],
                [_, _, _, _, _, p, _, _, p, p, p, p, p, _, _],
                [p, p, p, p, p, p, _, _, _, _, _, p, p, p, p],
                [_, _, _, _, p, p, p, _, _, _, _, p, p, H, p],
                [_, _, _, _, p, p, p, _, _, _, _, _, p, p, p],
                [_, _, _, _, _, _, p, _, _, p, p, _, _, _, _],
                [_, _, _, _, _, _, p, p, p, p, p, _, _, _, _],
                [_, _, _, _, _, _, p, p, p, p, p, _, _, _, _],
                [_, _, _, _, _, _, _, p, p, p, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const X = button(HEAVY, null, null, [S1]);
            return [ // Level 7
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, p, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, p, p, p, p, _, _, _],
                [p, p, p, _, _, _, _, _, p, _, _, p, p, p, p],
                [p, p, p, p, p, p, p, p, p, _, _, _, p, H, p],
                [p, p, p, _, _, _, _, p, p, X, _, _, p, p, p],
                [p, p, p, _, _, _, _, p, p, p, _, _, p, p, p],
                [_, p, p, S1, _, _, _, p, _, _, _, _, _, _, _],
                [_, _, p, p, p, p, p, p, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const U = split(vec3(10, 0, 1), vec3(10, 0, 7));
            return [ // Level 8
                [_, _, _, _, _, _, _, _, _, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, _, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, _, p, p, p, _, _, _],
                [p, p, p, p, p, p, _, _, _, p, p, p, p, p, p],
                [p, p, p, p, U, p, _, _, _, p, p, p, p, H, p],
                [p, p, p, p, p, p, _, _, _, p, p, p, p, p, p],
                [_, _, _, _, _, _, _, _, _, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, _, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, _, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const U = split(vec3(2, 0, 4), vec3(12, 0, 4));
            return [ // Level 9
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [p, p, p, p, _, _, _, p, _, _, _, p, p, p, p],
                [p, p, p, p, _, _, _, p, _, _, _, p, p, U, p],
                [p, p, p, p, p, p, p, p, p, p, p, p, p, p, p],
                [_, _, _, _, _, _, p, H, p, _, _, _, _, _, _],
                [_, _, _, _, _, _, p, p, p, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const U = split(vec3(13, 0, 1), vec3(10, 0, 1));
            const S1 = switched(false);
            const S2 = switched(false);
            const S3 = switched(false);
            const O = button(SOFT, null, null, [ S3 ]);
            const X = button(HEAVY, null, null, [ S1, S2 ]);
            return [ // Level 10
                [_, p, p, p, _, _, _, _, _, p, p, p, p, p, p],
                [_, p, H, p, S3,S3,p, S1,S1,p, p, p, p, U, p],
                [_, p, p, p, _, _, _, _, _, p, p, p, p, S2,_],
                [_, _, _, _, _, _, _, _, _, _, p, p, p, S2,_],
                [_, _, _, _, _, _, _, _, _, _, _, _, p, p, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, p, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, p, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, p, p, _],
                [_, _, _, _, _, p, p, p, p, p, _, _, p, p, _],
                [_, _, _, _, _, p, O, _, _, p, p, p, X, p, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const O = button(SOFT, null, [ S1 ], null);
            return [ // Level 11
                [_, _, _, p, p, p, S1,_, _, _, _, _, _, _, _],
                [_, _, _, p, H, p, S1,_, _, _, _, _, _, _, _],
                [_, _, _, p, p, p, _, _, _, _, _, _, _, _, _],
                [_, _, _, p, _, _, _, p, p, p, p, p, p, _, _],
                [_, _, _, p, _, _, _, p, p, _, _, p, p, _, _],
                [_, _, p, p, p, p, p, p, p, _, _, p, p, p, _],
                [_, _, _, _, _, _, _, p, O, _, _, _, _, p, _],
                [_, _, _, _, _, _, _, p, p, p, p, _, _, p, _],
                [_, _, _, _, _, _, _, p, p, p, p, p, p, p, _],
                [_, _, _, _, _, _, _, _, _, _, p, p, p, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const X1 = button(HEAVY, null, null, [ S1 ]);
            const X2 = button(HEAVY, null, null, [ S2 ]);
            return [ // Level 12
                [_, _, _, _, _, _, _, _, _, _, _, _, _, X2,_],
                [_, _, _, _, _, _, p, p, p, _, _, p, p, p, _],
                [_, _, _, _, _, _, p, X1,p, p, p, p, p, S1,_],
                [_, _, _, _, p, p, p, p, p, _, _, p, p, _, _],
                [_, _, _, _, p, H, p, S2,_, _, _, p, p, _, _],
                [_, _, p, p, p, p, p, _, _, _, p, p, p, p, _],
                [_, p, p, p, p, _, _, _, _, _, p, p, p, p, _],
                [_, p, p, p, p, _, _, p, p, p, p, p, _, _, _],
                [_, _, _, _, _, _, p, p, p, _, _, _, _, _, _],
                [_, _, _, _, _, _, p, p, p, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const f = fragile();
            return [ // Level 13
                [_, p, p, p, f, p, p, p, p, f, p, p, p, p, _],
                [_, p, p, _, _, _, _, _, _, _, _, p, p, p, _],
                [_, p, p, _, _, _, _, _, _, _, _, _, p, p, p],
                [_, p, p, p, _, _, _, p, p, p, _, _, p, p, p],
                [_, p, p, p, f, f, f, p, H, p, _, _, p, p, p],
                [_, p, p, p, _, _, f, p, p, p, _, _, p, _, _],
                [_, _, _, p, _, _, f, f, f, f, f, p, p, _, _],
                [_, _, _, p, p, p, f, f, p, f, f, f, _, _, _],
                [_, _, _, _, p, p, f, f, f, f, f, f, _, _, _],
                [_, _, _, _, p, p, p, _, _, p, p, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const X1 = button(HEAVY, null, null, [ S1 ]);
            const X2 = button(HEAVY, null, null, [ S2 ]);
            return [ // Level 14
                [_, _, _, _, _, _, _, _, p, p, p, _, _, _, _],
                [_, _, _, p, p, p, _, _, p, p, p, _, _, _, _],
                [p, S1,S1,p, p, p, p, p, p, p, p, p, p, p, _],
                [p, S2,S2,p, p, p, _, _, _, _, _, _, X1,p, _],
                [p, _, _, _, _, _, _, _, _, _, _, _, p, p, _],
                [p, _, _, _, _, _, _, _, _, _, _, _, p, p, _],
                [p, _, _, _, _, _, _, _, p, p, p, p, p, p, _],
                [p, p, p, p, p, _, _, _, p, p, p, _, _, _, _],
                [_, p, p, H, p, _, _, _, p, p, p, _, _, _, _],
                [_, _, p, p, p, _, _, _, p, p, p, p, p, X2,_]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const S3 = switched(false);
            const S4 = switched(false);
            const X1 = button(HEAVY, null, null, [ S2, S4]);
            const O1 = button(SOFT, null, null, [ S2, S3 ]);
            const O2 = button(SOFT, null, [ S1 ], null);
            const O3 = button(SOFT, null, [ S1 ], null);
            const U = split(vec3(13, 0, 1), vec3(1, 0, 8));
            return [ // Level 15
                [_, _, _, _, _, _, _, p, p, p, _, _, p, p, p],
                [_, _, _, _, p, S2,S2,p, p, p, S3,S3,X1,p, p],
                [p, p, S4,S4,p, _, _, p, p, p, _, _, p, p, p],
                [p, p, p, p, p, _, _, _, O1,_, _, _, _, _, _],
                [p, p, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, p, _, _, _, _, _, U, _, _, _, _, _, _, _],
                [_, p, _, _, _, _, _, p, _, _, _, _, _, _, _],
                [p, p, p, _, _, _, p, p, p, _, _, O2,p, p, _],
                [p, p, p, p, p, p, p, p, p, S1,S1,p, H, p, _],
                [p, p, p, _, _, _, p, p, p, _, _, O3,p, p, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const X1 = button(HEAVY, [ S1 ], null, null);
            const X2 = button(HEAVY, [ S2 ], null, null);
            const U1 = split(vec3(2, 0, 3), vec3(1, 0, 2));
            const U2 = split(vec3(7, 0, 3), vec3(5, 0, 3));
            const U3 = split(vec3(2, 0, 3), vec3(0, 0, 3));
            const U4 = split(vec3(1, 0, 4), vec3(0, 0, 3));
            const U5 = split(vec3(1, 0, 2), vec3(0, 0, 3));
            return [ // Level 16
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, U2,_, _, _, _, _, _, _, _, p, p, p, _, _],
                [U1,p, U3,S1,S1,X1,X2,p, S2,S2,p, H, p, _, _],
                [_, U4,_, _, _, _, _, _, _, _, p, p, p, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, p, p, p, _, _, _, p, p, p, _, _, _, _],
                [_, _, p, p, p, p, p, p, p, U5,p, _, _, _, _],
                [_, _, p, p, p, _, _, _, p, p, p, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const S3 = switched(false);
            const S4 = switched(false);
            const X1 = button(HEAVY, null, [ S4 ], null);
            const X2 = button(HEAVY, [ S4 ], null, null);
            const X3 = button(HEAVY, [ S2 ], null, null);
            const X4 = button(HEAVY, [ S3 ], [ S1 ], null);
            const O = button(SOFT, null, null, [ S1 ]);
            return [ // Level 17
                [p, p, p, _, _, _, _, _, _, _, _, _, _, _, _],
                [p, p, p, p, p, p, p, p, p, S3,_, _, p, p, p],
                [p, p, p, _, _, _, _, S2,p, p, p, p, p, H, p],
                [p, p, p, _, _, _, _, _, _, _, _, _, X1,X2,p],
                [p, p, p, _, _, _, _, _, _, _, _, _, _, _, _],
                [p, p, p, _, _, _, _, _, _, _, _, _, _, _, _],
                [p, p, p, _, _, _, S4,p, p, p, p, p, X3,_, _],
                [p, p, p, p, p, p, p, p, S1,_, _, p, p, _, _],
                [p, O, p, _, _, _, _, _, _, _, _, p, p, _, _],
                [p, p, p, _, _, _, _, _, _, _, _, p, X4,_, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const S3 = switched(false);
            const S4 = switched(false);
            const X = button(HEAVY, null, null, [ S4 ]);
            const O1 = button(SOFT, null, [ S2, S3 ], null);
            const O2 = button(SOFT, null, [ S1 ], null);
            const O3 = button(SOFT, null, [ S2, S3 ], null);
            const O4 = button(SOFT, [ S1 ], null, null);
            const O5 = button(SOFT, [ S2, S3 ], null, null);
            return [ // Level 18
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, O4,_, _, _, _, _, _, _],
                [p, p, O1,p, _, _, _, p, _, _, _, _, _, _, _],
                [p, p, p, p, p, _, _, p, _, _, _, _, _, _, _],
                [p, O2,p, p, p, p, p, p, S1,S1,p, p, S2,S2,p],
                [p, p, p, p, p, S4,_, _, p, _, _, _, p, _, _],
                [p, p, O3,p, _, _, _, _, p, _, _, _, p, _, _],
                [p, _, _, _, _, _, _, _, O5,_, _, p, p, p, _],
                [p, _, _, _, _, _, _, _, _, _, p, p, H, p, _],
                [p, S3,S3,X, _, _, _, _, _, _, p, p, p, p, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(false);
            const O1 = button(SOFT, null, null, [ S2 ]);
            const O2 = button(SOFT, null, [ S1 ], null);
            const O3 = button(SOFT, [ S1 ], null, null);
            return [ // Level 19
                [_, p, p, p, p, p, p, p, p, p, O1,p, p, p, p],
                [_, _, _, _, _, p, p, _, _, _, _, _, _, p, p],
                [_, _, _, _, _, p, p, _, _, _, _, _, _, p, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, p, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, p, p],
                [p, p, p, _, _, p, p, S2,S2,p, O2,p, p, p, p],
                [p, H, p, _, _, p, p, _, _, _, _, _, _, _, _],
                [p, p, p, _, _, p, p, _, _, _, _, _, _, _, _],
                [_, p, p, _, _, p, p, _, _, _, _, _, _, _, _],
                [_, p, S1,S1,p, p, p, p, p, p, O3,p, p, p, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(false);
            const S3 = switched(false);
            const O1 = button(SOFT, null, null, [ S3 ]);
            const O2 = button(SOFT, null, [ S1 ], null);
            const O3 = button(SOFT, null, [ S1 ], null);
            const O4 = button(SOFT, null, [ S1 ] , null);
            const O5 = button(SOFT, null, null, [ S2 ]);
            const U = split(vec3(13, 0, 1), vec3(13, 0, 7));
            return [ // Level 20
                [_, _, _, _, _, _, _, _, _, _, _, _, p, p, p],
                [_, _, p, p, p, S1,S1,p, p, p, S3,S3,p, p, p],
                [_, _, p, p, p, _, _, O3,p, p, _, _, p, p, p],
                [_, _, p, p, p, _, _, p, p, p, _, _, _, _, _],
                [_, _, p, O2,p, _, _, U, p, O4,_, _, _, _, _],
                [_, _, p, p, p, _, _, p, p, p, _, _, _, _, _],
                [p, p, p, p, _, _, _, p, p, p, S2,S2,O5,p, p],
                [p, O1,_, _, _, _, _, _, _, _, _, _, p, p, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, p, H, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, p, p, p]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const X1 = button(HEAVY, null, null, [ S1 ]);
            const X2 = button(HEAVY, null, null, [ S2 ]);
            return [ // Level 21
                [_, _, _, _, _, _, _, _, p, p, _, _, _, _, _],
                [_, _, _, _, _, _, _, p, p, p, _, _, _, _, _],
                [p, p, _, _, p, p, p, p, p, p, _, _, _, _, _],
                [p, p, p, p, p, p, _, _, p, _, _, _, _, _, _],
                [p, p, p, p, _, _, _, _, p, _, _, _, p, p, p],
                [_, p, p, _, _, _, _, _, X1,p, p, p, p, H, p],
                [_, _, p, _, _, _, _, _, X2,p, _, _, p, p, p],
                [_, _, p, p, p, S2,_, _, p, p, _, _, _, _, _],
                [_, _, _, p, p, p, _, _, p, p, _, _, _, _, _],
                [_, _, _, S1,p, p, p, p, p, p, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const S3 = switched(true);
            const X1 = button(HEAVY, null, null, [ S1 ]);
            const X2 = button(HEAVY, null, null, [ S2 ]);
            const O1 = button(SOFT, null, [ S1, S2 ], null);
            const O2 = button(SOFT, null, [ S1, S2 ], null);
            return [ // Level 22
                [_, _, _, _, _, _, p, p, _, _, _, _, p, p, p],
                [_, _, _, _, p, p, p, p, p, p, _, _, p, H, p],
                [_, p, p, p, p, p, p, O2,p, p, p, p, p, p, p],
                [_, p, p, p, p, O1,_, _, p, p, p, p, p, S1,_],
                [_, p, p, p, _, _, _, _, _, _, p, p, p, _, _],
                [_, _, p, _, _, _, _, _, _, _, _, p, _, _, _],
                [_, _, p, _, _, _, _, _, _, _, _, p, _, _, _],
                [_, _, p, S2,_, _, _, _, _, _, S3,p, _, _, _],
                [_, _, p, p, _, _, _, _, _, _, p, p, _, _, _],
                [_, _, _, X1,_, _, _, _, _, _, X2,_, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const f = fragile();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const S3 = switched(false);
            const S4 = switched(false);
            const S5 = switched(false);
            const S6 = switched(false);
            const X = button(HEAVY, [ S6 ], null, null);
            const O1 = button(SOFT, [ S5 ], [ S3 ], null);
            const O2 = button(SOFT, [ S3 ], null, [ S4 ]);
            const O3 = button(SOFT, null, [ S1, S2 ], null);
            const U = split(vec3(12, 0, 7), vec3(2, 0, 2));
            return [ // Level 23
                [_, p, p, p, _, _, _, _, _, _, _, _, p, p, p],
                [_, p, X, p, _, _, _, _, _, _, _, _, p, O2,p],
                [_, p, p, p, _, _, _, p, p, p, S2,S2,p, p, p],
                [S5,p, p, p, S6,_, _, p, H, p, _, _, p, p, O3],
                [p, _, _, _, p, _, _, p, p, p, _, _, _, _, p],
                [O1,_, _, _, p, _, _, f, f, f, _, _, _, _, p],
                [p, S3,S3,p, p, p, f, f, f, f, f, p, p, p, S1],
                [_, _, _, p, p, p, f, f, f, f, f, p, U, p, _],
                [_, _, _, p, p, p, f, f, f, f, f, p, p, p, _],
                [_, _, _, p, p, p, p, p, S4,_, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(false);
            const S3 = switched(false);
            const S4 = switched(false);
            const X1 = button(HEAVY, [ S1 ], null, null);
            const X2 = button(HEAVY, [ S3 ], null, null);
            const X3 = button(HEAVY, [ S2 ], null, null);
            const X4 = button(HEAVY, [ S4 ], null, null);
            const U = split(vec3(6, 0, 7), vec3(8, 0, 7));
            return [ // Level 24
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, p, p, p, p],
                [_, _, _, _, S1,p, p, p, p, p, p, p, X3,p, U],
                [_, _, p, S2,S2,p, X2,p, _, _, _, p, p, p, p],
                [_, X1,p, _, _, p, p, _, _, _, _, _, _, p, _],
                [_, p, p, _, _, p, _, _, _, _, _, _, _, p, _],
                [_, p, p, p, p, p, _, _, _, _, _, p, p, p, _],
                [_, p, p, p, _, _, p, p, p, S4,S4,p, H, p, _],
                [_, _, _, _, _, _, X4,p, S3,_, _, p, p, p, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(false);
            const S2 = switched(true);
            const S3 = switched(true);
            const S4 = switched(false);
            const S5 = switched(false);
            const X1 = button(HEAVY, [ S1 ], null, null);
            const O1 = button(SOFT, null, null, [ S1, S5 ]);
            const O2 = button(SOFT, [ S4 ], [ S2 ], null);
            return [ // Level 25
                [_, _, p, p, _, _, _, _, _, _, _, _, _, _, _],
                [_, _, p, p, p, _, _, _, _, _, _, _, _, _, _],
                [_, _, p, p, O1,_, _, _, _, _, p, p, p, S5,_],
                [_, _, _, p, p, p, p, S4,_, _, p, H, p, S5,_],
                [_, _, _, _, _, _, p, p, S1,S1,p, p, p, _, _],
                [_, p, p, _, _, _, p, p, _, _, _, _, _, _, _],
                [p, p, X1,p, S2,S2,p, p, _, _, _, _, _, _, _],
                [p, p, S3,_, _, _, p, p, _, _, _, p, p, p, _],
                [p, p, S3,_, _, _, p, p, O2,p, p, p, p, p, _],
                [_, _, _, _, _, _, _, _, _, _, _, p, p, p, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(false);
            const X = button(HEAVY, [ S2 ], null, null);
            const O = button(SOFT, null,  [ S1 ], null);
            const U = split(vec3(12, 0, 3), vec3(10, 0, 5));
            return [ // Level 26
                [_, _, _, _, _, p, p, p, p, _, _, _, _, U, _],
                [_, _, _, _, _, p, p, O, p, p, p, _, _, p, _],
                [_, _, _, _, p, p, p, p, p, p, p, _, _, p, _],
                [p, p, S1,S1,p, p, p, p, _, _, p, p, p, p, _],
                [p, p, p, S2,_, _, p, _, _, _, p, p, _, _, _],
                [p, p, p, _, _, _, p, _, _, _, p, _, _, _, _],
                [_, p, _, _, _, _, p, p, p, _, _, _, _, _, _],
                [_, X, _, _, _, _, p, H, p, S2,_, _, _, _, _],
                [_, _, _, _, _, _, p, p, p, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const f = fragile();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const X = button(HEAVY, null, [ S1, S2 ], null);
            const O1 = button(SOFT, null, [ S1 ], null);
            const O2 = button(SOFT, null, [ S2 ], null);
            return [ // Level 27
                [p, p, p, _, _, _, _, p, p, p, p, p, p, p, p],
                [p, p, p, p, p, p, p, p, p, p, p, _, _, p, p],
                [p, p, p, _, _, _, _, p, p, _, _, _, _, p, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, p, X, p],
                [_, _, _, _, _, _, _, _, _, _, _, _, p, p, _],
                [p, p, p, _, _, f, f, f, f, p, _, _, O1,O2,_],
                [p, H, p, f, f, f, f, f, f, f, _, _, p, p, p],
                [p, p, p, f, f, f, f, f, f, f, f, f, p, p, p],
                [_, _, _, _, _, f, f, f, f, f, f, f, p, p, p],
                [_, _, _, _, _, _, S1,_, _, S2,_, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const f = fragile();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const O = button(SOFT, null, [ S1, S2], null);
            const U = split(vec3(14, 0, 6), vec3(12, 0, 9))
            return [ // Level 28
                [_, p, p, S1,S1,p, p, _, _, _, _, _, _, _, _],
                [_, p, p, _, _, p, p, p, _, _, _, _, _, _, _],
                [f, f, p, _, _, p, p, p, p, _, _, _, _, _, _],
                [f, f, _, _, _, _, _, p, p, p, _, _, _, _, _],
                [f, f, _, _, _, _, _, _, p, p, p, _, _, _, _],
                [f, p, p, p, _, _, _, _, _, p, p, U, _, _, _],
                [_, p, H, p, _, _, _, _, _, _, p, p, p, p, p],
                [_, p, p, p, p, p, p, _, _, _, p, O, p, p, p],
                [_, _, p, _, _, p, p, _, _, _, p, p, p, _, _],
                [_, _, p, _, _, p, p, p, S2,S2,p, p, p, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const S3 = switched(true);
            const S4 = switched(false);
            const S5 = switched(false);
            const S6 = switched(false);
            const S7 = switched(false);
            const S8 = switched(false);
            const S9 = switched(false);
            const O1 = button(SOFT, [ S4 ], [ S2 ], null);
            const O2 = button(SOFT, [ S5 ], null, null);
            const O3 = button(SOFT, [ S6 ], [ S2, S4, S1 ], null);
            const X1 = button(HEAVY, [ S8 ], [ S3 ], null);
            const X2 = button(HEAVY, [ S9 ], null, null);
            const X3 = button(HEAVY, [ S7 ], null, null);
            return [ // Level 29
                [_, _, O1,S1,S1,p, _, _, _, p, S4,S4,X2,_, _],
                [_, _, _, _, _, p, _, _, _, p, _, _, _, _, _],
                [_, _, _, _, _, p, p, p, p, p, _, _, _, _, _],
                [X1,S5,S5,p, p, p, p, p, p, p, p, p, S6,S6,X3],
                [_, _, _, _, _, p, p, p, p, p, _, _, _, _, _],
                [_, _, _, _, _, S9,p, _, _, p, _, _, _, _, _],
                [_, _, _, _, _, S9,p, _, _, p, S2,S2,O2,_, _],
                [p, p, p, _, _, p, p, _, _, p, _, _, _, _, _],
                [p, H, p, S8,S8,p, _, _, _, p, _, _, _, _, _],
                [p, p, p, S7,_, _, _, _, _, p, S3,S3,O3,_, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const f = fragile();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(false);
            const S3 = switched(false);
            const X1 = button(HEAVY, [ S1 ], null, null);
            const X2 = button(HEAVY, [ S3 ], [ S1 ], null);
            const X3 = button(HEAVY, null, null, [ S2 ]);
            return [ // Level 30
                [_, _, _, p, p, p, p, p, f, f, p, p, p, p, _],
                [_, _, _, p, H, p, p, _, _, _, _, _, f, p, _],
                [_, _, _, p, p, p, _, _, _, _, _, _, f, p, X2],
                [_, _, _, _, _, _, _, f, p, p, S1,S1,p, p, p],
                [_, _, p, _, _, _, _, f, f, _, _, _, _, _, p],
                [_, X1,p, f, _, _, _, f, f, _, _, _, _, _, p],
                [f, f, f, f, _, _, _, p, p, S3,_, _, S3,p, p],
                [f, f, f, p, f, p, f, f, p, f, _, _, X3,p, S2],
                [p, f, f, f, f, f, f, f, f, f, f, f, p, _, _],
                [_, f, p, f, f, f, _, _, f, f, f, f, p, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const f = fragile();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const S3 = switched(true);
            const S4 = switched(false);
            const S5 = switched(false);
            const S6 = switched(false);
            const X1 = button(HEAVY, [ S6 ], [ S2 ], null);
            const X2 = button(HEAVY, null, null, [ S5 ]);
            const X3 = button(HEAVY, null, null, [ S4 ]);
            const O1 = button(SOFT, null, [ S2, S3, S4, S5 ], null);
            const O2 = button(SOFT, null, [ S2, S3, S4, S5 ], null);
            return [ // Level 31
                [_, _, _, _, _, _, _, _, _, _, _, p, p, p, S6],
                [_, p, p, p, _, _, _, _, X2,_, _, p, H, p, S6],
                [_, p, p, p, S2,S2,p, p, p, S5,S5,p, p, p, S6],
                [_, p, p, p, _, _, p, p, p, _, _, _, p, _, _],
                [_, f, f, f, _, _, O1,p, p, _, _, _, f, _, _],
                [_, _, f, _, _, _, p, p, p, _, _, f, f, f, _],
                [_, _, p, _, _, _, p, p, p, _, _, p, p, p, _],
                [S1,p, p, p, S4,S4,p, O2,p, S3,S3,p, p, p, _],
                [S1,p, X1,p, _, _, X3,_, _, _, _, p, p, p, _],
                [S1,p, p, p, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(false);
            const S3 = switched(false);
            const S4 = switched(false);
            const X1 = button(HEAVY, null, null, [ S4 ]);
            const X2 = button(HEAVY, null, null, [ S3 ]);
            const X3 = button(HEAVY, null, null, [ S1, S2 ]);
            return [ // Level 32
                [_, _, _, _, _, _, _, _, _, _, _, _, _, p, X3],
                [_, _, _, p, p, S1,S1,p, p, _, _, _, p, p, p],
                [_, _, p, p, p, S4,S4,p, p, _, _, p, X2,p, p],
                [_, _, p, H, p, _, _, _, p, p, p, p, p, _, _],
                [_, _, p, p, p, _, _, _, _, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, p, p, _, _, _],
                [_, _, _, _, _, p, p, p, _, _, p, p, _, _, _],
                [_, p, p, S2,S2,p, X1,p, _, _, p, p, _, _, _],
                [_, p, p, S3,S3,p, p, p, p, p, p, p, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
            ]
        },
        function () {
            const _ = air();
            const p = plain();
            const H = hole();
            const S1 = switched(true);
            const S2 = switched(true);
            const S3 = switched(false);
            const X = button(HEAVY, [ S3 ], null, null);
            const O1 = button(SOFT, null, [ S2 ], null);
            const O2 = button(SOFT, null, [ S2 ], null);
            const O3 = button(SOFT, null, [ S2 ], null);
            const O4 = button(SOFT, null, [ S2 ], null);
            const O5 = button(SOFT, null, [ S2 ], null);
            const O6 = button(SOFT, null, [ S2 ], null);
            const O7 = button(SOFT, null, [ S2 ], null);
            const O8 = button(SOFT, null, [ S2 ], null);
            const O9 = button(SOFT, null, [ S2 ], null);
            const OA = button(SOFT, null, [ S2 ], null);
            const OB = button(SOFT, null, [ S2 ], null);
            const OC = button(SOFT, null, [ S2 ], null);
            return [ // Level 33
                [_, _, _, _, _, p, p, O2,p, p, p, _, _, _, _],
                [_, _, _, _, _, p, p, p, p, p, p, S3,_, _, _],
                [p, p, p, _, _, O1,p, p, O3,p, p, p, p, p, _],
                [p, p, p, S1,S1,p, p, p, p, O4,O5,p, p, O9,_],
                [_, _, _, _, _, p, p, OC,p, p, O6,p, p, p, _],
                [_, _, _, _, _, p, p, p, p, p, p, O7,p, p, _],
                [p, p, p, _, _, p, p, p, p, p, p, O8,p, p, p],
                [p, H, p, S2,S2,p, OB,p, _, _, p, p, p, OA,X],
                [p, p, p, _, _, p, p, p, _, _, _, p, p, p, p],
                [p, p, p, _, _, _, _, _, _, _, _, _, p, p, p]
            ]
        },
    ]
};

/*
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
*/

const PASSCODES = [
    "780464", //1
    "290299", //2 
    "918660", //3
    "520967", //4
    "028431", //5
    "524383", //6
    "189493", //7
    "499707", //8
    "074355", //9
    "300590", //10
    "291709", //11
    "958640", //12
    "448106", //13
    "210362", //14
    "098598", //15
    "000241", //16
    "683596", //17
    "284933", //18
    "119785", //19
    "543019", //20
    "728724", //21
    "987319", //22
    "293486", //23
    "088198", //24
    "250453", //25
    "426329", //26
    "660141", //27
    "769721", //28
    "691859", //29
    "280351", //30
    "138620", //31
    "879021", //32
    "614955"  //33
]

