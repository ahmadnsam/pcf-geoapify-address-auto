import { NOTFOUND } from "dns";
import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class GeoapifyAddressAutoComplete implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private searchContainer: HTMLDivElement;
	private inputSearchElement: HTMLElement;
    private _context :ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;
	private apiKey : string;
	private countryCodes : string;
	private langCode : string;

	private add_country_val:string;
	private add_state_val:string;
	private add_city_val:string;
	private add_zipcode_val:string;
	private add_street1_val:string;
	private add_street2_val:string;

	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
	{
		// Add control initialization code
		
		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this.langCode = this.getLangCode(this._context.userSettings.languageId);
		this.apiKey = this._context.parameters.apiKey ? this._context.parameters.apiKey.raw as string: "";
		this.countryCodes = this._context.parameters.countryCodes &&  this._context.parameters.countryCodes.raw ? this._context.parameters.countryCodes.raw as string : "";
		this.searchContainer = document.createElement("div");
		this.searchContainer.className = "autocomplete-container";
		this.searchContainer.id = "autocomplete-container";
		container.appendChild(this.searchContainer);
		//initiate the Geoapify control build and logic
		this.addressAutocomplete(this.searchContainer, (data) => {
			return;
		  }, {
			  placeholder: context.resources.getString("placeholderLbl")
		  }, this);
		  var spaceElement = document.createElement("div");
		  spaceElement.innerHTML += "</br>";
		  container.appendChild(spaceElement);
	}

	private getLangCode(lang:number):string{
		switch(lang){
			case 1025: return "ar";
			case 1031: return "de";
			case 1033: return "en";
			case 1035: return "fi";
			case 1036: return "fr";
			case 1040: return "it";
			case 1043: return "nl";
			case 3082: return "es";
			default: return "";
		}

	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		
	}

	/**
	 * It is called by the framework prior to a control receiving new data.
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {address_country:this.add_country_val,
		address_state:this.add_state_val, address_city:this.add_city_val,
		address_zipcode:this.add_zipcode_val, address_street1:this.add_street1_val,
		address_street2:this.add_street2_val};
	}

	/**
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	public updateFields(geoApifyProperties:any):void{
		this.add_country_val = geoApifyProperties.country ? geoApifyProperties.country:"";
		this.add_state_val = geoApifyProperties.state ? geoApifyProperties.state : "";
		this.add_city_val = geoApifyProperties.city ? geoApifyProperties.city : "";
		this.add_zipcode_val = geoApifyProperties.postcode ? geoApifyProperties.postcode : "";
		this.add_street1_val = geoApifyProperties.address_line1 ? geoApifyProperties.address_line1 : "";
		this.add_street2_val = geoApifyProperties.address_line2 ? geoApifyProperties.address_line2 : "";
		this._notifyOutputChanged();
	}

	//Below the Geoapify JS function
	addressAutocomplete(containerElement:HTMLElement | null, callback: (arg?:any) => void, options:any, _this: this):void {
		// create input element
		var inputElement = document.createElement("input");
		inputElement.setAttribute("type", "text");
		inputElement.setAttribute("placeholder", options.placeholder);
		_this.inputSearchElement = inputElement;
		containerElement ? containerElement.appendChild(inputElement) : null;
	  
		// add input field clear button
		var clearButton = document.createElement("div");
		clearButton.classList.add("clear-button");
		addIcon(clearButton);
		clearButton.addEventListener("click", (e) => {
		  e.stopPropagation();
		  inputElement.value = '';
		  callback(null);
		  clearButton.classList.remove("visible");
		  closeDropDownList();
		});
		containerElement ? containerElement.appendChild(clearButton): null;
	  
		/* Current autocomplete items data (GeoJSON.Feature) */
		let currentItems:any;
	  
		/* Active request promise reject function. To be able to cancel the promise when a new request comes */
		let currentPromiseReject:any;
	  
		/* Focused item in the autocomplete list. This variable is used to navigate with buttons */
		let focusedItemIndex:any;
	  
		/* Execute a function when someone writes in the text field: */
		inputElement.addEventListener("input", function(e) {
		  var currentValue = this.value;
	  
		  /* Close any already open dropdown list */
		  closeDropDownList();
	  
		  // Cancel previous request promise
		  if (currentPromiseReject) {
			currentPromiseReject({
			  canceled: true
			});
		  }
	  
		  if (!currentValue) {
			clearButton.classList.remove("visible");
			return false;
		  }
	  
		  // Show clearButton when there is a text
		  clearButton.classList.add("visible");
	  
		  /* Create a new promise and send geocoding request */
		  var promise = new Promise((resolve, reject) => {
			currentPromiseReject = reject;
	  
			//var apiKey = "47f523a46b944b47862e39509a7833a9";
			var apiKey = _this.apiKey;
			var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${apiKey}`;
			
			if(_this.countryCodes !== ""){
				url += `&filter=countrycode:${_this.countryCodes}`;
			}
			if(_this.langCode !== ""){
				url += `&lang=${_this.langCode}`;
			}
			if (options.type) {
				url += `&type=${options.type}`;
			}
	  
			fetch(url,{
				method: 'GET', 
				mode: 'cors', 
				cache: 'no-cache', 
				credentials: 'same-origin',
				headers: {
			  	'Content-Type': 'application/json'
				},
				redirect: 'follow',
				referrerPolicy: 'no-referrer'})
			  .then(response => {
				// check if the call was successful
				if (response.ok) {
				  response.json().then(data => resolve(data));
				} else {
				  response.json().then(data => reject(data));
				}
			  });
		  });
	  
		  promise.then((data:any) => {
			currentItems = data.features;
	  
			/*create a DIV element that will contain the items (values):*/
			var autocompleteItemsElement = document.createElement("div");
			autocompleteItemsElement.style.position = "relative";
			autocompleteItemsElement.setAttribute("class", "autocomplete-items");
			containerElement ? containerElement.appendChild(autocompleteItemsElement):null;
	  
			/* For each item in the results */
			data.features.forEach((feature:any, index:any) => {
			  /* Create a DIV element for each element: */
			  var itemElement = document.createElement("DIV");
			  /* Set formatted address as item value */
			  itemElement.innerHTML = feature.properties.formatted;
	  
			  /* Set the value for the autocomplete text field and notify: */
			  itemElement.addEventListener("click", function(e) {
				inputElement.value = currentItems[index].properties.formatted;
				//place your code here when the option is clicked
				_this.updateFields(currentItems[index].properties);

				callback(currentItems[index]);
	  
				/* Close the list of autocompleted values: */
				closeDropDownList();
			  });
	  
			  autocompleteItemsElement.appendChild(itemElement);
			});
		  }, (err) => {
			if (!err.canceled) {
			  console.log(err);
			}
		  });
		});
	  
		/* Add support for keyboard navigation */
		inputElement.addEventListener("keydown", function(e) {
		  var autocompleteItemsElement = containerElement ? containerElement.querySelector(".autocomplete-items"):null;
		  if (autocompleteItemsElement) {
			var itemElements = autocompleteItemsElement.getElementsByTagName("div");
			if (e.keyCode == 40) {
			  e.preventDefault();
			  /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
			  focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
			  /*and and make the current item more visible:*/
			  setActive(itemElements, focusedItemIndex);
			} else if (e.keyCode == 38) {
			  e.preventDefault();
	  
			  /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
			  focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : focusedItemIndex = (itemElements.length - 1);
			  /*and and make the current item more visible:*/
			  setActive(itemElements, focusedItemIndex);
			} else if (e.keyCode == 13) {
			  /* If the ENTER key is pressed and value as selected, close the list*/
			  e.preventDefault();
			  if (focusedItemIndex > -1) {
				closeDropDownList();
			  }
			}
		  } else {
			if (e.keyCode == 40) {
			  /* Open dropdown list again */
			  var event = document.createEvent('Event');
			  event.initEvent('input', true, true);
			  inputElement.dispatchEvent(event);
			}
		  }
		});
	  
		function setActive(items:any, index:any) {
		  if (!items || !items.length) return false;
	  
		  for (var i = 0; i < items.length; i++) {
			items[i].classList.remove("autocomplete-active");
		  }
	  
		  /* Add class "autocomplete-active" to the active element*/
		  items[index].classList.add("autocomplete-active");
	  
		  // Change input value and notify
		  inputElement.value = currentItems[index].properties.formatted;
		  callback(currentItems[index]);
		}
	  
		function closeDropDownList() {
		  var autocompleteItemsElement = containerElement ? containerElement.querySelector(".autocomplete-items"):null;
		  if (autocompleteItemsElement) {
			containerElement ? containerElement.removeChild(autocompleteItemsElement): null;
		  }
	  
		  focusedItemIndex = -1;
		}
	  
		function addIcon(buttonElement:HTMLDivElement) {
		  var svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		  svgElement.setAttribute('viewBox', "0 0 24 24");
		  svgElement.setAttribute('height', "24");
	  
		  var iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		  iconElement.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
		  iconElement.setAttribute('fill', 'currentColor');
		  svgElement.appendChild(iconElement);
		  buttonElement.appendChild(svgElement);
		}
		
		  /* Close the autocomplete dropdown when the document is clicked. 
			Skip, when a user clicks on the input field */
		document.addEventListener("click", function(e) {
		  if (e.target !== inputElement) {
			closeDropDownList();
		  } else if (containerElement !== null && !containerElement.querySelector(".autocomplete-items")) {
			// open dropdown list again
			var event = document.createEvent('Event');
			event.initEvent('input', true, true);
			inputElement.dispatchEvent(event);
		  }
		});
	  
	  }
}
