function Button(props) {
    return <button className="todo-text todo-button" onClick={props.onClick}>{props.text}</button>;
}

export default Button;