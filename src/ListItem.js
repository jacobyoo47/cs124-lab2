import Icon from './Icon';
import {FaEdit} from 'react-icons/fa';
import {FaTrashAlt} from 'react-icons/fa';
import {useState} from 'react';
import Modal from './Modal';
import Confirmation from './Confirmation';

// Get color from priority
const PriorityToColor = {
    "Low": "green",
    "Medium": "orange",
    "High": "red",
}

// Get priority from number
const NumberToPriority = {
    0: "Low",
    1: "Medium",
    2: "High",
}

// Get number from priority
export const PriorityToNumber = {
    "Low": 0,
    "Medium": 1,
    "High": 2,
}

function ListItem(props) {
    const [showModal, setShowModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    return (
        <>
            <div className={`todo-task ${props.completed ? "completed" : ""}`}>
                <div className={`todo-task-priority-tab ${PriorityToColor[NumberToPriority[props.priority]]}`}></div>
                <input type="checkbox" className="todo-task-checkbox" checked={props.completed} onChange={() => {
                    props.onEditItem(props.id, props.text, !props.completed, props.priority)
                }}/>
                <span className="todo-task-name">{`${props.text}`}</span>
                <div className="todo-item-buttons-container">
                    <Icon buttonStyling="todo-edit-button" onClick={() => {
                        setShowModal(true);
                    }}>
                        <FaEdit />
                    </Icon>
                    <Icon buttonStyling="todo-delete-button" onClick={() => {
                        setShowConfirmation(true);
                    }}>
                        <FaTrashAlt />
                    </Icon>
                </div>
            </div>
            {showModal &&
                <Modal
                    title="Edit List Item"
                    textInputValue={props.text}
                    priorityInputValue={NumberToPriority[props.priority]}
                    onClose={() => {
                        setShowModal(false);
                    }}
                    onSave={(text, priority) => {
                        props.onEditItem(props.id, text, props.completed, PriorityToNumber[priority]);
                        setShowModal(false);
                    }}
                />
            }
            {showConfirmation &&
                <Confirmation
                    title="Delete Item(s)"
                    body="Are you sure you want to delete 1 item?"
                    onClose={() => {
                        setShowConfirmation(false);
                    }}
                    onConfirm={() => {
                        props.onDeleteItem(props.id);
                        setShowConfirmation(false);
                    }}
                />
            }
        </>
    );
}

export default ListItem;