import { Server, Socket } from "socket.io";
import type { Player, Room } from "../../../shared/dist/types.d.ts";
import io from "../server.ts";

export const players: Map<string, Player> = new Map();
export const rooms: Map<string, Room> = new Map();

//timeout map
const timeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

const imposterWordPairs = [
  ["Onion", "Fish"],
  ["Soap", "Shampoo"],
  ["Ketchup", "Jam"],
  ["Toothpaste", "Glue"],
  ["Banana", "Cucumber"],
  ["Milk", "Coconut Water"],
  ["Pizza", "Sandwich"],
  ["Socks", "Gloves"],
  ["Pen", "Lipstick"],
  ["Rice", "Popcorn"],
  ["Bread", "Cake"],
  ["Salt", "Sugar"],
  ["Orange", "Mango"],
  ["Lemon", "Battery"],
  ["Chair", "Stool"],
  ["Jeans", "Trousers"],
  ["Sneakers", "Slippers"],
  ["Fan", "Blender"],
  ["TV Remote", "AC Remote"],
  ["Wallet", "Lunchbox"],
  ["Towel", "Blanket"],
  ["Mirror", "Window"],
  ["Bottle", "Thermos"],
  ["Knife", "Scissors"],
  ["Guitar", "Violin"],
  ["Table", "Desk"],
  ["Helmet", "Cap"],
  ["Bus", "Train"],
  ["Carrot", "Radish"],
  ["Potato", "Sweet Potato"],
  ["Chocolate", "Brownie"],
  ["Chips", "Nachos"],
  ["Coffee", "Hot Chocolate"],
  ["Curtain", "Bedsheet"],
  ["Spoon", "Fork"],
  ["Laptop", "Tablet"],
  ["Phone", "Calculator"],
  ["Drum", "Bucket"],
  ["Juice", "Smoothie"],
  ["Burger", "Taco"],
  ["Peanut", "Cashew"],
  ["Ice Cream", "Kulfi"],
  ["Pillow", "Cushion"],
  ["Bed", "Sofa"],
  ["Mask", "Sunglasses"],
  ["Rope", "Chain"],
  ["Watch", "Bracelet"],
  ["Notebook", "Diary"],
  ["Raincoat", "Jacket"],
  ["Ball", "Balloon"],
  ["Fridge", "Cupboard"],
  ["Soap", "Detergent"],
  ["Earphones", "Hearing Aid"],
  ["Ring", "Keychain"],
  ["Pencil", "Straw"],
  ["Microwave", "Oven"],
  ["Plate", "Tray"],
  ["Camera", "Binoculars"],
  ["Comb", "Brush"],
  ["Plant", "Flower"],
  ["Parrot", "Duck"],
  ["Shirt", "Sweater"],
  ["Pasta", "Noodles"],
  ["Soup", "Gravy"],
  ["Umbrella", "Walking Stick"],
  ["Football", "Rugby Ball"],
  ["Cricket Bat", "Baseball Bat"],
  ["Toothbrush", "Paintbrush"],
  ["Candle", "Torch"],
  ["Chalk", "Marker"],
  ["Keyboard", "Piano"],
  ["Egg", "Potato"],
  ["Honey", "Syrup"],
  ["Map", "Calendar"],
  ["Sand", "Sugar"],
  ["Clock", "Compass"],
  ["Rocket", "Missile"],
  ["Doll", "Action Figure"],
  ["Soap", "Chocolate Bar"],
  ["Milkshake", "Lassi"],
  ["Radio", "Walkie-Talkie"],
  ["Key", "USB Drive"],
  ["Screwdriver", "Pen"],
  ["Drumstick", "Bone"],
  ["Bottle Cap", "Coin"],
  ["Matchbox", "Lighter"],
  ["Charger", "Power Bank"],
  ["Ruler", "Knife"],
  ["Shoelace", "Ribbon"],
  ["Donut", "Bagel"],
  ["Broom", "Mop"],
  ["Paint", "Nail Polish"],
  ["Tomato", "Apple"],
  ["Pear", "Guava"],
  ["Ladder", "Stairs"],
  ["Bus Ticket", "Movie Ticket"],
  ["Sandwich", "Burger"],
  ["Suitcase", "Backpack"],
  ["Pencil Box", "Lunchbox"],
  ["Magazine", "Newspaper"],
];
export const getWords = (): string[] => {
  let index = Math.floor(Math.random() * 100);
  return imposterWordPairs[index];
};

export const selectImposter = (size: number) => {
  return Math.floor(Math.random() * size);
};

const checkJoinRoom = (socket: Socket, roomId: string): boolean => {
  // check if the user is already joined somewhere
  const room = rooms.get(roomId)!;
  if (socket.rooms.size > 1) {
    socket.emit("error-occur", {
      message: "Can not join multiple rooms",
      status: 400,
    });
    return false;
  }
  if (room && room.count! > 4) {
    //TODO: let user decide the maxSize and here >room.maxSize
    socket.emit("error-occur", {
      message: "Maximum size reached",
      status: 400,
    });
    return false;
  }
  if (room && room.state != "lobby") {
    socket.emit("error-occur", {
      message: "The game has already started, Can not join in between!..",
      status: 400,
    });
    return false;
  }
  return true;
};

const checkResponse = (
  roomId: string,
  type: "prompt" | "vote",
  socket: Socket
): void => {
  //TODO: remove below line
  const room = rooms.get(roomId);
  const lackingPlayers: string[] = [];
  if (room) {
    switch (type) {
      case "prompt":
        room.players.forEach((player) => {
          if (player.currentPrompt === "") lackingPlayers.push(player.id);
        });
        break;
      case "vote":
        room.players.forEach((player) => {
          if (!player.voted) lackingPlayers.push(player.id);
        });
        break;
      default:
        return;
    }
  }
  console.log(lackingPlayers);

  lackingPlayers.forEach((player) => {
    const socket = io.sockets.sockets.get(player);
    if (socket) disconnectUser(socket);
  });
};

export const joinRoom = (socket: Socket, roomId: string): void => {
  try {
    if (!checkJoinRoom(socket, roomId)) return;
    socket.join(roomId);
    //get the player object
    let player: Player = players.get(socket.id)!;
    //gather all clients from current room
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    if (clients.length == 1) {
      player = { ...player, roomId, isOwner: true };
      players.set(socket.id, player);
      rooms.set(roomId, {
        id: roomId,
        state: "lobby",
        count: 1,
        imposter: null,
        round: 0,
        players: [player],
        AiCount: 0,
        owner: socket.id,
        maxSize: 5,
        words: [],
        votes: [],
        responseCount: 0,
      });
      io.to(socket.id).emit("become-owner");
    } else {
      const roomInfo = rooms.get(roomId);
      if (roomInfo) {
        player = { ...player, roomId };
        players.set(socket.id, player);
        roomInfo.players.push(player);
        roomInfo.count += 1;
        // rooms.set(roomId, roomInfo); // Update the map with the mutated object
      }
    }
    io.to(roomId).emit("room-joined", {
      clients: rooms.get(roomId)?.players,
      roomId: roomId,
    });
  } catch (e) {
    console.log(e);
    socket.emit("error-occur", {
      message: "Error joining the room. Your connection is not established",
      status: 500,
    });
  }
};

export const createPlayer = (
  socket: Socket,
  name: string,
  socketId: string
): void => {
  if (!players.get(socketId)) {
    let player: Player = {
      name,
      id: socket.id,
      roomId: "",
      currentPrompt: "",
      prompts: [],
      state: "lobby",
      isOwner: false,
      voted: "",
      votedBy: [],
    };

    players.set(socket.id, player);
    socket.emit("recv-player", player);
  } else {
    socket.emit("error-occur", {
      message: "The user already exists",
      status: 400,
    });
  }
};

export const disconnectUser = (socket: Socket) => {
  const player = players.get(socket.id);
  if (player) {
    const room = rooms.get(player.roomId);
    if (room) leaveRoom(socket, room.id);
    players.delete(socket.id);
    socket.disconnect(true);
  }
};

export const leaveRoom = (socket: Socket, roomId: string) => {
  let player = players.get(socket.id);
  if (player) {
    let room = rooms.get(player.roomId);
    if (room) {
      if (player.roomId != room.id) return;
      if (player.isOwner) {
        handleOwnerDisconnect(player, room);
      } else {
        handleUserDisconnect(player, room);
      }
      socket.leave(player.roomId);
    }
    resetPlayer(player);
  }
};

const handleOwnerDisconnect = (player: Player, room: Room) => {
  io.to(room.id).emit("owner-disconnected", player.id);
  let timeout = timeouts.get(room.id);
  if (timeout) clearTimeout(timeout);
  room.players.forEach((currPlayer) => {
    let socket = io.sockets.sockets.get(currPlayer.id);
    if (socket) socket.leave(room.id);
    resetPlayer(currPlayer);
  });
  rooms.delete(room.id);
};

const handleUserDisconnect = (player: Player, room: Room) => {
  //if the player alrady had voted or prompted, remove their responseCount from room
  //TODO: test
  // if ((player.currentPrompt || player.voted) && player.state != "voted-out")
  //   room.responseCount -= 1;
  room.count -= 1;
  io.to(room.id).emit("user-disconnected", {id:player.id,name:player.name});
  // if the disconnected user was an imposter
  if(room.state!="lobby") {
    inGameUserDisconnect(room,player)
  }
  room.players.forEach((currPlayer) => {
    currPlayer.votedBy.filter((vote) => vote != player.id);
  });
  room.players = room.players.filter((p) => p.id !== player.id);
};

export const startFirstRoundGame = (socket: Socket, roomId: string) => {
  const room = rooms.get(roomId);
  if (room) {
    if (room.owner == socket.id && room.state == "lobby") {
      initializeRoom(roomId);
      promptRoundInit(room);
    } else {
      socket.emit("error-occur", {
        message: "Not an owner",
        status: "403",
      });
    }
  }
};

const initializeRoom = (roomId: string) => {
  const room: Room = rooms.get(roomId)!;
  const playersList: Player[] = room.players;
  const indexImposter = selectImposter(playersList.length);
  room.imposter = playersList[indexImposter];
  const words: string[] = getWords();
  const imposterId = playersList[indexImposter]?.id!;
  room.players.forEach((player: Player) => {
    //TODO: initialization
    player.prompts = [];
    if (player.id != imposterId) {
      io.to(player.id).emit("game-started", { word: words[0] });
    }
  });
  io.to(imposterId).emit("game-started", { word: words[1] });
  room.words = words;
};

const promptRoundInit = (room: Room) => {
  const currentPlayers = rooms.get(room.id)?.players;
  if (currentPlayers) {
    currentPlayers.forEach((player: Player) => {
      if (player.state != "voted-out") {
        player.state = "prompting";
        player.currentPrompt = "";
      }
    });
    room.state = "prompting";
    room.responseCount = 0;
    room.round += 1;
    io.to(room.id).emit("update-players", currentPlayers);
    // tell players to send their prompt (auto submit by server)
    timeouts.set(
      room.id,
      setTimeout(() => {
        console.log("Initializing prompt round");
        io.to(room.id).emit("send-prompt-to-server");
        clearTimeout(timeouts.get(room.id));
      }, 10000)
    );
  }
};

const count = 0;
export const promptSend = ({
  socket,
  prompt,
}: {
  socket: Socket;
  prompt: string;
}) => {
  const player = players.get(socket.id);
  const room = player ? rooms.get(player.roomId) : undefined;
  if (player && player.currentPrompt) {
    socket.emit("error-occur", {
      message: `You can only give prompt once per round`,
      status: 400,
    });
    return;
  }
  if (player?.currentPrompt && player?.currentPrompt != "xxx") return;
  if (
    player &&
    room &&
    (player.currentPrompt == "xxx" || player.state == "prompting") &&
    room.state == "prompting"
  ) {
    room.responseCount += 1;
    player.currentPrompt = prompt;
    player.prompts.push(prompt);
    player.state = "voting";
    io.to(player.roomId).emit("update-players", room.players);
    // if all the responses are gathered start next phase(voting)
    if (room.responseCount >= countNonVotedOutPlayers(room)) {
      voteRoundInit(room);
    }
  } else {
    socket.emit("error-occur", {
      message: `Error sending prompt to server. state-mismatch or player/room not found`,
      status: 400,
    });
  }
};

const voteRoundInit = (room: Room) => {
  room.state = "voting";
  room.responseCount = 0;

  room.players.forEach((player) => {
    player.voted = "";
    if (player.state != "voted-out") {
      player.state = "voting";
      player.votedBy = [];
    }
  });
  io.to(room.id).emit("update-players", room.players);
  // after duration tell users to send their votes (auto vote done by server)
  timeouts.set(
    room.id,
    setTimeout(() => {
      console.log("Send vote to server");
      io.to(room.id).emit("send-vote-to-server");
      clearTimeout(timeouts.get(room.id));
    }, 10000)
  );
};

export const voteSend = ({
  socket,
  vote,
}: {
  socket: Socket;
  vote: string;
}): void => {
  const player = players.get(socket.id);
  if (player && !player.voted) {
    if (player.state == "voting") {
      const room = rooms.get(player.roomId);
      if (room) {
        player.voted = vote ? vote : socket.id;
        room.responseCount += 1;
        player.state = "waiting";
        io.to(player.roomId).emit("update-players", room?.players);
        if (room.responseCount >= countNonVotedOutPlayers(room)) {
          // start next phase (checking the result)
          countVotes(room);
        }
      }
    }
  } else {
    socket.emit("error-occur", {
      message: `Error Occured. Either Player state mismatch or an attempt to vote multiple times per round`,
      status: 400,
    });
  }
};

const countVotes = (room: Room): void => {
  const maxVotes: { voteCount: number; player: Player | null } = {
    voteCount: 0,
    player: null,
  };
  const currentPlayers = room.players;
  currentPlayers.forEach((player) => {
    if (player.state != "voted-out") {
      let playerVotedBy = players.get(player.voted)?.votedBy;
      if (playerVotedBy) {
        playerVotedBy.push(player.id);
        if (maxVotes.voteCount < playerVotedBy.length) {
          maxVotes.voteCount = playerVotedBy.length;
          maxVotes.player = players.get(player.voted) ?? null;
        }
      }
    }
  });
  // if maxVotes.player is null continue
  console.log(maxVotes);
  // update players and result
  io.to(room.id).emit("update-players", room.players);
  calculateResult(room, maxVotes);
};

const calculateResult = (
  room: Room,
  maxVotesPlayer: { voteCount: number; player: Player | null }
) => {
  if (!maxVotesPlayer.player) {
    //TODO: throw error
    console.log("maxVotesPlayer.player is null");
    return;
  }
  let result = { result: {}, votedOutId: "", restart: true };

  if (maxVotesPlayer.voteCount >= countNonVotedOutPlayers(room) - 1) {
    result.votedOutId = maxVotesPlayer.player.id;
    players.get(maxVotesPlayer.player.id)!.state = "voted-out";
    if (maxVotesPlayer.player.id == room.imposter?.id) {
      // imposter out, players win
      result.result = {
        imposterId: room.imposter.id,
        messagePlayer: `The imposter "${maxVotesPlayer.player.name}" was voted out. Players win!!!`,
        messageImposter: `You were the imposter and you were voted out by ${maxVotesPlayer.voteCount} votes. Players Win!!`,
      };
      resetRoom(room);
    }
    // player out, check for the round and capacity for players
    else {
      if (room.round == 5 || countNonVotedOutPlayers(room) < 3) {
        // imposter win reset everything
        result.result = {
          imposterId: room.imposter ? room.imposter.id : "",
          messagePlayer: `The villager "${maxVotesPlayer.player.name}" was voted out. Imposter "${room.imposter?.name}" wins!!!`,
          messageImposter: `You were the imposter and you win!! Great work!.`,
        };
        resetRoom(room);
      } else {
        //game continues, state of players, room and init the prompt step
        result.result = {
          messagePlayer: `The villager "${maxVotesPlayer.player.name}" was voted out. The game continues`,
        };
        result.restart = false;
        timeouts.set(
          room.id,
          setTimeout(() => {
            console.log(
              "Init prompt round after calculating result/villager was voted out"
            );
            promptRoundInit(room);
            // clearTimeout(timeouts.get(room.id));
          }, 10000)
        );
      }
    }
  }
  // nobody got voted out check for the next round availability
  else {
    if (room.round == 5) {
      // imposter win reset everything
      result.result = {
        imposterId: room.imposter ? room.imposter.id : "",
        messagePlayer: `The Imposter "${room.imposter?.name}" survived till the end, Imposter wins!!!`,
        messageImposter: `You were the imposter and you win!! Great work!.`,
      };
      resetRoom(room);
    } else {
      //game continues, state of players, room and init the prompt step
      result.result = {
        messagePlayer: "No one was voted out, The game will continue!!!",
      };
      result.restart = false;
      timeouts.set(
        room.id,
        setTimeout(() => {
          console.log(
            "Init prompt round after calculating result/ nobody got voted out"
          );
          promptRoundInit(room);
          // clearTimeout(timeouts.get(room.id));
        }, 10000)
      );
    }
  }
  console.log(result);
  io.to(room.id).emit("game-result", { result });
};

const countNonVotedOutPlayers = (room: Room) => {
  return room.players.filter((player) => player.state != "voted-out").length;
};

const resetRoom = (room: Room) => {
  room.state = "lobby";
  room.players.forEach((player) => (player.state = "lobby"));
  //TODO: selectImposter(room) function, can only run only if the owner restarts
  room.imposter = null;
  room.responseCount = 0;
  room.round = 0;
  room.votes = [];
  room.words = [];
};

const resetPlayer = (player: Player) => {
  player.roomId = "";
  player.currentPrompt = "";
  player.isOwner = false;
  player.state = "waiting";
  player.voted = "";
  player.votedBy = [];
  player.prompts = [];
};

const inGameUserDisconnect = (room:Room,player:Player)=>{
  if (room.imposter && player.id == room.imposter.id) {
    //room and player state to lobby and update players to client and send result also
    room.state = "lobby";
    room.players.forEach((player) => {
      player.state = "lobby";
    });
    let timeout = timeouts.get(room.id);
    if (timeout) clearTimeout(timeout);
    io.to(room.id).emit("game-result", {
      result: {
        result: {
          imposterId: room.imposter ? room.imposter.id : "",
          messagePlayer: `The Imposter "${room.imposter?.name}" left the game, villagers win...`,
        },
        votedOutId: player.id,
        restart: true,
      },
    });
  } else if (room.players.length <= 3) {
    let timeout = timeouts.get(room.id);
    if (timeout) clearTimeout(timeout);
    room.state = "lobby";
    room.players.forEach((player) => {
      player.state = "lobby";
    });
    io.to(room.id).emit("game-result", {
      result: {
        result: {
          imposterId: room.imposter ? room.imposter.id : "",
          messagePlayer: `The Imposter wins by surviving till the end.`,
          messageImposter: `Great Job, surviving till the end.`,
        },
        votedOutId: player.id,
        restart: true,
      },
    });
  }
}