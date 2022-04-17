import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListSubheader from '@mui/material/ListSubheader';

const getKeyValueOptions = (data) => {
    return data.map(list =>
        <MenuItem
            value={list.listId}
            key={list.listId}
            aria-label={list.listName}
        >
            {list.listName}
        </MenuItem>)
}

function GroupedDropdown(props) {
    return (
        <div className={props.selectClass}>
            <FormControl variant="standard" sx={{ maxWidth: props.dropdownWidth }}>
                <InputLabel id={props.menuName}>{props.menuLabel}</InputLabel>
                <Select
                    labelId={props.menuName}
                    name={props.menuName}
                    value={props.menuState}
                    onChange={(e) => props.onSelectItem(e.target.value)}
                >
                    <ListSubheader>My Lists</ListSubheader>
                    {getKeyValueOptions(props.data1)}
                    <ListSubheader>Shared Lists</ListSubheader>
                    {getKeyValueOptions(props.data2)}
                </Select>
            </FormControl>
        </div>
    )
}

export default GroupedDropdown;