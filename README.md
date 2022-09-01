# pcf-geoapify-address-auto

Geoapify Address Auto complete is a PCF control for model driven apps, it helps the users to speedup filling in addresses in Dynamics using the Geoapify Maps API.

You need to get an API key from Geoapify [here](https://www.geoapify.com/) <br />
for the demo of the API, click [here](https://apidocs.geoapify.com/playground/geocoding) <br />
and the documentation of the API, click [here](https://apidocs.geoapify.com/docs/geocoding/getting-started/#autocomplete)

# Enable control in Model-driven app

After installing the control solution in your Powerapps environment, add the control to the table form you want to enable the control on.

To do so, using the classing interface, add a text field on the table form and click on controls and add the geoapify Address auto complete

![alt text](https://github.com/ahmadnsam/pcf-geoapify-address-auto/blob/master/form.png?raw=true)

Properties:

1. Full address, is the field you're putting the control on
2. geoapify API key you created
3. CountryCodes, if you want to limit the results of your control to display only for one or more countries, for example:
   - Only Belgium: "be"
   - France and Belgium: "fr,be"

Address properties: all of them are optional, when you select an address on the control it will fill only the configured fields below,

4- Country <br />
5- State <br />
6- Zip code <br />
7- City <br />
8- Street 1 <br />
9- Street 2

![alt text](https://github.com/ahmadnsam/pcf-geoapify-address-auto/blob/master/ezgif.com-gif-maker.gif?raw=true)
