import { createFileRoute } from "@tanstack/react-router";
import useUpdater from "../hooks/useUpdater";
import { useEffect, useMemo, useRef, useState } from "react";
import { UpdateManifest } from "@tauri-apps/api/updater";
import { invoke } from "@tauri-apps/api";

export const Route = createFileRoute("/splashscreen")({
   component: Splashscreen,
});

function Splashscreen() {
   const { checkUpdate, installUpdate, progress, contentLength, currentLength } = useUpdater();

   const [loadingState, setLoadingState] = useState<LoadingState>("none");
   const updateManifest = useRef<UpdateManifest>();

   const loadingText = useMemo(() => {
      return loadingState === "loading"
         ? "Loading"
         : loadingState === "checking_update"
           ? "Checking for updates"
           : loadingState === "updating"
             ? `Updating to v${updateManifest.current?.version}`
             : "Invalid State";
   }, [updateManifest.current, loadingState]);

   const updateProgressText = useMemo(() => {
      return `${(currentLength.current / 1024 / 1024).toFixed(2)}MB / ${(contentLength.current / 1024 / 1024).toFixed(2)}MB (${Math.ceil(progress)}%)`;
   }, [currentLength.current, contentLength.current, progress]);

   useEffect(() => {
      setLoadingState("checking_update");

      async function checkForUpdate() {
         const { shouldUpdate, manifest } = await checkUpdate();

         if (shouldUpdate) {
            updateManifest.current = manifest;
            setLoadingState("updating");

            await installUpdate();
         } else {
            setLoadingState("loading");
            await invoke("open_main");
         }
      }

      checkForUpdate();
   }, []);

   return (
      <div className="flex h-full w-full select-none items-center justify-center rounded-xl bg-background" data-tauri-drag-region>
         <div className="flex w-full flex-col items-center" data-tauri-drag-region>
            <IconFa6SolidCrow className="h-20 w-20 text-text transition-all hover:-rotate-12 active:rotate-6" />
            <div className="mb-5 text-xl font-medium text-text">Huginn</div>
            <div className="mb-2.5 text-text opacity-60">
               <span>{loadingText}</span>
               <span className="loader__dot">.</span>
               <span className="loader__dot">.</span>
               <span className="loader__dot">.</span>
            </div>
            {loadingState === "updating" && (
               <>
                  <div v-if="loadingState === 'updating'" className="h-4 w-2/3 overflow-hidden rounded-md bg-secondary">
                     <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div v-if="loadingState === 'updating'" className="mt-1 text-xs text-text opacity-60">
                     {updateProgressText}
                  </div>
               </>
            )}
         </div>
      </div>
   );
}
