import Modal from "./Modal";

function SignOutModal(props) {
    return (
        <Modal
            title={props.title}
            confirmText="OK"
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

export default SignOutModal;