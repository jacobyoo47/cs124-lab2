import {FaRegWindowClose} from 'react-icons/fa';
import './Modal.css'
import Icon from "./Icon";

function Confirmation(props) {
    // TODO: Need to style this better since the confirm/cancel buttons are too high up.
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
                    {props.body}
                </div>
                <div className="footer">
                    <Icon buttonStyling="modal-save-button" text="Delete Item(s)" onClick={() => {
                        props.onConfirm();
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

export default Confirmation;