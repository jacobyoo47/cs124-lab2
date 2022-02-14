function ListItem(props) {
    return (
        <div>
            <span>{`Text: ${props.text}`}</span>
            <span>{`Completed: ${props.completed}`}</span>
        </div>
    );
}

export default ListItem;