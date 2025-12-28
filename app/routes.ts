import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.ts"),
  route("login", "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.ts"),
  layout("routes/layout.tsx", [
    ...prefix("courses", [
      index("routes/courses/index.tsx"),
      route(":courseSlug", "routes/courses/detail.tsx"),
      route(":courseSlug/:sectionSlug", "routes/courses/section/index.ts"),
      route(
        ":courseSlug/:sectionSlug/:lectureSlug",
        "routes/courses/section/lecture/index.ts",
      ),
      route(
        ":courseSlug/:sectionSlug/:lectureSlug/:pageSlug",
        "routes/courses/section/lecture/page/index.tsx",
      ),
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
        layout("routes/coursesAdmin/edit/layout.tsx", [
          route(":slug", "routes/coursesAdmin/edit/info.tsx"),
          route(":slug/curriculum", "routes/coursesAdmin/edit/curriculum.tsx"),
          route(":slug/permission", "routes/coursesAdmin/edit/permission.tsx"),
        ]),
        route(
          ":courseSlug/:sectionSlug/:lectureSlug/:pageSlug",
          "routes/coursesAdmin/page/index.tsx",
        ),
        route(
          ":courseSlug/:sectionSlug/:lectureSlug/:pageSlug/:blockId",
          "routes/coursesAdmin/page/block/index.tsx",
        ),
      ]),
    ]),
  ]),
  ...prefix("api", [
    route("check-course-slug", "routes/api/checkCourseSlug.ts"),
    route("file/:bucket/:key", "routes/api/file.ts"),
    route("file-upload", "routes/api/fileUpload.ts"),
  ]),
] satisfies RouteConfig;
