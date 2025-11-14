import { useContext, useState } from "react";
import type { Player } from "../../../shared/dist/types";
import Prompt from "./Prompt";
import Panel from "./Panel";
import useCountdown from "../hooks/useCountdown";
import AppContext from "../context/AppContext";

const PlayerCardArena = ({
  panelPlayer,
  color,
}: {
  panelPlayer: Player;
  color: string;
}) => {
  const [autoSubmit, setAutoSubmit] = useState(false);
  const { player } = useContext(AppContext);
  const timer = useCountdown(
    10,
    () => {
      setAutoSubmit(true);
    },
    [panelPlayer.state]
  );

  return (
    <div className="panel">
      {(player.state == "prompting" || player.state == "voting") && (
        <h2>Time Remaining:{timer}</h2>
      )}
      <Panel panelPlayer={panelPlayer} color={color} />
      <Prompt panelPlayer={panelPlayer} autoSubmit={autoSubmit} />
    </div>
  );
};

export default PlayerCardArena;
