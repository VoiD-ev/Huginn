import { useMemo } from "react";
import { Description, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import HuginnButton from "../button/HuginnButton";
import ModalBackground from "./ModalBackground";
import { useModals, useModalsDispatch } from "../../contexts/modalContext";
import ModalCloseButton from "../button/ModalCloseButton";

export default function InfoModal() {
   const { info: modal } = useModals();
   const dispatch = useModalsDispatch();

   const textColor = useMemo(
      () =>
         modal.status === "default"
            ? "text-text"
            : modal.status === "error"
              ? "text-error"
              : modal.status === "success"
                ? "text-primary"
                : "",
      [modal],
   );

   const title = useMemo(
      () =>
         modal.status === "default" ? "Information" : modal.status === "error" ? "Error" : modal.status === "success" ? "Success" : "",
      [modal.status],
   );

   const errorCode = useMemo(() => modal.text.match(/\([A-Za-z0-9]+\)/g)?.[0] ?? "", [modal.text]);

   const formattedText = useMemo(() => {
      return modal.text.replace(/\([A-Za-z0-9]+\)/g, "");
   }, [modal.text]);
   return (
      <Transition show={modal.isOpen}>
         <Dialog as="div" className="relative z-10" onClose={() => dispatch({ info: { isOpen: false } })}>
            <ModalBackground />
            <div className="fixed inset-0 top-6">
               <div className="flex h-full items-center justify-center">
                  <TransitionChild
                     enter="duration-150 ease-out"
                     enterFrom="opacity-0 scale-95"
                     enterTo="opacity-100 scale-100"
                     leave="duration-150 ease-in"
                     leaveFrom="opacity-100 scale-100"
                     leaveTo="opacity-0 scale-95"
                  >
                     <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-background p-2 transition-all">
                        {/* <DialogTitle
                           as="div"
                           className={`mb-5 flex h-11 items-center bg-error/20 px-5 text-lg font-medium ${textColor}`}
                        >
                           {title}
                        </DialogTitle> */}
                        {/* <div className="mb-5 h-0.5 w-full bg-secondary" /> */}
                        <Description className="mt-3 flex items-center justify-center gap-x-5 px-5">
                           <div>
                              {modal.status === "error" && <IconMaterialSymbolsErrorOutline className={`h-16 w-16 ${textColor}`} />}
                           </div>
                           <div className={`text-center text-white/70`}>
                              {formattedText}
                              <span v-if="errorCode" className={`italic opacity-90 ${textColor}`}>
                                 {errorCode}
                              </span>
                           </div>
                        </Description>

                        <HuginnButton className="mt-5 w-full bg-tertiary py-2.5" onClick={() => dispatch({ info: { isOpen: false } })}>
                           Close
                        </HuginnButton>

                        {/* <ModalCloseButton onClick={() => dispatch({ info: { isOpen: false } })} /> */}
                     </DialogPanel>
                  </TransitionChild>
               </div>
            </div>
         </Dialog>
      </Transition>
   );
}
