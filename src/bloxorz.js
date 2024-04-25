// Variable to store the WebGL rendering context
var gl;

// Variables para los bufferes
var vertex_buffer;
var color_buffer;
var textcoords_buffer;
var hide_level_buffer;


var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

var rot_angle = 0.0;
var rot_change = 0.5;

var program;
var tile_program;
var cube_program;

var program_info = {
    program,
    uniform_locations: {},
    attrib_locations: {},
};

var tile_program_info = {
    tile_program,
    uniform_locations: {},
    attrib_locations: {},
}

var cube_program_info = {
    cube_program,
    uniform_locations: {},
    attrib_locations: {},
}

const TILES_OFFSET = 3;

var objects_to_draw = [
    {
        program_info: cube_program_info,
        points_array: points_cube, 
        colors_array: color_cube,
        textcoords_array: cube_textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    },
    {
        program_info: cube_program_info,
        points_array: points_cube, 
        colors_array: color_cube,
        textcoords_array: cube_textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    },
    {
        program_info: cube_program_info,
        points_array: points_longblock, 
        colors_array: color_longblock,
        textcoords_array: cube_textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    }
];

//----------------------------------------------------------------------------
// Delta time management
//----------------------------------------------------------------------------

let delta_time = 0.0;
let start_time = performance.now();

function update_delta_time() {
    const end_time = performance.now();
    delta_time = (end_time - start_time) / 1000;
    start_time = end_time;
}


//----------------------------------------------------------------------------
// Camera movement management
//----------------------------------------------------------------------------

const BASE_CAMERA = {
    eye: vec3(7.0/* -1.0 */, 1.0/* 8.0 */, 20.0/* 20.0 */),
    at: vec3(7.0, 0.0, 4.5),
    up: vec3(0.0, 1.0, 0.0),

    alpha: 20,
    betha: 30,

    fov: 45,
}

const camera = {
    eye: BASE_CAMERA.eye,
    at: BASE_CAMERA.at,
    up: BASE_CAMERA.up,

    alpha: BASE_CAMERA.alpha,
    betha: BASE_CAMERA.betha,

    fov: BASE_CAMERA.fov,
};

let camera_actions = {
    left:  false, // -alpha
    right: false, // +alpha
    up:    false, // -betha
    down:  false, // +betha

    add_fov: false,
    sub_fov: false,
};

function reset_camera() {
    camera.alpha = BASE_CAMERA.alpha;
    camera.betha = BASE_CAMERA.betha;
    camera.fov = BASE_CAMERA.fov;
}

function to_uniform(v3, w) {
    const [x, y, z] = v3;
    return vec4(x, y, z, w);
}

function from_uniform(v4) {
    const [x, y, z, w] = v4;
    if (w == 0)
        return vec3(x, y, z);
    return vec3(x / w, y / w, z / w);
}

const ALPHA_ANGLE_SPEED = 90;
const BETHA_ANGLE_SPEED = 90;

const FOV_SPEED = 20;

function update_camera_state() {

    if (camera_actions.add_fov) {
        camera.fov += FOV_SPEED * delta_time;
        if (camera.fov > 60) camera.fov = 60;
    }
    if (camera_actions.sub_fov) {
        camera.fov -= FOV_SPEED * delta_time;
        if (camera.fov < 20) camera.fov = 20;
    }

    if (camera_actions.left)  { 
        camera.alpha += ALPHA_ANGLE_SPEED * delta_time;
    }
    if (camera_actions.right) { 
        camera.alpha -= ALPHA_ANGLE_SPEED * delta_time;
    }
    if (camera_actions.up) {
        camera.betha += BETHA_ANGLE_SPEED * delta_time; 
        if (camera.betha > 70) camera.betha = 70;
    }
    if (camera_actions.down) { 
        camera.betha -= BETHA_ANGLE_SPEED * delta_time;
        if (camera.betha < 0) camera.betha = 0;
    }

    if (camera.alpha > 360) { camera.alpha -= 360; }
    if (camera.alpha < 0) { camera.alpha += 360; }

    const u = subtract(BASE_CAMERA.eye, BASE_CAMERA.at);
    const rotated_alpha = from_uniform(mult(rotate(camera.alpha, vec3(0, 1, 0)), to_uniform(u, 0)));
   
    const betha_axis = cross(vec3(0.0, 1.0, 0.0), rotated_alpha);
    const rotated_betha = from_uniform(mult(rotate(camera.betha, betha_axis), to_uniform(rotated_alpha, 0)));
    
    camera.eye = add(BASE_CAMERA.at, rotated_betha);
}

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

let canvas;

const CANVAS_HEIGHT = screen.height;

function init() {

    init_menu();
    init_sound();

    // Set up a WebGL Rendering Context in an HTML5 Canvas
    canvas = document.getElementById("gl-canvas");

    const aspect_ratio = 1920 / 1080;
    canvas.width = CANVAS_HEIGHT * aspect_ratio;
    canvas.height = CANVAS_HEIGHT;

    gl = WebGLUtils.setupWebGL(canvas, {antialias: true});
    if (!gl) {
        alert("WebGL isn't available");
    }

    //Genera los bufferes
    vertex_buffer = gl.createBuffer();
    color_buffer = gl.createBuffer();
    textcoords_buffer = gl.createBuffer();
    hide_level_buffer = gl.createBuffer();

    //  Configure WebGL
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    set_primitive(objects_to_draw);

    // Set up a WebGL program
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    cube_program = initShaders(gl, "block-vertex-shader", "block-fragment-shader");
    tile_program = initShaders(gl, "tile-vertex-shader", "tile-fragment-shader");

    // Save the attribute and uniform locations
    program_info.uniform_locations.model = gl.getUniformLocation(program, "model");
    program_info.uniform_locations.view = gl.getUniformLocation(program, "view");
    program_info.uniform_locations.projection = gl.getUniformLocation(program, "projection");
    program_info.uniform_locations.colorMult = gl.getUniformLocation(program, "colorMult");
    program_info.attrib_locations.vPosition = gl.getAttribLocation(program, "vPosition");
    program_info.attrib_locations.vColor = gl.getAttribLocation(program, "vColor");
    program_info.program = program;

    tile_program_info.uniform_locations.model = gl.getUniformLocation(tile_program, "model");
    tile_program_info.uniform_locations.view = gl.getUniformLocation(tile_program, "view");
    tile_program_info.uniform_locations.projection = gl.getUniformLocation(tile_program, "projection");
    tile_program_info.uniform_locations.colorMult = gl.getUniformLocation(tile_program, "colorMult");
    tile_program_info.attrib_locations.vPosition = gl.getAttribLocation(tile_program, "vPosition");
    tile_program_info.attrib_locations.vColor = gl.getAttribLocation(tile_program, "vColor");
    tile_program_info.attrib_locations.vTextcoords = gl.getAttribLocation(tile_program, "vTextcoords");
    tile_program_info.program = tile_program;

    cube_program_info.uniform_locations.model = gl.getUniformLocation(cube_program, "model");
    cube_program_info.uniform_locations.view = gl.getUniformLocation(cube_program, "view");
    cube_program_info.uniform_locations.projection = gl.getUniformLocation(cube_program, "projection");
    cube_program_info.uniform_locations.colorMult = gl.getUniformLocation(cube_program, "colorMult");
    cube_program_info.attrib_locations.vPosition = gl.getAttribLocation(cube_program, "vPosition");
    cube_program_info.attrib_locations.vColor = gl.getAttribLocation(cube_program, "vColor");
    cube_program_info.attrib_locations.vTextcoords = gl.getAttribLocation(cube_program, "vTextcoords");
    cube_program_info.attrib_locations.vHideLevel = gl.getAttribLocation(cube_program, "vHideLevel");
    cube_program_info.program = cube_program;
    
    // Set up viewport 
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    set_app_state(APP_STATES.MAIN_MENU);

    requestAnimFrame(render);
};

document.addEventListener("DOMContentLoaded", init);

//----------------------------------------------------------------------------
// States and animations
//----------------------------------------------------------------------------

const APP_STATES = {
    MAIN_MENU: 0,
    INSTRUCTIONS: 1,
    LEVEL_SCREEN: 2,
    PLAYING: 3,
    INGAME_MENU: 4,
    END_SCREEN: 5,
    INGAME_INSTRUCTIONS: 6,
};

let current_app_state = APP_STATES.MAIN_MENU;

let is_menu_song_playing = false; 
function set_main_menu_state() {
    const saved_state = restore_game_state();

    if (!is_sound_playing(SOUNDS.menu_song)) {
        play_sound(SOUNDS.menu_song);
    }

    if (saved_state !== null) {
        game_state = saved_state;
        show_main_menu(true);
    }
    else {
        show_main_menu(false);
    }
    
}

function set_instructions_state() {
    show_instructions();
}

const LEVEL_SCREEN_TIME = 2;
let remaining_level_screen_time;
function set_level_screen_state() {
    stop_sound(SOUNDS.menu_song);
    play_sound(SOUNDS.level_screen);
    show_level_screen(game_state.level);
    
    remaining_level_screen_time = LEVEL_SCREEN_TIME;
}

function set_playing_state() {
    if (current_app_state === APP_STATES.INGAME_MENU) {
        show_menu_button();
        start_timer();
    }
    else {
        set_level(game_state.level);
        play_sound(SOUNDS.ambience);
        reset_camera();
        start_timer();
        show_in_game_panels(game_state);
        show_menu_button();

        if (game_state.level === 1) {
            set_anotation_text(REMINDER_TEXT[0]);
            show_anotation();
        }
    }    
} 

function set_ingame_menu_state() {
    stop_timer();
    show_in_game_menu();
}

function set_end_screen_state() {
    remaining_level_screen_time = LEVEL_SCREEN_TIME;
    play_sound(SOUNDS.level_screen);
    show_end_screen();
}

function set_ingame_instructions_state() {
    show_ingame_instructions();
}

function set_app_state(state) {
    switch (state) {
        case APP_STATES.MAIN_MENU: set_main_menu_state(); break;
        case APP_STATES.INSTRUCTIONS: set_instructions_state(); break;
        case APP_STATES.LEVEL_SCREEN: set_level_screen_state(); break;
        case APP_STATES.PLAYING: set_playing_state(); break; 
        case APP_STATES.INGAME_MENU: set_ingame_menu_state(); break;
        case APP_STATES.END_SCREEN: set_end_screen_state(); break;
        case APP_STATES.INGAME_INSTRUCTIONS: set_ingame_instructions_state(); break;
    }
    current_app_state = state;
}

//------------------------------------------------------------------------------

function update_main_menu_state() {

}

function update_instructions_state() {

}

function update_level_screen_state() {
    remaining_level_screen_time -= delta_time;
    if (remaining_level_screen_time <= 0) {
        event_queue.push(GAME_EVENTS.level_screen.end);
    }
}

function update_playing_state() {
    update_player_state();
    update_camera_state();
} 

function update_ingame_menu_state() {

}

function update_end_screen_state() {
    remaining_level_screen_time -= delta_time;
    if (remaining_level_screen_time <= 0) {
        hide_end_screen();
        set_app_state(APP_STATES.MAIN_MENU);
    }
}

function update_app_state() {
    switch (current_app_state) {
        case APP_STATES.MAIN_MENU: update_main_menu_state(); break;
        case APP_STATES.INSTRUCTIONS: update_instructions_state(); break;
        case APP_STATES.LEVEL_SCREEN: update_level_screen_state(); break;
        case APP_STATES.PLAYING: update_playing_state(); break; 
        case APP_STATES.INGAME_MENU: update_ingame_menu_state(); break;
        case APP_STATES.END_SCREEN: update_end_screen_state(); break;
    }
}

//------------------------------------------------------------------------------

function visualize_app_state() {
    switch (current_app_state) {
        case APP_STATES.PLAYING:
        case APP_STATES.INGAME_MENU:
            visualize_game_state();
            visualize_tile_activation();
            update_hide_level();
            break;
    }
}

//------------------------------------------------------------------------------

function draw_app_state() {
    switch (current_app_state) {
        case APP_STATES.PLAYING:
        case APP_STATES.INGAME_MENU:
            if (player.block_type == LONG) {
                draw_object(objects_to_draw[2]);
            }
            else {
                draw_object(objects_to_draw[0]);
                draw_object(objects_to_draw[1]);
            }
        
            for (let i = TILES_OFFSET; i < objects_to_draw.length; i++) {
                const object = objects_to_draw[i];
                if (!object.hide) {
                    draw_object(object);
                }
            }
            break;
    }
}

//------------------------------------------------------------------------------

const MOVEMENT_ANGLE = 90.0; // degree
const MOVEMENT_COOLDOWN = 0.225;
const MOVEMENT_ANGULAR_SPEED = 90.0 / MOVEMENT_COOLDOWN; // degree / s

const FALLING_DURATION = [0.2,0.5];

const WINNING_DURATION = 0.7;
const GRAVITY = 100;

function apply_action(direction, dx, dz) {
    player.state = MOVING;
    player.animation = {
        direction: direction,
        remaining_time: MOVEMENT_COOLDOWN,
        acum_angle: 0.0,
        rotation_point: player.position[player.chosen_block],
        distance_to_edge: get_distance_to_rotation_edge(dx, dz),
        dx: dx, dz: dz,
    }
    move_player_position(dx, dz);
}

const AXIS_CONTROL = [
    [[-1,0], [0,-1], [+1,0], [0,+1]],//LEFT
    [[+1,0], [0,+1], [-1,0], [0,-1]],//RIGHT
    [[0,-1], [+1,0], [0,+1], [-1,0]],//UP
    [[0,+1], [-1,0], [0,-1], [+1,0]],//DOWN
];

function get_camera_quadrant() {
    if (camera.alpha > 45 && camera.alpha <= 135) { return 1; }
    else if (camera.alpha > 135 && camera.alpha <= 225) { return 2; }
    else if (camera.alpha > 225 && camera.alpha <= 315) { return 3; }
    else { return 0; }
}

function idle_state() {

    let dir = null;
    if (player_action.left)       { dir = LEFT;  }
    else if (player_action.right) { dir = RIGHT; }
    else if (player_action.up)    { dir = UP;    }
    else if (player_action.down)  { dir = DOWN;  }

    if (dir !== null) {
        const [dx, dz] = AXIS_CONTROL[dir][get_camera_quadrant()];
        apply_action(dir, dx, dz);
    }
}

function moving_state() {

    const block = objects_to_draw[player.block_type === LONG ? 2 : player.chosen_block];
    const dx = player.animation.dx;
    const dz = player.animation.dz;

    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        block.rotation_matrix = mult(rotate((dz - dx) * MOVEMENT_ANGLE, vec3(Math.abs(dz), 0, Math.abs(dx))), block.rotation_matrix);
        
        const [next_state, falling_block] = get_after_movement_state();

        player.state = next_state;
        switch (player.state) {
            case IDLE: break;
            case WINNING:
                play_sound(SOUNDS.victory);
                player.animation = {
                    remaining_time: WINNING_DURATION,
                    falling_speed: 0.0,
                    falling_distance: 0.0,
                }
                break;
            case FALLING:
                game_state.attempts += 1;
                update_in_game_panel_state(game_state);
                if (player.block_type === SHORT || falling_block === BOTH_BLOCKS_FALL || falling_block === FRAGILE_BLOCK_FALLS) {
                    player.animation = {
                        fase: 1, // do not rotate
                        remaining_time: FALLING_DURATION[1],
                        falling_speed: 0.0,
                        falling_distance: 0.0,
                        falling_block: falling_block,
                        fragile_falls: falling_block === FRAGILE_BLOCK_FALLS,
                    }
                }
                else {
                    const [x_f, y_f, z_f] = player.position[falling_block];
                    const [x_nf, y_nf, z_nf] = player.position[1 - falling_block];
                    const dx = x_f - x_nf;
                    const dz = z_f - z_nf;

                    const tx = player.position[0][0] - player.position[1][0];
                    const tz = player.position[0][2] - player.position[1][2];

                    player.animation = {
                        fase: 0, // first rotate, then fall
                        remaining_time: FALLING_DURATION[0],
                        acum_angle: 0.0,
                        rotation_point: player.position[0],
                        distance_to_edge: [ (dx + dz) * (tx + tz) * -0.5, 0.5],
                        dx: dx, dz: dz,
                        falling_block: falling_block,
                    }
                    
                    if (!previsualization_events.block_mixed) {
                        player.position[falling_block][1] = -1;
                        player.position[1 - falling_block] = vec3(player.position[falling_block][0], 0, player.position[falling_block][2]);
                    }
                }
                break;
            case SPLITING:
                play_sound(SOUNDS.split);
                player.animation = {
                    remaining_time: MOVEMENT_COOLDOWN,
                    falling_speed: 0.0,
                    falling_distance: -2.5
                }
                break;
        }        
    }
}

function winning_state() {
    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        
        if (game_state.level === 33) {
            stop_timer();
            hide_in_game_panels();
            remove_game_state();
            stop_sound(SOUNDS.ambience);
            //play_sound(SOUNDS.flush_map);
            set_app_state(APP_STATES.END_SCREEN);
        } else {
            set_level(game_state.level + 1);
            save_game_state();
            hide_in_game_panels();
            stop_sound(SOUNDS.ambience);
            //play_sound(SOUNDS.flush_map);
            set_app_state(APP_STATES.LEVEL_SCREEN);
        }
    }
}

function falling_state() {
    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        if (player.animation.fase === 0) {

            const object = objects_to_draw[2];
            const dx = player.animation.dx;
            const dz = player.animation.dz;
            object.rotation_matrix = mult(rotate((dz - dx) * MOVEMENT_ANGLE, vec3(Math.abs(dz), 0, Math.abs(dx))), object.rotation_matrix);
            
            player.animation = {
                fase: 1,
                remaining_time: FALLING_DURATION[1],
                falling_speed: 0.0,
                falling_distance: 0.0,
            }

        }
        else if (player.animation.fase === 1) {
            set_level(game_state.level);
            save_game_state();
        }
    }
}

function spliting_state() {
    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        player.state = IDLE;
        play_sound(SOUNDS.block_move_cube_1);
        play_sound(SOUNDS.block_move_cube_2);
    }
}

function update_player_state() {
    switch (player.state) {
        case IDLE: idle_state(); break;
        case MOVING: moving_state(); break;
        case FALLING: falling_state(); break;
        case WINNING: winning_state(); break;
        case SPLITING: spliting_state(); break;
    }
}

//------------------------------------------------------------------------------

function idle_visualize_state() {

    if (player.block_type === LONG) {
        objects_to_draw[2].uniforms.u_model = objects_to_draw[2].rotation_matrix;
        translate_object(objects_to_draw[2], player.position[0]);
    }
    else {
        objects_to_draw[0].uniforms.u_model = objects_to_draw[0].rotation_matrix;
        translate_object(objects_to_draw[0], player.position[0]);
        objects_to_draw[1].uniforms.u_model = objects_to_draw[1].rotation_matrix;
        translate_object(objects_to_draw[1], player.position[1]);
    }
}

function moving_visualize_state() {
    const block = objects_to_draw[player.block_type === LONG ? 2 : player.chosen_block];

    const dx = player.animation.dx;
    const dz = player.animation.dz;
    const adj = player.animation.distance_to_edge[0];
    const adj_y = player.animation.distance_to_edge[1];
    const [r_x, r_y, r_z] = player.animation.rotation_point;

    block.uniforms.u_model = block.rotation_matrix;
    
    translate_object(block, vec3(-dx * adj, +adj_y, -dz * adj));

    player.animation.acum_angle += (dz - dx) * MOVEMENT_ANGULAR_SPEED * delta_time;
    player.animation.acum_angle = Math.min(player.animation.acum_angle, MOVEMENT_ANGLE);
    player.animation.acum_angle = Math.max(player.animation.acum_angle, -MOVEMENT_ANGLE);
    rotate_object(block, player.animation.acum_angle, vec3(Math.abs(dz), 0, Math.abs(dx)));

    translate_object(block, vec3(r_x + dx * adj, -0.5, r_z + dz * adj));


    if (player.block_type === SHORT) {
        const other_block = objects_to_draw[1 - player.chosen_block];
        other_block.uniforms.u_model = other_block.rotation_matrix;
        translate_object(other_block, player.position[1 - player.chosen_block]);
    }
    
}

function advance_falling_animation() {
    const block = objects_to_draw[player.block_type === LONG ? 2 : player.chosen_block];
    const [x, y, z] = player.position[player.chosen_block];

    block.uniforms.u_model = block.rotation_matrix;
    player.animation.falling_speed += GRAVITY * delta_time;
    player.animation.falling_distance += player.animation.falling_speed * delta_time;
    translate_object(block, vec3(x, y - player.animation.falling_distance, z));

    if (player.block_type === SHORT) {
        const other_block = objects_to_draw[1 - player.chosen_block];
        other_block.uniforms.u_model = other_block.rotation_matrix;
        translate_object(other_block, player.position[1 - player.chosen_block]);
    }

    if (player.animation.fragile_falls === true) {
        const fragile_tile = tile_objects_matrix[z][x];
        set_position(fragile_tile, vec3(x, -1 - player.animation.falling_distance, z));
    }
}

function falling_visualize_state() {
    if (player.animation.fase === 0) {

        const block = objects_to_draw[2];
        const dx = player.animation.dx;
        const dz = player.animation.dz;
        const adj = player.animation.distance_to_edge[0];
        const adj_y = player.animation.distance_to_edge[1];
        const [r_x, r_y, r_z] = player.animation.rotation_point;

        block.uniforms.u_model = block.rotation_matrix;
        
        translate_object(block, vec3(-dx * adj, +adj_y, -dz * adj));

        player.animation.acum_angle += (dz - dx) * MOVEMENT_ANGULAR_SPEED * delta_time;
        player.animation.acum_angle = Math.min(player.animation.acum_angle, MOVEMENT_ANGLE);
        player.animation.acum_angle = Math.max(player.animation.acum_angle, -MOVEMENT_ANGLE);
        rotate_object(block, player.animation.acum_angle, vec3(Math.abs(dz), 0, Math.abs(dx)));
        translate_object(block, vec3(r_x + dx * adj, -0.5, r_z + dz * adj));

    } else if (player.animation.fase === 1) {
        advance_falling_animation();
    }
}

function winning_visualize_state() {
    advance_falling_animation();
}

function spliting_visualize_state() {
    player.animation.falling_speed += GRAVITY * delta_time;
    player.animation.falling_distance += player.animation.falling_speed * delta_time;

    const block0 = objects_to_draw[0];
    const [x0, y0, z0] = player.position[0];

    block0.uniforms.u_model = block0.rotation_matrix;
    translate_object(block0, vec3(x0,  Math.max(0, y0 - player.animation.falling_distance), z0));

    const block1 = objects_to_draw[1];
    const [x1, y1, z1] = player.position[1];

    block1.uniforms.u_model = block1.rotation_matrix;
    translate_object(block1, vec3(x1, Math.max(0, y1 - player.animation.falling_distance), z1));
}

let previsualization_events = {
    block_mixed: false,
    change_chosen_block: false,
};

function visualize_game_state() {
    if (previsualization_events.block_mixed) {
        previsualization_events.block_mixed = false;
        
        objects_to_draw[2].rotation_matrix = get_longblock_rotation();

        const falling_block = player.animation.falling_block;
        if (player.state === FALLING && falling_block !== BOTH_BLOCKS_FALL) {
            player.position[falling_block][1] = -1;
            player.position[1 - falling_block] = vec3(player.position[falling_block][0], 0, player.position[falling_block][2]);
        }
    }

    if (previsualization_events.change_chosen_block) {
        previsualization_events.change_chosen_block = false;
        
        objects_to_draw[player.chosen_block].colors_array = color_cube;
        objects_to_draw[1 - player.chosen_block].colors_array = color_cube_not_chosen;
    }

    switch (player.state) {
        case IDLE: idle_visualize_state(); break;
        case MOVING: moving_visualize_state(); break;
        case FALLING: falling_visualize_state(); break;
        case WINNING: winning_visualize_state(); break;
        case SPLITING: spliting_visualize_state(); break;
    }
}

//------------------------------------------------------------------------------

let animation_array = [];

function switched_off_animation(animation) {
    if (animation.pre_active) {
        animation.falling_speed += GRAVITY * delta_time;
        animation.falling_distance += animation.falling_speed * delta_time;

        animation.affected_objects.forEach((object) => {
            const [x, y, z] = object.position;
            object.colors_array = color_tile_deactivated;
            object.hide = false;
            set_position(object, vec3(x, y - animation.falling_distance, z));
        });
    }
    else {
        animation.affected_objects.forEach((object) => {
            object.colors_array = color_tile_deactivated;
            object.hide = false;
            set_position(object, object.position);
        });
    }
}

function switched_on_animation(animation) {
    if (!animation.pre_active) {
        animation.falling_speed -= GRAVITY * delta_time;
        if (animation.falling_speed < 0)  animation.falling_speed = 0;
        animation.falling_distance -= animation.falling_speed * delta_time;
        if (animation.falling_distance < 0)  animation.falling_distance = 0;

        animation.affected_objects.forEach((object) => {
            const [x, y, z] = object.position;
            object.colors_array = color_tile_activated;
            object.hide = false;
            set_position(object, vec3(x, y - animation.falling_distance, z));
        });
    }
    else {
        animation.affected_objects.forEach((object) => {
            object.colors_array = color_tile_activated;
            object.hide = false;
            set_position(object, object.position);
        });
    }
}

function visualize_tile_activation() {
    const animations = animation_array;
    animations.forEach((animation) => {
 
        animation.remaining_time -= delta_time;

        if (animation.remaining_time <= 0)
        {
            animation.affected_objects.forEach((object) => {
                object.colors_array = color_tile_switched;
                set_position(object, object.position);
                object.hide = animation.type === SWITCHED_OFF;
            });
            
            animation.remove = true;
        } 
        else
        {   
            switch (animation.type) {
                case SWITCHED_ON: switched_on_animation(animation); break;
                case SWITCHED_OFF: switched_off_animation(animation); break;
            }
        }
    });

    animation_array = [];
    animations.forEach((animation) => {
        if (animation.remove !== true) {
            animation_array.push(animation);
        }
    });
}

//----------------------------------------------------------------------------
// Key control
//----------------------------------------------------------------------------

const key_pressed = {
    reset_camera: false,
    reset_level: false,
    change_chosen_block: false,
    show_menu: false,
};

// In order to offer an intuitive and predictable control
const arrow_key_queue = [];

function arrow_key_queue_set_next(keyup) {
    const top = arrow_key_queue.pop();
    let key = null;
    if (top === keyup) {
        key = arrow_key_queue.pop();
    } else {
        key = top;
        const index = arrow_key_queue.indexOf(keyup);
        arrow_key_queue.splice(index, 1);
    }

    switch (key) {
        case UP:    player_action.up = true;    arrow_key_queue.push(key); break;
        case DOWN:  player_action.down = true;  arrow_key_queue.push(key); break;
        case LEFT:  player_action.left = true;  arrow_key_queue.push(key); break;
        case RIGHT: player_action.right = true; arrow_key_queue.push(key); break;
    }
}

function arrow_key_check_top_of_queue(keydown) {
    const top = arrow_key_queue.pop();
    if (top !== undefined) {
        arrow_key_queue.push(top);
    }
    if (top === keydown) {
        return false;
    }
    arrow_key_queue.push(keydown);
    return true;
}

window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":    if (arrow_key_check_top_of_queue(UP))    { reset_player_action(); player_action.up = true;    } break;
        case "ArrowDown":  if (arrow_key_check_top_of_queue(DOWN))  { reset_player_action(); player_action.down = true;  } break;
        case "ArrowLeft":  if (arrow_key_check_top_of_queue(LEFT))  { reset_player_action(); player_action.left = true;  } break;
        case "ArrowRight": if (arrow_key_check_top_of_queue(RIGHT)) { reset_player_action(); player_action.right = true; } break;

        case " ":
            if (!key_pressed.change_chosen_block) {
                key_pressed.change_chosen_block = true;
                event_queue.push(GAME_EVENTS.playing.change_chosen_block);
            } break;
        case "Enter":
            if (!key_pressed.show_menu) {
                key_pressed.show_menu = true;
                if (current_app_state === APP_STATES.PLAYING) {
                    event_queue.push(GAME_EVENTS.playing.show_menu);
                } else {
                    event_queue.push(GAME_EVENTS.ingame_menu.return_to_game);
                }
            } break;
        case "k": case "K":
            if (!key_pressed.reset_camera) {
                key_pressed.reset_camera = true;
                event_queue.push(GAME_EVENTS.playing.reset_camera);
            } break;
        case "l": case "L":
            if (!key_pressed.reset_level) {
                key_pressed.reset_level = true;
                event_queue.push(GAME_EVENTS.playing.reset_level);
            } break;
        

        case "w": case "W": camera_actions.up = true;    break;
        case "s": case "S": camera_actions.down = true;  break;
        case "a": case "A": camera_actions.left = true;  break;
        case "d": case "D": camera_actions.right = true; break;

        case "-": camera_actions.add_fov = true; break;
        case "+": camera_actions.sub_fov = true; break;
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowUp":    arrow_key_queue_set_next(UP); player_action.up = false;    break;
        case "ArrowDown":  arrow_key_queue_set_next(DOWN); player_action.down = false;  break;
        case "ArrowLeft":  arrow_key_queue_set_next(LEFT); player_action.left = false;  break;
        case "ArrowRight": arrow_key_queue_set_next(RIGHT); player_action.right = false; break;
    
        case " ":     key_pressed.change_chosen_block = false; break;
        case "Enter": key_pressed.show_menu = false; break;
        case "k": case "K": key_pressed.reset_camera = false; break;
        case "l": case "L": key_pressed.reset_level = false; break;


        case "w": case "W": camera_actions.up = false;    break;
        case "s": case "S": camera_actions.down = false;  break;
        case "a": case "A": camera_actions.left = false;  break;
        case "d": case "D": camera_actions.right = false; break;

        case "-": camera_actions.add_fov = false; break;
        case "+": camera_actions.sub_fov = false; break;
    }
});


//----------------------------------------------------------------------------
// Mixed...
//----------------------------------------------------------------------------

function set_position(object, position) {
    const [x, y, z] = position;
    object.uniforms.u_model = translate(x, y, z);
}

function set_rotation(object, angle, axis) {
    object.uniforms.u_model = rotate(angle, axis);
}

function translate_object(object, direction) {
    const [x, y, z] = direction;
    object.uniforms.u_model = mult(translate(x, y, z), object.uniforms.u_model);
}

function rotate_object(object, angle, axis) {
    object.uniforms.u_model = mult(rotate(angle, axis), object.uniforms.u_model);
}

function clear_floor() {
    objects_to_draw.length = 3;
}

let tile_objects_matrix = null;

function generate_tile(program,points, color, x, y, z) {
    const tile = {
        program_info: program,
        points_array: points, 
        colors_array: color,
        textcoords_array: cube_textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: translate(x, y, z)
        },
        primitive: gl.TRIANGLES,
        position: vec3(x, y, z),
    };

    tile_objects_matrix[z][x] = tile;
    return tile;
}

function generate_floor() {
    tile_objects_matrix = [];
    tile_objects_matrix.length = LEVEL_MATRIX.H;

    for (let i = 0; i < LEVEL_MATRIX.H; i++) {
        tile_objects_matrix[i] = [];
        tile_objects_matrix[i].length = LEVEL_MATRIX.W;

    for (let j = 0; j < LEVEL_MATRIX.W; j++) {

        const tile = game_state.matrix[i][j];
        switch (tile.type) {
            case AIR:
                break;
            case PLAIN:
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_plain, j, -1, i));
                break;
            case FRAGILE:
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_fragile, j, -1, i));
                break;
            case BUTTON:
                const [points_button, color_button] = tile.activation === HEAVY ? [points_heavybutton, color_heavybutton] : [points_softbutton, color_softbutton];
                objects_to_draw.push(generate_tile(program_info, points_button, color_button, j, 0, i));
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_plain, j, -1, i));
                break;
            case SPLIT:
                objects_to_draw.push(generate_tile(program_info, points_split, color_split, j, 0, i));
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_plain, j, -1, i));
                break;
            case SWITCHED:
                const object = generate_tile(tile_program_info, points_tile, color_tile_switched, j, -1, i);
                object.hide = !tile.active;
                if (!tile.affected_objects) { tile.affected_objects = [ object ]; }
                else { tile.affected_objects.push(object); }
                objects_to_draw.push(object);
                break;
            case HOLE:
                hole_object = generate_tile(cube_program_info, points_hole, color_hole, j, -1, i);
                hole_object.hide_level_array = cube_hide_level;
                objects_to_draw.push(hole_object);
                break;
        }

    }
    }
}

function set_level(level) {
    clear_floor();

    game_state.level = level;
    game_state.matrix = LEVEL_MATRIX.generate_matrix[level - 1]();

    player.position = LEVEL_INITIAL_POSITION[level - 1];
    player.block_type = LONG;
    player.state = IDLE;
    player.chosen_block = 0;

    objects_to_draw[0].rotation_matrix = new mat4();
    objects_to_draw[1].rotation_matrix = new mat4();
    objects_to_draw[2].rotation_matrix = new mat4();

    generate_floor();
}

//----------------------------------------------------------------------------
// Event handling
//----------------------------------------------------------------------------

// Input events to be processed at the begining of the loop
const GAME_EVENTS = {
    playing: {
        reset_level:            APP_STATES.PLAYING * 100 + 0,
        change_chosen_block:    APP_STATES.PLAYING * 100 + 1,
        reset_camera:           APP_STATES.PLAYING * 100 + 2,
        show_menu:              APP_STATES.PLAYING * 100 + 3,
    },
    
    main_menu: {
        start_new_game:         APP_STATES.MAIN_MENU * 100 + 0,
        continue:               APP_STATES.MAIN_MENU * 100 + 1,
        toggle_sound:           APP_STATES.MAIN_MENU * 100 + 2,
    },

    instructions: {
        next:                   APP_STATES.INSTRUCTIONS * 100 + 0,
        prev:                   APP_STATES.INSTRUCTIONS * 100 + 1,
        start:                  APP_STATES.INSTRUCTIONS * 100 + 2,
        back_to_menu:           APP_STATES.INSTRUCTIONS * 100 + 3,
    },

    level_screen: {
        end:                    APP_STATES.LEVEL_SCREEN * 100 + 0,
    },

    ingame_menu: {
        quit_to_menu:           APP_STATES.INGAME_MENU * 100 + 0,
        return_to_game:         APP_STATES.INGAME_MENU * 100 + 1,
        show_instructions:      APP_STATES.INGAME_MENU * 100 + 2,
    },
};

let event_queue = [];


function main_menu_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.main_menu.start_new_game:
            hide_main_menu();
            set_app_state(APP_STATES.INSTRUCTIONS);
            break;
        case GAME_EVENTS.main_menu.continue:
            hide_main_menu();
            set_app_state(APP_STATES.LEVEL_SCREEN);
            break;
        case GAME_EVENTS.main_menu.toggle_sound:
            if (!is_menu_song_playing) {
                is_menu_song_playing = true;
                play_sound(SOUNDS.menu_song);
            }
            break;
    }
}

function instructions_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.instructions.next:
            next_instructions_page();
            break;
        case GAME_EVENTS.instructions.prev:
            prev_instructions_page();
            break;
        case GAME_EVENTS.instructions.start:
            hide_instructions();
            reset_game_state();
            set_app_state(APP_STATES.LEVEL_SCREEN);
            break;
        case GAME_EVENTS.instructions.back_to_menu:
            hide_instructions();
            set_app_state(APP_STATES.MAIN_MENU);
            break;
    }
}

function ingame_instructions_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.instructions.next:
            next_ingame_instructions_page();
            break;
        case GAME_EVENTS.instructions.prev:
            prev_ingame_instructions_page();
            break;
        case GAME_EVENTS.instructions.start:
            hide_ingame_instructions();
            show_in_game_panels(game_state);
            set_app_state(APP_STATES.INGAME_MENU);
            break;
    }
}

function level_screen_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.level_screen.end:
            hide_level_screen();
            set_app_state(APP_STATES.PLAYING);
            break;
    }
}

function playing_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.playing.reset_level:
            set_level(game_state.level);
            break;
        case GAME_EVENTS.playing.change_chosen_block:
            if (player.block_type === SHORT && player.state === IDLE) {
                player.chosen_block = 1 - player.chosen_block; // Toggle between 1 and 0
                previsualization_events.change_chosen_block = true; 
            }
            break;
        case GAME_EVENTS.playing.reset_camera:
            reset_camera();
            break;
        case GAME_EVENTS.playing.show_menu:
            set_app_state(APP_STATES.INGAME_MENU);
            break;
    }
} 

function ingame_menu_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.ingame_menu.quit_to_menu:
            save_game_state();
            hide_in_game_menu();
            hide_in_game_panels();
            stop_sound(SOUNDS.ambience);
            set_app_state(APP_STATES.MAIN_MENU);
            break;
        case GAME_EVENTS.ingame_menu.return_to_game:
            hide_in_game_menu();
            set_app_state(APP_STATES.PLAYING);
            break;
        case GAME_EVENTS.ingame_menu.show_instructions:
            hide_in_game_menu();
            hide_in_game_panels();
            set_app_state(APP_STATES.INGAME_INSTRUCTIONS);
            break;
    }
}

function end_screen_handle_event(event) {

}

function process_events() {

    while (event_queue.length > 0) {
        const event = event_queue.pop();
        switch (current_app_state) {
            case APP_STATES.MAIN_MENU: main_menu_handle_event(event); break;
            case APP_STATES.INSTRUCTIONS: instructions_handle_event(event); break;
            case APP_STATES.LEVEL_SCREEN: level_screen_handle_event(event); break;
            case APP_STATES.PLAYING: playing_handle_event(event); break; 
            case APP_STATES.INGAME_MENU: ingame_menu_handle_event(event); break;
            case APP_STATES.END_SCREEN: end_screen_handle_event(event); break;
            case APP_STATES.INGAME_INSTRUCTIONS: ingame_instructions_handle_event(event); break;
        }        
    }
}


//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function draw_object(object) {
    gl.useProgram(object.program_info.program);

    // Setup buffers and attributes
    set_buffers_and_attributes(object.program_info, object.points_array, object.colors_array, object.textcoords_array, object.hide_level_array);

    // Set the uniforms
    set_uniforms(object.program_info, object.uniforms);

    // Draw
    gl.drawArrays(object.primitive, 0, object.points_array.length);
}

function render() {

    process_events();

    //----------------------------------------------------------------------------

    update_delta_time();
    update_app_state()

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);	

    //----------------------------------------------------------------------------

    visualize_app_state();

    //----------------------------------------------------------------------------
    // DRAW
    //----------------------------------------------------------------------------

    draw_app_state();
    
    requestAnimationFrame(render);

}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function set_primitive(objects_to_draw) {	
    
    objects_to_draw.forEach((object) => {
        switch(object.prim_type) {
            case "lines":
                object.primitive = gl.LINES;
                break;
            case "line_strip":
                object.primitive = gl.LINE_STRIP;
                break;
            case "triangles":
                object.primitive = gl.TRIANGLES;
                break;
            default:
                object.primitive = gl.TRIANGLES;
        }
    });
}

function set_uniforms(program_info, uniforms) {
    projection = perspective( camera.fov, canvas.width/canvas.height, 0.1, 100.0 );
	gl.uniformMatrix4fv( program_info.uniform_locations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader

    // Copy uniform model values to corresponding values in shaders
    gl.uniform4f(program_info.uniform_locations.colorMult, uniforms.u_color_mult[0], uniforms.u_color_mult[1], uniforms.u_color_mult[2], uniforms.u_color_mult[3]);
    gl.uniformMatrix4fv(program_info.uniform_locations.model, gl.FALSE, uniforms.u_model);

    var view = lookAt(camera.eye, camera.at, camera.up);
    gl.uniformMatrix4fv(program_info.uniform_locations.view, gl.FALSE, view); // copy view to uniform value in shader
}

function set_buffers_and_attributes(program_info, points_array, colors_array, textcoords_array, hide_level_array) {
    // Load the data into GPU data buffers
    // Vertices
    //var vertex_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(points_array), gl.STATIC_DRAW );
    gl.vertexAttribPointer( program_info.attrib_locations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program_info.attrib_locations.vPosition );

    // Colors
    //var color_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, color_buffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors_array), gl.STATIC_DRAW );
    gl.vertexAttribPointer( program_info.attrib_locations.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program_info.attrib_locations.vColor );

    // (u, v)
    if (program_info === tile_program_info || program_info === cube_program_info) {
        //var textcoords_buffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, textcoords_buffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(textcoords_array), gl.STATIC_DRAW );
        gl.vertexAttribPointer( program_info.attrib_locations.vTextcoords, 2, gl.FLOAT, gl.FALSE, 0, 0 );
        gl.enableVertexAttribArray( program_info.attrib_locations.vTextcoords );
    }

    if (program_info === cube_program_info) {
        //var hide_level_buffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, hide_level_buffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(hide_level_array), gl.STATIC_DRAW );
        gl.vertexAttribPointer( program_info.attrib_locations.vHideLevel, 1, gl.FLOAT, gl.FALSE, 0, 0 );
        gl.enableVertexAttribArray( program_info.attrib_locations.vHideLevel );
    }
}

let hole_object;

let cube_hide_level = [];
cube_hide_level.length = cube_indices.length;

let cube_NO_hide_level = [];
for (let i = 0; i < cube_hide_level.length; i++) {
    cube_NO_hide_level[i] = -1000;
}


function update_hide_level() {

    // Get top vertices of hole
    const [x, y, z] = hole_object.position;
    const vertices = [
        vec3(x + 0.5, y + 0.5, z + 0.5),
        vec3(x - 0.5, y + 0.5, z + 0.5),
        vec3(x + 0.5, y + 0.5, z - 0.5),
        vec3(x - 0.5, y + 0.5, z - 0.5)
    ];

    const d = vertices.map((v, idx) => {
        const a = (v[0] - camera.eye[0]);
        const b = (v[1] - camera.eye[1]);
        const c = (v[2] - camera.eye[2]);
        return [a*a + b*b + c*c, idx];
    });

    d.sort((a, b) => {
        return a[0] - b[0];
    });

    const r = normalize(subtract(vertices[d[0][1]], camera.eye));
    
    const n = normalize(cross(vec3(0, 1, 0), subtract(vertices[d[2][1]], vertices[d[3][1]]) ));

    const v0 = vertices[d[0][1]];
    const v3 = vertices[d[3][1]];

    let level = eval_level(r, v0, n, v3);
    level = level < 0 ? level : -1000;
    for (let i = 0; i < cube_hide_level.length; i++) {
        cube_hide_level[i] = level;
    }

    if (player.state === WINNING) {
        objects_to_draw[0].hide_level_array = cube_hide_level;
        objects_to_draw[1].hide_level_array = cube_hide_level;
        objects_to_draw[2].hide_level_array = cube_hide_level;
    } else {
        objects_to_draw[0].hide_level_array = cube_NO_hide_level;
        objects_to_draw[1].hide_level_array = cube_NO_hide_level;
        objects_to_draw[2].hide_level_array = cube_NO_hide_level;
    }
}

function eval_level(r, p, n, o) {
    const nd = dot(n, r);
    if (nd === 0) {
        return -1000;
    }
    const t = (dot(n, subtract(o, p))) / nd;
    return add(p, mult(t, r))[1];
}