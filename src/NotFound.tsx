import { AlertIcon } from "./icons";
import { Link } from "./RouterProvider";

export function NotFound() {
  return () => (
    <div class="flex flex-col gap-6 items-center grow pb-6">
      <AlertIcon class="h-48 w-48 opacity-70" />
      <p class="text-xl grow">This page does not exist.</p>
      <Link class="btn btn-xl btn-primary btn-wide" to="/">
        Go to home page
      </Link>
    </div>
  );
}
