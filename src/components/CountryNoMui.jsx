import React from 'react';
import MedalNoMui from './MedalNoMui'


const CountryNoMui = (props) => {
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
          <div className='Country' style={{ margin: 'auto', display: 'block'}}>
            { country.name }: {getMedalCount()} <button onClick={() => onDelete(country.id)}>-</button><br/>
            <MedalNoMui
            country={ country }
            onIncrement={ onIncrement }
            onDecrement={ onDecrement }
            color={ colors[0] } />
            <MedalNoMui
            country={ country }
            onIncrement={ onIncrement }
            onDecrement={ onDecrement }
            color={ colors[1] } />
            <MedalNoMui
            country={ country }
            onIncrement={ onIncrement }
            onDecrement={ onDecrement }
            color={ colors[2] } />
            { renderSaveButton() ?
              <React.Fragment>
                <button style={{marginLeft:'8px'}} onClick={ () => onSave(country.id) }>save</button>
                <button style={{marginLeft:'8px'}} onClick={ () => onReset(country.id) }>reset</button>
              </React.Fragment>
              :
              <button onClick={() => onDelete(country.id)}>delete</button>
            }
          </div>
  );
}
 
export default CountryNoMui;