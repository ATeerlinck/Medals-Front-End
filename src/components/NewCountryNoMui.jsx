import React, { useState } from 'react';
 
const NewCountryNoMui = (props) => {
    const {onAdd} = props;
    const handleClick = () => {
        const name = prompt("Enter a country");
        if (name.trim().length > 0) {
            onAdd(name);
        } 
    }
        return (
            <div className='Country' style={{ margin: 'auto', display: 'block'}}>
                <button onClick={ handleClick }>New Country</button>
            </div>
        );
    }

export default NewCountryNoMui