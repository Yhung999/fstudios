export function synthetiqResolverPlugin(): {
  name: string;
  configureServer: (server: unknown) => void;
};
