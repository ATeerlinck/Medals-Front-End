import React from 'react';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import ButtonGroup from '@mui/material/ButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

 
 const Medal = (props) => {
    const { onIncrement, onDecrement, country, color, theme } = props;
    return (
        <div>
            <Avatar sx={{ bgcolor: theme, mx:2}}>{ country[color] }</Avatar>
            <ButtonGroup variant="text" aria-label="text small button group">
                <IconButton style={{ cursor:'pointer', display: 'inline' }} sx={{ m: 0, p:0, mx: 1}} onClick={ () => onIncrement(country.id, color) }>
                    <AddIcon color="primary" />    
                </IconButton>  
                <IconButton disabled={country[color] <= 0 ? true : false} style={{ cursor:'pointer', display: 'inline' }} sx={{ m: 0, p:0, mx: 1}} onClick={ () => onDecrement(country.id, color) }>
                    <RemoveIcon color="primary"/>
                </IconButton>
            </ButtonGroup>
        </div>
    );
}

export default Medal;