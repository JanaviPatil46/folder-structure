import React, { useState } from 'react';
import { BsThreeDotsVertical } from "react-icons/bs";
import './optionsMenu.css';
const OptionsMenu = () => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className="options-menu">
      <div className="three-dots-icon" onClick={toggleOptions}>
      <BsThreeDotsVertical />
      </div>

      {showOptions && (
        <div className="options-dropdown">
          <button onClick={() => console.log('Delete clicked')}>Delete</button>
          <button onClick={() => console.log('Upload clicked')}>Upload</button>
          <button onClick={() => console.log('Download clicked')}>Download</button>
        </div>
      )}
    </div>
  );
};

export default OptionsMenu;
