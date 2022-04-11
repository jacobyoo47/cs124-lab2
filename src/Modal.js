import {FaRegWindowClose} from 'react-icons/fa';
import './Modal.css'


function Modal(props) {
    return (
        <div className="modal">
            <div className="content">
                <div className="header">
                    <h4 className="title">{props.title}</h4>
                    <button autoFocus className="modal-close-button" aria-label={props.cancelText} onClick={() => {
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
    );
}

export default Modal;