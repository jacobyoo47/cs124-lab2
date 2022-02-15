import Icon from './Icon';
import {FaEdit} from 'react-icons/fa';
import {FaTrashAlt} from 'react-icons/fa';
import {useState} from 'react';
import Modal from './Modal';

function ListItem(props) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div>
            <input type="checkbox" checked={props.completed} onChange={() => {
                props.onEditItem(props.id, props.text, !props.completed)
            }}/>
            <span>{`Text: ${props.text}`}</span>
            <span>{`Completed: ${props.completed}`}</span>
            <Icon onClick={() => {
                setShowModal(true);
            }}>
                <FaEdit/>
            </Icon>
            <Icon onClick={() => {
                props.onDeleteItem(props.id);
            }}>
                <FaTrashAlt/>
            </Icon>
            {showModal &&
                <Modal
                    title="Edit List Item"
                    textInputValue={props.text}
                    onClose={() => {
                        setShowModal(false);
                    }}
                    onSave={(text) => {
                        props.onEditItem(props.id, text, props.completed);
                        setShowModal(false);
                    }}
                />}
        </div>
    );
}

export default ListItem;