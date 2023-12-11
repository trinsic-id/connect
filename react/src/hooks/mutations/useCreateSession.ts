import { useQuery } from "react-query";
import { useLocation, useToggle } from "react-use";

export interface FakeSessionResponse {
  idvSession?: string | undefined;
}

export interface CreateSessionResponse {
  clientToken: string;
  sessionId: string;
}

const handleCreateSession = async (
  queryParameters: string | undefined,
): Promise<CreateSessionResponse> => {
  const uri = `/api/create-session` + queryParameters;
  const resp = await fetch(uri, {
    method: "POST",
  });

  if (!resp.ok) {
    throw new Error("Error creating session");
  }

  const json: CreateSessionResponse = await resp.json();
  return json;
};

export const useCreateSession = () => {
  const [hasToken, toggleHasToken] = useToggle(false);
  const location = useLocation();
  return useQuery(
    ["client-token"],
    () => handleCreateSession(location.search),

    {
      onSuccess: () => {
        toggleHasToken(true);
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      enabled: hasToken === false,
    },
  );
};
