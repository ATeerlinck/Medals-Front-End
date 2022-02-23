import React from 'react';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Medal from './Medal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import { Button, ListItemButton } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      light: '#fffd61',
      main: '#3bb7ff',
      dark: '#c79a00',
      contrastText: '#000',
    },
    secondary: {
      light: '#76d275',
      main: '#43a047',
      dark: '#00701a',
      contrastText: '#000',
    },
    gold: '#ffca28',
    silver: '#a0a0a0',
    bronze: '#7c4600',
  },
});

const Country = (props) => {
    const { onDelete, onIncrement, onDecrement, country, onSave, onReset, colors } = props;
    const renderSaveButton = () => {
      let unsaved = false;
      colors.forEach(color => {
        if (country[color].page_value !== country[color].saved_value) {
          unsaved = true;
        }
      });
      return unsaved;
    }
    const getMedalCount = () =>{
      let count = 0;
      for(let i=0; i<colors.length; i++){
        count+= country[colors[i]].page_value;
      }
      return count;
    }
      return (
          <ThemeProvider theme={theme}>
              <Box className='Country' sx={{ width:300, mx:'auto' }}>
                <List>
                  <ListItem>
                    <ListItemText>
                      <Badge badgeContent={ getMedalCount() } color="primary" bgcolor="ffffff">{ country.name }</Badge>
                    </ListItemText>
                    <ListItemButton style={{ cursor:'pointer', display: 'inline', textAlign:'center' }} onClick={ () => onDelete(country.id)}>
                      <ListItemText primary="remove" />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <Medal
                    country={ country }
                    onIncrement={ onIncrement }
                    onDecrement={ onDecrement }
                    theme={theme.palette.gold}
                    color={ colors[0] } />
                    <Medal
                    country={ country }
                    onIncrement={ onIncrement }
                    onDecrement={ onDecrement }
                    theme={theme.palette.silver}
                    color={ colors[1] } />
                    <Medal
                    country={ country }
                    onIncrement={ onIncrement }
                    onDecrement={ onDecrement }
                    theme={theme.palette.bronze}
                    color={ colors[2] } />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    { renderSaveButton() ?
                      <React.Fragment>
                        <button style={{marginLeft:'8px'}} onClick={ () => onSave(country.id) }>save</button>
                        <button style={{marginLeft:'8px'}} onClick={ () => onReset(country.id) }>reset</button>
                      </React.Fragment>
                      :
                      <button onClick={() => onDelete(country.id)}>delete</button>
                    }
                  </ListItem>
                </List> 
              </Box>
          </ThemeProvider>
      );
  }
 
export default Country;