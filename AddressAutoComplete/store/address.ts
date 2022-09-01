import create from "zustand";
import { Address } from "../types/Address";
import { AddressStore } from "../types/AddressStore";

const emptyAddress: Address = {
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
};

export const useAddressStore = create<AddressStore>((set) => ({
  address: emptyAddress,
  set: (address: Address) => set({ address: address }),
  clear: () => set({ address: emptyAddress }),
}));
