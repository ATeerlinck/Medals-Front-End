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
    const { onDelete, onIncrement, onDecrement, country, canPatch, canDelete } = props;
      return (
          <ThemeProvider theme={theme}>
              <Box className='Country' sx={{ width:300, mx:'auto' }}>
                <List>
                  <ListItem>
                    <ListItemText>
                      <Badge badgeContent={country.gold + country.silver + country.bronze} color="primary" bgcolor="ffffff">{ country.name }</Badge>
                    </ListItemText>
                    {canDelete &&<ListItemButton style={{ cursor:'pointer', display: 'inline', textAlign:'center' }} onClick={ () => onDelete(country.id)}>
                      <ListItemText primary="remove" />
                    </ListItemButton>}
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <Medal
                    country={ country }
                    onIncrement={ onIncrement }
                    onDecrement={ onDecrement }
                    canPatch={ canPatch }
                    theme={theme.palette.gold}
                    color={ "gold" } />
                    <Medal
                    country={ country }
                    onIncrement={ onIncrement }
                    onDecrement={ onDecrement }
                    canPatch={ canPatch }
                    theme={theme.palette.silver}
                    color={ "silver" } />
                    <Medal
                    country={ country }
                    onIncrement={ onIncrement }
                    onDecrement={ onDecrement }
                    canPatch={ canPatch }
                    theme={theme.palette.bronze}
                    color={ "bronze" } />
                  </ListItem>
                </List> 
              </Box>
          </ThemeProvider>
      );
  }
 
export default Country;