function Dropdown(props) {
    return (
        <>
            <label>{props.menuLabel}
                <select name={props.menuName} id={props.menuName} onChange={(e) => props.onSelectItem(e.target.value)}>
                    {props.options.map(o => <option value={o}>{o}</option>)}
                </select>
            </label>
        </>
    )
}

export default Dropdown;