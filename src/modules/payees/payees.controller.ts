import {
  createRawPayeeFromText,
  shouldReplaceFullAddress,
  updatePayeeFromText,
  updateRawPayeeFromText,
} from "../../shared/utils/ai-parse";
import { readFile } from "../../shared/utils/read-media";
import { PayeeRepository } from "./payees.repository";
import { PayeeService } from "./payees.service";
import type { Payee, PayeeRawAddress } from "./payees.types";

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
  const payees: Payee[] = repositoryLookup.map((entry) => entry.payee);
  return payees;
};

export const createPayee = async (fileName: string): Promise<Payee> => {
  const rawText: string = await readFile(fileName);
  const rawPayee: PayeeRawAddress = await createRawPayeeFromText(rawText);
  const payeeService: PayeeService = await PayeeService.init(rawPayee);
  const result: PayeeService = await payeeRepository.save(payeeService);
  return result.export();
};

export const deletePayee = async (payeeName: string): Promise<boolean> => {
  await payeeRepository.deletePayee(payeeName);
  return true;
};

export const putPayee = async (
  newPayee: Payee,
  oldPayeeName: string,
): Promise<Payee> => {
  if (!newPayee.orgName) {
    throw new Error("You must send the new payee with full org name");
  }
  const payee: PayeeService = await payeeRepository.getPayee(oldPayeeName);
  const newPayeeService: PayeeService =
    await payeeRepository.replacePayee(payee);
  return newPayeeService.export();
};

export const patchPayee = async (
  fileName: string,
  payeeName: string,
): Promise<Payee> => {
  const payeeService: PayeeService = await payeeRepository.getPayee(payeeName);
  const rawText = await readFile(fileName);
  const payee: Payee = payeeService.export();
  let payeeNew: Payee;
  const shouldReplaceEntireAddress: boolean = await shouldReplaceFullAddress(
    payee,
    rawText,
  );
  if (shouldReplaceEntireAddress) {
    const payeeRaw: PayeeRawAddress = payeeService.toPayeeRawAddress();
    const updatedPayeeRaw: PayeeRawAddress = await updateRawPayeeFromText(
      payeeRaw,
      rawText,
    );
    const payeeServiceNew: PayeeService =
      await PayeeService.init(updatedPayeeRaw);
    const payeeServiceSaved: PayeeService =
      await payeeRepository.save(payeeServiceNew);
    payeeNew = payeeServiceSaved.export();
  } else {
    payeeNew = await updatePayeeFromText(payee, rawText);
    await payeeRepository.savePayee(payeeNew);
  }
  return payeeNew;
};
