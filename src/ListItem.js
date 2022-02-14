import Icon from './Icon';
import { FaEdit } from 'react-icons/fa';
import { FaTrashAlt } from 'react-icons/fa';

function ListItem(props) {
    return (
        <div>
            <input type="checkbox" checked={props.completed} onChange={() => {props.onEditItem(props.id, props.text, !props.completed)}}/>
            <span>{`Text: ${props.text}`}</span>
            <span>{`Completed: ${props.completed}`}</span>
            <Icon onClick={() => {props.onEditItem(props.id, props.text, props.completed)}}>
                <FaEdit/>
            </Icon>
            <Icon onClick={() => {props.onDeleteItem(props.id)}}>
                <FaTrashAlt/>
            </Icon>
        </div>
    );
}

export default ListItem;