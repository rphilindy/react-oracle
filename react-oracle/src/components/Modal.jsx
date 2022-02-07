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
    </div>
    </div>
  </div>;


}
