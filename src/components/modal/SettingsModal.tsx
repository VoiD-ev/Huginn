import {
   Dialog,
   DialogPanel,
   DialogTitle,
   Tab,
   TabGroup,
   TabList,
   TabPanel,
   TabPanels,
   Transition,
   TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { useModals, useModalsDispatch } from "../../hooks/useModals";
import { readSettingsFile, writeSettingsFile } from "../../lib/appData";
import SettingsAdvancedTab from "./SettingsAdvanced";
import ModalBackground from "./ModalBackground";

const tabs: SettingsTab[] = [
   { name: "general", text: "General", children: [{ name: "audio", text: "Audio", icon: <IconMdiSpeakerphone /> }] },
   {
      name: "app-settings",
      text: "App Settings",
      children: [
         { name: "notification", text: "Notification", icon: <IconMdiNotifications /> },
         { name: "advanced", text: "Advanced", icon: <IconMdiServer />, component: SettingsAdvancedTab },
      ],
   },
];

const defaultTabIndex = 0;

function useFlatTabs() {
   return tabs.filter((x) => x.children).flatMap((x) => x.children!);
}

export default function SettingsModal() {
   const { settings: modal } = useModals();
   const dispatch = useModalsDispatch();

   const flatTabs = useFlatTabs();
   const [currentTab, setCurrentTab] = useState(() => flatTabs[defaultTabIndex].text);

   const settings = useRef<AppSettings>({});

   useEffect(() => {
      if (!window.__TAURI__) return;

      async function read() {
         if (modal.isOpen) {
            settings.current = await readSettingsFile();
         } else {
            console.log(settings.current?.serverAddress);
            await writeSettingsFile({ ...settings.current });
         }
      }

      read();
   }, [modal.isOpen]);

   function onTabChanged(index: number) {
      setCurrentTab(flatTabs[index].text);
   }

   return (
      <Transition show={modal.isOpen}>
         <Dialog as="div" className="relative z-10" onClose={() => dispatch({ settings: { isOpen: false } })}>
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
                     <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-background transition-all">
                        <TabGroup className="flex" vertical defaultIndex={defaultTabIndex} onChange={onTabChanged}>
                           <div className="bg-secondary/50">
                              <TabList className="flex w-48 flex-shrink-0 select-none flex-col items-start py-2">
                                 <DialogTitle className="mx-5 mb-3 mt-3 flex items-center justify-start gap-x-1.5">
                                    <div className="text-xl font-medium text-text">Settings</div>
                                 </DialogTitle>
                                 <SettingsTabs />
                              </TabList>
                           </div>
                           <SettingsPanels currentTab={currentTab} settings={settings.current} />
                        </TabGroup>
                        <button
                           className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-secondary  hover:bg-tertiary"
                           onClick={() => dispatch({ settings: { isOpen: false } })}
                        >
                           <IconMdiClose className="h-5 w-5 text-error" />
                        </button>
                     </DialogPanel>
                  </TransitionChild>
               </div>
            </div>
         </Dialog>
      </Transition>
   );
}

function SettingsTabs() {
   return (
      <div className="flex w-full flex-col items-center justify-center gap-y-1">
         {tabs.map((tab, i) => (
            <Fragment key={tab.name}>
               <div className={`mb-1 w-full px-2.5 text-left text-xs uppercase text-text/50 ${i === 0 ? "mt-2" : "mt-4"}`}>
                  {tab.text}
               </div>
               {tab.children?.map((child) => (
                  <div className="w-full px-2" key={child.name}>
                     <Tab as={Fragment}>
                        {({ selected }) => (
                           <button
                              className={`flex w-full items-center gap-x-2 rounded-md px-2 py-1.5 text-left text-sm text-text outline-none ${
                                 selected ? "bg-white/20 text-opacity-100" : "text-opacity-70 hover:bg-white/10 hover:text-opacity-100"
                              }`}
                           >
                              {child.icon}
                              <span>{child.text}</span>
                           </button>
                        )}
                     </Tab>
                  </div>
               ))}
            </Fragment>
         ))}
      </div>
   );
}

function SettingsPanels(props: { settings: AppSettings; currentTab: string }) {
   const flatTabs = useFlatTabs();

   return (
      <TabPanels className="w-full p-5">
         <div className="mb-5 text-lg text-text">{props.currentTab}</div>
         {flatTabs.map((tab) => (
            <TabPanel key={tab.name}>
               {tab.component ? (
                  () => {
                     const Component = tab.component!;
                     return <Component settings={props.settings}></Component>;
                  }
               ) : (
                  <span className="text-sm italic text-text/50">{tab.name} (Soon...)</span>
               )}
               {/* <component :is="{ ...tab.component }" v-else v-model="settings" /> */}
            </TabPanel>
         ))}
      </TabPanels>
   );
}
