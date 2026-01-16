import { createRoot, type Handle } from "@remix-run/component";
import "./app.css";
import { Router } from "./stores/Router";
import { TimerList } from "./TimerList";
import { TimerNew } from "./TimerNew";
import { Link, Outlet, RouterProvider } from "./RouterProvider";
import { NotFound } from "./NotFound";

function App(this: Handle) {
  const router = new Router({
    basename: import.meta.env.BASE_URL,
    routes: [
      {
        path: "/",
        render: () => <TimerList />,
      },
      { path: "/new", render: () => <TimerNew /> },
      { path: "*", render: () => <NotFound /> },
    ],
  });

  return () => (
    <RouterProvider router={router}>
      <div class="flex flex-col min-h-screen bg-base-300">
        <Header />
        <main class="flex flex-col grow">
          <Outlet />
        </main>
      </div>
    </RouterProvider>
  );
}

function Header(this: Handle) {
  return () => (
    <div class="navbar bg-base-300 shadow-sm">
      <Link href="/" class="btn btn-ghost text-xl">
        Remix Timer
      </Link>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
