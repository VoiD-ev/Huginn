import { HuginnButtonProps } from "@/types";
import HuginnButton from "./HuginnButton";

export default function LoadingButton(props: HuginnButtonProps & { loading: boolean }) {
   return (
      <HuginnButton
         className="bg-opacity-80 active:bg-opacity-80"
         innerClassName="flex items-center justify-center"
         disabled={props.loading}
         {...props}
      >
         {props.loading ? (
            <IconSvgSpinners3DotsFade className="text-text absolute h-8 w-8" />
         ) : (
            <div className="absolute">{props.children}</div>
         )}
      </HuginnButton>
   );
}
