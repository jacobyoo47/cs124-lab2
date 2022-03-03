import Icon from './Icon';
import {FaEdit} from 'react-icons/fa';
import {FaTrashAlt} from 'react-icons/fa';
import {useState} from 'react';
import Modal from './Modal';

function ListItem(props) {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="todo-task">
            <input type="checkbox" className="todo-task-checkbox" checked={props.completed} onChange={() => {
                props.onEditItem(props.id, props.text, !props.completed)
            }}/>
            <span className="todo-task-name">{`${props.text}`}</span>
            <div className="todo-item-buttons-container">
                <Icon buttonStyling="todo-edit-button" onClick={() => {
                    setShowModal(true);
                }}>
                    <FaEdit />
                </Icon>
                <Icon buttonStyling="todo-delete-button" onClick={() => {
                    props.onDeleteItem(props.id);
                }}>
                    <FaTrashAlt />
                </Icon>
            </div>
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