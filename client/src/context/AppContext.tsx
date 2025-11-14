import React, { createContext, useState } from "react";
import { type Player } from "../../../shared/dist/types.js";
import { type Socket } from "socket.io-client";
import { socket } from "../helper/socket";
type Flash = {
  message: string;
  type: string;
  duration: number;
  onClose: () => void;
};

type RoundResult = {
  result: {
    imposterId?: string;
    messagePlayer: string;
    messageImposter?: string;
  };
  votedOutId?: string;
  restart: boolean;
};

type AppContextType = {
  name: string;
  setName: (name: string) => void;
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  room: string;
  setRoom: (room: string) => void;
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  socket: Socket;
  word: string;
  setWord: React.Dispatch<React.SetStateAction<string>>;
  flash: Flash;
  setFlash: React.Dispatch<React.SetStateAction<Flash>>;
  result: RoundResult | null;
  setResult: React.Dispatch<React.SetStateAction<RoundResult | null>>;
};

const defaultFlash: Flash = {
  message: "",
  type: "info",
  duration: 3000,
  onClose: () => {},
};

const defaultResult: RoundResult | null = null;

const AppContext = createContext<AppContextType>({
  name: "",
  setName: () => {},
  player: {
    name: "",
    id: "",
    currentPrompt: "",
    prompts: [],
    roomId: "",
    state: "lobby",
    isOwner: false,
    voted: "",
    votedBy: [],
  },
  setPlayer: () => {},
  room: "",
  setRoom: () => {},
  players: [],
  setPlayers: () => {},
  socket,
  word: "",
  setWord: () => {},
  flash: defaultFlash,
  setFlash: () => {},
  result: defaultResult,
  setResult: () => {},
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [name, setName] = useState("");
  const [player, setPlayer] = useState<Player>({
    name: "",
    id: "",
    currentPrompt: "",
    prompts: [],
    roomId: "",
    state: "lobby",
    isOwner: false,
    voted: "",
    votedBy: [],
  });
  const [room, setRoom] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [word, setWord] = useState("");

  const [flash, setFlash] = useState<Flash>(defaultFlash);
  const [result, setResult] = useState<RoundResult | null>(null);

  return (
    <AppContext.Provider
      value={{
        name,
        setName,
        player,
        setPlayer,
        room,
        setRoom,
        players,
        setPlayers,
        socket,
        word,
        setWord,
        flash,
        setFlash,
        result,
        setResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
