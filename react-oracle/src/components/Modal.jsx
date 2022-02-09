//alert modal for this app

import React from 'react';
import '../styles/modal.css';

export default function Modal(props) {

    const {heading, content} = props;
    const handleCloseClick = props.handleCloseClick || (()=>{});

    return <div className="modal-container">
    <div>
      <div className="modal-header">
        <span className="modal-close-btn" onClick={handleCloseClick}>&times;</span>
        <div>{heading}</div>
      </div>
      <div className="modal-content">
        <p>{content}</p>
        <center>
          <button className="modal-button modal-button-ok" onClick={handleCloseClick} autoFocus={true}>OK</button>
        </center>
      </div>
    </div>
  </div>;


}
