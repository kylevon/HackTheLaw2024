import React, { useEffect, useState } from "react";
import Workspace from "@/models/workspace";
import LoadingChat from "./LoadingChat";
import ChatContainer from "./ChatContainer";
import paths from "@/utils/paths";
import ModalWrapper from "../ModalWrapper";
import { useParams } from "react-router-dom";

export default function WorkspaceChat({ loading, workspace, showChat }) {
  const { threadSlug = null } = useParams();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function getHistory() {
      if (loading) return;
      if (!workspace?.slug) {
        setLoadingHistory(false);
        return false;
      }

      const chatHistory = threadSlug
        ? await Workspace.threads.chatHistory(workspace.slug, threadSlug)
        : await Workspace.chatHistory(workspace.slug);

      setHistory(chatHistory);
      setLoadingHistory(false);
    }
    getHistory();
  }, [workspace, loading]);

  if (loadingHistory) return <LoadingChat />;
  if (!loading && !loadingHistory && !workspace) {
    return (
      <>
        {loading === false && !workspace && (
          <ModalWrapper isOpen={true}>
            <div className="relative w-full md:max-w-2xl max-h-full bg-main-gradient rounded-lg shadow p-4">
              <div className="flex flex-col gap-y-4 w-full p-6 text-center">
                <p className="font-semibold text-red-500 text-xl">
                  Workspace not found!
                </p>
                <p className="text-sm mt-4 text-white">
                  It looks like a workspace by this name is not available.
                </p>

                <div className="flex w-full justify-center items-center mt-4">
                  <a
                    href={paths.home()}
                    className="border border-slate-200 text-white hover:bg-slate-200 hover:text-slate-800 px-4 py-2 rounded-lg text-sm items-center flex gap-x-2 transition-all duration-300"
                  >
                    Go back to homepage
                  </a>
                </div>
              </div>
            </div>
          </ModalWrapper>
        )}
        <LoadingChat />
      </>
    );
  }

  setEventDelegatorForCodeSnippets();
  return <ChatContainer workspace={workspace} knownHistory={history} showChat={showChat}/>;
}

// Enables us to safely markdown and sanitize all responses without risk of injection
// but still be able to attach a handler to copy code snippets on all elements
// that are code snippets.
function copyCodeSnippet(uuid) {
  const target = document.querySelector(`[data-code="${uuid}"]`);
  if (!target) return false;
  const markdown =
    target.parentElement?.parentElement?.querySelector(
      "pre:first-of-type"
    )?.innerText;
  if (!markdown) return false;

  window.navigator.clipboard.writeText(markdown);
  target.classList.add("text-green-500");
  const originalText = target.innerHTML;
  target.innerText = "Copied!";
  target.setAttribute("disabled", true);

  setTimeout(() => {
    target.classList.remove("text-green-500");
    target.innerHTML = originalText;
    target.removeAttribute("disabled");
  }, 2500);
}

// Listens and hunts for all data-code-snippet clicks.
function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}
