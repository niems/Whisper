import React from 'react';
import './style/no_selection.css';

const NoSelection = (props) => {
    
    return (
        <div id='no-selection-container'>

            <div id='no-selection-pane'>
                <h4 className='no-selection-text'>No channel selected</h4>
            </div>
            
        </div>
    );
}

export default NoSelection;