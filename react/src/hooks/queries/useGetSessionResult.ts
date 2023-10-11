import { useQuery } from "react-query";

const vc = {
  "@context": [
    "",
    {
      "@vocab": "",
    },
  ],
  id: "",
  type: [""],
  credentialSchema: {
    id: "",
    type: "",
  },
  credentialStatus: {
    id: "",
    type: "",
    revocationListCredential: "",
    revocationListIndex: "",
  },
  credentialSubject: {
    id: "",
    city: "",
    class: "",
    country: "",
    dateOfBirth: "",
    expiryDate: "",
    familyName: "",
    givenName: "",
    issueDate: "",
    issuer: "",
    number: "",
    portrait: "",
    postalCode: "",
    signature: "",
    state: "",
    streetAddress: "",
  },
  issuanceDate: "",
  issuer: "",
  proof: {
    type: "",
    created: "",
    nonce: "",
    proofPurpose: "",
    proofValue: "",
    verificationMethod: "",
  },
};

export type VPToken = {
  id: string;
  "@context": string[];
  type: string[];
  verifiableCredential: typeof vc | (typeof vc)[];
};

const handleGetSessionResult = async (
  clientToken: string,
): Promise<VPToken> => {
  const resp = await fetch(`/api/get-result?clientToken=${clientToken}`, {
    method: "POST",
  });

  if (!resp.ok) {
    throw new Error("Error getting session result");
  }

  const text = await resp.text();
  if (text === "no-result-yet") {
    throw new Error("Result not available yet");
  }

  const json: VPToken | null | undefined = JSON.parse(text);
  if (!json) {
    throw new Error("Not valid");
  }
  return json;
};

export const usGetSessionResult = (clientToken: string) => {
  return useQuery(
    ["session-result", clientToken],
    () => handleGetSessionResult(clientToken),

    {
      onSuccess: (data) => {
        console.log("result", data);
        // //console.log(data);
        // if (session !== undefined) setSession(data);
      },
      refetchInterval: false,
      retry: 5,
      retryDelay: 100,
      refetchOnWindowFocus: false,
    },
  );
};
