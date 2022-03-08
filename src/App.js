import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import Country from './components/Country';
import CountryNoMui from './components/CountryNoMui';
import NewCountry from './components/NewCountry';
import NewCountryNoMui from './components/NewCountryNoMui';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { HubConnectionBuilder } from '@microsoft/signalr';

const App = () => {
  const hubEndpoint = "https://localhost:5001/medalsHub"
  const apiEndpoint = "https://medals-api.azurewebsites.net/jwt/api/country";
  // const hubEndpoint = "https://medals-api.azurewebsites.net/medalsHub"
  const [ countries, setCountries ] = useState([]);
  const [ connection, setConnection] = useState(null);
  const colors = ["gold", "silver", "bronze"];

  const handleAdd = async (country) => {
    try {
      await axios.post(apiEndpoint, { name: country });
    } catch (ex) {
      if (ex.response && ex.response.status === 401) {
        alert("You are not authorized to complete this request");
      } else if (ex.response) {
        console.log(ex.response);
      } else {
        console.log("Request failed");
      }
    }
  }
  const handleDelete = async (countryId) => {
    const OGcountries = countries;
    setCountries(countries.filter(c => c.id !== countryId));
    try {
      await axios.delete(`${apiEndpoint}/${countryId}`);
    } catch(ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        console.log("The record does not exist - it may have already been deleted");
      } else { 
        setCountries(originalCountries);
        if (ex.response && ex.response.status === 401) {
          alert("You are not authorized to complete this request");
        } else if (ex.response) {
          console.log(ex.response);
        } else {
          console.log("Request failed");
        }
      }
    }
  }
  const handleSave = async (countryId) => {
    const originalCounts = {};

    const idx = countries.findIndex(c => c.id === countryId);
    const mutableCountries = [ ...countries ];
    const country = mutableCountries[idx];
    let jsonPatch = [];
    colors.forEach(color => {
      originalCounts[color.name] = country[color.name].saved_value;
      if (country[color].page_value !== country[color].saved_value) {
        jsonPatch.push({ op: "replace", path: color, value: country[color].page_value });
        country[color].saved_value = country[color].page_value;
      }
    });
    console.log(`json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`);

    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch);
    } catch (ex) {
      colors.current.forEach(color => {
        country[color.name].page_value = originalCounts[color.name];
        country[color.name].saved_value = originalCounts[color.name];
      });     
      if (ex.response && ex.response.status === 404) {
        // country does not exist
        console.log("The record does not exist - it may have been deleted");
      } else if (ex.response && ex.response.status === 401) { 
        alert('You are not authorized to complete this request');
      } else if (ex.response) {
        console.log(ex.response);
      } else {
        console.log("Request failed");
      }
    }
    setCountries(mutableCountries);
  }
  const handleReset = (countryId) => {
    const idx = countries.findIndex(c => c.id === countryId);
    const mutableCountries = [ ...countries ];
    const country = mutableCountries[idx];
    colors.forEach(color => {
      country[color].page_value = country[color].saved_value;
    });
    setCountries(mutableCountries);
  }
  const handleIncrement = (countryId, medalName) => handleUpdate(countryId, medalName, 1);
  const handleDecrement = (countryId, medalName) => handleUpdate(countryId, medalName, -1);
  const handleUpdate = (countryId, medalName, factor) => {
      const idx = countries.findIndex(c => c.id === countryId);
      const mutableCountries = [...countries ];
      mutableCountries[idx][medalName].page_value += (1 * factor);
      setCountries(mutableCountries);
  }  
  const getAllMedalCount = (medal) =>{
      let count = 0;
      for(let i=0; i<countries.length; i++){
        count+= countries[i][medal].page_value;
      }
      return count;
  }
  const latestCountries = useRef(null);
  // latestCountries.current is a ref variable to countries
  // this is needed to access state variable in useEffect w/o dependency
  latestCountries.current = countries;
  useEffect(() => {
    // initial data loaded here
    async function fetchData() {
      const { data: fetchedCountries } = await axios.get(apiEndpoint);
      let newCountries = [];
      fetchedCountries.forEach(country => {
        let newCountry = {
          id: country.id,
          name: country.name,
        };
        colors.forEach(color => {
          const count = country[color];
          newCountry[color] = { page_value: count, saved_value: count };
        });
        newCountries.push(newCountry);
      });
      setCountries(newCountries);
    }
    fetchData();
    // signalR
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubEndpoint)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);
  // componentDidUpdate (changes to connection)
  useEffect(() => {
    if (connection) {
      connection.start()
      .then(() => {
        console.log('Connected!')

        connection.on('ReceiveAddMessage', country => {
          console.log(`Add: ${country.name}`);
          let mutableCountries = [...latestCountries.current];
          mutableCountries = mutableCountries.concat(country);

          setCountries(mutableCountries);
        });
        connection.on('ReceiveDeleteMessage', id => {
          console.log(`Delete id: ${id}`);
          let mutableCountries = [...latestCountries.current];
          mutableCountries = mutableCountries.filter(c => c.id !== id);

          setCountries(mutableCountries);
        });
        connection.on('ReceivePatchMessage', country => {
          console.log(`Patch: ${country.name}`);
          let mutableCountries = [...latestCountries.current];
          const idx = mutableCountries.findIndex(c => c.id === country.id);
          mutableCountries[idx] = country;

          setCountries(mutableCountries);
        });
      })
      .catch(e => console.log('Connection failed: ', e));
    }
  // useEffect is dependent on changes connection
  }, [connection]);

  return ( 
    <div className="App">
      <header style= {{display: 'flex', alignItems: 'center', justifyContent: 'center' , flexWrap: 'wrap'}} className="App-header">
        <div>Olympic Medals</div>
        <Avatar sx={{ bgcolor: '#e2d02f', mx:2}}>{ getAllMedalCount(colors[0]) }</Avatar>
        <Avatar sx={{ bgcolor: '#cacaca', mx:2}}>{ getAllMedalCount(colors[1]) }</Avatar>
        <Avatar sx={{ bgcolor: '#a1671a', mx:2}}>{ getAllMedalCount(colors[2]) }</Avatar>
      </header>
      <Container fixed={true}>
        <Grid spacing={1} justifyContent="center">
          {countries.map(country =>
          (<Grid item key={ country.id }>
            <Country 
            key={ country.id }
            country={ country }
            colors={ colors }
            onIncrement={ handleIncrement } 
            onDelete={ handleDelete } 
            onSave={ handleSave }
            onReset={ handleReset }
            onDecrement={ handleDecrement } />
          </Grid>)
          )}
        </Grid>
        <NewCountry onAdd={handleAdd} />
      </Container>
      {countries.map(country =>
        <CountryNoMui 
          key={ country.id } 
          country={ country }
          colors={ colors }
          onIncrement={ handleIncrement } 
          onDelete={ handleDelete } 
          onSave={ handleSave }
          onReset={ handleReset }
          onDecrement={ handleDecrement } />
      )}
      <NewCountryNoMui onAdd={ handleAdd } />
    </div>
   );
}


export default App;
