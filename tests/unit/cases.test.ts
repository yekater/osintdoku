import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cases } from "../../src/cases/registry";
import { solve } from "../../src/game/solver";
import { validateCase } from "../../src/game/validation";

describe("expedientes publicados", () => {
  it("registra cinco investigaciones con rutas e identificadores únicos", () => {
    expect(cases).toHaveLength(5);
    expect(new Set(cases.map((item) => item.id)).size).toBe(cases.length);
    expect(new Set(cases.map((item) => item.slug)).size).toBe(cases.length);
    expect(cases.every((item) => item.published)).toBe(true);
    expect(new Set(cases.map((item) => item.mechanic)).size).toBe(5);
  });

  for (const investigation of cases) {
    describe(investigation.title, () => {
      it("tiene una única solución derivable de sus restricciones", () => {
        expect(() => validateCase(investigation)).not.toThrow();
        expect(
          solve(investigation.constraints, investigation.entities.length),
        ).toEqual([investigation.solution]);
      });

      it("rechaza una solución declarada que contradice las pruebas", () => {
        const invalid = structuredClone(investigation);
        [invalid.solution[0], invalid.solution[1]] = [
          invalid.solution[1],
          invalid.solution[0],
        ];
        expect(() => validateCase(invalid)).toThrow();
      });

      it("rechaza miniaturas sin una referencia válida para cada entidad", () => {
        const invalid = structuredClone(investigation);
        invalid.entityEvidenceIds[0] = "inexistente";
        expect(() => validateCase(invalid)).toThrow();
      });

      it("sirve imágenes locales para la escena, la resolución y todas las pruebas", () => {
        const paths = [
          investigation.heroImage,
          investigation.sceneImage,
          investigation.resolutionImage,
          ...investigation.visualEvidence.map((item) => item.image),
        ];
        for (const path of paths) {
          expect(path.startsWith("/assets/")).toBe(true);
          expect(
            existsSync(resolve(process.cwd(), "public", path.slice(1))),
            `Recurso ausente: ${path}`,
          ).toBe(true);
        }
      });

      it("liga las pistas y las evidencias a deducciones y conserva fuentes originales", () => {
        const evidenceIds = new Set(
          investigation.visualEvidence.map((item) => item.id),
        );
        for (const item of investigation.visualEvidence) {
          expect(
            investigation.constraints.some(
              (constraint) => constraint.evidenceId === item.id,
            ),
          ).toBe(true);
          expect(item.provenance.length).toBeGreaterThan(15);
        }
        for (const clue of investigation.logicalClues)
          expect(evidenceIds.has(clue.evidenceId)).toBe(true);
        for (const hint of investigation.hintLevels)
          expect(evidenceIds.has(hint.evidenceId)).toBe(true);
        expect(investigation.sourceLinks.length).toBeGreaterThan(0);
        expect(
          investigation.sourceLinks.every(
            (link) => new URL(link.url).protocol === "https:",
          ),
        ).toBe(true);
        expect(
          investigation.verdict.options.filter(
            (option) => option.id === investigation.verdict.correctId,
          ),
        ).toHaveLength(1);
      });
    });
  }
});
