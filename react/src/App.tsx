import { ConnectClient } from "@trinsic/trinsic/lib/src/ConnectClient";
import { delay } from "lodash";
import { useEffect, useState } from "react";
import Spinner from "react-spinkit";
import { useToggle } from "react-use";
import { Success } from "./components/Success";
import { baseUrl } from "./constants/connectUrl";
import { useMobileDetect } from "./hooks/custom/useDetectMobile";
import { useWhichRelyingParty } from "./hooks/custom/useWhichRelyingParty";
import { useCreateSession } from "./hooks/mutations/useCreateSession";

export const App = () => {
  const { isPocketRides } = useWhichRelyingParty();
  const { data } = useCreateSession();
  const [isFinished, toggleFinished] = useToggle(false);
  const [isLoading, toggleLoading] = useToggle(true);

  const [sdk, setSdk] = useState<ConnectClient | undefined>(undefined);

  const { isMobile, isDesktop } = useMobileDetect();

  useEffect(() => {
    if (data?.clientToken !== undefined && sdk === undefined && !isLoading) {
      const cSdk = new ConnectClient(baseUrl);
      setSdk(cSdk);
      cSdk.identityVerification(data.clientToken).then((val) => {
        toggleFinished(true);
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

  return (
    <div
      className={`${isPocketRides ? "pocketrides-bg" : "pairbnb-bg"} ${
        isDesktop ? "h-full w-full" : "lock-bg h-screen w-screen"
      } flex  flex-col place-content-center items-center bg-contain text-center`}
    >
      {!isFinished && (
        <>
          {isDesktop && (
            <>
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
            </>
          )}
        </>
      )}

      {isMobile && !isFinished && (
        <>
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
        </>
      )}

      {isFinished && data?.clientToken && (
        <Success clientToken={data.sessionId} />
      )}
    </div>
  );
};
