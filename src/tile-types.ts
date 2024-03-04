export type Visual = {
    char: string
    fg: string
    bg: string
}

export type Tile = {
    visible: boolean
    seen: boolean
    walkable: boolean
    transparent: boolean
    dark: Visual
    light: Visual
}

export const FLOOR_TILE: Tile = {
    visible: false,
    seen: false,
    walkable: true,
    transparent: true,
    dark: { char: '.', fg: '#646464', bg: '#000'},
    light: { char: '.', fg: '#c8c8c8', bg: '#000'},
}

export const WALL_TILE: Tile = {
    visible: false,
    seen: false,
    walkable: false,
    transparent: false,
    dark: { char: '#', fg: '#646464', bg: '#000'},
    light: { char: '#', fg: '#c8c8c8', bg: '#000'},
}
