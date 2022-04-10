import Modal from "./Modal";

function DeleteModal(props) {
    return (
        <Modal
            title={props.title}
            confirmText="Delete"
            cancelText="Cancel"
            onCancel={() => {
                props.onCancel();
            }}
            onConfirm={() => {
                props.onConfirm();
            }}
        >
            {props.text}
        </Modal>
    )
}

export default DeleteModal;