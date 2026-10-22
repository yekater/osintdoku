import { expect, test } from "@playwright/test";
import { cases } from "../../src/cases/registry";

test("las rutas directas entregan el expediente correcto incluso sin JavaScript", async ({
  request,
}) => {
  for (const investigation of cases) {
    const path = `/casos/${investigation.slug}`;
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toContain(`<title>${investigation.title} · OSINTDOKU</title>`);
    expect(html).toContain(`data-prerender-path="${path}"`);
    expect(html).toContain(investigation.subtitle);
    expect(html).toContain('property="og:description"');
  }
});
