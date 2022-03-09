import {useState} from "react";
import {FaRegWindowClose} from 'react-icons/fa';
import './Modal.css'
import Icon from "./Icon";


function Modal(props) {
    const [text, setText] = useState(props.textInputValue);
    const [priority, setPriority] = useState(props.priorityInputValue);

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
                    <p>Priority</p>
                    <select className="modal-input" name="priority" value={props.priorityInputValue} onChange={(event) => {
                        setPriority(parseInt(event.target.value));
                    }}>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                </div>
                <div className="footer">
                    <Icon buttonStyling="modal-save-button" text="Save Item" onClick={() => {
                        props.onSave(text, priority);
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