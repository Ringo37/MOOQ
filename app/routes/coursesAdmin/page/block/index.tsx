import type { Route } from "./+types";

export async function loader({ request, params }: Route.LoaderArgs) {
  return {};
}

export default function CorsesAdminBlockIndex() {
  return;
}
