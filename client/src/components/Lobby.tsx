import { useContext } from "react";
import AppContext from "../context/AppContext";
import Panel from "./Panel";
import type { Player } from "../../../shared/dist/types";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const { players, socket, player, setPlayer, setPlayers } =
    useContext(AppContext);
  const startGame = () => {
    socket.emit("start-game", player.roomId);
  };
  const navigate = useNavigate();
  const handleGoHome = () => {
    //let server know that user disconnected
    socket.emit("leave-room", { roomId: player.roomId });
    //reseting the player and room members
    setPlayer((prevPlayer) => {
      return {
        ...prevPlayer,
        roomId: "",
        currentPrompt: "",
        prompts: [],
        voted: "",
        votedBy: [],
        state: "waiting",
        isOwner: false,
      };
    });
    setPlayers([]);
    navigate("/");
  };
  const colors = ["red", "blue", "green", "purple", "orange"];
  return (
    <>
      {players.map((player: Player, i: number) => {
        return <Panel panelPlayer={player} key={player.id} color={colors[i]} />;
      })}
      {player.roomId && (
        <button onClick={startGame} disabled={!player.isOwner}>
          {player.isOwner ? "Start Game" : "Waiting For the Owner to start"}
        </button>
      )}
      <button onClick={handleGoHome}>Go Home</button>
    </>
  );
};

export default Lobby;
