import {useState} from 'react';
import {FaPlusCircle} from 'react-icons/fa';
import './App.css';
import Title from './Title';
import ButtonContainer from './ButtonContainer';
import Button from './Button';
import List from './List';
import ListItem from './ListItem';
import Icon from './Icon';
import Modal from './Modal';

// Enum for mode of which list items to show
const ShowState = {
    All: 'All',
    Completed: 'Completed',
    Uncompleted: 'Uncompleted',
}

// Provide next show state given current show state
const NextShowState = {
    All: 'Completed',
    Completed: 'Uncompleted',
    Uncompleted: 'All',
}

function App(props) {
    const [data, setData] = useState(props.initialData);

    const [showState, setShowState] = useState(ShowState.All);
    const shouldShow = (item) => {
        if (showState === ShowState.All) {
            return true;
        } else if (showState === ShowState.Completed) {
            return item.completed;
        } else {
            return !item.completed;
        }
    }

    // Counter used for unique list item ids
    // Increment every time a list item is added
    const [counter, setCounter] = useState(500);

    const [showModal, setShowModal] = useState(false);

    // Change between showing non-completed items vs. all items
    const onShowToggle = () => {
        setShowState(NextShowState[showState]);
    }

    // Remove completed items
    const onRemoveCompleted = () => {
        setData(data.filter((item) => !item.completed));
    }

    // Add item
    const onAddItem = (text) => {
        setData(data.concat([{id: counter, text: text, completed: false}]));
        setCounter(counter + 1);
    }

    // Delete item by id
    const onDeleteItem = (id) => {
        setData(data.filter((item) => item.id !== id));
    }

    // Edit item
    const onEditItem = (id, text, completed) => {
        setData(data.map((item) => {
            if (item.id === id) {
                item.text = text;
                item.completed = completed;
            }
            return item;
        }));
    }

    return (
        <div className="App">
            <Title/>
            <ButtonContainer>
                <Button text={`Show: ${showState}`} onClick={onShowToggle}/>
                <Button text="Remove Completed" onClick={onRemoveCompleted}/>
            </ButtonContainer>
            <List>
                {data.filter((item) => shouldShow(item)).map((item2) =>
                    <ListItem
                        key={item2.id}
                        text={item2.text}
                        completed={item2.completed}
                        id={item2.id}
                        onDeleteItem={onDeleteItem}
                        onEditItem={onEditItem}
                    />
                )}
            </List>
            <Icon onClick={() => {
                setShowModal(true);
            }}>
                <FaPlusCircle/>
            </Icon>
            {showModal && <Modal title="Add New List Item" textInputValue={"New Item Name"} onClose={() => {
                setShowModal(false);
            }} onSave={(text) => {
                onAddItem(text);
                setShowModal(false);
            }}/>}
        </div>
    );
}

export default App;
