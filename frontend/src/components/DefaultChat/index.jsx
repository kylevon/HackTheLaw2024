import React, { useEffect, useState } from "react";
import {
  GithubLogo,
  GitMerge,
  EnvelopeSimple,
  Plus,
} from "@phosphor-icons/react";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "../Modals/NewWorkspace";
import paths from "@/utils/paths";
import { isMobile } from "react-device-detect";
import { SidebarMobileHeader } from "../Sidebar";
import ChatBubble from "../ChatBubble";
import System from "@/models/system";
import UserIcon from "../UserIcon";
import { userFromStorage } from "@/utils/request";
import { AI_BACKGROUND_COLOR, USER_BACKGROUND_COLOR } from "@/utils/constants";
import useUser from "@/hooks/useUser";

export default function DefaultChatContainer() {
  const [mockMsgs, setMockMessages] = useState([]);
  const { user } = useUser();
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
  } = useNewWorkspaceModal();
  const popMsg = !window.localStorage.getItem("anythingllm_intro");

  useEffect(() => {
    const fetchData = async () => {
      const fetchedMessages = await System.getWelcomeMessages();
      setFetchedMessages(fetchedMessages);
    };
    fetchData();
  }, []);

  const MESSAGES = [
    <React.Fragment>
      <div
        className={`flex justify-center items-end w-full ${AI_BACKGROUND_COLOR} md:mt-0 mt-[40px]`}
      >
        <div
          className={`pt-10 pb-6 px-4 w-full flex gap-x-5 md:max-w-[80%] flex-col`}
        >
          <div className="flex gap-x-5">
            <span
              className={`whitespace-pre-line text-white font-normal text-sm md:text-sm flex flex-col gap-y-1 mt-2`}
            >
      <h2 className="text-xl font-bold text-center">Introducing DocSync Fusion</h2>
  <p>
    The revolutionary legaltech solution designed to streamline your document management process. Effortlessly select a primary document and automatically find and link related documents, such as subsequent amendment letters.
  </p>
  <p>
    Our software arranges these documents chronologically, ensuring a clear and organized structure from the original agreement through all amendments.
  </p>
  <p>
    Once linked, DocSync Fusion creates a consolidated copy of the agreement, seamlessly incorporating all amendments and intelligently managing any merge conflicts.
  </p>
  <p>
    With built-in audit controls, users can track changes across all documents, providing transparency and precision in every step of the amendment process.
  </p>
  <p className="text-center font-semibold mt-4">
    Say goodbye to document chaos and hello to streamlined efficiency with DocSync Fusion.
  </p>
            </span>
          </div>
        </div>
      </div>
    </React.Fragment>,
  ];

  useEffect(() => {
    function processMsgs() {
      if (!!window.localStorage.getItem("anythingllm_intro")) {
        setMockMessages([...MESSAGES]);
        return false;
      } else {
        setMockMessages([MESSAGES[0]]);
      }

      var timer = 500;
      var messages = [];

      MESSAGES.map((child) => {
        setTimeout(() => {
          setMockMessages([...messages, child]);
          messages.push(child);
        }, timer);
        timer += 2_500;
      });
      window.localStorage.setItem("anythingllm_intro", 1);
    }

    processMsgs();
  }, []);

  return (
    <div
      style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
      className="transition-all duration-500 relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-main-gradient w-full h-full overflow-y-scroll border-2 border-outline"
    >
      {isMobile && <SidebarMobileHeader />}
      {fetchedMessages.length === 0
        ? mockMsgs.map((content, i) => {
            return <React.Fragment key={i}>{content}</React.Fragment>;
          })
        : fetchedMessages.map((fetchedMessage, i) => {
            return (
              <React.Fragment key={i}>
                <ChatBubble
                  message={
                    fetchedMessage.user === ""
                      ? fetchedMessage.response
                      : fetchedMessage.user
                  }
                  type={fetchedMessage.user === "" ? "response" : "user"}
                  popMsg={popMsg}
                />
              </React.Fragment>
            );
          })}
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
    </div>
  );
}
