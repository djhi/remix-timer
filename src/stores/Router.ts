import type { RemixNode } from "@remix-run/component/jsx-runtime";
import { RoutePattern } from "@remix-run/route-pattern";
import { createBrowserHistory, type History, type Location, type To } from "history";

export type Route = {
  path: string;
  render: () => RemixNode;
  match: (url: string) => boolean;
};

export class Router extends EventTarget {
  private history: History;
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
    this.history = createBrowserHistory();

    this.routes = routes.map((route) => ({
      ...route,
      match: (url) => {
        const pattern = new RoutePattern(route.path);
        return pattern.match(url) != null;
      },
    }));

    this.history.listen(({ location }) => {
      this.matchCurrentLocation(location);
    });

    this.matchCurrentLocation(this.history.location);
  }

  matchCurrentLocation(location: Location) {
    const url = new URL(
      stripBasename({ basename: this.basename, pathname: location.pathname }),
      window.location.toString(),
    ).toString();

    const matchedRoute = this.routes.find((route) => route.match(url));
    this._currentRoute = matchedRoute;
    this.dispatchEvent(new Event("change"));
  }

  get currentRoute() {
    if (this._currentRoute == null) {
      throw new Error("No matched route. Add a wildcard route to handle this case");
    }
    return this._currentRoute;
  }

  navigate(to: To) {
    const parsed = parseToInfo(to);
    if (parsed.absoluteURL) {
      const url = prependBasename({ basename: this.basename, pathname: parsed.absoluteURL });
      this.history.push(url);
      return;
    }
    this.history.push(to);
  }

  createHref(to: To) {
    const parsed = parseToInfo(to);
    if (parsed.absoluteURL) {
      const url = prependBasename({ basename: this.basename, pathname: parsed.absoluteURL });
      return this.history.createHref(url);
    }
    return this.history.createHref(to);
  }
}

export type ParsedLocationInfo<T extends To> =
  | {
      absoluteURL: string;
      isExternal: boolean;
      to: string;
    }
  | {
      absoluteURL: undefined;
      isExternal: false;
      to: T;
    };

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

export function parseToInfo<T extends To | string>(_to: T): ParsedLocationInfo<T> {
  let to = _to as string;
  if (typeof to !== "string") {
    return { to, absoluteURL: undefined, isExternal: false };
  }

  let absoluteURL = to;
  let isExternal = false;
  try {
    let currentUrl = new URL(window.location.href);
    let targetUrl = to.startsWith("//")
      ? new URL(currentUrl.protocol + to)
      : new URL(to, window.location.href);
    let path = targetUrl.pathname;

    if (targetUrl.origin === currentUrl.origin && path != null) {
      // Strip the protocol/origin/basename for same-origin absolute URLs
      to = path + targetUrl.search + targetUrl.hash;
    } else {
      isExternal = true;
    }
  } catch (e) {
    console.warn(e);
    // We can't do external URL detection without a valid URL
    console.warn(
      `<Link to="${to}"> contains an invalid URL which will probably break ` +
        `when clicked - please update to a valid URL path.`,
    );
  }

  return {
    absoluteURL,
    isExternal,
    to,
  };
}
