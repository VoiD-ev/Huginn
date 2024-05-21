import { Link, Outlet, createRootRoute, useRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@tauri-apps/api";
import { useEffect, useRef, useState } from "react";
import { HistoryContext } from "../contexts/historyContext";
import { WindowContext } from "../contexts/windowContext";
import useAppMaximized from "../hooks/useAppMaximized";
import { setup } from "../lib/middlewares";

export const Route = createRootRoute({
   async beforeLoad() {
      await setup();
   },
   component: Root,
});

function Root() {
   const router = useRouter();
   const [isMaximized, setMaximized] = useState(false);
   const lastPathname = useRef<string | null>(null);

   useEffect(() => {
      router.subscribe("onBeforeLoad", (arg) => {
         console.log("before");
         lastPathname.current = arg.fromLocation.pathname;
      });
   }, []);

   return (
      <WindowContext.Provider value={{ maximized: { isMaximized: isMaximized, setMaximized: setMaximized } }}>
         <HistoryContext.Provider value={{ lastPathname: lastPathname.current }}>
            <button onClick={() => localStorage.removeItem("refresh-token")}>Clear</button>
            <Link to="/channels/$channelId" params={{ channelId: "177812771176452101" }}>
               Channels
            </Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Outlet />
            <TanStackRouterDevtools />
            {window.__TAURI__ && <AppMaximizedEvent />}
         </HistoryContext.Provider>
      </WindowContext.Provider>
   );
}

function AppMaximizedEvent() {
   const { unlistenEvent: unlistenAppMaximized } = useAppMaximized();

   useEffect(() => {
      return () => {
         unlistenAppMaximized && unlistenAppMaximized();
      };
   });

   return <></>;
}
