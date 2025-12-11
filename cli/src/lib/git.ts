import { simpleGit, SimpleGit } from "simple-git";

export const getGit = (): SimpleGit => {
  return simpleGit();
};
