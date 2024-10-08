import { useClient } from "@contexts/apiContext";
import { APIGetUserRelationshipsResult, GatewayPublicUserUpdateData, omit } from "@huginn/shared";
import { GatewayRelationshipCreateData } from "@huginn/shared";
import { Snowflake } from "@huginn/shared";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";

export default function FriendsProvider(props: { children?: ReactNode }) {
   const client = useClient();
   const queryClient = useQueryClient();

   function onRelationshipCreated(d: GatewayRelationshipCreateData) {
      const friends = queryClient.getQueryData<APIGetUserRelationshipsResult>(["relationships"]);
      if (!friends) return;

      if (friends.some(x => x.id === d.id)) {
         const changedIndex = friends.findIndex(x => x.id === d.id && x.type !== d.type);
         if (changedIndex !== -1) {
            const newRelationships = friends.toSpliced(changedIndex, 1, { ...friends[changedIndex], type: d.type });
            queryClient.setQueryData<APIGetUserRelationshipsResult>(["relationships"], newRelationships);
         }
         return;
      }

      queryClient.setQueryData(["relationships"], [...friends, d]);
   }

   function onRelationshipDeleted(userId: Snowflake) {
      queryClient.setQueryData<APIGetUserRelationshipsResult>(["relationships"], data => data?.filter(x => x.user.id !== userId));
   }

   function onPublicUserUpdated(newUser: GatewayPublicUserUpdateData) {
      queryClient.setQueryData<APIGetUserRelationshipsResult>(["relationships"], old =>
         old?.map(relationship => ({
            ...relationship,
            user: omit(newUser, ["system"]),
         })),
      );
   }

   useEffect(() => {
      client.gateway.on("relationship_create", onRelationshipCreated);
      client.gateway.on("relationship_delete", onRelationshipDeleted);
      client.gateway.on("public_user_update", onPublicUserUpdated);

      return () => {
         client.gateway.off("relationship_create", onRelationshipCreated);
         client.gateway.off("relationship_delete", onRelationshipDeleted);
         client.gateway.off("public_user_update", onPublicUserUpdated);
      };
   }, []);

   return props.children;
}
