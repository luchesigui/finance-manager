import type { SimulationParticipant } from "@/lib/simulationTypes";
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
