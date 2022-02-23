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

const App = () => {
  const [countries, setCountries] = useState([]);
  const apiEndpoint = "https://medals-api.azurewebsites.net/api/country";
  const colors = ["gold", "silver", "bronze"];

  const handleAdd = async (country) => {
    const { data: post } = await axios.post(apiEndpoint, { Name: country });
    let newCountry = { 
      id: post.id, 
      name: post.name,
    };
    colors.forEach(color => {
      const count = post[color];
      newCountry[color] = { page_value: count, saved_value: count };
    });
    setCountries(countries.concat(newCountry));
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
        alert('An error occurred while deleting a country');
        setCountries(OGcountries);
      }
    }
  }
  const handleSave = async (countryId) => {
    const originalCountries = countries;

    const idx = countries.findIndex(c => c.id === countryId);
    const mutableCountries = [ ...countries ];
    const country = mutableCountries[idx];
    let jsonPatch = [];
    colors.forEach(color => {
      if (country[color].page_value !== country[color].saved_value) {
        jsonPatch.push({ op: "replace", path: color, value: country[color].page_value });
        country[color].saved_value = country[color].page_value;
      }
    });
    console.log(`json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`);
    // update state
    setCountries(mutableCountries);

    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country already deleted
        console.log("The record does not exist - it may have already been deleted");
      } else { 
        alert('An error occurred while updating');
        setCountries(originalCountries);
      }
    }
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
  }, []);

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
