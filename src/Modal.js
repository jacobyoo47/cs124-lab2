import {FaRegWindowClose} from 'react-icons/fa';
import FocusTrap from 'focus-trap-react'
import './Modal.css'


function Modal(props) {
    return (
        <FocusTrap>
            <div className="modal">
                <div className="content">
                    <div className="header">
                        <h4 className="title">{props.title}</h4>
                        <button className="modal-close-button" onClick={() => {
                            props.onCancel();
                        }}>
                            <FaRegWindowClose/>
                        </button>
                    </div>
                    <div className="body">
                        {props.children}
                    </div>
                    <div className="footer">
                        <button className="modal-confirm-button" onClick={() => {
                            props.onConfirm();
                        }}>
                            {props.confirmText}
                        </button>
                        <button className="modal-cancel-button" onClick={() => {
                            props.onCancel();
                        }}>
                            {props.cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </FocusTrap>
    );
}

export default Modal;