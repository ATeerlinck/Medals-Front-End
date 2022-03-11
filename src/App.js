import React, { useState, useEffect, useRef } from 'react';
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
import Login from './components/Login';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import jwtDecode from 'jwt-decode';

const App = () => {
  const hubEndpoint = "https://medals-api.azurewebsites.net/medalsHub"
  const apiEndpoint = "https://medals-api.azurewebsites.net/jwt/api/country";
  const usersEndpoint = "https://medals-roles-api.azurewebsites.net/api/users/login";
  const [ countries, setCountries ] = useState([]);
  const [ connection, setConnection] = useState(null);
  const colors = ["gold", "silver", "bronze"];
  const [ user, setUser ] = useState(
    {
      name: null,
      canPost: false,
      canPatch: false,
      canDelete: false
    }
  );
  const latestCountries = useRef(null);
  // latestCountries.current is a ref variable to countries
  // this is needed to access state variable in useEffect w/o dependency
  latestCountries.current = countries;
  useEffect(() => {
    // initial data loaded here
    async function fetchCountries() {
      const { data : fetchedCountries } = await axios.get(apiEndpoint);
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
    fetchCountries();

    const encodedJwt = localStorage.getItem("token");
    // check for existing token
    if (encodedJwt) {
      setUser(getUser(encodedJwt));
    }

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

          let newCountry = { 
            id: country.id, 
            name: country.name,
          };
          colors.forEach(color => {
            const count = country[color];
            newCountry[color] = { page_value: count, saved_value: count };
          });
          let mutableCountries = [...latestCountries.current];
          mutableCountries = mutableCountries.concat(newCountry);
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
          let updatedCountry = {
            id: country.id,
            name: country.name,
          }
          colors.forEach(color => {
            const count = country[color];
            updatedCountry[color] = { page_value: count, saved_value: count };
          });
          let mutableCountries = [...latestCountries.current];
          const idx = mutableCountries.findIndex(c => c.id === country.id);
          mutableCountries[idx] = updatedCountry;

          setCountries(mutableCountries);
        });
      })
      .catch(e => console.log('Connection failed: ', e));
    }
  // useEffect is dependent on changes connection
  }, [connection]);

  const handleAdd = async (name) => {
    // check for valid token
    if (isValidToken())
    {
      try {
        await axios.post(apiEndpoint, {
          name: name
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (ex) {
        if (ex.response && ex.response.status === 401) {
          alert("You are not authorized to complete this request");
        } else if (ex.response) {
          console.log(ex.response);
        } else {
          console.log("Request failed");
        }
      }
    } else {
      alert('Your token has expired');
    }
  }
  const handleDelete = async (countryId) => {
    // check for valid token
    if (isValidToken())
    {
      const originalCountries = countries;
      setCountries(countries.filter(c => c.id !== countryId));
      try {
        await axios.delete(`${apiEndpoint}/${countryId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (ex) {
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
    } else {
      alert('Your token has expired');
    }
  }
  const handleSave = async (countryId) => {
    const originalCounts = {};

    const idx = countries.findIndex(c => c.id === countryId);
    const mutableCountries = [ ...countries ];
    const country = mutableCountries[idx];
    let jsonPatch = [];
    colors.forEach(color => {
      originalCounts[color] = country[color].saved_value;
      if (country[color].page_value !== country[color].saved_value) {
        jsonPatch.push({ op: "replace", path: color, value: country[color].page_value });
        country[color].saved_value = country[color].page_value;
      }
    });
    console.log(`json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`);

    // check for valid token
    if (isValidToken())
    {
      try {
        await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (ex) {
        colors.current.forEach(color => {
          country[color].page_value = originalCounts[color];
          country[color].saved_value = originalCounts[color];
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
    } else {
      colors.current.forEach(color => {
        country[color].page_value = originalCounts[color];
        country[color].saved_value = originalCounts[color];
      });  
      alert('Your token has expired');
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
  const handleLogin = async (username, password) => {
    try {
      const resp = await axios.post(usersEndpoint, { username: username, password: password });
      const encodedJwt = resp.data.token;
      localStorage.setItem('token', encodedJwt);
      setUser(getUser(encodedJwt));
    } catch (ex) {
      if (ex.response && (ex.response.status === 401 || ex.response.status === 400 )) {
        alert("Login failed");
      } else if (ex.response) {
        console.log(ex.response);
      } else {
        console.log("Request failed");
      }
    }
  }
  const handleLogout = (e) => {
    e && e.preventDefault();
    console.log('logout');
    localStorage.removeItem('token');
    setUser({
      name: null,
      canPost: false,
      canPatch: false,
      canDelete: false
    });
    return false;
  }
  const getUser = (encodedJwt) => {
    const decodedJwt = jwtDecode(encodedJwt);
    const diff = Date.now() - (decodedJwt['exp'] * 1000);
    if (diff < 0) {
      // token not expired
      console.log(`token expires in ${parseInt((diff * -1) / 60000)} minutes`);
      return {
        name: decodedJwt['username'],
        canPost: decodedJwt['roles'].indexOf('medals-post') === -1 ? false : true,
        canPatch: decodedJwt['roles'].indexOf('medals-patch') === -1 ? false : true,
        canDelete: decodedJwt['roles'].indexOf('medals-delete') === -1 ? false : true,
      };
    }
    // token expired
    console.log(`token expired ${parseInt(diff / 60000)} minutes ago`);
    localStorage.removeItem('token');
    return {
      name: null,
      canPost: false,
      canPatch: false,
      canDelete: false,
    }
  }
  const isValidToken = () => {
    const encodedJwt = localStorage.getItem("token");
    // check for existing token
    if (encodedJwt) {
      const decodedJwt = jwtDecode(encodedJwt);
      const diff = Date.now() - (decodedJwt['exp'] * 1000);
      if (diff < 0) {
        console.log(`token expires in ${parseInt((diff * -1) / 60000)} minutes`);
        return true;
      } else {
        console.log(`token expired ${parseInt(diff / 60000)} minutes ago`);
        handleLogout();
      }
    }
    return false;
  }
  const getMedalCount = (medal) =>{
    let count = 0;
    for(let i=0; i<countries.length; i++){
      count+= countries[i][medal].page_value;
    }
    return count;
}

  return ( 
    <Router className="App">
      <header style= {{display: 'flex', alignItems: 'center', justifyContent: 'center' , flexWrap: 'wrap'}} className="App-header">
        <div>Olympic Medals</div>
        <Avatar sx={{ bgcolor: '#e2d02f', mx:2}}>{ getMedalCount(colors[0]) }</Avatar>
        <Avatar sx={{ bgcolor: '#cacaca', mx:2}}>{ getMedalCount(colors[1]) }</Avatar>
        <Avatar sx={{ bgcolor: '#a1671a', mx:2}}>{ getMedalCount(colors[2]) }</Avatar>
        <span>Total: {getMedalCount("gold")+getMedalCount("silver")+getMedalCount("bronze")}</span>
        {user.name ? 
          <span className='logout'><a href="/" onClick={handleLogout} className='logoutLink'>Logout</a> [{user.name}]</span>
          :
          <Link to="/login" className='loginLink'>Login</Link>
        }
      </header>
      <Route exact path="/login">
        <Login onLogin={handleLogin} />
      </Route>
      <Container fixed={true}>
        <Grid spacing={1} justifyContent="center">
          {countries.map(country =>
          (<Grid item key={ country.id }>
            <Country 
            key={ country.id }
            country={ country }
            colors={ colors }
            onIncrement={ handleIncrement } 
            canDelete={ user.canDelete }
            canPatch={ user.canPatch }
            onDelete={ handleDelete } 
            onSave={ handleSave }
            onReset={ handleReset }
            onDecrement={ handleDecrement } />
          </Grid>)
          )}
        </Grid>
        { user.canPost && <NewCountry onAdd={ handleAdd } /> }
      </Container>
      {countries.map(country =>
        <CountryNoMui 
          key={ country.id } 
          country={ country }
          colors={ colors }
          onIncrement={ handleIncrement } 
          onDelete={ handleDelete } 
          canDelete={ user.canDelete }
          canPatch={ user.canPatch }
          onSave={ handleSave }
          onReset={ handleReset }
          onDecrement={ handleDecrement } />
      )}
      { user.canPost && <NewCountryNoMui onAdd={ handleAdd } /> }
    </Router>
   );
}


export default App;
