import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { content, dataProjects, education, profile, projects, site } from "./data";

export function render(pathname = "/", portraitAvailable = false) {
  const helmetContext: Record<string, unknown> = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <App initialPath={pathname} portraitAvailable={portraitAvailable} />
    </HelmetProvider>,
  );
  const helmet = helmetContext.helmet as {
    title: { toString(): string };
    meta: { toString(): string };
    link: { toString(): string };
    script: { toString(): string };
  };

  return {
    html,
    head: `${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}`,
  };
}

export function getBuildData() {
  return {
    profile,
    site,
    content,
    education,
    projects,
    dataProjects,
  };
}
