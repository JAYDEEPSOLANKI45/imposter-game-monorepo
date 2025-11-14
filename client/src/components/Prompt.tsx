import { useContext, useEffect, useState } from "react";
import type { Player } from "../../../shared/dist/types";
import AppContext from "../context/AppContext";

const Prompt = ({
  panelPlayer,
}: {
  panelPlayer: Player;
  autoSubmit: boolean;
}) => {
  const { player, setPlayer, socket } = useContext(AppContext);

  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const handleSendPromptToServer = () => {
      if (player.state != "voted-out") {
        console.log("sending prompt to server", prompt);
        socket.emit("prompt-send", {
          prompt: prompt == "" ? "xxx" : prompt,
        });
        setPrompt("")
      }
    };
    socket.on("send-prompt-to-server", handleSendPromptToServer);
    return () => {
      socket.off("send-prompt-to-server", handleSendPromptToServer);
    };
  }, [player.state,prompt]);

  const handlePromptSubmit = () => {
    setPrompt(prompt);
    setPlayer((prev) => {
      return {
        ...prev,
        currentPrompt: prompt,
        prompts: [prompt],
      };
    });
    console.log(prompt);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="prompt-box">
      {!player.currentPrompt && player.id == panelPlayer.id && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePromptSubmit();
          }}
        >
          <input
            type="text"
            name=""
            id=""
            placeholder="Enter a vague description of word"
            value={prompt}
            onChange={(e) => handlePromptChange(e)}
          />
          <button>Send</button>
        </form>
      )}
    </div>
  );
};

export default Prompt;
