export type CatApiBreed = {
  id: string;
  name: string;
};

export type CatApiImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds: CatApiBreed[];
};
