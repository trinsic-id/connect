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
import {Lock} from "react-feather";
import pearbnbLogo from "./assets/pearbnb-logo.png";

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
        if (data?.clientToken !== undefined && sdk === undefined && !isLoading && state === AppStates.MODAL_OPEN) {
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
    }, [sdk, data?.clientToken, isLoading, state]);

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
            } flex flex-col place-content-center items-center bg-contain text-center`}
        >
            {!isFinished && data?.clientToken && !isLoading ? null && (
                <div
                    className={`${isDesktop ? "h-[600px] w-[400px]" : "h-full min-h-[600px] w-full"}
                     flex place-content-center items-center`}
                >
                    <Spinner
                        fadeIn="none"
                        name="double-bounce"
                        color="white"
                        className={`h-12 w-12 shrink-0`}
                    />
                </div>
            ):null}

            {state === AppStates.SIGNUP &&
                <div className="flex flex-col text-white w-[22rem] absolute top-40" >
                    <img src={pearbnbLogo} className="h-9 w-9 mb-5"></img>
                    <p className="flex flex-col text-white text-4xl font-semibold text-left mb-3" >
                        PearBnb
                    </p>
                    <p className="text-2xl font-light text-left mb-7">
                        Host guests at your house, apartment, or condo.
                    </p>
                    <button
                        className="flex flex-row items-center justify-center rounded-full font-medium transition-opacity disabled:opacity-25 bg-[#f43f5e] px-12 py-3 text-base font-light"
                        onClick={() => setState(AppStates.START_VERIFYING)}
                    >
                        Become a Host
                    </button>
                    <p className="text-xs font-light mt-5">
                        By signing up you recognize you’re using a demo from <a href="https://trinsic.id" className="underline">Trinsic</a> and not a real app.
                    </p>
                </div>
            }
            {state === AppStates.START_VERIFYING || state === AppStates.MODAL_OPEN ? (
                <div className="flex flex-col text-white w-[22rem] absolute top-40 items-center" >
                    <img src={pearbnbLogo} className="flex h-9 w-9 mb-5"></img>
                    <p className="text-xl font-light mb-3">
                        You’re almost ready to host on PearBnb. First we’ll need to verify your identity.
                    </p>
                    <button
                        className="flex w-full flex-row items-center justify-center rounded-full font-medium transition-opacity disabled:opacity-25 bg-[#f43f5e] px-12 py-3 text-base font-light"
                        onClick={() => setState(AppStates.MODAL_OPEN)}
                    >
                        Start verifying
                    </button>
                </div>
            ):null}
            {state === AppStates.SUCCESS && <></>}
            {state === AppStates.LANDING && <></>}

            {!!error && <Error error={error}/>}
            {isSuccess && result && (
                <Success
                    data={
                        Object.values(result.verifications)[0].normalizedGovernmentIdData
                    }
                />
            )}

            <div
                className="flex w-full absolute bottom-0 items-center justify-center bg-[#343434] opacity-80"
            >
                <div className="flex w-full gap-1 justify-center">
                    <Lock className="h-3 w-3 mt-3 text-white"></Lock>
                    <div className="font-bold pb-5 pt-3 text-xs text-center text-white">
                        Demo by Trinsic
                    </div>
                </div>
            </div>
        </div>
    );
};
