function Icon(props) {
    return (
        <button onClick={props.onClick}>
            {props.text}
            {props.children}
        </button>
    );
}

export default Icon;