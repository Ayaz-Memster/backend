export type ImageDto = {
  name: string;
  uploadDateTime: string;
};

export type AddImageDto = {
  name: string;
  x: string;
  y: string;
  width: string;
  height: string;
  link?: string;
};
