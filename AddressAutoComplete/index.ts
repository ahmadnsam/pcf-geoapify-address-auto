import React from "react";
import AutoComplete from "./components/AutoComplete";
import ReactDOM from "react-dom";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { AutoCompleteProps } from "./components/AutoComplete";
import { useAddressStore } from "./store/address";
import { Address } from "./types/Address";
export class AddressAutoComplete
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  context: ComponentFramework.Context<IInputs>;
  notifyOutputChanged: () => void;
  state: ComponentFramework.Dictionary;
  container: HTMLDivElement;

  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.context = context;
    this.notifyOutputChanged = notifyOutputChanged;
    this.state = state;
    this.container = container;
    let props: AutoCompleteProps = {
      apiKey: context.parameters.apiKey.raw ?? "",
      countryCodes: context.parameters.countryCodes.raw
        ? (context.parameters.countryCodes.raw.split(",") as any[])
        : [],
      notify: notifyOutputChanged,
    };
    if (context.parameters.address_street1.raw)
      useAddressStore.setState({
        address: {
          address_line1: context.parameters.address_street1.raw ?? "",
          address_line2: context.parameters.address_street2.raw ?? "",
          city: context.parameters.address_city.raw ?? "",
          state: context.parameters.address_state.raw ?? "",
          postcode: context.parameters.address_zipcode.raw ?? "",
          country: context.parameters.address_country.raw ?? "",
        },
      });
    ReactDOM.render(React.createElement(AutoComplete, props), this.container);
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.context = context;
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    let address: Address = useAddressStore.getState().address;
    return {
      address_street1: address.address_line1,
      address_street2: address.address_line2,
      address_city: address.city,
      address_state: address.state,
      address_zipcode: address.postcode,
      address_country: address.country,
    };
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    ReactDOM.unmountComponentAtNode(this.container);
  }
}
