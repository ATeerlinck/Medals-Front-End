import React from 'react';
 
 const MedalNoMui = (props) => {
    const { onIncrement, onDecrement, country, color } = props;
    return (
        <div>
            {color}: { 
                ( country[color].page_value !== country[color].saved_value) ?
                <span className="delta">{country[color].page_value}</span>
                :
                <span>{country[color].page_value}</span>
                }
                <input type="button" style={{ cursor:'pointer', display: 'inline' }} onClick={ () => onIncrement(country.id, color) } value={"+"} />  
                <input type="button" disabled={country[color] <= 0 ? true : false} style={{ cursor:'pointer', display: 'inline' }} onClick={ () => onDecrement(country.id, color) }value={"-"} />
        </div>
    );
}

export default MedalNoMui;