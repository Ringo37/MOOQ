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
      index("routes/courses/index.tsx"),
      route(":slug", "routes/courses/detail.tsx"),
    ]),
    ...prefix("admin", [
      layout("routes/admin/layout.tsx", [
        index("routes/admin/index.tsx"),
        route("user", "routes/admin/user.tsx"),
      ]),
    ]),
    ...prefix("courses-admin", [
      layout("routes/coursesAdmin/layout.tsx", [
        index("routes/coursesAdmin/index.tsx"),
        route("course", "routes/coursesAdmin/course.tsx"),
        route("create", "routes/coursesAdmin/create.tsx"),
      ]),
    ]),
  ]),
  ...prefix("api", [
    route("check-course-slug", "routes/api/checkCourseSlug.ts"),
    route("file/:bucket/:key", "routes/api/file.ts"),
  ]),
] satisfies RouteConfig;
