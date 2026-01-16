import type { Handle, RemixNode } from "@remix-run/component";
import { Router } from "./stores/Router";

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

export function Navigate(
  this: Handle,
  { href, ...options }: { href: string } & NavigationNavigateOptions,
) {
  const { router } = this.context.get(RouterProvider);
  router.navigate(href, options);
  return null;
}

export function Link(this: Handle) {
  const { router } = this.context.get(RouterProvider);
  return ({ href, ...props }: JSX.IntrinsicHTMLElements["a"]) => {
    return (
      // @ts-ignore Weird type in Remix
      <a {...props} href={href ? router.createHref(href) : undefined} />
    );
  };
}
