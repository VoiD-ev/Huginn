import { HTMLInputTypeAttribute, useMemo, useState } from "react";
import HuginnInput from "./HuginnInput";
import { HuginnInputProps } from "@/types";

export default function PasswordInput(props: HuginnInputProps & { hideButton?: boolean }) {
   const [type, setType] = useState<HTMLInputTypeAttribute>(() => "password");

   const hidden = useMemo(() => type === "password", [type]);

   function toggleType() {
      setType(type === "password" ? "text" : "password");
   }

   return (
      <HuginnInput type={type} {...props}>
         {!props.hideButton && (
            <HuginnInput.Action>
               <button
                  className="border-l-background text-text flex h-full w-11 select-none items-center justify-center border-l-2 text-sm"
                  type="button"
                  onClick={toggleType}
               >
                  {hidden ? <IconMdiShow className="h-6 w-6" /> : <IconMdiHide className="h-6 w-6" />}
               </button>
            </HuginnInput.Action>
         )}
         {props.children}
      </HuginnInput>
   );
}
