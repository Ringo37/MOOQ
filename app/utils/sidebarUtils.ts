export function getSidebarInitialOpen(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/sidebar-open=(true|false)/);

  return match ? match[1] === "true" : true;
}
