import { caseSchema, type Investigation } from "./schema";
import case001 from "./001/case";
import case002 from "./002/case";
import case003 from "./003/case";
import case004 from "./004/case";
import case005 from "./005/case";

export const cases: Investigation[] = [
  case001,
  case002,
  case003,
  case004,
  case005,
].map((item) => caseSchema.parse(item));
export function getCase(slug: string): Investigation | undefined {
  return cases.find((item) => item.slug === slug);
}
