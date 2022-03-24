import Modal from "./Modal";
import {useState} from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

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
            <FormControl variant="standard" sx={{ m: 1, width: 200, paddingBottom: 1 }}>
                <TextField autoFocus id="list-name-input" label="List Name" variant="standard" value={name} onChange={(event) => {
                        setName(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            props.onConfirm(name);
                        }
                }}/>
            </FormControl>
        </Modal>
    )
}

export default AddEditListModal;