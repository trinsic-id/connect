import { MobileDetect } from "@trinsic/trinsic";
import { createContext } from "react";

export enum AppStates {
    SIGNUP,
    START_VERIFYING,
    MODAL_OPEN,
    SUCCESS,
    LANDING,
}

export interface DemosContextInterface{
    appState: AppStates;
    setAppState: React.Dispatch<React.SetStateAction<AppStates>>;
}

export const DemosContext = createContext<DemosContextInterface | null>(null);