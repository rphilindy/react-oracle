//alert modal for this app

import React, {useCallback, useEffect} from 'react';
import '../styles/modal.css';

export default function Modal(props) {


  
    let {heading, content, buttons} = props;
    const handleCloseClick = props.handleCloseClick || (()=>{});
    

    if (!heading || heading === '') heading=<span>&nbsp;</span>;
    if(!buttons) buttons=[{isClose: true, text: 'OK', isAutoFocus: true}];

    const escFunction = useCallback((event) => {
      if (event.key === "Escape") {
        handleCloseClick();
      }
    }, []);

    useEffect(() => {
      document.addEventListener("keydown", escFunction, false);
  
      return () => {
        document.removeEventListener("keydown", escFunction, false);
      };
    }, []);


    return <div className="modal-container">
    <div>
      <div className="modal-header">
        <span className="modal-close-btn" onClick={handleCloseClick}>&times;</span>
        <div>{heading}</div>
      </div>
      <div className="modal-content-button-container">
        <div className="modal-content">{content}</div>
        <center>
          {buttons.map((b, i)=>{ 
            const onClick = () => {
              if(b.onClick) b.onClick();
              if(b.isClose) handleCloseClick();
            };
            const disabled=b.disabled?b.disabled:false;
            return <button key={i} className="modal-button" onClick={onClick} autoFocus={b.isAutoFocus} disabled={disabled}>{b.text}</button>
          })}
        </center>
      </div>
    </div>
  </div>;


}
