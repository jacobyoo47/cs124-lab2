function Dropdown(props) {
    return (
        <>
            <label>{props.menuLabel}
                <select className="todo-list-dropdown-select" name={props.menuName} id={props.menuName} value={props.menuState} onChange={(e) => props.onSelectItem(e.target.value)}>
                    {props.options.map(o => <option value={o} key={o}>{o}</option>)}
                </select>
            </label>
        </>
    )
}

export default Dropdown;