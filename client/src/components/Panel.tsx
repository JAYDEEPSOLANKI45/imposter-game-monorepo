import { useContext } from "react";
import type { Player } from "../../../shared/dist/types";
import VotingPanel from "./VotingPanel";
import AppContext from "../context/AppContext";
import Votes from "./Votes";
const Panel = ({
  panelPlayer,
  color
}: {
  panelPlayer: Player;
  color:string
}) => {
  let { player } = useContext(AppContext);

  return (
    <div className="panel" style={{backgroundColor:color}}>
      <h3>
        Name:{panelPlayer.name}
        {panelPlayer.isOwner && <b>"Owner"</b>}
      </h3>
      {panelPlayer.currentPrompt && <p>Op:{panelPlayer.currentPrompt}</p>}
      {player.state == "voting" && (
        <VotingPanel currentPlayer={panelPlayer} name={panelPlayer.name}/>
      )}
      {player.state == "waiting" && player.voted &&(<Votes panelPlayer={panelPlayer} votes={panelPlayer.votedBy} key={panelPlayer.id}/>)}
    </div>
  );
};

export default Panel;
