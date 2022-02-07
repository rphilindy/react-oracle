//alert modal for this app

import React, {useState, useRef, useEffect} from 'react';
import {Editor, EditorState, ContentState, SelectionState, Modifier, getDefaultKeyBinding} from 'draft-js';
import 'draft-js/dist/Draft.css';
import '../styles/sql-editor.css';

export default function SqlEditor(props) {

    const handleGetMethods = props.handleGetMethods || (()=>{});


    const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText("select * from dual"))); 
    const lastFocusedSelection = useRef(null);
    const blurredSelectionShown = useRef(false);
    const errorSelectionShown = useRef(false);
    const TAB_SIZE = 4;
    
    //todo: can't we write this into css? https://dev.to/tumee/how-to-style-draft-js-editor-3da2
    const customStyleMap = {
        'SELECTED': {
          background: '#aaa',
          color: 'black',
        },
        'ERROR': {
          background: '#faa',
          color: 'black',
        },
      };
  
    //send function pointers back to parent. apparently this needs to be done on every useEffect
    useEffect(()=>handleGetMethods({getSqlAndStart, highlightErrorAtPosition}));

    return <div className="sql-editor-container">
        <Editor 
            customStyleMap={customStyleMap}        
            editorState={editorState} 
            onChange={handleEditorStateChange} 
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
        />
    </div>;

    //any state change to draft-js editor
    function handleEditorStateChange(newEditorState){

        //remember the selection when the editor has focus
        //also remove the selection indication
        const selectionState=newEditorState.getSelection();
        if(selectionState.hasFocus) {
            lastFocusedSelection.current = selectionState;
            removeSelectedOnFocus();
        }

        //all roads must lead here
        setEditorState(newEditorState);

        if(!selectionState.hasFocus)
            showSelectedOnBlur();
        else
            removeHighlightedError(); //todo: this removes error selection on focus. can we do it when key pressed?

        
    }



    //intercept the tab key... logic in handleKeyCommand
    function keyBindingFn(e)  {

        if (e.keyCode === 9 && !e.shiftKey) 
        return 'tab_command';
        if (e.keyCode === 9 && e.shiftKey) 
        return 'shift_tab_command';

        return getDefaultKeyBinding(e);
    }
    
    //process tab key actions - only called when an intercetped key is pressed
    function handleKeyCommand(command) {

    if (command === 'tab_command') {
        indent();
        return 'handled';
    }

    if (command === 'shift_tab_command') {
        outdent();
        return 'handled';
    }

    return 'not-handled'; 
    }
    
    //tab key indent
    function indent() {

        let contentState = editorState.getCurrentContent();
        const selectionState = lastFocusedSelection.current;
        const startKey = selectionState.getStartKey();
        const endKey = selectionState.getEndKey();
        let key = startKey;
        let block = contentState.getBlockForKey(key);
        let newStartSelection, newEndSelection;
        
        while(true) {

            //where will we add chars
            const insertPoint = key === startKey ? selectionState.getStartOffset() : 0;

            //how many will we add (go to next tab)    
            const insertChars = TAB_SIZE - (insertPoint % TAB_SIZE);

            //insert at the insert point
            const blockSelection = SelectionState.createEmpty(key).merge({anchorOffset: insertPoint, focusOffset: insertPoint});
            contentState = Modifier.replaceText(contentState, blockSelection, ('').padEnd(insertChars, ' '));

            //new start point for force selection
            if(key === startKey)
                newStartSelection = SelectionState.createEmpty(key).merge({anchorOffset: insertPoint + insertChars, focusOffset: insertPoint + insertChars, hasFocus: true}); // make sure final sel hasFocus

            //new start point for force selection
            if(key === endKey)
                newEndSelection = SelectionState.createEmpty(key).merge({anchorOffset: selectionState.getEndOffset(), focusOffset: selectionState.getEndOffset() + insertChars}); 

            //quit loop    
            if(key === endKey) 
                break;

            block = contentState.getBlockAfter(key);
            key = block.key;
        }

        //new selection
        const newSelection = SelectionState.createEmpty(startKey).merge({anchorKey: startKey, anchorOffset: newStartSelection.anchorOffset, focusKey: endKey, focusOffset: newEndSelection.focusOffset, hasFocus: true}); //must have focuse for update of lastFocusedSelection

        //apply the content state and allow undo
        let newEditorState = EditorState.push(editorState, contentState, 'change-block-data');
        newEditorState = EditorState.forceSelection(newEditorState, newSelection);
        setEditorState(newEditorState);
        handleEditorStateChange(newEditorState);
    }

    //todo - shift-tab outdent
    function outdent(){

    }

    function showSelectedOnBlur() {

        setTimeout(()=>{

            //saved selection 
            const selectionState = lastFocusedSelection.current;

            //if nothing selected, return
            if(selectionState.getStartKey() === selectionState.getEndKey() && selectionState.getAnchorOffset() === selectionState.getFocusOffset())
                return;

            let contentState = editorState.getCurrentContent();
            contentState = Modifier.applyInlineStyle(contentState, selectionState, 'SELECTED');    
            let newEditorState = EditorState.createWithContent(contentState);
            setEditorState(newEditorState); //no undo
            blurredSelectionShown.current = true;
        
        }, 1);
    }

    function removeSelectedOnFocus() {

        if(!blurredSelectionShown.current)
        return;

        setTimeout(()=>{

            let contentState = editorState.getCurrentContent();
            const firstBlock = contentState.getFirstBlock();
            const lastBlock = contentState.getLastBlock();
            const fullContentSelection = new SelectionState({
                anchorKey: firstBlock.key,
                anchorOffset: 0,
                focusKey: lastBlock.key,
                focusOffset: lastBlock.text.length,
                isBackward: false,
            }); 

            contentState = Modifier.removeInlineStyle(contentState, fullContentSelection, 'SELECTED');    
            let newEditorState = EditorState.createWithContent(contentState);
            newEditorState = EditorState.forceSelection(newEditorState, lastFocusedSelection.current);
            setEditorState(newEditorState); //no undo
            blurredSelectionShown.current = false;
        },300);
    }

    function getSqlAndStart() {


        const contentState = editorState.getCurrentContent();
        const selectionState = lastFocusedSelection.current;
        const startKey = selectionState.getStartKey();
        const startOffset = selectionState.getStartOffset();
        const endKey = selectionState.getEndKey();
        const endOffset = selectionState.getEndOffset();
        let startPos = 0;  
        let sql;
    
        let block = contentState.getFirstBlock();
  
        while(block.key !== startKey){
          startPos += block.text.length + 1;
          block=contentState.getBlockAfter(block.key); 
        }
  
        startPos += startOffset;
        sql = block.text.substring(startOffset);
        if(endKey === startKey)
            sql = sql.substring(0, endOffset - startOffset);
        else {
            sql += "\n";

            block=contentState.getBlockAfter(block.key);
  
            while(block.key !== endKey){
                sql += block.text + "\n";
                block=contentState.getBlockAfter(block.key); 
            }
      
            sql += block.text.substring(0,endOffset);
        }
  

        if(selectionState.getStartKey() === selectionState.getEndKey() && selectionState.getAnchorOffset() === selectionState.getFocusOffset())
             sql = editorState.getCurrentContent().getPlainText();

        return {sql, startPos};
    }
    
    function highlightErrorAtPosition(pos) {
        
        setTimeout(()=>{
            let contentState = editorState.getCurrentContent();
            let block = contentState.getFirstBlock();
            let len = 0;
            while(len + block.text.length < pos){
            len = len + block.text.length + 1;
            block=contentState.getBlockAfter(block.key); 
            }

            let sql = block.text.substring(pos - len) + ' ';
            sql = sql.split(/[\s;]/)[0];


            //saved selection && full selection
            const firstBlock = contentState.getFirstBlock();
            const lastBlock = contentState.getLastBlock();
            const selectionState = new SelectionState({anchorKey: block.key, anchorOffset: pos - len, focusKey: block.key, focusOffset: pos - len + sql.length});
            const fullContentSelection = new SelectionState({
                anchorKey: firstBlock.key,
                anchorOffset: 0,
                focusKey: lastBlock.key,
                focusOffset: lastBlock.text.length,
                isBackward: false,
            }); 

            contentState = Modifier.removeInlineStyle(contentState, fullContentSelection, 'ERROR');    
            contentState = Modifier.applyInlineStyle(contentState, selectionState, 'ERROR');    
            let newEditorState = EditorState.createWithContent(contentState);
            setEditorState(newEditorState); //no undo
            errorSelectionShown.current = true;
        
        }, 1);
        
        
    }

    function removeHighlightedError() {

        if(!errorSelectionShown.current)
            return;
        setTimeout(()=>{
            const sel = lastFocusedSelection.current;

            let contentState = editorState.getCurrentContent();
            let firstBlock = contentState.getFirstBlock();
            let lastBlock = contentState.getLastBlock();
            const fullContentSelection = new SelectionState({
                anchorKey: firstBlock.key,
                anchorOffset: 0,
                focusKey: lastBlock.key,
                focusOffset: lastBlock.text.length,
                isBackward: false,
            }); 

            contentState = Modifier.removeInlineStyle(contentState, fullContentSelection, 'ERROR');    
            let newEditorState = EditorState.createWithContent(contentState);
            newEditorState = EditorState.forceSelection(newEditorState, sel);
            setEditorState(newEditorState); //no undo
            errorSelectionShown.current = false;
        },300);
    }

}
