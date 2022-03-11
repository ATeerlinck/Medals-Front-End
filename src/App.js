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
import { HubConnectionBuilder } from '@microsoft/signalr';import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import jwtDecode from 'jwt-decode';
import Login from './components/Login';

const App = () => {
  // const apiEndpoint = "https://localhost:5001/api/country";
  // const hubEndpoint = "https://localhost:5001/medalsHub"
  const apiEndpoint = "https://medals-api.azurewebsites.net/jwt/api/country";
  const hubEndpoint = "https://medals-api.azurewebsites.net/medalsHub"
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
      setCountries(fetchedCountries);
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

  const handleAdd = async (name) => {
    try {
      await axios.post(apiEndpoint, {
        name: name
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (ex) {
      if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) {
        alert("You are not authorized to complete this request");
      } else if (ex.response) {
        console.log(ex.response);
      } else {
        console.log("Request failed");
      }
    }
  }

  const handleDelete = async (countryId) => {
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
        if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) {
          alert("You are not authorized to complete this request");
        } else if (ex.response) {
          console.log(ex.response);
        } else {
          console.log("Request failed");
        }
      }
    }
  }

  const handleIncrement = (countryId, medalName) => handleUpdate(countryId, medalName, 1);
  const handleDecrement = (countryId, medalName) =>  handleUpdate(countryId, medalName, -1)
  const handleUpdate = async (countryId, medalName, factor) => {
    const idx = countries.findIndex(c => c.id === countryId);
    const mutableCountries = [...countries ];
    mutableCountries[idx][medalName] += (1 * factor);
    setCountries(mutableCountries);
    const jsonPatch = [{ op: "replace", path: medalName, value: mutableCountries[idx][medalName] }];
    console.log(`json patch for id: ${countryId}: ${JSON.stringify(jsonPatch)}`);

    try {
      await axios.patch(`${apiEndpoint}/${countryId}`, jsonPatch, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        // country does not exist
        console.log("The record does not exist - it may have been deleted");
      } else if (ex.response && (ex.response.status === 401 || ex.response.status === 403)) { 
        // in order to restore the defualt medal counts, we would need to save 
        // the page value and saved value for each medal (like in the advanced example)
        alert('You are not authorized to complete this request');
        // to simplify, I am reloading the page instead
        window.location.reload(false);
      } else if (ex.response) {
        console.log(ex.response);
      } else {
        console.log("Request failed");
      }
    }
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
    e.preventDefault();
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
    // return unencoded user / permissions
    const decodedJwt = jwtDecode(encodedJwt);
    return {
      name: decodedJwt['username'],
      canPost: decodedJwt['roles'].indexOf('medals-post') === -1 ? false : true,
      canPatch: decodedJwt['roles'].indexOf('medals-patch') === -1 ? false : true,
      canDelete: decodedJwt['roles'].indexOf('medals-delete') === -1 ? false : true,
    };
  }

  const getMedalCount = (medal) =>{
    let count = 0;
    for(let i=0; i<countries.length; i++){
      count+= countries[i][medal];
    }
    return count;
  }
  

  return ( 
    <Router className="App">
      <header style= {{display: 'flex', alignItems: 'center', justifyContent: 'center' , flexWrap: 'wrap'}} className="App-header">
        <div>Olympic Medals</div>
        <Avatar sx={{ bgcolor: '#e2d02f', mx:2}}>{ getAllMedalCount(colors[0]) }</Avatar>
        <Avatar sx={{ bgcolor: '#cacaca', mx:2}}>{ getAllMedalCount(colors[1]) }</Avatar>
        <Avatar sx={{ bgcolor: '#a1671a', mx:2}}>{ getAllMedalCount(colors[2]) }</Avatar>
        <span>Total: {getMedalCount("gold")+getMedalCount("silver")+getMedalCount("bronze")}</span>
        {user.name ? 
          <span className='logout'><a href="/" onClick={handleLogout} className='logoutLink'>Logout</a> [{user.name}]</span>
          :
          <Link to="/login" className='loginLink'>Login</Link>
        }      
      </header>
      <Route exact path="/login">
        <Login onLogin={ handleLogin } />
      </Route>
      <Container fixed={true}>
        <Grid spacing={1} justifyContent="center">
          {countries.map(country =>
          (<Grid item key={ country.id }>
            <Country 
            key={ country.id }
            country={ country }
            colors={ colors }
            canPatch={ user.canPatch }
            canDelete={ user.canDelete }
            onIncrement={ handleIncrement } 
            onDelete={ handleDelete } 
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
          canPatch={ user.canPatch }
          canDelete={ user.canDelete }
          onIncrement={ handleIncrement } 
          onDelete={ handleDelete } 
          onDecrement={ handleDecrement } />
      )}
      { user.canPost && <NewCountryNoMui onAdd={ handleAdd } /> }
    </Router>
   );
}


export default App;
