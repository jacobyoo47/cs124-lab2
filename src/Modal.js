import {useState} from "react";
import {FaRegWindowClose} from 'react-icons/fa';
import './Modal.css'
import Icon from "./Icon";


function Modal(props) {
    const [text, setText] = useState(props.textInputValue);

    return (
        <div className="modal">
            <div className="content">
                <div className="header">
                    <h4 className="title">{props.title}</h4>
                    <Icon buttonStyling="modal-close-button" onClick={() => {
                        props.onClose();
                    }}>
                        <FaRegWindowClose/>
                    </Icon>
                </div>
                <div className="body">
                    <p>Item Name</p>
                    <input className="modal-input" type="text" name="text" placeholder={props.textInputValue} onChange={(event) => {
                        setText(event.target.value);
                    }}/>
                </div>
                <div className="footer">
                    <Icon buttonStyling="modal-save-button" text="Save Item" onClick={() => {
                        props.onSave(text);
                    }}>
                    </Icon>
                    <Icon buttonStyling="modal-cancel-button" text="Cancel" onClick={() => {
                        props.onClose();
                    }}>
                    </Icon>
                </div>
            </div>
        </div>
    );
}

export default Modal;