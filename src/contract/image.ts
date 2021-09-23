export type ImageDto = {
  name: string;
  uploadDateTime: string;
  extension: string;
};

export type AddImageDto = {
  name: string;
  x: string;
  y: string;
  width: string;
  height: string;
  link?: string;
};
