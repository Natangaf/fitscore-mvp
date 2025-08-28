export const routes = {
  home: "/",
  forms: "/forms",
  dashboard: "/dashboard",
} as const;

export type AppRoute = typeof routes[keyof typeof routes];