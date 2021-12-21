//Imports
import React, {useRef} from "react";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getDetails,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxList,
  ComboboxInput,
  ComboboxPopover,
  ComboboxOption
} from "@reach/combobox";
import "@reach/combobox/styles.css";

const mapContainerStyle = {
  width: "395px",
  height: "395px"
};
const options = {
  disableDefaultUI: true,
  zoomControl: true
}

//Map
function Map(prop) {
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const getCenter = () => {
    let center = {"lat": 0, "lng": 0}
    const nLocs = Object.keys(prop.loc).length
    let valids = 0
    if (nLocs > 0) {
      for ( let key of Object.keys(prop.loc) ) {
        if (prop.loc[key]['lat'] !== 0 || prop.loc[key]['lng'] !== 0) {
          center.lat += prop.loc[key]["lat"]
          center.lng += prop.loc[key]["lng"]
          valids += 1
        }
      }
      center.lat /= valids
      center.lng /= valids
    }
    return center
  }


  return (
    <div>
      <GoogleMap 
        mapContainerStyle={mapContainerStyle} 
        zoom={12}
        center={getCenter()}
        options={options}
        onLoad={onMapLoad}
      >
        {
          Object.keys(prop.loc).map((key) => (
            <Marker
              key = {prop.loc[key]["place_id"]} 
              position={{ lat: prop.loc[key]["lat"], lng: prop.loc[key]["lng"] }} 
              onClick={() => {
                prop.setNewSelect(prop.loc[key])
                let newCenter = {"lat":prop.loc[key].lat, "lng":prop.loc[key].lng}
                mapRef.current.panTo(newCenter)
              }}
            />
          ))
        }
        { prop.newSelect ? (
          <InfoWindow 
            position={{ lat: prop.newSelect.lat, lng: prop.newSelect.lng }} 
            onCloseClick={() => {
              prop.setNewSelect(null)
              mapRef.current.panTo(getCenter())
            }
          }>
            <div>
              <h2>{prop.newSelect.name}</h2>
              <div>{prop.newSelect.address}</div>
            </div>
          </InfoWindow>
          ) : null 
        }
      </GoogleMap>
    </div>

  );
}

//Search
function Search(prop) {
  const detail_fields = ["name","formatted_address", "geometry", "place_id", "type", "opening_hours"]
  const { ready, value, suggestions: {status, data}, setValue, clearSuggestions } = usePlacesAutocomplete();
  const suggests = useRef({});

  const setSuggest = () => {
    data.map(({ place_id, description }) => (
      suggests.current[description] = place_id
    ))
  }

  const renderSuggestions = () => {
    const suggestions = data.map(({ place_id, description}) => (
      <ComboboxOption key={place_id} value={description}/>
    ));
    return (<>{suggestions}</>)
  }

  const genericHours = () => {
    return new Array(7).fill([0,2800])
  }

  const distillHours = (details) => {
    let distilledHours = {}
    let hours = details.opening_hours.periods
    for (let key in Object.keys(hours)) {
      let today = hours[key].open.day
      distilledHours[today] = [parseInt(hours[key].open.time), parseInt(hours[key].close.time)]
      if (distilledHours[today][1] < distilledHours[today][0]) {
        distilledHours[today][1] += 2400 //For locations that are open through midnight
      }
    }
    return distilledHours
  }

  const handleInput = (e) => {
    setValue(e.target.value);
  }

  //Needs to pull the data and store the important bits
  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    const params = {
      placeId: suggests.current[address],
      fields: detail_fields
    }
    getDetails(params)
    .then((details) => {
      //Adds data
      prop.newLoc.name = details.name
      prop.newLoc.hours = (details.opening_hours) ? distillHours(details) : genericHours()
      prop.newLoc.place_id = details.place_id
      prop.newLoc.types = details.types
      prop.newLoc.lat = details.geometry.location.lat()
      prop.newLoc.lng = details.geometry.location.lng()
      //let address_list = []
      //for (let val of Object.values(details.address_components)) {
      //  address_list.push(val["long_name"])
      //}
      //prop.newLoc.address = address_list.join(" ")
      prop.newLoc.address = details.formatted_address
      prop.setNewLoc(prop.newLoc)
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
  };

  return (
    <div>
      <Combobox onSelect={handleSelect}>
        <ComboboxInput 
          className="init-input"
          value = {value} 
          onChange={handleInput} 
          placeholder="Enter a Location" 
          disabled={!ready}
        />
        <ComboboxPopover>
          {setSuggest()}
          <ComboboxList>
            {status === "OK" && renderSuggestions()}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}

export {Map, Search};