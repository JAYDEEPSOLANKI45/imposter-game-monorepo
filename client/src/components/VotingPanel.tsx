import { useContext, useEffect } from "react";
import AppContext from "../context/AppContext";
import type { Player } from "../../../shared/dist/types";

const VotingPanel = ({
  currentPlayer,
  name,
}: {
  currentPlayer: Player;
  name: string;
}) => {
  let { player, setPlayer, socket } = useContext(AppContext);
  useEffect(() => {
    const sendVote = () => {
      player.state=="voting" ? socket.emit("vote-send", { vote: player.voted }) : console.log("Voted out");
    };
    if (player.id == currentPlayer.id) {
      socket.on("send-vote-to-server", sendVote);
    }
    return () => {
      socket.off("send-vote-to-server", sendVote);
    };
  }, [player.voted]);

  const handleVote = () => {
    let newVote = "";
    if (player.voted === currentPlayer.id) {
      newVote = "";
    } else {
      newVote = currentPlayer.id;
    }
    setPlayer((prevPlayer) => ({ ...prevPlayer, voted: newVote }));
  };

  const removeVote = () => {
    setPlayer((prevPlayer) => ({ ...prevPlayer, voted: "" }));
  };
  return (currentPlayer.state!="voted-out" &&
    <div className="votingPanel">
      <p>Vote {name}?</p>
      <button
        onClick={() => handleVote()}
        disabled={!(player.voted == "") || player.voted == currentPlayer.id}
      >
        ✓
      </button>
      {player.voted == currentPlayer.id && (
        <button onClick={() => removeVote()}>X</button>
      )}
    </div>
  );
};

export default VotingPanel;
