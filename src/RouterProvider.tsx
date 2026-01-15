import type { Handle, RemixNode } from "@remix-run/component";
import type { To } from "history";
import { parseToInfo, Router } from "./stores/Router";

export function RouterProvider(this: Handle<{ router: Router }>, { router }: { router: Router }) {
  this.context.set({ router });
  return ({ children }: { children: RemixNode }) => children;
}

export function Outlet(this: Handle) {
  const { router } = this.context.get(RouterProvider);
  this.on(router, { change: () => this.update() });
  return () => {
    return router.currentRoute.render();
  };
}

export function Navigate(this: Handle, { to }: { to: To }) {
  const { router } = this.context.get(RouterProvider);
  router.navigate(to);
  return null;
}

export function Link(this: Handle) {
  const { router } = this.context.get(RouterProvider);
  return ({ to, ...props }: Omit<JSX.IntrinsicHTMLElements["a"], "href"> & { to: To }) => {
    const parsed = parseToInfo(to);
    return (
      // @ts-ignore Weird type in Remix
      <a
        {...props}
        href={router.createHref(to)}
        on={{
          click: (event) => {
            if (parsed.isExternal) return;
            event.preventDefault();
            router.navigate(to);
          },
        }}
      />
    );
  };
}
