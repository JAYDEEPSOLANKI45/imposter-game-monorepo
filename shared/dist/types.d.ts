export type Player = {
  name: string;
  id: string;
  roomId: string;
  state:
    | "lobby"
    | "prompting"
    | "voting"
    | "waiting"
    | "voted-out"
    | "disconnected";
  currentPrompt: string;
  prompts: string[];
  isOwner: boolean;
  voted: string;
  votedBy: string[]
};
export type Prompt = {
  [key: `round${number}`]: string;
};
export type Room = {
  id: string;
  players: Player[];
  imposter: Player | null;
  round: number;
  state: "lobby" | "voting" | "prompting" | "assigning";
  count: number;
  AiCount: number;
  owner: string;
  maxSize: 5 | number;
  words: string[];
  votes: string[];
  responseCount: number;
};
//# sourceMappingURL=types.d.ts.map
