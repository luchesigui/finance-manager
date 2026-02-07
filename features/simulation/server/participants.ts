import type { SimulationParticipant } from "@/features/simulation/types";
import type { Person } from "@/lib/types";

export function createInitialParticipants(people: Person[]): SimulationParticipant[] {
  return people.map((person) => ({
    id: person.id,
    name: person.name,
    realIncome: person.income,
    isActive: true,
    incomeMultiplier: 1,
    simulatedIncome: person.income,
  }));
}
