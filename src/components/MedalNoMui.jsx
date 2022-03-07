import React from 'react';
 
 const MedalNoMui = (props) => {
    const { onIncrement, onDecrement, country, color, canPatch } = props;
    return (
        <div>
            {color}: { country[color] }
            { canPatch && 
                <React.Fragment>
                    <input type="button" style={{ cursor:'pointer', display: 'inline' }} onClick={ () => onIncrement(country.id, color) } value={"+"} />  
                    <input type="button" disabled={country[color] <= 0 ? true : false} style={{ cursor:'pointer', display: 'inline' }} onClick={ () => onDecrement(country.id, color) }value={"-"} />
                </React.Fragment>
            }
        </div>
    );
}

export default MedalNoMui;