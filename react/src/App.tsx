import {ConnectClient} from "@trinsic/trinsic";
import {delay} from "lodash";
import {useEffect, useState} from "react";
import Spinner from "react-spinkit";
import {useToggle} from "react-use";
import {Error, IDVError} from "./components/Error";
import {Success} from "./components/Success";
import {baseUrl} from "./constants/connectUrl";
import {useMobileDetect} from "./hooks/custom/useDetectMobile";
import {useWhichRelyingParty} from "./hooks/custom/useWhichRelyingParty";
import {useCreateSession} from "./hooks/mutations/useCreateSession";
import {useGetSessionResult} from "./hooks/queries/useGetSessionResult";
import {CheckCircle, Lock} from "react-feather";

export const App = () => {
    enum AppStates {
        SIGNUP,
        START_VERIFYING,
        MODAL_OPEN,
        SUCCESS,
        LANDING,
    }

    const [state, setState] = useState<AppStates | undefined>(AppStates.SIGNUP);

    const {isPocketRides} = useWhichRelyingParty();
    const {data} = useCreateSession();
    const [isLoading, toggleLoading] = useToggle(true);
    const [isSuccess, toggleSuccess] = useToggle(false);
    const [error, SetError] = useState<undefined | any>(undefined);
    const [sdk, setSdk] = useState<ConnectClient | undefined>(undefined);

    const isFinished = isSuccess || !!error;

    const {isMobile, isDesktop} = useMobileDetect();

    useEffect(() => {
        if (data?.clientToken !== undefined && sdk === undefined && !isLoading && state===AppStates.MODAL_OPEN) {
            const cSdk = new ConnectClient(baseUrl);
            setSdk(cSdk);
            cSdk
                .identityVerification(data.clientToken)
                .then((val) => {
                    console.log("Success in identity verification", val);
                    toggleSuccess(true);
                })
                .catch((reason: IDVError) => {
                    console.error("Error in identity verification", reason);
                    SetError(reason);
                });
        }
    }, [sdk, data?.clientToken, isLoading]);

    useEffect(() => {
        if (isLoading) {
            if (data?.clientToken) {
                delay(() => {
                    toggleLoading(false);
                }, 500);
            }
        }
    }, [data?.clientToken, isLoading]);

    const {data: result} = useGetSessionResult(data?.sessionId, isSuccess);

    return (
        <div
            className={`${isPocketRides ? "pocketrides-bg" : "pearbnb-bg"} ${
                isDesktop ? "h-full w-full" : "lock-bg h-screen w-screen"
            } flex  flex-col place-content-center items-center bg-contain text-center`}
        >
            {!isFinished && (
                <div
                    className={`${isDesktop ? "h-[600px] w-[400px]" : "h-full min-h-[600px] w-full"}
                     flex place-content-center items-center`}
                >
                    {data?.clientToken && !isLoading ? null : (
                        <Spinner
                            fadeIn="none"
                            name="double-bounce"
                            color="white"
                            className={`h-12 w-12 shrink-0`}
                        />
                    )}
                </div>
            )}

            {state===AppStates.SIGNUP &&
                <div>
                    
                </div>
            }

            {!!error && <Error error={error}/>}
            {isSuccess && result && (
                <Success
                    data={
                        Object.values(result.verifications)[0].normalizedGovernmentIdData
                    }
                />
            )}
            
            <div
                className="flex w-full absolute bottom-0 items-center bg-neutral-800 opacity-80 text-center text-white"
            >
                <Lock className="h-14 w-14"></Lock>
                <div className="w-full font-semibold pb-6 pt-3 text-xs text-center text-white">
                    Demo by Trinsic
                </div>
            </div>
        </div>
    );
};
