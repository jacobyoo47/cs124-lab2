import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

function Dropdown(props) {
    return (
        <>
            <FormControl variant="standard" sx={{ maxWidth: 200 }}>
                <InputLabel id={props.menuName}>{props.menuLabel}</InputLabel>
                <Select
                    label={props.menuName}
                    // className="todo-list-dropdown-select"
                    name={props.menuName}
                    id={props.menuName}
                    value={props.menuState}
                    onChange={(e) => props.onSelectItem(e.target.value)}
                >
                    {props.options.map(o => <MenuItem value={o} key={o}>{o}</MenuItem>)}
                </Select>
            </FormControl>
        </>
    )
}

export default Dropdown;