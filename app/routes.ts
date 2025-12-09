import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.ts"),
  layout("routes/layout.tsx", [
    ...prefix("courses", [
      index("routes/course/index.tsx"),
      route(":year", "routes/course/year.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
