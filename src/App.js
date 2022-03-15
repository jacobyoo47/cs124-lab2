import {useState} from 'react';
import {FaPlusCircle, FaUndo} from 'react-icons/fa';
import './App.css';
import Title from './Title';
import ButtonContainer from './ButtonContainer';
import Button from './Button';
import Dropdown from './Dropdown';
import List from './List';
import ListItem from './ListItem';
import Icon from './Icon';
import Modal from './Modal';
import { initializeApp } from "firebase/app";
import { getFirestore, query, collection, doc, setDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, writeBatch } from "firebase/firestore";
import { useCollectionData, useDocumentData} from "react-firebase-hooks/firestore";
import { generateUniqueID } from "web-vitals/dist/modules/lib/generateUniqueID";
import Confirmation from './Confirmation';
import { PriorityToNumber } from './ListItem';

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
// Eventually will change once we add functionality for multiple users
// For now, have one global user for all list items
const userDocumentName = "User";
const collectionPath = `${collectionName}/${userDocumentName}/`;

// Enum for mode of which list items to show
const ShowState = {
    All: 'All',
    Completed: 'Completed',
    Uncompleted: 'Uncompleted',
}
const ShowArr = [
    'All',
    'Completed',
    'Uncompleted',
]

// Enum for sort condition
// First element is field, second element is ascending/descending
const SortBy = {
    Created_ASC: "Created_ASC",
    Created_DESC: "Created_DESC",
    Priority_ASC: "Priority_ASC",
    Priority_DESC: "Priority_DESC",
}
const SortByArr = [
    "Created_ASC",
    "Created_DESC",
    "Priority_ASC",
    "Priority_DESC",
]

function App() {
    const [sort, setSort] = useState(SortBy.Created_ASC);
    const sortArr = sort.split("_");
    // Extract field and asc/desc order
    const sortField = sortArr[0].toLowerCase();
    const sortOrder = sortArr[1].toLowerCase();

    const [subcollectionName, setSubcollectionName] = useState("Items");
    const q = query(collection(db, collectionPath + subcollectionName), orderBy(sortField, sortOrder));
    const q2 = query(doc(db, collectionPath));
    const [itemsData, itemsLoading, itemsError] = useCollectionData(q);
    const [userData, userLoading, userError] = useDocumentData(q2);

    // Allow user to undo recent add/edit/delete operations
    const [undoStack, setUndoStack] = useState([]);

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
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Remove completed items
    const onRemoveCompleted = () => {
        setUndoStack(undoStack.concat([itemsData]));

        const batch = writeBatch(db);

        itemsData.forEach((item) => {
            if (item.completed) {
                batch.delete(doc(db, collectionPath + subcollectionName, item.id));
            }
        });

        batch.commit();
    }

    // Add item
    const onAddItem = (text, priority) => {
        setUndoStack(undoStack.concat([itemsData]));

        const id = generateUniqueID();
        setDoc(doc(db, collectionPath + subcollectionName, id), {
            id: id,
            text: text,
            completed: false,
            priority: priority,
            created: serverTimestamp(),
        });
    }

    // Delete item by id
    const onDeleteItem = (id) => {
        setUndoStack(undoStack.concat([itemsData]));

        deleteDoc(doc(db, collectionPath + subcollectionName, id));
    }

    // Edit item
    const onEditItem = (id, text, completed, priority) => {
        setUndoStack(undoStack.concat([itemsData]));

        updateDoc(doc(db, collectionPath + subcollectionName, id), {
           text: text,
           completed: completed,
           priority: priority,
        });
    }

    // Undo operation so data is brought to previous state
    const onUndo = () => {
        const batch = writeBatch(db);

        // Erase all current items
        itemsData.forEach((item) => {
            batch.delete(doc(db, collectionPath + subcollectionName, item.id));
        });

        // Add all items from data in back of undoStack
        undoStack[undoStack.length - 1].forEach((item) => {
            batch.set(doc(db, collectionPath + subcollectionName, item.id), {
                id: item.id,
                text: item.text,
                completed: item.completed,
                priority: item.priority,
                created: item.created,
            });
        })

        // Make sure this operation is atomic
        batch.commit();

        // Pop off back of undoStack and update the undoStack
        const newStack = [...undoStack];
        newStack.pop();
        setUndoStack(newStack);
    }

    // TODO: move add, undo, and redo buttons to bottom footer that remains at the bottom
    return (
        <div className="App">
            <Title/>
            {!itemsLoading && !userLoading && !itemsError && !userError &&
                <>
                    <ButtonContainer>
                        <Dropdown
                            menuLabel="List:"
                            onSelectItem={(val) => {
                                setSubcollectionName(val);
                                setUndoStack([]);
                            }}
                            menuState={subcollectionName}
                            options={userData.lists}
                            menuName="List"
                        />
                        <Dropdown
                            menuLabel="Show:"
                            onSelectItem={setShowState}
                            menuState={showState}
                            options={ShowArr}
                            menuName="Show"
                        />
                        <Dropdown
                            menuLabel="Sort By:"
                            onSelectItem={setSort}
                            menuState={sort}
                            options={SortByArr}
                            menuName="Sort"
                        />
                    </ButtonContainer>
                    <List>
                        {!itemsData.length && <h1 className="empty-placeholder">No current items</h1>}
                        {itemsData.filter((item) => shouldShow(item)).map((item2) =>
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
                    {undoStack.length > 0 &&
                        <Icon buttonStyling="todo-add-button" onClick={() => {
                            onUndo();
                        }}>
                            <FaUndo/>
                        </Icon>
                    }
                    {itemsData && itemsData.some(item =>  item.completed) &&
                            <Button text="Remove Completed" onClick={() => {setShowConfirmation(true);}}/>
                    }
                    {showModal && <Modal title="Add New List Item" textInputValue={"New Item Name"} priorityInputValue={"Low"}
                        onClose={() => {
                            setShowModal(false);
                        }}
                        onSave={(text, priority) => {
                            onAddItem(text, PriorityToNumber[priority]);
                            setShowModal(false);
                        }}
                    />}
                    {showConfirmation && <Confirmation title="Delete Item(s)" body={`Are you sure you want to delete ${itemsData.filter(item => item.completed).length} item(s)?`}
                        onClose={() => {
                            setShowConfirmation(false);
                        }}
                        onConfirm={() => {
                            onRemoveCompleted();
                            setShowConfirmation();
                        }}
                    />}
                </>
            }
            {(itemsLoading || userLoading) && <div className="loading-spinner"></div>}
            {(itemsError || userError) && <h1 className="empty-placeholder">Error occurred while trying to fetch data. Please try again later.</h1>}
        </div>
    );
}

export default App;
