import Modal from "./Modal";
import {useState} from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import SharedEmailItem from './SharedEmailItem';

function ShareModal(props) {
    const [email, setEmail] = useState("");

    return (
        <Modal
            title={props.title}
            confirmText="Share"
            cancelText="Cancel"
            onCancel={() => {
                props.onCancel();
            }}
            onConfirm={() => {
                props.onConfirm(email);
            }}
        >
            <div className="modal-shared-email-list">
                <div>Share additional email:</div>
                <FormControl variant="standard" sx={{ m: 1, width: 200, paddingBottom: 1 }}>
                    <TextField autoFocus id="email-input" label="email" variant="standard" value={email} onChange={(event) => {
                            setEmail(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                props.onConfirm(email);
                            }
                    }}/>
                </FormControl>
                <div>Currently shared with the following emails:</div>
                {!props.sharedWith.length && <div>None</div>}
                {props.sharedWith.map(email =>
                    <SharedEmailItem
                        email={email}
                        list={props.list}
                        key={email}
                        onDeleteItem={(email) => {
                            props.onDeleteItem(email);
                        }}
                    />
                )}
                <br></br>
            </div>


        </Modal>
    )
}

export default ShareModal;