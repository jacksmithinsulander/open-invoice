import { PayeeRepository } from "./payees.repository";
import type { PayeeService } from "./payees.service";
import type { Payee } from "./payees.types";

const payeeRepository = new PayeeRepository();

export const getPayee = async (payeeName: string): Promise<Payee> => {
  const payeeNameDecoded: string = decodeURIComponent(payeeName);
  const repositoryLookup: PayeeService =
    await payeeRepository.getPayee(payeeNameDecoded);
  const payee: Payee = repositoryLookup.payee;
  return payee;
};

export const getPayees = async (): Promise<Payee[]> => {
  const repositoryLookup: PayeeService[] = await payeeRepository.getPayees();
  const payees = repositoryLookup.map((entry) => entry.payee);
  return payees;
};
