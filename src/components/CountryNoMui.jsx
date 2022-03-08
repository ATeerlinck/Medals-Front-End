import React from 'react';
import MedalNoMui from './MedalNoMui'


const CountryNoMui = (props) => {
  const { onDelete, onIncrement, onDecrement, country, canPatch, canDelete, colors } = props;
      
  return (
          <div className='Country' style={{ margin: 'auto', display: 'block'}}>
             { country.name }: {country.gold + country.silver + country.bronze} 
             {canDelete && <button onClick={() => onDelete(country.id)}>-</button>}
            <br/> 
            { colors.map(color => 
              <MedalNoMui
              country={ country }
              onIncrement={ onIncrement }
              onDecrement={ onDecrement }
              canPatch={ canPatch }
              theme={theme[palette][color]}
              color={ color } />
            )}
          </div>
  );
}
 
export default CountryNoMui;