import {AppFile} from "@/types/files/AppFile";


export interface ApplicationWindow {
    id: number,
    zIndex: number,
    name: string,
    isMinimized: boolean,
    fileProperties: AppFile
}