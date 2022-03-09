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
import { initializeApp } from "firebase/app";
import { getFirestore, query, collection, doc, setDoc, updateDoc, deleteDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { generateUniqueID } from "web-vitals/dist/modules/lib/generateUniqueID";

const firebaseConfig = {
    apiKey: "AIzaSyDTdxmHJT6utYagkotNRpMLF-EmRhcSYWw",
    authDomain: "cs124-lab3-d4101.firebaseapp.com",
    projectId: "cs124-lab3-d4101",
    storageBucket: "cs124-lab3-d4101.appspot.com",
    messagingSenderId: "78965801208",
    appId: "1:78965801208:web:e72bd3c413b6b54b10bb0d"
  };

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const collectionName = "Users";
const subcollectionName = "Items";
// Eventually will change once we add functionality for multiple users
// For now, have one global user for all list items
const userDocumentName = "User";
const fullCollectionPath = `${collectionName}/${userDocumentName}/${subcollectionName}`;

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

// Enum for sort condition
// First element is field, second element is ascending/descending
const SortBy = {
    Created_ASC: "Created_ASC",
    Created_DESC: "Created_DESC",
    Priority_ASC: "Priority_ASC",
    Priority_DESC: "Priority_DESC",
}
// Provide next filter state given current filter state
const NextSortBy = {
    Created_ASC: 'Created_DESC',
    Created_DESC: 'Priority_ASC',
    Priority_ASC: 'Priority_DESC',
    Priority_DESC: 'Created_ASC',
}

function App(props) {
    const [sort, setSort] = useState(SortBy.Created_ASC);
    const sortArr = sort.split("_");
    // Extract field and asc/desc order
    const sortField = sortArr[0].toLowerCase();
    const sortOrder = sortArr[1].toLowerCase();

    // TODO: Change to local sort possibly?
    // When user toggles sort, there is a flash of loading which may be annoying
    const q = query(collection(db, fullCollectionPath), orderBy(sortField, sortOrder));
    const [data, loading, error] = useCollectionData(q);

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

    const [showModal, setShowModal] = useState(false);

    // Change between showing non-completed items vs. all items
    const onToggleShow = () => {
        setShowState(NextShowState[showState]);
    }

    // Change what items are sorted by
    const onToggleSort = () => {
        setSort(NextSortBy[sort]);
    }

    // Remove completed items
    const onRemoveCompleted = () => {
        data.forEach((item) => {
            if (item.completed) {
                deleteDoc(doc(db, fullCollectionPath, item.id));
            }
        });
    }

    // Add item
    const onAddItem = (text, priority) => {
        const id = generateUniqueID();
        setDoc(doc(db, fullCollectionPath, id), {
            id: id,
            text: text,
            completed: false,
            priority: priority,
            created: serverTimestamp(),
        });
    }

    // Delete item by id
    const onDeleteItem = (id) => {
        deleteDoc(doc(db, fullCollectionPath, id));
    }

    // Edit item
    const onEditItem = (id, text, completed, priority) => {
        updateDoc(doc(db, fullCollectionPath, id), {
           text: text,
           completed: completed,
           priority: priority,
        });
    }

    // TODO: add loading spinner and error message below
    return (
        <div className="App">
            <Title/>
            <ButtonContainer>
                <Button text={`Show: ${showState}`} onClick={onToggleShow}/>
                <Button text={`Sort: ${sortField} ${sortOrder}`} onClick={onToggleSort}/>
                <Button text="Remove Completed" onClick={onRemoveCompleted}/>
            </ButtonContainer>
            {!loading && !error &&
                <>
                    <List>
                        {data.filter((item) => shouldShow(item)).map((item2) =>
                            <ListItem
                                key={item2.id}
                                id={item2.id}
                                text={item2.text}
                                completed={item2.completed}
                                priority={item2.priority}
                                onDeleteItem={onDeleteItem}
                                onEditItem={onEditItem}
                            />
                        )}
                    </List>
                    <Icon buttonStyling="todo-add-button" onClick={() => {
                        setShowModal(true);
                    }}>
                        <FaPlusCircle/>
                    </Icon>
                    {showModal && <Modal title="Add New List Item" textInputValue={"New Item Name"} priorityInputValue={0} onClose={() => {
                        setShowModal(false);
                    }} onSave={(text, priority) => {
                        onAddItem(text, priority);
                        setShowModal(false);
                    }}/>}
                </>
            }
            {loading && <h1>LOADING!!!</h1>}
            {error && <h1>ERROR!!!</h1>}
        </div>
    );
}

export default App;
