import Modal from "./Modal";
import {useState} from 'react';

function AddEditItemModal(props) {
    const [text, setText] = useState(props.text);
    const [priority, setPriority] = useState(props.priority);

    return (
        <Modal
            title={props.title}
            confirmText="Save Item"
            cancelText="Cancel"
            onCancel={() => {
                props.onCancel();
            }}
            onConfirm={() => {
                props.onConfirm(text, priority);
            }}
        >
        <p>Item Name</p>
        <input autoFocus className="modal-input" type="text" name="text" placeholder={text}
            onChange={(event) => {
                setText(event.target.value);
            }}
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    props.onConfirm(text, priority);
                }
            }}
        />
        <p>Priority</p>
        <select className="modal-input" name="priority" value={priority} onChange={(event) => {
            setPriority(event.target.value);
        }}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
        </select>
    </Modal>
    )
}

export default AddEditItemModal;