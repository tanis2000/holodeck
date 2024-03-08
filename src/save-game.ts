import { PlayerInfo } from "./player-info"

export type SerializedPlayerInfo = {
    name: String
}

export type SerializedSaveGame = {
    playerInfo: SerializedPlayerInfo
}

export class SaveGame {
    public static load(): SerializedSaveGame {
        const saveGame = localStorage.getItem('holodeck-save')
        if (saveGame) {
            return JSON.parse(saveGame) as SerializedSaveGame
        } else {
            const res: SerializedSaveGame = {
                playerInfo: {
                    name: ''
                }
            }
            return res;
        }
    }

    public static save(playerInfo: PlayerInfo) {
        const res: SerializedSaveGame = {
            playerInfo: {
                name: playerInfo.name
            }
        }
        localStorage.setItem('holodeck-save', JSON.stringify(res));
    }
}