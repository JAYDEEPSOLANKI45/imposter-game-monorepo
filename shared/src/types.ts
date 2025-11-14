export type Player = {
  name: string;
  id: string;
  roomId: string;
  state: "lobby" | "playing" | "disconnected";
  currentPrompt: string;
  prompts: Prompt[];
  isOwner: boolean;
};

export type Prompt = {
  [key: `round${number}`]: string;
};

export type Room = {
  id: string;
  players: Player[];
  imposter: Player | null;
  // customWords: string[];
  round: number;
  state: "lobby" | "voting" | "prompting" | "assigning";
  count: number;
  AiCount: number;
  owner: string;
};
