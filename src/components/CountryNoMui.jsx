import React from 'react';
import MedalNoMui from './MedalNoMui'


const CountryNoMui = (props) => {
  const { onDelete, onIncrement, onDecrement, country, canPatch, canDelete } = props;
      
  return (
          <div className='Country' style={{ margin: 'auto', display: 'block'}}>
             { country.name }: {country.gold + country.silver + country.bronze} 
             {canDelete && <button onClick={() => onDelete(country.id)}>-</button>}
            <br/> 
            <MedalNoMui
            country={ country }
            canPatch={ canPatch }
            onIncrement={ onIncrement }
            onDecrement={ onDecrement }
            color={ "gold" } />
            <MedalNoMui
            country={ country }
            canPatch={ canPatch }
            onIncrement={ onIncrement }
            onDecrement={ onDecrement }
            color={ "silver" } />
            <MedalNoMui
            country={ country }
            canPatch={ canPatch }
            onIncrement={ onIncrement }
            onDecrement={ onDecrement }
            color={ "bronze" } />
          </div>
  );
}
 
export default CountryNoMui;