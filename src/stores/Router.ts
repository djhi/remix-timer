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
  private routes: Array<Route> = [];
  private _currentRoute: Route | undefined = undefined;

  constructor(routes: Array<Omit<Route, "match">>) {
    super();
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
    const matchedRoute = this.routes.find((route) =>
      route.match(new URL(location.pathname, window.location.toString()).toString()),
    );
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
    this.history.push(to);
  }

  createHref(to: To) {
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
