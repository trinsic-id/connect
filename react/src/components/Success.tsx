import { capitalize } from "lodash";
import { useMemo } from "react";
import { CheckCircle } from "react-feather";
import { VPToken } from "../hooks/queries/useGetSessionResult";

export const Success = ({ vpToken }: { vpToken: VPToken }) => {
  const credential = useMemo(() => {
    if (Array.isArray(vpToken.verifiableCredential)) {
      return vpToken.verifiableCredential[0];
    } else {
      return vpToken.verifiableCredential;
    }
  }, [vpToken]);

  const name = useMemo(() => {
    if (credential) {
      return `${
        capitalize(credential?.credentialSubject.givenName).split(" ")[0]
      } ${capitalize(credential?.credentialSubject.familyName)}`;
    }
  }, [credential]);
  return (
    <div className="flex h-full w-full place-content-center items-center">
      <div className="flex h-full max-h-[280px] w-full max-w-[380px] flex-col items-center gap-4 rounded-lg bg-white px-2 py-4">
        <div className="pt-16 text-center">
          <CheckCircle className="h-14 w-14 text-success-700" />
        </div>
        <span className="text-lg">{name && `Thanks ${name}`}</span>
      </div>
    </div>
  );
};
