function Icon(props) {
    return (
        <button className={props.buttonStyling} onClick={props.onClick}>
            {props.text}
            {props.children}
        </button>
    );
}

export default Icon;