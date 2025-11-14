import type { Player } from "../../../shared/dist/types";

export const showRoomJoinedFlash = (
  setFlash: React.Dispatch<
    React.SetStateAction<{
      message: string;
      type: string;
      duration: number;
      onClose: () => void;
    }>
  >,
  players: Player[],
  clients: Player[]
) => {
  const newUsername = clients[clients.length - 1].name;
  setFlash({
    message: `${newUsername} Joined the room`,
    duration: 3000,
    onClose: () => {},
    type: "primary",
  });
};
