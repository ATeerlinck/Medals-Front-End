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
    const { onDelete, onIncrement, onDecrement, country, onSave, onReset, colors, canDelete, canPatch } = props;
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
              <Box className='Country' sx={{ width:250 , mx:'auto' }}>
                <List>
                  <ListItem>
                    <ListItemText>
                      <Badge badgeContent={ getMedalCount() } color="primary" bgcolor="ffffff">{ country.name }</Badge>
                    </ListItemText>
                    {canDelete && <ListItemButton style={{ cursor:'pointer', display: 'inline', textAlign:'center' }} onClick={ () => onDelete(country.id)}>
                      <ListItemText primary="remove" />
                    </ListItemButton> }
                  </ListItem>
                  <Divider />
                  <ListItem>
                  {colors.map(color => 
                    <Medal
                    key={color}
                    color={ color }
                    country={ country }
                    canPatch={ canPatch }
                    onIncrement={ onIncrement }
                    onDecrement={ onDecrement }
                    theme={theme.palette[color]}
                     />
                   )}
                   </ListItem>
                  <Divider />
                  <ListItem>
                    { renderSaveButton() ?
                      <React.Fragment>
                        <Button style={{marginLeft:'8px'}} onClick={ () => onSave(country.id) }>save</Button>
                        <Button style={{marginLeft:'8px'}} onClick={ () => onReset(country.id) }>reset</Button>
                      </React.Fragment>
                      :
                      <Button onClick={() => onDelete(country.id)}>delete</Button>
                    }
                  </ListItem>
                </List> 
              </Box>
          </ThemeProvider>
      );
  }
 
export default Country;