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

  const handleAdd = async (country) => {
    const { data: post } = await axios.post(apiEndpoint, { name: country});
    setCountries(countries.concat(post));
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
  const handleIncrement = (countryId, type) =>{
    const countryIndex = countries.findIndex(c => c.id === countryId);
    console.log("hey");
    console.log(countryIndex);
    let mutableCountries = countries.map((country, index) => {
      console.log(`country: ${country}, index: ${index}`);
      if(countryIndex === index){
        const newCountry = country; newCountry[type]+=1; 
        return newCountry;
      } else{
        return country;
      }
    } );
    setCountries(mutableCountries);
  }
  const handleDecrement = (countryId, type) =>{
    const countryIndex = countries.findIndex(c => c.id === countryId);
    console.log("hey");
    console.log(countryIndex);
    let mutableCountries = countries.map((country, index) => {
      console.log(`country: ${country}, index: ${index}`);
      if(countryIndex === index){
        const newCountry = country; newCountry[type]-=1; 
        return newCountry;
      } else{
        return country;
      }
    } );
    setCountries(mutableCountries);
  }
  const getMedalCount = (medal) =>{
    let count = 0;
    for(let i=0; i<countries.length; i++){
      count+= countries[i][medal];
    }
    return count;
  }
  useEffect(() => {
    // initial data loaded here
    async function fetchData() {
      const { data: fetchedCountries } = await axios.get(apiEndpoint);
      setCountries(fetchedCountries);
    }
    fetchData();
  }, []);

  return ( 
    <div className="App">
      <header style= {{display: 'flex', alignItems: 'center', justifyContent: 'center' , flexWrap: 'wrap'}} className="App-header">
        <div>Olympic Medals</div>
        <Avatar sx={{ bgcolor: '#e2d02f', mx:2}}>{ getMedalCount("gold") }</Avatar>
        <Avatar sx={{ bgcolor: '#cacaca', mx:2}}>{ getMedalCount("silver") }</Avatar>
        <Avatar sx={{ bgcolor: '#a1671a', mx:2}}>{ getMedalCount("bronze") }</Avatar>
      </header>
      <Container fixed={true}>
        <Grid spacing={1} justifyContent="center">
          {countries.map(country =>
          (<Grid item key={ country.id }>
            <Country 
            key={ country.id }
            country={ country }
            onIncrement={ handleIncrement } 
            onDelete={ handleDelete } 
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
          onIncrement={ handleIncrement } 
          onDelete={ handleDelete } 
          onDecrement={ handleDecrement } />
      )}
      <NewCountryNoMui onAdd={ handleAdd } />
    </div>
   );
}


export default App;
