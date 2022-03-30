import {FaEdit} from 'react-icons/fa';
import {FaTrashAlt} from 'react-icons/fa';
import {useState} from 'react';
import AddEditItemModal from './AddEditItemModal';
import Modal from './Modal';

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
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);

    return (
        <>
            <div className={`todo-task ${props.completed ? "completed" : ""}`}>
                <div className={`todo-task-priority-tab ${PriorityToColor[NumberToPriority[props.priority]]}`}></div>
                <input type="checkbox" className="todo-task-checkbox" checked={props.completed} onChange={() => {
                    props.onEditItem(props.id, props.text, !props.completed, props.priority)
                }}/>
                <span className="todo-task-name">{`${props.text}`}</span>
                <div className="todo-item-buttons-container">
                    <button className="todo-edit-button" onClick={() => {
                        setShowEditItemModal(true);
                    }}>
                        <FaEdit />
                    </button>
                    <button className="todo-delete-button" onClick={() => {
                        setShowDeleteItemModal(true);
                    }}>
                        <FaTrashAlt />
                    </button>
                </div>
            </div>
            {showEditItemModal &&
                <AddEditItemModal
                    title="Edit List Item"
                    text={props.text}
                    priority={NumberToPriority[props.priority]}
                    onCancel={() => {
                        setShowEditItemModal(false);
                    }}
                    onConfirm={(text, priority) => {
                        props.onEditItem(props.id, text, props.completed, PriorityToNumber[priority]);
                        setShowEditItemModal(false);
                    }}
                />
            }
            {showDeleteItemModal &&
                <Modal
                    title="Delete Item(s)"
                    confirmText="Delete"
                    cancelText="Cancel"
                    onCancel={() => {
                        setShowDeleteItemModal(false);
                    }}
                    onConfirm={() => {
                        props.onDeleteItem(props.id);
                        setShowDeleteItemModal(false);
                    }}
                >
                    "Are you sure you want to delete 1 item?"
                </Modal>
            }
        </>
    );
}

export default ListItem;