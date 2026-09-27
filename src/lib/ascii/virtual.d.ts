declare module "virtual:ascii-manifest" {
  export const manifest: Record<
    string,
    { cols: number; rows: number; ink: number }
  >
}
