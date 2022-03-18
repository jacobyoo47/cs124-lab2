import Modal from "./Modal";
import {useState} from 'react';

function AddEditListModal(props) {
    const [name, setName] = useState(props.name);

    return (
        <Modal
            title={props.title}
            confirmText="Save List"
            cancelText="Cancel"
            onCancel={() => {
                props.onCancel();
            }}
            onConfirm={() => {
                props.onConfirm(name);
            }}
        >
        <p>List Name</p>
        <input autoFocus className="modal-input" type="text" name="text" placeholder={name}
            onChange={(event) => {
                setName(event.target.value);
            }}
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    props.onConfirm(name);
                }
            }}
        />
    </Modal>
    )
}

export default AddEditListModal;