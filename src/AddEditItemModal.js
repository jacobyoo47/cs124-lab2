import Modal from "./Modal";
import {useState} from 'react';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

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
            <FormControl variant="standard" sx={{ m: 1, width: 200, paddingBottom: 1 }}>
                <TextField autoFocus id="task-name-input" label="Task Name" variant="standard" value={text} onChange={(event) => {
                        setText(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            props.onConfirm(text, priority);
                        }
                }}/>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, width: 200 }}>
                <InputLabel id="priority">Priority</InputLabel>
                <Select
                    label="Priority"
                    // className="todo-list-dropdown-select"
                    name="priority"
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                </Select>
            </FormControl>
        </Modal>
    )
}

export default AddEditItemModal;