import { useContext } from "react";
import AppContext from "../context/AppContext";
import type { Player } from "../../../shared/dist/types";

const Votes = ({ votes, panelPlayer }: { votes?: string[], panelPlayer:Player }) => {
  const colors = ["red", "blue", "green", "purple", "orange"];
  const { players = [] } =
    useContext(AppContext) || ({} as { players: Player[] });
  const voteList = Array.isArray(votes) ? votes : [];

  // nothing to show
  if (!voteList.length) return <div className="votes-display-box">Voted by:</div>;

  return (
    <div className="votes-display-box">
      {panelPlayer.state=="voted-out" ? <p>Was voted out by: </p> : <p>Voted by: </p>}
      {players.map((player: Player, i) => {
        if (voteList.includes(player.id)) {
          return (
            <div
              key={player.id}
              className="vote-dot"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default Votes;
