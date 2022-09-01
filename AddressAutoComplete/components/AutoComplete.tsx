import React from "react";
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from "@geoapify/react-geocoder-autocomplete";

import { CountyCode } from "@geoapify/geocoder-autocomplete";
import { useAddressStore } from "../store/address";

export interface AutoCompleteProps {
  apiKey: string;
  countryCodes?: CountyCode[];
  notify: () => void;
}

export default function AutoComplete(props: AutoCompleteProps) {
  const { address, set, clear } = useAddressStore();
  const onPlaceSelect = (value: any) => {
    let _props = value?.properties;
    if (_props)
      set({
        address_line1: _props.address_line1,
        address_line2: _props.address_line2,
        city: _props.city,
        state: _props.state,
        postcode: _props.postcode,
        country: _props.country,
      });
    else clear();
    props.notify();
    return value;
  };
  const onSuggestionsChange = (value: any) => value;
  const filterSuggestions = (value: any) => value;
  const preProcess = (value: any) => value;
  const postProcess = (feature: any) => {
    let props = feature.properties;
    return `${props.address_line1}, ${props.address_line2}`;
  };
  return (
    <div className="geocoder-containet-vite-parent">
      <div className="geocoder-container-vite-control">
        <GeoapifyContext apiKey={props.apiKey}>
          <GeoapifyGeocoderAutocomplete
            placeholder="Search address here"
            countryCodes={props.countryCodes}
            placeSelect={onPlaceSelect}
            suggestionsChange={onSuggestionsChange}
            preprocessHook={preProcess}
            postprocessHook={postProcess}
            suggestionsFilter={filterSuggestions}
            value={
              address && address.address_line1 && address.address_line2
                ? `${address.address_line1}, ${address.address_line2}`
                : undefined
            }
          />
        </GeoapifyContext>
      </div>
    </div>
  );
}
