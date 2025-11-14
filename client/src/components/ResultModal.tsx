import { useContext, useEffect, useState } from "react";
import useCountdown from "../hooks/useCountdown";
import AppContext from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ResultModal = () => {
  const [visible, setVisible] = useState(false);
  const { socket, player, setPlayer, setPlayers, result, setResult } =
    useContext(AppContext);

  // call hook at top-level; provide duration when visible
  const isPersistent = !!result?.restart;
  // when persistent (restart:true) we don't want auto-hide -> pass duration 0 so hook doesn't trigger
  const duration = visible && !isPersistent ? 7 : 0;
  const timeLeft = useCountdown(duration, () => setVisible(false), [
    visible,
    isPersistent,
  ]);

  const navigate = useNavigate();
  useEffect(() => {
    const handleGameResult = ({ result }: any) => {
      setResult(result);
      setVisible(true);
    };

    socket.on("game-result", handleGameResult);
    return () => {
      socket.off("game-result", handleGameResult);
    };
  }, [socket]);

  const restartGame = () => {
    socket.emit("start-game", player.roomId);
  };

  const leaveRoom = () => {
    socket.emit("leave-room", { roomId: player.roomId });
    //TODO
    setPlayer((prevPlayer) => {
      return {
        ...prevPlayer,
        roomId: "",
        currentPrompt: "",
        isOwner: false,
        prompts: [],
        state: "waiting",
        voted: "",
        votedBy: [],
      };
    });
    setPlayers([]);
    setResult(null);
    setVisible(false);
    navigate("/");
  };
  if(!result) return null
  return (
    // overlay covers entire viewport when visible, preventing clicks and applying blur
    <div
      className={`result-modal-overlay ${visible ? "visible" : "hidden"}`}
      aria-hidden={!visible}
    >
      <div
        className="result-modal"
        role="dialog"
        aria-modal={true}
        hidden={!visible}
      >
        <button
          onClick={() => {
            setVisible(false);
          }}
          className="close-modal-btn"
          // aria-disabled={isPersistent}
          // disabled={isPersistent}
          title={isPersistent ? "Waiting for restart - cannot close" : "Close"}
        >
          X
        </button>
        {(() => {
          const displayResult: any = result?.result ?? result;
          if (!displayResult) return null;
          if (displayResult.imposterId) {
            const isImposter =
              displayResult.imposterId &&
              displayResult.imposterId === player?.id;
            return isImposter ? (
              <p>{displayResult.messageImposter}</p>
            ) : (
              <p>{displayResult.messagePlayer}</p>
            );
          }
          return <p>{displayResult.messagePlayer}</p>;
        })()}
        <div className="action-btn-result-modal">
          {isPersistent &&
            (player.isOwner ? (
              <button onClick={restartGame}>Restart Game</button>
            ) : (
              <p>Waiting for the owner to restart the game</p>
            ))}
          <button onClick={leaveRoom}>Leave Room</button>
        </div>
        {!isPersistent && (
          <div className="result-modal-timer">Closing in: {timeLeft}s</div>
        )}
      </div>
    </div>
  );
};

export default ResultModal;
