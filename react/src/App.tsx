import {ConnectClient} from "@trinsic/trinsic";
import {delay} from "lodash";
import {useContext, useEffect, useState} from "react";
import Spinner from "react-spinkit";
import {useToggle} from "react-use";
import {Error, IDVError} from "./components/Error";
import {Success} from "./components/Success";
import {baseUrl} from "./constants/connectUrl";
import {useMobileDetect} from "./hooks/custom/useDetectMobile";
import {useWhichRelyingParty} from "./hooks/custom/useWhichRelyingParty";
import {useCreateSession} from "./hooks/mutations/useCreateSession";
import {useGetSessionResult} from "./hooks/queries/useGetSessionResult";
import { DemoPage } from "./components/DemoPage";
import {AppStates, DemosContext, DemosContextInterface } from "./context/DemosContext";

export const App = () => {
    /*
    const {
        appState,
        setAppState,
    } = useContext<DemosContextInterface | null>(
        DemosContext,
    )!;
    */
    
    const {isPocketRides} = useWhichRelyingParty();
    const {data} = useCreateSession();
    const [isLoading, toggleLoading] = useToggle(true);
    const [isSuccess, toggleSuccess] = useToggle(false);
    const [error, SetError] = useState<undefined | any>(undefined);
    const [sdk, setSdk] = useState<ConnectClient | undefined>(undefined);

    const isFinished = isSuccess || !!error;

    const {isMobile, isDesktop} = useMobileDetect();

    useEffect(() => {
        if (data?.clientToken !== undefined && sdk === undefined && !isLoading) {
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
            className={`flex w-full flex-col items-center
            ${isDesktop ? "h-full" : ""}
            ${isMobile ? "relative" : ""}`}
        >
            {!isFinished && (
                <>
                    {isDesktop && (
                        <DemoPage
                            key="-page"
                            id="-page"
                            className={`relative`}
                            isPocketRides={isPocketRides}
                            isDesktop={isDesktop}
                        >
                            <div className="flex h-[600px] w-[400px] place-content-center items-center">
                                {data?.clientToken && !isLoading ? null : (
                                    <Spinner
                                        fadeIn="none"
                                        name="double-bounce"
                                        color="white"
                                        className={`h-12 w-12 shrink-0`}
                                    />
                                )}
                            </div>
                        </DemoPage>
                    )}
                </>
            )}

            {isMobile && !isFinished && (
                <div className="flex h-full min-h-[600px] w-full place-content-center items-center">
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

            {!!error && <Error error={error}/>}
            {isSuccess && result && (
                <Success
                    data={
                        Object.values(result.verifications)[0].normalizedGovernmentIdData
                    }
                />
            )}
        </div>
    );
};
