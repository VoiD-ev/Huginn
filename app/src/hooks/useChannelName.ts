import { APIDMChannel, APIGroupDMChannel } from "@shared/api-types";
import { useMemo } from "react";

export function useChannelName(channel: APIDMChannel | APIGroupDMChannel) {
   const name = useMemo(
      () => ("name" in channel && channel.name ? channel.name : channel.recipients.map((x) => x.displayName).join(", ")),
      [channel],
   );

   return name;
}
