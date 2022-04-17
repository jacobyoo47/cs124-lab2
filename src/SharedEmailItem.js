import {FaTrashAlt} from 'react-icons/fa';
import {useState} from 'react';
import DeleteModal from './DeleteModal';

function SharedEmailItem(props) {
    const [showDeleteEmailModal, setShowDeleteEmailModal] = useState(false);

    return (
        <>
            <div className={`todo-task`}>
                <span className="todo-task-name">{`${props.email}`}</span>
                <div className="todo-item-buttons-container">
                    <button className="todo-delete-button" aria-label={`stop sharing list named "${props.list}" with ${props.email}`} onClick={() => {
                        setShowDeleteEmailModal(true);
                    }}>
                        <FaTrashAlt />
                    </button>
                </div>
            </div>
            {showDeleteEmailModal &&
                <DeleteModal
                    title="Stop Sharing"
                    text={`Are you sure you want to stop sharing list named "${props.list}" with ${props.email}?`}
                    onCancel={() => {
                        setShowDeleteEmailModal(false);
                    }}
                    onConfirm={() => {
                        props.onDeleteItem(props.email);
                        setShowDeleteEmailModal(false);
                    }}
                />
            }
        </>
    );
}

export default SharedEmailItem;