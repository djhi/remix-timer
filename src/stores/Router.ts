import type { RemixNode } from "@remix-run/component/jsx-runtime";
import { RoutePattern } from "@remix-run/route-pattern";

export type Route = {
  path: string;
  render: () => RemixNode;
  match: (url: string) => boolean;
};

export class Router extends EventTarget {
  private basename: string;
  private routes: Array<Route> = [];
  private _currentRoute: Route | undefined = undefined;

  constructor({
    basename = "",
    routes,
  }: {
    basename?: string;
    routes: Array<Omit<Route, "match">>;
  }) {
    super();
    this.basename = basename;

    this.routes = routes.map((route) => ({
      ...route,
      match: (url) => {
        const pattern = new RoutePattern(route.path);
        return pattern.match(url) != null;
      },
    }));

    window.navigation.addEventListener("navigate", (event) => {
      if (shouldNotIntercept(event)) return;
      event.intercept({
        handler: async () => {
          this.matchCurrentLocation(event.destination.url);
        },
      });
    });

    this.matchCurrentLocation(location.href);
  }

  matchCurrentLocation(url: string) {
    const baseUrl = new URL(url);
    const sanitizedUrl = new URL(
      stripBasename({ basename: this.basename, pathname: baseUrl.pathname }),
      baseUrl,
    );
    const matchedRoute = this.routes.find((route) => route.match(sanitizedUrl.href));
    this._currentRoute = matchedRoute;
    this.dispatchEvent(new Event("change"));
  }

  get currentRoute() {
    if (this._currentRoute == null) {
      throw new Error(
        'No matched route. Add a wildcard route (`{ path: "*", render: () => <NotFound /> }`) to handle this case',
      );
    }
    return this._currentRoute;
  }

  createHref(to: string) {
    return prependBasename({ basename: this.basename, pathname: to });
  }

  navigate(url: string, options?: NavigationNavigateOptions) {
    window.navigation.navigate(this.createHref(url), options);
  }
}

const joinPaths = (paths: string[]): string => paths.join("/").replace(/\/\/+/g, "/");

function prependBasename({ basename, pathname }: { basename: string; pathname: string }): string {
  if (pathname.startsWith(basename)) return pathname;
  // If this is a root navigation, then just use the raw basename which allows
  // the basename to have full control over the presence of a trailing slash on
  // root actions
  return pathname === "/" ? basename : joinPaths([basename, pathname]);
}

function stripBasename({ basename, pathname }: { pathname: string; basename: string }): string {
  if (basename === "/") return pathname;

  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return "/";
  }

  // We want to leave trailing slash behavior in the user's control, so if they
  // specify a basename with a trailing slash, we should support it
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    // pathname does not start with basename/
    return pathname;
  }

  return pathname.slice(startIndex) || "/";
}

// Code from
// https://developer.chrome.com/docs/web-platform/navigation-api/#deciding-how-to-handle-a-navigation
function shouldNotIntercept(navigationEvent: NavigateEvent) {
  return (
    !navigationEvent.canIntercept ||
    // If this is just a hashChange,
    // just let the browser handle scrolling to the content.
    navigationEvent.hashChange ||
    // If this is a download,
    // let the browser perform the download.
    navigationEvent.downloadRequest ||
    // If this is a form submission,
    // let that go to the server.
    navigationEvent.formData
  );
}
