import React, { useContext, useEffect } from "react";
import { type Player } from "../../../shared/dist/types.js";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import { showRoomJoinedFlash } from "../helper/flash.js";
const Homepage = () => {
  const {
    name,
    setName,
    player,
    setPlayer,
    players,
    setPlayers,
    socket,
    setWord,
    setFlash,
    setResult,
  } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("render");
    const handleRecvPlayer = (player: Player) => setPlayer(player);
    const handleRoomJoined = ({
      clients,
      roomId,
    }: {
      clients: Player[];
      roomId: string;
    }) => {
      console.log(clients);
      setPlayers(clients);
      showRoomJoinedFlash(setFlash, players, clients);
      setPlayer((prevPlayer: Player) => {
        return { ...prevPlayer!, roomId };
      });
      navigate("/room/" + roomId + "/lobby");
    };

    const handleUserDisconnected = ({
      id,
      name,
    }: {
      id: string;
      name: string;
    }) => {
      setPlayers((prevPlayers: Player[]) =>
        prevPlayers.filter((player) => player.id !== id)
      );
      setFlash({
        message: `${name} disconnected`,
        duration: 3000,
        onClose: () => {},
        type: "error",
      });
    };

    const handleBecomeOwner = () => {
      console.log("becoming owner");
      setPlayer((prevPlayer: Player) => ({ ...prevPlayer, isOwner: true }));
    };

    const handleGameStarted = ({ word }: { word: string }) => {
      setWord(word);
      // clear any previous result so UI (result modal / overlay) is removed on restart
      setResult(null);
      setPlayer((prevPlayer: Player) => {
        return { ...prevPlayer, state: "prompting" };
      });
      setFlash({
        message: `Game Started! "${word}" is your word.`,
        duration: 3000,
        onClose: () => {},
        type: "primary",
      });
      navigate(`../arena`, { relative: "path" });
    };

    const handleOwnerDisconnected = () => {
      console.log("owner disconnected");
      handleErrorOccur({ message: "Owner disconnected", status: 400 });
      navigate("/");

      // Delay to avoid "You are not allowed in this room" error
      // Cause: roomId set to "" -> Protected Route gives error
      setTimeout(() => {
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
      }, 500);
      setPlayers([]);
    };

    const handleErrorOccur = ({
      message,
      status,
    }: {
      message: string;
      status: number;
    }): void => {
      console.log(`Error occured with status: ${status}: ${message}`);
      setFlash({ message, duration: 3000, onClose: () => {}, type: "error" });
    };

    const handleDisconnect = () => {
      setFlash({
        message: "Connection from server ended",
        duration: 3000,
        onClose: () => {},
        type: "error",
      });
      navigate("/", { replace: true });
      setPlayer({
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
    };

    const handleWarning = ({ message }: { message: string }) => {
      console.log(message);
      warning = message;
    };

    // useful for state-management with server.
    const handleUpdatePlayers = (updatedPlayers: Player[]) => {
      console.log("updated players", updatedPlayers);
      setPlayers(updatedPlayers);

      setPlayer((prevPlayer) => {
        const updated = updatedPlayers.find(
          (player) => player.id == prevPlayer.id
        );
        return updated ? updated : prevPlayer;
      });
    };

    socket.on("recv-player", handleRecvPlayer);
    socket.on("room-joined", handleRoomJoined);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("become-owner", handleBecomeOwner);
    socket.on("game-started", handleGameStarted);
    socket.on("owner-disconnected", handleOwnerDisconnected);
    socket.on("error-occur", handleErrorOccur);
    socket.on("disconnect", handleDisconnect);
    socket.on("warning", handleWarning);
    socket.on("update-players", handleUpdatePlayers);
    //   return () => {
    //   console.log("cleaning up socket handlers");
    //   socket.off("recv-player", handleRecvPlayer);
    //   socket.off("room-joined", handleRoomJoined);
    //   socket.off("user-disconnected", handleUserDisconnected);
    //   socket.off("become-owner", handleBecomeOwner);
    //   socket.off("game-started", handleGameStarted);
    //   socket.off("owner-disconnected", handleOwnerDisconnected);
    //   socket.off("error-occur", handleErrorOccur);
    //   socket.off("disconnect", handleDisconnect);
    //   socket.off("warning", handleWarning);
    //   socket.off("update-players", handleUpdatePlayers);
    //   socket.off("updated-players", handleUpdatePlayers);
    //   socket.off("send-prompt-to-server", handleSendPromptToServer);
    // };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements[0] as HTMLInputElement;
    if (type === "name") {
      setName(input.value);
      socket.emit("create-player", { name: input.value, socketId: player.id });
    } else if (type === "room") {
      socket.emit("join-room", { roomId: input.value });
    }
  };

  return (
    <>
      <h1>Hello, {name}</h1>
      {!name && (
        <form onSubmit={(e) => handleSubmit(e, "name")}>
          <input
            type="text"
            name=""
            id=""
            placeholder="Enter your name"
            required
          />
          <button>Enter</button>
        </form>
      )}
      {name && player && !player.roomId && (
        <form
          onSubmit={(e) => {
            handleSubmit(e, "room");
          }}
        >
          <input placeholder="Enter room id to join" required />{" "}
          <button>Join</button>
        </form>
      )}
    </>
  );
};

export default Homepage;
