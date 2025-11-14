import { useContext } from "react";
import AppContext from "../context/AppContext";
import type { Player } from "../../../shared/dist/types";
import PlayerCardArena from "./PlayerCardArena";
import Panel from "./Panel";

const Arena = () => {
  const { player, players, word } = useContext(AppContext);
  const colors = ["red", "blue", "green", "purple", "orange"];
  return (
    <div>
      <h2>Your word is {word}</h2>
      {players.map((currPlayer: Player, i:number) => (
        <>
          {currPlayer.id === player.id ? 
            <PlayerCardArena panelPlayer={currPlayer} key={currPlayer.id} color={currPlayer.state=="voted-out" ? "grey" : colors[i]}/> :
            <Panel panelPlayer={currPlayer} key={currPlayer.id} color={currPlayer.state=="voted-out" ? "grey" : colors[i]}/>
          }
        </>
      ))}
    </div>
  );
};

export default Arena;
