import { useClient } from "@contexts/apiContext";
import { Snowflake } from "@huginn/shared";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useCreateDMChannel() {
   const client = useClient();
   const navigate = useNavigate();

   const mutation = useMutation({
      async mutationFn(data: { userId: Snowflake; skipNavigation?: boolean }) {
         return await client.channels.createDM({ recipients: [data.userId] });
      },
      async onSuccess(data, variables) {
         if (!variables.skipNavigation) await navigate({ to: "/channels/@me/" + data.id });
      },
   });

   return mutation;
}
