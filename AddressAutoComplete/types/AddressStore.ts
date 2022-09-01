import { Address } from "./Address";

export type AddressStore = {
  address: Address;
  set: (address: Address) => void;
  clear: () => void;
};
