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
    dark: { char: '.', fg: '#125313', bg: '#000'},
    light: { char: '.', fg: '#35de30', bg: '#000'},
}

export const WALL_TILE: Tile = {
    visible: false,
    seen: false,
    walkable: false,
    transparent: false,
    dark: { char: '#', fg: '#125313', bg: '#000'},
    light: { char: '#', fg: '#35de30', bg: '#000'},
}
