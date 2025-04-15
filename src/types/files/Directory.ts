import {AppFile} from "@/types/AppFile";

export interface Directory {
    id: number,
    name: string,
    parentDirectories: Directory[],
    children: Directory | AppFile[]
}