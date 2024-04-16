
const red =			[1.0, 0.0, 0.0, 1.0];
const green =		[0.0, 1.0, 0.0, 1.0];
const blue =		[0.0, 0.0, 1.0, 1.0];
const lightred =	[1.0, 0.5, 0.5, 1.0];
const lightgreen =	[0.5, 1.0, 0.5, 1.0];
const lightblue = 	[0.5, 0.5, 1.0, 1.0];
const darkred =	    [0.5, 0.2, 0.2, 1.0];
const darkgreen =	[0.2, 0.5, 0.2, 1.0];
const darkblue =	[0.2, 0.2, 0.5, 1.0];
const white =		[1.0, 1.0, 1.0, 1.0];
const lightgrey =   [0.75, 0.75, 0.75, 1.0];
const grey =        [0.5, 0.5, 0.5, 1.0];
const darkgrey =    [0.25, 0.25, 0.25, 1.0];

const cube_vertices = [
    [ 0.5, 0.5, 0.5, 1], //0
    [ 0.5, 0.5,-0.5, 1], //1
    [ 0.5,-0.5, 0.5, 1], //2
    [ 0.5,-0.5,-0.5, 1], //3
    [-0.5, 0.5, 0.5, 1], //4
    [-0.5, 0.5,-0.5, 1], //5
    [-0.5,-0.5, 0.5, 1], //6
    [-0.5,-0.5,-0.5, 1], //7
];

const cube_indices = [	
//Solid Cube - use TRIANGLES, starts at 0, 36 vertices
    0,4,6, //front
    0,6,2,
    1,0,2, //right
    1,2,3, 
    5,1,3, //back
    5,3,7,
    4,5,7, //left
    4,7,6,
    4,0,1, //top
    4,1,5,
    6,7,3, //bottom
    6,3,2,
];

const points_cube = [];
cube_indices.forEach((value) => { points_cube.push(cube_vertices[value]) });

// const color_cube = [	
//     lightred, lightred, lightred, lightred, lightred, lightred,
//     darkred, darkred, darkred, darkred, darkred, darkred,
//     lightred, lightred, lightred, lightred, lightred, lightred,
//     darkred, darkred, darkred, darkred, darkred, darkred,
//     red, red, red, red, red, red,
//     red, red, red, red, red, red,
// ];
const color_cube = [	
    lightred, lightred, lightred, lightred, lightred, lightred,
    darkred, darkred, darkred, darkred, darkred, darkred,
    lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
    darkblue, darkblue, darkblue, darkblue, darkblue, darkblue,
    red, red, red, red, red, red,
    blue, blue, blue, blue, blue, blue,
];

const color_cube_not_chosen = [	
    white, white, white, white, white, white,
    grey, grey, grey, grey, grey, grey,
    white, white, white, white, white, white,
    grey, grey, grey, grey, grey, grey,
    lightgrey, lightgrey, lightgrey, lightgrey, lightgrey, lightgrey,
    lightgrey, lightgrey, lightgrey, lightgrey, lightgrey, lightgrey,
];	


const longblock_vertices = [
    [ 0.5, 1.5, 0.5, 1], //0
    [ 0.5, 1.5,-0.5, 1], //1
    [ 0.5,-0.5, 0.5, 1], //2
    [ 0.5,-0.5,-0.5, 1], //3
    [-0.5, 1.5, 0.5, 1], //4
    [-0.5, 1.5,-0.5, 1], //5
    [-0.5,-0.5, 0.5, 1], //6
    [-0.5,-0.5,-0.5, 1], //7
];

const longblock_indices = cube_indices;

const points_longblock = [];
longblock_indices.forEach((value) => { points_longblock.push(longblock_vertices[value]) });

const color_longblock = color_cube;


// --- FLOOR -------------------------------------------------------------------

const tile_vertices = [
    [ 0.5, 0.5, 0.5, 1], //0
    [ 0.5, 0.5,-0.5, 1], //1
    [ 0.5, 0.25, 0.5, 1], //2
    [ 0.5, 0.25,-0.5, 1], //3
    [-0.5, 0.5, 0.5, 1], //4
    [-0.5, 0.5,-0.5, 1], //5
    [-0.5, 0.25, 0.5, 1], //6
    [-0.5, 0.25,-0.5, 1], //7
];

const tile_indices = cube_indices;

const points_tile = [];
tile_indices.forEach((value) => { points_tile.push(tile_vertices[value]) });

const color_tile_plain = [
    grey, grey, grey, grey, grey, grey,
    darkgrey, darkgrey, darkgrey, darkgrey, darkgrey, darkgrey,
    grey, grey, grey, grey, grey, grey,
    darkgrey, darkgrey, darkgrey, darkgrey, darkgrey, darkgrey,
    lightgrey, lightgrey, lightgrey, lightgrey, lightgrey, lightgrey,
    lightgrey, lightgrey, lightgrey, lightgrey, lightgrey, lightgrey,
];

const color_tile_fragile = [
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,
];	

const color_tile_switched = [
    blue, blue, blue, blue, blue, blue,
    darkblue, darkblue, darkblue, darkblue, darkblue, darkblue,
    blue, blue, blue, blue, blue, blue,
    darkblue, darkblue, darkblue, darkblue, darkblue, darkblue,
    lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
    lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
];


// --- SOFT BUTTON -------------------------------------------------------------

const softbutton_vertices = [
    [ 0.20, -0.40,-0.35, 1], //0
    [ 0.35, -0.40,-0.20, 1], //1
    [ 0.35, -0.40, 0.20, 1], //2
    [ 0.20, -0.40, 0.35, 1], //3
    [-0.20, -0.40, 0.35, 1], //4
    [-0.35, -0.40, 0.20, 1], //5
    [-0.35, -0.40,-0.20, 1], //6
    [-0.20, -0.40,-0.35, 1], //7

    [ 0.20, -0.50,-0.35, 1], //8
    [ 0.35, -0.50,-0.20, 1], //9
    [ 0.35, -0.50, 0.20, 1], //10
    [ 0.20, -0.50, 0.35, 1], //11
    [-0.20, -0.50, 0.35, 1], //12
    [-0.35, -0.50, 0.20, 1], //13
    [-0.35, -0.50,-0.20, 1], //14
    [-0.20, -0.50,-0.35, 1], //15
];

const softbutton_indices = [
    // Top
    0, 1, 7, //0
    1, 6, 7, //1
    1, 2, 6, //2
    2, 5, 6, //3
    2, 3, 5, //4
    3, 4, 5, //5

    3, 11, 4, // Side 1
    4, 11, 12,
    
    4, 12, 5, // Side 2
    5, 12, 13,
    
    5, 13, 6, // Side 3
    6, 13, 14,
    
    6, 14, 7, // Side 4
    7, 14, 15,
    
    7, 15, 0, // Side 5
    0, 15, 8,
   
    0, 8, 1, // Side 6
    1, 8, 9,
    
    1, 9, 2, // Side 7
    2, 9, 3,
    
    2, 10, 3, // Side 8
    3, 10, 11
];

const points_softbutton = [];
softbutton_indices.forEach((value) => { points_softbutton.push(softbutton_vertices[value]) });

const color_softbutton = [
    lightblue, lightblue, lightblue, lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
    lightblue, lightblue, lightblue, lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,

    blue, blue, blue, blue, blue, blue,
    darkblue, darkblue, darkblue, darkblue, darkblue, darkblue,
    blue, blue, blue, blue, blue, blue,
    darkblue, darkblue, darkblue, darkblue, darkblue, darkblue,
    blue, blue, blue, blue, blue, blue,
    darkblue, darkblue, darkblue, darkblue, darkblue, darkblue,
    blue, blue, blue, blue, blue, blue,
    darkblue, darkblue, darkblue, darkblue, darkblue, darkblue,
];


// --- HEAVY BUTTON -------------------------------------------------------------

const heavybutton_vertices = [
    [ 0.20, -0.40,-0.35, 1], //0
    [ 0.35, -0.40,-0.20, 1], //1
    [ 0.15, -0.40,0, 1], // 2
    [ 0.35, -0.40, 0.20, 1], //3
    [ 0.20, -0.40, 0.35, 1], //4
    [ 0, -0.40,0.15, 1], // 5
    [-0.20, -0.40, 0.35, 1], //6
    [-0.35, -0.40, 0.20, 1], //7
    [-0.15, -0.40,0, 1], // 8
    [-0.35, -0.40,-0.20, 1], //9
    [-0.20, -0.40,-0.35, 1], //10
    [0, -0.40,-0.15, 1], // 11

    [ 0.20, -0.50,-0.35, 1], //12
    [ 0.35, -0.50,-0.20, 1], //13
    [ 0.15, -0.50,0, 1], // 14
    [ 0.35, -0.50, 0.20, 1], //15
    [ 0.20, -0.50, 0.35, 1], //16
    [ 0, -0.50,0.15, 1], // 17
    [-0.20, -0.50, 0.35, 1], //18
    [-0.35, -0.50, 0.20, 1], //19
    [-0.15, -0.50,0, 1], // 20
    [-0.35, -0.50,-0.20, 1], //21
    [-0.20, -0.50,-0.35, 1], //22
    [0, -0.50,-0.15, 1], // 23
];

const heavybutton_indices = [
    // Top
    0, 1, 11, //0
    1, 2, 11, //1
    2, 3, 4, //2
    2, 4, 5, //3
    5, 6, 7, //4
    5, 7, 8, //5
    8, 9, 10, //6
    8, 10, 11, //7
    11, 2, 5, //8
    11, 5, 8, //9

    0, 12, 1, // Side 1
    1, 12, 13,
    
    1, 13, 2, // Side 2
    2, 13, 14,
    
    2, 14, 3, // Side 3
    3, 14, 15,
    
    3, 15, 4, // Side 4
    4, 15, 16,
    
    4, 16, 5, // Side 5
    5, 16, 17,
   
    5, 17, 6, // Side 6
    6, 17, 18,
    
    6, 18, 7, // Side 7
    7, 18, 19,
    
    7, 19, 8, // Side 8
    8, 19, 20,

    8, 20, 9, // Side 9
    9, 20, 21,

    9, 21, 10, // Side 10
    10, 21, 22,

    10, 22, 11, // Side 11
    11, 22, 23,

    11, 23, 0, // Side 12
    0, 23, 12
];

const points_heavybutton = [];
heavybutton_indices.forEach((value) => { points_heavybutton.push(heavybutton_vertices[value]) });

const color_heavybutton = [
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,

    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
];


// --- SPLIT -------------------------------------------------------------------

const split_vertices = [
    // Right arm (top)
    [ 0.10, -0.40, 0.34, 1], //0
    [ 0.25, -0.40, 0.25, 1], //1
    [ 0.34, -0.40, 0.10, 1], //2
    [ 0.35, -0.40, 0.00, 1], //3
    [ 0.34, -0.40,-0.10, 1], //4
    [ 0.25, -0.40,-0.25, 1], //5
    [ 0.10, -0.40,-0.34, 1], //6
    [ 0.10, -0.40,-0.17, 1], //7
    [ 0.17, -0.40,-0.10, 1], //8
    [ 0.20, -0.40, 0.00, 1], //9
    [ 0.17, -0.40, 0.10, 1], //10
    [ 0.10, -0.40, 0.17, 1], //11

    // Left arm (top)
    [-0.10, -0.40, 0.34, 1], //12
    [-0.10, -0.40, 0.17, 1], //13
    [-0.17, -0.40, 0.10, 1], //14
    [-0.20, -0.40, 0.00, 1], //15
    [-0.17, -0.40,-0.10, 1], //16
    [-0.10, -0.40,-0.17, 1], //17
    [-0.10, -0.40,-0.34, 1], //18
    [-0.25, -0.40,-0.25, 1], //19
    [-0.34, -0.40,-0.10, 1], //20
    [-0.35, -0.40, 0.00, 1], //21
    [-0.34, -0.40, 0.10, 1], //22
    [-0.25, -0.40, 0.25, 1], //23

    // Right arm (bottom)
    [ 0.10, -0.50, 0.34, 1], //24
    [ 0.25, -0.50, 0.25, 1], //25
    [ 0.34, -0.50, 0.10, 1], //26
    [ 0.35, -0.50, 0.00, 1], //27
    [ 0.34, -0.50,-0.10, 1], //28
    [ 0.25, -0.50,-0.25, 1], //29
    [ 0.10, -0.50,-0.34, 1], //30
    [ 0.10, -0.50,-0.17, 1], //31
    [ 0.17, -0.50,-0.10, 1], //32
    [ 0.20, -0.50, 0.00, 1], //33
    [ 0.17, -0.50, 0.10, 1], //34
    [ 0.10, -0.50, 0.17, 1], //35

    // Left arm (bottom)
    [-0.10, -0.50, 0.34, 1], //36
    [-0.10, -0.50, 0.17, 1], //37
    [-0.17, -0.50, 0.10, 1], //38
    [-0.20, -0.50, 0.00, 1], //39
    [-0.17, -0.50,-0.10, 1], //40
    [-0.10, -0.50,-0.17, 1], //41
    [-0.10, -0.50,-0.34, 1], //42
    [-0.25, -0.50,-0.25, 1], //43
    [-0.34, -0.50,-0.10, 1], //44
    [-0.35, -0.50, 0.00, 1], //45
    [-0.34, -0.50, 0.10, 1], //46
    [-0.25, -0.50, 0.25, 1], //47
];

const split_indices = [
    // Top right
    0, 1, 11, //0
    1, 10, 11, //1
    1, 2, 10, //2
    2, 9, 10, //3
    2, 3, 9, //4
    3, 4, 9, //5
    4, 8, 9, //6
    4, 5, 8, //7
    5, 7, 8, //8
    5, 6, 7, //9

    0, 24, 1, // Side 1
    1, 24, 25,
    
    1, 25, 2, // Side 2
    2, 25, 26,
    
    2, 26, 3, // Side 3
    3, 26, 27,
    
    3, 27, 4, // Side 4
    4, 27, 28,
    
    4, 28, 5, // Side 5
    5, 28, 29,
   
    5, 29, 6, // Side 6
    6, 29, 30,
    
    6, 30, 7, // Side 7
    7, 30, 31,
    
    7, 31, 8, // Side 8
    8, 31, 32,

    8, 32, 9, // Side 9
    9, 32, 33,

    9, 33, 10, // Side 10
    10, 33, 34,

    10, 34, 11, // Side 11
    11, 34, 35,

    11, 35, 0, // Side 12
    0, 35, 24,

    // Top left
    12, 13, 23, //10
    13, 14, 23, //11
    14, 22, 23, //12
    14, 15, 22, //13
    15, 21, 22, //14
    15, 20, 21, //15
    15, 16, 20, //16
    16, 19, 20, //17
    16, 17, 19, //18
    17, 18, 19, //19

    12, 36, 13, // Side 1
    13, 36, 37,
    
    13, 37, 14, // Side 2
    14, 37, 38,
    
    14, 38, 15, // Side 3
    15, 38, 39,
    
    15, 39, 16, // Side 4
    16, 39, 40,
    
    16, 40, 17, // Side 5
    17, 40, 41,
   
    17, 41, 18, // Side 6
    18, 41, 42,
    
    18, 42, 19, // Side 7
    19, 42, 43,
    
    19, 43, 20, // Side 8
    20, 43, 44,

    20, 44, 21, // Side 9
    21, 44, 45,

    21, 45, 22, // Side 10
    22, 45, 46,

    22, 46, 23, // Side 11
    23, 46, 47,

    23, 47, 12, // Side 12
    12, 47, 36,
];

const points_split = [];
split_indices.forEach((value) => { points_split.push(split_vertices[value]) });

const color_split = [
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,

    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,


    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, 
    lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,

    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    green, green, green, green, green, green,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
    darkgreen, darkgreen, darkgreen, darkgreen, darkgreen, darkgreen,
];

